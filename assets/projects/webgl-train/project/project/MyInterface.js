import { CGFinterface, dat } from '../lib/CGF.js';

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
        // http://workshop.chromeexperiments.com/examples/gui
        this.gui = new dat.GUI();

        var obj = this;

        //Checkbox element in GUI
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');
        this.gui.add(this.scene, 'displayBackground').name('Display CubeMap');
        //Dropdown for textures
        this.gui.add(this.scene, 'scenery', this.scene.textureIds).name('Selected Texture').onChange(this.scene.updateAppliedTexture.bind(this.scene));

        this.gui.add(this.scene, 'displayGround').name('Display Ground');

        //Train maximum speed, between 0.001 and 0.1
 		this.gui.add(this.scene, 'maxSpeed', 0.001, 0.1).name('Max Speed');
        //Train maximum speed, between 0.001 and 0.1
 		this.gui.add(this.scene, 'incSpeed', 1, 10).name('Inc Speed');

        this.initKeys();

        return true;
    }

    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui = this;

        // disable the processKeyboard function
        this.processKeyboard = function () { };

        // create a named array to store which keys are being pressed
        this.activeKeys = {};
    }

    processKeyDown(event) {
        // called when a key is pressed down
        // mark it as active in the array
        this.activeKeys[event.code] = true;
    }

    processKeyUp(event) {
        // called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code] = false;
    }

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

}