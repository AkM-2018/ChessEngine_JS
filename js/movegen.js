// Most valuable victim - Least valuable attacker
const MvvLvaValue = [
  0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600,
];
const MvvLvaScores = new Array(14 * 14);

function InitMvvLva() {
  let Attacker, Victim;

  for (Attacker = PIECES.wPawn; Attacker <= PIECES.bKing; Attacker++) {
    for (Victim = PIECES.wPawn; Victim <= PIECES.bKing; Victim++) {
      MvvLvaScores[Victim * 14 + Attacker] =
        MvvLvaValue[Victim] + 6 - MvvLvaValue[Attacker] / 100;
    }
  }
}

// Check if a move is a possible move to play
function MoveExists(move) {
  GenerateMoves();

  let index = 0;
  let moveFound = NO_MOVE;

  for (
    index = GameBoard.moveListStart[GameBoard.ply];
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    index++
  ) {
    moveFound = GameBoard.moveList[index];
    if (MakeMove(moveFound) == BOOL.FALSE) {
      continue;
    }
    TakeMove();
    if (move == moveFound) {
      return BOOL.TRUE;
    }
  }
  return BOOL.FALSE;
}

// Returns number which represents infomation about the move
// Flag represents en-passant move, pawn-start move and castle info
function MOVE(from, to, captured, promoted, flag) {
  return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
}

// Add capture move to moveList and initializes moveScores
function AddCaptureMove(move) {
  GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
  GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] =
    MvvLvaScores[CAPTURED(move) * 14 + GameBoard.pieces[FROM_SQ(move)]] +
    1000000;
}

// Add quiet move to moveList and initializes moveScores
function AddQuietMove(move) {
  GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
  GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 0;

  if (move == GameBoard.searchKillers[GameBoard.ply]) {
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 900000;
  } else if (move == GameBoard.searchKillers[MAX_DEPTH + GameBoard.ply]) {
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 800000;
  } else {
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] =
      GameBoard.searchHistory[
        GameBoard.pieces[FROM_SQ(move)] * BRD_SQ_NUM + TO_SQ(move)
      ];
  }

  GameBoard.moveListStart[GameBoard.ply + 1]++;
}

// Add en-passant move to moveList and initializes moveScores
function AddEnPassantMove(move) {
  GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
  GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] =
    105 + 1000000;
}

// Capture moves for white pawn
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

// Capture moves for black pawn
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

// Quiet moves for white pawn
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

// Quiet moves for black pawn
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

// Generates moves and updates them in moveList and moveScores
function GenerateMoves() {
  // moveListStart gives the index for the first move at a given ply
  GameBoard.moveListStart[GameBoard.ply + 1] =
    GameBoard.moveListStart[GameBoard.ply];

  let pceType, pceNum, sq, pceIndex, pce, t_sq, dir;

  // Treats pawn moves, en-passant and castling moves seperately
  if (GameBoard.side == COLORS.WHITE) {
    pceType = PIECES.wPawn;

    // Pawn one-step and 2-step moves
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

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq + 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 9]] == COLORS.BLACK
      ) {
        AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
      }

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq + 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 11]] == COLORS.BLACK
      ) {
        AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
      }

      // En-passant move
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
    }

    // Castling king side
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

    // Castling queen side
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

    // Pawn 1-step and 2-step moves
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

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq - 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE
      ) {
        AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
      }

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq - 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 11]] == COLORS.WHITE
      ) {
        AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
      }

      // En-passant move
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

    // Castle king side
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

    // Castle queen side
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

  pceIndex = LoopNonSlideIndex[GameBoard.side];
  pce = LoopNonSlidePiece[pceIndex++];

  // For non-sliding pieces
  while (pce != 0) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];

      // Loop through all the directions for the piece
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

  // For sliding pieces
  while (pce != 0) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];

      // Loop through all the directions for the piece
      for (index = 0; index < DirNum[pce]; index++) {
        dir = PieceDir[pce][index];
        t_sq = sq + dir;

        // Keep sliding till it hits another pirce or off-board
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

// Generates capturing moves and updates them in moveList and moveScores
function GenerateCaptures() {
  // moveListStart gives the index for the first move at a given ply
  GameBoard.moveListStart[GameBoard.ply + 1] =
    GameBoard.moveListStart[GameBoard.ply];

  let pceType, pceNum, sq, pceIndex, pce, t_sq, dir;

  // Treats pawn moves, en-passant and castling moves seperately
  if (GameBoard.side == COLORS.WHITE) {
    pceType = PIECES.wPawn;

    for (pceNum = 0; pceNum < GameBoard.pieceNum[pceType]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pceType, pceNum)];

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq + 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 9]] == COLORS.BLACK
      ) {
        AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
      }

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq + 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq + 11]] == COLORS.BLACK
      ) {
        AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
      }

      // En-passant move
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
    }
  } else {
    pceType = PIECES.bPawn;

    // Pawn 1-step and 2-step moves
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pceType]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pceType, pceNum)];

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq - 9) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 9]] == COLORS.WHITE
      ) {
        AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
      }

      // Pawn capture move
      if (
        SQ_OFF_BOARD(sq - 11) == BOOL.FALSE &&
        PieceCol[GameBoard.pieces[sq - 11]] == COLORS.WHITE
      ) {
        AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
      }

      // En-passant move
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
  }

  pceIndex = LoopNonSlideIndex[GameBoard.side];
  pce = LoopNonSlidePiece[pceIndex++];

  // For non-sliding pieces
  while (pce != 0) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];

      // Loop through all the directions for the piece
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
        }
      }
    }
    pce = LoopNonSlidePiece[pceIndex++];
  }

  pceIndex = LoopSlideIndex[GameBoard.side];
  pce = LoopSlidePiece[pceIndex++];

  // For sliding pieces
  while (pce != 0) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; pceNum++) {
      sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];

      // Loop through all the directions for the piece
      for (index = 0; index < DirNum[pce]; index++) {
        dir = PieceDir[pce][index];
        t_sq = sq + dir;

        // Keep sliding till it hits another pirce or off-board
        while (SQ_OFF_BOARD(t_sq) == BOOL.FALSE) {
          if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
            if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
              AddCaptureMove(
                MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0)
              );
            }
            break;
          }
          t_sq += dir;
        }
      }
    }
    pce = LoopSlidePiece[pceIndex++];
  }
}
