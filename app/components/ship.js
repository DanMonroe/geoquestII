import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import EmberObject, { computed } from '@ember/object';
// import { htmlSafe } from '@ember/string';
// import { A as emberArray } from '@ember/array';
// import { EKMixin, keyDown } from 'ember-keyboard';
// import { on } from '@ember/object/evented';
// import { task, timeout } from 'ember-concurrency';
// import {inject as service} from '@ember/service';
// import { alias } from '@ember/object/computed';
// import Ship from '../objects/ship';


export default Component.extend({
// export default Component.extend(EKMixin, {
  // ships: emberArray(),
  // currentmap: null,
  // currentMapHexes: null,
  hex: null,
  point: null,
  // q: 0,
  // r: 0,
  // s: 0,
  // boardWidth: 0,
  // boardHeight: 0,
  shipImage: "images/ship.svg",
  // shipHex: null,
  mapCenterX: 0,
  mapCenterY: 0,

  init() {
    this._super(...arguments);

  },

  didInsertElement() {
    this._super(...arguments);

    // console.log('did insert');
    // console.log(this.ship);

//     let ships = emberArray();
//     // let startHex = this.currentMapHexes.find((hex) => {
//     //   return (+this.shipHex.q === hex.q) &&
//     //     (+this.shipHex.r === hex.r) &&
//     //     (+this.shipHex.s === hex.s)
//     // })
// //     let point = this.layout.hexToPixel(startHex);
// console.log('startHex', this.hex);
//
//     ships.push(Ship.create({
//       id: 1,
//       mapCenterX: this.mapCenterX,
//       mapCenterY: this.mapCenterY,
//       hexLayout: this.hexLayout,
//       hex: this.hex
//     }));
//     this.set('ships', ships);
//
//     // let boardHeight = this.currentmap.length;
//     // this.set('boardHeight', boardHeight);
//     // this.set('boardWidth', this.currentmap[0].length);
//     //
//     // console.log('boardHeight', this.boardHeight);
//     // console.log('boardWidth', this.boardWidth);
//
//     this.set('keyboardActivated', true);
  },

  transition: function * ({ keptSprites }) {
    keptSprites.forEach(move);
  },

  // ship: computed('ships.[]', function() {
  //   if(this.ships.length) {
  //     return this.ships.objectAt(0);
  //   }
  // }),

  // // direction: 2
  // up: on(keyDown('KeyW'), function() {
  //   if(this.get('moveTask.isIdle')) {
  //     this.get('moveTask').perform(0, -1);
  //   }
  // }),
  //
  // // direction: 2
  // down: on(keyDown('KeyS'), function() {
  //   if(this.get('moveTask.isIdle')) {
  //     this.get('moveTask').perform(0, 1);
  //   }
  // }),
  //
  // // direction: 5
  // downright: on(keyDown('KeyD'), function() {
  //   if(this.get('moveTask.isIdle')) {
  //     this.get('moveTask').perform(1, 0);
  //   }
  // }),
  //
  // // direction: 3
  // upleft: on(keyDown('KeyQ'), function() {
  //   if(this.get('moveTask.isIdle')) {
  //     this.get('moveTask').perform(-1, 0);
  //   }
  // }),
  //
  // // direction: 1
  // upright: on(keyDown('KeyE'), function() {
  //   if(this.get('moveTask.isIdle')) {
  //     this.get('moveTask').perform(1, -1);
  //   }
  // }),
  //
  // // direction: 4
  // downleft: on(keyDown('KeyA'), function() {
  //   if(this.get('moveTask.isIdle')) {
  //     this.get('moveTask').perform(-1, 1);
  //   }
  // }),

  // canMoveTo: function(x, y) {
  //   // console.log('canMoveTo', x, y);
  //
  //   // out of bounds
  //   if (x <= 0 || y <= 0 || x > this.boardWidth || y > this.boardHeight) {
  //     return false;
  //   }
  //
  //   let targetRow = this.currentmap[y-1];
  //   let targetGrid = targetRow[x-1];
  //
  //   if (targetGrid === null) {
  //     return false;
  //   }
  //
  //   // water?
  //   return targetGrid.m === 'w';
  // },

//   canMoveTo: function(targetHex) {
//     console.log('canMoveTo', targetHex);
//
//     return true;
//
//     // out of bounds
//     if (x <= 0 || y <= 0 || x > this.boardWidth || y > this.boardHeight) {
//       return false;
//     }
//
//     let targetRow = this.currentmap[y-1];
//     let targetGrid = targetRow[x-1];
//
//     if (targetGrid === null) {
//       return false;
//     }
//
//     // water?
//     return targetGrid.m === 'w';
//   },
//
//   moveTask: task(function * (q, r) {
//   // moveTask: task(function * (x,y) {
//     let ship = this.ships.objectAt(0);
//
//     let targetQ = this.hex.q + q;
//     let targetR = this.hex.r + r;
//     let targetS = -(targetQ + targetR);
//
//     let startHex = ship.hex;
//
//     // copied code
//     let targetHex = this.currentMapHexes.find((hex) => {
//       return (targetQ === hex.q) &&
//         (targetR === hex.r) &&
//         (targetS === hex.s)
//     })
// console.log('targetHex', targetHex);
//
//     ship.set('hex', targetHex);
//
//     if( ! this.canMoveTo(targetHex)) {
//       yield timeout(30);
//       ship.set('hex', startHex);
//     }
//     // let startx = +ship.x;
//     // let starty = +ship.y;
//     //
//     // ship.set('x', +ship.x + x);
//     // ship.set('y', +ship.y + y);
//     //
//     // if( ! this.canMoveTo(+ship.x, +ship.y)) {
//     //   yield timeout(30);
//     //   ship.set('x', startx);
//     //   ship.set('y', starty);
//     // }
//
//     // this.enterSpace();
//   })

});
