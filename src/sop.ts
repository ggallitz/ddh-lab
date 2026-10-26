import type {Line, Point} from './model.ts';

export interface SopData {
  lines: Line[];
  sequenceCount: number;
  pointCount: number;
  bounds: {min: number[]; max: number[]} | null;
  attributeCount: number;
}

/** Original implementation of the observed SOP v0/little-endian/float32 variant.
 * Layout checked against upstream lines_io/python/dataio/sopfile.py and the
 * independent Python inventory. Attributes follow each sequence's coordinates.
 * Their values are validated but deliberately receive no scientific meaning.
 * SOP does not encode lines versus points: caller must supply the INI data type.
 */
export function readSop(buffer: ArrayBuffer, dataType: 'lines'|'points' = 'lines', maxPoints=1_500_000): SopData {
  if (dataType !== 'lines') throw new Error('Punktwolken werden nicht als Polylinien interpretiert');
  if(!Number.isSafeInteger(maxPoints)||maxPoints<1)throw new Error("Ungültiges Punktlimit");
  const view = new DataView(buffer);
  const size = buffer.byteLength;
  if (size < 32) throw new Error('Unvollständiger SOP-Header');
  if (view.getUint8(0) !== 0 || view.getUint8(1) !== 0 ||
      view.getUint32(4, true) !== 14600958 || view.getUint32(8, true) !== 3 ||
      view.getUint8(12) !== 1 || view.getUint32(28, true) !== 4) {
    throw new Error('Nicht unterstützter SOP-Header (erwartet v0, little endian, 3D, float32)');
  }
  const sequenceCount = view.getUint32(16, true);
  let offset = view.getUint32(20, true);
  const attributeCount = view.getUint32(24, true);
  if (offset < 32 || offset > size || attributeCount > 64 || sequenceCount > 100_000 || sequenceCount > (size-offset)/4) {
    throw new Error('Ungültige SOP-Längen oder Attribute');
  }
  const lines: Line[] = [];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  let pointCount = 0;
  for (let sequence = 0; sequence < sequenceCount; sequence++) {
    if (offset + 4 > size) throw new Error('Unvollständige SOP-Sequenzlänge');
    const count = view.getUint32(offset, true);
    offset += 4;
    if(pointCount+count>maxPoints)throw new Error(`Punktlimit überschritten (${maxPoints.toLocaleString("de-DE")} Punkte)`);
    const coordinateEnd = offset + count*12;
    const end = coordinateEnd + count*attributeCount*4;
    if (end > size) throw new Error('Unvollständige SOP-Koordinaten oder Attribute');
    const line: Line = [];
    for (let index = 0; index < count; index++) {
      const point: Point = [0,0,0];
      for (let axis = 0; axis < 3; axis++) {
        const value = view.getFloat32(offset, true);
        offset += 4;
        if (!Number.isFinite(value)) throw new Error('Nicht endliche SOP-Koordinate');
        point[axis] = value;
        min[axis] = Math.min(min[axis], value);
        max[axis] = Math.max(max[axis], value);
      }
      line.push(point);
    }
    while (offset < end) {
      if (!Number.isFinite(view.getFloat32(offset, true))) throw new Error('Nicht endliches SOP-Attribut');
      offset += 4;
    }
    lines.push(line);
    pointCount += count;
  }
  if (offset !== size) throw new Error('Unerwartete Bytes nach SOP-Nutzdaten');
  return {lines, sequenceCount, pointCount, bounds: pointCount ? {min,max} : null, attributeCount};
}
