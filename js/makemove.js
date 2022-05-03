// Remove a piece from the board
function ClearPiece(sq) {
  let pce = GameBoard.pieces[sq];
  let col = PieceCol[pce];
  let index;
  let t_pceNum = -1;

  HASH_PIECE(pce, sq);

  GameBoard.pieces[sq] = PIECES.EMPTY;
  GameBoard.material[col] -= PieceVal[pce];

  for (index = 0; index < GameBoard.pieceNum[pce]; ++index) {
    if (GameBoard.pieceList[PIECE_INDEX(pce, index)] == sq) {
      t_pceNum = index;
      break;
    }
  }

  GameBoard.pieceNum[pce]--;
  GameBoard.pieceList[PIECE_INDEX(pce, t_pceNum)] =
    GameBoard.pieceList[PIECE_INDEX(pce, GameBoard.pieceNum[pce])];
}

// Add a piece to the board
function AddPiece(sq, pce) {
  let col = PieceCol[pce];

  HASH_PIECE(pce, sq);

  GameBoard.pieces[sq] = pce;
  GameBoard.material[col] += PieceVal[pce];
  GameBoard.pieceList[PIECE_INDEX(pce, GameBoard.pieceNum[pce])] = sq;
  GameBoard.pieceNum[pce]++;
}

// Moves a piece on the board
function MovePiece(from, to) {
  let index = 0;
  let pce = GameBoard.pieces[from];

  HASH_PIECE(pce, from);
  GameBoard.pieces[from] = PIECES.EMPTY;

  HASH_PIECE(pce, to);
  GameBoard.pieces[to] = pce;

  for (index = 0; index < GameBoard.pieceNum[pce]; ++index) {
    if (GameBoard.pieceList[PIECE_INDEX(pce, index)] == from) {
      GameBoard.pieceList[PIECE_INDEX(pce, index)] = to;
      break;
    }
  }
}

// Making a move
function MakeMove(move) {
  let from = FROM_SQ(move);
  let to = TO_SQ(move);
  let side = GameBoard.side;

  // Add position key to history
  GameBoard.history[GameBoard.historyPly].posKey = GameBoard.posKey;

  // Capture pawn during en-passant
  if ((move & MOVE_FLAG_EN_PASSANT) != 0) {
    if (side == COLORS.WHITE) {
      ClearPiece(to - 10);
    } else {
      ClearPiece(to + 10);
    }
  }
  // Move the rook during castling
  else if ((move & MOVE_FLAG_CASTLING) != 0) {
    switch (to) {
      case SQUARES.C1:
        MovePiece(SQUARES.A1, SQUARES.D1);
        break;
      case SQUARES.C8:
        MovePiece(SQUARES.A8, SQUARES.D8);
        break;
      case SQUARES.G1:
        MovePiece(SQUARES.H1, SQUARES.F1);
        break;
      case SQUARES.G8:
        MovePiece(SQUARES.H8, SQUARES.F8);
        break;
      default:
        break;
    }
  }

  // Hash-out the en-passant and castle permission of the previous move
  if (GameBoard.enPassant != SQUARES.NO_SQ) HASH_ENPASSANT();
  HASH_CASTLING();

  // Update other values in history array
  GameBoard.history[GameBoard.historyPly].move = move;
  GameBoard.history[GameBoard.historyPly].fiftyMove = GameBoard.fiftyMove;
  GameBoard.history[GameBoard.historyPly].enPassant = GameBoard.enPassant;
  GameBoard.history[GameBoard.historyPly].castlePermission =
    GameBoard.castlePermission;

  // Update the castle permission and en-passant
  GameBoard.castlePermission &= CastlePerm[from];
  GameBoard.castlePermission &= CastlePerm[to];
  GameBoard.enPassant = SQUARES.NO_SQ;

  // Hash-in the new castle permission
  HASH_CASTLING();

  // Get the captured piece
  let captured = CAPTURED(move);
  GameBoard.fiftyMove++;

  if (captured != PIECES.EMPTY) {
    ClearPiece(to);
    GameBoard.fiftyMove = 0;
  }

  GameBoard.historyPly++;
  GameBoard.ply++;

  // Pawn start move
  if (PiecePawn[GameBoard.pieces[from]] == BOOL.TRUE) {
    GameBoard.fiftyMove = 0;
    if ((move & MOVE_FLAG_PAWN_START) != 0) {
      if (side == COLORS.WHITE) {
        GameBoard.enPassant = from + 10;
      } else {
        GameBoard.enPassant = from - 10;
      }
      HASH_ENPASSANT();
    }
  }

  MovePiece(from, to);

  // Pawn promotions
  let promotedPiece = PROMOTED(move);
  if (promotedPiece != PIECES.EMPTY) {
    ClearPiece(to);
    AddPiece(to, promotedPiece);
  }

  // Change the side to play
  GameBoard.side ^= 1;
  HASH_SIDE();

  // If king is in check, take back the current move
  if (
    SqAttacked(GameBoard.pieceList[PIECE_INDEX(Kings[side], 0)], GameBoard.side)
  ) {
    TakeMove();
    return BOOL.FALSE;
  }

  return BOOL.TRUE;
}

// Taking back a made move
function TakeMove() {
  GameBoard.historyPly--;
  GameBoard.ply--;

  // Get the previous move from history array
  let move = GameBoard.history[GameBoard.historyPly].move;
  let from = FROM_SQ(move);
  let to = TO_SQ(move);

  if (GameBoard.enPassant != SQUARES.NO_SQ) HASH_ENPASSANT();
  HASH_CASTLING();

  // Update values according to the previous move
  GameBoard.castlePermission =
    GameBoard.history[GameBoard.historyPly].castlePermission;
  GameBoard.fiftyMove = GameBoard.history[GameBoard.historyPly].fiftyMove;
  GameBoard.enPassant = GameBoard.history[GameBoard.historyPly].enPassant;

  if (GameBoard.enPassant != SQUARES.NO_SQ) HASH_ENPASSANT();
  HASH_CASTLING();

  // Change the side to play
  GameBoard.side ^= 1;
  HASH_SIDE();

  // Take back an en-passant move
  if ((MOVE_FLAG_EN_PASSANT & move) != 0) {
    if (GameBoard.side == COLORS.WHITE) {
      AddPiece(to - 10, PIECES.bPawn);
    } else {
      AddPiece(to + 10, PIECES.wPawn);
    }
  }
  // Take back a castling move
  else if ((MOVE_FLAG_CASTLING & move) != 0) {
    switch (to) {
      case SQUARES.C1:
        MovePiece(SQUARES.D1, SQUARES.A1);
        break;
      case SQUARES.C8:
        MovePiece(SQUARES.D8, SQUARES.A8);
        break;
      case SQUARES.G1:
        MovePiece(SQUARES.F1, SQUARES.H1);
        break;
      case SQUARES.G8:
        MovePiece(SQUARES.F8, SQUARES.H8);
        break;
      default:
        break;
    }
  }

  // Move the piece back
  MovePiece(to, from);

  // Add back the captured piece
  let captured = CAPTURED(move);
  if (captured != PIECES.EMPTY) {
    AddPiece(to, captured);
  }

  // Take back a pawn promotion
  if (PROMOTED(move) != PIECES.EMPTY) {
    ClearPiece(from);
    AddPiece(
      from,
      PieceCol[PROMOTED(move)] == COLORS.WHITE ? PIECES.wPawn : PIECES.bPawn
    );
  }
}
