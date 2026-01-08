import {CGFobject} from '../lib/CGF.js';
;
import {MyPlane} from './MyPlane.js';
import { MyStation } from './MyStation.js';

export class MyTrackSegment extends CGFobject {
	constructor(scene, track, point1, point2, trackMatirial) {
		super(scene);

        this.track = track;
        this.point1 = point1;
        this.point2 = point2;
        this.trackMatirial = trackMatirial;
        this.alpha = this.calculate_angle([this.point1.x , this.point1.z],[this.point2.x , this.point2.z]);
        this.distanse = this.calculate_distance();

        this.plane = new MyPlane(scene, 1, 0,this.distanse ,0,1);
        this.station = new MyStation(scene);

        
	}
    
    display(){
        this.trackMatirial.apply();
        this.scene.pushMatrix();

        this.scene.translate( this.point1.x, 0, this.point1.z);
        this.scene.rotate(-this.alpha, 0, 1, 0);
        this.scene.pushMatrix();
        this.scene.scale( this.distanse, 1, 1);

        this.scene.pushMatrix();

		this.scene.translate(0.5, 0, 0);
        this.scene.rotate(-Math.PI*0.5, 1,0,0);
        this.plane.display();
      
        this.scene.popMatrix();
        this.scene.popMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        
        this.scene.translate(0, 0, -1);
        if (this.point1.type == "station" ){
            this.station.display();
        }
        
        this.scene.popMatrix();
    }

    calculate_angle(a, b){
		var dif = vec2.fromValues(0,0);
		vec2.subtract(dif, b, a);
		return 	dif[0] < 0 ? Math.PI + Math.atan(dif[1]/dif[0]) : Math.atan(dif[1]/dif[0]);
	}

    calculate_distance(){
		return Math.sqrt(Math.pow(this.point2.x - this.point1.x, 2) + Math.pow(this.point2.z - this.point1.z, 2));
	}
}
