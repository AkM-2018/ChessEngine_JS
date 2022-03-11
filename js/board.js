let GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM);
GameBoard.side = COLORS.WHITE;
GameBoard.fiftyMoveCnt = 0;
GameBoard.historyPly = 0;
GameBoard.ply = 0;
GameBoard.enPassant = 0;
GameBoard.castlePermission = 0;
GameBoard.material = new Array(2); // WHITE, BLACK material of pieces
GameBoard.pieceNum = new Array(13); // no of pieces of certain type on the board
GameBoard.pieceList = new Array(14 * 10);
GameBoard.posKey = 0; // Its for draw detection. We can check if we repeated some moves
GameBoard.moveList = new Array(MAX_DEPTH * MAX_POSITION_MOVES);
GameBoard.moveScores = new Array(MAX_DEPTH * MAX_POSITION_MOVES);
GameBoard.moveListStart = new Array(MAX_DEPTH);

function PrintBoard() {
  let sq, file, rank, piece;

  console.log("\nGame Board:\n\n");

  for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
    let line = RankChar[rank] + "  ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FileRank2Sq(file, rank);
      piece = GameBoard.pieces[sq];
      line += " " + PieceChar[piece] + " ";
    }
    console.log(line);
  }
  console.log("");

  let line = "   ";
  for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
    line += " " + FileChar[file] + " ";
  }
  console.log(line);
  console.log("");

  console.log("side: " + SideChar[GameBoard.side]);
  console.log("enPas: " + GameBoard.enPassant);

  line = "";
  if (GameBoard.castlePermission & CASTLEBIT.wKingSideCastle) line += "K";
  if (GameBoard.castlePermission & CASTLEBIT.wQueenSideCastle) line += "Q";
  if (GameBoard.castlePermission & CASTLEBIT.bKingSideCastle) line += "k";
  if (GameBoard.castlePermission & CASTLEBIT.bQueenSideCastle) line += "q";
  console.log("castle: " + line);
  console.log("key: " + GameBoard.posKey.toString(16));
}

function GeneratePosKey() {
  let sq = 0;
  let finalKey = 0;
  let piece = PIECES.EMPTY;

  for (sq = 0; sq < BRD_SQ_NUM; sq++) {
    piece = GameBoard.pieces[sq];
    if (piece != PIECES.EMPTY && piece != SQUARES.OFF_BOARD) {
      finalKey ^= PieceKeys[piece * 120 + sq];
    }
  }

  if (GameBoard.side == COLORS.WHITE) {
    finalKey ^= SideKey;
  }

  if (GameBoard.enPassant != SQUARES.NO_SQ) {
    finalKey ^= PieceKeys[GameBoard.enPassant];
  }

  finalKey ^= CastleKeys[GameBoard.castlePermission];

  return finalKey;
}

function PrintPieceLists() {
  let piece, pceNum;

  for (piece = PIECES.wPawn; piece <= PIECES.bKing; piece++) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[piece]; pceNum++) {
      // console.log(
      //   "Piece " +
      //     PieceChar[piece] +
      //     " on " +
      //     PrintSq(GameBoard.pieceList[PIECE_INDEX(piece, pceNum)])
      // );
    }
  }
}

function UpdateListsMaterial() {
  let piece, sq, index, color;

  for (index = 0; index < 14 * 120; index++) {
    GameBoard.pieceList[index] = PIECES.EMPTY;
  }

  for (index = 0; index < 2; index++) {
    GameBoard.material[index] = 0;
  }

  for (index = 0; index < 13; index++) {
    GameBoard.pieceNum[index] = 0;
  }

  for (index = 0; index < 64; index++) {
    sq = SQ120(index);
    piece = GameBoard.pieces[sq];
    if (piece != PIECES.EMPTY) {
      color = PieceCol[piece];
      GameBoard.material[color] += PieceVal[piece];
      GameBoard.pieceList[PIECE_INDEX(piece, GameBoard.pieceNum[piece])] = sq;
      GameBoard.pieceNum[piece]++;
    }
  }

  PrintPieceLists();
}

function ResetBoard() {
  let index = 0;

  for (index = 0; index < BRD_SQ_NUM; index++) {
    GameBoard.pieces[index] = SQUARES.OFF_BOARD;
  }

  for (index = 0; index < 64; index++) {
    GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
  }

  GameBoard.side = COLORS.BOTH;
  GameBoard.enPassant = SQUARES.NO_SQ;
  GameBoard.fiftyMoveCnt = 0;
  GameBoard.ply = 0;
  GameBoard.historyPly = 0;
  GameBoard.castlePermission = 0;
  GameBoard.posKey = 0;
  GameBoard.moveListStart[GameBoard.ply] = 0;
}

