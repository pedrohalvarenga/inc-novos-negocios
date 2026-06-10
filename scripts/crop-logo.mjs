import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/brand/logo.png");
const buf = readFileSync(src);

const img = sharp(buf);
const meta = await img.metadata();
console.log(`Imagem original: ${meta.width}x${meta.height}px`);

// Analisa pixels para encontrar bounding box do conteúdo colorido (não-branco)
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const w = info.width, h = info.height, ch = info.channels;

let minX = w, maxX = 0, minY = h, maxY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    const r = data[i], g = data[i+1], b = data[i+2];
    // Considera não-branco: qualquer pixel com diferença significativa do branco
    if (r < 245 || g < 245 || b < 245) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log(`Bounding box do conteúdo: (${minX},${minY}) → (${maxX},${maxY})`);

// Aplica padding e recorta
const pad = Math.round(w * 0.02);
const left = Math.max(0, minX - pad);
const top  = Math.max(0, minY - pad);
const right = Math.min(w, maxX + pad);
const bottom = Math.min(h, maxY + pad);
const cropW = right - left;
const cropH = bottom - top;

console.log(`Recortando: ${cropW}x${cropH}px (left=${left}, top=${top})`);

const out = path.join(__dirname, "../public/brand/logo.png");
await sharp(buf)
  .extract({ left, top, width: cropW, height: cropH })
  .png()
  .toFile(out);

console.log(`Salvo: ${out}`);
