import { ShapeType } from '../types';
import * as THREE from 'three';

// Helper to get a random point inside a sphere
const randomInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateParticles = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const tempVec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const t = Math.random() * Math.PI * 2;
    const p = Math.random() * Math.PI * 2; // phi
    const rScale = Math.random();

    switch (shape) {
      case ShapeType.HEART:
        // 3D Heart formula
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // Expanded to 3D with layers
        const ht = Math.random() * Math.PI * 2;
        const hp = Math.random() * Math.PI;
        // Basic heart slice
        const hx = 16 * Math.pow(Math.sin(ht), 3);
        const hy = 13 * Math.cos(ht) - 5 * Math.cos(2 * ht) - 2 * Math.cos(3 * ht) - Math.cos(4 * ht);
        // Add volume
        const hz = (Math.random() - 0.5) * 10 * (1 - Math.abs(hy) / 20); 
        x = hx * 0.5;
        y = hy * 0.5;
        z = hz;
        break;

      case ShapeType.FLOWER:
        // Rose curve inspired 3D
        const k = 4; // petals
        const rad = 5 * Math.cos(k * t) + 2;
        const fr = rad * (0.2 + 0.8 * Math.random());
        // Spherical mapping
        x = fr * Math.sin(p) * Math.cos(t);
        y = fr * Math.sin(p) * Math.sin(t);
        z = fr * Math.cos(p) * 0.5; // Flatten slightly
        break;

      case ShapeType.SATURN:
        const isRing = Math.random() > 0.4; // 60% ring, 40% planet
        if (isRing) {
            // Ring
            const ringRadius = 6 + Math.random() * 4;
            const theta = Math.random() * Math.PI * 2;
            x = ringRadius * Math.cos(theta);
            z = ringRadius * Math.sin(theta);
            y = (Math.random() - 0.5) * 0.2; // Thin ring
        } else {
            // Planet
            const vec = randomInSphere(4);
            x = vec.x;
            y = vec.y;
            z = vec.z;
        }
        // Tilt Saturn
        tempVec.set(x, y, z).applyAxisAngle(new THREE.Vector3(1, 0, 1).normalize(), Math.PI / 6);
        x = tempVec.x;
        y = tempVec.y;
        z = tempVec.z;
        break;

      case ShapeType.BUDDHA:
        // Approximating a meditating figure with geometric primitives
        const part = Math.random();
        if (part < 0.25) {
            // Head (Sphere at top)
            const vec = randomInSphere(1.5);
            x = vec.x;
            y = vec.y + 4;
            z = vec.z;
        } else if (part < 0.6) {
            // Body (Cone/Cylinder roughly)
            const angle = Math.random() * Math.PI * 2;
            const h = Math.random() * 4; // Height 0 to 4
            const w = 1.5 + (1 - h/4) * 1.5; // Wider at bottom
            const r = Math.sqrt(Math.random()) * w;
            x = r * Math.cos(angle);
            z = r * Math.sin(angle);
            y = h;
        } else {
            // Legs (Crossed - simplified as a torus base or flattened sphere)
            const angle = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 2.5;
            x = r * Math.cos(angle);
            z = r * Math.sin(angle);
            y = (Math.random() - 0.5) * 1.5;
        }
        y -= 2; // Center vertically
        break;

      case ShapeType.FIREWORK:
      default:
        // Random Sphere explosion
        const vec = randomInSphere(8);
        x = vec.x;
        y = vec.y;
        z = vec.z;
        break;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
};
