import { CGFobject, CGFtexture, CGFappearance } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyScene } from "./MyScene.js";
import { MyWood } from "./MyWood.js";


/**
 * MyStation
 * @constructor

 */

export class MyStation extends CGFobject {
    constructor(scene) {
        super(scene);
        
        //Initialize scene objects
        this.quad = new MyQuad(scene);
        this.tring = new MyTriangle(scene);
        this.wood = new MyWood(scene);

        this.initMaterials(scene);
	}

    initMaterials(scene){
        //Platform
        this.platform = new CGFappearance(scene);
        this.platform.setAmbient(0.9, 0.9, 0.9, 1);
        this.platform.setDiffuse(0.9, 0.9, 0.9, 1);
        this.platform.setSpecular(0.9, 0.9, 0.9, 1);
        this.platform.setShininess(10.0);
        this.platform.loadTexture("images/StationTextures/Platform.png");
        this.platform.setTextureWrap('REPEAT', 'REPEAT');

        //Wall
        this.wall = new CGFappearance(scene);
        this.wall.setAmbient(0.9, 0.9, 0.9, 1);
        this.wall.setDiffuse(0.9, 0.9, 0.9, 1);
        this.wall.setSpecular(0.9, 0.9, 0.9, 1);
        this.wall.setShininess(10.0);
        this.wall.loadTexture("images/StationTextures/ConcreteWall.jpg");
        this.wall.setTextureWrap('REPEAT', 'REPEAT');

        //Door
        this.door = new CGFappearance(scene);
        this.door.setAmbient(0.9, 0.9, 0.9, 1);
        this.door.setDiffuse(0.9, 0.9, 0.9, 1);
        this.door.setSpecular(0.9, 0.9, 0.9, 1);
        this.door.setShininess(10.0);
        this.door.loadTexture("images/StationTextures/Door.png");
        this.door.setTextureWrap('REPEAT', 'REPEAT');

        //Ceiling
        this.ceiling = new CGFappearance(scene);
        this.ceiling.setAmbient(0.9, 0.9, 0.9, 1);
        this.ceiling.setDiffuse(0.9, 0.9, 0.9, 1);
        this.ceiling.setSpecular(0.9, 0.9, 0.9, 1);
        this.ceiling.setShininess(10.0);
        this.ceiling.loadTexture("images/StationTextures/Ceiling.png");
        this.ceiling.setTextureWrap('REPEAT', 'REPEAT');

        //Window
        this.window = new CGFappearance(scene);
        this.window.setAmbient(0.9, 0.9, 0.9, 1);
        this.window.setDiffuse(0.9, 0.9, 0.9, 1);
        this.window.setSpecular(0.9, 0.9, 0.9, 1);
        this.window.setShininess(10.0);
        this.window.loadTexture("images/StationTextures/Window.png");
        this.window.setTextureWrap('REPEAT', 'REPEAT');
    }

