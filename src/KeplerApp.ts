// Third-Party modules
import * as THREE from "three";
import { Vector3 } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Local modules
import { SceneManager } from "./SceneManager";
import { KeplerOrbit } from "./KeplerOrbit";

class KeplerApp extends SceneManager {
    stats: Stats;
    orbit: KeplerOrbit;
    body1: THREE.Mesh;
    body2: THREE.Mesh;
    body2b: THREE.Mesh;
    velVector: THREE.ArrowHelper;

    constructor(container: HTMLDivElement, canvas: HTMLCanvasElement) {
        super(canvas);

        let ri = new Vector3(1, 0, 0);
        let vi = new Vector3(0, 0, 20)
        this.orbit = new KeplerOrbit(1000, 1, 1, ri, vi);

        // Add objects
        let geometry = new THREE.SphereGeometry(0.2, 16, 16);
        let material = new THREE.MeshNormalMaterial();

        this.body1 = new THREE.Mesh(geometry, material);
        this.scene.add(this.body1);

        this.body2 = new THREE.Mesh(geometry, material);
        this.scene.add(this.body2);
        this.body2b = this.body2.clone();
        this.scene.add(this.body2b);

        let grid = new THREE.GridHelper(10, 10);
        this.scene.add(grid);

        // Velocity vector
        let dir = new Vector3(1, 0, 0);
        let origin = new Vector3(0, 0, 0);
        this.velVector = new THREE.ArrowHelper(dir, origin);
        this.scene.add(this.velVector);

        this.scene.add(this.orbit.trajectory(128));

        // Add orbit controls
        let controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Add stats
        this.stats = Stats();
        container.appendChild(this.stats.dom);

        this.camera.position.set(10, 10, 10);
        controls.update();

    }

    update() {
        let dTime = this.clock.getDelta();
        this.orbit.update_twobody(dTime*0.005);
        this.orbit.update(dTime*0.005);

        // Update body2 position
        this.body2.position.copy(this.orbit.r);
        this.body2b.position.copy(this.orbit.r2b);

        // Update velocity vector
        let vel = this.orbit.v.clone();
        this.velVector.setLength(vel.length());
        this.velVector.setDirection(vel.normalize());
        this.velVector.position.copy(this.orbit.r);

        this.stats.update();
        super.update()
    }
}

export { KeplerApp };
