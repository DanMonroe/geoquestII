import EmberObject from '@ember/object';
import DoubleCoord from './double-coord';
import Hex from './hex';

export default EmberObject.extend({
  name: 'DoubleCoord',

  col,
  row,

  qdoubledFromCube(h) {
    var col = h.q;
    var row = 2 * h.r + h.q;
    return DoubledCoord.create({col:col, row:row});
  },
  qdoubledToCube() {
    var q = this.col;
    var r = (this.row - this.col) / 2;
    var s = -q - r;
    return Hex.create({q:q, r:r, s:s});
  },
  rdoubledFromCube(h) {
    var col = 2 * h.q + h.r;
    var row = h.r;
    return DoubledCoord.create({col:col, row:row});
  },
  rdoubledToCube() {
    var q = (this.col - this.row) / 2;
    var r = this.row;
    var s = -q - r;
    return Hex.create({q:q, r:r, s:s});
  }
});
