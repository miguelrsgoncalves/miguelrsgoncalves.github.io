import {CGFinterface, dat} from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);
        
        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        // Checkbox element in GUI
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');

        // Checkbox to link camera to bird
        this.gui.add(this.scene, 'linkCameraBird').name('Link Camera to Bird').onChange(this.scene.resetCamera.bind(this.scene));

        // Checkbox to move bird to the axis' origin
        this.gui.add(this.scene, 'birdOnOrigin').name('Bird at Axis Origin').onChange(this.scene.changeBirdHeight.bind(this.scene));

        // Slider element in GUI
        this.gui.add(this.scene, 'speedFactor', 0.1, 3).name('Speed Factor').onChange(this.scene.updateSpeedFactor.bind(this.scene)).step(0.1);
        this.gui.add(this.scene, 'scaleFactor', 0.5, 3).name('Scale Factor');

        this.initKeys();

        return true;
    }

    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui=this;
        // disable the processKeyboard function
        this.processKeyboard=function(){};
        // create a named array to store which keys are being pressed
        this.activeKeys={};
    }

    processKeyDown(event) {
        // called when a key is pressed down
        // mark it as active in the array
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        // called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        // returns true if a key is marked as pressed, false otherwise
        return this.activeKeys[keyCode] || false;
    }
}