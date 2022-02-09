
import * as THREE from "three";
import { CityGame } from "./CityGame";
import { Earth } from "./earth";


class App {

	constructor() {

		const renderer = new THREE.WebGLRenderer();
		let height = window.innerHeight;
		let width = window.innerWidth;
		renderer.setSize(width, height);
		document.body.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000);



		window.addEventListener('resize', onWindowResize, false);

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
		}

		let earth = new Earth(scene, camera, renderer);
		let game = new CityGame(scene, camera, earth, renderer);


	}


}
new App();