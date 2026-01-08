import { CGFobject } from "../lib/CGF.js";
import { MyBillboard } from "./MyBillboard.js";

/**
 * MyTreeRowPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param treeDistance - Default distance between trees
 * @param offset - Offset so that trees look untidy
 */

export class MyTreeRowPatch extends CGFobject {
    constructor(scene, treeDistance, offset) {
        super(scene);
        
        this.nTrees = 6;
        this.treePatch = [];
        this.treeOffsetX = [];
        this.treeOffsetZ = [];
        this.treeDistance = treeDistance;
        this.offset = offset;
        
        this.textures = [
            'images/billboardtree1.png',
            'images/billboardtree2.png',
            'images/billboardtree3.png',
            'images/billboardtree4.png',
        ];
        
        this.init();
    }

    init(){

        for(var i = 0; i < this.nTrees; i++){

            // choose random texture from the texture vector for each tree
            var randomTex = parseInt(Math.random() * this.textures.length);

            // create random offset in the x and z axis for each tree
            this.treeOffsetX[i] = Math.random() * this.offset;
            this.treeOffsetZ[i] = Math.random() * this.offset;

            this.treePatch.push(new MyBillboard(this.scene, this.textures[randomTex]));
        }
    }

    
    display(posX, posY, posZ) {
        this.scene.pushMatrix();
        
        for(var i = 0; i < this.nTrees; i++) {
            var x = posX + (i * this.treeDistance) + this.treeOffsetX[i];
            var z = posZ + this.treeOffsetZ[i];
            this.treePatch[i].display(x, posY, z);
        }        

        this.scene.popMatrix();
    }
}