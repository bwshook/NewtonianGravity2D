import * as THREE from "three";

import { twobody } from "./TwoBodyOrbit";
import { Vector3 } from "three";

class KeplerOrbit {
    // Initial parameters
    m1: number; // Mass body 1 (at origin)
    m2: number; // Mass body 2
    mu: number;
    mug: number;
    G: number; // Gravitation constant
    ri: Vector3; // initial position of body 2
    vi: Vector3; // initial velocity of body 2
    r: Vector3; // position of body 2
    v: Vector3; // velocity of body 2

    // Internal parameters
    time: number;

    constructor(m1: number, m2: number, G: number, ri: Vector3, vi: Vector3) {
        this.m1 = m1;
        this.m2 = m2;
        this.G = G;
        this.ri = ri;
        this.vi = vi;

        this.time = 0.0;

        this.mu = (m1 * m2) / (m1 + m2)
        this.mug = this.mu * this.G;

        // Earth gravitational constant (km^3/s^2)
        let earthMu = 398600.4415;

        // Time step (s)
        let tau = 1000;

        // Initial position (km)
        let rei = new THREE.Vector3();
        rei.setX(3871.56734351188);
        rei.setY(6365.21709672617);
        rei.setZ(-2670.28756008413);

        // Initial velocity (km/s)
        let vei = new THREE.Vector3();
        vei.setX(-5.20544460471574);
        vei.setY(4.25847877360187);
        vei.setZ(2.38188428278297);
        let finalState = twobody(earthMu, tau, rei, vei);

        let rf = finalState[0];
        let vf = finalState[1];
        console.log(`Init. Pos.: ${rei.x} ${rei.y} ${rei.z} ${rei.length()}`);
        console.log(`Init. Vel.: ${vei.x} ${vei.y} ${vei.z} ${vei.length()}`);
        console.log(`Final Pos.: ${rf.x} ${rf.y} ${rf.z} ${rf.length()}`);
        console.log(`Final Vel.: ${vf.x} ${vf.y} ${vf.z} ${vf.length()}`);
    }

    public update(deltaTime: number) {
        this.time += deltaTime;
        let nextState = twobody(this.mug, this.time, this.ri, this.vi);
        this.r = nextState[0];
        this.v = nextState[1];
    }

    public trajectory(segments: number) {
        let m1 = this.m1;
        let m2 = this.m2;
        let ri = this.ri.length();
        let vi = this.vi.length();
        let rhatx = this.ri.x/ri;

        let u = (m1 * m2) / (m1 + m2);
        let l = ri * u * vi;
        let g = this.G * m1 * m2;
        let c = (l * l) / (g * u);
        let A = (1 / ri - 1 / c)/rhatx;
        let e = A * c;
        let a = c / (1 - e**2);
        console.log("Eccentricity: " + e);
        console.log("A: " + A);
        console.log("a?: " + a);
        console.log("c: " + c);
        console.log("Gamma: " + g);
        console.log("Angular momentum: " + l);
        console.log("Reduced mass: " + u);

        let points: Array<number> = [];
        let deltaPhi = 2.0 * Math.PI / segments
        for (let i = 0; i <= segments; i++) {
            let phi = deltaPhi * (i % segments);
            let r = c / (1 + e * Math.cos(phi));
            let x = r * Math.cos(phi);
            let y = r * Math.sin(phi);
            points.push(x, 0.0, y);
        }
        let lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        let traj = new THREE.Line(lineGeometry, lineMaterial);
        return (traj);
    }
}
export { KeplerOrbit };
