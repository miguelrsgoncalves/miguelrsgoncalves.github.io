import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyQuad } from "./MyQuad.js";

/**
 * MyBillboard
 * @constructor
 * @param scene - Reference to MyScene object
 * @param texture - Path to texture image
 */

export class MyBillboard extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.init(texture);

        this.quadNormal = [0, 0, 1];
        this.treeAngle = 0;
        this.treeAxis = [];
    }

    init(texture){
        this.tree = new MyQuad(this.scene, [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]);

        this.treeMaterial = new CGFappearance(this.scene);
        this.treeMaterial.setAmbient(1.0, 1.0, 1.0, 1.0);
        this.treeMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.treeMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.treeMaterial.setShininess(10.0);
        this.treeMaterial.loadTexture(texture);
        this.treeMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    // The Quad's normal vector has to have the same orientation as the vector that comes from the Quad to the Camera
    calcQuadNorm(posX, posY, posZ) {
        var directionVector = [
            this.scene.camera.position[0] - posX,
            this.scene.camera.position[1] - posY,
            this.scene.camera.position[2] - posZ
        ];

        var vectorMagnitude = Math.sqrt(Math.pow(directionVector[0], 2) + Math.pow(directionVector[1], 2) + Math.pow(directionVector[2], 2));

        // normalized vector without y
        var normalizedVector = [
            directionVector[0] / vectorMagnitude,
            0,
            directionVector[2] / vectorMagnitude
        ];

        this.treeAxis = (this.quadNormal[2] * normalizedVector[0]) - (this.quadNormal[0] * normalizedVector[2]);

        var dotProduct = this.quadNormal[0] * normalizedVector[0] + this.quadNormal[1] * normalizedVector[1] + this.quadNormal[2] * normalizedVector[2];

        this.treeAngle = Math.acos(dotProduct);
    }

    display(posX, posY, posZ) {
        this.scene.pushMatrix();
        
        this.calcQuadNorm(posX, posY, posZ);
        
        this.treeMaterial.apply();

        this.scene.translate(posX, posY + 4, posZ);        
        this.scene.rotate(this.treeAngle, 0, this.treeAxis, 0);
        this.scene.scale(6, 10, 1);

        this.tree.display();

        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}