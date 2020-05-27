import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Two Body Gravity System
// 1. Exact solution method
//      Kepler Problem
// 2. Using simple integration
// 3. Using Verlet integration

let aspectRatio = window.innerWidth / window.innerHeight
let camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({ antialias: true });

let geometry = new THREE.SphereGeometry(1, 8, 6);
let material = new THREE.MeshNormalMaterial();
let body1 = new THREE.Mesh(geometry, material);
let body2 = new THREE.Mesh(geometry, material);

let controls = new OrbitControls(camera, renderer.domElement);
let stats = Stats();

init();
animate();
function init() {
    let container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(stats.dom);

    camera.position.set(0, 0, 5);
    controls.update();

    scene.add(body1);
    scene.add(body2);

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', OnWindowResize, false);
}

function OnWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    let d = new Date();
    let t = d.getMilliseconds()*0.001;
    let w = 2.0*Math.PI;
    let phi = w*t;
    let sinPos = Math.sin(phi);
    let cosPos = Math.cos(phi);
    body1.position.set(sinPos, cosPos, 0);
    body2.position.set(cosPos, 0, 0);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}
