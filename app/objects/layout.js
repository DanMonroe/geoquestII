import EmberObject, { computed } from '@ember/object';
import {assert} from '@ember/debug';
import Hex from './hex';
import Point from './point';
import Orientation from './orientation'

export const LAYOUTS = Object.freeze({
  POINTY:
    Orientation.create({
      type:'pointy',
      f0:Math.sqrt(3.0),
      f1:Math.sqrt(3.0) / 2.0,
      f2:0.0,
      f3:3.0 / 2.0,
      b0:Math.sqrt(3.0) / 3.0,
      b1:-1.0 / 3.0,
      b2:0.0,
      b3:2.0 / 3.0,
      start_angle:0.5
    }),
  FLAT:
    Orientation.create({
      type:'flat',
      f0:3.0 / 2.0,
      f1:0.0,
      f2:Math.sqrt(3.0) / 2.0,
      f3:Math.sqrt(3.0),
      b0:2.0 / 3.0,
      b1:0.0,
      b2:-1.0 / 3.0,
      b3:Math.sqrt(3.0) / 3.0,
      start_angle:0.0
    })
});

export default EmberObject.extend({
  name: 'Layout',

  orientation: null,
  size: null,
  origin: null,

  // (orientation, size, origin)
  init() {
    this._super(...arguments);
    // this.orientation = orientation;
    // this.size = size;
    // this.origin = origin;
  },

  hexToPixel(h) {
    var M = this.orientation;
    var size = this.size;
    var origin = this.origin;
    var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
    var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
    return Point.create({x:x + origin.x, y:y + origin.y});
  },
  pixelToHex(p) {
    var M = this.orientation;
    var size = this.size;
    var origin = this.origin;
    var pt = Point.create({x:(p.x - origin.x) / size.x, y:(p.y - origin.y) / size.y});
    var q = M.b0 * pt.x + M.b1 * pt.y;
    var r = M.b2 * pt.x + M.b3 * pt.y;
    return Hex.create({q:q, r:r, s:-q - r});
  },
  hexCornerOffset(corner) {
    var M = this.orientation;
    var size = this.size;
    var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6.0;
    return Point.create({x:size.x * Math.cos(angle), y:size.y * Math.sin(angle)});
  },
  polygonCorners(h) {
    var corners = [];
    var center = this.hexToPixel(h);
    for (var i = 0; i < 6; i++) {
      var offset = this.hexCornerOffset(i);
      corners.push(Point.create({x:center.x + offset.x, y:center.y + offset.y}));
    }
    return corners;
  }
});
