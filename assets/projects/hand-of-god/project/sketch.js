let desiredFrameRate = 60;
let grid_columns = 100;
let grid_rows;
let tileSize;
let canvasWidth;
let canvasHeight;

let simulationFrequency = desiredFrameRate / 20;
let updateCounter = 0;
let god;
let world;
let civilization;
let world_graphics_buffer; 

let firePng;
let nukePng;
let backgroundPng;

let nukeIsGoingOff = false;
let nukeFallOffTiming = desiredFrameRate * 15;
let nukeLocation = null;

let hud_container;
let worldSizeSlider;

let game_state = "LOADING_MODELS"; 

let currentHoverKey = null;
let hoverProgress = 0;
let holdDurationFrames = 60;

function preload() {
  firePng = loadImage('fire.png');
  nukePng = loadImage('nuke.png');
  backgroundPng = loadImage('background.png');
}

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);
  frameRate(desiredFrameRate);
  noStroke();

  worldSizeSlider = createSlider(25, 500, 100, 1);
  worldSizeSlider.style('position', 'absolute');
  worldSizeSlider.style('display', 'none');
  worldSizeSlider.style('accent-color', '#fbbf24');
  worldSizeSlider.style('width', '340px');

  checkCameraPermissions();
}

function checkCameraPermissions() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      stream.getTracks().forEach(track => track.stop());
      
      game_state = "LOADING_MODELS";
      let statusText = document.getElementById("loading_status_text");
      let subText = document.getElementById("loading_sub_text");
      if (statusText) statusText.innerText = "Loading hand recognition software...";
      if (subText) subText.innerText = "This might take some time";
      
      setTimeout(() => {
        initializeHandsfree();
      }, 1000);
    })
    .catch((err) => {
      triggerCameraError();
    });
}

function initializeHandsfree() {
  handsfree = new Handsfree({
    hands: { enabled: true, maxNumHands: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.8 }
  });
  
  handsfree.plugin.pinchScroll.disable();
  handsfree.model.hands.getData = handsfree.throttle(handsfree.model.hands.getData, 1000 / 30);
  
  handsfree.use('hand-of-god', (data) => {
    if (game_state === "LOADING_MODELS") {
      game_state = "MENU";
      let loadingScreen = document.getElementById("game_loading_screen");
      if (loadingScreen) loadingScreen.style.display = "none";
    }

    if (game_state !== "PLAYING") return;
    if (!data.hands || !god) return;
    
    let judgmentHandLandmarks;
    let thumb, index, middle, ring, pinky;
    
    if (handsfree.data?.hands?.multiHandedness != undefined && handsfree.data.hands.landmarks != null) {
      judgmentHandLandmarks = handsfree.data.hands.multiHandLandmarks[0];
      
      if (handsfree.data.hands.gesture != undefined) {
        let gestureIndex = handsfree.data.hands.gesture[0] ? 0 : 1;
        const handGesture = handsfree.data.hands.gesture[gestureIndex];
        
        if (handGesture) {
          thumb = handGesture.pose[0][1];
          index = handGesture.pose[1][1];
          middle = handGesture.pose[2][1];
          ring = handGesture.pose[3][1];
          pinky = handGesture.pose[4][1];
          
          let pinchState0 = handsfree.data.hands.pinchState?.[0]?.[0];
          let pinchState1 = handsfree.data.hands.pinchState?.[1]?.[0];

          if (pinchState0 === "held" || pinchState1 === "held") {
            const cursorX = (1 - judgmentHandLandmarks[8].x) * canvasWidth;
            const cursorY = judgmentHandLandmarks[8].y * canvasHeight;
            const tileX = Math.floor(cursorX / tileSize);
            const tileY = Math.floor(cursorY / tileSize);
            
            if (civilization == null) {
              createCivilization(cursorX, cursorY, tileX, tileY);
            } else {
              if (god.selectedPower == 2) image(firePng, cursorX - 20, cursorY - 25, 40, 50);
              god.usePower(judgmentHandLandmarks[8].x, judgmentHandLandmarks[8].y);
            }
          }
          else if (civilization) {
            if ((thumb === "Half Curl" || thumb === "Full Curl") && index === "No Curl" && (middle === "Half Curl" || middle === "Full Curl") && (ring === "Half Curl" || ring === "Full Curl") && (pinky === "Half Curl" || pinky === "Full Curl")) god.switchPower(0);
            if ((thumb === "Half Curl" || thumb === "Full Curl") && index === "No Curl" && middle === "No Curl" && (ring === "Half Curl" || ring === "Full Curl") && (pinky === "Half Curl" || pinky === "Full Curl")) god.switchPower(1);
            if ((thumb === "Half Curl" || thumb === "Full Curl") && index === "No Curl" && middle === "No Curl" && ring === "No Curl" && (pinky === "Half Curl" || pinky === "Full Curl")) god.switchPower(2);
            if ((thumb === "Half Curl" || thumb === "Full Curl") && index === "No Curl" && middle === "No Curl" && ring === "No Curl" && pinky === "No Curl") god.switchPower(3);
            
            if (god.selectedPower == 3) {
              fill(0, 0, 0, 32);
              circle((1 - judgmentHandLandmarks[8].x) * canvasWidth, judgmentHandLandmarks[8].y * canvasHeight, canvasWidth / 2);
            }
          }
        }
      }
    }
  });

  handsfree.start();
  document.addEventListener('handsfree-error', triggerCameraError);
}

