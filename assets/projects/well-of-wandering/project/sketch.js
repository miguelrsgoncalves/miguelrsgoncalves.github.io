/*
  Known problem: Sometimes the microphone permissions don't work. We found that if the program crashes after trying to input the SoundBall, switching browser resolved the issue. We had 2 instances, one where we had the error in Goggle Chrome, got the error, and switched to Firefox and it worked, and another where we were on Firefox, got the error, and switched to Google Chrome and it worked. We ask, if the error occurs to switch browser.

  Known problem 2: You can only record the SoundBall sound if you have already put the small points in motion. Creating the sound right on program start will cause error.
*/

let points = [];
let soundBall;
let numberOfPoints = 5;
let isPan = false;
let orbitRadius = 0;
let numberOfPointsArray = [5, 10, 15, 25, 50];
let numberOfPointsIndex = 0;

let worldX = 500;
let worldY = 700;
let worldZ = 500;

let mic, recorder, soundFile, reverb;
let isRecording = false;

let selectedPoint = 0;
let pointSelectorFirst = 0;

let uiContainer;
let pointSelector, speedSlider, waveformSelector;
let changeAllWaveformsButton, numberOfPointsButton, randomizeButton, panButton, recordingButton;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  noStroke();
  
  orbitRadius = min(width, height) / 3.5;

  uiContainer = createDiv();
  uiContainer.addClass('p5-ui-overlay');
  
  pointSelector = createSelect();
  pointSelector.parent(uiContainer);
  for(let i = 0; i < numberOfPoints; i++){
    pointSelector.option(i + 1);
  }
  pointSelector.changed(changeSelectedPoint);
  
  speedSlider = createSlider(0, 500, 0);
  speedSlider.parent(uiContainer);
  speedSlider.style('width', '80px');
  speedSlider.changed(changeSpeed);
  
  waveformSelector = createSelect();
  waveformSelector.parent(uiContainer);
  waveformSelector.option('sine');
  waveformSelector.option('triangle');
  waveformSelector.option('sawtooth');
  waveformSelector.option('square');
  waveformSelector.selected('sine');
  waveformSelector.changed(changeOscillator);
  
  changeAllWaveformsButton = createButton("Change all waveforms");
  changeAllWaveformsButton.parent(uiContainer);
  changeAllWaveformsButton.mouseClicked(changeAllWaveforms);
  
  numberOfPointsButton = createButton(`Number of Points: ${numberOfPoints}`);
  numberOfPointsButton.parent(uiContainer);
  numberOfPointsButton.mouseClicked(changeNumberOfPoints);
  
  randomizeButton = createButton("Randomize");
  randomizeButton.parent(uiContainer);
  randomizeButton.mouseClicked(randomizeValues);
  
  panButton = createButton(`Spatial audio: ${isPan}`);
  panButton.parent(uiContainer);
  panButton.mouseClicked(changePan);
  
  recordingButton = createButton("Record");
  recordingButton.parent(uiContainer);
  recordingButton.mouseClicked(recordMicrophone);
  
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  soundFile = new p5.SoundFile();
  reverb = new p5.Reverb();
  
  mic.start();
  userStartAudio();

  createPoints();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  orbitRadius = min(width, height) / 3.5;
}

function createPoints() {
  points = [];
  let y = -height / 3;
  let baseFrequency = 50;
  for (let i = 0; i < numberOfPoints; i++) {
    const x = orbitRadius;
    const z = 0;
    
    const r = floor(random(256));
    const g = floor(random(256));
    const b = floor(random(256));
    
    const speed = 0;
    const waveform = "sine";
    const Oscillator = new p5.Oscillator(baseFrequency, waveform);
    
    points.push(new Point(x, y, z, speed, Oscillator, baseFrequency, waveform, color(r, g, b)));
    y += height / (numberOfPoints * 1.25);
    baseFrequency += 500 / numberOfPoints;
  }
  
  frameCount = 0;
}

function draw() {
  background(15, 15, 20);
  orbitControl();
  
  // Draw Ellipses
  for(let point of points) {
    noFill();
    stroke(255, 64);
    push();
    translate(0, point.vector.y, 0);
    rotateX(PI/2);
    ellipse(0, 0, map(point.speed, 0, 500, 0, orbitRadius * 2));
    pop();
    
    fill(255, 64);
    noStroke();
    push();
    translate(0, point.vector.y, -map(point.speed, 0, 500, 0, orbitRadius));
    sphere(10);
    pop();
  }

  // Draw points
  for (let point of points) {
    push();
    point.rotate();
    translate(point.vector.x, point.vector.y, point.vector.z);
    point.display();
    pop();
  }
  
  // SoundBall
  if(soundBall != null && soundBall != undefined) {
    push();
    translate(soundBall.vector.x, soundBall.vector.y, soundBall.vector.z);
    soundBall.display();
    pop();
    
    soundBall.vector.x += soundBall.xSpeed * 10;
    soundBall.vector.y += soundBall.ySpeed * 10;
    soundBall.vector.z += soundBall.zSpeed * 10;
    
    if (soundBall.vector.x > worldX/2 - 30 || soundBall.vector.x < -worldX/2 + 30) {
      soundBall.xSpeed = -soundBall.xSpeed;
    }
    if (soundBall.vector.y > worldY/2 - 30 || soundBall.vector.y < -worldY/2 + 30) {
      soundBall.ySpeed = -soundBall.ySpeed;
    }
    if (soundBall.vector.z > worldZ/2 - 30 || soundBall.vector.z < -worldZ/2 + 30) {
      soundBall.zSpeed = -soundBall.zSpeed;
    }
    
    for(let point of points) {
      let distance = dist(soundBall.vector.x, soundBall.vector.y, soundBall.vector.z, point.vector.x, point.vector.y, point.vector.z) - 40;
      
      if(distance < 0) {
        soundBall.color = point.color;
        soundFile.play();
        
        if(soundBall.vector.x > point.vector.x && soundBall.xSpeed < 0) {
          soundBall.xSpeed = -soundBall.xSpeed;
        } else if(soundBall.vector.x < point.vector.x && soundBall.xSpeed > 0) {
          soundBall.xSpeed = -soundBall.xSpeed;
        }
        if(soundBall.vector.y > point.vector.y && soundBall.ySpeed < 0) {
          soundBall.ySpeed = -soundBall.ySpeed;
        } else if(soundBall.vector.y < point.vector.y && soundBall.ySpeed > 0) {
          soundBall.ySpeed = -soundBall.ySpeed;
        }
        if(soundBall.vector.z > point.vector.z && soundBall.zSpeed < 0) {
          soundBall.zSpeed = -soundBall.zSpeed;
        } else if(soundBall.vector.z < point.vector.z && soundBall.zSpeed > 0) {
          soundBall.zSpeed = -soundBall.zSpeed;
        }
      }
    }
  }
}

