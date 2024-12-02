/*
 * Kerf Bending Pattern Generator
 *
 * Jack B. Du (github@jackbdu.com)
 *
 * GitHub Repo: https://github.com/jackbdu/kerf-bending-pattern-generator
 */

const types = ["line", "quad", "zigzag", "curly", "ellipse", "star", "custom"];

// parameters
let cols;
let rows;
let relativeWidth;
let relativeHeight;
let type = "custom";

// user interface
let uiContainer;
let colsSlider;
let rowsSlider;
let relativeWidthSlider;
let relativeHeightSlider;
let patternSelector;
let downloadButton;

let filename;

function setup() {
  createCanvas(400, 400, SVG);
  createUI();
}

function draw() {
  updateParameters();
  drawKerfPattern();
}

function createUI() {
  uiContainer = createDiv();
  uiContainer.class("ui-container");

  colsSlider = createSlider(2 + 1, 128 + 1, 48 + 1, 2);
  rowsSlider = createSlider(2, 16, 8);
  relativeWidthSlider = createSlider(0, 0.9, 0.5, 0.1);
  relativeHeightSlider = createSlider(0, 0.9, 0.8, 0.1);
  uiContainer.child(colsSlider);
  uiContainer.child(rowsSlider);
  uiContainer.child(relativeWidthSlider);
  uiContainer.child(relativeHeightSlider);

  patternSelector = createSelect();
  for (const t of types) {
    patternSelector.option(t);
  }
  patternSelector.selected(type);
  uiContainer.child(patternSelector);

  downloadButton = createButton("Download");
  downloadButton.mouseClicked(() => {
    save(`${filename}.svg`);
  });
  uiContainer.child(downloadButton);
}

function updateParameters() {
  cols = colsSlider.value();
  rows = rowsSlider.value();
  relativeWidth = relativeWidthSlider.value();
  relativeHeight = relativeHeightSlider.value();
  type = patternSelector.value();
}

function drawKerfPattern() {
  filename = `kerf-bending-pattern-${type}`;
  clear();
  background(255);
  noFill();
  kerf(type, 0, 0, width, height, cols, rows, relativeWidth, relativeHeight);
}

function kerf(type, x, y, w, h, cols, rows, relativeWidth, relativeHeight) {
  const colWidth = w / cols;
  const rowHeight = h / rows;
  const kerfWidth = relativeWidth * colWidth;
  const kerfHeight = relativeHeight * rowHeight;
  filename = `${filename}-${nf(kerfWidth, 0, 1)}x${nf(kerfHeight, 0, 1)}`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const direction = c % 2 ? -1 : 1;
      const alternatingOffsetY = (rowHeight / 2) * (c % 2);
      const offsetX = x + colWidth / 2;
      const offsetY = y + rowHeight / 2 + alternatingOffsetY;
      const centerX = c * colWidth + offsetX;
      const centerY = r * rowHeight + offsetY;
      if (centerX > 0 && centerY < height) {
        switch (type) {
          case "quad":
            kerfQuad(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
          case "zigzag":
            kerfZigzag(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
          case "curly":
            kerfCurly(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
          case "ellipse":
            kerfEllipse(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
          case "star":
            kerfStar(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
          case "line":
            kerfLine(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
          default:
            kerfCustom(centerX, centerY, kerfWidth, kerfHeight, direction);
            break;
        }
      }
    }
  }
}

function kerfLine(centerX, centerY, kerfWidth, kerfHeight, direction) {
  const x1 = centerX - (direction * kerfWidth) / 2;
  const y1 = centerY - kerfHeight / 2;
  const x2 = centerX + (direction * kerfWidth) / 2;
  const y2 = centerY + kerfHeight / 2;
  line(x1, y1, x2, y2);
}

function kerfQuad(centerX, centerY, kerfWidth, kerfHeight, direction) {
  strokeJoin(ROUND);
  beginShape();
  const verticesNum = 4;
  for (let i = 0; i < verticesNum + 1; i++) {
    const progress = i / verticesNum;
    const angle = TWO_PI * progress;
    const radius = 0.5;
    const offsetX = sin(angle) * kerfWidth * radius;
    const offsetY = cos(angle) * kerfHeight * radius;
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    vertex(x, y);
  }
  endShape();
}

function kerfZigzag(centerX, centerY, kerfWidth, kerfHeight, direction) {
  strokeJoin(ROUND);
  beginShape();
  const verticesNum = 8;
  const frequency = 2;
  for (let i = 0; i < verticesNum + 1; i++) {
    const progress = i / verticesNum;
    const angle = TWO_PI * progress * frequency;
    const offsetX = (direction * (sin(angle) * kerfWidth)) / 2;
    const offsetY = map(progress, 0, 1, -kerfHeight / 2, kerfHeight / 2);
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    vertex(x, y);
  }
  endShape();
}

function kerfCurly(centerX, centerY, kerfWidth, kerfHeight, direction) {
  strokeJoin(ROUND);
  beginShape();
  const verticesNum = 5;
  const frequency = 2;
  for (let i = -1; i < verticesNum + 2; i++) {
    const progress = i / verticesNum;
    const angle = TWO_PI * progress * frequency;
    const offsetX = (direction * (sin(angle) * kerfWidth)) / 2;
    const offsetY = map(progress, 0, 1, -kerfHeight / 2, kerfHeight / 2);
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    curveVertex(x, y);
  }
  endShape();
}

function kerfEllipse(centerX, centerY, kerfWidth, kerfHeight, direction) {
  const x = centerX;
  const y = centerY;
  const w = kerfWidth;
  const h = kerfHeight;
  ellipse(x, y, w, h);
}

function kerfStar(centerX, centerY, kerfWidth, kerfHeight, direction) {
  strokeJoin(ROUND);
  beginShape();
  const starCornersNum = 5;
  const verticesNum = starCornersNum * 2;
  const innerRadius = 0.2;
  const outterRadius = 0.5;
  for (let i = 0; i < verticesNum + 1; i++) {
    const progress = i / verticesNum;
    const angle = TWO_PI * progress;
    const radius = i % 2 ? outterRadius : innerRadius;
    const offsetX = sin(angle) * kerfWidth * radius;
    const offsetY = cos(angle) * kerfHeight * radius;
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    vertex(x, y);
  }
  endShape();
}
