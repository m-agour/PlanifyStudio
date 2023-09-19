

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { MeshStandardMaterial } from "three";

export function Model(props) {
  const { nodes, materials } = useGLTF("output.gltf");

  console.log(nodes, materials);
  // nodes.geometry_0.material.color.set(0x888888); // Set the color to red
  // console.log(nodes.geometry_0.material);

  
  // const [colorMap, displacementMap, normalMap, roughnessMap, aoMap] = useLoader(TextureLoader, [
  //   "512/Bricks17_col.jpg",
  //   '512/Bricks17_disp.jpg',
  //   '512/Bricks17_nrm.jpg',
  //   '512/Bricks17_rgh.jpg',
  //   '512/Bricks17_AO.jpg',
  // ])

  // const material = new MeshStandardMaterial({
  //   // map: colorMap,
  //   // displacementMap: displacementMap,
  //   normalMap: normalMap,
  //   roughnessMap: roughnessMap,
  //   aoMap: aoMap, 
  // })
  
  // const material = nodes.geometry_0.material
  // material.normalMap = normalMap;
  // material.roughnessMap = roughnessMap;
  // material.aoMap = aoMap;
  // material.map = colorMap;
  // material.displacementMap = displacementMap;
  
  console.log(typeof( nodes));

  return (
    <group {...props} dispose={null}>
      {Object.entries(nodes).map(([key, element]) => (
        <mesh
          key={key}
          castShadow={true}
          receiveShadow={true}
          geometry={element.geometry}
          material={element.material}
          position={element.position}
        />
      ))}
    </group>
  );
  
  
} 

useGLTF.preload("plan3.fy.gltf");


// import React from "react";
// import { Canvas, useLoader } from "@react-three/fiber";
// import { OBJLoader } from "three-stdlib/loaders/OBJLoader";
// import { MTLLoader } from "three-stdlib/loaders/MTLLoader";
// import { TextureLoader } from "three/src/loaders/TextureLoader";

// export function Model(props) {
//   const mtl = useLoader(MTLLoader, "plan3.fy.mtl");
//   const obj = useLoader(OBJLoader, "plan3.fy.obj", (loader) => {
//     mtl.preload();
//     loader.setMaterials(mtl);
//   });

//   return (
//     <group {...props} dispose={null}>
//       <primitive object={obj} />
//     </group>
//   );
// }

