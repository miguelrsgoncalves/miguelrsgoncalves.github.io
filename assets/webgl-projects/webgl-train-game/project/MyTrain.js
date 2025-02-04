import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";
import { MyUnitCubeQuadTopless } from "./MyUnitCubeQuadTopless.js";
import { MyCylinderTotal } from "./MyCylinderTotal.js";
import { MyCylinderTopless } from "./MyCylinderTopless.js";
import { MySphere } from "./MySphere.js";
import { MyCrane } from "./MyCrane.js";

import { CGFscene, CGFcamera, CGFaxis, CGFappearance } from "../lib/CGF.js";


import {CGFobject} from '../lib/CGF.js';
/**
 * MyTangram
 * @constructor
 * @param scene - Reference to MyScene object
 */

export class MyTrain extends CGFobject {
    constructor(scene, trainX, trainY, trainZ) {
        super(scene);
        

        this.train_M_Path = 'images/red.png';
        this.wheel_M_Path = 'images/black.jpg';

        this.initMaterials(scene, this.wheel_M_Path, this.train_M_Path);

        //Initialize train objects
        this.sphere = new MySphere(scene, 10,12);

        this.cubeMap_1 = new MyUnitCubeQuad(scene, this.train_M_Path, this.train_M_Path, this.train_M_Path);
        this.cubeMap_2 = new MyUnitCubeQuad(scene, this.train_M_Path, this.train_M_Path, this.train_M_Path);
        this.box = new MyUnitCubeQuadTopless(scene, 'images/metal.jpg', 'images/metal.jpg');
        this.wheelRadius = 1;
        this.cylinder_1 = new MyCylinderTotal(scene, 20, 3.5, 0.9, this.trainMatirial);//raio de 0.9 unidades, e comprimento de 3.5 unidades
        this.cylinder_2 = new MyCylinderTopless(scene, 10, 2, 0.3, this.trainMatirial);
        this.wheelRadius = 0.75;
        this.cylinder_wheel_1 = new MyCylinderTotal(scene, 20, 0.2, this.wheelRadius, this.wheelMatirial); //diâmetro de 1.5 e largura 0.2 unidades
        this.cylinder_wheel_2 = new MyCylinderTotal(scene, 20, 0.2, this.wheelRadius, this.wheelMatirial); //diâmetro de 1.5 e largura 0.2 unidades
        this.cylinder_wheel_3 = new MyCylinderTotal(scene, 20, 0.2, this.wheelRadius, this.wheelMatirial); //diâmetro de 1.5 e largura 0.2 unidades
        this.cylinder_wheel_4 = new MyCylinderTotal(scene, 20, 0.2, this.wheelRadius, this.wheelMatirial); //diâmetro de 1.5 e largura 0.2 unidades
        this.crane = new MyCrane(scene);

        //train angle (changes according to the direction)
		this.angleTrain = 0;

        //car center coordinate variables (always tracking the center of the car)
		this.trainX = trainX;
		this.trainY = trainY;
		this.trainZ = trainZ;


	}

    initMaterials(scene, wheel_Matirial_Path, train_Matirial_Path, wrap = 'REPEAT'){
        this.wheelMatirial = new CGFappearance(scene);
        this.wheelMatirial.setAmbient(0.2, 0.2, 0.2, 1);
        this.wheelMatirial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.wheelMatirial.setSpecular(0.1, 0.1, 0.1, 1);
        this.wheelMatirial.setShininess(10.0);
        this.wheelMatirial.loadTexture( wheel_Matirial_Path );
        this.wheelMatirial.setTextureWrap(wrap, wrap);

        this.trainMatirial = new CGFappearance(scene);
        this.trainMatirial.setAmbient(0.2, 0.2, 0.2, 1);
        this.trainMatirial.setDiffuse(0.8, 0.8, 0.8, 1);
        this.trainMatirial.setSpecular(0.1, 0.1, 0.1, 1);
        this.trainMatirial.setShininess(10.0);

        this.trainMatirial.loadTexture( train_Matirial_Path );
        this.trainMatirial.setTextureWrap(wrap, wrap);

        this.boxMatirial = new CGFappearance(scene);
        this.boxMatirial.setAmbient(0.2, 0.2, 0.2, 1);
        this.boxMatirial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.boxMatirial.setSpecular(0.9, 0.9, 0.9, 1);
        this.boxMatirial.setShininess(20.0);
        this.boxMatirial.loadTexture('images/metal.jpg');
        this.boxMatirial.setTextureWrap('REPEAT', 'REPEAT');

    }
    
    display(){
        this.trainMatirial.apply();
        /*
        this.scene.multMatrix(diamondMatrixTranslate);
        this.scene.multMatrix(diamondMatrixRotate);
        this.diamond.display();
        */
        this.scene.pushMatrix();
        this.scene.translate( 0, 2.9, 3.5);
        this.scene.scale( 0.9, 0.9, 0.3);
        this.sphere.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate( 0, 1.5, 0);
        this.scene.scale( 2.5, 1, 7.5);
        this.cubeMap_1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate( 0, 2+0.9, 0);
        this.scene.rotate(Math.PI*0.5, 1,0,0);
        this.cylinder_1.display();
        this.scene.popMatrix();

        //cabine
        this.scene.pushMatrix();
        this.scene.translate( 0, 2+1.25, 0);
        this.scene.scale( 2, 2.5, 1.8);
        this.cubeMap_2.display();
        this.scene.popMatrix();

        /*
        //crane
        this.scene.pushMatrix();
        this.scene.translate( 0, 2+1.25+2.5, 0);
        this.crane.display();
        this.scene.popMatrix();*/

        //chaminé  
        this.scene.pushMatrix();
        this.scene.translate( 0, 2.9, 2.5);
        this.cylinder_2.display();
        this.scene.popMatrix();

        //Box
        this.scene.pushMatrix();
        this.boxMatirial.apply();
        this.scene.translate( 0, 2.505, -2.5);
        this.scene.scale( 2.25, 1, 1.5);
        this.box.display();
        this.scene.popMatrix();

        //display wheels
        this.wheelMatirial.apply();

        this.scene.pushMatrix();
        this.scene.translate( 1.45, this.wheelRadius, 2.5);
        this.scene.rotate(Math.PI*0.5, 0,0,1);
        this.cylinder_wheel_1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate( -1.25, this.wheelRadius, 2.5);
        this.scene.rotate(Math.PI*0.5, 0,0,1);
        this.cylinder_wheel_2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate( 1.45, this.wheelRadius, -2.5);
        this.scene.rotate(Math.PI*0.5, 0,0,1);
        this.cylinder_wheel_3.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate( -1.25, this.wheelRadius, -2.5);
        this.scene.rotate(Math.PI*0.5, 0,0,1);
        this.cylinder_wheel_4.display();
        this.scene.popMatrix();
    }

    setTexture( wheel_M_Path,  train_M_Path){
        this.initMaterials(scene, wheel_M_Path, train_M_Path);
    }

    update(deltaTime, vel, angleTrain) {
        this.angleTrain = angleTrain; 
		this.trainX += vel * Math.cos(this.angleTrain);
		this.trainZ += vel * Math.sin(this.angleTrain);
        //this.trainX += vel;
		//this.trainZ += vel;
	};
}