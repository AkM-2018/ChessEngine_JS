function PrintSq(sq) {
  return FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]];
}

function PrintMove(move) {
  let moveStr;

  const file_from = FilesBrd[FROM_SQ(move)];
  const rank_from = RanksBrd[FROM_SQ(move)];
  const file_to = FilesBrd[TO_SQ(move)];
  const rank_to = RanksBrd[TO_SQ(move)];

  moveStr =
    FileChar[file_from] +
    RankChar[rank_from] +
    FileChar[file_to] +
    RankChar[rank_to];

  const promoted = PROMOTED(move);

  if (promoted != PIECES.EMPTY) {
    let pChar = "q";
    if (PieceKnight[promoted] == BOOL.TRUE) {
      pChar = "n";
    } else if (
      PieceRookQueen[promoted] == BOOL.TRUE &&
      PieceBishopQueen[promoted] == BOOL.FALSE
    ) {
      pChar = "r";
    } else if (
      PieceRookQueen[promoted] == BOOL.FALSE &&
      PieceBishopQueen[promoted] == BOOL.TRUE
    ) {
      pChar = "b";
    }

    moveStr += pChar;
  }

  return moveStr;
}

function PrintMoveList() {
  let index, move;
  console.log("Movelist:");

  for (
    index = GameBoard.moveListStart[GameBoard.ply];
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    index++
  ) {
    move = GameBoard.moveList[index];
  }
}
