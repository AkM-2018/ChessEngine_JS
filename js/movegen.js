function MOVE(from, to, captured, promoted, flag) {
  return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
}

function AddCaptureMove(move) {
  GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
  GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function AddQuietMove(move) {
  GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
  GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function AddEnPassantMove(move) {
  GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
  GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function AddWhitePawnCaptureMove(from, to, cap) {
  if (RanksBrd[from] == RANKS.RANK_7) {
    AddCaptureMove(MOVE(from, to, cap, PIECES.wQueen, 0));
    AddCaptureMove(MOVE(from, to, cap, PIECES.wRook, 0));
    AddCaptureMove(MOVE(from, to, cap, PIECES.wBishop, 0));
    AddCaptureMove(MOVE(from, to, cap, PIECES.wKnight, 0));
  } else {
    AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
  }
}

function AddBlackPawnCaptureMove(from, to, cap) {
  if (RanksBrd[from] == RANKS.RANK_2) {
    AddCaptureMove(MOVE(from, to, cap, PIECES.bQueen, 0));
    AddCaptureMove(MOVE(from, to, cap, PIECES.bRook, 0));
    AddCaptureMove(MOVE(from, to, cap, PIECES.bBishop, 0));
    AddCaptureMove(MOVE(from, to, cap, PIECES.bKnight, 0));
  } else {
    AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
  }
}

function AddWhitePawnQuietMove(from, to) {
  if (RanksBrd[from] == RANKS.RANK_7) {
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQueen, 0));
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wRook, 0));
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wBishop, 0));
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wKnight, 0));
  } else {
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
  }
}

function AddBlackPawnQuietMove(from, to) {
  if (RanksBrd[from] == RANKS.RANK_2) {
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQueen, 0));
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bRook, 0));
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bBishop, 0));
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bKnight, 0));
  } else {
    AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
  }
}

function GenerateMoves() {
  GameBoard.moveListStart[GameBoard.ply + 1] =
    GameBoard.moveListStart[GameBoard.ply];

  let pceType, pceNum, sq, pceIndex, pce, t_sq, dir;

  if (GameBoard.side == COLORS.WHITE) {
    pceType = PIECES.wPawn;

    for (pceNum = 0; pceNum < GameBoard.pieceNum[pceType]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pceType, pceNum)];
      if (GameBoard.pieces[sq + 10] == PIECES.EMPTY) {
        AddWhitePawnQuietMove(sq, sq + 10);
        if (
          RanksBrd[sq] == RANKS.RANK_2 &&
          GameBoard.pieces[sq + 20] == PIECES.EMPTY
        ) {
          AddQuietMove(
            MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_PAWN_START)
          );
        }
      }

      console.log(GameBoard.moveList);
      console.log(GameBoard.moveListStart);

      if (
        SQ_OFF_BOARD(sq + 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 9]] == COLORS.BLACK
      ) {
        AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
      }

      if (
        SQ_OFF_BOARD(sq + 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 11]] == COLORS.BLACK
      ) {
        AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
      }

      console.log(GameBoard.moveList);
      console.log(GameBoard.moveListStart);

      if (GameBoard.enPassant != SQUARES.NO_SQ) {
        if (sq + 9 == GameBoard.enPassant) {
          AddEnPassantMove(
            MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT)
          );
        }
        if (sq + 11 == GameBoard.enPassant) {
          AddEnPassantMove(
            MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT)
          );
        }
      }

      console.log(GameBoard.moveList);
      console.log(GameBoard.moveListStart);
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
          AddQuietMove(
            MOVE(
              SQUARES.E1,
              SQUARES.G1,
              PIECES.EMPTY,
              PIECES.EMPTY,
              MOVE_FLAG_CASTLING
            )
          );
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
          AddQuietMove(
            MOVE(
              SQUARES.E1,
              SQUARES.C1,
              PIECES.EMPTY,
              PIECES.EMPTY,
              MOVE_FLAG_CASTLING
            )
          );
        }
      }
    }
  } else {
    pceType = PIECES.bPawn;

    for (pceNum = 0; pceNum < GameBoard.pieceNum[pceType]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pceType, pceNum)];
      if (GameBoard.pieces[sq - 10] == PIECES.EMPTY) {
        AddBlackPawnQuietMove(sq, sq - 10);
        if (
          RanksBrd[sq] == RANKS.RANK_7 &&
          GameBoard.pieces[sq - 20] == PIECES.EMPTY
        ) {
          AddQuietMove(
            MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_PAWN_START)
          );
        }
      }

      if (
        SQ_OFF_BOARD(sq - 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE
      ) {
        AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
      }

      if (
        SQ_OFF_BOARD(sq - 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 11]] == COLORS.WHITE
      ) {
        AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
      }

      if (GameBoard.enPassant != SQUARES.NO_SQ) {
        if (sq - 9 == GameBoard.enPassant) {
          AddEnPassantMove(
            MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT)
          );
        }
        if (sq - 11 == GameBoard.enPassant) {
          AddEnPassantMove(
            MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT)
          );
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
          AddQuietMove(
            MOVE(
              SQUARES.E8,
              SQUARES.G8,
              PIECES.EMPTY,
              PIECES.EMPTY,
              MOVE_FLAG_CASTLING
            )
          );
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
          AddQuietMove(
            MOVE(
              SQUARES.E8,
              SQUARES.C8,
              PIECES.EMPTY,
              PIECES.EMPTY,
              MOVE_FLAG_CASTLING
            )
          );
        }
      }
    }
  }

  console.log(GameBoard.moveList);
  console.log(GameBoard.moveListStart);

  pceIndex = LoopNonSlideIndex[GameBoard.side];
  pce = LoopNonSlidePiece[pceIndex++];

  while (pce != 0) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];

      for (index = 0; index < DirNum[pce]; index++) {
        dir = PieceDir[pce][index];
        t_sq = sq + dir;

        if (SQ_OFF_BOARD(t_sq) == BOOL.TRUE) {
          continue;
        }

        if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
          if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
            AddCaptureMove(
              MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0)
            );
          }
        } else {
          AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
        }
      }
    }
    pce = LoopNonSlidePiece[pceIndex++];
  }

  pceIndex = LoopSlideIndex[GameBoard.side];
  pce = LoopSlidePiece[pceIndex++];

  while (pce != 0) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];

      for (index = 0; index < DirNum[pce]; index++) {
        dir = PieceDir[pce][index];
        t_sq = sq + dir;

        while (SQ_OFF_BOARD(t_sq) == BOOL.FALSE) {
          if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
            if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
              AddCaptureMove(
                MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0)
              );
            }
            break;
          }
          AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
          t_sq += dir;
        }
      }
    }
    pce = LoopSlidePiece[pceIndex++];
  }
}
