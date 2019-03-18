import Component from '@ember/component';
import EmberObject, { computed, set } from '@ember/object';
import {assert} from '@ember/debug';

import Hex from '../objects/hex';
import Layout, { LAYOUTS } from '../objects/layout';
import Point from '../objects/point';
import Orientation from '../objects/orientation';

export const TILEIMAGES = Object.freeze([
  "/images/hex/ZeshioHexKitDemo_096.png", // water
  "/images/hex/ZeshioHexKitDemo_104.png",  // sand
  "/images/hex/ZeshioHexKitDemo_000.png", // lava
  "/images/hex/ZeshioHexKitDemo_005.png", // cool lava rock
  "/images/hex/ZeshioHexKitDemo_023.png",
  "/images/hex/ZeshioHexKitDemo_047.png",
  "/images/hex/ZeshioHexKitDemo_102.png", // palm trees
]);

export const MAP = Object.freeze(
  [
    [null,       null,       {t:0,m:"w1"},{t:1,m:"l2"},{t:6,m:"l3"}],
    [null,       {t:0,m:"w4"},{t:0,m:"w5"},{t:1,m:"l6"},{t:1,m:"l7"}],
    [{t:5,m:"l8"},{t:2,m:"l9"},{t:0,m:"w10"},{t:1,m:"l11"},{t:0,m:"w12"}],
    [{t:2,m:"l13"},{t:3,m:"l14"},{t:0,m:"w15"},{t:0,m:"w16"},null],
    [{t:4,m:"l17"},{t:2,m:"l18"},{t:0,m:"w19"},null,       null]
  ]
);


export const TILEMAP = Object.freeze([
  {id:0, t:0},
  {id:1, t:0},
  {id:2, t:0},
  {id:3, t:0},
  {id:4, t:0},
  {id:5, t:0},
  {id:6, t:0},
  {id:7, t:0},
  {id:8, t:0},
  {id:9, t:1},
  {id:10, t:0},
  {id:11, t:0},
  {id:12, t:0},
  {id:13, t:0},
  {id:14, t:0},
  {id:15, t:0},
  {id:16, t:0},
  {id:17, t:0},
  {id:18, t:0}
]);

