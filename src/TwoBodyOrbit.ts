import * as THREE from "three";
import { Vector3 } from "three";

function twobody(mu: number, tau: number,
   ri: Vector3, vi: Vector3): [Vector3, Vector3] {
   // Adapted from David Eagle's MATLAB two-body code (see link below)
   // https://www.mathworks.com/matlabcentral/fileexchange/48723-matlab-functions-for-two-body-orbit-propagation?focused=3853951&tab=function

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
   let vsm2 = vi.lengthSq();
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
   let rf = new Vector3()
   let vf = new Vector3()
   for(let i = 0; i < 3; i++) {
      rf.setComponent(i, ff*ri.getComponent(i) + gg*vi.getComponent(i));
      vf.setComponent(i, fd*ri.getComponent(i) + gd*vi.getComponent(i));
   }
   return [rf, vf];
}

export {twobody};
