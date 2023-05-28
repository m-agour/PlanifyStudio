import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Model } from './Model';
import * as THREE from 'three';
import { useEffect } from 'react';

import './style.css';
export default function Viewer() {
  const ref = useRef();

  const grid = new THREE.GridHelper(300, 10);
  grid.material.color.set(0xffffff);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  grid.castShadow = false;
  grid.receiveShadow = false;

  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      grid.position.y -= 0.000001;
      count++;

      if (count >= 100) {
        clearInterval(timer);
        grid.geometry.dispose();
        grid.material.dispose();
      }
    }, 1);

    return () => {
      clearInterval(timer);
      grid.geometry.dispose();
      grid.material.dispose();
    };
  }, []);
  


  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [12, 10, 12], fov: 50 }}>
      <Suspense fallback={null}>
        <Stage controls={ref} preset="rembrandt" intensity={1}  environment="city">
          <Model />
          <primitive object={grid} />
        </Stage>
      </Suspense>
      <OrbitControls ref={ref} />
    </Canvas>

  );
}
