#!/usr/bin/env python3
"""Prepare verified upstream line files for local, offline browser use.

No upstream code runs. Original files and acknowledgements are copied unchanged;
public/data/local is gitignored. Run fetch_references.py --extract first.
"""
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / 'references/upstream/demo'
OUTPUT = ROOT / 'public/data/local'
SELECTED = {
    'Knot 10_136': ('knot', 'The Knot Server · Original-Demo Everts et al. 2009'),
    'Knot 9_31': ('knot9', 'The Knot Server · Original-Demo Everts et al. 2009'),
    'Air flow in office': ('office', 'VTK 5.4.2 office.binary.vtk · Original-Demo Everts et al. 2009'),
    'Fiber tracts': ('fibers', 'VIS 2009 Patient A · Original-Demo; anderer Datensatz als im Paper'),
}


def main():
    inventory = json.loads((ROOT / 'references/inspection-2026-10-26.json').read_text())
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    for dataset in inventory['datasets']:
        if dataset['name'] not in SELECTED:
            continue
        identifier, source = SELECTED[dataset['name']]
        original = UPSTREAM / dataset['path']
        if original.is_symlink() or not original.is_file():
            raise ValueError(f'Missing regular original file: {original}; run fetch_references.py --extract')
        if hashlib.sha256(original.read_bytes()).hexdigest() != dataset['sha256']:
            raise ValueError(f'Original hash mismatch: {original}')
        filename = identifier + '.sop'
        shutil.copyfile(original, OUTPUT / filename)
        shutil.copyfile(UPSTREAM / dataset['description_path'], OUTPUT / (identifier + '-description.ini'))
        records.append({'id': identifier, 'name': dataset['name'], 'source': source,
                        'url': '/data/local/' + filename, 'sha256': dataset['sha256'],
                        'pointCount': dataset['point_count'], 'sequenceCount': dataset['sequence_count'],
                        'bounds': dataset['bounds'], 'dataType': 'lines',
                        'acknowledgements': '/data/local/UPSTREAM-README.txt'})
    shutil.copyfile(UPSTREAM / 'illuvis-program/README.txt', OUTPUT / 'UPSTREAM-README.txt')
    (OUTPUT / 'manifest.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
    print(f'Prepared {len(records)} complete original datasets under {OUTPUT}; no selection or resampling.')


if __name__ == '__main__':
    main()