function triggerCameraError() {
  game_state = "CAMERA_ERROR";
  let loadingScreen = document.getElementById("game_loading_screen");
  if (loadingScreen) loadingScreen.style.display = "flex";
  
  let spinner = document.getElementById("loading_spinner");
  if (spinner) spinner.style.display = "none";
  
  let statusText = document.getElementById("loading_status_text");
  if (statusText) {
    statusText.innerText = "Camera Access Denied";
    statusText.style.color = "#fbbf24";
  }
  
  let subText = document.getElementById("loading_sub_text");
  if (subText) {
    subText.innerText = "Make sure the game has permission to use the camera and restart the game";
  }
}

function calculateGrid() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  tileSize = canvasWidth / grid_columns;
  grid_rows = Math.ceil(canvasHeight / tileSize);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  if(game_state === "PLAYING") {
    calculateGrid();
    world.renderBuffer(); 
  }
}

function keyTyped() {
  if (key === 'r' || key === 'R') {
    if(hud_container) hud_container.remove();
    if(worldSizeSlider) worldSizeSlider.style('display', 'block');
    game_state = "MENU";
  }
}

function startGame() {
  game_state = "GENERATING_WORLD";
  
  if (worldSizeSlider) worldSizeSlider.style('display', 'none');

  let worldLoadingScreen = document.getElementById("world_loading_screen");
  if (worldLoadingScreen) worldLoadingScreen.style.display = "flex";

  setTimeout(() => {
    calculateGrid();
    god = new God();
    world = new World(grid_columns, grid_rows);
    civilization = null;
    nukeIsGoingOff = false;
    createHUDOverlay();

    if (worldLoadingScreen) worldLoadingScreen.style.display = "none";
    game_state = "PLAYING";
  }, 1);
}

function createHUDOverlay() {
  hud_container = createDiv();
  hud_container.addClass('hand_of_god_hud');
}

function updateHUD() {
  if (!hud_container) return;

  if (civilization != null) {
    let powerNames = ["Farm (-50 GP)", "Forest (-50 GP)", "Death Touch (+500 GP)", "Nuke (-2500 GP)"];
    let powersHTML = powerNames.map((pName, index) => {
      let activeClass = god.selectedPower === index ? 'active_power_button' : '';
      return `<button class="power_button ${activeClass}" onclick="god.switchPower(${index})">${pName}</button>`;
    }).join('');

    hud_container.html(`
      <div class="hud_statistics">
        <div class="statistic_entry">🌾 <span>${civilization.food}</span></div>
        <div class="statistic_entry">🪵 <span>${civilization.wood}</span></div>
        <div class="statistic_entry">👥 <span>${civilization.humans.length}</span></div>
        <div class="statistic_entry god_points_text">✨ <span>${god.godPoints} GP</span></div>
      </div>
      <div class="hud_powers_container">
        ${powersHTML}
      </div>
    `);
  } else {
    hud_container.html(`
      <div class="hud_prompt_text">
        <span>🤏 Pinch index finger & thumb to place your civilization!</span>
      </div>
    `);
  }
}

function draw() {
  if (game_state === "MENU") {
    drawMenu();
  } else if (game_state === "PLAYING") {
    drawGame();
  }
}

