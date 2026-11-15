import { CGFobject, CGFtexture, CGFappearance } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";
import { MyScene } from "./MyScene.js";


/**
 * MyUnitCubeQuad
 * @constructor

 */

export class MyCubeMap extends CGFobject {
    constructor(scene) {
        super(scene);
        
        //Initialize scene objects
        this.quad = new MyQuad(scene);

        this.initMaterials(scene);
	}

    initMaterials(scene){        
        //Front
        this.front = new CGFappearance(scene);
        this.front.setAmbient(0, 0, 0, 1);
        this.front.setDiffuse(0, 0, 0, 1);
        this.front.setSpecular(0, 0, 0, 1);
        this.front.setEmission(1, 1, 1, 1);
        this.front.setShininess(10.0);
        this.front.loadTexture(scene.sceneries[scene.scenery][0]);
        this.front.setTextureWrap('REPEAT', 'REPEAT');
        
        //Left
        this.left = new CGFappearance(scene);
        this.left.setAmbient(0, 0, 0, 1);
        this.left.setDiffuse(0, 0, 0, 1);
        this.left.setSpecular(0, 0, 0, 1);
        this.left.setEmission(1, 1, 1, 1);
        this.left.setShininess(10.0);
        this.left.loadTexture(scene.sceneries[scene.scenery][1]);
        this.left.setTextureWrap('REPEAT', 'REPEAT');

        //Right
        this.right = new CGFappearance(scene);
        this.right.setAmbient(0, 0, 0, 1);
        this.right.setDiffuse(0, 0, 0, 1);
        this.right.setSpecular(0, 0, 0, 1);
        this.right.setEmission(1, 1, 1, 1);
        this.right.setShininess(10.0);
        this.right.loadTexture(scene.sceneries[scene.scenery][2]);
        this.right.setTextureWrap('REPEAT', 'REPEAT');

        //Back
        this.back = new CGFappearance(scene);
        this.back.setAmbient(0, 0, 0, 1);
        this.back.setDiffuse(0, 0, 0, 1);
        this.back.setSpecular(0, 0, 0, 1);
        this.back.setEmission(1, 1, 1, 1);
        this.back.setShininess(10.0);
        this.back.loadTexture(scene.sceneries[scene.scenery][3]);
        this.back.setTextureWrap('REPEAT', 'REPEAT');

        //Top
        this.top = new CGFappearance(scene);
        this.top.setAmbient(0, 0, 0, 1);
        this.top.setDiffuse(0, 0, 0, 1);
        this.top.setSpecular(0, 0, 0, 1);
        this.top.setEmission(1, 1, 1, 1);
        this.top.setShininess(10.0);
        this.top.loadTexture(scene.sceneries[scene.scenery][4]);
        this.top.setTextureWrap('REPEAT', 'REPEAT');

        //Bottom
        this.bottom = new CGFappearance(scene);
        this.bottom.setAmbient(0, 0, 0, 1);
        this.bottom.setDiffuse(0, 0, 0, 1);
        this.bottom.setSpecular(0, 0, 0, 1);
        this.bottom.setEmission(1, 1, 1, 1);
        this.bottom.setShininess(10.0);
        this.bottom.loadTexture(scene.sceneries[scene.scenery][5]);
        this.bottom.setTextureWrap('REPEAT', 'REPEAT');
        
    }

    updateTextures(scene){
        this.front.loadTexture(scene.sceneries[this.scene.scenery][0]);
        this.left.loadTexture(scene.sceneries[this.scene.scenery][1]);
        this.right.loadTexture(scene.sceneries[this.scene.scenery][2]);
        this.back.loadTexture(scene.sceneries[this.scene.scenery][3]);
        this.top.loadTexture(scene.sceneries[this.scene.scenery][4]);
        this.bottom.loadTexture(scene.sceneries[this.scene.scenery][5]);
    }

    display(){
        this.scene.pushMatrix();
        this.scene.scale(50, 50, 50);

        this.front.apply();
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        //this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.LINEAR);
        this.quad.display();
        this.scene.popMatrix(); 
        //1 face

        this.left.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.5);
        //this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.LINEAR);
        this.quad.display();
        this.scene.popMatrix(); 
        //2 face

        this.right.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.scene.rotate(-Math.PI, 0, 1, 0);
        //this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.LINEAR);
        this.quad.display();
        this.scene.popMatrix(); 
        //3 face

        this.back.apply();
        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0, 0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        //this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.LINEAR);
        this.quad.display();
        this.scene.popMatrix(); 
        //4 face

        this.top.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        if(this.scene.scenery == 0) this.scene.rotate(Math.PI/2, 0, 0, 1);
        //this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.LINEAR);
        this.quad.display();
        this.scene.popMatrix(); 
        //5 face TOP

        this.bottom.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, -0.5, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        if(this.scene.scenery == 0) this.scene.rotate(-Math.PI/2, 0, 0, 1);
        //this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.LINEAR);
        this.quad.display();
        this.scene.popMatrix(); 
        //6 face BOTTOM

        this.scene.popMatrix();
    }
}
