const canvas = document.getElementById("fractalCanvas");
const ctx = canvas.getContext("2d");

let viewport = {
  xMin: -2.5,
  xMax: 1,
  yMin: -1.5,
  yMax: 1.5
};

const MAX_ITER = 300;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - header.offsetHeight - footer.offsetHeight;
  drawMandelbrot();
}

function pixelToComplex(px, py) {
  const width = canvas.width;
  const height = canvas.height;
  const re = viewport.xMin + (px / width) * (viewport.xMax - viewport.xMin);
  const im = viewport.yMin + (py / height) * (viewport.yMax - viewport.yMin);
  return { re, im };
}

function mandelbrotIterations(c_re, c_im) {
  let x = 0, y = 0, iteration = 0, x2 = 0, y2 = 0;
  while (x2 + y2 <= 4 && iteration < MAX_ITER) {
    y = 2 * x * y + c_im;
    x = x2 - y2 + c_re;
    x2 = x * x;
    y2 = y * y;
    iteration++;
  }
  return iteration;
}

function getColor(iter) {
  if (iter >= MAX_ITER) return "rgb(0, 0, 0)";
  const t = iter / MAX_ITER;
  const hue = Math.floor(200 + 360 * t);
  const saturation = 70;
  const lightness = 50 * (1 - t);
  return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
}

function drawMandelbrot() {
  const imgData = ctx.createImageData(canvas.width, canvas.height);
  const data = imgData.data;

  for (let py = 0; py < canvas.height; py++) {
    for (let px = 0; px < canvas.width; px++) {
      const { re: c_re, im: c_im } = pixelToComplex(px, py);
      const iter = mandelbrotIterations(c_re, c_im);
      const color = getColor(iter);
      ctx.fillStyle = color;
      const [r, g, b] = ctx.fillStyle.match(/\d+/g).map(Number);
      const idx = (py * canvas.width + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function zoomAt(px, py, factor) {
  const { re: c_re, im: c_im } = pixelToComplex(px, py);
  const width = viewport.xMax - viewport.xMin;
  const height = viewport.yMax - viewport.yMin;
  const newWidth = width / factor;
  const newHeight = height / factor;

  viewport.xMin = c_re - newWidth / 2;
  viewport.xMax = c_re + newWidth / 2;
  viewport.yMin = c_im - newHeight / 2;
  viewport.yMax = c_im + newHeight / 2;

  drawMandelbrot();
}

canvas.addEventListener("click", (e) => {
  zoomAt(e.offsetX, e.offsetY, 2);
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  zoomAt(e.offsetX, e.offsetY, 0.5);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  viewport = {
    xMin: -2.5,
    xMax: 1,
    yMin: -1.5,
    yMax: 1.5
  };
  drawMandelbrot();
});

const header = document.querySelector("header");
const footer = document.querySelector("footer");

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.2 : 0.8;
  zoomAt(e.offsetX, e.offsetY, factor);
});
