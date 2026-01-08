let desiredFrameRate = 60;
let tileSize = 8;
let canvasWidth = 800;
let canvasHeight = 600;
let simulationFrequency = desiredFrameRate/20;
let updateCounter = 0;
let god;
let world;
let civilization;

let firePng;
let nukePng;

let nukeIsGoingOff = false;
let nukeFallOffTiming = desiredFrameRate * 15;
let nukeLocation = null;

function preload() {
  firePng = loadImage('fire.png');
  nukePng = loadImage('nuke.png');
  
  handsfree = new Handsfree({
    hands: {
      enabled: true,
      // The maximum number of hands to detect [0 - 4]
      maxNumHands: 1,

      // Minimum confidence [0 - 1] for a hand to be considered detected
      minDetectionConfidence: 0.5,

      // Minimum confidence [0 - 1] for the landmark tracker to be considered detected
      // Higher values are more robust at the expense of higher latency
      minTrackingConfidence: 0.8
    },
    //showDebug: true
  })
  handsfree.plugin.pinchScroll.disable()
  
  handsfree.model.hands.getData = handsfree.throttle(
    handsfree.model.hands.getData,
    1000 / 30
  )
  
  handsfree.use('hand-of-god', (data) => {
    if (!data.hands) return;
    if(!god) return;

    //console.log(handsfree.data.hands)
    
    let judgmentHandLandmarks;
    let thumb;
    let index;
    let middle;
    let ring;
    let pinky;
    
    if(handsfree.data.hands.multiHandedness != undefined && handsfree.data.hands.landmarks != null) {
      if(handsfree.data.hands.landmarks != undefined && handsfree.data.hands.landmarks != null) {
        judgmentHandLandmarks = handsfree.data.hands.multiHandLandmarks[0];
      }
      if(handsfree.data.hands.gesture != undefined && handsfree.data.hands.gesture != null) {
        let gestureIndex = 0;
        if(handsfree.data.hands.gesture[0] == undefined || handsfree.data.hands.gesture[0]  == null) gestureIndex = 1;
        const handGesture = handsfree.data.hands.gesture[gestureIndex];
        if(handGesture != undefined && handGesture != null) {
          thumb = handGesture.pose[0][1];
          index = handGesture.pose[1][1];
          middle = handGesture.pose[2][1];
          ring = handGesture.pose[3][1];
          pinky = handGesture.pose[4][1];
          
          if(handsfree.data.hands.pinchState[0][0] === "held" || handsfree.data.hands.pinchState[1][0] === "held") {
            if(civilization == null) {
              const tileX = Math.floor((1 - judgmentHandLandmarks[8].x)  * canvasWidth / tileSize);
              const tileY = Math.floor(judgmentHandLandmarks[8].y * canvasHeight / tileSize);
              
              createCivilization((1 - judgmentHandLandmarks[8].x)  * canvasWidth, judgmentHandLandmarks[8].y * canvasHeight, tileX, tileY);
            } else {
              if(god.selectedPower == 2) {
                image(firePng, (1 - judgmentHandLandmarks[8].x)  * canvasWidth - 20, judgmentHandLandmarks[8].y * canvasHeight - 25, 40, 50);
              }
              god.usePower(judgmentHandLandmarks[8].x, judgmentHandLandmarks[8].y);
            }
          }
          else if(civilization){
            if((thumb === "Half Curl" || thumb ==="Full Curl")
              && index === "No Curl"
              && (middle === "Half Curl" || middle ==="Full Curl")
              && (ring === "Half Curl" || ring ==="Full Curl")
              && (pinky === "Half Curl" || pinky ==="Full Curl")) {
              god.switchPower(0);
            }

            if((thumb === "Half Curl" || thumb ==="Full Curl")
              && index === "No Curl"
              && middle === "No Curl"
              && (ring === "Half Curl" || ring ==="Full Curl")
              && (pinky === "Half Curl" || pinky ==="Full Curl")) {
              god.switchPower(1);
            }

            if((thumb === "Half Curl" || thumb ==="Full Curl")
              && index === "No Curl"
              && middle === "No Curl"
              && ring === "No Curl"
              && (pinky === "Half Curl" || pinky ==="Full Curl")) {
              god.switchPower(2);
            }

            if((thumb === "Half Curl" || thumb ==="Full Curl")
              && index === "No Curl"
              && middle === "No Curl"
              && ring === "No Curl"
              && pinky === "No Curl") {
              god.switchPower(3);
            }
            
            if(god.selectedPower == 3) {
              fill(0, 0, 0, 32);
              circle((1 - judgmentHandLandmarks[8].x)  * canvasWidth, judgmentHandLandmarks[8].y * canvasHeight, canvasWidth/2);
            }
          }
        }
      }
    }
  })
}

