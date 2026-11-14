import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";
import { MyBirdHead } from "./MyBirdHead.js";
import { MyBirdWingLeft } from "./MyBirdWingLeft.js";
import { MyBirdWingRight } from "./MyBirdWingRight.js";
import { MyPyramid } from "./MyPyramid.js";
import { MyBirdFoot } from "./MyBirdFoot.js";

/**
 * MyBird
 * @constructor
 * @param scene - Reference to MyScene object
 * @param birdScale - Scale Factor for the bird
 * @param updatePeriod - Update period of the display function (ms)
 * @param terrainHeight - Y coordinate of the terrain
 */

export class MyBird extends CGFobject {
    constructor(scene, birdScale, updatePeriod, terrainHeight) {
        super(scene);
        this.init();

        this.birdScale = birdScale;
        this.updatePeriod = updatePeriod;
        this.height = terrainHeight;

        this.distanceBirdToGround = 3;
        
        this.egg = null;

        this.orientation = 0;
        this.velocity = 0;
        this.position = [0, 0, 0];

        this.velocityMax = 15;
        this.velocityInitialRate = 8;
        this.velocityRate = this.velocityInitialRate;

        this.orientationInitialRate = 16;
        this.orientationRate = this.orientationInitialRate;

        this.OscAnimVal = 0;
        this.WingAnimVal = 0;
        this.amplitude = 0.5;
        this.animDurationSecs = 1;

        this.hasEgg = false;
        this.isPickingEgg = false;
        this.PickAnimVal = 0;
        this.BirdInclination = 0;
        this.pickingEggAnimDuration = 1;
        this.pickingEggUpdatePeriodIncremental = this.distanceBirdToGround / ((this.pickingEggAnimDuration * 1000) / this.updatePeriod);
    }

