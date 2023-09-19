import React, { Suspense, useRef } from 'react';
import { Canvas} from '@react-three/fiber';
import { OrbitControls, Stage, Sphere, Environment} from '@react-three/drei';
import { Model } from './Model';
import * as THREE from 'three';
import { useEffect } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import { Sky } from "@react-three/drei";

import './style.css';



function Camera(props) {
  const ref = useRef();
  const set = useThree((state) => state.set);
  let speed = 0.1;

  useEffect(() => {
    set({ camera: ref.current });
  }, [set]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (t < 4) {
      ref.current.position.z -= -speed*2; 
      ref.current.position.x -= -speed;
      ref.current.position.y -= -speed;
      speed /= 1.001;
    }
  });

  return <perspectiveCamera position={[12, 10, 12]} fov={50} ref={ref} {...props} />;
}


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
<Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0} azimuth={0.25} />

<Camera />

  <Suspense controls={ref} fallback={null}>
    {/* <Stage  preset="rembrandt" intensity={0.01} environment="city"> */} 
      <Model />
      <primitive
        castShadow
        receiveShadow
        object={grid}
      />
    {/* </Stage> */}
          {/* <Model /> */}

  </Suspense>
  <OrbitControls ref={ref} />
  <ambientLight intensity={0.3} />
  {/* <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, 10]} castShadow /> */}
  {/* <Environment preset="lobby" /> */}
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
  <directionalLight intensity={0.6} position={[500, 1000, 1000]} />
  {/* <Sphere args={[2, 2, 2]} /> */}
</Canvas>


  );
}