function drawMenu() {
  if (backgroundPng) {
    push();
    drawingContext.filter = 'blur(12px)';
    image(backgroundPng, 0, 0, canvasWidth, canvasHeight);
    pop();
    fill(13, 17, 23, 180);
    rect(0, 0, canvasWidth, canvasHeight);
  } else {
    background(13, 17, 23);
  }

  push();
  textStyle(BOLD);
  fill(251, 191, 36);
  textAlign(CENTER, CENTER);
  textSize(44);
  text("Hand of God", canvasWidth / 2, canvasHeight * 0.12);
  pop();

  fill(255);
  textSize(24);
  text("Choose World Size", canvasWidth / 2, canvasHeight * 0.20);
  textSize(15);
  fill(150, 160, 180);
  text("Hold your index finger over an option", canvasWidth / 2, canvasHeight * 0.25);

  let menu_options = [
    { key: "preset_50", label: "Small (50 Tiles)", cols: 50, y: canvasHeight * 0.38 },
    { key: "preset_100", label: "Medium (100 Tiles)", cols: 100, y: canvasHeight * 0.50 },
    { key: "preset_200", label: "Large (200 Tiles)", cols: 200, y: canvasHeight * 0.62 }
  ];

  let cursorX = mouseX;
  let cursorY = mouseY;
  let isInteracting = mouseIsPressed;

  if (handsfree && handsfree.data?.hands?.landmarks && handsfree.data.hands.multiHandLandmarks?.[0]) {
    cursorX = (1 - handsfree.data.hands.multiHandLandmarks[0][8].x) * canvasWidth;
    cursorY = handsfree.data.hands.multiHandLandmarks[0][8].y * canvasHeight;
    isInteracting = true;
  }

  let activeHoverKey = null;

  for (let option of menu_options) {
    let btnW = 340;
    let btnH = 60;
    let btnX = canvasWidth / 2 - btnW / 2;
    let btnY = option.y - btnH / 2;
    let hovered = cursorX > btnX && cursorX < btnX + btnW && cursorY > btnY && cursorY < btnY + btnH;

    fill(30, 41, 59, 220);
    rect(btnX, btnY, btnW, btnH, 12);

    let fillWidth = 0;
    if (hovered) {
      activeHoverKey = option.key;
      if (currentHoverKey === activeHoverKey) {
        hoverProgress += 1 / holdDurationFrames;
      } else {
        currentHoverKey = activeHoverKey;
        hoverProgress = 1 / holdDurationFrames;
      }

      fillWidth = btnW * constrain(hoverProgress, 0, 1);
      fill(251, 191, 36, 220);
      rect(btnX, btnY, fillWidth, btnH, 12);

      if (hoverProgress >= 1.0) {
        if(worldSizeSlider) worldSizeSlider.style('display', 'none');
        grid_columns = option.cols;
        startGame();
        currentHoverKey = null;
        hoverProgress = 0;
        return;
      }
    }

    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(option.label, canvasWidth / 2, option.y);

    if (fillWidth > 0) {
      push();
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(btnX, btnY, fillWidth, btnH);
      drawingContext.clip();

      fill(0);
      textSize(18);
      textAlign(CENTER, CENTER);
      text(option.label, canvasWidth / 2, option.y);

      drawingContext.restore();
      pop();
    }
  }

  if (worldSizeSlider) {
    let sliderX = canvasWidth / 2 - 170;
    let sliderY = canvasHeight * 0.74;
    worldSizeSlider.style('display', 'block');
    worldSizeSlider.position(sliderX, sliderY);

    let sliderHovered = cursorX > sliderX && cursorX < sliderX + 340 && cursorY > sliderY - 20 && cursorY < sliderY + 40;
    if (sliderHovered && isInteracting) {
      let normalizedX = constrain((cursorX - sliderX) / 340, 0, 1);
      let val = Math.round(25 + normalizedX * (500 - 25));
      worldSizeSlider.value(val);
    }

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(`Custom Size: ${worldSizeSlider.value()} Tiles`, canvasWidth / 2, sliderY - 25);

    let btnW = 340;
    let btnH = 50;
    let btnX = canvasWidth / 2 - btnW / 2;
    let btnY = canvasHeight * 0.81;
    let hovered = cursorX > btnX && cursorX < btnX + btnW && cursorY > btnY && cursorY < btnY + btnH;

    fill(30, 41, 59, 220);
    rect(btnX, btnY, btnW, btnH, 12);

    let fillWidthCustom = 0;
    if (hovered) {
      activeHoverKey = "custom_start";
      if (currentHoverKey === activeHoverKey) {
        hoverProgress += 1 / holdDurationFrames;
      } else {
        currentHoverKey = activeHoverKey;
        hoverProgress = 1 / holdDurationFrames;
      }

      fillWidthCustom = btnW * constrain(hoverProgress, 0, 1);
      fill(251, 191, 36, 220);
      rect(btnX, btnY, fillWidthCustom, btnH, 12);

      if (hoverProgress >= 1.0) {
        if(worldSizeSlider) worldSizeSlider.style('display', 'none');
        grid_columns = int(worldSizeSlider.value());
        startGame();
        currentHoverKey = null;
        hoverProgress = 0;
        return;
      }
    }

    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("Start with Custom Size", canvasWidth / 2, btnY + btnH / 2);

    if (fillWidthCustom > 0) {
      push();
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(btnX, btnY, fillWidthCustom, btnH);
      drawingContext.clip();

      fill(0);
      textSize(18);
      textAlign(CENTER, CENTER);
      text("Start with Custom Size", canvasWidth / 2, btnY + btnH / 2);

      drawingContext.restore();
      pop();
    }
  }

  if (!activeHoverKey) {
    hoverProgress = max(0, hoverProgress - 0.05);
    if (hoverProgress === 0) {
      currentHoverKey = null;
    }
  }

  drawHands();
}

