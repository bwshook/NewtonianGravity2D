import * as THREE from "three";

class SceneManager {
    clock: THREE.Clock;
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    width: number;
    height: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.clock = new THREE.Clock();
        this.scene = this.setupScene();
        this.renderer = this.setupRenderer();
        this.camera = this.setupCamera();
    }

    private setupScene(): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#000");
        return scene;
    }

    private setupRenderer(): THREE.WebGLRenderer {
        let options = { canvas: this.canvas, antialias: true, alpha: true }
        const renderer = new THREE.WebGLRenderer(options); 
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        renderer.setPixelRatio(DPR);
        renderer.setSize(this.width, this.height);
        return renderer;
    }

    private setupCamera(): THREE.PerspectiveCamera {
        const aspectRatio = this.width / this.height;
        const fieldOfView = 45;
        const nearPlane = 0.1;
        const farPlane = 10000; 
        const camera = new THREE.PerspectiveCamera(fieldOfView, 
            aspectRatio, nearPlane, farPlane);
        return camera;
    }

    public update(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public onWindowResize(): void {
        //this.canvas.style.width = "100%";
        //this.canvas.style.height = "100%";
        this.width = this.canvas.clientWidth
        this.height = this.canvas.clientHeight
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
}

export { SceneManager };