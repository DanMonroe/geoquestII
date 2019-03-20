import Component from '@ember/component';
import EmberObject, { computed, set } from '@ember/object';
import {assert} from '@ember/debug';
import { htmlSafe } from '@ember/string';
import { A as emberArray } from '@ember/array';
import { EKMixin, keyDown } from 'ember-keyboard';
import { on } from '@ember/object/evented';
import { task, timeout } from 'ember-concurrency';
import move from 'ember-animated/motions/move';
import {inject as service} from '@ember/service';

import Hex, { DIRECTIONS } from '../objects/hex';
import Layout, { LAYOUTS } from '../objects/layout';
import Point from '../objects/point';
import Orientation from '../objects/orientation';
import Ship from '../objects/ship';

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
    [null,                        null,                         null,                         {id:21,col:3,row:0,t:0,m:"w"},{id:28,col:4,row:0,t:0,m:"w"},{id:35,col:5,row:0,t:0,m:"w"},{id:42,col:6,row:0,t:0,m:"w"}],
    [null,                        null,                         {id:15,col:2,row:1,t:0,m:"w"},{id:22,col:3,row:1,t:0,m:"w"},{id:29,col:4,row:1,t:0,m:"w"},{id:36,col:5,row:1,t:0,m:"w"},{id:43,col:6,row:1,t:0,m:"w"}],
    [null,                        {id:9, col:1,row:2,t:0,m:"w"},{id:16,col:2,row:2,t:0,m:"w"},{id:23,col:3,row:2,t:6,m:"l"},{id:30,col:4,row:2,t:0,m:"w"},{id:37,col:5,row:2,t:0,m:"w"},{id:44,col:6,row:2,t:0,m:"w"}],
    [{id:3,col:0,row:3,t:5,m:"l"},{id:10,col:1,row:3,t:2,m:"l"},{id:17,col:2,row:3,t:0,m:"w"},{id:24,col:3,row:3,t:1,m:"l"},{id:31,col:4,row:3,t:0,m:"w"},{id:38,col:5,row:3,t:6,m:"l"},{id:45,col:6,row:3,t:0,m:"w"}],
    [{id:4,col:0,row:4,t:0,m:"w"},{id:11,col:1,row:4,t:0,m:"w"},{id:18,col:2,row:4,t:2,m:"l"},{id:25,col:3,row:4,t:3,m:"l"},{id:32,col:4,row:4,t:0,m:"w"},{id:39,col:5,row:4,t:0,m:"w"},null],
    [{id:5,col:0,row:5,t:0,m:"w"},{id:12,col:1,row:5,t:0,m:"w"},{id:19,col:2,row:5,t:4,m:"l"},{id:26,col:3,row:5,t:2,m:"l"},{id:33,col:4,row:5,t:0,m:"w"},null,                         null],
    [{id:6,col:0,row:6,t:0,m:"w"},{id:13,col:1,row:6,t:4,m:"l"},{id:20,col:2,row:6,t:2,m:"l"},{id:27,col:3,row:6,t:0,m:"w"},null,                         null,                         null]
  ]
);

// start values must sum to 0
export const GAME_CONFIG = Object.freeze({
  shipStartQ: 0,
  shipStartR: 0,
  shipStartS: 0,

  tempTargetQ: 0,
  tempTargetR: 2,
  tempTargetS: -2,
});
  // tempTargetQ: 0,
  // tempTargetR: -1,
  // tempTargetS: 1,

// working
  // tempTargetQ: 2,
  // tempTargetR: -3,
  // tempTargetS: 1

export default Component.extend(EKMixin, {

  ships: emberArray(),

  mapService: service('map'),
  hexService: service('hex'),

  map: MAP,

  tileGraphics: [],
  showTiles: false,
  showShip: false,
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

    // Map setup
    this.mapService.set('hexMap', this.createHexesFromMap(MAP));
    this.mapService.set('twoDimensionalMap', MAP)

    // Ship setup
    let startShipHex = this.mapService.hexMap.find((hex) => {
      return (GAME_CONFIG.shipStartQ === hex.q) &&
        (GAME_CONFIG.shipStartR === hex.r) &&
        (GAME_CONFIG.shipStartS === hex.s)
    });
    // console.log('startShipHex', startShipHex);

    this.set('shipHex', startShipHex);
    let shipPoint = this.currentLayout.hexToPixel(startShipHex)
    // console.log('shipPoint', shipPoint);
    this.set('shipPoint', shipPoint);


    if (this.showShip) {
      this.setupShip();
    }

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
    //   hex: this.shipHex,
    //   point: this.shipPoint
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
    // let ship = this.ship;
    let ship = this.ships.objectAt(0);

    let targetQ = this.shipHex.q + q;
    let targetR = this.shipHex.r + r;
    let targetS = -(targetQ + targetR);

    let startHex = this.shipHex;
    // let startPoint = this.shipPoint;

    // copied code
    let targetHex = this.mapService.hexMap.find((hex) => {
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
            this.mapService.hexMap,
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

    for (var q_column = -size; q_column <= size; q_column++) {
      var r1 = Math.max(-size, -q_column-size);
      var r2 = Math.min(size, -q_column+size);
// console.log(q_column, r1, r2);
      for (var row = r1; row <= r2; row++) {
        let mapObject = map[row+size][q_column+size];
        mapObject.q = q_column;
        mapObject.r = row;
        mapObject.s = -q_column-row;
        // console.log(row+size, q_column+size, mapObject);
        hexes.push(Hex.create({id:mapObject.id, q:q_column, r:row, s:-q_column-row, map:mapObject}));
      }
    }
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

  drawHex(ctx, layout, hex, fillStyle) {
    var corners = layout.polygonCorners(hex);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
    }
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
    ctx.fillText((hex.map.id + " " + hex.map.m + ":" + hex.map.t), center.x, center.y-7);
    ctx.fillText((hex.q + "," + hex.r), center.x, center.y+8);
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

      let mappedHex = this.mapService.hexMap.find((hex) => {
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

      this.mapService.hexMap.forEach((hex) => {
        if (this.showTiles) {
          this.drawHexTile(ctx, this.currentLayout, hex);
        } else {
          this.drawHexLabel(ctx, this.currentLayout, hex);
        }
      });

    },

    findPath() {
      let targetHex = this.mapService.hexMap.find((hex) => {
        return (GAME_CONFIG.tempTargetQ === hex.q) &&
          (GAME_CONFIG.tempTargetR === hex.r) &&
          (GAME_CONFIG.tempTargetS === hex.s)
      });
      // console.log('shipHex', this.shipHex);
      // console.log('targetHex', targetHex);

      console.log('findPath from hex', this.shipHex.id, 'to', targetHex.id);
      let path = this.mapService.findPath(this.shipHex, targetHex);
      console.log('path', path);

      // let path = this.mapService.findPath(this.mapService.hexMap, this.shipHex, targetHex);

    }


  }  // actions


});
