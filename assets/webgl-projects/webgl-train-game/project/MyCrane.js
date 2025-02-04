import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";
import { MyUnitCubeQuadTopless } from "./MyUnitCubeQuadTopless.js";
import { MyCylinderTotal } from "./MyCylinderTotal.js";
import { MyCylinderTopless } from "./MyCylinderTopless.js";
import { MySphere } from "./MySphere.js";
import { CGFobject, CGFappearance} from '../lib/CGF.js';
/**
 * MyCrane
 * @constructor
 * @param scene - Reference to MyScene object
 */

export class MyCrane extends CGFobject {
    constructor(scene) {
        super(scene);
        
        this.initMaterials(scene);

        //Initialize scene objects
        this.sphere = new MySphere(scene, 10,12);
        this.cylinder_1 = new MyCylinderTotal(scene, 20, 3.5, 0.9, this.craneMatirial);//raio de 0.9 unidades, e comprimento de 3.5 unidades
	}

    initMaterials(scene){
        this.craneMatirial = new CGFappearance(scene);
        this.craneMatirial.setAmbient(0.2, 0.2, 0.2, 1);
        this.craneMatirial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.craneMatirial.setSpecular(0.9, 0.9, 0.9, 1);
        this.craneMatirial.setShininess(20.0);
        this.craneMatirial.loadTexture('images/metal.jpg');
        this.craneMatirial.setTextureWrap('REPEAT', 'REPEAT');
    }
    
    display(){
        this.scene.pushMatrix();
        this.craneMatirial.apply();

        //Eixo Central
        this.scene.pushMatrix();
        this.scene.scale( 0.5, 0.5, 0.2);
        this.scene.rotate(Math.PI*0.5, 1,0,0);
        this.cylinder_1.display();
        this.scene.popMatrix();

        //Esfera
        this.scene.pushMatrix();
        this.scene.translate( 0, 3.5, 0);
        this.scene.scale( 0.9, 0.9, 0.3);
        this.sphere.display();
        this.scene.popMatrix();

        //Eixo do Cabo
        this.scene.pushMatrix();
        this.scene.translate( 0, 3.5, 0);
        this.cylinder_1.display();
        this.scene.popMatrix();

        //Cabo
        this.scene.pushMatrix();
        this.scene.translate(3.5, 3.5, 0);
        this.scene.rotate(Math.PI*0.5, 1,0,0);
        this.cylinder_1.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}