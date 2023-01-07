import React, { Component } from "react";
import * as PIXI from "pixi.js";
import FastVector from "fast-vector";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import { getGridRect, submitData } from "./helpers";

class PlanifyDraw extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    if (this.first) return;
    this.first = true;
    this.done = false;
    this.last_point = null;
    this.align = true;
    this.align_factor = 8;
    this.align_grid = true;
    this.horver = true;
    this.grid_pitch = 50;
    this.x_aligns = [];
    this.y_aligns = [];

    this.point_counter = 0;

    // creating app

    const w = 800;
    const h = 500;

    this.app = new PIXI.Application({
      width: w,
      height: h,
      backgroundColor: 0xeeeeee,
      antialias: true,
    });

    // create a renderer instance
    this.renderer = PIXI.autoDetectRenderer(400, 300);
    // create a manager instance, passing stage and renderer.view
    this.manager = new PIXI.InteractionManager(
      this.app.stage,
      this.app.renderer.view
    );
    // creating Grid and adding it to the stage
    // grid shader

    this.container = new PIXI.Container();
    this.textContainer = new PIXI.Container();

    // create a new Sprite from an image path
    this.ch = PIXI.Sprite.from(
      "https://cdn-icons-png.flaticon.com/512/165/165044.png"
    );
    this.ch.anchor.set(0.5);
    this.ch.setTransform(
      this.app.renderer.width / 2,
      this.app.renderer.height / 2,
      0.06,
      0.06,
      90
    );

    const ch = this.ch;
    this.app.renderer.plugins.interaction.defaultCursorStyle = "inherit";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.interactive = true;
    this.app.stage.on("mousemove", function (event) {
      let x = event.data.global.x;
      let y = event.data.global.y;

      ch.x = x + ch.width / 4;
      ch.y = y + (2 * ch.height) / 3;
      if (x < w && y < h) {
        document.getElementById("root").style.cursor = "none";
      } else {
        document.getElementById("root").style.cursor = "default";
      }
    });

    // Listen for animate update
    // this.app.ticker.add(function(delta) {
    //     // just for fun, let's rotate mr rabbit a little
    //     // delta is 1 if running at 100% performance
    //     // creates frame-independent tranformation
    //     this.ch.x += Math.cos(this.ch.rotation) * delta;
    //     this.ch.y += Math.sin(this.ch.rotation) * delta;
    // });
    this.app.start();

    this.app.view.style.cursor = "none";

    this.canvasRef.current.appendChild(this.app.view);

    // Creating Geometry
    this.plan_points = [];
    this.texts = [];
    this.current_text = new PIXI.Text("");
    this.current_text.anchor.set(0.5);
    this.current_text.color = 0x0ff000;
    this.lines = new PIXI.Graphics();
    this.text = new PIXI.Graphics();
    this.grid = getGridRect(w, h, this.grid_pitch);

    this.app.stage.addChild(this.grid);
    this.app.stage.addChild(this.container);
    this.container.addChild(this.lines);
    // this.textContainer.addChild(this.current_text);
    this.container.addChild(this.textContainer);
    this.container.addChild(this.ch);

    this.app.stage.addListener("mousedown", this.onMouseDown, false);
    this.app.stage.addListener("contextmenu", this.onRightClick, false);

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
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
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
    points.push(points[0]);

    for (var i = 0; i < points.length - 1; i++) {
      a = points[i];
      b = points[i + 1];
      if (
        a.distance(mouse_pos) + b.distance(mouse_pos) <=
        a.distance(b) + factor
      )
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
      if (points[i].x < minPoint.x) minPoint.x = points[i].x;
      if (points[i].y < minPoint.y) minPoint.y = points[i].y;
      if (points[i].x < minPoint.x) minPoint.x = points[i].x;
      if (points[i].y > maxPoint.y) maxPoint.y = points[i].y;
    }

    return [minPoint, maxPoint];
  };

  drawText = (pos, scale, degree) => {
    this.lines.clear();
    this.lines.lineStyle({ width: 4 });
    this.lines.beginFill("0xe74c3c");
  };

  drawShape = () => {
    this.lines.clear();
    if (this.lines && this.plan_points.length > 0) {
      // aligns
      this.lines.alpha = 0.3;
      this.lines.lineStyle(1, "0x00f43d", 1);

      for (let i = 0; i < this.x_aligns.length; i++) {
        this.lines.moveTo(this.x_aligns[i], 0);
        this.lines.lineTo(this.x_aligns[i], 2000);
      }
      for (let i = 0; i < this.y_aligns.length; i++) {
        this.lines.moveTo(0, this.y_aligns[i]);
        this.lines.lineTo(10000, this.y_aligns[i]);
      }
      this.x_aligns = [];
      this.y_aligns = [];

      this.lines.alpha = 1;

      if (this.done && this.selected_line !== null) {
        this.lines.lineStyle(6, "0xcf0000", 1);
        this.lines.moveTo(this.selected_line[0].x, this.selected_line[0].y);
        this.lines.lineTo(this.selected_line[1].x, this.selected_line[1].y);
      }

      // polygon
      this.lines.lineStyle({ width: 4 });
      this.lines.beginFill("0xffd000");
      this.lines.moveTo(this.plan_points[0].x, this.plan_points[0].y);
      if (!this.done) this.lines.endFill();

      this.plan_points.map((l) => this.lines.lineTo(l.x, l.y));
      if (this.last_point) {
        this.lines.lineTo(this.last_point.x, this.last_point.y);
        if (this.plan_points.length >= 1) {
          let d = this.last_point.distance(
            this.plan_points[this.plan_points.length - 1]
          );
          this.current_text.text = (d / 100).toFixed(1).toString() + " m";
          let vec = this.last_point
            .sub(this.plan_points[this.plan_points.length - 1])
            .normalize();
          let pos = this.last_point.sub(vec.mul(d / 2));
          this.current_text.x = pos.x;
          this.current_text.y = pos.y;
        }
      }
      if (this.done) {
        this.lines.closePath();
        this.lines.endFill();
      }

      // selected line
      if (this.done && this.selected_line !== null) {
        this.lines.lineStyle(6, 0xff1414, 1);
        this.lines.moveTo(this.selected_line[0].x, this.selected_line[0].y);
        this.lines.lineTo(this.selected_line[1].x, this.selected_line[1].y);
      }

      // Points
      this.lines.lineStyle(0);
      this.lines.beginFill("0x070a5e", 1);
      this.plan_points.map((l) => this.lines.drawCircle(l.x, l.y, 8));
      this.lines.endFill();

      // initial point and selected to red
      if (!this.done) {
        this.lines.beginFill("0xff1414", 1);
        this.lines.drawCircle(this.plan_points[0].x, this.plan_points[0].y, 10);
        this.lines.endFill();
      } else if (this.done && this.selected_point !== null) {
        this.lines.beginFill("0xff1414", 1);
        this.lines.drawCircle(this.selected_point.x, this.selected_point.y, 10);
        this.lines.endFill();
      }
    }
  };

  getMousePos = (evt, asVector = false) => {
    this.evt = evt;
    if (asVector) return new FastVector(evt.data.global.x, evt.data.global.y);
    return [evt.data.global.x, evt.data.global.y];
  };

  alignWith = (
    current,
    target,
    factor = 5,
    exclude = [],
    align_x = true,
    align_y = true,
    align_grid = this.align_grid
  ) => { 

    if (align_grid){

      if (current.x % this.grid_pitch > this.grid_pitch - factor) {
        current.x = current.x + (this.grid_pitch - (current.x % this.grid_pitch));
        this.x_aligns.push(current.x);
        align_x = true;
      }
      if (current.y % this.grid_pitch > this.grid_pitch - factor) {
        current.y = current.y + (this.grid_pitch - (current.y % this.grid_pitch));
        this.y_aligns.push(current.y);
        align_y = true;
      }
    }
    for (let i = 0; i < target.length; i++) {
      if (exclude.includes(target[i])) continue;
      if(!align_x && !align_y) break;
      if (
        align_x &&
        current !== target[i] &&
        current.x <= factor + target[i].x &&
        current.x >= target[i].x - factor
      ) {
        current.x = target[i].x;
        this.x_aligns.push(target[i].x);
        align_x = false;
      }
      if (
        align_y &&
        current !== target[i] &&
        current.y <= factor + target[i].y &&
        current.y >= target[i].y - factor
      ) {
        current.y = target[i].y;
        this.y_aligns.push(target[i].y);
        align_y = false;
      }
    }
  };

  alignPoints = (point, points, exclude = []) => {};
  onRightClick = (e) => {
    e.preventDefault();
    this.plan_points.pop();
    this.drawShape();
  };

  onMoveDraw = (evt) => {
    let new_point = this.getMousePos(evt, true);
    // this.ch.x = new_point.x ;
    // this.ch.y = new_point.y - this.ch.width;
    let last = this.plan_points[this.plan_points.length - 1];
    let first = this.plan_points[0];

    if (this.plan_points.length > 0) {
      if (this.horver) {
        if (this.isHorizontal(last, new_point)) {
          new_point.y = last.y;
        } else {
          new_point.x = last.x;
        }
      }
      if (this.align) {
        this.alignWith(new_point, first, this.align_factor);
        this.plan_points.map((p) =>
          this.alignWith(new_point, p, this.align_factor)
        );
      }
      this.last_point = new_point;
      this.drawShape();
    }
  };

  onDragPoint = (evt) => {
    if (this.app) {
      let prev, next;
      if (this.selected_point === null) return;

      let new_pos = this.getMousePos(evt, true);

      if (this.horver) {
        let idx = this.plan_points.indexOf(this.selected_point);

        let prev_idx = idx - 1;
        let next_idx = idx + 1;

        if (prev_idx < 0) prev_idx = this.plan_points.length - 1;
        if (next_idx >= this.plan_points.length) next_idx = 0;

        prev = this.plan_points[prev_idx];
        next = this.plan_points[next_idx];
      }
      if (this.align) {
        let first = this.plan_points[0];
        this.alignWith(new_pos, first, this.align_factor, [
          this.selected_point,
          prev,
          next,
        ]);
        this.plan_points.map((p) =>
          this.alignWith(new_pos, p, this.align_factor, [
            this.selected_point,
            prev,
            next,
          ])
        );
      }

      if (this.horver) {
        if (this.isHorizontal(this.selected_point, prev)) {
          prev.y = new_pos.y;
        } else {
          prev.x = new_pos.x;
        }
        if (this.isHorizontal(this.selected_point, next)) {
          next.y = new_pos.y;
        } else {
          next.x = new_pos.x;
        }
      }

      this.selected_point.x = new_pos.x;
      this.selected_point.y = new_pos.y;
      this.drawShape();
    }
  };

  isHorizontal = (p1, p2) => {
    return Math.abs(p1.x - p2.x) > Math.abs(p1.y - p2.y);
  };

  onDragLine = (evt) => {
    if (this.app) {
      if (this.selected_line === null) return;

      var mpos = this.getMousePos(evt, true);

      let align_x = true;
      let align_y = true;

      if (this.horver) {
        if (this.isHorizontal(this.selected_line[0], this.selected_line[1])) {
          mpos.x = this.selected_line[0].x - this.selected_line_abs[0].x;
          align_x = false;
        } else {
          mpos.y = this.selected_line[0].y - this.selected_line_abs[0].y;
          align_y = false;
        }
      }

      if (this.align)
        this.plan_points.map((p) =>
          this.alignWith(
            mpos,
            p,
            this.align_factor,
            this.selected_line,
            align_x,
            align_y
          )
        );

      this.selected_line[0].x = this.selected_line_abs[0].x + mpos.x;
      this.selected_line[0].y = this.selected_line_abs[0].y + mpos.y;
      this.selected_line[1].x = this.selected_line_abs[1].x + mpos.x;
      this.selected_line[1].y = this.selected_line_abs[1].y + mpos.y;

      this.drawShape();
    }
  };

  onDragPolygon = (evt) => {
    if (this.app) {
      if (this.selected_polygon === null) return;
      let [minPoint, maxPoint] = this.minMax(this.selected_polygon);

      let mouse_pos = this.getMousePos(evt, true);

      let newMin = minPoint.add(mouse_pos);
      let newMax = maxPoint.add(mouse_pos);

      if (newMax.x > 800) mouse_pos.x = 800 - newMax.x;
      if (newMax.y > 600) mouse_pos.y = 600 - newMax.y;

      if (newMin.x < 0) mouse_pos.x = minPoint.x;
      if (newMin.y < 0) mouse_pos.y = minPoint.y;

      mouse_pos = this.getMousePos(evt, true);
      console.log(mouse_pos);
      if (mouse_pos)
        for (var i = 0; i < this.plan_points.length; i++) {
          this.plan_points[i] = this.selected_polygon[i].add(mouse_pos);
        }
      this.drawShape();
    }
  };

  onMouseUp = (evt) => {
    this.app.stage.removeListener("mousemove", this.onDragPoint, false);
    this.app.stage.removeListener("mousemove", this.onDragLine, false);
    this.app.stage.removeListener("mousemove", this.onDragPolygon, false);
    this.selected_line = null;
    this.selected_point = null;
    this.selected_polygon = null;
    this.drawShape();
  };
  assignRef = (element) => {
    this.container = element;
  };
  onMouseDown = (evt) => {
    if (evt.which === 3) return;

    if (this.last_point) {
      var vNow = this.last_point.clone();
    } else {
      var vNow = this.getMousePos(evt, true);
    }

    this.app.stage.removeListener("mousemove", this.onMoveDraw, false);
    this.last_point = null;

    if (this.done) {
      var close_point = this.closePoint(vNow);
      if (close_point !== null) {
        this.selected_point = close_point;
        this.app.stage.addListener("mousemove", this.onDragPoint, false);
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
        this.app.stage.addListener("mousemove", this.onDragLine, false);
        this.drawShape();
        return;
      }

      if (this.isInsidePolygon(vNow)) {
        this.selected_polygon = [];
        this.plan_points.map((l) => {
          this.selected_polygon.push(l.sub(vNow));
        });

        this.app.stage.addListener("mousemove", this.onDragPolygon, false);
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
    this.app.stage.addListener("mousemove", this.onMoveDraw, false);
    this.app.stage.addListener("mouseup", this.onMouseUp, false);
  };
  // animate
  animate = (evt) => {
    requestAnimationFrame(this.animate);
    // if (this.plan_points.length > 0) this.last_point = this.getMousePos(evt)
    this.app.render();
    // this.current_pos = null
  };

  handleWindowResize = () => {
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  };

  getPlanData = () => {
    let reqData = {};
    // 1- get the data from the plan_points
    let data = this.plan_points;
    reqData.mask = data.map((l) => l.toArray());

    // submit the data to the server
    submitData(reqData);
  };

  render() {
    return (
      <div>
        <center>
          <div ref={this.canvasRef} />
          <Button onClick={this.getPlanData}>Planify Now!</Button>
        </center>
      </div>
    );
  }
}
export default PlanifyDraw;
