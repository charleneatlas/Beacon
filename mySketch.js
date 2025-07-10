// Beacon
// Author: Charlene Atlas
// Exoplanet systems with three of more planets. Comparing via "hearing" them in terms of their planet types and ordering.
// At this time, focused on systems that have a "pattern" shared by at least one other system.
// Radii are to scale, distances are not.

let started = false;
let playAnimation = false;
let synth;
let canvas;

let p1;
let p2;
let p3;
let p4;

let windowCenter;
let soundWaveSpeed = 600; //TODO: Make this user controllable
let resetX;
let planetProperties = [];
let currentStarSystem = 0;
let currentPattern = 0;
let patternLabel;
let currentPatternSystems = []; // Star system data for current pattern
let isShowingSolarSystem = false;

let sunX;
let sunY;
let sunDiameter;
let spacing;

let patternData;
let starSysData;

let aspectRatio = 16 / 9;

// The strings for note names in the sound library seem to be wrong so defining own notes names here with frequencies.
const notes = {
  C5: 523.25,
  A4: 440.0,
  F4: 349.23,
  D4: 293.66,
  B3: 246.94,
  G3: 196.0,
};

const starSystems = [];
const planets = [];
const patterns = [];

const ScaleFactor = 500; // A way to scale down planets to fit in app window
const EARTH_RADIUS_KM = 6371; // Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html

// Make planet radii to scale, but not distances.

// SOLAR SYSTEM DATA
const Mercury = {
  name: "Mercury",
  radius: 0.38,
  mass: 0.055,
  orbital_period: 87.97,
  category: "Terrestrial",
  order: 1,
};
const Venus = {
  name: "Venus",
  radius: 0.95,
  mass: 0.82,
  orbital_period: 224.7,
  category: "Terrestrial",
  order: 3,
};
const Earth = {
  name: "Earth",
  radius: 1,
  mass: 1,
  orbital_period: 365,
  category: "Terrestrial",
  order: 3,
};
const Mars = {
  name: "Mars",
  radius: 0.53,
  mass: 0.11,
  orbital_period: 686.98,
  category: "Terrestrial",
  order: 4,
};

const Jupiter = {
  name: "Jupiter",
  radius: 11.21,
  mass: 317.8,
  orbital_period: 4332.59,
  category: "Gas Giant",
  order: 5,
};

const Saturn = {
  name: "Saturn",
  radius: 9.45,
  mass: 95.16,
  orbital_period: 10759.22,
  category: "Gas Giant",
  order: 6,
};

const Uranus = {
  name: "Uranus",
  radius: 4.01,
  mass: 14.54,
  orbital_period: 30685.4,
  category: "Neptune-Like",
  order: 7,
};

const Neptune = {
  name: "Neptune",
  radius: 3.88,
  mass: 17.15,
  orbital_period: 60190,
  category: "Neptune-Like",
  order: 8,
};

let solarPlanets = [
  Mercury,
  Venus,
  Earth,
  Mars,
  Jupiter,
  Saturn,
  Uranus,
  Neptune,
];

// SOLAR SYSTEM - Source: https://www.britannica.com/science/solar-system
const MERCURY_RADIUS_KM = 4900 / 2;
const VENUS_RADIUS_KM = 12100 / 2;

const MARS_RADIUS_KM = 6800 / 2;
const JUPITER_RADIUS_KM = 143000 / 2;
const SATURN_RADIUS_KM = 120600 / 2;
const URANUS_RADIUS_KM = 51000 / 2;
const NEPTUNE_RADIUS_KM = 50000 / 2;

// Grab the data
function preload() {
  //https://www.geeksforgeeks.org/javascript/p5-js-loadjson-function/
  // Use the data from Nasa Exoplanet Institute (NexSci)
  loadJSON("PatternData_NexSci.json", onPatternFileLoad);
  loadJSON("StarSystemData_NexSci.json", onStarSysFileLoad);
}

function onPatternFileLoad(data) {
  patternData = data;
  print("Pattern file loaded.");
}

function onStarSysFileLoad(data) {
  starSysData = data;
  print("Star system file loaded.");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight / 1.8);
  canvas.parent("projects");

  /*const container = select("#projects"); // or whatever container you have
  let w = container.width;
  let h = w / aspectRatio;
  createCanvas(w, h).parent("projects");*/

  s = 0;

  synth = new p5.MonoSynth();

  // Sun
  // TODO: Make Sun (star) to scale and correct color depending on star class
  //sunX = -1 * (1392000/1000)/3;
  sunX = 0;
  sunY = height / 2;
  sunDiameter = 400; //1392000/1000
  spacing = 50;
  sunCenter = {
    x: sunX,
    y: sunY,
  };

  //Planets
  // SOLAR SYSTEM (G-type Main Sequence Star / "Yellow Dwarf")
  planetRadii_SolarSystem = [
    MERCURY_RADIUS_KM / 1000,
    VENUS_RADIUS_KM / 1000,
    EARTH_RADIUS_KM / 1000,
    MARS_RADIUS_KM / 1000,
    JUPITER_RADIUS_KM / 1000,
    SATURN_RADIUS_KM / 1000,
    URANUS_RADIUS_KM / 1000,
    NEPTUNE_RADIUS_KM / 1000,
  ];

  // Display first pattern
  displayPattern(currentPattern);
}