export default Component.extend({

  tileGraphics: [],
  showTiles: true,

  tilesLoaded: null,

  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    this._super(...arguments);

    this.loadTiles(TILEIMAGES);

    let canvas = document.getElementById('gamecanvas-flat');
    let rect = canvas.getBoundingClientRect();
    let centerX = rect.width / 2;
    let centerY = rect.height / 2;
    this.set('rect', rect);
    this.set('centerX', centerX);
    this.set('centerY', centerY);
  },


  // TODO should use ember-concurrency task here and yield on loading
  loadTiles(tileset) {
    let tileGraphicsLoaded = 0;
    for (let i = 0; i < tileset.length; i++) {

      let tileGraphic = new Image();
      tileGraphic.src = tileset[i];
      tileGraphic.onload = (tile) => {
        // Once the image is loaded increment the loaded graphics count and check if all images are ready.
        // console.log(tile, this);
        tileGraphicsLoaded++;
        if (tileGraphicsLoaded === tileset.length) {
          set(this, 'tilesLoaded', MAP);
        }
      }

      // console.log(tileGraphic);
      this.tileGraphics.pushObject(tileGraphic);
    }
  },

  // buildHexagons(map) {
  //   var hexes = [];
  //
  //   let hex1 = Hex.create({q:q, r:r, s:-q-r, id:id}
  //   return hexes;
  // },

  mapLoaded: computed('tilesLoaded', function() {
    if (this.tilesLoaded) {
      this.drawGrids(MAP);
    }
    return '';
  }),

  createHexesFromMap(map) {
    assert('Map array MUST be odd lengths to have a hexagonal shape.',(map.length % 2 === 1) && (map[0].length % 2 === 1));

    let hexes = [];
    let size = ((map.length -1) / 2);

    // console.log(size);
    let id = 0;

    /**
       for (var q_column = -2; q_column <= 2; q_column++) {
         var r1 = Math.max(-2, -q_column-2);        Math.max(-2, -(-2)-2) Math.max(-2, 0) = 0
         var r2 = Math.min(2, -q_column+2);         Math.min(2, -(-2)+2)  Math.min(2, 4) = 2
         for (var row = 0; row <= 2; row++) {
            //for (var row = r1; row <= r2; row++) {
           hexes.push(Hex.create({q:q_column, r:row, s:-q_column-row, id:id}));
            id++
         }
       }
     */
// console.group('hexes');
    for (var q_column = -size; q_column <= size; q_column++) {
      var r1 = Math.max(-size, -q_column-size);
      var r2 = Math.min(size, -q_column+size);
// console.log(q_column, r1, r2);
      for (var row = r1; row <= r2; row++) {
        let mapObject = map[row+size][q_column+size];
        // let mapObject = map[q_column+size][row+size];
// console.log('hex q_column:', q_column, 'row:', row, map[q_column+size][row+size]);
        hexes.push(Hex.create({q:q_column, r:row, s:-q_column-row, id:id, map:mapObject}));
        id++
      }
    }
// console.groupEnd()
    return hexes;
  },

  drawGrids(map) {


    // this.drawGrid(
    //   "layout-test-orientation-pointy",
    //   "hsl(60, 10%, 90%)",
    //   true,
    //   Layout.create({
    //     orientation: LAYOUTS.POINTY,
    //     size: Point.create({x:25, y:25}),
    //     origin: Point.create({x:0, y:0})
    //   })
    // );
    // this.drawGrid(
    //   "layout-test-orientation-flat",
    //   "hsl(60, 10%, 85%)",
    //   true,
    //   Layout.create({
    //     orientation: LAYOUTS.FLAT,
    //     size: Point.create({x:25, y:25}),
    //     origin: Point.create({x:0, y:0})
    //   })
    // );
    //
    // // sizes
    // this.drawGrid(
    //   "layout-test-size-1",
    //   "hsl(60, 10%, 85%)",
    //   false,
    //   Layout.create({
    //     orientation: LAYOUTS.POINTY,
    //     size: Point.create({x:10, y:10}),
    //     origin: Point.create({x:0, y:0})
    //   })
    // );
    // this.drawGrid("layout-test-size-2", "hsl(60, 10%, 90%)", false,
    //   Layout.create({
    //     orientation: LAYOUTS.POINTY,
    //     size: Point.create({x:20, y:20}),
    //     origin: Point.create({x:0, y:0})
    //   })
    // );
    // this.drawGrid(
    //   "layout-test-size-3",
    //   "hsl(60, 10%, 85%)",
    //   false,
    //   Layout.create({
    //     orientation: LAYOUTS.POINTY,
    //     size: Point.create({x:40, y:40}),
    //     origin: Point.create({x:0, y:0})
    //   })
    // );

    // this.drawGrid(
    //   "shape-pointy-hexagon",
    //   "hsl(60, 10%, 85%)",
    //   true,
    //   Layout.create({
    //     orientation: LAYOUTS.FLAT,
    //     size: Point.create({x:50, y:50}),
    //     origin: Point.create({x:0, y:0})
    //   }),
    //   undefined,
    //   false
    // );

    this.set('currentLayout', Layout.create({
      orientation: LAYOUTS.FLAT,
      size: Point.create({x:48, y:48}),
      origin: Point.create({x:0, y:0})
    }));

// console.log(this.shapeHexagon(2));

    this.set('currentHexes', this.createHexesFromMap(map));

    this.drawGrid(
      "gamecanvas-flat",
      "hsl(60, 10%, 85%)",
      true,
      this.currentLayout,
      this.currentHexes,
      this.showTiles
    );


    // this.drawGrid("shape-flat-hexagon",
    //   "hsl(60, 10%, 90%)",
    //   false,
    //   Layout.create({
    //     orientation: LAYOUTS.POINTY,
    //     size: Point.create({x:15, y:15}),
    //     origin: Point.create({x:0, y:0})
    //   }),
    //   this.shapeHexagon(6));

  },

  drawGrid(id, backgroundColor, withLabels, layout, hexes, withTiles) {
    var canvas = document.getElementById(id);
    if (!canvas) { return; }
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    if (window.devicePixelRatio && window.devicePixelRatio != 1) {
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    if (hexes === undefined) {
      hexes = this.shapeRectangle(15, 15, this.permuteQRS);
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.translate(width/2, height/2);
    hexes.forEach((hex) => {
      this.drawHex(ctx, layout, hex);
      if (withLabels) this.drawHexLabel(ctx, layout, hex);
      if (withTiles) this.drawHexTile(ctx, layout, hex);
    });
  },

  drawHex(ctx, layout, hex) {
    var corners = layout.polygonCorners(hex);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(corners[5].x, corners[5].y);
    for (var i = 0; i < 6; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.stroke();

    // dan
    // ctx.addHitRegion({hex: hex});
  },

  drawHexTile(ctx, layout, hex) {

    // if(hex.id >= TILEMAP.length){
    //   return;
    // }
    // let tileIndex = TILEMAP[hex.id];
    // if (!hex.map.t) {
    //   return;
    // }
    let tileIndex = hex.map.t;
    // console.log('tileIndex', tileIndex);

    let tileGraphic = this.tileGraphics[tileIndex];
    // // let tileGraphic = this.tileGraphics[drawTile.t];

    let point = layout.hexToPixel(hex);
    let x = Math.floor(point.x) - 48;
    let y = Math.floor(point.y) - 53;
    // console.log('hex:', hex, 'point:', point, tileGraphic, 'x:', x, 'y:', y);
    ctx.drawImage(tileGraphic , x, y );
  },

  drawHexLabel(ctx, layout, hex) {
    var center = layout.hexToPixel(hex);
// console.log('center', center);
    ctx.fillStyle = this.colorForHex(hex);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((hex.id + " " + hex.map.m + ":" + hex.map.t + ":" + hex.q + "," + hex.r), center.x, center.y);
    // ctx.fillText((hex.id + ": " + hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
    // ctx.fillText(hex.len() === 0? "0: q,r,s" : (hex.id + ": " + hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
  },

  colorForHex(hex) {
    // Match the color style used in the main article
    if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
      return "hsl(0, 50%, 0%)";
    } else if (hex.q === 0) {
      return "hsl(90, 70%, 35%)";
    } else if (hex.r === 0) {
      return "hsl(200, 100%, 35%)";
    } else if (hex.s === 0) {
      return "hsl(300, 40%, 50%)";
    } else {
      return "hsl(0, 0%, 50%)";
    }
  },

  shapeRectangle(w, h, constructor) {
    var hexes = [];
    var i1 = -Math.floor(w/2), i2 = i1 + w;
    var j1 = -Math.floor(h/2), j2 = j1 + h;
    for (var j = j1; j < j2; j++) {
      var jOffset = -Math.floor(j/2);
      for (var i = i1 + jOffset; i < i2 + jOffset; i++) {
        hexes.push(constructor(i, j, -i-j));
      }
    }
    return hexes;
  },

  shapeHexagon(size) {
    var hexes = [];
    let id = 0;
    for (var q = -size; q <= size; q++) {
      var r1 = Math.max(-size, -q-size);
      var r2 = Math.min(size, -q+size);
// console.log('shapeHexagon size:',size,'q:', q, 'r1:', r1, 'r2:',r2);
      for (var r = r1; r <= r2; r++) {
        hexes.push(Hex.create({q:q, r:r, s:-q-r, id:id}));
        id++
      }
    }
    return hexes;
  },

  permuteQRS(q, r, s) { return Hex.create({q:q, r:r, s:s}); },
  permuteSRQ(q, r, s) { return Hex.create({q:s, r:r, s:q}); },
  permuteSQR(q, r, s) { return Hex.create({q:s, r:q, s:r}); },
  permuteRQS(q, r, s) { return Hex.create({q:r, r:q, s:s}); },
  permuteRSQ(q, r, s) { return Hex.create({q:r, r:s, s:q}); },
  permuteQSR(q, r, s) { return Hex.create({q:q, r:s, s:r}); },


  actions: {
    hexReport(hexId, event) {
      let x = event.clientX - this.centerX;
      let y = event.clientY - this.centerY;

      // console.log('click', this.rect, event, "x:", x, "y:", y);
      let point = Point.create({x:x, y:y});
      let clickedHex = this.currentLayout.pixelToHex(point).round();

      let mappedHex = this.currentHexes.find((hex) => {
        return (clickedHex.q === hex.q) && (clickedHex.r === hex.r) && (clickedHex.s === hex.s)
      })
      console.log('mappedHex', mappedHex);
      // console.log(clickedHex);
    },

    hexMouseMove(event) {
      let x = event.clientX - this.centerX;
      let y = event.clientY - this.centerY;

      let point = Point.create({x:x, y:y});
      let thisHex = this.currentLayout.pixelToHex(point).round();

      this.set('mouseXY', `X:${event.clientX} Y:${event.clientY}`);
      this.set('currentHex', `Q:${thisHex.q} R:${thisHex.r} S:${thisHex.s}`);
    },

    toggleTiles() {
      this.toggleProperty('showTiles');

      // this.drawGrid(
      //   "gamecanvas-flat",
      //   "hsl(60, 10%, 85%)",
      //   !this.showTiles,
      //   this.currentLayout,
      //   this.currentHexes,
      //   this.showTiles
      // );

      var canvas = document.getElementById('gamecanvas-flat');
      var ctx = canvas.getContext('2d');

      this.currentHexes.forEach((hex) => {
        if (this.showTiles) {
          this.drawHexTile(ctx, this.currentLayout, hex);
        } else {
          this.drawHexLabel(ctx, this.currentLayout, hex);
        }
      });

    }

  }
});
