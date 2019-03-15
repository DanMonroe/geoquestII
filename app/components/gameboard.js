import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import EmberObject, { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { A as emberArray } from '@ember/array';
import { EKMixin } from 'ember-keyboard';
import { keyDown } from 'ember-keyboard';
import { on } from '@ember/object/evented';
import { task, timeout } from 'ember-concurrency';
import {inject as service} from '@ember/service';
import { alias } from '@ember/object/computed';


// let Ship = EmberObject.extend({
//   style: computed('x', 'y', function() {
//     return htmlSafe(`top: ${parseFloat(this.get('y'))*60}px; left: ${parseFloat(this.get('x'))*60}px; `);
//   })
// });

/**
 *
 * t: terrain
 *    w: water
 *    l: land
 *
 * cmd: command number
 */
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

export default Component.extend( EKMixin,{

  classNames: ['boardContainer'],

  showShip: false,
  game: service(),
  gameboard: service(),
  board: alias('gameboard.board'),

  init() {
    this._super(...arguments);
    // debugger;
    this.game.init();
    this.gameboard.buildBoard();

    // this.buildBoard();
    this.set('keyboardActivated', true);
  },

  didInsertElement() {
    this._super(...arguments);
// debugger;
    GiLoad.load_run(null, this.story, 'base64');
    GlkOte.setgeoquestoptions({
      'geoq_window':'.InvisibleCursor',
      'api':{
        gameboard: this
      }
    });
  },
        // move:this.get('moveTask')

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
  // },

  transition: function * ({ keptSprites }) {
    keptSprites.forEach(move);
  },

  // ships: computed(function() {
  //   let ships = emberArray();
  //   ships.push(Ship.create({
  //     id: 1,
  //     x: 3,
  //     y: 2
  //   }));
  //
  //   return ships;
  // }),

  ship: computed('game.ships.[]', function() {
    if(this.game.ships.length) {
      return this.game.ships.objectAt(0);
    }
  }),

  up: on(keyDown('ArrowUp'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(0, -1);
    }
  }),

  down: on(keyDown('ArrowDown'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(0, 1);
    }
  }),

  right: on(keyDown('ArrowRight'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(1, 0);
    }
  }),

  left: on(keyDown('ArrowLeft'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(-1, 0);
    }
  }),

  buttonMove(x, y) {
    this.get('moveTask').perform(x, y);
  },

  canMoveTo: function(x, y) {
    // out of bounds
    if (x < 0 || y < 0 || x >= board_width || y >= board_height) {
      return false;
    }

    let targetRow = this.board.rows.objectAt(y);
    let targetGrid = targetRow.grids.objectAt(x);

    // water?
    return targetGrid.t === 'w';
  },

  moveTask: task(function * (x,y) {
    let ship = this.game.ships.objectAt(0);

    let startx = ship.x;
    let starty = ship.y;

    ship.set('x', ship.x + x);
    ship.set('y', ship.y + y);

    if( ! this.canMoveTo(ship.x, ship.y)) {
      yield timeout(30);
      ship.set('x', startx);
      ship.set('y', starty);
    }

    this.enterSpace();
  }),

  // IF interaction:
  enterSpace() {
    let space = rawboard[this.ship.y][this.ship.x];

    if (space) {
      this.processCommand(space.cmd);
    }
  },

  geoqMove(x,y) {
    debugger;
    this.get('moveTask').perform(x, y);
  },

  geoquestevent(command, glkoteEventCallback) {
    GlkOte.geoquestevent(
      command,
      {
      },
      glkoteEventCallback);

    // 'ship': this.ship,
    // 'move': this.move
  },


  processCommand(command) {
    switch (command) {
      case 1: // try sending north command
        this.geoquestevent('N', this.glkoteEventCallback);
        break;
      default:
        break;
    }
  },

  glkoteEventCallback() {
    console.log('glkoteEventCallback', arguments);
  },

  actions: {
    submitCommandToIF() {
      // debugger;
      // GlkOte.extevent(this.experimentalInput);
      this.geoquestevent(this.experimentalInput, this.glkoteEventCallback);

    }
  }

});
