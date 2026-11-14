import { CGFobject } from "../lib/CGF.js";

/**
 * MyElongatedSphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of divisions around the Y axis
 * @param stacks - Number of divisions along the Y axis
 * @param inverted - If true the direction of the normals of the sphere will be pointed inward, else the normals will point outward
 * @param texScale - Multiplier to the texture coordinates (u and v)
 */
export class MyElongatedSphere extends CGFobject {
    constructor(scene, slices, stacks, inverted, texScale) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.texScale = texScale;
        this.initBuffers(inverted);
    }

    initBuffers(inverted) {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        for (var stack = 0; stack <= this.stacks; ++stack) {
            var theta = stack * Math.PI / this.stacks;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var slice = 0; slice <= this.slices; ++slice) {
                var phi = slice * 2 * Math.PI / this.slices;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;

                if(stack < this.stacks/2) {
                    y *= 1.5;
                }

                this.vertices.push(x, y, z);

                if(!inverted) {
                    this.normals.push(x, y, z);
                }
                else {
                    this.normals.push(-x, -y, -z);
                }

                var u = (1 - (slice / this.slices)) * this.texScale;
                var v = (stack / this.stacks) * this.texScale;
                this.texCoords.push(u, v);
            }
        }

        for (var stack = 0; stack < this.stacks; ++stack) {
            for (var slice = 0; slice < this.slices; ++slice) {
                var first = (stack * (this.slices + 1)) + slice;
                var second = first + this.slices + 1;

                if(!inverted) {
                    this.indices.push(first, first + 1, second);
                    this.indices.push(second, first + 1, second + 1);
                }
                else {
                    this.indices.push(first, second, first + 1);
                    this.indices.push(second, second + 1, first + 1);
                }
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity);
        this.stacks = 3 + Math.round(9 * complexity);

        this.initBuffers();
        this.initNormalVizBuffers();
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}