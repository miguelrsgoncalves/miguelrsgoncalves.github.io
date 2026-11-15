import { CGFscene, CGFcamera, CGFaxis, CGFappearance } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MyTrack } from "./MyTrack.js";
import { MyCubeMap } from "./MyCubeMap.js";
import { CGFcamera2 } from "./CGFcamera2.js";
import { MyStation } from "./MyStation.js";
import { MySphere } from "./MySphere.js";
import { MyCircle } from "./MyCircle.js";
import { MyCylinder } from "./MyCylinder.js";
import { MyTrain } from "./MyTrain.js";
import { MyWood } from "./MyWood.js";
//import { MyCylinder } from "MyCylinder";

/**
* MyScene
* @constructor
*/
export class MyScene extends CGFscene {
    constructor() {
        super();
    }
    init(application) {
        super.init(application);
        this.initCameras();
        this.initLights();

        this.maxSpeed = 0.01;
        this.incSpeed = 1;
        this.incSpeedA = this.incSpeed/10000;


        this.scenery = 0;

        this.sceneries = [
            [
                "images/demo_cubemap/front.png",
                "images/demo_cubemap/left.png",
                "images/demo_cubemap/right.png",
                "images/demo_cubemap/back.png",
                "images/demo_cubemap/top.png",
                "images/demo_cubemap/bottom.png"
            ],
            [
                "images/yokohama2/posx.jpg",
                "images/yokohama2/posz.jpg",
                "images/yokohama2/negz.jpg",
                "images/yokohama2/negx.jpg",
                "images/yokohama2/posy.jpg",
                "images/yokohama2/negy.jpg"
            ],
            [
                "images/yokohama3/posx.jpg",
                "images/yokohama3/posz.jpg",
                "images/yokohama3/negz.jpg",
                "images/yokohama3/negx.jpg",
                "images/yokohama3/posy.jpg",
                "images/yokohama3/negy.jpg"
            ],
            [
                "images/teide/posx.jpg",
                "images/teide/posz.jpg",
                "images/teide/negz.jpg",
                "images/teide/negx.jpg",
                "images/teide/posy.jpg",
                "images/teide/negy.jpg"
            ],
            [
                "images/maskonaive/posx.jpg",
                "images/maskonaive/posz.jpg",
                "images/maskonaive/negz.jpg",
                "images/maskonaive/negx.jpg",
                "images/maskonaive/posy.jpg",
                "images/maskonaive/negy.jpg"
            ],
            [
                "images/test_cubemap/px.png",
                "images/test_cubemap/nz.png",
                "images/test_cubemap/pz.png",
                "images/test_cubemap/nx.png",
                "images/test_cubemap/py.png",
                "images/test_cubemap/ny.png"
            ]
        ];
        
        this.textureIds = { 'Green Mountain': 0, 'City Park': 1, 'City Night': 2, 'Dried Hills': 3, 'Snowy Mountains': 4, 'Test Cube': 5};

        //Background color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.setUpdatePeriod(50);
        
        this.enableTextures(true);

        //Initialize scene objects
        this.axis = new CGFaxis(this);
        this.plane = new MyPlane(this, 100, 0,10,0,10);
        this.track = new MyTrack(this);
        this.train = new MyTrain(this);

        this.sphere = new MySphere(this, 2,3);
        this.circle = new MyCircle(this, 6);
        this.cylinder = new MyCylinder(this, 20, 1);
        //this.quad = new MyQuad(this);     
        this.background = new MyCubeMap(this);
        this.wood = new MyWood(this);

        //Objects connected to MyInterface
        this.displayAxis = false;
        this.displayBackground = true;
        this.displayGround = true;

        //Ground
        this.ground = new CGFappearance(this);
        this.ground.setAmbient(0.1, 0.1, 0.1, 1);
        this.ground.setDiffuse(0.1, 0.1, 0.1, 1);
        this.ground.setSpecular(0.1, 0.1, 0.1, 1);
        this.ground.setEmission(0.6, 0.6, 0.6, 0.6);
        this.ground.setShininess(10.0);
        this.ground.loadTexture("images/Ground.jpg");
        this.ground.setTextureWrap('REPEAT', 'REPEAT');
    }

    //Function that resets selected texture in CubeMap
    updateAppliedTexture() {
        this.background.updateTextures(this);
    }

    initLights() {
        this.lights[0].setPosition(15, 2, 5, 1);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[0].enable();
        this.lights[0].update();
    }
    initCameras() {
        this.camera = new CGFcamera2(0.4, 0.1, 500, vec3.fromValues(30,30,30), vec3.fromValues(0, 0, 0));
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setEmission(0,0,0,1);
        this.setShininess(10.0);
    }

    /**
	 * Checks if a given key is currently pressed.
	 * @param {*} keyID 
	 */
	checkKey(keyID) {
		if (this.gui.isKeyPressed(keyID)) {
			this.keysPressed = true;
			return true;
		}
		return false;
	};

    /**
    * Checks if any movement key (WD) is currently pressed.
    * Checks if the key (C) is currently pressed.
    */
    checkKeys() {
        this.keysPressed = false;
        
        //this.keyWPressed = this.checkKey("KeyW");
        //this.keyDPressed = this.checkKey("KeyD");

        this.keyCPressed = this.checkKey("KeyC");
    };

    // called periodically (as per setUpdatePeriod() in init())
    update(t){
        this.checkKeys();

        this.track.updateSpeed(this.maxSpeed,this.incSpeedA);
        if(this.keyCPressed){
            this.track.move_Train_Stop = false;
        }
        this.track.moveTrain(this.deltaTime);
    }


    display() {
        // ---- BEGIN Background, camera and axis setup
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();
        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        // Draw axis
        if (this.displayAxis)
            this.axis.display();

        this.setDefaultAppearance();

        // ---- BEGIN Primitive drawing section

        this.track.display();

        if(this.displayBackground)
            this.background.display();
        
        this.pushMatrix();
        if(this.displayGround){
            this.ground.apply();
            this.translate(0, -0.01, 0);
            this.scale(50, 1, 50);
            this.rotate(-Math.PI/2, 1, 0, 0);
            this.plane.display();
        }
        this.popMatrix();

        //this.wood.display();

        // ---- END Primitive drawing section
    }

    
}