function drawGame() {
  image(world_graphics_buffer, 0, 0);
  
  if (civilization != null) {
    civilization.display();
    if (updateCounter === simulationFrequency) {
      civilization.endTurn();
      updateCounter = 0;
      if (nukeFallOffTiming <= 0) {
        nukeIsGoingOff = false;
        nukeFallOffTiming = desiredFrameRate * 15;
      }
    } else {
      updateCounter++;
      if (nukeIsGoingOff) nukeFallOffTiming--;
    }
  }
  
  updateHUD();
  drawHands();
  
  if (nukeIsGoingOff) {
    if (nukeLocation) image(nukePng, nukeLocation[0], nukeLocation[1]);
    fill(255, map(nukeFallOffTiming, desiredFrameRate * 15, 0, 255, 0));
    rect(0, 0, canvasWidth, canvasHeight);
  }
}

function createCivilization(x, y, tileX, tileY) {
  if (civilization == null && world.tiles[tileX] && world.tiles[tileX][tileY] && world.tiles[tileX][tileY].type === 'land') {
    civilization = new Civilization(x, y);
  }
}

function drawHands() {
  const hands = handsfree?.data?.hands;
  if (!hands?.landmarks) return;
  
  stroke(god ? god.powerColor : "white");
  strokeWeight(4);

  for (let i = 0; i < hands.landmarks.length; i++) {
    const hand = hands.landmarks[i];
    drawFingerBone(hand, 2, 3); drawFingerBone(hand, 3, 4);
    drawFingerBone(hand, 5, 6); drawFingerBone(hand, 6, 7); drawFingerBone(hand, 7, 8);
    drawFingerBone(hand, 9, 10); drawFingerBone(hand, 10, 11); drawFingerBone(hand, 11, 12);
    drawFingerBone(hand, 13, 14); drawFingerBone(hand, 14, 15); drawFingerBone(hand, 15, 16);
    drawFingerBone(hand, 17, 18); drawFingerBone(hand, 18, 19); drawFingerBone(hand, 19, 20);
    drawFingerBone(hand, 0, 1); drawFingerBone(hand, 1, 2); drawFingerBone(hand, 2, 5);
    drawFingerBone(hand, 5, 9); drawFingerBone(hand, 9, 13); drawFingerBone(hand, 13, 17); drawFingerBone(hand, 17, 0);
  }
  noStroke();
}

function drawFingerBone(hand, startIdx, endIdx) {
  if (hand && hand[startIdx] && hand[endIdx]) {
    line(
      canvasWidth - hand[startIdx].x * canvasWidth, hand[startIdx].y * canvasHeight,
      canvasWidth - hand[endIdx].x * canvasWidth, hand[endIdx].y * canvasHeight
    );
  }
}