
import * as THREE from "three"
import { Earth } from "./earth";
import { QuizDiv } from "./quizDiv";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



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

    public loader;

    public prevGuesses;

    public pins;
    public pointMesh;


    public Replay() {
        this.quizDiv.ToggleEndDivVisibility();

        this.Reset();
        this.pins.forEach(pin => {
            this.scene.remove(pin);
        });
        this.pins = [];

    }

    private Reset() {
        this.current_round = -1;
        this.score = 0;
        this.prevGuesses = [];
        this.guessPoint = null;
        this.pointMesh = null;
        this.NextGuess();


    }


    public addScore(distance) {

        if (distance < 100) {
            this.score += 1000;
        }
        else {
            if (distance < 2000) {
                this.score += Math.round(2535 - 333.5 * Math.log(distance));

            }
        }
    }

    public getScore() {
        return this.score;
    }

    public async load3DModel() {
        let mesh = undefined;
        let STATUS = "WAITING";
        return this.loader.loadAsync('./Images/pin.glb');
    }


    public async drawCityFromLongLat(scene, city, color) {
        let { x, y, z } = this.earth.convertLongLatToSpherePos(city.long, city.lat);

        let cityMesh = this.load3DModel();
        let mesh = null;
        await cityMesh.then(res => {
            scene.add(res.scene);
            res.scene.position.set(x, y, z);
            mesh = res.scene;
            mesh.lookAt(0, 0, 0)
        })

        return mesh;

    }




    public getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    public NextGuess() {
        this.current_round++;
        this.prevGuesses.push(this.cityToGuess);
        if (this.current_round < MAX_ROUND) {

            do {
                let index = this.getRandomInt(this.cities.length);
                this.cityToGuess = this.cities[index];
            } while (this.prevGuesses.includes(this.cityToGuess))

            this.quizDiv.UpdateRound(this.current_round, MAX_ROUND);
            this.quizDiv.UpdateCityToGuess(this.cityToGuess.name, this.cityToGuess.country);
        }
        else {
            this.quizDiv.ToggleEndDivVisibility();
        }
    }

    public drawCurve(p1, p2) {
        let pts = [];
        for (let i = 0; i <= 20; i++) {
            let p = new THREE.Vector3().lerpVectors(p1, p2, i / 20)
            p.normalize()
            p.multiplyScalar(this.earth.RADIUS + this.earth.RADIUS / 20 * Math.sin(Math.PI * i / 20));
            pts.push(p)
        }

        let path = new THREE.CatmullRomCurve3(pts);

        const points = path.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Create the final object to add to the scene
        const curveObject = new THREE.Line(geometry, material);
        this.scene.add(curveObject);

        this.pins.push(curveObject);

    }



    public ValidateGuess(city, guess) {

        let R = 6378;

        let tmp1 = this.drawCityFromLongLat(this.scene, { long: city.coordinates.x, lat: city.coordinates.y }, 0xff0000);
        let tmp2 = this.drawCityFromLongLat(this.scene, { long: guess.long, lat: guess.lat }, 0x0000ff);
        tmp1.then(res => { this.pins.push(res); })
        tmp2.then(res => { this.pins.push(res); })


        let lat1 = city.coordinates.y * Math.PI / 180;
        let lat2 = guess.lat * Math.PI / 180;
        let lng1 = city.coordinates.x * Math.PI / 180;
        let lng2 = guess.long * Math.PI / 180;

        let sinP1 = Math.sin((lat1 - lat2) / 2)
        let sinP2 = Math.sin((lng1 - lng2) / 2)
        
        let distance = 2 * R * Math.asin(Math.sqrt(sinP1 * sinP1 + Math.cos(lat1) * Math.cos(lat2) * sinP2 * sinP2));
        distance = Math.round(distance);
        console.log("🚀 ~ file: CityGame.ts ~ line 173 ~ CityGame ~ ValidateGuess ~ distance", distance)

        this.addScore(distance);
        this.quizDiv.UpdateScore(this.score);


        let p1 = this.earth.convertLongLatToSpherePos(guess.long, guess.lat);
        let p2 = this.earth.convertLongLatToSpherePos(city.coordinates.x, city.coordinates.y)

        this.drawCurve(p1, p2);

        this.NextGuess();
    }


    constructor(scene, camera, earth, renderer) {
        var self = this;
        function onMouseClick(event) {

            if (event.target.tagName.toLowerCase() == "canvas") {

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


                if (self.pointMesh == null) {


                    self.pointMesh = self.drawCityFromLongLat(scene, earth.convertSpherePosToLongLat(clickedPoint.x, clickedPoint.y, clickedPoint.z), 0xffffff);
                    self.pointMesh.then(res => {
                        self.pointMesh = res;
                        self.pins.push(self.pointMesh);
                        self.guessPoint = earth.convertSpherePosToLongLat(clickedPoint.x, clickedPoint.y, clickedPoint.z);
                    })

                }
                else {

                    if (clickedPoint) {

                        self.pointMesh.position.set(clickedPoint.x, clickedPoint.y, clickedPoint.z);
                        self.guessPoint = earth.convertSpherePosToLongLat(clickedPoint.x, clickedPoint.y, clickedPoint.z);
                        self.pointMesh.lookAt(0, 0, 0)
                    }
                }
           }

        }

        this.earth = earth;

        this.loader = new GLTFLoader();


        this.scene = scene;
        this.pins = [];

        this.pointMesh = null;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();


        window.addEventListener('click', onMouseClick, false);


        this.cities = [];

        var capitalsJSON = require('./data/capitals.json')["features"];

        capitalsJSON.forEach(element => {
            var name = element["properties"]["city"];
            var country = element["properties"]["country"];
            var coords = new THREE.Vector2(element["geometry"]["coordinates"][0], element["geometry"]["coordinates"][1]);

            if (name && country && coords) this.cities.push(new City(name, coords, country));
        })


        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        let index = getRandomInt(this.cities.length);

        this.cityToGuess = this.cities[index];

        this.quizDiv = new QuizDiv(self);

        this.quizDiv.UpdateRound(this.current_round, MAX_ROUND);
        this.quizDiv.UpdateCityToGuess(this.cityToGuess.name, this.cityToGuess.country);

        this.prevGuesses = [];

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