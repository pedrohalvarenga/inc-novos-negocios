import puppeteer from "puppeteer";
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = "C:\\Users\\lucas.costa\\Downloads\\2500 - Roleta - Logo INC - 55x23cm - Março - 2023.pdf";
const outPath = path.join(__dirname, "../public/brand/logo.png");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();

// Monta HTML com o PDF embutido como iframe + canvas via pdfjs
const pdfData = readFileSync(pdfPath).toString("base64");

await page.setViewport({ width: 2400, height: 1100, deviceScaleFactor: 2 });
await page.setContent(`
<!DOCTYPE html>
<html><body style="margin:0;background:white">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<canvas id="c"></canvas>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const b64 = '${pdfData}';
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) buf[i]=raw.charCodeAt(i);
  pdfjsLib.getDocument({data:buf}).promise.then(pdf => pdf.getPage(1).then(p => {
    const vp = p.getViewport({scale:2});
    const c = document.getElementById('c');
    c.width = vp.width; c.height = vp.height;
    const ctx = c.getContext('2d');
    ctx.fillStyle='white'; ctx.fillRect(0,0,c.width,c.height);
    p.render({canvasContext:ctx,viewport:vp}).promise.then(()=>{ window._done=true; });
  }));
</script>
</body></html>
`, { waitUntil: "networkidle0" });

// Aguarda renderização do pdfjs
await page.waitForFunction("window._done === true", { timeout: 30000 });
await new Promise(r => setTimeout(r, 500));

const canvas = await page.$("canvas");
const screenshot = await canvas.screenshot({ type: "png" });
await browser.close();

// Trim automático com sharp (remove bordas brancas)
const trimmed = await sharp(screenshot)
  .trim({ background: { r: 255, g: 255, b: 255, alpha: 1 }, threshold: 20 })
  .toBuffer({ resolveWithObject: true });

console.log(`Logo final: ${trimmed.info.width}x${trimmed.info.height}px`);
writeFileSync(outPath, trimmed.data);
console.log(`Salvo: ${outPath}`);
