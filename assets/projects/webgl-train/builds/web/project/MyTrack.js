import {CGFobject} from '../lib/CGF.js';

import {MyTrackPoints} from './MyTrackPoints.js';
import {MyTrackSegment} from './MyTrackSegment.js';
import { MyTrain } from "./MyTrain.js";

import { CGFappearance } from "../lib/CGF.js";

export class MyTrack extends CGFobject {

	constructor(scene) {

		super(scene);

		this.train = new MyTrain(scene, 0, 0, 5);
		//track circulo
		var m = 1; // mutiplicar todos os pontos pelo valor m 	
		this.track_Points =  [
			new MyTrackPoints ( 0,	5*m,	"station" ),//S1
			new MyTrackPoints ( 0,	6*m,	"simple" ),
			new MyTrackPoints ( 1*m,8*m,	"simple" ),
			new MyTrackPoints ( 2*m,9*m,	"simple" ),
			new MyTrackPoints ( 4*m,10*m,	"simple" ),
			new MyTrackPoints ( 5*m,10*m,	"station" ),//S2
			new MyTrackPoints ( 6*m,10*m,	"simple" ),
			new MyTrackPoints ( 8*m,9*m,	"simple" ),
			new MyTrackPoints ( 9*m,8*m,	"simple" ),
			new MyTrackPoints ( 10*m,6*m,	"simple" ),
			new MyTrackPoints ( 10*m,5*m,	"station" ),//S3
			new MyTrackPoints ( 10*m,4*m,	"simple" ),
			new MyTrackPoints ( 9*m,2*m,	"simple" ),
			new MyTrackPoints ( 8*m,1*m,	"simple" ),
			new MyTrackPoints ( 6*m,0*m,	"simple" ),
			new MyTrackPoints ( 5*m,0,		"station" ),//S4
			new MyTrackPoints ( 4*m,0*m,	"simple" ),
			new MyTrackPoints ( 2*m,1*m,	"simple" ),
			new MyTrackPoints ( 1*m,2*m,	"simple" ),
			new MyTrackPoints ( 0,	4*m,	"simple" ),
		];
		this.initMaterials(scene);
		
		this.segments = [];
		for(var i = 0; i+1 < this.track_Points.length ; i++ ){
			this.segments[i] = new MyTrackSegment(scene, this, this.track_Points[i],  this.track_Points[i+1], this.trackMatirial);
        }
		this.segments[this.track_Points.length-1] = new MyTrackSegment(scene, this, this.track_Points[this.track_Points.length-1],  this.track_Points[0], this.trackMatirial);		

		//train velocity
        //0.01 unidades por segundo
		this.vel = 0.00001;
		//maxSpeed
		this.maxSpeed = 0.01;
		//increment speed
		this.incSpeed = 0.00001;

        //behaviour booleans
		this.move_Train_Stop = false;

		// track poits
		this.tP_last = 0;
		this.tP_next = 1;
		this.track_P_last = this.track_Points[this.tP_last];
		this.track_P_next = this.track_Points[this.tP_next];

		this.alphaTrain = this.calculate_angle([this.track_P_last.x , this.track_P_last.z],[this.track_P_next.x , this.track_P_next.z]);
	}

	initMaterials(scene){
		this.trackMatirial = new CGFappearance(scene);
        this.trackMatirial.loadTexture('images/tracks.png');
        this.trackMatirial.setTextureWrap('REPEAT', 'REPEAT');
	}

	display(){

		this.scene.pushMatrix();
 		this.scene.translate( -5 , 0, -5);

		this.scene.pushMatrix();
		for(var i = 0; i < this.segments.length; i++){
			this.segments[i].display();
        }
		this.scene.popMatrix();

		this.scene.pushMatrix();
        this.displayTrain();
		this.scene.popMatrix();
        
		
		this.scene.popMatrix();
	}

	displayTrain() {
		this.scene.pushMatrix();
		this.scene.translate(this.train.trainX, this.train.trainY, this.train.trainZ);
		this.scene.rotate( - this.train.angleTrain , 0, 1, 0);
		this.scene.rotate( Math.PI*0.5 , 0, 1, 0);
		//this.segments[1].display();
		this.scene.scale(0.2, 0.2, 0.2);
		this.train.display();
		this.scene.popMatrix();
	}

	calculate_angle(a, b){
		var dif = vec2.fromValues(0,0);
		vec2.subtract(dif, b, a);
		return 	dif[0] < 0 ? Math.PI + Math.atan(dif[1]/dif[0]) : Math.atan(dif[1]/dif[0]);
	}

	calculate_distance(value, nextValue){
		return Math.sqrt(Math.pow(this.track_Points[nextValue].x - this.track_Points[value].x, 2) + Math.pow(this.track_Points[nextValue].z - this.track_Points[value].z, 2));
	}

	cmpCoords(x1, x2, z1, z2, limit) {
		return Math.abs(x2 - x1) <= limit && Math.abs(z2 - z1) <= limit;
	};

	updateSpeed(maxSpeed, incSpeed){
		this.maxSpeed = maxSpeed;
		this.incSpeed = incSpeed;
	}

	increaseVel(){
		if(!(this.vel + this.incSpeed > this.maxSpeed)){
			this.vel += this.incSpeed;
		}

		
	}

	decreaseVel(){
		if(!(this.vel - this.incSpeed < 0)){
			this.vel += this.incSpeed;
		}
	}

	stopTrain(){
		this.vel = 0;
	}
	/**
	 * Move train
	 * @param {Number} deltaTime 
	 */
	moveTrain(deltaTime) {
		
		if( this.cmpCoords(this.train.trainX, this.track_P_next.x, this.train.trainZ, this.track_P_next.z , 0.05)){
			this.train.trainX =  this.track_P_next.x;
			this.train.trainZ =  this.track_P_next.z;

			if(this.track_P_next.type == "station"){
				this.move_Train_Stop = true;
				this.stopTrain();
			}
			
			this.tP_last = this.tP_next;
			this.tP_next += 1 ;
			if(! (this.tP_next  < this.track_Points.length)){
				this.tP_next = 0;
			}
			if(!(this.tP_last < this.track_Points.length)){
				this.tP_last = 0;
			}

			this.track_P_last = this.track_Points[this.tP_last];
			this.track_P_next = this.track_Points[this.tP_next];
			this.alphaTrain = this.calculate_angle([this.track_P_last.x , this.track_P_last.z],[this.track_P_next.x , this.track_P_next.z]);
		}	
		
        if(!this.move_Train_Stop){
			if(this.track_P_next.type == "station"){
				this.decreaseVel();
			}else{
				this.increaseVel();
			}
			this.train.update(deltaTime, this.vel, this.alphaTrain);
		}
    }
}