import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";

/**
 * MyPanorama
 * @constructor
 * @param scene - Reference to MyScene object
 * @param texture - Path to texture image
 */
export class MyPanorama extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.init(texture);
    }

    init(texture) {
        this.sphere = new MySphere(this.scene, 50, 50, true, 1);

        this.sphereMaterial = new CGFappearance(this.scene);
        this.sphereMaterial.setAmbient(0, 0, 0, 1);
        this.sphereMaterial.setDiffuse(0, 0, 0, 1);
        this.sphereMaterial.setSpecular(0, 0, 0, 1);
        this.sphereMaterial.setEmission(1, 1, 1, 1); // the material only has emissive component
        this.sphereMaterial.setShininess(0.0);
        this.sphereMaterial.loadTexture(texture);
        this.sphereMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();
        
        this.scene.scale(250,250,250);
        this.sphereMaterial.apply();
        this.sphere.display();
        
        this.scene.popMatrix();
    }
}