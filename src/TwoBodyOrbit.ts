import * as THREE from "three";

function twobody(mu: number, tau: number, 
   ri: THREE.Vector3, vi: THREE.Vector3) {
   // solve the two body initial value problem
   // Goodyear's method
   //  
   // input
   //  mu  = gravitational constant (km**3/sec**2)
   //  tau = propagation time interval (seconds)
   //  ri  = initial eci position vector (kilometers)
   //  vi  = initial eci velocity vector (km/sec)
   // output
   //  rf = final eci position vector (kilometers)
   //  vf = final eci velocity vector (km/sec)
   // Adapted from David Eagle's MATLAB two-body code (see link below)
   // https://www.mathworks.com/matlabcentral/fileexchange/48723-matlab-functions-for-two-body-orbit-propagation?focused=3853951&tab=function

   let a0 = 0.025;
   let b0 = a0 / 42;
   let c0 = b0 / 72;
   let d0 = c0 / 110;
   let e0 = d0 / 156;
   let f0 = e0 / 210;
   let g0 = f0 / 272;
   let h0 = g0 / 342;
   let i0 = 1 / 24;
   let j0 = i0 / 30;
   let k0 = j0 / 56;
   let l0 = k0 / 90;
   let m0 = l0 / 132;
   let n0 = m0 / 182;
   let o0 = n0 / 240;
   let p0 = o0 / 306;
   // convergence criterion
   let tol = 1.0e-8;

   let rsdvs = ri.dot(vi);
   let rsm = ri.length();
   let vsm2 = vi.dot(vi);
   let zsma = 2.0 / rsm - vsm2 / mu;

   let psi = 0.0;
   let s1 = 0.0;
   let s2 = 0.0;
   let rfm = 0.0;
   let gg = 0.0;
   if (zsma > 0.0) {
      psi = tau * zsma;
   }

   let alp = vsm2 - 2.0 * mu / rsm;
   for (let z = 1; z <= 20; z++) {
      let m = 0;
      let psi2 = psi * psi;
      let psi3 = psi * psi2;
      let aas = alp * psi2;

      let zas = 0;
      if (aas != 0) {
         zas = 1 / aas;
      }
      while (Math.abs(aas) > 1) {
         m = m + 1;
         aas = 0.25 * aas;
      }
      let pc5 = a0 + (b0 + (c0 + (d0 + (e0 + (f0 + (g0 + h0 * aas) * aas) * aas) * aas) * aas) * aas) * aas;
      let pc4 = i0 + (j0 + (k0 + (l0 + (m0 + (n0 + (o0 + p0 * aas) * aas) * aas) * aas) * aas) * aas) * aas;
      let pc3 = (0.5 + aas * pc5) / 3;
      let pc2 = 0.5 + aas * pc4;
      let pc1 = 1.0 + aas * pc3;
      let pc0 = 1.0 + aas * pc2;

      if (m > 0) {
         while (m > 0) {
            m = m - 1;
            pc1 = pc0 * pc1;
            pc0 = 2 * pc0 * pc0 - 1;
         }
         pc2 = (pc0 - 1) * zas;
         pc3 = (pc1 - 1) * zas;
      }

      s1 = pc1 * psi;
      s2 = pc2 * psi2;
      let s3 = pc3 * psi3;
      gg = rsm * s1 + rsdvs * s2;
      let dtau = gg + mu * s3 - tau;
      rfm = Math.abs(rsdvs * s1 + mu * s2 + rsm * pc0);
      if (Math.abs(dtau) < Math.abs(tau) * tol) {
         break;
      } else {
         psi = psi - dtau / rfm;
      }
   }

   let rsc = 1 / rsm;
   let r2 = 1 / rfm;
   let r12 = rsc * r2;
   let fm1 = -mu * s2 * rsc;
   let ff = fm1 + 1;
   let fd = -mu * s1 * r12;
   let gdm1 = -mu * s2 * r2;
   let gd = gdm1 + 1;

   // compute final state vector
   let rf = new THREE.Vector3()
   let vf = new THREE.Vector3()
   for (let i = 0; i < 3; i++) {
      rf.setComponent(i, ff*ri.getComponent(i) + gg*vi.getComponent(i));
      vf.setComponent(i, fd*ri.getComponent(i) + gd*vi.getComponent(i));
   }
   return [rf, vf];
}

