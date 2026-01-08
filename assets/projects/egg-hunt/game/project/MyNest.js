import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyTorus } from "./MyTorus.js";

/**
 * MyNest
 * @constructor
 * @param scene - Reference to MyScene object
 * @param posX - Position x coordinate
 * @param posY - Position y coordinate
 * @param posZ - Position z coordinate
 */

export class MyNest extends CGFobject {
    constructor(scene, posX, posY, posZ) {
        super(scene);
        this.position = [posX, posY, posZ];
        this.eggs = [];
        this.eggNumber = 0;
        this.init();
    }

    init(){
        this.nest = new MyTorus(this.scene, 0.4, 1.0, 50, 50);

        this.nestMaterial = new CGFappearance(this.scene);
        this.nestMaterial.setAmbient(0.5, 0.4, 0.3, 1.0);
        this.nestMaterial.setDiffuse(0.5, 0.4, 0.3, 1.0);
        this.nestMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.nestMaterial.setShininess(10.0);
        this.nestMaterial.loadTexture('images/nestTexture.jpg');
        this.nestMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();

        this.nestMaterial.apply();

        this.scene.rotate(-Math.PI/2, 1, 0, 0);

        this.nest.display();

        this.scene.popMatrix();
    }
}