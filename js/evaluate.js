const PawnTable = [
  0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 0, -10, -10, 0, 10, 10, 5, 0, 0, 5, 5, 0, 0,
  5, 0, 0, 10, 20, 20, 10, 0, 0, 5, 5, 5, 10, 10, 5, 5, 5, 10, 10, 10, 20, 20,
  10, 10, 10, 20, 20, 20, 30, 30, 20, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KnightTable = [
  0, -10, 0, 0, 0, 0, -10, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 10, 10, 10, 10, 0,
  0, 0, 0, 10, 20, 20, 10, 5, 0, 5, 10, 15, 20, 20, 15, 10, 5, 5, 10, 10, 20,
  20, 10, 10, 5, 0, 0, 5, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const BishopTable = [
  0, 0, -10, 0, 0, -10, 0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0, 0, 10, 15, 15, 10, 0,
  0, 0, 10, 15, 20, 20, 15, 10, 0, 0, 10, 15, 20, 20, 15, 10, 0, 0, 0, 10, 15,
  15, 10, 0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const RookTable = [
  0, 0, 5, 10, 10, 5, 0, 0, 0, 0, 5, 10, 10, 5, 0, 0, 0, 0, 5, 10, 10, 5, 0, 0,
  0, 0, 5, 10, 10, 5, 0, 0, 0, 0, 5, 10, 10, 5, 0, 0, 0, 0, 5, 10, 10, 5, 0, 0,
  25, 25, 25, 25, 25, 25, 25, 25, 0, 0, 5, 10, 10, 5, 0, 0,
];

const BishopPair = 40;

// Evaluates the static score of a chessboard state
// Uses PieceTables to do so
function EvalPosition() {
  let score =
    GameBoard.material[COLORS.WHITE] - GameBoard.material[COLORS.BLACK];
  let pce;
  let sq;
  let pceNum;

  pce = PIECES.wPawn;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score += PawnTable[SQ64(sq)];
  }

  pce = PIECES.bPawn;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score -= PawnTable[MIRROR64(SQ64(sq))];
  }

  pce = PIECES.wKnight;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score += KnightTable[SQ64(sq)];
  }

  pce = PIECES.bKnight;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score -= KnightTable[MIRROR64(SQ64(sq))];
  }

  pce = PIECES.wBishop;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score += BishopTable[SQ64(sq)];
  }

  pce = PIECES.bBishop;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score -= BishopTable[MIRROR64(SQ64(sq))];
  }

  pce = PIECES.wRook;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score += RookTable[SQ64(sq)];
  }

  pce = PIECES.bRook;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score -= RookTable[MIRROR64(SQ64(sq))];
  }

  pce = PIECES.wQueen;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score += RookTable[SQ64(sq)];
  }

  pce = PIECES.bQueen;
  for (pceNum = 0; pceNum < GameBoard.pieceNum[pce]; ++pceNum) {
    sq = GameBoard.pieceList[PIECE_INDEX(pce, pceNum)];
    score -= RookTable[MIRROR64(SQ64(sq))];
  }

  if (GameBoard.pieceNum[PIECES.wBishop] >= 2) {
    score += BishopPair;
  }

  if (GameBoard.pieceNum[PIECES.bBishop] >= 2) {
    score -= BishopPair;
  }

  if (GameBoard.side == COLORS.WHITE) {
    return score;
  }
  return -score;
}