function setup() {
  god = new God();
  world = new World();
  handsfree.start();
  frameRate(desiredFrameRate);
  createCanvas(canvasWidth, canvasHeight);
  noStroke();
}

function keyTyped() {
  if (key === 'r' || key === 'R') {
    console.log("Restarting...");
    god = new God();
    world = new World();
    civilization = null;
    nukeIsGoingOff = false;
    nukeFallOffTiming = desiredFrameRate * 15;
    nukeLocation = null;
  }
}

function draw() {
  world.display();
  
  if(civilization != null) {
    civilization.display();
    
    if (updateCounter === simulationFrequency) {
      civilization.endTurn();
      updateCounter = 0;
      if(nukeFallOffTiming <= 0) {
        nukeIsGoingOff = false;
        nukeFallOffTiming = desiredFrameRate * 15;
      }
    } else {
      updateCounter++;
      if(nukeIsGoingOff) nukeFallOffTiming--;
    }

    let curGodPower;
    if(god.selectedPower == 0) curGodPower = "Create Farmland | Cost: 50 GP";
    else if(god.selectedPower == 1) curGodPower = "Create Forest  | Cost: 50 GP";
    else if(god.selectedPower == 2) curGodPower = "Death Touch  | Gain: 500 GP per Human";
    else if(god.selectedPower == 3) curGodPower = "Nuke | Cost: 2500 GP";

    fill("white");
    textSize(16);
    text(`Food: ${civilization.food}\nWood: ${civilization.wood}\nHumans: ${civilization.humans.length}\nGod Points: ${god.godPoints}\nGod Power: ${curGodPower}`, canvasWidth * 0.01, canvasHeight * 0.05);
  } else {
    fill("white");
    textSize(16);
    text("Pinch thumb and index finger where you want to start the civilization!", canvasWidth * 0.01, canvasHeight * 0.05);
  }  
  
  drawHands();
  
  if(nukeIsGoingOff) {
    image(nukePng, nukeLocation[0], nukeLocation[1]);
    const alphaValue = map(nukeFallOffTiming, desiredFrameRate * 15, 0, 255, 0);
    fill(255, alphaValue);
    rect(0, 0, canvasWidth, canvasHeight);
  }
  
  //console.log("FAll Off: " + nukeFallOffTiming);
  
  //console.log('FPS: ' + Math.round(frameRate()));
}

function createCivilization(x, y, tileX, tileY) {
  if (civilization == null) {
    if (world.tiles[tileY][tileX]?.type != 'land') {
      return;
    } else {
      civilization = new Civilization(x, y);
    }
  }
}

function drawHands() {
  const hands = handsfree.data?.hands;

  if (!hands?.landmarks) return;
  
  stroke(god.powerColor);
  strokeWeight(4);

  for (let i = 0; i < hands.landmarks.length; i++) {
    const hand = hands.landmarks[i];

    // Thumb
    drawFingerBone(hand, 2, 3);
    drawFingerBone(hand, 3, 4);
    
    // Index
    drawFingerBone(hand, 5, 6);
    drawFingerBone(hand, 6, 7);
    drawFingerBone(hand, 7, 8);
    
    // Middle
    drawFingerBone(hand, 9, 10);
    drawFingerBone(hand, 10, 11);
    drawFingerBone(hand, 11, 12);
    
    // Ring
    drawFingerBone(hand, 13, 14);
    drawFingerBone(hand, 14, 15);
    drawFingerBone(hand, 15, 16);
    
    // Pinky
    drawFingerBone(hand, 17, 18);
    drawFingerBone(hand, 18, 19);
    drawFingerBone(hand, 19, 20);
    
    // Palm
    drawFingerBone(hand, 0, 1);
    drawFingerBone(hand, 1, 2);
    drawFingerBone(hand, 2, 5);
    drawFingerBone(hand, 5, 9);
    drawFingerBone(hand, 9, 13);
    drawFingerBone(hand, 13, 17);
    drawFingerBone(hand, 17, 0);
  }
  noStroke();
}

function drawFingerBone(hand, startLandmarkIndex, endLandmarkIndex) {
  if (hand && hand[startLandmarkIndex] && hand[endLandmarkIndex]) {
    const startLandmark = hand[startLandmarkIndex];
    const endLandmark = hand[endLandmarkIndex];
    line(
      canvasWidth - startLandmark.x * canvasWidth,
      startLandmark.y * canvasHeight,
      canvasWidth - endLandmark.x * canvasWidth,
      endLandmark.y * canvasHeight
    );
  }
}
