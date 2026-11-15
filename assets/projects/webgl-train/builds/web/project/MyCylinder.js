import { CGFobject } from '../lib/CGF.js';



export class MyCylinder extends CGFobject {
    /**
     * Builds a MyCylinder object
     * 
     * @param {CGFscene} scene CGFscene
     * @param {Number} slices number of slices
     * @param {Number} yMax number of y max
     * @param {Number} minS minimum s texture coordinate
     * @param {Number} maxS maximum s texture coordinate
     * @param {Number} minT minimum t texture coordinate
     * @param {Number} maxT maximum t texture coordinate
     */
    constructor(scene, slices, yMax = 1, radius = 1 , minS = 0, maxS = 1, minT = 0, maxT = 1) {
        super(scene);

        this.slices = slices;
        this.yMax = yMax;
        this.radius = radius;
        this.minS = minS;
        this.maxS = maxS;
        this.minT = minT;
        this.maxT = maxT;

        this.initBuffers();
    };

    initBuffers() {
        var angle = 2 * Math.PI / this.slices;
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];

        var y = 0;
        var incS = (this.maxS - this.minS) / this.slices;

        for (var i = 0; i <= this.slices; i++) {
            this.vertices.push(Math.cos(i * angle)* this.radius , y, Math.sin(i * angle)* this.radius );
            this.texCoords.push(this.maxS - incS * i, this.minT);
            this.normals.push(Math.cos(i * angle), 0, Math.sin(i * angle));
            //para o interior
            //this.normals.push(Math.cos(i * angle), Math.sin(i * angle), 0);
        }

        y = this.yMax;
        for (var i = 0; i <= this.slices; i++) {
            this.vertices.push(Math.cos(i * angle)*  this.radius , y, Math.sin(i * angle)* this.radius );
            this.texCoords.push(this.maxS - incS * i, this.minT);
            this.normals.push(Math.cos(i * angle), 0, Math.sin(i * angle));
            //para o interior
            //this.normals.push(Math.cos(i * angle), Math.sin(i * angle), 0);
        }

        var ind = 0;
        for (let i = 0; i <= this.slices; i++) {
            if (i != this.slices) {
                this.indices.push(ind, ind + this.slices + 1, ind + 1);
                this.indices.push(ind + this.slices + 1, ind + this.slices + 2, ind + 1);

                //para o interior
                this.indices.push(ind, ind + 1, ind + this.slices + 1);
			    this.indices.push(ind + this.slices + 1, ind + 1, ind + this.slices + 2);
            }
            ind++;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };
    updateBuffers(){
        // reinitialize buffers
        this.initBuffers();
    }
};
