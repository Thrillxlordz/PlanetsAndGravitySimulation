let canvasX
let canvasY
let lines = []
let numLines = 12
let speed = 15
let mouseBias
let maxPoints = 150
let maxWeight = 5

function setup() {
  canvasX = windowWidth * 0.95
  canvasY = windowHeight * 0.8
  myCanvas = createCanvas(canvasX, canvasY)
  myCanvas.parent('canvas')
  background(0)
  noFill()
}

function draw() {
  if (mouseX > 0 && mouseX < canvasX && mouseY > 0 && mouseY < canvasY) {
    mouseBias = true
  } else {
    mouseBias = false
  }
  background(0)
  let x, y, offScreen
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].points.length > maxPoints) {
      lines[i].points.splice(0, 1)
    }
    stroke(lines[i].color)
    strokeWeight(lines[i].weight)
    x = lines[i].points[lines[i].points.length - 1].x
    y = lines[i].points[lines[i].points.length - 1].y
    let randX = random(speed * 2) - speed
    let randY = random(speed * 2) - speed
    if (mouseBias) {
      for (let j = 0; j < 2; j++) {
        let rx = random(speed * 2) - speed
        let ry = random(speed * 2) - speed
        if (dist(x + rx, y + ry, mouseX, mouseY) < dist(x + randX, y + randY, mouseX, mouseY)) {
          randX = rx
          randY = ry
        }
      }
    }
    x += randX
    y += randY
    offScreen = false
    if (x > canvasX) {
      x -= canvasX
      offScreen = true
    } else if (x < 0) {
      x += canvasX
      offScreen = true
    }
    if (y > canvasY) {
      y -= canvasY
      offScreen = true
    } else if (y < 0) {
      y += canvasY
      offScreen = true
    }

    lines[i].points.push(createVector(x, y))

    beginShape()
    vertex(lines[i].points[0].x, lines[i].points[0].y)
    for (let j = 1; j < lines[i].points.length; j++) {
      if (abs(lines[i].points[j].x - lines[i].points[j - 1].x) > speed) {
        endShape()
        beginShape()
        continue
      }
      if (abs(lines[i].points[j].y - lines[i].points[j - 1].y) > speed) {
        endShape()
        beginShape()
        continue
      }
      vertex(lines[i].points[j].x, lines[i].points[j].y)
    }
    endShape()
  }
}

function createLine(x, y) {
  lines.push(new line())
  lines[lines.length - 1].points.push(createVector(x, y))
  lines[lines.length - 1].color = color(random(255), random(255), random(255))
  let weight = ceil(random(maxWeight))
  while (weight % 2 == 0) {
    weight = ceil(random(maxWeight))
  }
  lines[lines.length - 1].weight = ceil(random(maxWeight))

    if (lines.length > numLines) {
      lines.splice(0, 1)
    }
}

class line {
  constructor(points = [], color, weight) {
    this.points = points
    this.color = color
    this.weight = weight
  }
}
