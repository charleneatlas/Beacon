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
let planetRadii = [];
let planetTypes = [];
let currentStarSystem = 0;
let currentPattern = 0;
let patternLabel;
let currentPatternSystems = []; // Star system data for current pattern

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

// SOLAR SYSTEM - Source: https://www.britannica.com/science/solar-system
const MERCURY_RADIUS_KM = 4900 / 2;
const VENUS_RADIUS_KM = 12100 / 2;

const MARS_RADIUS_KM = 6800 / 2;
const JUPITER_RADIUS_KM = 143000 / 2;
const SATURN_RADIUS_KM = 120600 / 2;
const URANUS_RADIUS_KM = 51000 / 2;
const NEPTUNE_RADIUS_KM = 50000 / 2;

// HD110067 (Six sub-Neptune system) - Source: https://en.wikipedia.org/wiki/HD_110067
const HD110067_B_RADIUS_KM = 2.2 * EARTH_RADIUS_KM;
const HD110067_C_RADIUS_KM = 2.388 * EARTH_RADIUS_KM;
const HD110067_D_RADIUS_KM = 2.852 * EARTH_RADIUS_KM;
const HD110067_E_RADIUS_KM = 1.94 * EARTH_RADIUS_KM;
const HD110067_F_RADIUS_KM = 2.601 * EARTH_RADIUS_KM;
const HD110067_G_RADIUS_KM = 2.607 * EARTH_RADIUS_KM;

// TOI-700 - https://en.wikipedia.org/wiki/TOI-700
const TOI700_B_RADIUS_KM = 0.944 * EARTH_RADIUS_KM;
const TOI700_C_RADIUS_KM = 2.65 * EARTH_RADIUS_KM;
const TOI700_D_RADIUS_KM = 1.156 * EARTH_RADIUS_KM;
const TOI700_E_RADIUS_KM = 0.931 * EARTH_RADIUS_KM;

// Grab the data
function preload() {
  //https://www.geeksforgeeks.org/javascript/p5-js-loadjson-function/
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
  canvas = createCanvas(windowWidth, windowHeight / 3);
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

  // HD110067 (K-type Main Sequence Star / "Orange Dwarf")
  planetRadii_HD110067 = [
    HD110067_B_RADIUS_KM / 1000,
    HD110067_C_RADIUS_KM / 1000,
    HD110067_D_RADIUS_KM / 1000,
    HD110067_E_RADIUS_KM / 1000,
    HD110067_F_RADIUS_KM / 1000,
    HD110067_G_RADIUS_KM / 1000,
  ];

  // TOI-700 (M Class Main Sequence Star / "Red Dwarf")
  planetRadii_TOI700 = [
    TOI700_B_RADIUS_KM / 1000,
    TOI700_C_RADIUS_KM / 1000,
    TOI700_D_RADIUS_KM / 1000,
    TOI700_E_RADIUS_KM / 1000,
  ];

  // Star systems
  starSystems[0] = planetRadii_SolarSystem;
  starSystems[1] = planetRadii_HD110067;
  starSystems[2] = planetRadii_TOI700;

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

    let starSystemLabel;

    switch (currentStarSystem) {
      case 0:
        starSystemLabel = "SOLAR SYSTEM";
        break;
      case 1:
        starSystemLabel = "HD110067";
        break;
      case 2:
        starSystemLabel = "TOI-700";
        break; // ... more cases
      default:
        starSystemLabel = "UNKNOWN";
    }

    patternLabel =
      patternData[currentPattern]["pattern_" + (currentPattern + 1)].name;
    text(patternLabel, width / 2, 30);
    textSize(18);

    text(
      patternData[currentPattern]["pattern_" + (currentPattern + 1)]
        .hostnames[0],
      width / 2,
      60
    );

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

  for (let i = 0; i < planetRadii.length; i++) {
    planets[i] = new Planet(
      150 * i + 250,
      sunY,
      (planetRadii[i] * EARTH_RADIUS_KM * 2) / ScaleFactor,
      planetTypes[i]
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
    playAnimation = !playAnimation;
    resetSoundwave();
  }
}

function resetDisplay() {
  // Clear planets
  planets.length = 0;
  planetRadii.length = 0;
  planetTypes.length = 0;
  currentPatternSystems.length = 0;

  // Reset sound wave
  resetSoundwave();
}

function displayPattern(index) {
  // Clear everything
  resetDisplay();
  // Get the list of star systems for this pattern and add each ones planet dictionaries to an array.
  for (host of patternData[index]["pattern_" + (index + 1)].hostnames) {
    // For each host listed in a pattern, add their list of planet dictionaries to an array
    currentPatternSystems.push(starSysData[host]["planets"]);
  }
  // Get the planet info for new star system
  for (pl of currentPatternSystems[0]) {
    planetRadii.push(pl.radius);
    planetTypes.push(pl.category); // TODO: Instead of separate arrays for all the planet attributes, create planet objects and pass them its properties in a constructor.
  }
  // Figure out placement of new planets to be drawn
  calculatePlanets();
}

function keyPressed() {
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
      //currentStarSystem = (currentStarSystem + 1) % starSystems.length;
      break;
    case UP_ARROW:
      // Navigate to previous star system of current pattern.
      break;
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
  constructor(x, y, d, type) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.type = String(type);

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
    text(this.type, this.x, this.y + 120);
  }
}
