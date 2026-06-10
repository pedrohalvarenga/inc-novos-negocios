import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/brand/logo.png");

const buf = readFileSync(src);
const img = sharp(buf);
const meta = await img.metadata();
console.log(`Original: ${meta.width}x${meta.height}px`);

const result = await sharp(buf)
  .trim({ background: "#ffffff", threshold: 20 })
  .toBuffer({ resolveWithObject: true });

console.log(`Cortado: ${result.info.width}x${result.info.height}px`);
writeFileSync(src, result.data);
console.log("logo.png atualizado com sucesso");
