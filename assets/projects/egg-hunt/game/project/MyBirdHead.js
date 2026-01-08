import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyPyramid } from "./MyPyramid.js";
import { MySphere } from "./MySphere.js";

/**
 * MyBirdHead
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyBirdHead extends CGFobject {
    constructor(scene) {
        super(scene);
        this.init();
    }

    init() {
        this.head = new MySphere(this.scene, 50, 50, false, 3);
        this.beak = new MyPyramid(this.scene, 3, 5);
        this.eye = new MySphere(this.scene, 50, 50, false, 1);

        this.beackMaterial = new CGFappearance(this.scene);
        this.beackMaterial.setAmbient(0.8, 0.5, 0.2, 1);
        this.beackMaterial.setDiffuse(0.8, 0.5, 0.2, 1);
        this.beackMaterial.setSpecular(0.5, 0.5, 0.5, 1);
        this.beackMaterial.setShininess(10.0);

        this.eyesMaterial = new CGFappearance(this.scene);
        this.eyesMaterial.setAmbient(0.0, 0.0, 0.0, 1.0);
        this.eyesMaterial.setDiffuse(0.0, 0.0, 0.0, 1.0);
        this.eyesMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.eyesMaterial.setShininess(10.0);
    }

    display() {
        this.scene.pushMatrix();

        // Head
        this.head.display();

        // Beak
        this.scene.pushMatrix();
        this.scene.translate(0.9, 0, 0);
        this.scene.scale(0.6, 0.3, 0.3);
        this.scene.rotate(-Math.PI/2, 0, 0, 1);
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.beackMaterial.apply();
        this.beak.display();
        this.scene.popMatrix();

        // Right eye
        this.scene.pushMatrix();
        this.scene.translate(0.65, 0.25, 0.6);
        this.scene.scale(0.2, 0.2, 0.2);
        this.eyesMaterial.apply();
        this.eye.display();
        this.scene.popMatrix();

        // Left eye
        this.scene.pushMatrix();
        this.scene.translate(0.65, 0.25, -0.6);
        this.scene.scale(0.2, 0.2, 0.2);
        this.eyesMaterial.apply();
        this.eye.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}