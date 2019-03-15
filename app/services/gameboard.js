import Service from '@ember/service';
import { A as emberArray } from '@ember/array';
import EmberObject, { computed } from '@ember/object';

// const rawboard = [
//   [
//     {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'}
//   ],
//   [
//     {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'}
//   ],
//   [
//     {t:'w'},{t:'l'},{t:'w'},{t:'w'},{t:'w'},{t:'w', cmd:1},{t:'l'}
//   ],
//   [
//     {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'}
//   ],
//   [
//     {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'}
//   ],
//   [
//     {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'}
//   ],
//   [
//     {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'},{t:'l'}
//   ]
// ];
// const board_width = 7;
// const board_height = 7;


// Set as your tile pixel sizes, alter if you are using larger tiles.
export const TILESIZE = Object.freeze({
  height: 25,
  width: 52
})

// mapX and mapY are offsets to make sure we can position the map as we want.
export const MAPSIZE = Object.freeze({
  x: 276,
  y: 52
})

/**
 * Map:
 * t = tiles
 *  0 = Water
 *  1 = Land
 *
 */
export const MAP = Object.freeze(
  [
    [{t:1},{t:1},{t:1},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:1},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:1},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:1},{t:1},{t:1},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:1},{t:1},{t:1},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:1},{t:1},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}],
    [{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0},{t:0}]
  ]
);

export default Service.extend({

  tileGraphics: [],
  boardContext: null,

  buildBoard() {
    this.loadImg();
  },

  loadImg() {
// debugger;
    // Images to be loaded and used.
    // Tutorial Note: As water is loaded first it will be represented by a 0 on the map and land will be a 1.
    let tileGraphicsToLoad = ["/images/tiles/water.png","/images/tiles/land.png"];
    let tileGraphicsLoaded = 0;

    for (let i = 0; i < tileGraphicsToLoad.length; i++) {

      let tileGraphic = new Image();
      tileGraphic.src = tileGraphicsToLoad[i];
      tileGraphic.onload = () => {
        // Once the image is loaded increment the loaded graphics count and check if all images are ready.
        tileGraphicsLoaded++;
        if (tileGraphicsLoaded === tileGraphicsToLoad.length) {
          this.drawMap();
        }
      }
      this.tileGraphics.pushObject(tileGraphic);

      // tileGraphics[i] = new Image();
      // tileGraphics[i].src = tileGraphicsToLoad[i];
      // tileGraphics[i].onload = () => {
      //   // Once the image is loaded increment the loaded graphics count and check if all images are ready.
      //   tileGraphicsLoaded++;
      //   if (tileGraphicsLoaded === tileGraphicsToLoad.length) {
      //     this.drawMap();
      //   }
      // }
    }

  },

  drawMap() {
// debugger;
    // create the canvas context
    this.set('boardContext', document.getElementById('main').getContext('2d'));

    let drawTile;

    // loop through our map and draw out the image represented by the number.
    for (var i = 0; i < MAP.length; i++) {
      for (var j = 0; j < MAP[i].length; j++) {
        drawTile = MAP[i][j].t;
        // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
        this.boardContext.drawImage(this.tileGraphics[drawTile], (i - j) * TILESIZE.height + MAPSIZE.x, (i + j) * TILESIZE.height / 2 + MAPSIZE.y);
      }
    }
  }

  // board: null,
  //
  // buildBoard() {
  //   let rows = emberArray();
  //   for(let row = 0; row < board_height; row++){
  //
  //     let grids = emberArray();
  //
  //     for(let col = 0; col < board_width; col++){
  //       // console.log('row', row, 'col', col, rawboard[row][col]);
  //       grids.pushObject(EmberObject.create(rawboard[row][col]));
  //     }
  //     let newRow = EmberObject.create({
  //       grids: grids
  //     });
  //
  //     rows.pushObject(newRow);
  //   }
  //   let board = EmberObject.create({
  //     rows: rows
  //   });
  //
  //   // console.log('board', board);
  //
  //   this.set('board', board)
  // }
});
