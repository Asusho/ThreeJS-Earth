
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as loader from "ts-loader/dist";
import { CityGame } from "./CityGame";
import { Earth } from "./earth";
import { Test } from "./test";




class App {

	



	constructor() {

		const renderer = new THREE.WebGLRenderer();
		let height = window.innerHeight;
		let width = window.innerWidth;
        renderer.setSize(width, height);
        document.body.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000);
	
	
		camera.position.set(0, 0, 20);


		let earth = new Earth(scene,camera,renderer);
		 //new Test();
		
		let game = new CityGame(scene,camera,earth,renderer);

	}


}
new App();