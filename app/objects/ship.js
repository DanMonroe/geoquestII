import EmberObject, { computed } from '@ember/object';
import {assert} from '@ember/debug';
import { htmlSafe } from '@ember/string';

export default EmberObject.extend({
  name: 'Ship',

  style: computed('mapCenterX', 'mapCenterY', 'hex', 'hexLayout', function() {
    if (this.hexLayout && this.hex) {
// console.log(this.hex);
// debugger;
      let point = this.hexLayout.hexToPixel(this.hex);
      let newx = this.mapCenterX + parseFloat(point.x - 8);   // - 30
      let newy = this.mapCenterY + parseFloat(point.y + 10);  // - 30

      // console.log('ship hex', this.hex, point, newx, newy);

      // let newx = parseFloat((this.get('x') * 70) - 40);
      // let newy = parseFloat((this.get('x') * 42) + (this.get('y') * 81) - 180);    // 42 is 84 / 2

// console.log('ship style', htmlSafe(`top: ${newy}px; left: ${newx}px;`));
      return htmlSafe(`top: ${newy}px; left: ${newx}px;`);
    }
    return htmlSafe('display: none;');
  })

});
