import Service from '@ember/service';
import { A as emberArray } from '@ember/array';
import {inject as service} from '@ember/service';
import BinaryHeap from '../objects/binary-heap';
import Graph from '../objects/graph';
import { GAME_CONFIG } from '../components/hexes'

export default Service.extend({

  hexService: service('hex'),
  path: service(),

  twoDimensionalMap: null,
  hexMap: null,

  // directions: [
  //   {col:1, row:0},
  //   {col:1, row:-1},
  //   {col:0, row:-1},
  //   {col:-1, row:0},
  //   {col:-1, row:1},
  //   {col:0, row:1}
  // ],

  createHeap() {
    return BinaryHeap.create({
      content: [],
      scoreFunction: (node) => {
        return node.path.f;
        // return node.f;
      }
    });
  },
  // https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
  // https://briangrinstead.com/blog/astar-search-algorithm-in-javascript-updated/
  findPath(gridIn, startHex, targetHex, options = {}) {
// console.log('findPath', gridIn, startHex, targetHex);

    var heuristic = this.path.heuristics.hex;
    // var heuristic = options.heuristic || this.path.heuristics.hex;
    var closest = options.closest || false;

    let openHeap = this.createHeap();

    let graph = Graph.create({
      gridIn: gridIn
    });
    graph.setup();
    let startNode = this.findNodeFromHex(graph.gridIn, startHex);
    let endNode = this.findNodeFromHex(graph.gridIn, targetHex);
    // let startNode = this.convertHexToNode(graph.gridIn, startHex);
    // let endNode = this.convertHexToNode(graph.gridIn, targetHex);

    var closestNode = startNode; // set the start node to be the closest if required

    // this.path.initFindPathMap();

    startNode.path.h = heuristic(startNode, endNode);
    graph.markDirty(startNode);

    openHeap.push(startNode);

    while (openHeap.size() > 0) {
      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode.id === endNode.id) {
        return this.path.to(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.path.closed = true;

      // Find all neighbors for the current node.
      var neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        var neighbor = neighbors[i];

        if(neighbor) {
          // TODO cant get theWall to work
          if (neighbor.path.closed || neighbor.path.w !== 0) {
            // if (neighbor.closed || neighbor.isWall) {
            // if (neighbor.closed || neighbor.isWall()) {
            // Not a valid node to process, skip to next neighbor.
            continue;
          }
          // The g score is the shortest distance from start to current node.
          // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
          var gScore = currentNode.path.g + neighbor.path.w;
          // var gScore = currentNode.g + neighbor.getCost(currentNode);
          var beenVisited = neighbor.path.visited;

          if (!beenVisited || gScore < neighbor.path.g) {

            // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
            neighbor.path.visited = true;
            neighbor.path.parent = currentNode;
            neighbor.path.h = neighbor.path.h || heuristic(neighbor, endNode);
            neighbor.path.g = gScore;
            neighbor.path.f = neighbor.path.g + neighbor.path.h;
            graph.markDirty(neighbor);
            if (closest) {
              // If the neighbour is closer than the current closestNode or if it's equally close but has
              // a cheaper path than the current closest node then it becomes the closest node
              if (neighbor.path.h < closestNode.path.h || (neighbor.path.h === closestNode.path.h && neighbor.path.g < closestNode.path.g)) {
                closestNode = neighbor;
              }
            }

            if (!beenVisited) {
              // Pushing to heap will put it in proper place based on the 'f' value.
              openHeap.push(neighbor);
            } else {
              // Already seen the node, but since it has been rescored we need to reorder it in the heap
              openHeap.rescoreElement(neighbor);
            }
          } // if
        } // if neighbor
      }  // for

    } // while

    if (closest) {
      return this.path.to(closestNode);
    }

    // No result was found - empty array signifies failure to find path.
    return [];




    // let openList = emberArray([]);
    // let closedList = emberArray([]);
    // // let startNode = this.path.convertHexToNode(startHex);
    // // let endNode = this.path.convertHexToNode(targetHex);
    //
    // openList.push(startNode);
    //
    // while (openList.length > 0) {
    //   // console.log('in while');
    //
    // // Grab the lowest f(x) to process next
    // let lowInd = 0;
    // for(let i=0; i < openList.length; i++) {
    //   if(openList[i].f < openList[lowInd].f) { lowInd = i; }
    // }
    // let currentNode = openList[lowInd];
    //
    // // End case -- result has been found, return the traced path
    // if(currentNode.id === endNode.id) {
    //   return this.path.to(currentNode);
    // }
    //
    // // Normal case -- move currentNode from open to closed, process each of its neighbors
    // // openList.removeGraphNode(currentNode);
    //
    // openList = this.path.removeGraphNode(openList, currentNode);
    //
    // closedList.push(currentNode);
    //
    // let neighbors = this.hexService.neighbors(currentNode);
    //
    // let neighborsLength = neighbors.length;
    // for(let i=0; i < neighborsLength; i++) {
    //   let neighbor = neighbors[i];
    //
    //   if(neighbor) {
    //     if (this.path.findGraphNode(closedList, neighbor) || this.path.isBlocked(neighbor)) {
    //       // not a valid node to process, skip to next neighbor
    //       console.log('not valid node, skipping');
    //       continue;
    //     }
    //
    //     // g score is the shortest distance from start to current node, we need to check if
    //     //   the path we have arrived at this neighbor is the shortest one we have seen yet
    //     let gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
    //     let gScoreIsBest = false;
    //
    //     if (!this.path.findGraphNode(openList, neighbor)) {
    //       // if(!openList.findGraphNode(neighbor)) {
    //       // This the the first time we have arrived at this node, it must be the best
    //       // Also, we need to take the h (heuristic) score since we haven't done so yet
    //
    //       gScoreIsBest = true;
    //
    //       // neighbor.h = this.path.heuristics.manhattan(neighbor, endNode);
    //       neighbor.h = this.path.heuristics.hex(neighbor, endNode);
    //       openList.push(neighbor);
    //     } else if (gScore < neighbor.g) {
    //       // We have already seen the node, but last time it had a worse g (distance from start)
    //       gScoreIsBest = true;
    //     }
    //
    //     if (gScoreIsBest) {
    //       // Found an optimal (so far) path to this node.   Store info on how we got here and
    //       //  just how good it really is...
    //       neighbor.parent = currentNode;
    //       neighbor.g = gScore;
    //       neighbor.f = neighbor.g + neighbor.h;
    //       neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
    //     }
    //   }
    // }
    //
    // } // while
    // // No result was found -- empty array signifies failure to find path
    // return [];
  },

  // cleanNode: function(node) {
  //   node.f = 0;
  //   node.g = 0;
  //   node.h = 0;
  //   node.visited = false;
  //   node.closed = false;
  //   node.parent = null;
  // },

  // converts a Hex obj to the object at the corresponding
  // two dimensinal array object
  convertHexToNode(grid, hex) {
    let foundNode = null;
    // let grid = this.mapService.twoDimensionalMap;
    for(var x = 0; x < grid.length; x++) {
      for (var y = 0; y < grid[x].length; y++) {
        let gridObj = grid[x][y];
        if (gridObj && gridObj.id === hex.id) {
          foundNode = gridObj;
          break;
        }
      }
      if (foundNode) { break; }
    }
    // console.log('foundNode', foundNode);
    return foundNode;
  },

  // finds a node from the given hex in the
  // two dimensinal array object
  findNodeFromHex(grid, hex) {
    let foundNode = null;

    for(var x = 0; x < grid.length; x++) {
      for (var y = 0; y < grid[x].length; y++) {
        let gridObj = grid[x][y];
        if (gridObj && gridObj.id === hex.id) {
          foundNode = gridObj;
          break;
        }
      }
      if (foundNode) { break; }
    }
  // console.log('foundNode', foundNode);
    return foundNode;
  },

  findHexByQRS(Q, R, S) {
    let hex = this.hexMap.find((hex) => {
      return (Q === hex.q) && (R === hex.r) && (S === hex.s);
    });
    return hex;
  }

});