    display(){
        var multiply = 1;
        this.scene.scale(multiply, multiply, multiply);
        this.scene.pushMatrix();

        //PLATFORM
        this.platform.apply();
        this.scene.pushMatrix();

        //sides
        this.scene.pushMatrix();
        this.scene.scale(2, 0.25, 1);
        this.scene.translate(0, 0, 0.5);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.scene.scale(2, 0.25, 1);
        this.scene.translate(0, 0, -0.5);
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.scene.scale(1, 0.25, 1);
        this.scene.translate(1, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, -1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.scene.scale(1, 0.25, 1);
        this.scene.translate(-1, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //bot
        this.scene.pushMatrix();
        this.scene.scale(2, 0.25, 1);
        this.scene.translate(0, -0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        //top
        this.scene.pushMatrix();
        this.scene.scale(2, 0.25, 1);
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        //END OF PLATFORM

        //Makes all next pieces go on top of platform
        this.scene.translate(0, 0.37,  0);
        this.scene.pushMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(0.2, 0.2, 0.2);
        this.scene.translate(-2, -1, -2);
        this.wood.display();
        this.scene.popMatrix();

        //Center Building
        //Walls center building
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.8, 0.5, 0.5);
        this.scene.translate(0.5, 0, -0.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.8, 0.5, 0.5);
        this.scene.translate(-0.5, 0, -0.5);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.8, 0.5, 0.8);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.8, 0.5, 0.8);
        this.scene.translate(0, 0, -0.625);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //Center Building Door and Windows
        this.scene.pushMatrix();
        this.door.apply();
        this.scene.scale(0.13, 0.2, 0.1);
        this.scene.translate(0, -0.73, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.door.apply();
        this.scene.scale(0.13, 0.2, 0.1);
        this.scene.translate(-2, -0.73, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.door.apply();
        this.scene.scale(0.13, 0.2, 0.1);
        this.scene.translate(2, -0.73, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //Windows
        this.scene.pushMatrix();
        this.window.apply();
        this.scene.scale(0.2, 0.1, 0.2);
        this.scene.translate(0, 1.4, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.window.apply();
        this.scene.scale(0.2, 0.1, 0.2);
        this.scene.translate(-1.2, 1.4, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.window.apply();
        this.scene.scale(0.2, 0.1, 0.2);
        this.scene.translate(1.2, 1.4, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //Center Building Ceiling
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.8, 0.5, 0.35);
        this.scene.translate(0, 0.85, -0.35);
        this.scene.rotate(-Math.PI/4, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.8, 0.5, 0.35);
        this.scene.translate(0, 0.85, -1.05);
        this.scene.rotate(Math.PI/4, 1, 0, 0);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(1, 0.38, 0.5);
        this.scene.translate(0.4, 1.15, -0.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.tring.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(1, 0.38, 0.5);
        this.scene.translate(-0.4, 1.15, -0.5);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.tring.display();
        this.scene.popMatrix();

        //LEFT BUILDING
        //Walls side building Left
        this.scene.pushMatrix();
        this.scene.translate(-0.65, -0.05, 0);

        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(0.5, 0, -0.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(-0.5, 0, -0.5);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(0, 0, -1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //Left Building Door and Windows
        this.scene.pushMatrix();
        this.door.apply();
        this.scene.scale(0.13, 0.2, 0.1);
        this.scene.translate(0, -0.50, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //Left Building Ceiling
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.4, 0.3, 0.3);
        this.scene.translate(0, 1, -0.35);
        this.scene.rotate(-Math.PI/4, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.4, 0.3, 0.3);
        this.scene.translate(0, 1, -1.05);
        this.scene.rotate(Math.PI/4, 1, 0, 0);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.5, 0.20, 0.42);
        this.scene.translate(0.4, 1.5, -0.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.tring.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.5, 0.20, 0.42);
        this.scene.translate(-0.4, 1.5, -0.5);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.tring.display();
        this.scene.popMatrix();
        this.scene.popMatrix();

        //RIGHT BUILDING
        //Walls side building Right
        this.scene.pushMatrix();
        this.scene.translate(0.65, -0.05, 0);

        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(0.5, 0, -0.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(-0.5, 0, -0.5);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.wall.apply();
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(0, 0, -1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //Right Building Door and Windows
        this.scene.pushMatrix();
        this.door.apply();
        this.scene.scale(0.13, 0.2, 0.1);
        this.scene.translate(0, -0.50, 0.001);
        this.quad.display();
        this.scene.popMatrix();
        //Right Building Ceiling
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.4, 0.3, 0.3);
        this.scene.translate(0, 1, -0.35);
        this.scene.rotate(-Math.PI/4, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.4, 0.3, 0.3);
        this.scene.translate(0, 1, -1.05);
        this.scene.rotate(Math.PI/4, 1, 0, 0);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.5, 0.20, 0.42);
        this.scene.translate(0.4, 1.5, -0.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.tring.display();
        this.scene.popMatrix();
        //
        this.scene.pushMatrix();
        this.ceiling.apply();
        this.scene.scale(0.5, 0.20, 0.42);
        this.scene.translate(-0.4, 1.5, -0.5);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.tring.display();
        this.scene.popMatrix();
        this.scene.popMatrix();

        this.scene.popMatrix();
        this.scene.popMatrix();
        this.scene.popMatrix();
    }
}
