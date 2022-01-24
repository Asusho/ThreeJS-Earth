
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as loader from "ts-loader/dist";


import vShader from './shaders/vertexShader.glsl.js';
import fShader from './shaders/fragmentShader.glsl.js';
import { SingleEntryPlugin } from "webpack";
import { Test } from "./test.js";



// import * as capitalsJSON from './data/capitals.geojson'; // This import style requires "esModuleInterop", see "side notes"


class CityGame {


    private cities: City[];

    private earth ;



    public drawCityFromLongLat(scene, city, color) {
        let { x, y, z } = this.earth.convertLongLatToSpherePos(city.long, city.lat);

        let sphere = new THREE.SphereGeometry(0.1, 8, 8);

        var cityMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color)
        });

        let cityMesh = new THREE.Mesh(sphere, cityMat);

        cityMesh.position.set(x, y, z);
        scene.add(cityMesh);
        return cityMesh;
    }


    constructor(scene, camera, earth, renderer) {
        function onMouseClick(event) {

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components

            mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
            mouse.y = - (event.clientY / renderer.domElement.height) * 2 + 1;

            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            let clickedPoint = raycaster.intersectObjects(scene.children)[0].point;

            if (pointMesh == null) pointMesh = this.drawCityFromLongLat(scene, { long: 0, lat: 0 }, 0xffffff);

            pointMesh.position.set(clickedPoint.x, clickedPoint.y, clickedPoint.z);

            // console.log(earth.convertSpherePosToLongLat(clickedPoint.x,clickedPoint.y,clickedPoint.z))
        }

        this.earth = earth;

        let pointMesh: THREE.Mesh = null;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();


        window.addEventListener('click', onMouseClick, false);


        var gameCanvas = document.createElement("div");
        gameCanvas.style.height = "100px";
        gameCanvas.style.width = "100vw";
        gameCanvas.style.backgroundColor = "rgba(0,0,0,0.5)";
        gameCanvas.style.zIndex = "1";
        gameCanvas.style.position = "absolute";
        gameCanvas.style.bottom = "0";
        document.body.appendChild(gameCanvas)



        let Marseille = {
            lat: 43.296482,
            long: 5.36978

        }

        let Londres = {
            lat: 51.482577,
            long: -0.007659


        }

        let Lisbonne = {
            lat: 38.736946,
            long: -9.142685

        }











        this.drawCityFromLongLat(scene, Marseille, 0x0000ff);
        this.drawCityFromLongLat(scene, Londres, 0xff0000);
        this.drawCityFromLongLat(scene, Lisbonne, 0x00ff00);


        this.cities = [];

        var capitalsJSON = require('./data/capitals.json')["features"];

        capitalsJSON.forEach(element => {
            var name = element["properties"]["city"];
            var country = element["properties"]["country"];
            var coords = new THREE.Vector2(element["geometry"]["coordinates"][0], element["geometry"]["coordinates"][1]);

            this.cities.push(new City(name, coords, country));
        })
        // console.log(this.cities);




        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        let index = getRandomInt(this.cities.length);

        let cityToGuess = this.cities[index];
        console.log(cityToGuess);

        let para = document.createElement("p");
        para.style.color = "white";

        para.innerText = cityToGuess.name + " (" + cityToGuess.country + ")";
        gameCanvas.appendChild(para);


    }


}


class City {
    public name;
    public coordinates: THREE.Vector2;
    public country;

    constructor(name, coordinates, country) {
        this.name = name;
        this.coordinates = coordinates;
        this.country = country;
    }
}




export { CityGame as CityGame };