import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({

  mapService: service('map'),

  directions: [
    {col:1, row:0},
    {col:1, row:-1},
    {col:0, row:-1},
    {col:-1, row:0},
    {col:-1, row:1},
    {col:0, row:1}
  ],

  hasSameCoordinates(aHex, bHex) {
    return (aHex.q === bHex.q &&
      aHex.r === bHex.r &&
      aHex.s === bHex.s);
  },


  neighbors(currentHex) {
    let neighbors = [];
    // neighbors from hex
    // dir: col row of the original map 2 dimensional array

    // console.log('neighbors currentHex', currentHex);

    // could be node or hex
    // let currentCol = currentHex.col || currentHex.map.col;
    // let currentRow = currentHex.row || currentHex.map.row;
    let currentCol = currentHex.col;
    let currentRow = currentHex.row;

    for (let i = 0; i < 6; i++) {
      neighbors.push(this.getNeighborByColAndRow(
        currentCol + this.directions[i].col,
        currentRow + this.directions[i].row
      ));
    }

    // console.log('neighbors', neighbors);

    return neighbors;
  },

  getNeighborByColAndRow(col, row) {
    if (!this.mapService.twoDimensionalMap) {
      return null;
    }
    if (row < 0 || col < 0) {
      return null;
    }
    if (row > this.mapService.twoDimensionalMap.length) {
      return null;
    }
    if (col > this.mapService.twoDimensionalMap[row].length) {
      return null;
    }

    return this.mapService.twoDimensionalMap[row][col];
  }
});
