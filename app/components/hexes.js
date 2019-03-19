import Component from '@ember/component';
import EmberObject, { computed, set } from '@ember/object';
import {assert} from '@ember/debug';
import { htmlSafe } from '@ember/string';
import { A as emberArray } from '@ember/array';
import { EKMixin, keyDown } from 'ember-keyboard';
import { on } from '@ember/object/evented';
import { task, timeout } from 'ember-concurrency';
import move from 'ember-animated/motions/move';

import Hex, { DIRECTIONS } from '../objects/hex';
import Layout, { LAYOUTS } from '../objects/layout';
import Point from '../objects/point';
import Orientation from '../objects/orientation';
import Ship from '../objects/ship'

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
    [null,       null,       null,       {t:0,m:"w"},{t:0,m:"w"},{t:0,m:"w"},{t:0,m:"w"}],
    [null,       null,       {t:0,m:"w"},{t:0,m:"w"},{t:0,m:"w"},{t:0,m:"w"},{t:0,m:"w"}],
    [null,       {t:0,m:"w"},{t:0,m:"w"},{t:6,m:"l"},{t:0,m:"w"},{t:0,m:"w"},{t:0,m:"w"}],
    [{t:5,m:"l"},{t:2,m:"l"},{t:0,m:"w"},{t:1,m:"l"},{t:0,m:"w"},{t:6,m:"l"},{t:0,m:"w"}],
    [{t:0,m:"w"},{t:0,m:"w"},{t:2,m:"l"},{t:3,m:"l"},{t:0,m:"w"},{t:0,m:"w"},null],
    [{t:0,m:"w"},{t:0,m:"w"},{t:4,m:"l"},{t:2,m:"l"},{t:0,m:"w"},null,       null],
    [{t:0,m:"w"},{t:4,m:"l"},{t:2,m:"l"},{t:0,m:"w"},null,       null,       null]
  ]
);

// start values must sum to 0
export const GAME_CONFIG = Object.freeze({
  shipStartQ: 2,
  shipStartR: -1,
  shipStartS: -1
});

