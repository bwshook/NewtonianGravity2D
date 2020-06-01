// Third-Party modules
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Local modules
import { SceneManager } from "./SceneManager";
import { KeplerOrbit } from "./KeplerOrbit";

class KeplerApp extends SceneManager {
    stats: Stats;
    orbit: KeplerOrbit;
    phi: number;
    body1: THREE.Mesh;
    body2: THREE.Mesh;

    constructor(container: HTMLDivElement, canvas: HTMLCanvasElement) {
        super(canvas);

        this.phi = 0; // Orbital phase (radians)
        this.orbit = new KeplerOrbit(1, 1, 1, 1);

        // Add objects
        let geometry = new THREE.SphereGeometry(0.2, 16, 16);
        let material = new THREE.MeshNormalMaterial();
        this.body1 = new THREE.Mesh(geometry, material);
        this.body2 = new THREE.Mesh(geometry, material);
        let grid = new THREE.GridHelper(10, 10);

        // Add orbit controls
        let controls = new OrbitControls(this.camera, 
            this.renderer.domElement);

        // Add stats 
        this.stats = Stats();
        container.appendChild(this.stats.dom);

        this.camera.position.set(10, 10, 10);
        controls.update();

        this.scene.add(this.body1);
        this.scene.add(this.body2);
        this.scene.add(grid);
        this.scene.add(this.orbit.trajectory(128));
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();
        let r = this.orbit.distance(this.phi);
        let x = r*Math.cos(this.phi);
        let y = r*Math.sin(this.phi);
        this.body2.position.set(x, 0, y);
        this.phi += 0.01;
        this.stats.update();
        super.update()
    }
}

export { KeplerApp };