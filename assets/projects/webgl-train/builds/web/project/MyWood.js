import { MyCylinderTotal } from "./MyCylinderTotal.js";

import {CGFobject, CGFappearance} from '../lib/CGF.js';
/**
 * MyWood
 * @constructor
 * @param scene - Reference to MyScene object
 */

export class MyWood extends CGFobject {
    constructor(scene) {
        super(scene);
        
        this.initMaterials(scene);

        //Initialize scene objects
        this.cylinder_1 = new MyCylinderTotal(scene, 20, 2, 0.2, this.woodMaterial);//raio de 0.9 unidades, e comprimento de 3.5 unidades
	}

    initMaterials(scene){
        this.woodMaterial = new CGFappearance(scene);
        this.woodMaterial.setAmbient(0.2, 0.2, 0.2, 1);
        this.woodMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.woodMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.woodMaterial.setShininess(10.0);
        this.woodMaterial.loadTexture('images/brown.png');
        this.woodMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }
    
    display(){
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI*0.5, 1,0,0);

        this.scene.pushMatrix();
        this.cylinder_1.display();
        this.scene.translate(-0.4, 0, 0);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0.4, 0, 0);
        this.cylinder_1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0.2, 0, -0.35);
        this.cylinder_1.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}