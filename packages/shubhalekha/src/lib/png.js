// PWA icons కోసం చిన్న PNG తయారీ (బయటి library లేకుండా, Node zlib తో).
// రంగు నేపథ్యం + తెల్లని దీపం గుర్తు (వలయం, మధ్యలో బిందువు). Android, iPhone install కి సరిపోతుంది.
import { deflateSync } from "node:zlib";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const smooth = (edge, d) => Math.max(0, Math.min(1, edge - d + 0.5)); // అంచు మెత్తగా (anti-alias)

/**
 * size: పిక్సెల్స్; maskable: true అయితే నేపథ్యం అంచుల దాకా (Android ఆకారం కత్తిరించినా బాగుండాలి)
 */
export function iconPng(size, color, { maskable = false } = {}) {
  const [r, g, b] = hex(color);
  const c = size / 2;
  const scale = maskable ? 0.8 : 1; // maskable: గుర్తు సురక్షిత ప్రాంతం లోపల
  const radius = size * 0.22; // గుండ్రని మూలలు (maskable కాకపోతే)
  const ringR = size * 0.27 * scale;
  const ringW = size * 0.055 * scale;
  const dotR = size * 0.085 * scale;
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5;
      let bgA = 1;
      if (!maskable) {
        const qx = Math.max(Math.abs(px - c) - (c - radius), 0);
        const qy = Math.max(Math.abs(py - c) - (c - radius), 0);
        bgA = smooth(radius, Math.hypot(qx, qy));
      }
      const d = Math.hypot(px - c, py - c);
      const ring = smooth(ringW / 2, Math.abs(d - ringR));
      const dot = smooth(dotR, d);
      const white = Math.max(ring, dot);
      const o = 1 + x * 4;
      row[o] = Math.round(r + (255 - r) * white);
      row[o + 1] = Math.round(g + (255 - g) * white);
      row[o + 2] = Math.round(b + (255 - b) * white);
      row[o + 3] = Math.round(255 * bgA);
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
