#!/usr/bin/env python3
"""Inspect local DDH references and write hashes, ZIP listings and SOP statistics."""

import argparse
import configparser
import hashlib
import json
import math
import os
from pathlib import Path, PurePosixPath
import struct
import tempfile
import zipfile

# These are our own helpers. No code from an upstream archive is imported.
from fetch_references import ROOT, checked_members, load_manifest, verify_file

HEADER = struct.Struct("<BB2xIIB3xIIII")
HEADER_FIELDS = ("version", "endian", "magic", "dim", "dtype", "nseq", "dataStart", "numAttributes", "attrSize")


def sop_statistics(data, data_type):
    if len(data) < HEADER.size:
        raise ValueError("Truncated SOP header")
    header = dict(zip(HEADER_FIELDS, HEADER.unpack_from(data)))
    if (header["version"] != 0 or header["endian"] != 0 or header["magic"] != 14600958
            or header["dtype"] != 1 or not 1 <= header["dim"] <= 16
            or header["attrSize"] != 4):
        raise ValueError(f"Unsupported SOP header: {header}")
    if data_type not in {"lines", "points"}:
        raise ValueError(f"Unsupported data type: {data_type!r}")
    offset = header["dataStart"]
    if not HEADER.size <= offset <= len(data):
        raise ValueError("SOP dataStart lies outside the file")
    if header["nseq"] > (len(data) - offset) // 4:
        raise ValueError("SOP sequence count exceeds available bytes")
    dim, attrs = header["dim"], header["numAttributes"]
    if attrs > 64:
        raise ValueError("SOP attribute count exceeds supported limit")
    point_format = struct.Struct(f"<{dim}f")
    attr_format = struct.Struct(f"<{attrs}f") if attrs else None
    minima, maxima = [math.inf] * dim, [-math.inf] * dim
    attr_min, attr_max = [math.inf] * attrs, [-math.inf] * attrs
    counts = []
    view = memoryview(data)
    for sequence in range(header["nseq"]):
        if offset + 4 > len(data):
            raise ValueError(f"Truncated SOP count at sequence {sequence}")
        count = struct.unpack_from("<I", data, offset)[0]
        offset += 4
        coordinate_bytes, attribute_bytes = count * dim * 4, count * attrs * 4
        end = offset + coordinate_bytes + attribute_bytes
        if end > len(data):
            raise ValueError(f"Truncated SOP coordinates or attributes at sequence {sequence}")
        for point in point_format.iter_unpack(view[offset:offset + coordinate_bytes]):
            for axis, value in enumerate(point):
                if not math.isfinite(value):
                    raise ValueError("Non-finite SOP coordinate")
                minima[axis] = min(minima[axis], value)
                maxima[axis] = max(maxima[axis], value)
        offset += coordinate_bytes
        if attrs:
            for values in attr_format.iter_unpack(view[offset:end]):
                for index, value in enumerate(values):
                    if not math.isfinite(value):
                        raise ValueError("Non-finite SOP attribute")
                    attr_min[index] = min(attr_min[index], value)
                    attr_max[index] = max(attr_max[index], value)
        offset = end
        counts.append(count)
    trailing = len(data) - offset
    if trailing:
        raise ValueError(f"Unexpected trailing SOP bytes: {trailing}")
    total = sum(counts)
    return {
        "header": header,
        "data_type": data_type,
        "sequence_count": len(counts),
        "point_count": total,
        "segment_count": sum(max(count - 1, 0) for count in counts) if data_type == "lines" else None,
        "points_per_sequence": {"min": min(counts, default=0), "max": max(counts, default=0), "mean": total / len(counts) if counts else 0},
        "bounds": {"min": minima, "max": maxima} if total else None,
        "attribute_ranges": [{"min": lo, "max": hi} for lo, hi in zip(attr_min, attr_max)] if total else [],
        "header_to_data_padding_bytes": header["dataStart"] - HEADER.size,
        "trailing_bytes": trailing,
    }


def inspect_zip(path, source_id):
    entries, datasets = [], []
    with zipfile.ZipFile(path) as archive:
        members = checked_members(archive)
        for item in members:
            entries.append({"path": item.filename, "bytes": item.file_size, "compressed_bytes": item.compress_size, "crc32": f"{item.CRC:08x}", "directory": item.is_dir()})
            if item.is_dir() or not item.filename.lower().endswith(".sop"):
                continue
            sop_path = PurePosixPath(item.filename)
            description_path = (sop_path.parent / "description.ini").as_posix()
            description = configparser.ConfigParser(interpolation=None)
            description.read_string(archive.read(description_path).decode("utf-8-sig"))
            if description.get("data", "filename") != sop_path.name:
                raise ValueError(f"description.ini filename mismatch: {item.filename}")
            data_type = description.get("data", "type").strip().lower()
            data = archive.read(item)
            stats = sop_statistics(data, data_type)
            datasets.append({"source_id": source_id, "name": sop_path.parent.name, "path": item.filename, "description_path": description_path, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), **stats})
    return entries, datasets


def atomic_json(path, data):
    if path.is_symlink():
        raise ValueError(f"Refusing symlink output: {path}")
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, prefix=".inspection-", delete=False) as stream:
            temporary = Path(stream.name)
            json.dump(data, stream, ensure_ascii=False, indent=2, allow_nan=False)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog="Reads references/downloads only; requires no network, third-party packages or upstream code execution. Supports the pinned little-endian SOP v0/float32 files. Point data is never counted as line segments.")
    parser.add_argument("--manifest", type=Path, default=ROOT / "references/sources.json", help="Pinned source manifest (default: references/sources.json)")
    args = parser.parse_args()
    try:
        manifest = load_manifest(args.manifest)
        references = args.manifest.resolve().parent
        if (references / "downloads").is_symlink():
            raise ValueError("Refusing symlink downloads directory")
        report = {"schema_version": 1, "manifest_checked_on": manifest.get("checked_on"), "sources": [], "datasets": []}
        for source in manifest["sources"]:
            path = references / "downloads" / source["filename"]
            size, digest = verify_file(path, source)
            record = {"id": source["id"], "filename": source["filename"], "url": source["url"], "bytes": size, "sha256": digest, "matches_manifest": True}
            if path.suffix.lower() == ".zip":
                record["archive_entries"], datasets = inspect_zip(path, source["id"])
                report["datasets"].extend(datasets)
            elif path.suffix.lower() == ".pdf":
                with path.open("rb") as stream:
                    signature = stream.read(8)
                if not signature.startswith(b"%PDF-"):
                    raise ValueError(f"Invalid PDF signature: {path.name}")
                record["pdf_signature"] = signature.decode("ascii")
                record["inspection_scope"] = "File hash, size and PDF signature only; PDF content was not parsed."
            report["sources"].append(record)
        output = references / "local-inspection.json"
        atomic_json(output, report)
        print(f"Wrote {output}")
        for dataset in report["datasets"]:
            print(f"{dataset['name']}: {dataset['data_type']}, {dataset['sequence_count']} sequences, {dataset['point_count']} points, trailing bytes: {dataset['trailing_bytes']}")
    except (OSError, ValueError, KeyError, TypeError, UnicodeError, configparser.Error, zipfile.BadZipFile) as error:
        parser.exit(1, f"Reference inspection failed: {error}\n")


if __name__ == "__main__":
    main()