function draw() {
  if (!started) {
    // Start screen
    background(0);
    //fill(255, 222, 33); // nice yellow
    fill(255, 255, 255); // white

    textAlign(CENTER, CENTER);
    textSize(32); // Set text size to 32 pixels
    text("BEACON \nClick to start", width / 2, height / 2);
  } else {
    background(0);

    textAlign(TOP, CENTER);
    textSize(32); // Set text size to 32 pixels

    let currentHostLabel;
    let numSystemsWithPattern;

    if (!isShowingSolarSystem) {
      patternLabel =
        patternData[currentPattern]["pattern_" + (currentPattern + 1)].name;

      currentHostLabel =
        patternData[currentPattern]["pattern_" + (currentPattern + 1)]
          .hostnames[currentStarSystem];

      numSystemsWithPattern =
        patternData[currentPattern]["pattern_" + (currentPattern + 1)]
          .hostname_count;
    } else {
      patternLabel = "Pattern #0";
      currentHostLabel = "The Sun";
      numSystemsWithPattern = 1; // as of 7-10-25
    }
    text(patternLabel, width / 2, 30);
    textSize(18);

    // Show star system name
    push();
    textStyle(BOLD);
    text(currentHostLabel, width / 2, 60);
    pop();

    // Show how many other patterns there are
    text(
      "(" + (currentStarSystem + 1) + " of " + numSystemsWithPattern + ")",
      width / 2,
      80
    );

    //text("World", x + textWidth("Hello "), y);
    /*text(
      firstHost +
        " (" +
        (firstHostIndex + 1) +
        " of " +
        numSystemsWithPattern +
        ")",
      width / 2,
      60
    );*/

    push();
    // Star
    fill(255, 222, 33);
    stroke("orange");
    strokeWeight(5);
    circle(sunX, sunY, sunDiameter);

    pop();

    push();
    // Planets
    fill(224, 205, 149); // Ecru https://www.figma.com/colors/ecru/
    noStroke();
    //stroke(109,59,7); // Mocha https://www.figma.com/colors/mocha/
    //strokeWeight(2);

    for (let p of planets) {
      p.show();
    }

    pop();

    push();

    stroke("pink");
    strokeWeight(3);
    noFill();

    soundWaveDiameter = sunDiameter + s; // To make the expanding circle start at border of sun
    circle(sunX, sunY, soundWaveDiameter); // To make the expanding circle start at border of sun
    pop();

    for (let p of planets) {
      checkPlayPlanet(p);
    }

    //s = s + soundWaveSpeed;

    if (playAnimation) {
      s += soundWaveSpeed * (deltaTime / 1000);
    }

    soundWaveEdgeX = sunX + soundWaveDiameter / 2;
    //print("EDGE: " + soundWaveEdgeX);

    if (soundWaveEdgeX > resetX) {
      resetSoundwave();
    }
  }
}

