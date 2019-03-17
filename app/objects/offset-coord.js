import EmberObject, { computed } from '@ember/object';
import {assert} from '@ember/debug';
import OffsetCoord from './offset-coord';
import Hex from './hex';

export default EmberObject.extend({
  name: 'OffsetCoord',

  col,
  row,

  EVEN: 1,
  ODD: -1,

  qoffsetFromCube(offset, h) {
    var col = h.q;
    var row = h.r + (h.q + offset * (h.q & 1)) / 2;
    return OffsetCoord.create({col:col, row:row});
  },
  qoffsetToCube(offset, h) {
    var q = h.col;
    var r = h.row - (h.col + offset * (h.col & 1)) / 2;
    var s = -q - r;
    return Hex.create({q:q, r:r, s:s});
  },
  roffsetFromCube(offset, h) {
    var col = h.q + (h.r + offset * (h.r & 1)) / 2;
    var row = h.r;
    return OffsetCoord.create({col:col, row:row});
  },
  roffsetToCube(offset, h) {
    var q = h.col - (h.row + offset * (h.row & 1)) / 2;
    var r = h.row;
    var s = -q - r;
    return Hex.create({q:q, r:r, s:s});
  }
});
