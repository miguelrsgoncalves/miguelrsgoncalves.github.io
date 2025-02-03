import { CGFobject } from '../lib/CGF.js';

import { CGFappearance } from "../lib/CGF.js";
//modificaão do MySphere 

export class MyCircle extends CGFobject {

  constructor(scene, slices, radius=1) {
    super(scene);
    this.radius = radius;
    this.slices = slices;

    this.initBuffers();
    //this.initMaterials1(scene);
  };

  initBuffers() {
    var alpha = 2 * Math.PI / this.slices;
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    this.vertices.push(0, 0, 0);
    this.normals.push(0, 0, 1);
    this.texCoords.push(0.5, 0.5);

    for (let i = 0; i < this.slices; i++) {
      this.vertices.push(Math.cos(i * alpha)*this.radius, Math.sin(i * alpha)*this.radius, 0);
      this.normals.push(0, 0, 1);
      this.texCoords.push(0.5 + (Math.cos(i * alpha) / 2), 0.5 - (Math.sin(i * alpha) / 2))
    }

    var p0 = 0;

    for (let i = 0; i < this.slices; i++) {
      if (i == this.slices - 1)
        this.indices.push(p0, i + 1, 1);
      else
        this.indices.push(p0, i + 1, i + 2);
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}