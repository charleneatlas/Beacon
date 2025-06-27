// Beacon
// Author: Charlene Atlas
// Exoplanet systems with three of more planets. Comparing via "hearing" them in terms of their planet types and ordering.
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
let planetRadii = {};
let currentStarSystem = 0;

let sunX;
let sunY;
let sunDiameter;
let spacing;

let aspectRatio = 16 / 9;

const D4_NOTE = "D4";
const C4_NOTE = "C4";
const B3_NOTE = "B3";
const A3_NOTE = "A3";
const G3_NOTE = "G3";
const F3_NOTE = "F3";
const E3_NOTE = "E3";

const starSystems = [];
const planets = [];
// Make planet radii to scale, but not distances.

// SOLAR SYSTEM - Source: https://www.britannica.com/science/solar-system
const MERCURY_RADIUS_KM = 4900 / 2;
const VENUS_RADIUS_KM = 12100 / 2;
const EARTH_RADIUS_KM = 12760 / 2;
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

// EXOPLANET CLASSIFICATION BY RADIUS - Source: ChatGPT
// Sub-terran < 0.8 R⊕	Smaller than Earth; likely rocky or iron-rich, like Mars or Mercury.
// Terran	0.8 – 1.25 R⊕	Earth-sized rocky planets.
// Super-Earth	1.25 – 2.0 R⊕	Larger rocky planets, possibly with thin atmospheres.
// Mini-Neptune / Sub-Neptune	2.0 – 4.0 R⊕	Small gas-rich planets with thick H/He envelopes. Often considered the dividing line between rocky and volatile-rich planets.
// Neptune-like	4.0 – 6.0 R⊕	Larger ice giants, like Neptune or Uranus.
// Gas Giant	> 6.0 R⊕	Jupiter-sized planets and larger; dominated by gas envelopes.
// Super-Jupiter	> 13 R⊕ (or > 13 M_J)	Massive gas giants possibly in brown dwarf territory.
//
// Can map to seven notes of a scale
// Sub-terran   | D4
// Terran	      | C4 (Makes sense to me that Earth is Middle C)
// Super-Earth  | B3
// Mini-Neptune | A3
// Neptune-like	| G3
// Gas Giant	  | F3
// Super-Jupiter| E3

// Ranges are non-inclusive...sometimes.
// Let's go ahead and use ROYGBIV for color order

const Subterran = {
  minRadius: 0,
  maxRadius: 0.8,
  uiColor: "red",
  note: D4_NOTE,
};

const Terran = {
  minRadius: 0.8,
  maxRadius: 1.25,
  uiColor: "orange",
  note: C4_NOTE,
};

const SuperEarth = {
  minRadius: 1.25,
  maxRadius: 2,
  uiColor: "yellow",
  note: B3_NOTE,
};

const MiniNeptune = {
  minRadius: 2,
  maxRadius: 4,
  uiColor: "green",
  note: A3_NOTE,
};

const NeptuneLike = {
  minRadius: 4,
  maxRadius: 6,
  uiColor: "blue",
  note: G3_NOTE,
};

const GasGiant = {
  minRadius: 6,
  maxRadius: 13,
  uiColor: "indigo",
  note: F3_NOTE,
};

const SuperJupiter = {
  minRadius: 13,
  maxRadius: 1000,
  uiColor: "violet",
  note: E3_NOTE,
};

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

  planetRadii = starSystems[currentStarSystem];
  calculatePlanets();
}

function draw() {
  if (!started) {
    // Start screen
    background(0);
    fill(255, 222, 33); // nice yellow

    textAlign(CENTER, CENTER);
    textSize(32); // Set text size to 32 pixels
    text("BEACON \nClick to start", width / 2, height / 2);
  } else {
    background(0);

    textAlign(TOP, CENTER);

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
    text(starSystemLabel, width / 2, 30);

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
  // TODO: Make the X placement consistent with 8 available "slots". The highest number of planets foundin a system is 8, and will be a good number musically.
  // Right now there is a false rhythmic pattern happening depending on the diameters.

  previousCenter = sunX;
  previousRadius = sunDiameter / 2;

  // Previous method of spacing, based off of distance to previous planet
  // for (let i = 0; i < planetRadii.length; i++) {
  //   centerX = previousCenter + previousRadius + spacing + planetRadii[i]; // CHATGPT suggestion: New center position for each planet = (previous planet’s center) + (previous planet’s radius) + (desired spacing) + (current planet’s radius)
  //   planets[i] = new Planet(centerX, sunY, planetRadii[i] * 2);
  //   print("make planet: " + planetRadii[i]);

  //   previousCenter = centerX;
  //   previousRadius = planetRadii[i];
  // }

  for (let i = 0; i < planetRadii.length; i++) {
    planets[i] = new Planet(150 * i + 250, sunY, planetRadii[i] * 2);
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

function keyPressed() {
  if (key === " ") {
    // CHANGE TO NEW STAR SYSTEM
    // Clear planets
    planets.length = 0;
    // Reset sound wave
    resetSoundwave();
    // Change star system index
    currentStarSystem = (currentStarSystem + 1) % starSystems.length;
    // Get the planet info for new star system
    planetRadii = starSystems[currentStarSystem];
    // Figure out placement of new planets to be drawn
    calculatePlanets();
    print("CLICK: " + currentStarSystem);
    return false; // prevent default browser behavior, which may scroll page on press of spacebar
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
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.d = d;

    // TODO: Update to use the category constants and keep in mind they are storing in Earth radii but the circles are using diameter that is already taking Earth radii into account
    switch (true) {
      case d <= 10:
        this.note = C4_NOTE;
        break;
      case d <= 40:
        this.note = B3_NOTE;
        break;
      case d <= 80:
        this.note = A3_NOTE;
        break;
      case d <= 100:
        this.note = G3_NOTE;
        break;
      case d <= 140:
        this.note = F3_NOTE;
        break;
      case d <= 180:
        this.note = E3_NOTE;
        break;
      default:
        this.note = C4_NOTE;
    }

    print("Diameter" + d);

    this.played = false;
  }
  show() {
    circle(this.x, this.y, this.d);
  }
}
