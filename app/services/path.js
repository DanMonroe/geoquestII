import Service from '@ember/service';
import {inject as service} from '@ember/service';
import { assign } from '@ember/polyfills';
import BinaryHeap from '../objects/binary-heap';

export default Service.extend({

  hexService: service('hex'),
  mapService: service('map'),

  // initFindPathMap() {
  //   let grid = this.mapService.twoDimensionalMap;
  //   for(var x = 0; x < grid.length; x++) {
  //     for(var y = 0; y < grid[x].length; y++) {
  //       if (grid[x][y]) {
  //         assign(grid[x][y], {
  //           f: 0,
  //           g: 0,
  //           h: 0,
  //           cost: 1,
  //           visited: false,
  //           closed: false,
  //           parent: null,
  //           isWall: this.isWall(grid[x][y])
  //         });
  //       }
  //     }
  //   }
  // },

  heap() {
    return new BinaryHeap(function(node) {
      return node.path.f;
    });
  },
  // // converts a Hex obj to the object at the corresponding
  // // two dimensinal array object
  // convertHexToNode(hex) {
  //   let foundNode = null;
  //   let grid = this.mapService.twoDimensionalMap;
  //   for(var x = 0; x < grid.length; x++) {
  //     for (var y = 0; y < grid[x].length; y++) {
  //       let gridObj = grid[x][y];
  //       if (gridObj && gridObj.id === hex.id) {
  //         foundNode = gridObj;
  //         break;
  //       }
  //     }
  //     if (foundNode) { break; }
  //   }
  //   // console.log('foundNode', foundNode);
  //   return foundNode;
  // },

  findGraphNode(sourceList, targetNode) {
    if (!sourceList || !targetNode) {
      return null;
    }
    return sourceList.find(sourceNode => {
      return sourceNode.id === targetNode.id;
    })
  },

  removeGraphNode(sourceList, targetNode) {
    return sourceList.reject((node) => {
      return this.hexService.hasSameCoordinates(targetNode, node);
    });
  },

  // builds the resulting path
  to(node) {
    let ret = [];
    while(node.path.parent) {
      ret.push(node);
      node = node.path.parent;
    }
    return ret.reverse();
  },

  // TODO
  // expand when more tile types available
  // for now, return blocked if the neighbor.m !== 'w" // water
  isWall(neighbor) {
    return false;
    // return neighbor.m !== 'w';
  },

  heuristics: {
    /**
     * To calculate the hex-distance between two hexes, calculate the
     difference between their x-coördinates, the difference between their y-
     coördinates, and the difference between these two differences; take
     the absolute value of each of these three numbers, and the distance is
     the largest of these three values.
     */
    hex(pos0, pos1) {
      if (!pos0 || !pos1) {
        return 0;
      }
      // debugger;
      let d1 = pos1.q - pos0.q;
      let d2 = pos1.r - pos0.r;
      let d3 = pos1.s - pos0.s;
      let distance = Math.max(Math.abs(d1), Math.abs(d2), Math.abs(d3));

      return distance;
    },
    manhattan(pos0, pos1) {
      var d1 = Math.abs(pos1.col - pos0.col);
      var d2 = Math.abs(pos1.row - pos0.row);
      return d1 + d2;
    },
    diagonal(pos0, pos1) {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.col - pos0.col);
      var d2 = Math.abs(pos1.row - pos0.row);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
  },
});
