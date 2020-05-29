import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Two Body Gravity System
// 1. Exact solution method
//      Kepler Problem
// 2. Using simple integration
// 3. Using Verlet integration

let aspectRatio = window.innerWidth / window.innerHeight
let camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({ antialias: true });

let geometry = new THREE.SphereGeometry(1, 16, 16);
let material = new THREE.MeshNormalMaterial();
let body1 = new THREE.Mesh(geometry, material);
let body2 = new THREE.Mesh(geometry, material);
let grid = new THREE.GridHelper(10, 10);

let controls = new OrbitControls(camera, renderer.domElement);
let stats = Stats();

let phi = 0.0;

init();
animate();
function init() {
    let container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(stats.dom);

    camera.position.set(0, 0, 10);
    controls.update();

    scene.add(body1);
    scene.add(body2);
    scene.add(grid);

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', OnWindowResize, false);
}

function OnWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function kepler(m1:number, m2:number, rmin:number, vmin:number, phi:number) {
  // Solution to the Kepler Problem
  let u = (m1*m2)/(m1+m2); // Reduced Mass
  let G = 6.67430e-11; // Grav. Constant
  G = 1;
  let l = rmin*u*vmin; // Angular momentum
  let g = G*m1*m2; // Gamma
  let c = (l*l)/(g*u); //
  let A = 1/rmin - 1/c; // Oribital magnitude
  let e = A*c; // Eccentricity
  return( c/(1+e*Math.cos(phi)) );
}


function animate() {
    let d = new Date();
    let t = d.getMilliseconds()*0.001;
    body1.position.set(0, 0, 0);
    phi += 0.01;
    let r = kepler(10, 1, 4, 2, phi);
    let x = r*Math.cos(phi);
    let y = r*Math.sin(phi);
    body2.position.set(x, 0, y);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}
