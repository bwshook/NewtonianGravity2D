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
    time: number;
    body1: THREE.Mesh;
    body2: THREE.Mesh;

    constructor(container: HTMLDivElement, canvas: HTMLCanvasElement) {
        super(canvas);

        this.time = 0; // Orbital phase (radians)
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
        let pos = this.orbit.position(this.time);
        this.body2.position.set(pos[0], 0, pos[1]);
        this.time += 0.01;
        this.stats.update();
        super.update()
    }
}

export { KeplerApp };
