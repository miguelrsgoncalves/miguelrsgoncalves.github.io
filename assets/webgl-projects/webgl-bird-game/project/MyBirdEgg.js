import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyElongatedSphere } from "./MyElongatedSphere.js";

/**
 * MyBirdEgg
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Position x coordinate
 * @param y - Position y coordinate
 * @param z - Position z coordinate
 * @param orientation - Angle of orientation
 */

export class MyBirdEgg extends CGFobject {
    constructor(scene, x, y, z, orientation) {
        super(scene);
        this.init();

        this.position = [x, y, z];
        this.orientation = orientation;
    }

    init(){
        this.egg = new MyElongatedSphere(this.scene, 50, 50, false, 1);

        this.eggMaterial = new CGFappearance(this.scene);
        this.eggMaterial.setAmbient(1.0, 1.0, 1.0, 1.0);
        this.eggMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.eggMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.eggMaterial.setShininess(10.0);
        this.eggMaterial.loadTexture('images/eggTexture.jpg');
        this.eggMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();

        this.eggMaterial.apply();

        this.scene.scale(0.2, 0.2, 0.2);
        this.egg.display();

        this.scene.popMatrix();
    }
}