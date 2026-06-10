import { createCanvas, loadImage } from "canvas";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/brand/logo.png");
const dst = path.join(__dirname, "../public/brand/logo.png");

const img = await loadImage(src);
const w = img.width, h = img.height;

// Encontra a caixa delimitadora do conteúdo (não-branco)
const tmpCanvas = createCanvas(w, h);
const tmpCtx = tmpCanvas.getContext("2d");
tmpCtx.drawImage(img, 0, 0);
const data = tmpCtx.getImageData(0, 0, w, h).data;

let minX = w, maxX = 0, minY = h, maxY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r < 240 || g < 240 || b < 240) { // pixel não-branco
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 40;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(w, maxX + pad);
maxY = Math.min(h, maxY + pad);

const cw = maxX - minX;
const ch = maxY - minY;
const out = createCanvas(cw, ch);
const octx = out.getContext("2d");
octx.fillStyle = "white";
octx.fillRect(0, 0, cw, ch);
octx.drawImage(img, minX, minY, cw, ch, 0, 0, cw, ch);

writeFileSync(dst, out.toBuffer("image/png"));
console.log(`Logo cortado: ${cw}x${ch}px → ${dst}`);
