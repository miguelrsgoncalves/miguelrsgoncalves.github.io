import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MyTerrain } from "./MyTerrain.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBird } from "./MyBird.js";
import { MyBirdEgg } from "./MyBirdEgg.js";
import { MyNest } from "./MyNest.js";
import { MyBillboard } from "./MyBillboard.js";
import { MyTreeGroupPatch } from "./MyTreeGroupPatch.js";
import { MyTreeRowPatch } from "./MyTreeRowPatch.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }
  
  init(application) {
    super.init(application);
    
    this.initCameras();
    this.initLights();
    this.initAnim();

    //Background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.updatePeriod = 50;

    // Initialize auxiliary variables
    this.birdScale = 0.3;
    this.terrainHeight = -66.7;
    this.terrainX = 30; // coords terrain plane zone
    this.terrainZ = 70; // coords terrain plane zone
    this.terrainOffset = ((400 / 3) / 2) - 15;
    this.eggNumber = 5;
    this.treeGroupPatchNumber = 3;
    this.isDroppingEgg = false;
    this.fallingEgg = null;
    this.fallingEggTarget = [];
    this.fallingEggInit = [];    
    
    //Initialize scene objects
    this.axis = new CGFaxis(this);
    this.terrain = new MyTerrain(this);
    this.panorama = new MyPanorama(this, 'images/panorama4.jpg');
    this.bird = new MyBird(this, this.birdScale, this.updatePeriod, this.terrainHeight);
    this.nest = new MyNest(this, 20, this.terrainHeight, 50);
    this.birdEggs = [];
    this.birdEggTransformations = [];
    this.treeGroupPatch1 = new MyTreeGroupPatch(this, 10, 5);
    this.treeGroupPatch2 = new MyTreeGroupPatch(this, 10, 5);
    this.treeGroupPatch3 = new MyTreeGroupPatch(this, 10, 5);
    this.treeGroupRow1 = new MyTreeRowPatch(this, 10, 5);
    this.treeGroupRow2 = new MyTreeRowPatch(this, 10, 5);
    this.treeGroupRow3 = new MyTreeRowPatch(this, 10, 5);
    
    for(var i = 0; i < this.eggNumber; i++){
      var eggX = this.terrainX + (Math.random() * (this.terrainOffset - (-this.terrainOffset)) + (-this.terrainOffset));
      var eggY = this.terrainHeight;
      var eggZ = this.terrainZ + (Math.random() * (this.terrainOffset - (-this.terrainOffset)) + (-this.terrainOffset));
      var eggRot = Math.random()*2*Math.PI;
      this.birdEggs[i] = new MyBirdEgg(this, eggX, eggY, eggZ, eggRot);
    }
    
    // Initialize auxiliary egg falling trajectory variables
    this.eggDropStartingTime = 0;
    this.tFall = 0;
    this.fallingEggVelocity = 0;
    this.gravityAcceleration = -10;
    this.velocityImpulse = 5;
    this.fallingEggVelocXInit = this.bird.velocity / this.birdScale; // * Math.sin(this.bird.orientation);
    this.fallingEggVelocZInit = this.bird.velocity / this.birdScale; // * Math.cos(this.bird.orientation);
    
    // Distance of the camera from the bird in third person
    this.offsetBehind = 10;
    this.offsetAbove = 5;
    this.offsetFront = 20; // Target
    
    // Objects connected to MyInterface
    this.displayAxis = true;
    this.linkCameraBird = true;
    this.birdOnOrigin = false;
    this.speedFactor = 1;
    this.scaleFactor = 1;

    // Set bird next to terrain at the beginning of the scene
    this.bird.position[1] = (this.bird.height + this.bird.distanceBirdToGround * this.birdScale) / this.birdScale;

    document.getElementById('eggNotInNestCount').textContent = this.eggNumber;

    this.enableTextures(true);
  }

  initAnim() {
    this.setUpdatePeriod(this.updatePeriod); // **at least** 50 ms between animations

    this.appStartTime = Date.now(); // current time in milisecs
  }

  initLights() {
    this.setGlobalAmbientLight(0.3, 0.3, 0.3, 1.0);

    this.lights[0].setPosition(15, 0, 5, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();

    this.lights[1].setPosition(0, 5, 0, 1);
    this.lights[1].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[1].enable();
    this.lights[1].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      1.5,
      0.1,
      1000,
      vec3.fromValues(50, 10, 15),
      vec3.fromValues(0, 0, 0)
    );
  }
  
  resetCamera() {
    if(!this.linkCameraBird) {
      this.camera.setPosition(vec3.fromValues(50, 10, 15));
      this.camera.setTarget(vec3.fromValues(0, 0, 0));
    }
  }

  changeBirdHeight() {
      // Set bird next to terrain if the checkbox if false
      // Else bird will be on the axis' origin
      if(!this.birdOnOrigin) this.bird.position[1] = (this.bird.height + this.bird.distanceBirdToGround * this.birdScale) / this.birdScale;
      else this.bird.position[1] = 0;
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }

  /**
   * Function to calculate the solutions of a quadratic equation.
   * If there are none, returns an empty array, else returns the values of the solutions in the array.
   * 
   * ax^2 + bx + c = 0
   */
  quadraticEquation(a, b, c) {
    
    var discriminant = b * b - 4 * a * c;
    
    if (discriminant > 0) {
      // Two real solutions
      var x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      var x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return [x1, x2]; 
    }
    else if (discriminant === 0) {
      // One real solution
      var x = -b / (2 * a);
      return [x]; 
    }
    else {
      // No real solutions
      return []; 
    }
  }

  /**
  * Updates the intial velocity variables of the falling egg in the x and z component
  * according to the free fall movement parametric equations.
  */
  calcInitialFallVelocity() {
    // Calculate the time its going to take for the egg to fall according to its initial and target position
    // According to the free fall parametric equations of y(t)
    // y(t) = y0 + (vy0 * t) + (1/2 * ay * t^2)
    var solutions = this.quadraticEquation((0.5 * this.gravityAcceleration), this.velocityImpulse, (this.fallingEggTarget[1] - this.fallingEggInit[1]));
    this.tFall = Math.max(...solutions);

    // Calculate the initial velocity in x and z
    // vx = (xf - xi) / t
    this.fallingEggVelocXInit = (this.fallingEggTarget[0] - this.fallingEggInit[0]) / this.tFall;
    this.fallingEggVelocZInit = (this.fallingEggTarget[2] - this.fallingEggInit[2]) / this.tFall;
  }

  /**
  * Checks if any of the eggs are within the bird's given range.
  * If the egg is within range: Returns the egg that is closest and removes egg from list of eggs
  */
  checkBirdDistanceToEggs() {
    var range = 2;
    var minDist = Number.MAX_VALUE;
    var egg = -1;

    for(var i = 0; i < this.eggNumber; i++){
      var dist = Math.sqrt(
        Math.pow((this.bird.position[0] * this.birdScale) - this.birdEggs[i].position[0], 2) + 
        Math.pow((this.bird.position[1] * this.birdScale) - this.birdEggs[i].position[1], 2) + 
        Math.pow((this.bird.position[2] * this.birdScale) - this.birdEggs[i].position[2], 2)
      );

      if(dist < minDist){
        minDist = dist;
        egg = i;
      }
    }

    if(minDist < range){
      this.eggNumber--;
      return this.birdEggs.splice(egg, 1)[0];
    }
    
  }

  /**
  * The bird drops the egg.
  * If the egg is close enough to the nest, the egg is positioned in the nest.
  * Else, the egg falls to the ground.
  */
  checkDropEgg() {
    var range = 2;
    var maxOffset = 0.35;
    
    // Saving the egg that we want to animate
    this.fallingEgg = this.bird.egg;

    // Check distance to nest
    var dist = Math.sqrt(
      Math.pow(this.nest.position[0] - this.bird.egg.position[0], 2) + 
      Math.pow(this.nest.position[1] - this.bird.egg.position[1], 2) + 
      Math.pow(this.nest.position[2] - this.bird.egg.position[2], 2)
    );

    // Update initial position of the falling egg trajectory
    this.fallingEggInit[0] = this.bird.egg.position[0];
    this.fallingEggInit[1] = this.bird.egg.position[1];
    this.fallingEggInit[2] = this.bird.egg.position[2];

    if(dist < range) {
      // The nest position becomes new target position for the egg to fall
      this.fallingEggTarget[0] = this.nest.position[0] + Math.random() * (maxOffset - (-maxOffset)) + (-maxOffset);
      this.fallingEggTarget[1] = this.terrainHeight;
      this.fallingEggTarget[2] = this.nest.position[2] + Math.random() * (maxOffset - (-maxOffset)) + (-maxOffset);
      
      // Add egg to the nest's eggs vector
      this.nest.eggs.push(this.bird.egg);
      this.nest.eggNumber++;
      document.getElementById('eggInNestCount').textContent = this.nest.eggNumber;
      document.getElementById('eggNotInNestCount').textContent = this.eggNumber;

      if(this.eggNumber == 0) document.getElementById('victoryMessage').style.display = 'block';
    }
    else {
      // The target position for the egg to fall will be directly under the egg (on the ground)
      this.fallingEggTarget[0] = this.bird.egg.position[0];
      this.fallingEggTarget[1] = this.terrainHeight;
      this.fallingEggTarget[2] = this.bird.egg.position[2];
      
      // Add egg to the eggs vector in the scene
      this.birdEggs.push(this.bird.egg);
      this.eggNumber++;
    }

    // Change egg rotation to not look so perfect
    this.bird.egg.orientation = Math.random()*2*Math.PI;

    // Calculates initial velocity for the falling egg
    this.calcInitialFallVelocity();

    // Remove egg from bird
    this.bird.egg = null;

    // Starting the animation for the egg drop
    this.isDroppingEgg = true;

    // Gets the time at the start of the egg drop
    this.eggDropStartingTime = Date.now();
  }

  checkKeys() {
    // Check for key codes e.g. in https://keycode.info/
    if (this.gui.isKeyPressed("KeyW")) {
      this.bird.accelerate(1/2);
    }

    if (this.gui.isKeyPressed("KeyS")) {
      this.bird.accelerate(-1/2);
    }

    if (this.gui.isKeyPressed("KeyA")) {
      this.bird.turn(Math.PI / 2);
    }

    if (this.gui.isKeyPressed("KeyD")) {
      this.bird.turn(-Math.PI / 2);
    }

    if(this.gui.isKeyPressed("KeyR")) {
      this.bird.reset();
    }

    if(this.gui.isKeyPressed("KeyP") && (!this.bird.hasEgg)) {
      this.bird.isPickingEgg = true;
    }

    if(this.gui.isKeyPressed("KeyO") && this.bird.hasEgg && !this.isDroppingEgg) {
      this.bird.dropEgg();
    }

    if(this.gui.isKeyPressed("KeyE")) {
      document.getElementById('victoryMessage').style.display = 'none';
    }
  }

  update(t) {
    // Calculate elapsed time since the app started
    var elapsedTimeSecs = (t - this.appStartTime) / 1000.0;

    this.bird.update(elapsedTimeSecs);

    // Change the camera settings to use third person
    if(this.linkCameraBird) {
      var pos0 = (this.bird.position[0] - (this.offsetBehind * Math.cos(this.bird.orientation))) * this.birdScale;
      var pos1 = (this.bird.position[1] + this.offsetAbove)  * this.birdScale;
      var pos2 = (this.bird.position[2] + (this.offsetBehind * Math.sin(this.bird.orientation))) * this.birdScale;
      
      var targ0 = (this.bird.position[0] + (this.offsetFront * Math.cos(this.bird.orientation))) * this.birdScale;
      var targ1 = (this.bird.position[1]) * this.birdScale;
      var targ2 = (this.bird.position[2] - (this.offsetFront * Math.sin(this.bird.orientation))) * this.birdScale;
      
      this.camera.setPosition(vec3.fromValues(pos0, pos1, pos2));
      
      this.camera.setTarget(vec3.fromValues(targ0, targ1, targ2));
    }
    
    // Check Keys Pressed
    this.checkKeys();

    // Bird Dropping Egg Animation

    if(this.isDroppingEgg) {
      // Time Since the Animation started (for the parabola equations)
      var timeSinceDrop = (t - this.eggDropStartingTime) / 1000.0;
      
      
      // Parametric Equations of the parabolic trajectory of the falling egg
      // x(t)
      this.fallingEgg.position[0] = this.fallingEggInit[0] + (this.fallingEggVelocXInit * timeSinceDrop);
      // y(t)
      this.fallingEgg.position[1] = this.fallingEggInit[1] + (this.velocityImpulse * timeSinceDrop) + (0.5 * this.gravityAcceleration * (timeSinceDrop**2));
      // z(t)
      this.fallingEgg.position[2] = this.fallingEggInit[2] + (this.fallingEggVelocZInit * timeSinceDrop);
      // vy(t)
      this.fallingEggVelocity = this.velocityImpulse + (this.gravityAcceleration * timeSinceDrop);
      
      // Stop condition: when the egg reaches its target height
      if(this.fallingEgg.position[1] <= this.fallingEggTarget[1]) {
        this.isDroppingEgg = false;
      }
      
    }
  }

  updateSpeedFactor() {    
    this.bird.velocity *= this.speedFactor;
    this.bird.velocityRate = this.bird.velocityInitialRate / this.speedFactor;
    this.bird.orientationRate = this.bird.orientationInitialRate / this.speedFactor;
  }

  display() {

    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    if (this.displayAxis) this.axis.display();

    this.setDefaultAppearance();

    // ---- BEGIN Primitive drawing section

    // TERRAIN
    this.pushMatrix();
    this.terrain.display();
    this.popMatrix();
    
    this.setDefaultAppearance();
    
    // PANORAMA
    this.pushMatrix();
    this.translate(this.camera.position[0], this.camera.position[1], this.camera.position[2]);
    this.panorama.display();
    this.popMatrix();

    this.setDefaultAppearance();
    
    // BIRD
    this.pushMatrix();
    this.scale(this.birdScale, this.birdScale, this.birdScale);
    this.bird.display();
    this.popMatrix();

    this.setDefaultAppearance();

    // EGGS
    for(var i = 0; i < this.eggNumber; i++){
      this.pushMatrix();
      this.translate(this.birdEggs[i].position[0], this.birdEggs[i].position[1], this.birdEggs[i].position[2]);
      this.rotate(this.birdEggs[i].orientation, 0, 1, 0);
      this.rotate(this.birdEggs[i].orientation, 1, 0, 0);
      this.birdEggs[i].display();
      this.popMatrix();
    }

    this.setDefaultAppearance();

    // NEST
    this.pushMatrix();
    this.translate(this.nest.position[0], this.nest.position[1], this.nest.position[2]);
    this.nest.display();
    this.popMatrix();
    
    // EGGS IN NEST
    for(var i = 0; i < this.nest.eggNumber; i++){
      this.pushMatrix();
      this.translate(this.nest.eggs[i].position[0], this.nest.eggs[i].position[1], this.nest.eggs[i].position[2]);
      this.rotate(this.nest.eggs[i].orientation, 0, 1, 0);
      this.rotate(this.nest.eggs[i].orientation, 1, 0, 0);
      this.nest.eggs[i].display();
      this.popMatrix();
    }

    this.setDefaultAppearance();
    
    // TREE GROUP PATCH
    this.pushMatrix();
    this.treeGroupPatch1.display(this.terrainX + 20, this.terrainHeight, this.terrainZ + 20);
    this.treeGroupPatch2.display(this.terrainX, this.terrainHeight, this.terrainZ - 40);
    this.treeGroupPatch3.display(this.terrainX - 50, this.terrainHeight, this.terrainZ + 10);
    this.popMatrix();

    // TREE ROW PATCH
    this.pushMatrix();
    this.treeGroupRow1.display(this.terrainX - 40, this.terrainHeight, this.terrainZ -10);
    this.popMatrix();

    this.pushMatrix();
    this.treeGroupRow2.display(this.terrainX - this.terrainOffset, this.terrainHeight, this.terrainZ - this.terrainOffset);
    this.popMatrix();

    this.pushMatrix();
    this.treeGroupRow3.display(this.terrainX - this.terrainOffset, this.terrainHeight, this.terrainZ + this.terrainOffset);
    this.popMatrix();

    this.setDefaultAppearance();

    // ---- END Primitive drawing section
  }
}
