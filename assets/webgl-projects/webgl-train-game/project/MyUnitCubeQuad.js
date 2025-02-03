import { CGFobject, CGFtexture, CGFappearance } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";


/**
 * MyUnitCubeQuad
 * @constructor

 */

export class MyUnitCubeQuad extends CGFobject {
    constructor(scene, textureSide, textureTop, textureBottom) {
        super(scene);
        
        //Initialize scene objects
        this.quad_1 = new MyQuad(scene);

        this.initMaterials(scene, textureSide, textureTop, textureBottom);
	}

    initMaterials(scene,  textureSide, textureTop, textureBottom){
        
        
        //Front, Right, Left, Back materials
        this.side = new CGFappearance(scene);
        this.side.setAmbient(0.1, 0.1, 0.1, 1);
        this.side.setDiffuse(0.9, 0.9, 0.9, 1);
        this.side.setSpecular(0.1, 0.1, 0.1, 1);
        this.side.setShininess(10.0);
        this.side.loadTexture(textureSide);
        this.side.setTextureWrap('REPEAT', 'REPEAT');

        //Top
        this.top = new CGFappearance(scene);
        this.top.setAmbient(0.1, 0.1, 0.1, 1);
        this.top.setDiffuse(0.9, 0.9, 0.9, 1);
        this.top.setSpecular(0.1, 0.1, 0.1, 1);
        this.top.setShininess(10.0);
        this.top.loadTexture(textureTop);
        this.top.setTextureWrap('REPEAT', 'REPEAT');

        //Bottom
        this.bottom = new CGFappearance(scene);
        this.bottom.setAmbient(0.1, 0.1, 0.1, 1);
        this.bottom.setDiffuse(0.9, 0.9, 0.9, 1);
        this.bottom.setSpecular(0.1, 0.1, 0.1, 1);
        this.bottom.setShininess(10.0);
        this.bottom.loadTexture(textureBottom);
        this.bottom.setTextureWrap('REPEAT', 'REPEAT');
        
    }

    display(){

        this.side.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.quad_1.display();
        this.scene.popMatrix(); 
        //1 face

        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.quad_1.display();
        this.scene.popMatrix(); 
        //2 face

        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad_1.display();
        this.scene.popMatrix(); 
        //3 face

        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.quad_1.display();
        this.scene.popMatrix(); 
        //4 face

        this.top.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.quad_1.display();
        this.scene.popMatrix(); 
        //5 face TOP

        this.bottom.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, -0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.quad_1.display();
        this.scene.popMatrix(); 
        //6 face7 BOTTOM
    }
}
