function ClearPiece(sq) {
  let pce = GameBoard.pieces[sq];
  let col = PieceCol[pce];
  let index;
  let t_pceNum = -1;

  HASH_PIECE(pce, sq);

  GameBoard.pieces[sq] = PIECES.EMPTY;
  GameBoard.material[col] -= PieceVal[pce];

  for (index = 0; index < GameBoard.pieceNum[pce]; index++) {
    if (GameBoard.pieceList[PIECE_INDEX(pce, index)] == sq) {
      t_pceNum = index;
      break;
    }
  }

  GameBoard.pieceNum[pce]--;
  GameBoard.pieceList[PIECE_INDEX(pce, t_pceNum)] =
    GameBoard.pieceList[PIECE_INDEX(pce, GameBoard.pieceNum[pce])];
}

function AddPiece(sq, pce) {
  let col = PieceCol[pce];

  HASH_PIECE(pce, sq);

  GameBoard.pieces[sq] = pce;
  GameBoard.material[col] += PieceVal[pce];
  GameBoard.pieceList[PIECE_INDEX(pce, GameBoard.pieceNum[pce])] = sq;
  GameBoard.pieceNum[pce]++;
}

function MovePiece(from, to) {
  let index = 0;
  let pce = GameBoard.pieces[from];

  HASH_PIECE(pce, from);
  GameBoard.pieces[from] = PIECES.EMPTY;

  HASH_PIECE(pce, to);
  GameBoard.pieces[to] = pce;

  for (index = 0; index < GameBoard.pieceNum[index]; index++) {
    if (GameBoard.pieceList[PIECE_INDEX(pce, index)] == from) {
      GameBoard.pieceList[PIECE_INDEX(pce, index)] = to;
      break;
    }
  }
}