function keyTyped() {
  if (key === 'r' || key === 'R') {
    pointSelector.value(1);
    selectedPoint = 0;
    changeSelectedPoint();
    numberOfPoints = numberOfPointsArray[0];
    createPoints();
  }
}

function changePan() {
  isPan = !isPan;
  panButton.html(`Spatial audio: ${isPan}`);
}

function changeNumberOfPoints() {
  numberOfPointsIndex = (numberOfPointsIndex + 1) % numberOfPointsArray.length;
  numberOfPoints = numberOfPointsArray[numberOfPointsIndex];
  createPoints();
  numberOfPointsButton.html(`Number of Points: ${numberOfPoints}`);
  
  pointSelector.html('');
  for (let i = 1; i <= numberOfPoints; i++) {
    pointSelector.option(i);
  }

  pointSelector.value(1);
  selectedPoint = 0;
  changeSelectedPoint();
}

function changeSelectedPoint() {
  selectedPoint = pointSelector.value() - 1;
  resetButtonValues();
}

function changeOscillator() {
  if (points[selectedPoint]) {
    points[selectedPoint].changeOscillator(waveformSelector.value());
  }
}

function changeSpeed() {
  if (points[selectedPoint]) {
    points[selectedPoint].speed = speedSlider.value();
  }
}

function changeAllWaveforms() {
  for(let point of points) {
    point.changeOscillator(waveformSelector.value());
  }
}

function resetButtonValues() {
  if (points[selectedPoint]) {
    speedSlider.value(points[selectedPoint].speed);
    waveformSelector.value(points[selectedPoint].waveform);
  }
}

function randomizeValues() {
  for(let point of points) {
    point.speed = floor(random(0, 500));
    let randomWaveform = floor(random(0, 4));
    switch(randomWaveform) {
      case 0: point.changeOscillator("sine"); break;
      case 1: point.changeOscillator("triangle"); break;
      case 2: point.changeOscillator("sawtooth"); break;
      case 3: point.changeOscillator("square"); break;
    }
  }
  resetButtonValues();
}

function recordMicrophone() {
  userStartAudio();
  if(!isRecording) {
    isRecording = true;
    recordingButton.html("Recording...");
    recorder.record(soundFile);
  } else {
    isRecording = false;
    recordingButton.html("Record");
    recorder.stop();
    reverb.process(soundFile, 5, 0.5);
    reverb.drywet(1000);
    soundFile.setVolume(5);
    soundBall = new SoundBall(0, 0, 0);
  }
}

function mouseClicked() {
  userStartAudio();
}

class Point {
  constructor(x, y, z, speed, Oscillator, frequency, waveform, color) {
    this.vector = createVector(x, y, z);
    this.speed = speed;
    this.Oscillator = Oscillator;
    this.frequency = frequency;
    this.waveform = waveform;
    this.color = color;
    this.previousX = x;
    
    this.Oscillator.start();
    this.Oscillator.amp(0);
  }
  
  rotate() {
    const angle = TWO_PI / 6;
    this.previousX = this.vector.x;
    
    this.vector.x = cos(angle * frameCount * this.speed * 0.00025) * map(this.speed, 0, 500, 0, orbitRadius);
    this.vector.z = sin(angle * frameCount * this.speed * 0.00025) * map(this.speed, 0, 500, 0, orbitRadius);
  }
  
  changeOscillator(waveFormString) {
    this.waveform = waveFormString;
    this.Oscillator.stop();
    this.Oscillator = new p5.Oscillator(this.frequency, waveFormString);
    this.Oscillator.start();
    this.Oscillator.amp(0);
  }

  display() {
    fill(this.color);
    noStroke();
    sphere(10);
    if((this.vector.x >= 0 && this.previousX <= 0) && !isRecording && this.speed > 0) {
      if(isPan) {
        this.Oscillator.pan(random(-1, 1));
      } else {
        this.Oscillator.pan(0);
      }
      this.Oscillator.amp(0.1);
      this.Oscillator.amp(0, 2);
    }
  }
}

class SoundBall {
  constructor(x, y, z) {
    this.vector = createVector(x, y, z);
    this.color = "white";
    this.xSpeed = random(0, 1);
    this.ySpeed = random(0, 1);
    this.zSpeed = random(0, 1);
  }
  
  changeColor(color) {
    this.color = color;
  }
  
  display() {
    fill(`${this.color}`);
    noStroke();
    sphere(30);
  }
}