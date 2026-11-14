import { CGFobject } from '../lib/CGF.js';

/**
 * MyDistortedParallelopiped
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base - Base length of the parallelogram along the x-axis
 * @param height - Height of the parallelogram along the y-axis
 * @param skew - Skew factor of the parallelogram along the x-axis
 * @param depth - Depth of the 3D parallelogram along the z-axis
 * @param altitude - Height of the parallelogram along the z-axis
 */
export class MyDistortedParallelopiped extends CGFobject {
    constructor(scene, base, height, skew, depth, altitude) {
        super(scene);
        this.base = base;
        this.height = height;
        this.skew = skew;
        this.depth = depth;
        this.alt = altitude;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            0, 0, 0,
            this.base, 0, this.alt,
            this.base + this.skew, this.height, this.alt,
            this.skew, this.height, 0,
            0, 0, this.depth,
            this.base, 0, this.depth + this.alt,
            this.base + this.skew, this.height, this.depth + this.alt,
            this.skew, this.height, this.depth
        ];

        this.indices = [
            0, 2, 1, 0, 3, 2,
            4, 5, 6, 4, 6, 7,
            0, 1, 5, 0, 5, 4,
            2, 3, 7, 2, 7, 6,
            0, 7, 3, 0, 4, 7,
            1, 2, 6, 1, 6, 5
        ];

        this.normals = [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            -1, 0, 0,
            -1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            0, -1, 0,
            0, -1, 0,
            0, 1, 0,
            0, 1, 0
        ];

        this.texCoords = [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Called when user interacts with GUI to change object's dimensions.
     * @param {number} base - new base length along the x-axis
     * @param {number} height - new height along the y-axis
     * @param {number} skew - new skew factor along the x-axis
     * @param {number} depth - new depth along the z-axis
     */
    updateDimensions(base, height, skew, depth) {
        this.base = base;
        this.height = height;
        this.skew = skew;
        this.depth = depth;

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}