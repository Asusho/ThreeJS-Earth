
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as loader from "ts-loader/dist";

import * as UTILS from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import vShader from './shaders/vertexShader.glsl.js';
import fShader from './shaders/fragmentShader.glsl.js';

import { GeoJsonGeometry } from 'three-geojson-geometry';


class Earth {


    public RADIUS = 50;
    public RESOLUTION = 512;
    public USE_WIREFRAME = false;
    public HEIGHT_SCALE = 0.03;
    public BIAS = 0;



    public convertLongLatToSpherePos(long, lat) {
        let phi = (180 - long) * Math.PI / 180;
        let tetha = (90 - lat) * Math.PI / 180;

        let x = (this.RADIUS) * Math.cos(phi) * Math.sin(tetha);
        let z = (this.RADIUS) * Math.sin(phi) * Math.sin(tetha);
        let y = (this.RADIUS) * Math.cos(tetha)

        return { x, y, z }
    }

    public convertSpherePosToLongLat(x, y, z) {

        let tetha = Math.acos(y / this.RADIUS);

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



    constructor(scene, camera, renderer) {





        // const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
        // scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);




        var earthGeometry = new THREE.IcosahedronGeometry(this.RADIUS, this.RESOLUTION);

        let loader = new THREE.TextureLoader();

        let earthDiffuseMap = loader.load("Images/uv3.jpg");
        let earthBordersMap = loader.load("Images/borders.jpg");
        let earthHeightMap = loader.load("Images/earth_heightmap.jpg");
        let earthSpecularMap = loader.load("Images/specular.png");
        let earthHNormalMap = loader.load("Images/EarthNormal.png");

        earthDiffuseMap.minFilter = THREE.NearestFilter;
        earthDiffuseMap.magFilter = THREE.NearestFilter;

        earthBordersMap.minFilter = THREE.NearestFilter;
        earthBordersMap.magFilter = THREE.NearestFilter;

        earthHeightMap.minFilter = THREE.NearestFilter;
        earthHeightMap.magFilter = THREE.NearestFilter;

        earthSpecularMap.minFilter = THREE.NearestFilter;
        earthSpecularMap.magFilter = THREE.NearestFilter;

        earthHNormalMap.minFilter = THREE.NearestFilter;
        earthHNormalMap.magFilter = THREE.NearestFilter;

        var basicMaterial = new THREE.MeshPhongMaterial({
            wireframe: this.USE_WIREFRAME,
            map: earthDiffuseMap,
            displacementMap: earthHeightMap,
            displacementScale: this.HEIGHT_SCALE,
            displacementBias: this.BIAS,
            normalMap: earthHNormalMap,
            specularMap: earthSpecularMap
        });


        var self = this;



        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let mouse2 = new THREE.Vector2();
        document.addEventListener('mousemove', onMouseMove, false);


        let mouseOverPoint = new THREE.Vector3();
        console.log(mouseOverPoint);


        function onMouseMove(event) {
            mouse.x = (event.clientX);
            mouse.y = -(event.clientY - renderer.domElement.height);


            // mouse2.x = (event.clientX / renderer.domElement.width) * 2 - 1;
            // mouse2.y = - (event.clientY / renderer.domElement.height) * 2 + 1;

            // raycaster.setFromCamera(mouse2, camera);

            // var objs = raycaster?.intersectObjects(scene.children);
            // var obj = raycaster?.intersectObjects(scene.children)[0];

            // for (let element of objs) {
            //     if (element.object.name == "earth") {
            //         obj = element;
            //         break;
            //     }

            // }
            // let pt = obj?.point

            // if(pt){

            //     let clickedPoint = self.convertSpherePosToLongLat(pt.x,pt.y,pt.z);
            //     for(let i =0; i<countries.length; i++){
            //         if(isInside(clickedPoint,countries[i].geometry)){
            //             console.log(`vous etes au dessus de ${countries[i].name}`);
            //             break;
            //         }
            //     }


            // }



        }



        // MATERIAL WITH CUSTOM SHADERS

        var uniforms = {
            texture1: { type: 'sampler2D', value: earthDiffuseMap },
            normalMap: { type: 'sampler2D', value: earthHNormalMap },
            mousePos: { type: 'vec3', value: mouse },
            resolution: { type: "vec2", value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
            heightMap: { type: 'sampler2D', value: earthHeightMap },
            R: { type: 'float', value: this.RADIUS },
            heightScale: { type: 'float', value: this.HEIGHT_SCALE }
        };

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vShader,
            fragmentShader: fShader,
            wireframe: this.USE_WIREFRAME
        });


        var earthMesh = new THREE.Mesh(earthGeometry, material);
        earthMesh.name = "earth";

        scene.add(earthMesh);



        let json = require('./data/countries.json');

        const alt = this.RADIUS +0.2;

        const lineObjs = [];
        const countries = []

        const materials = [
            new THREE.LineBasicMaterial({ color: 'blue' }), // outer ring
            new THREE.LineBasicMaterial({ color: 'green' }) // inner holes
        ];

        json.features.forEach(({ properties, geometry }, index) => {
            lineObjs.push(new THREE.LineSegments(
                new GeoJsonGeometry(geometry, alt),
                materials
            ));

            let country = {
                name: properties.ADMIN,
                geometry: geometry.coordinates
            }
            country.geometry.forEach(el => {
                el.map(e => new THREE.Vector2(e[0], e[1]))
            })
            countries.push(country)

        });





        // console.log(countries);

        let country = countries[0];
        console.log(country)



        function isInside(pt, pol) {
            var inside = false;
            for (var i = 0, j = pol.length - 1; i < pol.length; j = i++) {
                var xi = pol[i].x,
                    yi = pol[i].z;
                var xj = pol[j].x,
                    yj = pol[j].z;

                var intersect = ((yi > pt.y) != (yj > pt.y)) &&
                    (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }

            return inside;
        }



        lineObjs.forEach((obj, index) => {
            obj.rotation.y = -Math.PI / 2;
            scene.add(obj)

            // // Set a random color to the contry borders
            // let color = new THREE.Color();
            // color.setHex(Math.floor(Math.random() * 16777215))
            // obj.material = [
            //     new THREE.LineBasicMaterial({ color: color }), // outer ring
            //     new THREE.LineBasicMaterial({ color: 'green' }) // inner holes
            // ];

            // change the color of first country
            if (index == 0) {
                obj.material = [
                    new THREE.LineBasicMaterial({ color: 'red' }), // outer ring
                    new THREE.LineBasicMaterial({ color: 'green' }) // inner holes
                ];
            }
        }
        );


        // console.log(lineObjs)





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

        controls.minDistance = 1.1 * this.RADIUS;
        controls.maxDistance = 5 * this.RADIUS;

        camera.position.set(0, 0, 2 * this.RADIUS);


        function eerp (a,b,t){
            return Math.pow(a,1-t)*Math.pow(b,t)
        }



        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            let dist = controls.getDistance() - self.RADIUS;
            let max_dist = controls.maxDistance - self.RADIUS;
            let speed = eerp(0.01,100,dist/max_dist)
            if(speed>1) speed=1;
            controls.rotateSpeed = speed
            

            material.uniforms.mousePos.value = mouse;




            renderer.render(scene, camera);
        };

        animate();
    }


}

export { Earth as Earth }