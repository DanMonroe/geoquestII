import Service from '@ember/service';
import { A as emberArray } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import { htmlSafe } from '@ember/string';

let Ship = EmberObject.extend({
  style: computed('x', 'y', function() {
    return htmlSafe(`top: ${parseFloat(this.get('y'))*60}px; left: ${parseFloat(this.get('x'))*60}px; `);
  })
});

export default Service.extend({
  ships: emberArray(),

  init() {
    let ships = emberArray();
    ships.push(Ship.create({
      id: 1,
      x: 3,
      y: 2
    }));
    this.set('ships', ships);


  }
});
