import {CGFobject} from '../lib/CGF.js';

import { MyCylinder } from "./MyCylinder.js";
import { MyCircle } from "./MyCircle.js";

export class MyCylinderTotal extends CGFobject {

    /**
     * @param {CGFscene} scene CGFscene
     * @param {Number} slices number of slices
     */
    constructor(scene, slices, yMax = 1 , radius = 1, material) {
        super(scene);
        this.yMax = yMax;
        this.radius = radius;
        this.material =material;

        this.cylinder = new MyCylinder(scene, slices, yMax, radius);
        this.circle = new MyCircle(scene, slices, radius);
    };

    /**
     * Displays this object
     */
    display() {
        this.material.apply();

        //Regular cylinder
        this.scene.pushMatrix();
        this.cylinder.display();
        this.scene.popMatrix();

        //Base 1
        this.scene.pushMatrix();
        this.scene.translate(0, this.yMax, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.circle.display();
        this.scene.popMatrix();

        //Base 2
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.circle.display();
        this.scene.popMatrix();
    }

    setTexture( material ){
        this.material = material;
    }
}