import EmberObject, { computed } from '@ember/object';
import GridNode from './grid-node';
import { assign } from '@ember/polyfills';

export default EmberObject.extend({
  name: 'Graph',

  grid: null,
  gridIn: null,
  nodes: null,
  dirtyNodes: null,

  directions: [
    {col:1, row:0},
    {col:1, row:-1},
    {col:0, row:-1},
    {col:-1, row:0},
    {col:-1, row:1},
    {col:0, row:1}
  ],

  init() {
    this._super(...arguments);
    this.set('grid',[]);
    this.set('nodes',[]);
    this.set('dirtyNodes',[]);
  },

  // TODO update the originalMAP object to include weight as int.
  setup() {
    let tempGrid = [];
    for (var x = 0; x < this.gridIn.length; x++) {
      tempGrid[x] = [];

      for (var y = 0, row = this.gridIn[x]; y < row.length; y++) {
        let sourceNode = this.gridIn[x][y];
        if (sourceNode === null) {
          tempGrid[x][y] = null;
        } else {
          // let localProps = {
          //   x:x,
          //   y:y,
          //   weight:0
          // };
          // let assignedNode = assign(localProps, tempGrid[x][y]);
          // var node = GridNode.create(assignedNode);
          // var node = GridNode.create(tempGrid[x][y]);

          // weight:row[y] !== null ? row[y].weight : 0
          // tempGrid[x][y] = node;
          tempGrid[x][y] = sourceNode;
          this.nodes.push(sourceNode);
        }
        // var node = GridNode.create({
        //   x:x,
        //   y:y,
        //   weight:0
        // });
        //   // weight:row[y] !== null ? row[y].weight : 0
        // tempGrid[x][y] = node;
        // this.nodes.push(node);
      }
    }
    this.set('grid', tempGrid);

    for (var i = 0; i < this.nodes.length; i++) {
      this.cleanNode(this.nodes[i]);
    }
  },

  cleanDirty() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
      this.cleanNode(this.dirtyNodes[i]);
    }
    this.set('dirtyNodes', []);
  },

  markDirty(node) {
    this.dirtyNodes.push(node);
  },

  neighbors(node) {
    let neighbors = [];
    // neighbors from hex
    // dir: col row of the original map 2 dimensional array

    // console.log('neighbors currentHex', currentHex);

    // could be node or hex
    // let currentCol = currentHex.col || currentHex.map.col;
    // let currentRow = currentHex.row || currentHex.map.row;
    let currentCol = node.col;
    let currentRow = node.row;

    for (let i = 0; i < 6; i++) {
      let directionsCol = this.directions[i].col;
      let directionsRow = this.directions[i].row;

      let neighbor = this.getNeighborByColAndRow(
        currentCol + directionsCol,
        currentRow + directionsRow
      )

      neighbors.push(neighbor);

      // let gridNode = GridNode.create(neighbor);

      // neighbors.push(gridNode);
    }

    // console.log('neighbors', neighbors);

    return neighbors;
  },

  getNeighborByColAndRow(col, row) {
    if (!this.grid) {
    // if (!this.gridIn) {
      return null;
    }
    if (row < 0 || col < 0) {
      return null;
    }
    if (row > this.grid.length) {
    // if (row > this.gridIn.length) {
      return null;
    }
    if (col > this.grid[row].length) {
    // if (col > this.gridIn[row].length) {
      return null;
    }

    return this.grid[row][col];
    // return this.gridIn[row][col];
  },

  cleanNode: function(node) {
    node.path.f = 0;
    node.path.g = 0;
    node.path.h = 0;
    node.path.visited = false;
    node.path.closed = false;
    node.path.parent = null;
  },
});
