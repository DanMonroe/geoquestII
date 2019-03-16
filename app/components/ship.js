import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import EmberObject, { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { A as emberArray } from '@ember/array';
import { EKMixin, keyDown } from 'ember-keyboard';
import { on } from '@ember/object/evented';
import { task, timeout } from 'ember-concurrency';
import {inject as service} from '@ember/service';
import { alias } from '@ember/object/computed';


let Ship = EmberObject.extend({
  style: computed('x', 'y', function() {

    let newx = parseFloat((this.get('x') * 70) - 40);
    let newy = parseFloat((this.get('x') * 42) + (this.get('y') * 81) - 180);    // 42 is 84 / 2


    return htmlSafe(`top: ${newy}px; left: ${newx}px; `);
  })
});


export default Component.extend(EKMixin, {
  ships: emberArray(),
  currentmap: null,
  startx: 0,
  starty: 0,
  boardWidth: 0,
  boardHeight: 0,

  init() {
    this._super(...arguments);

    let ships = emberArray();

    ships.push(Ship.create({
      id: 1,
      x: this.startx,
      y: this.starty
    }));
    this.set('ships', ships);

    let boardHeight = this.currentmap.length;
    this.set('boardHeight', boardHeight);
    this.set('boardWidth', this.currentmap[0].length);

    console.log('boardHeight', this.boardHeight);
    console.log('boardWidth', this.boardWidth);

    this.set('keyboardActivated', true);
  },

  transition: function * ({ keptSprites }) {
    keptSprites.forEach(move);
  },

  // ship: computed('ships.[]', function() {
  //   if(this.ships.length) {
  //     return this.ships.objectAt(0);
  //   }
  // }),

  up: on(keyDown('KeyW'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(0, -1);
    }
  }),

  down: on(keyDown('KeyS'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(0, 1);
    }
  }),

  downright: on(keyDown('KeyD'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(1, 0);
    }
  }),

  upleft: on(keyDown('KeyQ'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(-1, 0);
    }
  }),

  upright: on(keyDown('KeyE'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(1, -1);
    }
  }),

  downleft: on(keyDown('KeyA'), function() {
    if(this.get('moveTask.isIdle')) {
      this.get('moveTask').perform(-1, 1);
    }
  }),

  canMoveTo: function(x, y) {
    // console.log('canMoveTo', x, y);

    // out of bounds
    if (x <= 0 || y <= 0 || x > this.boardWidth || y > this.boardHeight) {
      return false;
    }

    let targetRow = this.currentmap[y-1];
    let targetGrid = targetRow[x-1];

    if (targetGrid === null) {
      return false;
    }

    // water?
    return targetGrid.m === 'w';
  },

  moveTask: task(function * (x,y) {
    let ship = this.ships.objectAt(0);

    let startx = +ship.x;
    let starty = +ship.y;

    ship.set('x', +ship.x + x);
    ship.set('y', +ship.y + y);

    if( ! this.canMoveTo(+ship.x, +ship.y)) {
      yield timeout(30);
      ship.set('x', startx);
      ship.set('y', starty);
    }

    // this.enterSpace();
  })

});
