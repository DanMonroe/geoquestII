import EmberObject, { computed } from '@ember/object';
import {assert} from '@ember/debug';
import Map from './map';


// TODO needs to be a class
export default EmberObject.extend({
  name: 'Map',

  findPath(map, startHex, targetHex) {
    console.log('findPath', map, startHex, targetHex);
  }
});
