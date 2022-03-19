let canvasX
let canvasY
let backgroundColor
let stars
let planets
let numPlanets = 10
let maxRadius = 45
let minRadius = 15
let minBlackness = 50
let planetHit
let myRocket
let dt = 0.02
let mouseDown = false
let clickedLocation

function setup() {
  canvasX = windowWidth * 0.95
  canvasY = windowHeight * 0.84
  let myCanvas = createCanvas(canvasX, canvasY)
  myCanvas.parent("#canvas")
  backgroundColor = window.getComputedStyle(document.getElementById("canvas")).getPropertyValue('background-color')
  background(backgroundColor)

  stars = []
  numStars = canvasX * canvasY / 1000
  for (let i = 0; i < numStars; i++) {
    stars.push(new star())
    stars[i].radius = random(2)
    stars[i].center = createVector(random(canvasX), random(canvasY))
    stars[i].color = color(200 + random(50), 200 + random(50), 200 + random(50))
  }

  planets = []
  for (let i = 0; i < numPlanets; i++) {
    planets.push(new planet())
    planets[i].radius = ceil(minRadius + random(maxRadius - minRadius))
    planets[i].center = findValidSpot(planets[i])
    planets[i].mass = pow(planets[i].radius, 3)
    planets[i].color = color(minBlackness + random(250 - minBlackness), minBlackness + random(250 - minBlackness), minBlackness + random(250 - minBlackness))
  }
  myRocket = new rocket()
  myRocket.radius = 5
  myRocket.location = findValidSpot(myRocket)
  myRocket.velocity = createVector(0, 0)
  myRocket.acceleration = createVector(0, 0)
}

function draw() {
  background(backgroundColor)

  for (let i = 0; i < stars.length; i++) {
    stars[i].draw()
  }

  for (let i = 0; i < planets.length; i++) {
    planets[i].draw()
  }

  myRocket.draw()

  if (mouseDown) {
    if (!collidesWithPlanet(clickedLocation.x, clickedLocation.y, myRocket.radius)) {
      stroke(color(255, 0, 0))
      line(myRocket.location.x, myRocket.location.y, mouseX, mouseY)
    }
    return
  }

  strokeWeight(2)
  stroke(color(255, 0, 0))
  let dir = myRocket.velocity.copy()
  dir.normalize()
  dir.mult(myRocket.radius)
  line(myRocket.location.x, myRocket.location.y, myRocket.location.x + dir.x, myRocket.location.y + dir.y)

  myRocket.move()
  if (collidesWithPlanet(myRocket.location.x, myRocket.location.y, myRocket.radius)) {
    myRocket.bounceOff(planetHit.center, planetHit.radius)
  }
}

function mousePressed() {
  mouseDown = true
  clickedLocation = createVector(mouseX, mouseY)
  if (collidesWithPlanet(clickedLocation.x, clickedLocation.y, myRocket.radius)) {
    return
  }
  myRocket.location = createVector(mouseX, mouseY)
}

function mouseClicked() {
  mouseDown = false
  newVel = createVector(clickedLocation.x - mouseX, clickedLocation.y - mouseY)
  myRocket.velocity = newVel
}

function findValidSpot(obj) {
  let centerX = obj.radius + random(canvasX - obj.radius * 2)
  let centerY = obj.radius + random(canvasY - obj.radius * 2)
  while (collidesWithPlanet(centerX, centerY, obj.radius)) {
    centerX = obj.radius + random(canvasX - obj.radius * 2)
    centerY = obj.radius + random(canvasY - obj.radius * 2)
  }
  return createVector(centerX, centerY)
}

function collidesWithPlanet(x, y, radius) {
  let planetCount
  if (radius >= minRadius) {
    planetCount = planets.length - 1
  } else {
    planetCount = planets.length
  }
  for (let i = 0; i < planetCount; i++) {
    if (dist(x, y, planets[i].center.x, planets[i].center.y) <= planets[i].radius + radius) {
      planetHit = planets[i]
      return true
    }
  }

  return false
}

class star {
  constructor(center = 0, radius = 0, color = 0) {
    this.center = center
    this.radius = radius
    this.color = color
    this.draw = function() {
      noStroke()
      fill(this.color)
      ellipse(this.center.x, this.center.y, this.radius * 2)
    }
  }
}

class planet {
  constructor(center = 0, radius = 1, mass = 5, color = 0) {
    this.center = center
    this.radius = radius
    this.mass = mass
    this.color = color
    this.draw = function() {
      noStroke()
      fill(this.color)
      ellipse(this.center.x, this.center.y, this.radius * 2)
    }
    this.pull = function(x, y) {
      let dir = createVector(this.center.x - x, this.center.y - y)
      dir.normalize()
      dir.mult(this.mass / pow(dist(x, y, this.center.x, this.center.y), 2))
      dir.mult(4 / 3 * PI)
      return dir
    }
  }
}

class rocket {
  constructor(location = 0, velocity = 0, acceleration = 0, radius = 1) {
    this.location = location
    this.velocity = velocity
    this.acceleration = acceleration
    this.radius = radius
    this.draw = function() {
      stroke(color(150, 150, 150))
      strokeWeight(1)
      fill(color(0, 200, 200))
      ellipse(this.location.x, this.location.y, this.radius * 2)
    }
    this.move = function() {
      if (this.location.x + this.velocity.x * dt < this.radius || this.location.x + this.velocity.x * dt > canvasX - this.radius) {
        this.bounceOff(createVector((abs(this.velocity.x) / this.velocity.x) * canvasX * 2, this.location.y), 0)
      }
      if (this.location.y + this.velocity.y * dt < this.radius || this.location.y + this.velocity.y * dt > canvasY - this.radius) {
        this.bounceOff(createVector(this.location.x, (abs(this.velocity.y) / this.velocity.y) * canvasY * 2), 0)
      }
      this.location.x += this.velocity.x * dt
      this.location.y += this.velocity.y * dt
      this.velocity.x += this.acceleration.x * dt
      this.velocity.y += this.acceleration.y * dt
      let accel = createVector(0,0)
      for (let i = 0; i < planets.length; i++) {
        accel.add(planets[i].pull(this.location.x, this.location.y))
      }
      this.acceleration.x = accel.x
      this.acceleration.y = accel.y
    }
    this.bounceOff = function(objCenter, objRadius) {
      if (this.velocity.mag() < this.radius) {
        console.log("crash landing!")
      }
      let dir = createVector(0,0)
      dir.x = objCenter.x
      dir.y = objCenter.y
      dir.sub(this.location)
      dir.normalize()
      this.velocity.reflect(dir)
      this.velocity.mult(0.8)
    }
  }
}
