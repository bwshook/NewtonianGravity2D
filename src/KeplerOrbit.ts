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
    initEnergy: number;

    // Yoshida Integ. Constants
    w0 = -Math.cbrt(2.0)/(2.0 - Math.cbrt(2.0));
    w1 = 1.0/(2.0 - Math.cbrt(2.0));
    c1 = this.w1/2.0;
    c2 = (this.w0 + this.w1)/2.0;

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
        this.initEnergy = this.lagrangianEnergy();

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

        // Yoshida coeffs
        // console.log(`w0:${this.w0} w1:${this.w1} c1:${this.c1} c2:${this.c2} c3:${this.c2} c4:${this.c1}`);
        // console.log(`d1:${this.w1} d2:${this.w0} d3:${this.w1}`);
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

    public lagrangianEnergy(): number {
        // L = T - U
        // T: Sum of kinetic energy
        // T = Sum(0.5*m[n]*v[n]**2, n=1:N)
        // U: Sum of potential energy
        let T = 0.5*this.m2*this.v.lengthSq();
        let U = (this.G*this.m1*this.m2)/this.r.length();
        return T - U;
    }

    public lagrangianEnergy2(): number {
        // L = T - U
        // T: Sum of kinetic energy
        // T = Sum(0.5*m[n]*v[n]**2, n=1:N)
        // U: Sum of potential energy
        let T = 0.5*this.m2*this.v2b.lengthSq();
        let U = (this.G*this.m1*this.m2)/this.r2b.length();
        return T - U;
    }

    public update(deltaTime: number) {
        let rtemp = this.r.clone();
        let vtemp = this.v.clone();
        let error = 1;
        let ticks = Math.floor(1.1*this.v.lengthSq());
        let tol = 1e-8;
        do {
            this.r.copy(rtemp);
            this.v.copy(vtemp);
            let dt = deltaTime/ticks;
            for(let i = 0; i < ticks; i++) {
                this.verlet_update(dt);
            }
            ticks++;
            error = Math.abs(this.lagrangianEnergy() - this.initEnergy);
        } while(error > tol && ticks < 200)
        return ticks-1;
    }

    private simple_update(deltaTime: number) {
        // Calculate acceleration on body2
        // F = m*a -> a = F/m -> a = (G*m1*m2)/(m2*r^2)
        let dv = this.acceleration(this.r);
        dv.multiplyScalar(deltaTime);
        // Add to current velocity vector
        this.v.add(dv);
        // Add to current position vector
        let dr = this.v.clone();
        dr.multiplyScalar(deltaTime);
        this.r.add(dr);
    }

    private verlet_update(deltaTime: number) {
        let a = this.acceleration(this.r);
        let dt = deltaTime;
        let dt2 = deltaTime*deltaTime;
        let dr_v = this.v.clone();
        dr_v.multiplyScalar(dt);
        let dr_a = a.clone();
        dr_a.multiplyScalar(0.5*dt2);
        let r_t_dt = this.r.clone();
        r_t_dt.add(dr_v);
        r_t_dt.add(dr_a);

        let v_t_dt_2 = this.v.clone();
        let dv = a.clone();
        dv.multiplyScalar(0.5*dt);
        v_t_dt_2.add(dv);

        let v_t_dt = v_t_dt_2.clone();
        let dv_t_dt = this.acceleration(r_t_dt);
        dv_t_dt.multiplyScalar(0.5*deltaTime);
        v_t_dt.add(dv_t_dt);

        this.r = r_t_dt;
        this.v = v_t_dt;
    }

    private acceleration(r: Vector3): Vector3 {
        let rhat = r.clone();
        rhat.normalize();
        // Calculate acceleration on body2
        // F = m*a -> a = F/m -> a = (G*m1*m2)/(m2*r^2)
        let a = (this.G*this.m1)/r.lengthSq();
        return rhat.multiplyScalar(-a);
    }

    private yoshida_update(deltaTime: number) {
        let x1d = this.v.clone();
        x1d.multiplyScalar(this.c1*deltaTime);
        let x1 = this.r.clone();
        x1.add(x1d);

        let v1d = this.acceleration(x1);
        v1d.multiplyScalar(this.w1*deltaTime);
        let v1 = this.v.clone();
        v1.add(v1d);

        let x2d = v1d.clone();
        x2d.multiplyScalar(this.c2*deltaTime);
        let x2 = x1.clone();
        x2.add(x2d);

        let v2d = this.acceleration(x2);
        v2d.multiplyScalar(this.w0*deltaTime);
        let v2 = v1.clone();
        v2.add(v2d);

        let x3d = v2d.clone();
        x3d.multiplyScalar(this.c2*deltaTime);
        let x3 = x2.clone();
        x3.add(x3d);

        let v3d = this.acceleration(x3);
        v3d.multiplyScalar(this.w1*deltaTime);
        let v3 = v2.clone();
        v3.add(v3d);

        let x4d = v3d.clone();
        x4d.multiplyScalar(this.c1*deltaTime);
        let x4 = x3.clone();
        x4.add(x4d);

        this.r.copy(x4);
        this.v.copy(v3);
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
