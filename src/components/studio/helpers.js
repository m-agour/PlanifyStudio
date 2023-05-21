import * as PIXI from "pixi.js";
import axios from "axios";

export function getGridRect(w, h, pitch = 10, pitch_large = 100, offsetX = 0, offsetY = 0) {
  // pixi grid
  let gr = new PIXI.Graphics();
  gr.lineStyle(1, 0xdddddd, 1);
  gr.beginFill(0x000000, 0.1);
  let x = offsetX;
  let y = offsetY;
  let width = w;
  let height = h;
  let pitch_x = pitch;
  let pitch_y = pitch;
  let pitch_large_x = pitch_large;
  let pitch_large_y = pitch_large;

  for (let i = 0; i < width / pitch_x; i++) {
    gr.moveTo(x + i * pitch_x, y);
    gr.lineTo(x + i * pitch_x, y + height);
  }
  for (let i = 0; i < height / pitch_y; i++) {
    gr.moveTo(x, y + i * pitch_y);
    gr.lineTo(x + width, y + i * pitch_y);
  }
  gr.lineStyle(1, 0x666666, 1);

  for (let i = 0; i < width / pitch_large_x; i++) {
    gr.moveTo(x + i * pitch_large_x, y);
    gr.lineTo(x + i * pitch_large_x, y + height);
  }
  for (let i = 0; i < height / pitch_large_y; i++) {
    gr.moveTo(x, y + i * pitch_large_y);
    gr.lineTo(x + width, y + i * pitch_large_y);
  }

  gr.endFill();
  return gr;
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