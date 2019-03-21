import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
  name: 'GridNode',

  // x: null,
  // y: null,
  // weight: null,

  init() {
    this._super(...arguments);
  },

  getCost(fromNeighbor) {
    // Take diagonal weight into consideration.
    // but NO, we don't do diagonals on hex maps
    // if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
    //   return this.weight * 1.41421;
    // }
    return this.path.w;
    // return this.weight;
  }

  // isWall() {
  //   return this.weight === 0;
  // }

});
