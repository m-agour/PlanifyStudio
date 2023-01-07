import * as PIXI from "pixi.js";
import axios from "axios";

export function getGridRect(w, h, pitch=20) {
//   var uniforms = {};
//   uniforms.offset = { type: "v2", value: { x: -2.0235, y: 2.9794 } };
//   uniforms.pitch = { type: "v2", value: { x: 50, y: 50 } };
//   uniforms.resolution = { type: "v2", value: { x: w, y: h } };
let shader = `
    precision mediump float;

    float vpw =  ${h}.;
    float vph =  ${w}.;

    vec2 offset = vec2(0, 0);
    vec2 pitch = vec2(${pitch}, ${pitch});

    void main() {
        float lX = gl_FragCoord.x / vpw;
        float lY = gl_FragCoord.y / vph;

        float scaleFactor = 10000.0;

        float offX = (scaleFactor * offset[0]) + gl_FragCoord.x;
        float offY = (scaleFactor * offset[1]) + (1.0 - gl_FragCoord.y);

        if (int(mod(offX, pitch[0])) == 0 || int(mod(offY, pitch[1])) == 0)  {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.4);
        } else {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    }
`
  var gridShader = new PIXI.Filter("", shader, {});
  const grid = PIXI.Sprite.from(PIXI.Texture.WHITE);
  grid.width = w;
  grid.height = h;
//   grid.tint = 0xff0000;
  grid.filters = [gridShader];

  return grid;
}


// I will use axios to fetch the data from the server

export function submitData(data) {
    axios
        .post("http://0.0.0.0:5000/design", data)
        .then((res) => {
        console.log(res.data);
        })
        .catch((err) => {
        console.log(err);
        });
}