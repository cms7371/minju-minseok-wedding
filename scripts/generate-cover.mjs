import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";

const width = 1200;
const height = 1600;
const pixels = Buffer.alloc(width * height * 3);

function setPixel(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 3;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
}

function blendPixel(x, y, r, g, b, alpha) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 3;
  pixels[i] = Math.round(pixels[i] * (1 - alpha) + r * alpha);
  pixels[i + 1] = Math.round(pixels[i + 1] * (1 - alpha) + g * alpha);
  pixels[i + 2] = Math.round(pixels[i + 2] * (1 - alpha) + b * alpha);
}

function drawEllipse(cx, cy, rx, ry, angle, color, alpha) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let y = Math.floor(cy - ry - rx); y <= Math.ceil(cy + ry + rx); y++) {
    for (let x = Math.floor(cx - rx - ry); x <= Math.ceil(cx + rx + ry); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const px = dx * cos + dy * sin;
      const py = -dx * sin + dy * cos;
      const d = (px * px) / (rx * rx) + (py * py) / (ry * ry);
      if (d <= 1) {
        const edge = Math.max(0, 1 - d);
        blendPixel(x, y, color[0], color[1], color[2], alpha * Math.min(1, edge * 1.9));
      }
    }
  }
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const nx = x / width;
    const ny = y / height;
    const vignette = Math.hypot(nx - 0.5, ny - 0.44) * 28;
    const grain = ((x * 17 + y * 31) % 19) - 9;
    setPixel(
      x,
      y,
      239 - vignette + grain,
      229 - vignette * 0.7 + grain,
      216 - vignette * 0.35 + grain,
    );
  }
}

const petals = [
  [210, 230, 92, 160, -0.7],
  [270, 270, 84, 148, -0.12],
  [925, 250, 96, 166, 0.72],
  [850, 315, 84, 150, 0.2],
  [145, 1270, 92, 170, 0.4],
  [235, 1215, 82, 150, 0.92],
  [965, 1220, 100, 172, -0.48],
  [865, 1285, 86, 154, -0.94],
];

petals.forEach(([cx, cy, rx, ry, angle], index) => {
  const color = index % 2 ? [214, 157, 145] : [188, 132, 121];
  drawEllipse(cx, cy, rx, ry, angle, color, 0.5);
});

for (let i = 0; i < 32; i++) {
  const cx = 80 + ((i * 211) % 1040);
  const cy = 100 + ((i * 359) % 1380);
  const rx = 18 + (i % 4) * 8;
  const ry = 42 + (i % 5) * 9;
  drawEllipse(cx, cy, rx, ry, i * 0.74, [105, 129, 103], 0.16);
}

const ppmPath = "assets/cover.ppm";
writeFileSync(ppmPath, Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`), pixels]));
execFileSync("sips", ["-s", "format", "png", ppmPath, "--out", "assets/cover.png"], { stdio: "ignore" });
unlinkSync(ppmPath);

