function MOVE(from, to, captured, promoted, flag) {
  return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
}

function GenerateMoves() {
  GameBoard.moveListStart[GameBoard.ply + 1] =
    GameBoard.moveListStart[GameBoard.ply];

  let pceType, pceNum, sq, pceIndex, pce, t_sq;

  if (GameBoard.side == COLORS.WHITE) {
    pceType = PIECES.wPawn;

    for (pceNum = 0; pceNum < GameBoard.pieceNum[pceType]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pceType, pceNum)];
      if (GameBoard.pieces[sq + 10] == PIECES.EMPTY) {
        // Add pawn move here
        if (
          RanksBrd[sq] == RANKS.RANK_2 &&
          GameBoard.pieces[sq + 20] == PIECES.EMPTY
        ) {
          // Add quiet move here
        }
      }

      if (
        SQ_OFF_BOARD(sq + 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 9]] == COLORS.BLACK
      ) {
        // Add pawn capture move here
      }

      if (
        SQ_OFF_BOARD(sq + 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 9]] == COLORS.BLACK
      ) {
        // Add pawn capture move here
      }

      if (GameBoard.enPassant != SQUARES.NO_SQ) {
        if (sq + 9 == GameBoard.enPassant) {
          // add enpassant move
        }
        if (sq + 11 == GameBoard.enPassant) {
        }
      }
    }

    if (GameBoard.castlePermission & CASTLEBIT.wKingSideCastle) {
      if (
        GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY &&
        GameBoard.pieces[SQUARES.G1] == PIECES.EMPTY
      ) {
        if (
          SqAttacked(SQUARES.F1, COLORS.BLACK) == BOOL.FALSE &&
          SqAttacked(SQUARES.E1, COLORS.BLACK) == BOOL.FALSE
        ) {
          // Add quiet move
        }
      }
    }

    if (GameBoard.castlePermission & CASTLEBIT.wQueenSideCastle) {
      if (
        GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY &&
        GameBoard.pieces[SQUARES.C1] == PIECES.EMPTY &&
        GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY
      ) {
        if (
          SqAttacked(SQUARES.D1, COLORS.BLACK) == BOOL.FALSE &&
          SqAttacked(SQUARES.E1, COLORS.BLACK) == BOOL.FALSE
        ) {
          // Add quiet move
        }
      }
    }
  } else {
    pceType = PIECES.bPawn;

    for (pceNum = 0; pceNum < GameBoard.pceNum[pceType]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pceType, pceNum)];
      if (GameBoard.pieces[sq - 10] == PIECES.EMPTY) {
        // Add pawn move here
        if (
          RanksBrd[sq] == RANKS.RANK_7 &&
          GameBoard.pieces[sq - 20] == PIECES.EMPTY
        ) {
          // Add quiet move here
        }
      }

      if (
        SQ_OFF_BOARD(sq - 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE
      ) {
        // Add pawn capture move here
      }

      if (
        SQ_OFF_BOARD(sq - 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE
      ) {
        // Add pawn capture move here
      }

      if (GameBoard.enPassant != SQUARES.NO_SQ) {
        if (sq - 9 == GameBoard.enPassant) {
          // add enpassant move
        }
        if (sq - 11 == GameBoard.enPassant) {
          // add enpassant move
        }
      }
    }

    if (GameBoard.castlePermission & CASTLEBIT.bKingSideCastle) {
      if (
        GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY &&
        GameBoard.pieces[SQUARES.G8] == PIECES.EMPTY
      ) {
        if (
          SqAttacked(SQUARES.F8, COLORS.WHITE) == BOOL.FALSE &&
          SqAttacked(SQUARES.E8, COLORS.WHITE) == BOOL.FALSE
        ) {
          // Add quiet move
        }
      }
    }

    if (GameBoard.castlePermission & CASTLEBIT.bQueenSideCastle) {
      if (
        GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY &&
        GameBoard.pieces[SQUARES.C8] == PIECES.EMPTY &&
        GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY
      ) {
        if (
          SqAttacked(SQUARES.D8, COLORS.WHITE) == BOOL.FALSE &&
          SqAttacked(SQUARES.E8, COLORS.WHITE) == BOOL.FALSE
        ) {
          // Add quiet move
        }
      }
    }
  }
}