export default Component.extend(EKMixin, {

  ships: emberArray(),


  map: MAP,

  tileGraphics: [],
  showTiles: true,
  tilesLoaded: null,
  shipImage: "images/ship.svg",

  shipHex: null,

  didInsertElement() {
    this._super(...arguments);

    this.loadTiles(TILEIMAGES);

    let canvas = document.getElementById('gamecanvas-flat');
    let rect = canvas.getBoundingClientRect();
    let centerX = (rect.width / 2) + rect.left;
    let centerY = (rect.height / 2) + rect.top;
    this.set('rect', rect);
    this.set('centerX', centerX);
    this.set('centerY', centerY);


    this.set('currentLayout', Layout.create({
      orientation: LAYOUTS.FLAT,
      size: Point.create({x:48, y:48}),
      origin: Point.create({x:0, y:0})
    }));

    this.set('currentHexes', this.createHexesFromMap(MAP));

    let startShipHex = this.currentHexes.find((hex) => {
      return (GAME_CONFIG.shipStartQ === hex.q) &&
        (GAME_CONFIG.shipStartR === hex.r) &&
        (GAME_CONFIG.shipStartS === hex.s)
    });
    // console.log('startShipHex', startShipHex);

    this.set('shipHex', startShipHex);
    let shipPoint = this.currentLayout.hexToPixel(startShipHex)
    console.log('shipPoint', shipPoint);
    this.set('shipPoint', shipPoint);


    this.setupShip();

    this.set('keyboardActivated', true);
  },

  setupShip() {
    let ships = emberArray();

    // console.log('startHex', this.shipHex);

    // let ship = Ship.create({
    //   id: 1,
    //   mapCenterX: this.centerX,
    //   mapCenterY: this.centerY,
    //   hexLayout: this.currentLayout,
    //   hex: this.shipHex
    // });
    // this.set('ship', ship);
    ships.push(Ship.create({
      id: 1,
      mapCenterX: this.centerX,
      mapCenterY: this.centerY,
      hexLayout: this.currentLayout,
      hex: this.shipHex,
      point: this.shipPoint
    }));
    this.set('ships', ships);


  },



  // direction: 2
  up: on(keyDown('KeyW'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(0, -1);
    }
  }),

  // direction: 2
  down: on(keyDown('KeyS'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(0, 1);
    }
  }),

  // direction: 5
  downright: on(keyDown('KeyD'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(1, 0);
    }
  }),

  // direction: 3
  upleft: on(keyDown('KeyQ'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(-1, 0);
    }
  }),

  // direction: 1
  upright: on(keyDown('KeyE'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(1, -1);
    }
  }),

  // direction: 4
  downleft: on(keyDown('KeyA'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(-1, 1);
    }
  }),

  canMoveTo: function(targetHex) {
    // console.log('canMoveTo', targetHex);

    if (!targetHex) {
      return false;
    }
    // out of bounds
    // if (x <= 0 || y <= 0 || x > this.boardWidth || y > this.boardHeight) {
    //   return false;
    // }

    // water?
    return targetHex.map.m === 'w';
  },

  moveTask: task(function * (q, r) {
    // TODO  out of bounds wont animate correctly.
    // used to just try to move x,y and when it was out of bounds,
    // it moved it back. now we can't get out of bounds

    // moveTask: task(function * (x,y) {
    let ship = this.ships.objectAt(0);

    let targetQ = this.shipHex.q + q;
    let targetR = this.shipHex.r + r;
    let targetS = -(targetQ + targetR);

    let startHex = this.shipHex;
    // let startPoint = this.shipPoint;

    // copied code
    let targetHex = this.currentHexes.find((hex) => {
      return (targetQ === hex.q) &&
        (targetR === hex.r) &&
        (targetS === hex.s)
    })
    // console.log('targetHex', targetHex);

    if( ! targetHex ) {
      return;  // see out of bounds comment above
    }

    this.set('shipHex', targetHex);
    ship.set('hex', targetHex);

    if( ! this.canMoveTo(targetHex)) {
      yield timeout(30);
      this.set('shipHex', startHex);
      ship.set('hex', startHex);
    }

    // debugger;
  }),


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
          // this.drawGrids(MAP);
          this.drawGrid(
            "gamecanvas-flat",
            "hsl(60, 10%, 85%)",
            true,
            this.currentLayout,
            this.currentHexes,
            this.showTiles
          );

        }
      }

      this.tileGraphics.pushObject(tileGraphic);
    }
  },


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
      console.group('hex report');

      let x = event.clientX - this.centerX;
      let y = event.clientY - this.centerY;
      console.log('click', this.rect, event, "x:", x, "y:", y);
      let point = Point.create({x:x, y:y});
      let clickedHex = this.currentLayout.pixelToHex(point).round();

      let mappedHex = this.currentHexes.find((hex) => {
        return (clickedHex.q === hex.q) && (clickedHex.r === hex.r) && (clickedHex.s === hex.s)
      })
      console.log('mappedHex', mappedHex);

      let hexToPixelPoint = this.currentLayout.hexToPixel(clickedHex);
      console.log('point', hexToPixelPoint);

      // TODO Maybe move ship on click
      if(this.get('moveTask.isIdle')) {
        let difR =  mappedHex.r < this.shipHex.r ? -1 : (mappedHex.r === this.shipHex.r) ? 0 : 1;
        let difQ =  mappedHex.q < this.shipHex.q ? -1 : (mappedHex.q === this.shipHex.q) ? 0 : 1;

        console.log(difQ, difR);
        if (difR !== difQ) {
          // prevent moving more than one square diagonally
          this.get('moveTask').perform(difQ, difR);
        }
      }

      console.groupEnd();
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
