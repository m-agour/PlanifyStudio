import * as PIXI from "pixi.js";
import axios from "axios";

export function getGridRect(w, h, pitch = 10, pitch_large = 100) {
  //   var uniforms = {};
  //   uniforms.offset = { type: "v2", value: { x: -2.0235, y: 2.9794 } };
  //   uniforms.pitch = { type: "v2", value: { x: 50, y: 50 } };
  //   uniforms.resolution = { type: "v2", value: { x: w, y: h } };
  let shader = `
    precision mediump float;
    float vpw =  ${100000}.;
    float vph =  ${100000}.;
    vec2 offset = vec2(0, 0);
    vec2 pitch = vec2(${pitch}, ${pitch});
    vec2 pitch_large = vec2(${pitch_large}, ${pitch_large});

    void main() {
        float lX = gl_FragCoord.x / vpw;
        float lY = gl_FragCoord.y / vph;
        float scaleFactor = 10000.0;
        float offX = (scaleFactor * offset[0]) + gl_FragCoord.x;
        float offY = (scaleFactor * offset[1]) + (1.0 - gl_FragCoord.y);
        if(int(mod(offX, pitch_large[0])) == 0 || int(mod(offY, pitch_large[1])) == 0){
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.4);
        }
        else if (int(mod(offX, pitch[0])) == 0 || int(mod(offY, pitch[1])) == 0)  {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.06);
        } else {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    }
`;
  var gridShader = new PIXI.Filter("", shader, {});
  const grid = PIXI.Sprite.from(PIXI.Texture.WHITE);
  grid.width = w;
  grid.height = h;
  //   grid.tint = 0xff0000;
  grid.filters = [gridShader];

  return grid;
}


// I will use axios to fetch the data from the server

export async function submitData(data) {
  console.log('from submitData', data);
  return new Promise( async (resolve, reject) => {
  await axios
    .post("http://127.0.0.1:5000/design", data)
    .then((res) => {
      console.log("this is response from backend (axios)", res);
      resolve(res);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

export function getText(text) {
  let txt = new PIXI.Text(text, {
    fontFamily: "Verdana, Geneva, sans-serif",
    fontSize: 30,
    fill: 0x000000,
  });
  // txt.anchor.set(0.5);
  txt.position.set(0, 0);
  
  let sprite = new PIXI.Sprite();
  let scale_down = 60
  sprite.width = txt.width/scale_down;
  sprite.height = txt.height/scale_down;

  txt.width /= 1.7;
  sprite.x = - 10000
  sprite.anchor.set(.5, 0.5);

  txt.anchor.set(.5);

  let gr = new PIXI.Graphics()
  gr.alpha = 1;
  gr.beginFill(0xeeFF22);
  gr.lineStyle(1, 0x000000, 4 );
  let bg_width = txt.width *1.3;
  let bg_height = txt.width *1.3;

  gr.drawRoundedRect(-bg_width/2, -bg_height/2, bg_width, bg_height, 111);
  gr.endFill();

  sprite.addChild(gr);
  sprite.addChild(txt);


  return sprite;

}


export function updateText(textSprite, txt, pos) {
    textSprite.x = pos.x;
    textSprite.y = pos.y;
    let text = textSprite.getChildAt(1);
    text.text =  txt // + " m";
    // textSprite.width = text.width * 1.6;
    // textSprite.height = text.height;

}