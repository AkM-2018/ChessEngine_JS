function PIECE_INDEX(pce, pceNum) {
  return pce * 10 + pceNum;
}

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

function GeneratePosKey() {
  let sq = 0;
  let finalKey = 0;
  let piece = PIECES.EMPTY;

  for (sq = 0; sq < BRD_SQ_NUM; sq++) {
    piece = GameBoard.PIECES[sq];
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

function ResetBoard() {
  let index = 0;

  for (index = 0; index < BRD_SQ_NUM; index++) {
    GameBoard.pieces[index] = SQUARES.OFF_BOARD;
  }

  for (index = 0; index < 64; index++) {
    GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
  }

  for (index = 0; index < 14 * 120; index++) {
    GameBoard.pList[index] = PIECES.EMPTY;
  }

  for (index = 0; index < 2; index++) {
    GameBoard.material[index] = 0;
  }

  for (index = 0; index < 13; index++) {
    GameBoard.pieceNum[index] = 0;
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
}
