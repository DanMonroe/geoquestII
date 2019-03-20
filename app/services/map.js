import Service from '@ember/service';
import { A as emberArray } from '@ember/array';
import {inject as service} from '@ember/service';

export default Service.extend({

  hexService: service('hex'),
  path: service(),

  twoDimensionalMap: null,
  hexMap: null,

  findPath(startHex, targetHex) {
    // console.log('findPath', this.hexMap, startHex, targetHex);

    this.path.initFindPathMap();

    let openList = emberArray([]);
    let closedList = emberArray([]);
    let startNode = this.path.convertHexToNode(startHex);
    let endNode = this.path.convertHexToNode(targetHex);

    openList.push(startNode);

    while (openList.length > 0) {
      // console.log('in while');

    // Grab the lowest f(x) to process next
    let lowInd = 0;
    for(let i=0; i < openList.length; i++) {
      if(openList[i].f < openList[lowInd].f) { lowInd = i; }
    }
    let currentNode = openList[lowInd];

    // End case -- result has been found, return the traced path
    if(currentNode.id === endNode.id) {
      return this.path.to(currentNode);
    }

    // Normal case -- move currentNode from open to closed, process each of its neighbors
    // openList.removeGraphNode(currentNode);

    openList = this.path.removeGraphNode(openList, currentNode);

    closedList.push(currentNode);

    let neighbors = this.hexService.neighbors(currentNode);

    let neighborsLength = neighbors.length;
    for(let i=0; i < neighborsLength; i++) {
      let neighbor = neighbors[i];

      if(neighbor) {
        if (this.path.findGraphNode(closedList, neighbor) || this.path.isBlocked(neighbor)) {
          // not a valid node to process, skip to next neighbor
          console.log('not valid node, skipping');
          break;
          // continue;
        }

        // g score is the shortest distance from start to current node, we need to check if
        //   the path we have arrived at this neighbor is the shortest one we have seen yet
        let gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
        let gScoreIsBest = false;

        if (!this.path.findGraphNode(openList, neighbor)) {
          // if(!openList.findGraphNode(neighbor)) {
          // This the the first time we have arrived at this node, it must be the best
          // Also, we need to take the h (heuristic) score since we haven't done so yet

          gScoreIsBest = true;

          // neighbor.h = this.path.heuristics.manhattan(neighbor, endNode);
          neighbor.h = this.path.heuristics.hex(neighbor, endNode);
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          // We have already seen the node, but last time it had a worse g (distance from start)
          gScoreIsBest = true;
        }

        if (gScoreIsBest) {
          // Found an optimal (so far) path to this node.   Store info on how we got here and
          //  just how good it really is...
          neighbor.parent = currentNode;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
        }
      }
    }

    } // while
    // No result was found -- empty array signifies failure to find path
    return [];
  }
});
