import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import {assert} from '@ember/debug';

import Hex from '../objects/hex';
import Layout, { LAYOUTS } from '../objects/layout';
import Point from '../objects/point';
import Orientation from '../objects/orientation';

export default Component.extend({

  init() {
    this._super(...arguments);

  },

  didInsertElement() {
    this._super(...arguments);

    this.drawGrid(
      "layout-test-orientation-pointy",
      "hsl(60, 10%, 90%)",
      true,
      Layout.create({
        orientation: LAYOUTS.POINTY,
        size: Point.create({x:25, y:25}),
        origin: Point.create({x:0, y:0})
      })
    );
    this.drawGrid(
      "layout-test-orientation-flat",
      "hsl(60, 10%, 85%)",
      true,
      Layout.create({
        orientation: LAYOUTS.FLAT,
        size: Point.create({x:25, y:25}),
        origin: Point.create({x:0, y:0})
      })
    );

    // sizes
    this.drawGrid(
      "layout-test-size-1",
      "hsl(60, 10%, 85%)",
      false,
      Layout.create({
        orientation: LAYOUTS.POINTY,
        size: Point.create({x:10, y:10}),
        origin: Point.create({x:0, y:0})
      })
    );
    this.drawGrid("layout-test-size-2", "hsl(60, 10%, 90%)", false,
      Layout.create({
        orientation: LAYOUTS.POINTY,
        size: Point.create({x:20, y:20}),
        origin: Point.create({x:0, y:0})
      })
    );
    this.drawGrid(
      "layout-test-size-3",
      "hsl(60, 10%, 85%)",
      false,
      Layout.create({
        orientation: LAYOUTS.POINTY,
        size: Point.create({x:40, y:40}),
        origin: Point.create({x:0, y:0})
      })
    );

    this.drawGrid(
      "shape-pointy-hexagon",
      "hsl(60, 10%, 85%)",
      false,
      Layout.create({
        orientation: LAYOUTS.POINTY,
        size: Point.create({x:15, y:15}),
        origin: Point.create({x:0, y:0})
      }),
      this.shapeHexagon(6)
    );
    this.drawGrid("shape-flat-hexagon",
      "hsl(60, 10%, 90%)",
      false,
      Layout.create({
        orientation: LAYOUTS.POINTY,
        size: Point.create({x:15, y:15}),
        origin: Point.create({x:0, y:0})
      }),
      this.shapeHexagon(6));

  },

  drawGrid(id, backgroundColor, withLabels, layout, hexes) {
    var canvas = document.getElementById(id);
    if (!canvas) { return; }
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    if (window.devicePixelRatio && window.devicePixelRatio != 1) {
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    if (hexes === undefined) {
      hexes = this.shapeRectangle(15, 15, this.permuteQRS);
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.translate(width/2, height/2);
    hexes.forEach((hex) => {
      this.drawHex(ctx, layout, hex);
      if (withLabels) this.drawHexLabel(ctx, layout, hex);
    });
  },

  drawHex(ctx, layout, hex) {
    var corners = layout.polygonCorners(hex);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(corners[5].x, corners[5].y);
    for (var i = 0; i < 6; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.stroke();
  },

  drawHexLabel(ctx, layout, hex) {
    var center = layout.hexToPixel(hex);
    ctx.fillStyle = this.colorForHex(hex);
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hex.len() === 0? "q,r,s" : (hex.q + "," + hex.r + "," + hex.s), center.x, center.y);
  },

  colorForHex(hex) {
    // Match the color style used in the main article
    if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
      return "hsl(0, 50%, 0%)";
    } else if (hex.q === 0) {
      return "hsl(90, 70%, 35%)";
    } else if (hex.r === 0) {
      return "hsl(200, 100%, 35%)";
    } else if (hex.s === 0) {
      return "hsl(300, 40%, 50%)";
    } else {
      return "hsl(0, 0%, 50%)";
    }
  },

  shapeRectangle(w, h, constructor) {
    var hexes = [];
    var i1 = -Math.floor(w/2), i2 = i1 + w;
    var j1 = -Math.floor(h/2), j2 = j1 + h;
    for (var j = j1; j < j2; j++) {
      var jOffset = -Math.floor(j/2);
      for (var i = i1 + jOffset; i < i2 + jOffset; i++) {
        hexes.push(constructor(i, j, -i-j));
      }
    }
    return hexes;
  },

  shapeHexagon(size) {
    var hexes = [];
    for (var q = -size; q <= size; q++) {
      var r1 = Math.max(-size, -q-size);
      var r2 = Math.min(size, -q+size);
      for (var r = r1; r <= r2; r++) {
        hexes.push(Hex.create({q:q, r:r, s:-q-r}));
      }
    }
    return hexes;
  },

  permuteQRS(q, r, s) { return Hex.create({q:q, r:r, s:s}); },
  permuteSRQ(q, r, s) { return Hex.create({q:s, r:r, s:q}); },
  permuteSQR(q, r, s) { return Hex.create({q:s, r:q, s:r}); },
  permuteRQS(q, r, s) { return Hex.create({q:r, r:q, s:s}); },
  permuteRSQ(q, r, s) { return Hex.create({q:r, r:s, s:q}); },
  permuteQSR(q, r, s) { return Hex.create({q:q, r:s, s:r}); }
});
