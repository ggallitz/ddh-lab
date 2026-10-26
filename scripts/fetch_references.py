#!/usr/bin/env python3
"""Fetch the pinned DDH references; optionally extract ZIPs without executing them."""

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import tempfile
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CHUNK = 1024 * 1024
MAX_EXTRACTED_BYTES = 256 * CHUNK


def load_manifest(path):
    manifest = json.loads(path.read_text(encoding="utf-8"))
    sources = manifest["sources"]
    ids, filenames = set(), set()
    for source in sources:
        name = source["filename"]
        if (not re.fullmatch(r"[A-Za-z0-9_-]+", source["id"])
                or not name or name in {".", ".."}
                or any(c in name for c in "/\\:\0")
                or not re.fullmatch(r"[0-9a-f]{64}", source["sha256"])
                or not isinstance(source["bytes"], int) or source["bytes"] < 0
                or urlsplit(source["url"]).scheme != "https"
                or not urlsplit(source["url"]).netloc):
            raise ValueError("Invalid reference manifest entry")
        if source["id"] in ids or name in filenames:
            raise ValueError("Duplicate source id or filename in manifest")
        ids.add(source["id"])
        filenames.add(name)
    return manifest


def fingerprint(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"Expected a regular, non-symlink file: {path}")
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(CHUNK), b""):
            size += len(block)
            digest.update(block)
    return size, digest.hexdigest()


def verify_file(path, source):
    size, digest = fingerprint(path)
    if size != source["bytes"] or digest != source["sha256"]:
        raise ValueError(f"Size or SHA-256 mismatch: {path.name}")
    return size, digest


def fetch(source, destination, timeout):
    if destination.is_symlink():
        raise ValueError(f"Refusing symlink: {destination}")
    if destination.exists():
        verify_file(destination, source)
        print(f"Verified cached reference: {destination.name}")
        return
    temporary = None
    try:
        request = Request(source["url"], headers={"User-Agent": "DDH-Lab-reference-fetcher/1.0"})
        with urlopen(request, timeout=timeout) as response:
            if urlsplit(response.geturl()).scheme != "https":
                raise ValueError("Refusing redirect to a non-HTTPS URL")
            with tempfile.NamedTemporaryFile(dir=destination.parent, prefix=".download-", delete=False) as stream:
                temporary = Path(stream.name)
                size = 0
                while block := response.read(CHUNK):
                    size += len(block)
                    if size > source["bytes"]:
                        raise ValueError(f"Download exceeds expected size: {destination.name}")
                    stream.write(block)
                stream.flush()
                os.fsync(stream.fileno())
        verify_file(temporary, source)
        os.replace(temporary, destination)
        print(f"Downloaded and verified: {destination.name}")
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def checked_members(archive):
    """Reject traversal, links, special files, duplicate paths and oversized ZIPs."""
    members = archive.infolist()
    if len(members) > 10000 or sum(item.file_size for item in members) > MAX_EXTRACTED_BYTES:
        raise ValueError("Archive exceeds extraction limits")
    seen = set()
    for item in members:
        raw = item.orig_filename
        path = PurePosixPath(raw)
        mode = item.external_attr >> 16
        if (not raw or "\\" in raw or "\0" in raw or ":" in raw
                or path.is_absolute() or ".." in path.parts or not path.parts
                or stat.S_ISLNK(mode)
                or stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR)
                or item.flag_bits & 1):
            raise ValueError(f"Unsafe or unsupported archive member: {raw!r}")
        normalized = path.as_posix()
        if normalized in seen:
            raise ValueError(f"Duplicate archive path: {normalized}")
        seen.add(normalized)
    return members


def extract(source, archive_path, upstream):
    if upstream.is_symlink():
        raise ValueError(f"Refusing symlink: {upstream}")
    upstream.mkdir(parents=True, exist_ok=True)
    target = upstream / source["id"]
    if target.is_symlink():
        raise ValueError(f"Refusing symlink: {target}")
    with zipfile.ZipFile(archive_path) as archive:
        members = checked_members(archive)
        if target.exists():
            marker = target / ".source-sha256"
            if marker.is_symlink() or not marker.is_file() or marker.read_text().strip() != source["sha256"]:
                raise ValueError(f"Existing extraction has no matching source marker: {target}")
            print(f"Existing extraction left unchanged: {target.name}")
            return
        staging = Path(tempfile.mkdtemp(dir=upstream, prefix=f".{source['id']}-"))
        try:
            for item in members:
                output = staging.joinpath(*PurePosixPath(item.filename).parts)
                if item.is_dir():
                    output.mkdir(parents=True, exist_ok=True)
                else:
                    output.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(item) as incoming, output.open("xb") as outgoing:
                        shutil.copyfileobj(incoming, outgoing, CHUNK)
                    # Upstream executable bits are deliberately not preserved.
                    output.chmod(0o600)
            (staging / ".source-sha256").write_text(source["sha256"] + "\n", encoding="ascii")
            os.replace(staging, target)
            print(f"Extracted without executable file permissions: {target.name}")
        finally:
            if staging.exists():
                shutil.rmtree(staging)


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog="Uses only Python's standard library. Existing downloads must match the manifest; mismatches stop the run. No upstream program is executed.")
    parser.add_argument("--manifest", type=Path, default=ROOT / "references/sources.json", help="Pinned source manifest (default: references/sources.json)")
    parser.add_argument("--timeout", type=float, default=30, help="Network socket timeout in seconds (default: 30)")
    parser.add_argument("--extract", action="store_true", help="Safely extract verified ZIPs into references/upstream/<id>; leave matching existing extractions unchanged")
    args = parser.parse_args()
    if args.timeout <= 0:
        parser.error("--timeout must be positive")
    try:
        manifest = load_manifest(args.manifest)
        references = args.manifest.resolve().parent
        downloads = references / "downloads"
        if downloads.is_symlink():
            raise ValueError(f"Refusing symlink: {downloads}")
        downloads.mkdir(parents=True, exist_ok=True)
        for source in manifest["sources"]:
            destination = downloads / source["filename"]
            fetch(source, destination, args.timeout)
            if args.extract and destination.suffix.lower() == ".zip":
                extract(source, destination, references / "upstream")
    except (OSError, ValueError, KeyError, TypeError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Reference fetch failed: {error}\n")


if __name__ == "__main__":
    main()
