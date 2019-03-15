import Service from '@ember/service';
import { A as emberArray } from '@ember/array';
import EmberObject, { computed } from '@ember/object';

const rawboard = [
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'}
  ],
  [
    {t:'w'},{t:'l'},{t:'w'},{t:'w'},{t:'w'},{t:'w', cmd:1},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'}
  ],
  [
    {t:'w'},{t:'w'},{t:'w'},{t:'w'},{t:'l'},{t:'l'},{t:'l'}
  ]
];
const board_width = 7;
const board_height = 7;

export default Service.extend({

  board: null,

  buildBoard() {
    let rows = emberArray();
    for(let row = 0; row < board_height; row++){

      let grids = emberArray();

      for(let col = 0; col < board_width; col++){
        // console.log('row', row, 'col', col, rawboard[row][col]);
        grids.pushObject(EmberObject.create(rawboard[row][col]));
      }
      let newRow = EmberObject.create({
        grids: grids
      });

      rows.pushObject(newRow);
    }
    let board = EmberObject.create({
      rows: rows
    });

    // console.log('board', board);

    this.set('board', board)
  }
});
