import React, { Component } from "react";
import * as PIXI from "pixi.js";
import FastVector from "fast-vector";


class PlanifyDraw extends Component {
  componentDidMount() {
    if (this.first) return;
    this.first = true;
    this.done = false;
    this.last_point = null;
    
    // creating app

    this.app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x5bba6f,
      antialias: true,
    });

    this.app.start();

    document.getElementById("root").appendChild(this.app.view);

    // Creating Geometry
    this.plan_points = [];
    this.texts = []
    this.current_text = new PIXI.Text('');
    this.app.stage.addChild(this.current_text);

    this.lines = new PIXI.Graphics();
    this.text = new PIXI.Graphics();
    this.app.stage.addChild(this.lines);

    document.addEventListener("mousedown", this.onMouseDown, false);

    this.animate();

    // Events Handlers
    window.addEventListener("resize", this.handleWindowResize);
  }

  isCollide = (a, b, factor = 10) => {
    const d = a.distance(b);
    if (d <= factor) return true;
    return false;
  };

  isInsidePolygon(point) {
    var x = point.x,
      y = point.y;
    var inside = false;
    for (
      var i = 0, j = this.plan_points.length - 1;
      i < this.plan_points.length;
      j = i++
    ) {
      var xi = this.plan_points[i].x,
        yi = this.plan_points[i].y;
      var xj = this.plan_points[j].x,
        yj = this.plan_points[j].y;

      var intersect =
        (yi > y ) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  closePoint = (mouse_pos, factor = 6) => {
    for (var i = 0; i < this.plan_points.length; i++) {
      if (this.isCollide(this.plan_points[i], mouse_pos, factor))
        return this.plan_points[i];
    }
    return null;
  };

  closeLine = (mouse_pos, factor = 0.1) => {
    let a, b;
    let points = this.plan_points.slice(0);
    points.push(points[0])
    
    for (var i = 0; i < points.length - 1; i++) {
      a = points[i];
      b = points[i + 1];
      if(a.distance(mouse_pos) + b.distance(mouse_pos) <= a.distance(b) + factor) 
        return [a, b];
    }

    return null;
  };

  addPoint = (point) => {
    this.plan_points.push(point);
  };

  minMax = (points) => {
    let minPoint = points[0].clone();
    let maxPoint = points[0].clone();

    for (var i = 0; i < points.length; i++) {
      if (points[i].x < minPoint.x)
        minPoint.x = points[i].x;
      if (points[i].y < minPoint.y)
        minPoint.y = points[i].y;
      if (points[i].x < minPoint.x)
        minPoint.x = points[i].x;
      if (points[i].y > maxPoint.y)
        maxPoint.y = points[i].y;
    }

    return [minPoint, maxPoint];
  };

  drawText = (pos, scale, degree)=>{
    this.lines.clear();
    this.lines.lineStyle({ width: 4 });
    this.lines.beginFill("0xe74c3c");

  }

  drawShape = () => {
    var path = [];
    if (this.lines && this.plan_points.length > 0) {
      this.lines.clear();
      this.lines.lineStyle({ width: 4 });
      this.lines.beginFill("0xe74c3c");

      this.lines.moveTo(this.plan_points[0].x, this.plan_points[0].y);
      this.plan_points.map((l) => this.lines.lineTo(l.x, l.y));
      if (this.last_point) {
        this.lines.lineTo(this.last_point.x, this.last_point.y)
        if (this.plan_points.length >= 1){
          let d = this.last_point.distance(this.plan_points[this.plan_points.length - 1])
          this.current_text.text = (d/100).toFixed(1).toString() +  ' m'
          let vec = this.last_point.sub(this.plan_points[this.plan_points.length - 1]).normalize()
          let pos = this.last_point.sub(vec.mul(d / 2))
          console.log(pos);
          this.current_text.x = pos.x
          this.current_text.y = pos.y

        }

      }
      this.lines.closePath();
      this.lines.endFill();

      // Points
      this.lines.lineStyle(0);
      this.lines.beginFill("0x070a5e", 1);
      this.plan_points.map((l) => this.lines.drawCircle(l.x, l.y, 8));
      this.lines.endFill();

      if (this.done && this.selected_line !== null) {
        this.lines.lineStyle(6, "0xcf0000", 1);
        this.lines.moveTo(this.selected_line[0].x, this.selected_line[0].y);
        this.lines.lineTo(this.selected_line[1].x, this.selected_line[1].y);
      }

      // Points
      this.lines.lineStyle(0);
      this.lines.beginFill("0x070a5e", 1);
      this.plan_points.map((l) => this.lines.drawCircle(l.x, l.y, 8));
      this.lines.endFill();

      if (!this.done) {
        this.lines.beginFill("0xcf0000", 1);
        this.lines.drawCircle(this.plan_points[0].x, this.plan_points[0].y, 10);
        this.lines.endFill();
      } else if (this.done && this.selected_point !== null) {
        this.lines.beginFill("0xcf0000", 1);
        this.lines.drawCircle(this.selected_point.x, this.selected_point.y, 10);
        this.lines.endFill();
      }

    }
  };

  getMousePos = (evt, asVector = false) => {
    if (asVector) return new FastVector(evt.clientX, evt.clientY);
    return [evt.clientX, evt.clientY];
  };

  onDragPoint = (evt) => {
    if (this.app) {
      if (this.selected_point === null) return;
      this.selected_point.x = evt.clientX;
      this.selected_point.y = evt.clientY;
      this.drawShape();
    }
  };

 onMoveDraw= (evt) => {
    this.last_point = this.getMousePos(evt, true)
    this.drawShape()
  };

  onDragLine = (evt) => {
    if (this.app) {
      if (this.selected_line === null) return;

      var [x, y] = this.getMousePos(evt);

      this.selected_line[0].x = this.selected_line_abs[0].x + x;
      this.selected_line[0].y = this.selected_line_abs[0].y + y;
      this.selected_line[1].x = this.selected_line_abs[1].x + x;
      this.selected_line[1].y = this.selected_line_abs[1].y + y;
      this.drawShape();
    }
  };

  onDragPolygon = (evt) => {
    if (this.app) {
      if (this.selected_polygon === null) return;
      let [minPoint, maxPoint] = this.minMax(this.selected_polygon);

      let mouse_pos = this.getMousePos(evt, true)

      // let newMin = minPoint.add(mouse_pos)
      // let newMax = maxPoint.add(mouse_pos)

      // if (newMax.x > 800) mouse_pos.x = 800 - newMax.x;
      // if (newMax.y > 600) mouse_pos.y = 600 - newMax.y;
      
      // if (newMin.x <0) mouse_pos.x =  minPoint.x;
      // if (newMin.y <0) mouse_pos.y =  minPoint.y;

      // if (minPoint.add())
      // var mouse_pos = this.getMousePos(evt, true);

      if (mouse_pos)
        for (var i = 0; i < this.plan_points.length; i++) {
          this.plan_points[i] = this.selected_polygon[i].add(mouse_pos);
        }
      this.drawShape();
    }
  };

  onMouseUp = (evt) => {
    document.removeEventListener("mousemove", this.onDragPoint, false);
    document.removeEventListener("mousemove", this.onDragLine, false);
    document.removeEventListener("mousemove", this.onDragPolygon, false);
    this.selected_line = null;
    this.selected_point = null;
    this.selected_polygon = null;
    this.drawShape();
  };

  onMouseDown = (evt) => {
    if (evt.which === 3) return;

    var x = evt.clientX;
    var y = evt.clientY;
    var vNow = new FastVector(x, y);
    document.addEventListener("mousemove", this.w, false);
    document.removeEventListener("mousemove", this.onMoveDraw, false);
    this.last_point = null;

    if (this.done) {
      var close_point = this.closePoint(vNow);
      if (close_point !== null) {
        this.selected_point = close_point;
        document.addEventListener("mousemove", this.onDragPoint, false);
        this.drawShape();
        return;
      }
      var close_line = this.closeLine(vNow);
      if (close_line !== null) {
        this.selected_line = close_line;
        this.selected_line_abs = [
          this.selected_line[0].sub(vNow),
          this.selected_line[1].sub(vNow),
        ];
        document.addEventListener("mousemove", this.onDragLine, false);
        this.drawShape();
        return;
      }

      if (this.isInsidePolygon(vNow)) {
        this.selected_polygon = [];
        this.plan_points.map((l) => {
          this.selected_polygon.push(l.sub(vNow));
        });

        document.addEventListener("mousemove", this.onDragPolygon, false);
        this.drawShape();
        return;
      }
      return;
    }

    if (
      this.plan_points.length >= 3 &&
      this.isCollide(this.plan_points[0], vNow)
    ) {
      vNow = this.plan_points[0];
      this.done = true;
      this.drawShape();
      return;
    }

    this.plan_points.push(vNow);
    this.drawShape();
    document.addEventListener("mousemove", this.onMoveDraw, false);
    document.addEventListener("mouseup", this.onMouseUp, false);
  };
  // animate
  animate = (evt) => {
    requestAnimationFrame(this.animate);
    // if (this.plan_points.length > 0) this.last_point = this.getMousePos(evt)
    this.app.render();
    // this.current_pos = null
  };

  handleWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div
        ref={(mount) => {
          this.mount = mount;
        }}
        id="planify-draw"
      />
    );
  }
}
export default PlanifyDraw;
