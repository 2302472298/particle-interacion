import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleConfig, HandGestureState } from '../types';
import { generateParticles } from '../utils/math';

interface SceneProps {
  config: ParticleConfig;
  gesture: HandGestureState;
}

const ParticleSystem: React.FC<SceneProps> = ({ config, gesture }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Buffers for animation
  const targetPositions = useMemo(() => generateParticles(config.shape, config.count), [config.shape, config.count]);
  const currentPositions = useMemo(() => new Float32Array(config.count * 3), [config.count]);
  
  // Initialize current positions to target on first load (avoid origin explosion)
  useMemo(() => {
    for (let i = 0; i < targetPositions.length; i++) {
        currentPositions[i] = targetPositions[i];
    }
  }, []);

  // Geometry ref to update attributes
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useFrame((state, delta) => {
    if (!pointsRef.current || !geometryRef.current) return;

    // Interaction Factors
    // pinchDistance: 0 (closed) -> 1 (open)
    // We want open hand = Expansion/Scale Up, closed hand = Contraction
    // BUT user prompt says: "detect hands to control zoom and diffusion"
    // Let's map pinchDistance to "spread" factor.
    
    // Smoothly interpolate gesture data
    const spreadTarget = gesture.detected ? 0.5 + (gesture.pinchDistance * 1.5) : 1; 
    // If not detected, default scale 1. If detected, can go from 0.5 (tiny) to 2.0 (huge).
    
    const time = state.clock.getElapsedTime();
    const positions = geometryRef.current.attributes.position.array as Float32Array;

    // Determine Lerp Speed (Response time) based on config speed
    const lerpSpeed = 3.5 * config.speed * delta; 

    for (let i = 0; i < config.count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Target from shape generation
      const tx = targetPositions[ix];
      const ty = targetPositions[iy];
      const tz = targetPositions[iz];

      // Add simple noise/motion
      const noise = Math.sin(time + i * 0.1) * 0.1;

      // Apply Gesture Scaling to Target
      const scale = spreadTarget;
      
      // Interpolate current position towards target
      // We do a simple exponential decay towards target * scale
      positions[ix] += ((tx * scale + noise) - positions[ix]) * lerpSpeed;
      positions[iy] += ((ty * scale + noise) - positions[iy]) * lerpSpeed;
      positions[iz] += ((tz * scale + noise) - positions[iz]) * lerpSpeed;
    }

    // Rotation based on hand position (if detected)
    if (gesture.detected) {
      pointsRef.current.rotation.x += (gesture.handPosition.y * 0.5 - pointsRef.current.rotation.x) * delta;
      pointsRef.current.rotation.y += (gesture.handPosition.x * 0.5 - pointsRef.current.rotation.y) * delta;
    } else {
      // Idle rotation
      pointsRef.current.rotation.y += 0.05 * config.speed * delta;
    }

    geometryRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={config.count}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={config.color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
      <color attach="background" args={['#050505']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <ParticleSystem {...props} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

export default Scene;