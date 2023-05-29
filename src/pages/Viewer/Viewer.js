import React, { Suspense, useRef } from 'react';
import { Canvas} from '@react-three/fiber';
import { OrbitControls, Stage, Sphere, Environment} from '@react-three/drei';
import { Model } from './Model';
import * as THREE from 'three';
import { useEffect } from 'react';

import './style.css';
export default function Viewer() {
  const ref = useRef();
  const canvasRef = useRef();

  const grid = new THREE.GridHelper(300, 10);
  grid.material.color.set(0xffffff);
  grid.material.opacity = 0.7;
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


  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    handleResize();
  }, []);
  


  return (
<Canvas
  ref={canvasRef}
  width="80%"
  height="80%"
  shadows
  dpr={[1, 2]}
  camera={{ position: [12, 10, 12], fov: 50 }}
>
  <Suspense fallback={null}>
    <Stage controls={ref} preset="rembrandt" intensity={1} environment="city">
      <Model />
      <primitive
        castShadow
        receiveShadow
        object={grid}
      />
    </Stage>
  </Suspense>
  <OrbitControls ref={ref} />
  <ambientLight intensity={1} />
  <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, 10]} castShadow />
  <Environment preset="lobby" />
{/*     sunset: string;
    dawn: string;
    night: string;
    warehouse: string;
    forest: string;
    apartment: string;
    studio: string;
    city: string;
    park: string;
    lobby: string; */}
  <directionalLight intensity={1} position={[50, 100, 100]} />
  <Sphere args={[2, 2, 2]} />
</Canvas>


  );
}
