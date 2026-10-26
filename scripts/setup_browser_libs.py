#!/usr/bin/env python3
"""Optional Ubuntu test-browser repair. Download/extract PRIVATE files; never install.

Only needed on minimal Ubuntu VMs missing Chromium libraries/fonts. Uses existing
APT metadata; no sudo, apt update/install or global font configuration. Chromium
itself is supplied by Playwright or DDH_CHROMIUM. Network approval may be needed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = ['libatk1.0-0t64','libxcomposite1','libxdamage1','libxfixes3',
            'libxrandr2','libgbm1','libasound2t64','libatspi2.0-0t64',
            'libxrender1','libxi6','libxres1','fonts-dejavu-core']

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cached-only',action='store_true')
    args = parser.parse_args()
    if platform.machine() not in ('aarch64','x86_64'):
        parser.error('Only tested on Ubuntu ARM64; x86-64 library layout also supported')
    cache = ROOT / '.cache'
    packages, libraries = cache/'browser-debs', cache/'browser-libs'
    packages.mkdir(parents=True,exist_ok=True)
    libraries.mkdir(parents=True,exist_ok=True)
    if not args.cached_only:
        subprocess.run(['apt-get','download',*PACKAGES],cwd=packages,check=True)
    records=[]
    for file in sorted(packages.glob('*.deb')):
        subprocess.run(['dpkg-deb','-x',str(file),str(libraries)],check=True)
        records.append({'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
    (cache/'browser-library-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
    print(f'Extracted {len(records)} archives privately under {libraries}. No system packages installed.')
    print('Run npm run test:gpu; scripts/test-browser.sh sets private library/font paths.')

if __name__ == '__main__':
    main()
