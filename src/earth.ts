
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as loader from "ts-loader/dist";

import * as UTILS from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import vShader from './shaders/vertexShader.glsl.js';
import fShader from './shaders/fragmentShader.glsl.js';


class Earth {


	public DIAMETER = 10;



    public convertLongLatToSpherePos(long, lat) {
        let phi = (180 - long) * Math.PI / 180;
        let tetha = (90 - lat) * Math.PI / 180;

        let x = (this.DIAMETER) * Math.cos(phi) * Math.sin(tetha);
        let z = (this.DIAMETER) * Math.sin(phi) * Math.sin(tetha);
        let y = (this.DIAMETER) * Math.cos(tetha)

        return { x, y, z }
    }

    public convertSpherePosToLongLat(x, y, z) {

        let tetha = Math.acos(y / this.DIAMETER);

        let phi = 0.
        if (x > 0) {
            phi = Math.atan(z / x)
        }
        else if (x < 0) {
            phi = Math.atan(z / x) + Math.PI;
        }
        else {
            phi = Math.PI / 2
        }

        let long = -(phi * 180 / Math.PI - 180);
        let lat = -(tetha * 180 / Math.PI - 90)

        return { long, lat }
    }

    

    constructor(scene,camera,renderer) {
		
        const DIAMETER = 10;
        const RESOLUTION = 512;
        var USE_WIREFRAME = false;
        var HEIGHT_SCALE = 0.2;
        const BIAS = 0;


        


        const light = new THREE.AmbientLight(0xffffff, 1); // soft white light
        scene.add(light);


        var earthGeometry = new THREE.IcosahedronGeometry(DIAMETER, RESOLUTION);

        let loader = new THREE.TextureLoader();

        let earthDiffuseMap = loader.load("Images/uv3.jpg");
        let earthHeightMap = loader.load("Images/earth_heightmap.jpg");
        let earthSpecularMap = loader.load("Images/specular.png");
        let earthHNormalMap = loader.load("Images/EarthNormal.png");

        earthDiffuseMap.minFilter = THREE.NearestFilter;
        earthDiffuseMap.magFilter = THREE.NearestFilter;

        earthHeightMap.minFilter = THREE.NearestFilter;
        earthHeightMap.magFilter = THREE.NearestFilter;

        earthSpecularMap.minFilter = THREE.NearestFilter;
        earthSpecularMap.magFilter = THREE.NearestFilter;

        earthHNormalMap.minFilter = THREE.NearestFilter;
        earthHNormalMap.magFilter = THREE.NearestFilter;

        var basicMaterial = new THREE.MeshPhongMaterial({
            wireframe: USE_WIREFRAME,
            map: earthDiffuseMap,
            displacementMap: earthHeightMap,
            displacementScale: HEIGHT_SCALE,
            displacementBias: BIAS,
            normalMap: earthHNormalMap,
            specularMap: earthSpecularMap
        });




        




        // MATERIAL WITH CUSTOM SHADERS

        // var uniforms = {
        //     texture1: { type: 't', value: loader.load("Images/uv3.jpg") }
        // };

        // var material = new THREE.ShaderMaterial({
        //     uniforms: uniforms,
        //     vertexShader: vShader,
        //     fragmentShader: fShader
        // });


        var earthMesh = new THREE.Mesh(earthGeometry, basicMaterial);

        scene.add(earthMesh);














        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        controls.mouseButtons = {
            RIGHT: THREE.MOUSE.ROTATE,
            MIDDLE: null,
            LEFT: null
        }

        controls.touches = {
            ONE: null,
            TWO: THREE.TOUCH.ROTATE,
        }

        controls.minDistance = 15;
        controls.maxDistance = 50;



        function animate() {
            requestAnimationFrame(animate);
            controls.update();




            renderer.render(scene, camera);
        };

        animate();
	}


}

export { Earth as Earth }