function euclideanDistance(point1, point2) {
  const xDiff = point2.x - point1.x;
  const yDiff = point2.y - point1.y;
  // For 3D space, add const zDiff = point2.z - point1.z; and include zDiff * zDiff in the return statement
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function calculatePlanets() {
  previousCenter = sunX;
  previousRadius = sunDiameter / 2;

  for (let i = 0; i < planetProperties.length; i++) {
    planets[i] = new Planet(
      150 * i + 250,
      sunY,
      (planetProperties[i].radius * EARTH_RADIUS_KM * 2) / ScaleFactor,
      planetProperties[i]
    );
  }

  // Determine how far the sound wave front should go before resetting. Here using the X of the last planet and adding sun radius as a buffer.
  resetX = sunDiameter / 2 + planets[planets.length - 1].x;
}

function checkPlayPlanet(p) {
  if (
    soundWaveDiameter / 2 >
    euclideanDistance(sunCenter, {
      x: p.x,
      y: p.y,
    })
  ) {
    if (p.played == false) {
      //MonoSynth Syntax (frequency, velocity, secondsFromNow, sustainTime)
      //https://p5js.org/reference/p5.MonoSynth/play/#:~:text=Reference%20play()-,play(),triggerRelease.
      synth.play(p.note);
      p.played = true;

      print("PLAYED");
    }
  }
}

function resetSoundwave() {
  print("RESET");
  s = 0;

  for (let p of planets) {
    p.played = false;
  }
}

function mouseClicked() {
  if (!started) {
    // First click by user will start everything else. From this point clicking will have normal in-app use of play/pausing animation.
    started = true;

    // Make sure audio context running due to new browser rules that block autoplaying audio
    if (getAudioContext().state !== "running") {
      getAudioContext().resume();
    }

    // Play soundwave line and resulting audio as hits planets
    playAnimation = true;

    // Focus the canvas
    canvas.elt.focus?.();
  } else {
    // TODO
  }
}

function resetPattern() {
  // Clear planets
  planets.length = 0;
  planetProperties.length = 0;
  isShowingSolarSystem = false; // In case was showing solar system previously

  // Clear pattern and star systems
  currentPatternSystems.length = 0;
  currentStarSystem = 0;

  // Reset sound wave
  resetSoundwave();
}

function resetStarSystem() {
  // Clear planets
  planets.length = 0;
  planetProperties.length = 0;

  // Reset sound wave
  resetSoundwave();
}

function displayStarSystemFromCurrentPattern() {
  // Get the planet info for new star system
  for (pl of currentPatternSystems[currentStarSystem]) {
    planetProperties.push(pl);
  }
  // Figure out placement of new planets to be drawn
  calculatePlanets();
}

function displayPattern(index) {
  // Clear everything
  resetPattern();
  // Get the list of star systems for this pattern and add each ones planet dictionaries to an array.
  for (host of patternData[index]["pattern_" + (index + 1)].hostnames) {
    // For each host listed in a pattern, add their list of planet dictionaries to an array
    currentPatternSystems.push(starSysData[host]["planets"]);
  }
  // Get all the planet info for the first star system to display
  displayStarSystemFromCurrentPattern();
}

function displaySolarSystem() {
  // Clear everything
  resetPattern();

  // Set pattern to be solar system
  isShowingSolarSystem = true;
  currentPatternSystems.push(solarPlanets);
  displayStarSystemFromCurrentPattern();
}

function keyPressed() {
  // let numStarSystems = parseInt(
  //   patternData[currentPattern]["pattern_" + (currentPattern + 1)]
  //     .hostname_count
  // );

  let numStarSystems = currentPatternSystems.length;

  switch (keyCode) {
    // Navigate to next pattern.
    case RIGHT_ARROW:
      currentPattern = (currentPattern + 1) % patternData.length;
      displayPattern(currentPattern);
      return false; // prevent default browser behavior, which may scroll page on press of arrow
    // Navigate to previous pattern.
    case LEFT_ARROW:
      currentPattern =
        (currentPattern - 1 + patternData.length) % patternData.length;
      displayPattern(currentPattern);
      return false; // prevent default browser behavior, which may scroll page on press of arrow
    case DOWN_ARROW:
      // Navigate to next star system of current pattern.
      currentStarSystem = (currentStarSystem + 1) % numStarSystems;
      resetStarSystem();
      // Change to the new star systems content
      displayStarSystemFromCurrentPattern();
      return false; // prevent default browser behavior, which may scroll page on press of arrow
    case UP_ARROW:
      // Navigate to previous star system of current pattern.
      currentStarSystem =
        (currentStarSystem - 1 + numStarSystems) % numStarSystems;
      resetStarSystem();
      // Change to the new star systems content
      displayStarSystemFromCurrentPattern();
      return false; // prevent default browser behavior, which may scroll page on press of arrow
    case 32: //KeyCode for spacebar, no system variable in p5.js for it
      playAnimation = !playAnimation;
      resetSoundwave();
      return false; // prevent default browser behavior, which may scroll page on press of spacebar
    case TAB:
      displaySolarSystem();
      return false; // prevent default browser behavior, which may take action on press of TAB
  }
}

function windowResized() {
  const container = select("#projects");
  let w = container.width;
  let h = w / aspectRatio;

  // Optionally clamp height:
  /*let maxHeight = windowHeight * 0.7;
  if (h > maxHeight) {
    h = maxHeight;
    w = h * aspectRatio;
  }*/

  //resizeCanvas(w, h);
}

class Planet {
  constructor(x, y, d, properties) {
    this.x = x;
    this.y = y;
    this.d = d; // leaving this separate since might have some scale factor on this
    // Real planet properties
    this.name = String(properties.name);
    this.radius = properties.radius;
    this.mass = properties.mass;
    this.orbital_period = properties.orbital_period;
    this.type = String(properties.category);

    switch (this.type) {
      case "Terrestrial":
        this.note = notes.C5;
        break;
      case "Super-Earth":
        this.note = notes.A4;
        break;
      case "sub-Neptune":
        this.note = notes.F4;
        break;
      case "Low mass sub-Neptune":
        this.note = notes.F4;
        break;
      case "Neptune-like":
        this.note = notes.D4;
        break;
      case "Gas Giant":
        this.note = notes.B3;
        break;
      case "Brown Dwarf":
        this.note = notes.G3;
        break;
      default:
        this.note = notes.C5;
        console.log("DEFAULT hit. Got:", this.type);
    }

    this.played = false;
  }
  show() {
    circle(this.x, this.y, this.d);
    push();
    textStyle(BOLD);
    text(this.type, this.x, this.y + -120);
    pop();
    text(this.name, this.x, this.y + 120);
    text(parseFloat(this.radius).toFixed(2) + " R⊕", this.x, this.y + 150);
    text(parseFloat(this.mass).toFixed(2) + " M⊕", this.x, this.y + 180);
    text(
      parseFloat(this.orbital_period).toFixed(2) + " days",
      this.x,
      this.y + 210
    );
  }
}
