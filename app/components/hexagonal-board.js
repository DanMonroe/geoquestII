
import Component from '@ember/component';
import { A as emberArray } from '@ember/array';
import {inject as service} from '@ember/service';

export default Component.extend({

  hexagonal: service(),

  // init() {
  //   this._super(...arguments);
  //   // debugger;
  // },

  didInsertElement() {
    this._super(...arguments);
    this.hexagonal.buildBoard();
  },

  actions: {
    hexReport(event) {
      this.hexagonal.hexReport(event);

    }
  }

});
