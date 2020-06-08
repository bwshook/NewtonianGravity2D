import * as THREE from "three";

import { twobody } from "./TwoBodyOrbit";
import { Vector3 } from "three";

class KeplerOrbit {
    // Initial parameters
    m1: number; // Mass body 1 (at origin)
    m2: number; // Mass body 2
    G: number; // Gravitation constant
    ri: Vector3; // Position of body 2
    vi: Vector3; // Velocity of body 2

    // Internal parameters
    // u: number; // Reduced mass
    // l: number; // Angular momentum
    // g: number; // Gamma
    // c: number; // Orbital constant
    // A: number; // Orbital magnitude
    // e: number; // Eccentricity
    // a: number; // Half-length of semi-major axis

    constructor(m1: number, m2: number, G: number, ri: Vector3, vi: Vector3) {
        this.m1 = m1;
        this.m2 = m2;
        this.G = G;
        this.ri = ri;
        this.vi = vi;

        // let u = (m1 * m2) / (m1 + m2);
        // let l = rmin * u * vi;
        // let g = KeplerOrbit.G * m1 * m2;
        // let c = (l * l) / (g * u);
        // let A = 1 / rmin - 1 / c;
        // let e = A * c;
        // let a = c / (1 - e**2);
        // console.log("Eccentricity: " + e);
        // console.log("A: " + A);
        // console.log("a?: " + a);
        // console.log("c: " + c);
        // console.log("Gamma: " + g);
        // console.log("Angular momentum: " + l);
        // console.log("Reduced mass: " + u);

        // Save for later use
        // this.u = u; this.l = l;
        // this.g = g;
        // this.c = c;
        // this.A = A;
        // this.a = a;
        // this.e = e;

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

    position(time: number): THREE.Vector3 {
        // TIME stepping?
        // Current State -> Next state transistioning
        let finalState = twobody(this.mu, time, rei, vei);
        return finalState[0];
    }

    // distance(phi: number): number {
    //     return(this.c / (1 + this.e * Math.cos(phi)));
    // }

    // public trajectory(segments: number) {
    //     let points: Array<number> = [];
    //     let deltaPhi = 2.0 * Math.PI / segments
    //     for (let i = 0; i <= segments; i++) {
    //         let phi = deltaPhi * (i % segments);
    //         let r = this.distance(phi);
    //         let x = r * Math.cos(phi);
    //         let y = r * Math.sin(phi);
    //         points.push(x, 0.0, y);
    //     }
    //     let lineGeometry = new THREE.BufferGeometry();
    //     lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    //     let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    //     let traj = new THREE.Line(lineGeometry, lineMaterial);
    //     return (traj);
    // }
}
export { KeplerOrbit };
