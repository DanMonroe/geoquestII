import EmberObject, { computed } from '@ember/object';
import {assert} from '@ember/debug';
import Hex from './hex';

export default EmberObject.extend({
  name: 'Hex',

  id: null,
  q: null,
  r: null,
  s: null,

  directions: computed(function() {
      return [
        Hex.create({q:1, r:0, s:-1}),
        Hex.create({q:1, r:-1,s: 0}),
        Hex.create({q:0, r:-1,s: 1}),
        Hex.create({q:-1,r: 0,s: 1}),
        Hex.create({q:-1,r: 1,s: 0}),
        Hex.create({q:0, r:1, s:-1})
      ];
    }
  ),
  diagonals:  computed(function() {
      return [
        Hex.create({q:2, r:-1, s:-1}),
        Hex.create({q:1, r:-2, s:1 }),
        Hex.create({q:-1,r:-1, s:2 }),
        Hex.create({q:-2,r: 1, s:1 }),
        Hex.create({q:-1,r: 2, s:-1}),
        Hex.create({q:1, r:1,  s:-2})
      ];
    }
  ),

  init() {
    this._super(...arguments);
    assert('q + r + s must be 0', Math.round(this.q + this.r + this.s) === 0);
  },
  add(b) {
    return Hex.create({q:this.q + b.q, r:this.r + b.r, s:this.s + b.s});
  },
  subtract(b) {
    return Hex.create({q:this.q - b.q, r:this.r - b.r, s:this.s - b.s});
  },
  scale(k) {
    return Hex.create({q:this.q * k, r:this.r * k, s:this.s * k});
  },
  rotateLeft() {
    return Hex.create({q:-this.s, r:-this.q, s:-this.r});
  },
  rotateRight() {
    return Hex.create({q:-this.r, r:-this.s, s:-this.q, });
  },
  direction(direction) {
    return this.directions[direction];
  },
  neighbor(direction) {
    return this.add(this.direction(direction));
  },
  diagonalNeighbor(direction) {
    return this.add(this.diagonals[direction]);
  },
  len() {
    return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
  },
  distance(b) {
    return this.subtract(b).len();
  },
  round() {
    var qi = Math.round(this.q);
    var ri = Math.round(this.r);
    var si = Math.round(this.s);
    var q_diff = Math.abs(qi - this.q);
    var r_diff = Math.abs(ri - this.r);
    var s_diff = Math.abs(si - this.s);
    if (q_diff > r_diff && q_diff > s_diff) {
      qi = -ri - si;
    }
    else if (r_diff > s_diff) {
      ri = -qi - si;
    }
    else {
      si = -qi - ri;
    }
    return Hex.create({q:qi, r:ri, s:si});
  },
  lerp(b, t) {
    return Hex.create({q:this.q * (1.0 - t) + b.q * t, r:this.r * (1.0 - t) + b.r * t, s:this.s * (1.0 - t) + b.s * t});
  },
  linedraw(b) {
    var N = this.distance(b);
    var a_nudge = Hex.create({q:this.q + 0.000001, r:this.r + 0.000001, s:this.s - 0.000002});
    var b_nudge = Hex.create({q:b.q + 0.000001, r:b.r + 0.000001, s:b.s - 0.000002});
    var results = [];
    var step = 1.0 / Math.max(N, 1);
    for (var i = 0; i <= N; i++) {
      results.push(a_nudge.lerp(b_nudge, step * i).round());
    }
    return results;
  }
});
