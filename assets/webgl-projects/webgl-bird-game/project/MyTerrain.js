import { CGFobject, CGFappearance, CGFshader, CGFtexture } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";

/**
 * MyElongatedSphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param texture - Path to texture image
 */
export class MyTerrain extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.init(texture);
    }

    init(texture) {

        this.plane = new MyPlane(this.scene, 120);

        this.textureColor = new CGFtexture(this.scene, "images/terrain.jpg");
        this.appearance = new CGFappearance(this.scene);
        this.appearance.setTexture(this.textureColor);
        this.appearance.setTextureWrap('REPEAT', 'REPEAT');
        
        this.textureHeight = new CGFtexture(this.scene, "images/heightmap_edited.png");
        this.altimetry = new CGFtexture(this.scene, "images/altimetry.png");
        
        this.shader = new CGFshader(this.scene.gl, "shaders/terrain.vert", "shaders/terrain.frag");
        this.shader.setUniformsValues({ uSamplerTex: 0 });
        this.shader.setUniformsValues({ uSamplerMap: 1 });
        this.shader.setUniformsValues({ uSamplerAlt: 2 });
    }

    display() {
        this.scene.pushMatrix();

        this.appearance.apply();

        this.textureColor.bind(0);
        this.textureHeight.bind(1);
        this.altimetry.bind(2);

        this.scene.setActiveShader(this.shader);

        this.scene.translate(0,-100,0);
        this.scene.rotate(-Math.PI/2.0,1,0,0);
        this.scene.scale(400,400,400);

        this.plane.display();
        
        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
    }
}