// Beacon
// Author: Charlene Atlas
// Exoplanet systems with three of more planets. Comparing via "hearing" them in terms of their planet types and ordering.
// At this time, focused on systems that have a "pattern" shared by at least one other system.
// Radii are to scale, distances are not.

// P5 instances
let p5_2D = null;
let p5_3D = null;

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
let isShowingOneHit = false;
let myButton_OneHit;
let myButton_SolarSystem;
let myButton_Patterns;
let selectedButton = null;
let storyText;

let sunX;
let sunY;
let starColor;
let sunDiameter;
let spacing;

//let patternData;
//let starSysData;

const sharedData = {
  patternData: null,
  starSysData: null,
};

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
const OneHitWonders = [
  "KOI-351",
  "Kepler-20",
  "Kepler-238",
  "Kepler-32",
  "Kepler-444",
  "Kepler-55",
  "Kepler-80",
  "TOI-1136",
  "TOI-178",
  "TRAPPIST-1",
  "HD 110067",
];

const ScaleFactor = 900; // A way to scale down planets to fit in app window
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
  category: "Neptune-like",
  order: 7,
};

const Neptune = {
  name: "Neptune",
  radius: 3.88,
  mass: 17.15,
  orbital_period: 60190,
  category: "Neptune-like",
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

function preloadMultipleJSON(files, callback) {
  let loaded = 0;
  const total = files.length;

  files.forEach((file) => {
    fetch(file.path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load ${file.path}: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        sharedData[file.key] = data;
        loaded++;
        if (loaded === total) callback(); // all loaded
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

// Call this first
preloadMultipleJSON(
  [
    { key: "patternData", path: "PatternData_NexSci.json" },
    { key: "starSysData", path: "StarSystemData_NexSci_AllGreaterThan3.json" },
  ],
  startSketches
);
/*
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
}*/

function startSketches() {
  // TEST🪐 3D Sketch (renders a rotating sphere)
  new p5((p) => {
    // Save the p5 instance for use outside
    p5_3D = p;

    p.setup = () => {
      // p.createCanvas(p.windowWidth, p.windowHeight / 1.5, p.WEBGL).parent(
      //   "canvas3D"
      // );
      let container = document.getElementById("container");
      let w = container.offsetWidth;
      let h = container.offsetHeight;
      p.createCanvas(w, h, p.WEBGL).parent("canvas3D");
      p.ortho(); // <-- no perspective distortion
    };

    p.draw = () => {
      p.background(0);
      p.stroke(255, 0, 0);
      p.ambientLight(150);
      p.directionalLight(starColor, 1, 0, 0);

      const z = 0; //Not messin' with Z for this.

      if (started) {
        //If past title and intro screens
        p.push();
        p.translate(-p.width / 2, -p.height / 2, 0);
        // Now (0,0,0) is top-left, matching 2D canvas!

        for (const pl of planets) {
          p.push();
          p.translate(pl.x, pl.y, z);
          //console.log(`3D planet at (${pl.x}, ${pl.y}, ${z})`);
          // Now moved to match 2D position
          p.ambientMaterial(250);
          p.noStroke();
          p.sphere(pl.r);
          p.pop();
        }

        p.pop();
      }
    };
    p.windowResized = () => {
      let container = document.getElementById("container");
      let w = container.offsetWidth;
      let h = container.offsetHeight;
      p.resizeCanvas(w, h);
      p.ortho(); // to redo projection in WEBGL
    };
  });

  new p5((p) => {
    // Save the p5 instance for use outside
    p5_2D = p;

    p.setup = () => {
      // p.canvas = p.createCanvas(p.windowWidth, p.windowHeight / 1.5);
      // p.canvas.parent("canvas2D");

      let container = document.getElementById("container");
      let w = container.offsetWidth;
      let h = container.offsetHeight;
      p.canvas = p.createCanvas(w, h).parent("canvas2D");

      if (isMobile()) {
        // If on a phone, ask to go fullscreen
        confirm(
          "For best experience on mobile, please use Landscape orientation."
        );
      } else {
        // If on a desktop, ask them to maximize the window
        if (p.windowWidth < 1000 || p.windowHeight < 600) {
          let shouldReload = confirm(
            "For best experience, please maximize your window, then click OK to reload."
          );
          if (shouldReload) {
            location.reload();
          }
        }
      }

      /*const container = select("#projects"); // or whatever container you have
  let w = container.width;
  let h = w / aspectRatio;
  createCanvas(w, h).parent("projects");*/

      starColor = p.color(255, 222, 33);
      s = 0;

      synth = new p5.MonoSynth();

      // UI for switching datasets

      let xOffset = (p.windowWidth - p.width) / 2;
      let txtCenterX = xOffset + p.width / 2;

      myButton_SolarSystem = p.createButton("Our Solar System");
      myButton_SolarSystem.parent("canvas2D");
      myButton_SolarSystem.style("width", "150px");
      myButton_SolarSystem.style("height", "40px");
      myButton_SolarSystem.style("background-color", "#bbb");
      myButton_SolarSystem.style("color", "#fff");
      //myButton_SolarSystem.position(30, 20);
      myButton_SolarSystem.style("transform", "translate(-50%, -50%)"); // shifts origin to center
      myButton_SolarSystem.position(txtCenterX - 170, 30);
      myButton_SolarSystem.hide();

      myButton_OneHit = p.createButton("One Hit Wonders");
      myButton_OneHit.parent("canvas2D");
      myButton_OneHit.style("width", "150px");
      myButton_OneHit.style("height", "40px");
      myButton_OneHit.style("background-color", "#bbb");
      myButton_OneHit.style("color", "#fff");
      //myButton_OneHit.position(200, 20);
      myButton_OneHit.style("transform", "translate(-50%, -50%)"); // shifts origin to center
      myButton_OneHit.position(txtCenterX, 30);
      myButton_OneHit.hide();

      myButton_Patterns = p.createButton("Common Patterns");
      myButton_Patterns.parent("canvas2D");
      myButton_Patterns.style("width", "150px");
      myButton_Patterns.style("height", "40px");
      myButton_Patterns.style("background-color", "#bbb");
      myButton_Patterns.style("color", "#fff");
      //myButton_Patterns.position(370, 20);
      myButton_Patterns.style("transform", "translate(-50%, -50%)"); // shifts origin to center
      myButton_Patterns.position(txtCenterX + 170, 30);
      myButton_Patterns.hide();

      // Add a callback function
      myButton_SolarSystem.mousePressed(displaySolarSystem);
      myButton_OneHit.mousePressed(showOneHitWonders);
      myButton_Patterns.mousePressed(() => {
        displayPattern(currentPattern);
      });

      // Sun
      // TODO: Make Sun (star) to scale and correct color depending on star class
      //sunX = -1 * (1392000/1000)/3;

      sunDiameter = 400; //1392000/1000
      sunX = -sunDiameter / 4;
      sunY = p.height / 2;
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
      //displayPattern(currentPattern);

      // Display solar system
      displaySolarSystem();
    };

    p.draw = () => {
      // Get a center point in X direction to use for aligning elements
      let xOffset = (p.windowWidth - p.width) / 2;
      let txtCenterX = xOffset + p.width / 2;

      if (!started) {
        // Start screen
        //p.background(0);
        //fill(255, 222, 33); // nice yellow
        p.fill(255, 255, 255); // white
        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(48); // Set text size to 32 pixels

        p.text("BEACON", txtCenterX, 100);
        p.textSize(22); // Set text size to 32 pixels
        p.text(
          "Every star is a beacon. \nOur Sun lights our way—just as countless other stars warm and guide their own distant worlds. \nThough separated by vast space, these systems share melodies of formation. \nNo known system shares our song, yet among the stars, sister systems call to each other. \nLet’s explore their music—beacons reaching out to one another... and to us.",
          txtCenterX,
          250
        );
        p.textSize(28);
        p.textStyle(p.ITALIC);
        p.text("Click to Start", txtCenterX, 400);
        //p.noFill();
        p.stroke("white");
        // p.rect(
        //   p.width / 2 - p.textWidth("Click to Start") / 2,
        //   380,
        //   p.textWidth("Click to Start"),
        //   50
        // );
        p.pop();
      } else {
        p.clear();

        // Show Dataset Buttons
        myButton_SolarSystem.show();
        //displaySolarSystem();
        myButton_OneHit.show();
        myButton_Patterns.show();

        p.textAlign(p.CENTER, p.TOP);
        p.textSize(32); // Set text size to 32 pixels

        let currentHostLabel;
        let numSystemsWithPattern;

        if (!isShowingSolarSystem) {
          if (!isShowingOneHit) {
            // is showing Patterns
            patternLabel =
              sharedData.patternData[currentPattern][
                "pattern_" + (currentPattern + 1)
              ].name;

            currentHostLabel =
              sharedData.patternData[currentPattern][
                "pattern_" + (currentPattern + 1)
              ].hostnames[currentStarSystem];

            numSystemsWithPattern =
              sharedData.patternData[currentPattern][
                "pattern_" + (currentPattern + 1)
              ].hostname_count;

            storyText =
              "Planet patterns tell a story.\nThese beacons sent out their call—and received a reply.\nPress Left/Right keys to explore patterns.\nPress Up/Down keys to explore matching systems.";
          } else {
            // Showing One Hit Wonders
            // TEMP HACK: Put star name in pattern label since bigger and on top
            patternLabel = OneHitWonders[currentStarSystem];
            currentHostLabel = "";
            storyText =
              "Like us, these systems still wait,\nfor a beacon that mirrors their own.\nPress Up/Down keys to explore.";
          }
        } else {
          patternLabel = "Solar System";
          currentHostLabel = "The Sun";
          numSystemsWithPattern = 1; // as of 7-10-25
          storyText =
            'No one has answered our call yet.\nBut the first system in "One Hit Wonders" comes close,\nas the only other system with 8 planets!';
        }
        p.text(patternLabel, txtCenterX, 80);
        p.textSize(18);

        // Show star system name
        p.push();
        p.textStyle(p.BOLD);
        p.text(currentHostLabel, txtCenterX, 110);
        p.pop();

        // Show how many other patterns there are
        if (!isShowingOneHit && !isShowingSolarSystem) {
          p.text(
            "(" +
              (currentStarSystem + 1) +
              " of " +
              numSystemsWithPattern +
              " star systems)",
            txtCenterX,
            130
          );
        }

        // Show story text
        p.push();
        p.textStyle(p.ITALIC);
        //let xOffset = (p.windowWidth - p.width) / 2;
        //let txtCenterX = xOffset + p.width / 2;
        p.textAlign(p.LEFT);
        p.text(storyText, 20, 20);
        p.pop();

        p.push();
        // Star
        p.fill(starColor);
        p.stroke("orange");
        p.strokeWeight(5);
        p.circle(sunX, sunY, sunDiameter);

        p.pop();

        p.push();
        // Planets
        p.fill("white"); // Ecru https://www.figma.com/colors/ecru/
        p.noStroke();
        //stroke(109,59,7); // Mocha https://www.figma.com/colors/mocha/
        //strokeWeight(2);

        for (let pl of planets) {
          pl.show();
        }

        p.pop();

        p.push();

        p.stroke("pink");
        p.strokeWeight(3);
        p.noFill();

        soundWaveDiameter = sunDiameter + s; // To make the expanding circle start at border of sun
        p.circle(sunX, sunY, soundWaveDiameter); // To make the expanding circle start at border of sun
        p.pop();

        for (let pl of planets) {
          checkPlayPlanet(pl);
        }

        //s = s + soundWaveSpeed;

        if (playAnimation) {
          s += soundWaveSpeed * (p.deltaTime / 1000);
        }

        soundWaveEdgeX = sunX + soundWaveDiameter / 2;
        //print("EDGE: " + soundWaveEdgeX);

        if (soundWaveEdgeX > resetX) {
          resetSoundwave();
        }
      }
    };

    p.windowResized = () => {
      let container = document.getElementById("container");
      let w = container.offsetWidth;
      let h = container.offsetHeight;
      p.resizeCanvas(w, h);
    };

    p.touchStarted = () => {
      //Covers both click and tap on mobile
      if (!started) {
        // First click by user will start everything else. From this point clicking will have normal in-app use of play/pausing animation.
        started = true;

        // Make sure audio context running due to new browser rules that block autoplaying audio
        if (p.getAudioContext().state !== "running") {
          p.getAudioContext().resume();
        }

        // Fullscreen the app
        //let fs = p.fullscreen();
        //p.fullscreen(!fs);

        // Play soundwave line and resulting audio as hits planets
        playAnimation = true;

        // Focus the canvas
        p.canvas.elt.focus?.();
      } else {
        // TODO
      }
    };

    p.keyPressed = () => {
      // let numStarSystems = parseInt(
      //   patternData[currentPattern]["pattern_" + (currentPattern + 1)]
      //     .hostname_count
      // );

      let numStarSystems = currentPatternSystems.length;

      switch (p.keyCode) {
        // Navigate to next pattern.
        case p.RIGHT_ARROW:
          if (!isShowingOneHit && !isShowingSolarSystem) {
            currentPattern =
              (currentPattern + 1) % sharedData.patternData.length;
            displayPattern(currentPattern);
          }
          return false; // prevent default browser behavior, which may scroll page on press of arrow
        // Navigate to previous pattern.
        case p.LEFT_ARROW:
          if (!isShowingOneHit && !isShowingSolarSystem) {
            currentPattern =
              (currentPattern - 1 + sharedData.patternData.length) %
              sharedData.patternData.length;
            displayPattern(currentPattern);
          }
          return false; // prevent default browser behavior, which may scroll page on press of arrow
        case p.DOWN_ARROW:
          // Navigate to next star system of current pattern.
          currentStarSystem = (currentStarSystem + 1) % numStarSystems;
          resetStarSystem();
          // Change to the new star systems content
          displayStarSystemFromCurrentPattern();
          return false; // prevent default browser behavior, which may scroll page on press of arrow
        case p.UP_ARROW:
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
        // case p.TAB:
        //   if (!isShowingSolarSystem) {
        //     displaySolarSystem();
        //   } else {
        //     displayPattern(currentPattern);
        //   }
        //   return false; // prevent default browser behavior, which may take action on press of TAB
      }
    };
  });

  //window.addEventListener("resize", onWindowResize);
}

function euclideanDistance(point1, point2) {
  const xDiff = point2.x - point1.x;
  const yDiff = point2.y - point1.y;
  // For 3D space, add const zDiff = point2.z - point1.z; and include zDiff * zDiff in the return statement
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function calculatePlanets() {
  for (let i = 0; i < planetProperties.length; i++) {
    planets[i] = new Planet(
      160 * i + 150,
      sunY,
      (planetProperties[i].radius * EARTH_RADIUS_KM) / ScaleFactor,
      planetProperties[i]
    );
  }

  // Determine how far the sound wave front should go before resetting. Here using the X of the last planet and adding sun radius as a buffer.
  resetX = sunDiameter / 2 + planets[planets.length - 1].x;
}

function checkPlayPlanet(pl) {
  if (
    soundWaveDiameter / 2 >
    euclideanDistance(sunCenter, {
      x: pl.x,
      y: pl.y,
    })
  ) {
    if (pl.played == false) {
      //MonoSynth Syntax (frequency, velocity, secondsFromNow, sustainTime)
      //https://p5js.org/reference/p5.MonoSynth/play/#:~:text=Reference%20play()-,play(),triggerRelease.

      synth.play(pl.note);
      pl.played = true;

      //print("PLAYED");
    }
  }
}

function resetSoundwave() {
  //print("RESET");
  s = 0;

  for (let p of planets) {
    p.played = false;
  }
}

function resetPattern() {
  // Clear planets
  planets.length = 0;
  planetProperties.length = 0;
  isShowingSolarSystem = false; // In case was showing solar system previously
  isShowingOneHit = false;

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

  // Select button
  selectButton(myButton_Patterns);

  // Get the list of star systems for this pattern and add each ones planet dictionaries to an array.
  for (host of sharedData.patternData[index]["pattern_" + (index + 1)]
    .hostnames) {
    // For each host listed in a pattern, add their list of planet dictionaries to an array
    currentPatternSystems.push(sharedData.starSysData[host]["planets"]);
  }
  // Get all the planet info for the first star system to display
  displayStarSystemFromCurrentPattern();
}

function displaySolarSystem() {
  // Clear everything
  resetPattern();

  // Show button as selected
  selectButton(myButton_SolarSystem);

  // Set pattern to be solar system
  isShowingSolarSystem = true;
  currentPatternSystems.push(solarPlanets);
  displayStarSystemFromCurrentPattern();
}

function displayOneHitWonders() {
  // Clear everything
  resetPattern();

  // Get the list of star systems and add each ones planet dictionaries to an array.
  for (host of OneHitWonders) {
    // For each host listed in a pattern, add their list of planet dictionaries to an array
    currentPatternSystems.push(sharedData.starSysData[host]["planets"]);
  }
  isShowingOneHit = true;
  // Get all the planet info for the first star system to display
  displayStarSystemFromCurrentPattern();
}

function showOneHitWonders() {
  selectButton(myButton_OneHit);
  displayOneHitWonders();
  console.log("One Hit Wonders!");
}

function selectButton(btn) {
  // Deselect the previously selected button
  if (selectedButton) {
    selectedButton.style("background-color", "#bbb");
    selectedButton.style("color", "#fff");
  }

  // Select the new one
  btn.style("background-color", starColor);
  btn.style("color", "#000");
  selectedButton = btn;
  console.log("YOOOOO");
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

class Planet {
  constructor(x, y, r, properties) {
    this.x = x;
    this.y = y;
    this.r = r; // leaving this separate since might have some scale factor on this
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
    //p5_2D.circle(this.x, this.y, this.r * 2); // Rendering the planet itself in 3D canvas now.
    //p5_2D.push();
    //p5_2D.fill("white");
    p5_2D.push();
    p5_2D.textStyle(p5_2D.BOLD);
    p5_2D.textSize(20);
    p5_2D.text(this.type, this.x, this.y + -120);
    p5_2D.pop();
    p5_2D.push();
    p5_2D.textStyle(p5_2D.BOLD);
    p5_2D.text(this.name, this.x, this.y + 120);
    p5_2D.pop();
    p5_2D.text(
      parseFloat(this.radius).toFixed(2) + " R⊕",
      this.x,
      this.y + 150
    );
    p5_2D.text(parseFloat(this.mass).toFixed(2) + " M⊕", this.x, this.y + 180);
    p5_2D.text(
      parseFloat(this.orbital_period).toFixed(2) + " days",
      this.x,
      this.y + 210
    );
    //p5_2D.pop();
  }
}