// Danby Stumpf Two-Body oribital calculation
// Adapted from David Eagle's MATLAB two-body code (source below)
// https://www.mathworks.com/matlabcentral/fileexchange/48723-matlab-functions-for-two-body-orbit-propagation?focused=3853951&tab=function
function danbyStumpf(mu: number, tau: number, 
   ri: THREE.Vector3, vi: THREE.Vector3) {
   // solve the two body initial value problem
   // input
   //  mu  = Reduced mass * Gravitational constant (kilometer^3/second^2)
   //  tau = propagation time interval (seconds)
   //  ri  = initial eci position vector (kilometers)
   //  vi  = initial eci velocity vector (km/sec)
   // output
   //  rf = final eci position vector (kilometers)
   //  vf = final eci velocity vector (km/sec)

   let pi2 = 2.0 * Math.PI;
   let tol = 1.0e-8;
   let r0 = ri.length();
   let v02 = vi.lengthSq();
   let alpha = 2 * mu / r0 - v02;
   let u = ri.dot(vi);
   let a = mu / alpha;
   let s: number;

   if (alpha > 0) {
      // initial guess for elliptic orbit
      let en = Math.sqrt(mu / (a * a * a));
      let ec = 1 - r0 / a;
      let es = u / (en * a * a);
      let e = Math.sqrt(ec * ec + es * es);
      tau = tau - Math.trunc(en * tau / pi2) * pi2 / en;

      if (tau < 0) {
         tau = tau + pi2 / en;
      }

      let y = en * tau - es;
      let z = es * Math.cos(y) + ec * Math.sin(y);

      let sigma = Math.abs(z) / z;
      if (z == 0)
         sigma = 1;

      let x = y + 0.85 * sigma * e;
      s = x / Math.sqrt(alpha);
   } else {
      // initial guess for hyperbolic orbit
      let r02 = r0 * r0;
      let r03 = r02 * r0;

      if ((Math.abs(tau * u / r02) < 1) && (Math.abs(tau * tau * (alpha / r02 + mu / r03)) < 3)) {
         let t1 = 0.75 * tau;
         let t2 = 0.25 * tau;

         s = t1 / r0 - 0.5 * t1 * t1 * u / r03 + t1 * t1 * t1
          * (alpha - mu / r0 + 3 * u * u / r02) / (6 * r03)
          + t1 * t1 * t1 * t1 * (u / (r02 * r03))
          * (-3 * alpha / 8 - 5 * u * u / (8 * r02) + 5 * mu / (12 * r0));

         let r1 = r0 * (1 - alpha * s * s / 2) + u * s
            * (1 - alpha * s * s / 6) + mu * s * s / 2;
         let u1 = (-r0 * alpha + mu) * s * (1 - s * s * alpha / 6)
            + u * (1 - alpha * s * s / 2);
         let r12 = r1 * r1;
         let r13 = r1 * r12;

         s = s + t2 / r1 - .5 * t2 * t2 * u1 / r13 + t2 * t2 * t2
            * (alpha - mu / r1 + 3 * u1 * u1 / r12) / (6 * r13)
            + t2 * t2 * t2 * t2 * (u1 / (r12 * r13))
            * (-3 * alpha / 8 - 5 * u1 * u1 / (8 * r12)
               + 5 * mu / (12 * r1));
      } else {
         let en = Math.sqrt(-mu / (a * a * a));
         let ch = 1 - r0 / a;
         let sh = u / Math.sqrt(-a * mu);
         let e = Math.sqrt(ch * ch - sh * sh);
         let dm = en * tau;

         s = -Math.log((-2 * dm + 1.8 * e) / (ch - sh)) / Math.sqrt(-alpha);
         if (dm > 0)
            s = Math.log((2 * dm + 1.8 * e) / (ch + sh)) / Math.sqrt(-alpha);
      }
   }

   // solve universal form of Kepler's equation
   let nc = 0;
   let ssaved = s;
   let c0: number = 0;
   let c1: number = 0;
   let c2: number = 0;
   let c3: number = 0;
   let f: number = 0;
   let fp: number = 0;
   let fpp: number = 0;
   let fppp: number = 0;

   while (1) {
      nc = nc + 1;
      let x = s * s * alpha;

      let c = stumpff(x);
      let c0 = c[0];
      let c1 = c[1];
      let c2 = c[2];
      let c3 = c[3];

      c1 = c1 * s;
      c2 = c2 * s * s;
      c3 = c3 * s * s * s;

      f = r0 * c1 + u * c2 + mu * c3 - tau;
      fp = r0 * c0 + u * c1 + mu * c2;
      fpp = (-r0 * alpha + mu) * c1 + u * c0;
      fppp = (-r0 * alpha + mu) * c0 - u * alpha * c1;

      let ds = -f / fp;
      ds = -f / (fp + ds * fpp / 2);
      ds = -f / (fp + ds * fpp / 2 + ds * ds * fppp / 6);
      s = s + ds;

      if ((Math.abs(ds) < tol) || nc > 10)
         break;
   }

   f = 1 - (mu / r0) * c2;
   let g = tau - mu * c3;
   let fdot = -(mu / (fp * r0)) * c1;
   let gdot = 1 - (mu / fp) * c2;

   // compute final state vector
   let rf = new THREE.Vector3()
   let vf = new THREE.Vector3()
   for (let i = 0; i < 3; i++) {
      rf.setComponent(i, f * ri.getComponent(i) + g * vi.getComponent(i));
      vf.setComponent(i, fdot * ri.getComponent(i) + gdot * vi.getComponent(i));
   }
   return [rf, vf];
}
 
function stumpff (x: number): [number, number, number, number] {
   // Stumpff functions
   // input
   //  x = function argument
   // output
   //  [c0, c1, c2, c3] = function values at x
   let n = 0;
   while (Math.abs(x) > 0.1) {
      n = n + 1;
      x = 0.25 * x;
   }

   let c2 = (1 - x * (1 - x * (1 - x * (1 - x / 182) / 132) / 90)) / 56;
   c2 = (1 - x * (1 - x * c2 / 30) / 12) / 2;
   let c3 = (1 - x * (1 - x * (1 - x * (1 - x / 210) / 156) / 110)) / 72;
   c3 = (1 - x * (1 - x * c3 / 42) / 20) / 6;
   let c1 = 1 - x * c3;
   let c0 = 1 - x * c2;
   while (n > 0) {
      n = n - 1;
      c3 = 0.25 * (c2 + c0 * c3);
      c2 = 0.5 * c1 * c1;
      c1 = c0 * c1;
      c0 = 2 * c0 * c0 - 1;
      x = 4 * x;
   }
   return ([c0, c1, c2, c3]);
}

export {twobody};