// Extrai imagens XObject embutidas do PDF usando pdfjs-dist
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

const pdfPath = "C:\\Users\\lucas.costa\\Downloads\\2500 - Roleta - Logo INC - 55x23cm - Março - 2023.pdf";
const data = new Uint8Array(readFileSync(pdfPath));

const pdf = await pdfjsLib.getDocument({ data }).promise;
const page = await pdf.getPage(1);
const ops = await page.getOperatorList();

console.log("Operadores no PDF:", ops.fnArray.length);

// Procura operações de imagem
const OPS = pdfjsLib.OPS;
const imgNames = [];
for (let i = 0; i < ops.fnArray.length; i++) {
  if (ops.fnArray[i] === OPS.paintImageXObject || ops.fnArray[i] === OPS.paintImageMaskXObject) {
    imgNames.push(ops.argsArray[i][0]);
  }
}

console.log("Imagens XObject encontradas:", imgNames);

for (const name of imgNames) {
  const img = await page.objs.get(name);
  if (img && img.data) {
    console.log(`Imagem ${name}: ${img.width}x${img.height}, ${img.data.length} bytes`);
  }
}

if (imgNames.length === 0) {
  console.log("Nenhuma imagem raster embutida — o logo é vetorial (paths). Precisa de renderização.");

  // Tenta alternativa: usa puppeteer se disponível
  try {
    const { default: puppeteer } = await import("puppeteer");
    console.log("Puppeteer disponível!");
  } catch {
    console.log("Puppeteer não disponível.");
  }
}
