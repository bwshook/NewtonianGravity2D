// Local modules
import { KeplerApp } from "./KeplerApp";

// Two Body Gravity System
// 1. Exact solution method
//      Kepler Problem
//      Sliders to adjust initial position, velocity, mass
//      Time scale slider
//      Center of mass origin?
//      Class for App
// 2. Using simple integration
// 3. Using Verlet integration
const container = document.getElementById("canvasCont") as HTMLDivElement;
const canvas = document.getElementById("canvas3D") as HTMLCanvasElement;
const keplerApp = new KeplerApp(container, canvas);

bindEventListeners();
render();

function bindEventListeners() {
    window.onresize = resizeCanvas;
    resizeCanvas();	
}

function resizeCanvas() {
    keplerApp.onWindowResize();
}

function render() {
    requestAnimationFrame(render);
    keplerApp.update();
}
