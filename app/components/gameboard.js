import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import EmberObject, { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { A as emberArray } from '@ember/array';
import { EKMixin } from 'ember-keyboard';
import { keyDown } from 'ember-keyboard';
import { on } from '@ember/object/evented';

let Ship = EmberObject.extend({
  style: computed('x', 'y', function() {
    return htmlSafe(`top: ${parseFloat(this.get('y'))*60}px; left: ${parseFloat(this.get('x'))*60}px; `);
  })
});

const rawboard = [
  [
    {t:'w a'},{t:'w b'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'},{t:'l'}
  ]
];
const board_width = 7;
const board_height = 7;

export default Component.extend( EKMixin,{

  classNames: ['gameboard'],

  showShip: false,
  board: null,

  init() {
    this._super(...arguments);
    this.buildBoard();
    this.set('keyboardActivated', true);
  },

  buildBoard() {
    // console.log(board);
    // for(let y=0; y < board_height; y++) {
    //   for(let x=0; x < board_width; x++) {
    //     let boardPiece = board[y][x];
    //     console.log(boardPiece);
    //   }
    // }
    let rows = emberArray();
    for(let row = 0; row < board_height; row++){

      let grids = emberArray();

      for(let col = 0; col < board_width; col++){
        // console.log('row', row, 'col', col, rawboard[row][col]);
        grids.pushObject(EmberObject.create(rawboard[row][col]));
      }
      let newRow = EmberObject.create({
        grids: grids
      });

      rows.pushObject(newRow);
    }
    let board = EmberObject.create({
      rows: rows
    });

    // console.log('board', board);

    this.set('board', board)
  },

  transition: function * ({ keptSprites }) {
    keptSprites.forEach(move);
  },

  ships: computed(function() {
    let ships = emberArray();
    ships.push(Ship.create({ id: 1, x: 0, y: 0 }));

    return ships;
  }),

  ship: computed('ships.[]', function() {
    if(this.ships.length) {
      return this.ships.objectAt(0);
    }
  }),

  up: on(keyDown('ArrowUp'), function() {
    this.move(0, -1);
  }),

  down: on(keyDown('ArrowDown'), function() {
    this.move(0, 1);
  }),

  right: on(keyDown('ArrowRight'), function() {
    this.move(1, 0);
  }),

  left: on(keyDown('ArrowLeft'), function() {
    this.move(-1, 0);
  }),

  move(x,y) {
    let ship = this.ships.objectAt(0);
    ship.set('x', ship.x + x)
    ship.set('y', ship.y + y)
  }

});
