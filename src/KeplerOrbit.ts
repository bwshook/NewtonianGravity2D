import * as THREE from "three";

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

    constructor(m1: number, m2: number, rmin: number, vmin: number) {
        this.m1 = m1;
        this.m2 = m2;
        this.rmin = rmin;
        this.vmin = vmin;

        let u = (m1 * m2) / (m1 + m2);
        let l = rmin * u * vmin;
        let g = KeplerOrbit.G * m1 * m2;
        let c = (l * l) / (g * u);
        let a = 1 / rmin - 1 / c;
        let e = a * c;
        console.log("Eccentricity: " + e);
        console.log("A: " + a);
        console.log("c: " + c);
        console.log("Gamma: " + g);
        console.log("Angular momentum: " + l);
        console.log("Reduced mass: " + u);

        // Save for later use
        this.u = u;
        this.l = l;
        this.g = g;
        this.c = c;
        this.a = a;
        this.e = e;
    }

    phase(time: number): number {
        let e2 = this.e**2;
        let a = 0.5*(e2)*time;
        let b = 2.0*this.e*Math.sin(time);
        let c = 0.25*e2*Math.sin(2.0*time);
        let phi = (a + time + b + c)/(this.u*this.l);
        return phi;
    }

    distance(phi: number): number {
        return(this.c / (1 + this.e * Math.cos(phi)));
    }

    public trajectory(segments: number) {
        let points: Array<number> = [];
        let deltaPhi = 2.0 * Math.PI / segments
        for (let i = 0; i <= segments; i++) {
            let phi = deltaPhi * (i % segments);
            let r = this.distance(phi);
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
