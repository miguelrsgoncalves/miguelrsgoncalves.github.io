import { CGFobject } from "../lib/CGF.js";
import { MyBillboard } from "./MyBillboard.js";

/**
 * MyTreeGroupPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param treeDistance - Default distance between trees
 * @param offset - Offset so that trees look untidy
 */

export class MyTreeGroupPatch extends CGFobject {
    constructor(scene, treeDistance, offset) {
        super(scene);
        
        this.nTrees = 9;
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
        
        for(var i = 0; i < Math.sqrt(this.nTrees); i++) {
            for(var j = 0; j < Math.sqrt(this.nTrees); j++) {

                var index = i * Math.sqrt(this.nTrees) + j;

                var x = posX + (j * this.treeDistance) + this.treeOffsetX[index];
                var z = posZ + (i * this.treeDistance) + this.treeOffsetZ[index];

                this.treePatch[index].display(x, posY, z);
            }
        }        

        this.scene.popMatrix();
    }
}