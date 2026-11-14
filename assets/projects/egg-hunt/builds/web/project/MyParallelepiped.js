import { CGFobject } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";

/**
 * MyParallelepiped
 * @constructor
 * @param scene - Reference to MyScene object
 * @param length - Length of the parallelepiped along the x-axis
 * @param width - Width of the parallelepiped along the z-axis
 * @param height - Height of the parallelepiped along the y-axis
 */
export class MyParallelepiped extends CGFobject {
	constructor(scene, length, width, height) {
		super(scene);
        this.length = length;
        this.width = width;
        this.height = height;
        this.init();
	}
	
	init() {
        this.quad = new MyQuad(this.scene);
    }

    display() {

        //face y
        this.scene.pushMatrix();
        this.scene.translate(0, this.height / 2, 0);
        this.scene.scale(this.length, 1, this.width);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        //face -y
        this.scene.pushMatrix();
        this.scene.translate(0, - this.height / 2, 0);
        this.scene.scale(this.length, 1, this.width);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();

        //face x
        this.scene.pushMatrix();
        this.scene.translate(this.length / 2, 0, 0);
        this.scene.scale(1, this.height, this.width);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();

        //face -x
        this.scene.pushMatrix();
        this.scene.translate(- this.length / 2, 0, 0);
        this.scene.scale(1, this.height, this.width);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();

        //face z
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.width / 2);
        this.scene.scale(this.length, this.height, 1);
        this.quad.display();
        this.scene.popMatrix();

        //face -z
        this.scene.pushMatrix();
        this.scene.translate(0, 0, - this.width / 2);
        this.scene.scale(this.length, this.height, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.quad.display();
        this.scene.popMatrix();
    }
}