    init() {
        this.torso = new MySphere(this.scene, 50, 50, false, 3);
        this.head = new MyBirdHead(this.scene);
        this.wingLeft = new MyBirdWingLeft(this.scene);
        this.wingRight = new MyBirdWingRight(this.scene);
        this.tail = new MyPyramid(this.scene, 4, 4);
        this.foot = new MyBirdFoot(this.scene);

        this.birdMaterial = new CGFappearance(this.scene);
        this.birdMaterial.setAmbient(0.3, 0.4, 0.7, 1.0);
        this.birdMaterial.setDiffuse(0.3, 0.4, 0.7, 1.0);
        this.birdMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.birdMaterial.setShininess(10.0);
        this.birdMaterial.loadTexture('images/feathertexture.jpg');
        this.birdMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    pickEgg() {
        // check if any egg is within range to pick up
        // if egg is picked up, egg is transfered to bird
        this.egg = this.scene.checkBirdDistanceToEggs();

        if((this.egg != undefined) && (this.egg != null)){
            this.hasEgg = true;
        }
    }

    dropEgg() {
        // update egg position before dropping
        this.egg.position[0] = (this.position[0] - 0.5) * this.birdScale;
        this.egg.position[1] = (this.position[1] - 1.6) * this.birdScale;
        this.egg.position[2] = (this.position[2] - 0.15) * this.birdScale;

        // remove egg from bird and pass it to scene        
        // egg ends up in nest if is close enough
        this.scene.checkDropEgg();

        this.hasEgg = false;
    }

    turn(v) {
        this.orientation += v / this.orientationRate;
    }

    accelerate(v) {
        if(this.velocity < this.velocityMax) {
            if (this.velocity >= 0)
                this.velocity += v / this.velocityRate;
                
            if (this.velocity < 0)
                this.velocity = 0;
        }
    }

    reset() {
        this.position = [0, 0, 0];
        this.velocity = 0;
        this.orientation = 0;
        this.BirdInclination = 0;
        this.isPickingEgg = false;
    }
    
    update(elapsedTimeSecs) {

        // CONTROLS
        // X
        this.position[0] += Math.cos(this.orientation) * this.velocity;
        // Z
        this.position[2] += -Math.sin(this.orientation) * this.velocity;


        // ANIMATION
        // Calculate the t in the oscillation
        var oscillationT = (elapsedTimeSecs % this.animDurationSecs) / this.animDurationSecs;

        // Update OscAnimVal using oscillation formula: x(t) = A.sin(wt)
        this.OscAnimVal = this.amplitude * Math.sin(oscillationT * 2 * Math.PI);

        // Wings Animation
        var wingAnimDuration = 1 / this.velocity;
        var oscillationTWing = (elapsedTimeSecs % wingAnimDuration) / wingAnimDuration;
        this.WingAnimVal = this.amplitude * Math.sin(oscillationTWing * 2 * Math.PI);

        
        // PICK EGG
        // Animation to go down to pick egg and come up to original height

        if(this.isPickingEgg){
            this.OscAnimVal = 0;
            this.BirdInclination = - Math.PI/6;

            this.PickAnimVal -= this.pickingEggUpdatePeriodIncremental;

            // Resets the variable
            if(this.PickAnimVal <= -this.distanceBirdToGround) {
                this.isPickingEgg = false;
                this.pickEgg();
            };
        }
        else if(this.PickAnimVal < 0) {
            this.OscAnimVal = 0;
            this.BirdInclination = Math.PI/6;
            
            this.PickAnimVal += this.pickingEggUpdatePeriodIncremental;
        }
        else {
            this.BirdInclination = 0;
        }

    }

    display() {
        this.scene.pushMatrix();

        // bird oscillation
        this.scene.translate(0, this.OscAnimVal, 0);        
        // bird movement
        this.scene.translate(this.position[0], this.position[1], this.position[2]);
        // bird rotation
        this.scene.rotate(this.orientation, 0, 1, 0);

        // bird movement to pick egg
        this.scene.translate(0, this.PickAnimVal, 0);
        // bird roinclination to pick egg
        this.scene.rotate(this.BirdInclination, 0, 0, 1);
        
        // Scene Scale Factor
        this.scene.scale(this.scene.scaleFactor, this.scene.scaleFactor, this.scene.scaleFactor);

        // Torso
        this.scene.pushMatrix();
        this.birdMaterial.apply();
        this.scene.scale(1.6, 1, 1);
        this.torso.display();
        this.scene.popMatrix();

        // Tail
        this.scene.pushMatrix();
        this.birdMaterial.apply();
        this.scene.translate(-2, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, 0, 1);
        this.scene.scale(0.5, 1, 1);
        this.tail.display();
        this.scene.popMatrix();

        // Feet
        this.scene.pushMatrix();
        this.scene.translate(-0.5, -0.8, 0);

        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.4);
        this.scene.rotate(-Math.PI/8, 0, 1, 0);
        this.foot.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.4);
        this.scene.rotate(Math.PI/8, 0, 1, 0);
        this.foot.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
        
        // Right Wing (z)
        this.scene.pushMatrix();
        // wing animation
        this.scene.rotate(this.WingAnimVal, 1, 0, 0);
        // transformations
        this.birdMaterial.apply();
        this.scene.translate(-0.4, 0, 0.7);
        this.scene.rotate(-Math.PI/2.5, 0, 1, 0);
        this.wingRight.display();
        this.scene.popMatrix();
        
        // Left Wing (-z)
        this.scene.pushMatrix();
        // wing animation
        this.scene.rotate(-this.WingAnimVal, 1, 0, 0);
        // tranformations
        this.birdMaterial.apply();
        this.scene.translate(-0.4, 0, -0.7);
        this.scene.rotate(Math.PI/2.5, 0, 1, 0);
        this.wingLeft.display();
        this.scene.popMatrix();

        // Head
        this.scene.pushMatrix();
        this.birdMaterial.apply();
        this.scene.translate(1.8, 0.6, 0);
        this.head.display()
        this.scene.popMatrix();

        // Egg
        if(this.hasEgg){
            this.scene.pushMatrix();
            this.scene.translate(-0.5, -1.6, -0.15);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.scene.scale(1/this.birdScale, 1/this.birdScale, 1/this.birdScale);
            this.egg.display();
            this.scene.popMatrix();
        }
        

        this.scene.popMatrix();
    }
}