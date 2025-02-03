import { CGFobject } from "../lib/CGF.js";

/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 * @param innerRadius - Radius of the empty space within the torus
 * @param outerRadius - Radius of the entire torus shape
 * @param slices - Number of divisions along the circumference of the torus
 * @param loops - Number of divisions along the vertical axis of the torus
 */
export class MyTorus extends CGFobject {
  constructor(scene, innerRadius, outerRadius, slices, loops) {
    super(scene);
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.slices = slices;
    this.loops = loops;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    for (let i = 0; i <= this.loops; i++) {
      let theta = i * 2 * Math.PI / this.loops;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      for (let j = 0; j <= this.slices; j++) {
        let phi = j * 2 * Math.PI / this.slices;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        let x = (this.outerRadius + this.innerRadius * cosTheta) * cosPhi;
        let y = (this.outerRadius + this.innerRadius * cosTheta) * sinPhi;
        let z = this.innerRadius * sinTheta;

        this.vertices.push(x, y, z);

        let nx = cosTheta * cosPhi;
        let ny = cosTheta * sinPhi;
        let nz = sinTheta;
        this.normals.push(nx, ny, nz);

        // s needs to depend on the circumference value of the torus of avoid distortion
        let s = (this.outerRadius * Math.PI + this.innerRadius * Math.PI) * phi / (2 * Math.PI * this.outerRadius);
        let t = 1 - (i / this.loops);
        this.texCoords.push(s, t);
      }
    }

    for (let i = 0; i < this.loops; i++) {
      for (let j = 0; j < this.slices; j++) {
        let first = i * (this.slices + 1) + j;
        let second = first + this.slices + 1;

        this.indices.push(first, first + 1, second);
        this.indices.push(second, first + 1, second + 1);
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  updateBuffers(complexity) {
    this.slices = 3 + Math.round(9 * complexity);
    this.loops = 3 + Math.round(9 * complexity);

    this.initBuffers();
    this.initNormalVizBuffers();
  }

  updateTexCoords(coords) {
    this.texCoords = [...coords];
    this.updateTexCoordsGLBuffers();
  }
}
