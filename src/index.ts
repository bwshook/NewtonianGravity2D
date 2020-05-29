import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class KeplerOrbit {

  // Initial parameters
  m1: number;
  m2: number;
  rmin: number;
  vmin: number;

  // Internal parameters
  static G = 1.0; // Gravitation constant
  u: number; // Reduced mass
  l: number; // Angular momentum
  g: number; // Gamma
  c: number; // Orbital constant
  a: number; // Orbital magnitude
  e: number; // Eccentricity

  constructor(m1:number, m2:number, rmin:number, vmin:number) {
    this.m1 = m1;
    this.m2 = m2;
    this.rmin = rmin;
    this.vmin = vmin;

    let u = (m1*m2)/(m1+m2);
    let l = rmin*u*vmin;
    let g = KeplerOrbit.G*m1*m2;
    let c = (l*l)/(g*u);
    let a = 1/rmin - 1/c;
    let e = a*c;

    // Save for later use
    this.u = u;
    this.l = l;
    this.g = g;
    this.c = c;
    this.a = a;
    this.e = e;
  }

  distance(phi: number): number {
    return( this.c/(1+this.e*Math.cos(phi)) );
  }

  public trajectory(segments: number) {
    let points: Array<number> = [];
    let deltaPhi = 2.0*Math.PI/segments
    for(let i = 0; i <= segments; i++) {
      let phi = deltaPhi*(i%segments);
      let r = this.distance(phi);
      let x = r*Math.cos(phi);
      let y = r*Math.sin(phi);
      points.push(x, 0.0, y);
    }
    let lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    let traj = new THREE.Line(lineGeometry, lineMaterial);
    return(traj);
  }
}

// Two Body Gravity System
// 1. Exact solution method
//      Kepler Problem
// 2. Using simple integration
// 3. Using Verlet integration

let aspectRatio = window.innerWidth / window.innerHeight
let camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({ antialias: true });

let geometry = new THREE.SphereGeometry(0.2, 16, 16);
let material = new THREE.MeshNormalMaterial();
let body1 = new THREE.Mesh(geometry, material);
let body2 = new THREE.Mesh(geometry, material);
let grid = new THREE.GridHelper(10, 10);

let controls = new OrbitControls(camera, renderer.domElement);
let stats = Stats();

let phi = 0.0;
let orbit = new KeplerOrbit(1000, 1, 1, 33);

init();
animate();
function init() {
    let container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(stats.dom);

    camera.position.set(10, 10, 10);
    controls.update();

    scene.add(body1);
    scene.add(body2);
    scene.add(grid);
    scene.add(orbit.trajectory(128));

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
    body1.position.set(0, 0, 0);
    phi += 0.01;
    let r = orbit.distance(phi);
    let x = r*Math.cos(phi);
    let y = r*Math.sin(phi);
    body2.position.set(x, 0, y);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}
