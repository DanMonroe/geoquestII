
import Component from '@ember/component';
import { A as emberArray } from '@ember/array';
import {inject as service} from '@ember/service';

/**
 * Axial coordinates
 * t: tile number
 * m: "move"
 *    "w" : water passage ability
 */
export const MAP = Object.freeze(
  [
    [null,       null,       {t:0,m:"w"},{t:1,m:"l"},{t:6,m:"l"}],
    [null,       {t:0,m:"w"},{t:0,m:"w"},{t:1,m:"l"},{t:1,m:"l"}],
    [{t:5,m:"l"},{t:2,m:"l"},{t:0,m:"w"},{t:1,m:"l"},{t:0,m:"w"}],
    [{t:2,m:"l"},{t:3,m:"l"},{t:0,m:"w"},{t:0,m:"w"},null],
    [{t:4,m:"l"},{t:2,m:"l"},{t:0,m:"w"},null,       null]
  ]
);

export default Component.extend({

  hexagonal: service(),
  map: MAP,

  // init() {
  //   this._super(...arguments);
  //   // debugger;
  // },

  didInsertElement() {
    this._super(...arguments);
    this.hexagonal.buildBoard(this.map);
  },

  actions: {
    hexReport(event) {
      // this.hexagonal.hexReport(event);
    }
  }

});
