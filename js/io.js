// Prints the algebraic notation on the square
function PrintSq(sq) {
  return FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]];
}

// Given a number which represents move, prints the move in algabraic notation
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

// Print all the moves for a current ply
function PrintMoveList() {
  let index, move;
  console.log("Movelist:");

  for (
    index = GameBoard.moveListStart[GameBoard.ply];
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    index++
  ) {
    move = GameBoard.moveList[index];
    console.log(PrintMove(move));
  }
}

// Given from and to, returns if a valid move is present
function ParseMove(from, to) {
  GenerateMoves();

  let move = NO_MOVE;
  let promotedPiece = PIECES.EMPTY;
  let found = BOOL.FALSE;

  for (
    index = GameBoard.moveListStart[GameBoard.ply];
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    index++
  ) {
    move = GameBoard.moveList[index];
    if (FROM_SQ(move) == from && TO_SQ(move) == to) {
      promotedPiece = PROMOTED(move);
      if (promotedPiece != PIECES.EMPTY) {
        if (
          (promotedPiece == PIECES.wQueen && GameBoard.side == COLORS.WHITE) ||
          (promotedPiece == PIECES.bQueen && GameBoard.side == COLORS.BLACK)
        ) {
          found = BOOL.TRUE;
          break;
        }
        continue;
      }
      found = BOOL.TRUE;
      break;
    }
  }

  if (found == BOOL.TRUE) {
    if (MakeMove(move) == BOOL.FALSE) {
      return NO_MOVE;
    }
    TakeMove();
    return move;
  }

  return NO_MOVE;
}
