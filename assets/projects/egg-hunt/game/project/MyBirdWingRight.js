import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyDistortedParallelopiped } from "./MyDistortedParallelopiped.js";

/**
 * MyBirdWingRight
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyBirdWingRight extends CGFobject {
    constructor(scene) {
        super(scene);

        this.base = 1.5;
        this.height = 1;
        this.skew = 0.5;
        this.depth = 0.3;
        this.altitude = 0.5;

        this.init();
    }

    init() {
        this.arm = new MyDistortedParallelopiped(this.scene, this.base, this.height, this.skew, this.depth, this.altitude);
        this.forearm = new MyDistortedParallelopiped(this.scene, this.base, this.height, this.skew, this.depth, -this.altitude);
    }

    display() {
        this.scene.pushMatrix();
        
        // Arm
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.arm.display();
        this.scene.popMatrix();
        
        // Forearm
        this.scene.pushMatrix();
        this.scene.translate(this.base - this.skew*1.2, 0, this.height + this.skew/2.5);
        this.scene.translate(this.base, this.depth, 0);
        this.scene.rotate(2* Math.atan(this.height/this.skew), 0, 1, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.forearm.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
}