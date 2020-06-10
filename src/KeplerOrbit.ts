import * as THREE from "three";

import { twobody } from "./TwoBodyOrbit";
import { Vector3 } from "three";

class KeplerOrbit {
    // Initial parameters
    m1: number; // mass body 1 (at origin)
    m2: number; // mass body 2 (at r)
    mu: number;
    mug: number;
    G: number; // gravitation constant
    ri: Vector3; // initial position of body 2
    vi: Vector3; // initial velocity of body 2
    r: Vector3; // position of body 2
    v: Vector3; // velocity of body 2

    r2b: Vector3; // position of body 2
    v2b: Vector3; // velocity of body 2

    c: number;
    eps: number;

    // Internal parameters
    time: number;

    constructor(m1: number, m2: number, G: number, ri: Vector3, vi: Vector3) {
        this.m1 = m1;
        this.m2 = m2;
        this.G = G;
        this.ri = ri;
        this.vi = vi;
        this.r = ri;
        this.v = vi;

        this.r2b = ri;
        this.v2b = vi;

        this.time = 0.0;

        this.mu = (m1 * m2) / (m1 + m2);
        this.mug = this.mu * this.G;

        this.c = 0;
        this.eps = 0;
        this.initParams();

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

    private initParams() {
        let riMag = this.ri.length();
        let viMag = this.vi.length();

        let rhat = this.ri.clone();
        rhat.normalize();

        let lv = new Vector3();
        lv.crossVectors(this.ri, this.vi);
        let l = lv.length()*this.mu;
        let g = this.G * this.m1 * this.m2;
        this.c = (l * l) / (g * this.mu);
        let A = (1/riMag - 1/this.c)/rhat.x
        this.eps = A * this.c;

        console.log("Reduced mass: " + this.mu);
        console.log("Eccentricity: " + this.eps);
        console.log("c: " + this.c);
        console.log("A: " + A);
        console.log("Gamma: " + g);
        console.log("Angular momentum: " + l);
    }

    public update(deltaTime: number) {
        // Calculate acceleration on body2
        // F = m*a -> a = F/m -> a = (G*m1*m2)/(m2*r^2)
        let acc = (this.G*this.m1)/this.r.lengthSq();
        // Make dv vector (towards body1)
        let dv = this.r.clone();
        dv.normalize();
        dv.multiplyScalar(-acc*deltaTime);
        // Add to current velocity vector
        this.v.add(dv);
        // Add to current position vector
        let dr = this.v.clone();
        dr.multiplyScalar(deltaTime);
        this.r.add(dr);
    }

    public update_twobody(deltaTime: number) {
        this.time += deltaTime;
        let nextState = twobody(this.m1*this.G, deltaTime, this.r2b, this.v2b);
        this.r2b = nextState[0];
        this.v2b = nextState[1];
    }

    public trajectory(segments: number) {
        let points: Array<number> = [];
        let deltaPhi = 2.0 * Math.PI / segments
        for (let i = 0; i <= segments; i++) {
            let phi = deltaPhi * (i % segments);
            let r = this.c / (1 + this.eps * Math.cos(phi));
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
