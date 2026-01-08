import {CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyParallelepiped } from './MyParallelepiped.js';

/**
 * MyBirdFoot
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyBirdFoot extends CGFobject {
    constructor(scene) {
        super(scene);
        this.init();
    }

    init() {
        this.leg = new MyParallelepiped(this.scene, 0.8, 0.1, 0.1);
        this.toe = new MyParallelepiped(this.scene, 0.3, 0.1, 0.1);

        this.feetMaterial = new CGFappearance(this.scene);
        this.feetMaterial.setAmbient(0.8, 0.5, 0.2, 1);
        this.feetMaterial.setDiffuse(0.8, 0.5, 0.2, 1);
        this.feetMaterial.setSpecular(0, 0, 0, 0);
        this.feetMaterial.setShininess(10.0);
        this.feetMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 0, 0, 1);
        this.scene.rotate(Math.PI/4, 0, 0, 1);

        this.feetMaterial.apply();

        // Leg
        this.scene.pushMatrix();
        this.leg.display();
        this.scene.popMatrix();

        // Toes
        this.scene.pushMatrix();
        this.scene.translate(0.45, -0.1, 0);
        this.scene.rotate(-Math.PI/2, 0, 0, 1);

        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.1);
        this.scene.rotate(Math.PI/8, 0, 1, 0);
        this.toe.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0);
        this.toe.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.1);
        this.scene.rotate(-Math.PI/8, 0, 1, 0);
        this.toe.display();
        this.scene.popMatrix();

        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}