import React, { Component }  from 'react';
 import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import * as THREE from "three";

class PlanifyDraw extends Component {

    

  componentDidMount() {

	if (this.first) return; this.first = true;
    this.MAX_POINTS = 500;
	this.done = false
	this.splineArray= [];
	this.mode = 0;


    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.mount.appendChild(this.renderer.domElement);
	console.log(44444444444444444444444444)

    // scene
    this.scene = new THREE.Scene();

	// this.renderer.setClearColor( 0xffffff, 1 );

    // camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.z = 5;

    // geometry
    this.geometry = new THREE.BufferGeometry();

    // attributes
    this.positions = new Float32Array(this.MAX_POINTS * 3); // 3 vertices per point
    this.geometry.setAttribute( 'position', new THREE.BufferAttribute(this.positions, 3));
 

    // drawcalls
    var drawCount = 2; // draw the first 2 points, only
    this.geometry.setDrawRange(0, drawCount);

    // material
    var material = new THREE.LineBasicMaterial({
      color: 0xfffff,
      linewidth: 3.0,
    });
    const meshMaterial = new THREE.MeshBasicMaterial({
      color: "teal",
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // line
    this.line = new THREE.Line(this.geometry, material);
    this.points = new THREE.Points(this.geometry, this.pointMaterial());
    this.geom = new THREE.Points(this.geometry, this.pointMaterial());
    // toTrianglesDrawMode.(this.geometry, THREE.TriangleStripDrawMode);

    this.scene.add(this.line);
    this.scene.add(this.points);

    // update positions
    this.updatePositions();

    document.addEventListener("mousedown", this.onMouseDown, false);

	this.renderer.render( this.scene, this.camera );

	this.animate();
	
	// Events Handlers
	window.addEventListener('resize', this.handleWindowResize)
  }


  createDot(color) {
	const canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;
	const ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(16, 16, 16, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
	return new THREE.CanvasTexture(canvas);
  }

  pointMaterial(color = "yellow") {
	return new THREE.PointsMaterial({
	  size: 0.1,
	  blending: THREE.AdditiveBlending,
	  transparent: true,
	  depthTest: false,
	  sizeAttenuation: true,
	  opacity: 1,
	  map: this.createDot(color),
	});
  }

  // update positions
  updatePositions = () => {
	var positions = this.points.geometry.attributes.position.array;

	var index = 0;

	for (var i = 0; i < this.splineArray.length; i++) {
	  positions[index++] = this.splineArray[i].x;
	  positions[index++] = this.splineArray[i].y;
	  positions[index++] = this.splineArray[i].z;
	}

	if(this.mesh){

		positions = this.mesh.geometry.attributes.position.array;
		index = 0;
 


		for (var i = 1; i < this.splineArray.length - 1; i++){

			positions[index++] = this.splineArray[0].x;
			positions[index++] = this.splineArray[0].y;
			positions[index++] = this.splineArray[0].z;
			for (var j=0; j<2; j++){
				positions[index++] = this.splineArray[i + j].x;
				positions[index++] = this.splineArray[i + j].y;
				positions[index++] = this.splineArray[i + j].z;
			}
		}
  	}	
}

  isCollide = (a, b, factor = 0.07) => {
	const d = a.distanceTo(b);
	if (d <= factor) return true;
	return false;
  };

  closePoint = (mouse_pos, factor = 0.03) => {
	for (var i = 0; i < this.splineArray.length; i++) {
	  if (this.isCollide(this.splineArray[i], mouse_pos, factor)) return this.splineArray[i];
	}
	return null;
  };

  closeLine = (mouse_pos, factor = 0.01) => {
	let a, b;
	for (var i = 0; i < this.splineArray.length - 1; i++) {
	  a = this.splineArray[i];
	  b = this.splineArray[i + 1];
	  var c = a
		.clone()
		.sub(mouse_pos)
		.cross(b.clone().sub(mouse_pos));
	  if (Math.abs(c.z) <= factor)
		if (
		  mouse_pos.x > Math.min(a.x, b.x) &&
		  mouse_pos.x < Math.max(a.x, b.x)
		)
		  if (
			mouse_pos.y > Math.min(a.y, b.y) &&
			mouse_pos.y < Math.max(a.y, b.y)
		  )
			return [a, b];
	}
	return null;
  };

  drawMesh=()=>{

	this.meshGeometry = new THREE.BufferGeometry();

    // attributes
    this.meshPositions = new Float32Array(this.splineArray.length * 3 * 2); // 3 vertices per point
    this.meshGeometry.setAttribute( 'position', new THREE.BufferAttribute(this.meshPositions, 3));
 


    this.geometry.setDrawRange(0, this.splineArray.length);

    const meshMaterial = new THREE.MeshBasicMaterial({
      color: "teal",
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // mesh
    this.mesh = new THREE.Mesh(this.meshGeometry, meshMaterial);
	console.log(this.mesh.geometry.attributes.position.array		)
    // toTrianglesDrawMode.(this.geometry, THREE.TriangleStripDrawMode);

    this.mesh.doubleSided = true;
    this.scene.add(this.mesh);

  }


	 onDragPoint=(evt) =>{
		if(this.renderer) {
				   
			if (this.selected_point === null) return;
			var x = ( evt.clientX / window.innerWidth ) * 2 - 1;
			  var y =  - ( evt.clientY / window.innerHeight ) * 2 + 1;
			var mouse_pos = new THREE.Vector3(x, y, 0);
			mouse_pos.unproject(this.camera);
			this.selected_point.x = mouse_pos.x;
			this.selected_point.y = mouse_pos.y;

			
		}    
	}
	
	 onDragLine=(evt) =>{
		if(this.renderer) {
				   
			if (this.selected_line === null) return;
			var x = ( evt.clientX / window.innerWidth ) * 2 - 1;
						var y =  - ( evt.clientY / window.innerHeight ) * 2 + 1;
			var mouse_pos = new THREE.Vector3(x, y, 0);
			mouse_pos.unproject(this.camera);
			this.selected_line[0].x = this.selected_line_abs[0].x + mouse_pos.x;
			this.selected_line[0].y = this.selected_line_abs[0].y + mouse_pos.y;
			this.selected_line[1].x = this.selected_line_abs[1].x + mouse_pos.x;
			this.selected_line[1].y = this.selected_line_abs[1].y + mouse_pos.y;

			
		}    
	}

/*   function onMouseMove(evt) {
  
		if(renderer) {
	   
			var x = ( event.clientX / window.innerWidth ) * 2 - 1;
		  var y =  - ( event.clientY / window.innerHeight ) * 2 + 1;
			var vNow = new THREE.Vector3(x, y, 0);
  
		  vNow.unproject(camera);
		  splineArray.push(vNow);
			
		}
	} */
	 onMouseUp=(evt) =>{
		  document.removeEventListener("mousemove",this.onDragPoint ,false);
		  document.removeEventListener("mousemove",this.onDragLine ,false);
		  this.selected_line = null;
		  this.selected_point = null;

	}
  

	 onMouseDown=(evt) =>{			   
		if(evt.which == 3 ) return;

		let size = new THREE.Vector2()
		this.renderer.getSize(size)
		console.log(evt.clientX, evt.clientY, size.x, size.y);
		var x = ( evt.clientX / window.innerWidth ) * 2 - 1;
		var y =  - ( evt.clientY / window.innerHeight ) * 2 + 1;

		var vNow = new THREE.Vector3(x, y, 0);
		vNow.unproject(this.camera);

		if (this.done) {
		  var close_point = this.closePoint(vNow)
		  if (close_point !== null) {
			this.selected_point = close_point;
			document.addEventListener("mousemove",this.onDragPoint ,false)
			return
		  }
		  var close_line = this.closeLine(vNow)
		  if (close_line !== null) {
			this.selected_line = close_line;
			this.selected_line_abs = [this.selected_line[0].clone().sub(vNow), 
			this.selected_line[1].clone().sub(vNow)]
			document.addEventListener("mousemove",this.onDragLine ,false)
			return;
		  }
		  return;
		  
		}


	
		// do not register if right mouse button is pressed.
		

		
		if (this.splineArray.length >= 3 && this.isCollide(this.splineArray[0], vNow)) {
		  vNow = this.splineArray[0];
			this.done = true;
			this.drawMesh();
		}

		
	//   console.log(vNow.x + " " + vNow.y+  " " + vNow.z); 
	  this.splineArray.push(vNow);
	  
	  document.addEventListener("mouseup",this.onMouseUp ,false);

	}
	// animate
	animate=() =>{

		requestAnimationFrame( this.animate );
	
		let drawCount = this.splineArray.length ;
		this.line.geometry.setDrawRange( 0, drawCount );
		this.points.geometry.setDrawRange( 0, drawCount );
		if (this.mesh) this.mesh.geometry.setDrawRange( 0, drawCount ); 
		
		this.updatePositions();

		this.line.geometry.attributes.position.needsUpdate = true; // required after the first render
		this.points.geometry.attributes.position.needsUpdate = true; // required after the first render
		if (this.mesh) this.mesh.geometry.attributes.position.needsUpdate = true; // required after the first render

		this.renderer.render( this.scene, this.camera );


	}

	handleWindowResize = ()=> {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.render(this.scene, this.camera);
	}

  render() {
    return (
      <div
        ref={(mount) => {
          this.mount = mount;
		
        }}
      />
    );
  }
}
export default PlanifyDraw;