function ParseFen(fen) {
  ResetBoard();

  let rank = RANKS.RANK_8;
  let file = FILES.FILE_A;
  let piece = 0;
  let count = 0;
  let i = 0;
  let sq120 = 0;
  let fenCnt = 0;

  while (rank >= RANKS.RANK_1 && fenCnt < fen.length) {
    count = 1;

    switch (fen[fenCnt]) {
      case "p":
        piece = PIECES.bPawn;
        break;
      case "r":
        piece = PIECES.bRook;
        break;
      case "n":
        piece = PIECES.bKnight;
        break;
      case "b":
        piece = PIECES.bBishop;
        break;
      case "k":
        piece = PIECES.bKing;
        break;
      case "q":
        piece = PIECES.bQueen;
        break;
      case "P":
        piece = PIECES.wPawn;
        break;
      case "R":
        piece = PIECES.wRook;
        break;
      case "N":
        piece = PIECES.wKnight;
        break;
      case "B":
        piece = PIECES.wBishop;
        break;
      case "K":
        piece = PIECES.wKing;
        break;
      case "Q":
        piece = PIECES.wQueen;
        break;

      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
        piece = PIECES.EMPTY;
        count = fen[fenCnt].charCodeAt() - "0".charCodeAt();
        break;

      case "/":
      case " ":
        rank--;
        file = FILES.FILE_A;
        fenCnt++;
        continue;

      default:
        console.log("FEN Error");
        return;
    }

    for (i = 0; i < count; i++) {
      sq120 = FileRank2Sq(file, rank);
      GameBoard.pieces[sq120] = piece;
      file++;
    }

    fenCnt++;
  }

  GameBoard.side = fen[fenCnt] == "w" ? COLORS.WHITE : COLORS.BLACK;
  fenCnt += 2;

  for (i = 0; i < 4; i++) {
    if (fen[fenCnt] == " ") break;

    switch (fen[fenCnt]) {
      case "K":
        GameBoard.castlePermission |= CASTLEBIT.wKingSideCastle;
        break;
      case "k":
        GameBoard.castlePermission |= CASTLEBIT.bKingSideCastle;
        break;
      case "Q":
        GameBoard.castlePermission |= CASTLEBIT.wQueenSideCastle;
        break;
      case "q":
        GameBoard.castlePermission |= CASTLEBIT.bQueenSideCastle;
        break;
      default:
        break;
    }

    fenCnt++;
  }
  fenCnt++;

  if (fen[fenCnt] != "-") {
    file = fen[fenCnt].charCodeAt() - "a".charCodeAt();
    rank = fen[fenCnt + 1].charCodeAt() - "1".charCodeAt();
    console.log(
      "fen[fenCnt]: " + fen[fenCnt] + " File: " + file + " Rank: " + rank
    );
    GameBoard.enPassant = FileRank2Sq(file, rank);
  }

  GameBoard.posKey = GeneratePosKey();
  UpdateListsMaterial();
  PrintSqAttacked();
}

function PrintSqAttacked() {
  let sq, file, rank, piece;

  console.log("\nAttacked:\n");

  for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
    let line = rank + 1 + " ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FileRank2Sq(file, rank);
      if (SqAttacked(sq, GameBoard.side) == BOOL.TRUE) piece = "X";
      else piece = "-";
      line += " " + piece + " ";
    }
    console.log(line);
  }
  console.log("");
}

function SqAttacked(sq, side) {
  let pce, t_sq, index;

  if (side == COLORS.WHITE) {
    if (
      GameBoard.pieces[sq - 11] == PIECES.wPawn ||
      GameBoard.pieces[sq - 9] == PIECES.wPawn
    ) {
      return BOOL.TRUE;
    }
  } else {
    if (
      GameBoard.pieces[sq + 11] == PIECES.bPawn ||
      GameBoard.pieces[sq + 9] == PIECES.bPawn
    ) {
      return BOOL.TRUE;
    }
  }

  for (index = 0; index < 8; index++) {
    pce = GameBoard.pieces[sq + KnightDir[index]];
    if (
      pce != SQUARES.OFF_BOARD &&
      PieceCol[pce] == side &&
      PieceKnight[pce] == BOOL.TRUE
    ) {
      return BOOL.TRUE;
    }
  }

  for (index = 0; index < 4; index++) {
    dir = RookDir[index];
    t_sq = sq + dir;
    pce = GameBoard.pieces[t_sq];
    while (pce != SQUARES.OFF_BOARD) {
      if (pce != PIECES.EMPTY) {
        if (PieceRookQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
          return BOOL.TRUE;
        }
        break;
      }
      t_sq += dir;
      pce = GameBoard.pieces[t_sq];
    }
  }

  for (index = 0; index < 4; index++) {
    dir = BishopDir[index];
    t_sq = sq + dir;
    pce = GameBoard.pieces[t_sq];
    while (pce != SQUARES.OFF_BOARD) {
      if (pce != PIECES.EMPTY) {
        if (PieceBishopQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
          return BOOL.TRUE;
        }
        break;
      }
      t_sq += dir;
      pce = GameBoard.pieces[t_sq];
    }
  }

  for (index = 0; index < 8; index++) {
    pce = GameBoard.pieces[sq + KingDir[index]];
    if (
      pce != SQUARES.OFF_BOARD &&
      PieceCol[pce] == side &&
      PieceKing[pce] == BOOL.TRUE
    ) {
      return BOOL.TRUE;
    }
  }

  return BOOL.FALSE;
}
