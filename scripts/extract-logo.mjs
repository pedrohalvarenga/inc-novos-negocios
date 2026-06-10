import { createCanvas } from "canvas";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega pdfjs-dist corretamente para Node.js
const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

const pdfPath = "C:\\Users\\lucas.costa\\Downloads\\2500 - Roleta - Logo INC - 55x23cm - Março - 2023.pdf";
const data = new Uint8Array(readFileSync(pdfPath));

const loadingTask = pdfjsLib.getDocument({
  data,
  useSystemFonts: true,
  disableFontFace: false,
});

const pdf = await loadingTask.promise;
console.log(`PDF carregado: ${pdf.numPages} página(s)`);

const page = await pdf.getPage(1);
const viewport = page.getViewport({ scale: 3 }); // 216 DPI aprox
console.log(`Tamanho da página: ${Math.round(viewport.width)}x${Math.round(viewport.height)}px`);

const canvasFactory = new NodeCanvasFactory();
const canvasAndContext = canvasFactory.create(
  Math.ceil(viewport.width),
  Math.ceil(viewport.height)
);
const { canvas, context } = canvasAndContext;

// Fundo branco
context.fillStyle = "#ffffff";
context.fillRect(0, 0, canvas.width, canvas.height);

await page.render({
  canvasContext: context,
  viewport,
  canvasFactory,
}).promise;

const outPath = path.join(__dirname, "../public/brand/logo.png");
writeFileSync(outPath, canvas.toBuffer("image/png"));
console.log(`Salvo: ${outPath} (${canvas.width}x${canvas.height}px)`);
