import Service from '@ember/service';
import { MAPSIZE, TILESIZE } from './gameboard'

// https://www.redblobgames.com/grids/hexagons/

export const TILEIMAGES = Object.freeze([
    "/images/hex/ZeshioHexKitDemo_096.png", // water
    "/images/hex/ZeshioHexKitDemo_104.png",  // sand
    "/images/hex/ZeshioHexKitDemo_000.png", // lava
    "/images/hex/ZeshioHexKitDemo_005.png", // cool lava rock
    "/images/hex/ZeshioHexKitDemo_023.png",
    "/images/hex/ZeshioHexKitDemo_047.png",
    "/images/hex/ZeshioHexKitDemo_102.png", // palm trees
]);

// Axial coordinates
export const MAP = Object.freeze(
  [
    [null,null,0,1,6],
    [null,0,0,1,1],
    [5,2,0,1,0],
    [2,3,0,0,null],
    [4,2,0,null,null]
  ]
);


export default Service.extend({

  tileGraphics: [],
  boardContext: null,
  x_modifier: 10,
  y_modifier: -80,

  buildBoard(){
    this.set('boardContext', document.getElementById('hexcanvas').getContext('2d'));

    this.loadTiles(TILEIMAGES);
  },

  loadTiles(tileset) {
    let tileGraphicsLoaded = 0;
    for (let i = 0; i < tileset.length; i++) {

      let tileGraphic = new Image();
      tileGraphic.src = tileset[i];
      tileGraphic.onload = () => {
        // Once the image is loaded increment the loaded graphics count and check if all images are ready.
        tileGraphicsLoaded++;
        if (tileGraphicsLoaded === tileset.length) {
          this.drawMap();
        }
      }
      // console.log(tileGraphic);
      this.tileGraphics.pushObject(tileGraphic);
    }
  },

  drawMap() {
    // console.log('drawing map');

    // Note that the images are saved as 96x96 pixels to allow for objects outside the hex boundary,
    // but should be treated as 84x96 pixel images for the sake of hex sizing.

    let drawTile;
    let x_start = 0;
    let y_start = 0;

    for (var row = 0; row < MAP.length; row++) {
      for (var q = 0; q < MAP[row].length; q++) {
        drawTile = MAP[row][q];


        if(drawTile !== null) {
          let x = (q * 70) + this.x_modifier;
          let y = (q * 42) + (row * 81) + this.y_modifier;    // 42 is 84 / 2

// console.log(this.tileGraphics[drawTile], 'row:', row, 'q:', q, 'drawTile:', drawTile, 'x:', x, 'y:', y);

          this.boardContext.drawImage( this.tileGraphics[drawTile], x, y );

        }
      }
    }
  },

  hexReport(event) {

    let canvas = document.getElementById('hexcanvas');
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    console.log('click', event, "x:", x, "y:", y);
  }


});
