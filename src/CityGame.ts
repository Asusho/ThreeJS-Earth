
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as loader from "ts-loader/dist";


import vShader from './shaders/vertexShader.glsl.js';
import fShader from './shaders/fragmentShader.glsl.js';
import { SingleEntryPlugin } from "webpack";
import { Earth } from "./earth";
import { QuizDiv } from "./quizDiv";



// import * as capitalsJSON from './data/capitals.geojson'; // This import style requires "esModuleInterop", see "side notes"

const MAX_ROUND = 10;

class CityGame {


    public cities: City[];

    public earth: Earth;

    public cityToGuess: City;

    public guessPoint;

    public scene;

    public quizDiv;

    public current_round = 0;

    private score = 0;



    public addScore(distance){

        if(distance < 100){
            this.score += 1000;
        }
        else{
            if(distance < 2000){
                this.score += Math.round(2535 - 333.5*Math.log(distance)); 
                
            }
        }
    }

    public getScore(){
        return this.score;
    }


    public drawCityFromLongLat(scene, city, color) {
        let { x, y, z } = this.earth.convertLongLatToSpherePos(city.long, city.lat);

        let sphere = new THREE.SphereGeometry(0.05, 8, 8);

        var cityMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color)
        });

        let cityMesh = new THREE.Mesh(sphere, cityMat);

        cityMesh.position.set(x, y, z);
        scene.add(cityMesh);
        return cityMesh;
    }

    public getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    public NextGuess() {
        this.current_round++;
        if (this.current_round < MAX_ROUND) {
            let index = this.getRandomInt(this.cities.length);

            this.cityToGuess = this.cities[index];
            console.log(this.cityToGuess);

            this.quizDiv.UpdateRound(this.current_round,MAX_ROUND);
            this.quizDiv.UpdateCityToGuess(this.cityToGuess.name, this.cityToGuess.country);
        }
    }

    public drawCurve(p1, p2) {
        let pts = [];
        for (let i = 0; i <= 20; i++) {
            let p = new THREE.Vector3().lerpVectors(p1, p2, i / 20)
            p.normalize()
            p.multiplyScalar(10 + 0.5 * Math.sin(Math.PI * i / 20));
            pts.push(p)
        }

        let path = new THREE.CatmullRomCurve3(pts);

        const points = path.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Create the final object to add to the scene
        const curveObject = new THREE.Line(geometry, material);
        this.scene.add(curveObject);

        // console.log(curveObject)

    }



    public ValidateGuess(city, guess) {
        // console.log("Guess");

        let R = 6378;

        this.drawCityFromLongLat(this.scene, { long: city.coordinates.x, lat: city.coordinates.y }, 0xff0000);
        this.drawCityFromLongLat(this.scene, { long: guess.long, lat: guess.lat }, 0x0000ff);
        let lat1 = city.coordinates.y * Math.PI / 180;
        let lat2 = guess.lat * Math.PI / 180;
        let lng1 = city.coordinates.x * Math.PI / 180;
        let lng2 = guess.long * Math.PI / 180;

        let sinP1 = Math.sin((lat1 - lat2) / 2)
        let sinP2 = Math.sin((lng1 - lng2) / 2)

        // console.log(guess);

        // console.log(city);
        let distance = 2 * R * Math.asin(Math.sqrt(sinP1 * sinP1 + Math.cos(lat1) * Math.cos(lat2) * sinP2 * sinP2));
        distance = Math.round(distance);

        this.addScore(distance);
        this.quizDiv.UpdateScore(this.score);

        console.log("distance : " + distance + "km");


        let p1 = this.earth.convertLongLatToSpherePos(guess.long, guess.lat);
        let p2 = this.earth.convertLongLatToSpherePos(city.coordinates.x, city.coordinates.y)


        // console.log(p1)
        // console.log(p2)

        this.drawCurve(p1, p2);


        this.NextGuess();
    }


    constructor(scene, camera, earth, renderer) {
        function onMouseClick(event) {

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components

            mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
            mouse.y = - (event.clientY / renderer.domElement.height) * 2 + 1;

            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            var objs = raycaster?.intersectObjects(scene.children);
            var obj = raycaster?.intersectObjects(scene.children)[0];

            for (let element of objs) {
                if (element.object.name == "earth") {
                    obj = element;
                    break;
                }

            }
            let clickedPoint = obj?.point;

            if (pointMesh == null) pointMesh = self.drawCityFromLongLat(scene, { long: 0, lat: 0 }, 0xffffff);

            if (clickedPoint) {

                pointMesh.position.set(clickedPoint.x, clickedPoint.y, clickedPoint.z);

                self.guessPoint = earth.convertSpherePosToLongLat(clickedPoint.x, clickedPoint.y, clickedPoint.z);
            }
            // console.log(earth.convertSpherePosToLongLat(clickedPoint.x,clickedPoint.y,clickedPoint.z))
        }

        this.earth = earth;

        var self = this;

        this.scene = scene;

        let pointMesh: THREE.Mesh = null;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();


        window.addEventListener('click', onMouseClick, false);

        // let Marseille = {
        //     lat: 43.296482,
        //     long: 5.36978

        // }

        // let Londres = {
        //     lat: 51.482577,
        //     long: -0.007659


        // }

        // let Lisbonne = {
        //     lat: 38.736946,
        //     long: -9.142685

        // }


        // this.drawCityFromLongLat(scene, Marseille, 0x0000ff);
        // this.drawCityFromLongLat(scene, Londres, 0xff0000);
        // this.drawCityFromLongLat(scene, Lisbonne, 0x00ff00);






        this.cities = [];

        var capitalsJSON = require('./data/capitals.json')["features"];

        capitalsJSON.forEach(element => {
            var name = element["properties"]["city"];
            var country = element["properties"]["country"];
            var coords = new THREE.Vector2(element["geometry"]["coordinates"][0], element["geometry"]["coordinates"][1]);

            if (name && country && coords) this.cities.push(new City(name, coords, country));
        })
        // console.log(this.cities);




        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        let index = getRandomInt(this.cities.length);

        this.cityToGuess = this.cities[index];
        console.log(this.cityToGuess);




        this.quizDiv = new QuizDiv(self);

        this.quizDiv.UpdateRound(this.current_round,MAX_ROUND);
        this.quizDiv.UpdateCityToGuess(this.cityToGuess.name, this.cityToGuess.country);

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