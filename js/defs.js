const BRD_SQ_NUM = 120;

const PIECES = {
  EMPTY: 0,
  wPawn: 1,
  wKnight: 2,
  wBishop: 3,
  wRook: 4,
  wQueen: 5,
  wKing: 6,
  bPawn: 7,
  bKnight: 8,
  bBishop: 9,
  bRook: 10,
  bQueen: 11,
  bKing: 12,
};

const FILES = {
  FILE_A: 0,
  FILE_B: 1,
  FILE_C: 2,
  FILE_D: 3,
  FILE_E: 4,
  FILE_F: 5,
  FILE_G: 6,
  FILE_H: 7,
  FILE_NONE: 8,
};

const RANKS = {
  RANK_1: 0,
  RANK_2: 1,
  RANK_3: 2,
  RANK_4: 3,
  RANK_5: 4,
  RANK_6: 5,
  RANK_7: 6,
  RANK_8: 7,
  RANK_NONE: 8,
};

const COLORS = {
  WHITE: 0,
  BLACK: 1,
  BOTH: 2,
};

const CASTLEBIT = {
  wKingSideCastle: 1,
  wQueenSideCastle: 2,
  bKingSideCastle: 4,
  bQueenSideCastle: 8,
};

const SQUARES = {
  A1: 21,
  B1: 22,
  C1: 23,
  D1: 24,
  E1: 25,
  F1: 26,
  G1: 27,
  H1: 28,
  A8: 91,
  B8: 92,
  C8: 93,
  D8: 94,
  E8: 95,
  F8: 96,
  G8: 97,
  H8: 98,
  NO_SQ: 99,
  OFF_BOARD: 100,
};

const BOOL = {
  FALSE: 0,
  TRUE: 1,
};

const MAX_GAME_MOVES = 2048;
const MAX_POSITION_MOVES = 256;
const MAX_DEPTH = 64;

const FilesBrd = new Array(BRD_SQ_NUM);
const RanksBrd = new Array(BRD_SQ_NUM);

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PieceChar = ".PNBRQKpnbrqk";
const SideChar = "wb-";
const RankChar = "12345678";
const FileChar = "abcdefgh";

function FileRank2Sq(file, rank) {
  return 21 + file + rank * 10;
}

// Pawn
var PieceBig = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
];

// Queen or Rook
const PieceMaj = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
];

// Bishop or Knight
const PieceMin = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
];

const PieceVal = [
  0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000,
];

const PieceCol = [
  COLORS.BOTH,
  COLORS.WHITE,
  COLORS.WHITE,
  COLORS.WHITE,
  COLORS.WHITE,
  COLORS.WHITE,
  COLORS.WHITE,
  COLORS.BLACK,
  COLORS.BLACK,
  COLORS.BLACK,
  COLORS.BLACK,
  COLORS.BLACK,
  COLORS.BLACK,
];

const PiecePawn = [
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
];

const PieceKnight = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
];

const PieceKing = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
];

const PieceRookQueen = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
];

const PieceBishopQueen = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.FALSE,
];

const PieceSlides = [
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.FALSE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.TRUE,
  BOOL.FALSE,
];

const KnightDir = [-8, -19, -21, -12, 8, 9, 21, 12];
const RookDir = [-1, -10, 1, 10];
const BishopDir = [-9, -11, 9, 11];
const KingDir = [-1, -10, 1, 10, -9, -11, 11, 9];

const DirNum = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];

const PieceDir = [
  0,
  0,
  KnightDir,
  BishopDir,
  RookDir,
  KingDir,
  KingDir,
  0,
  KnightDir,
  BishopDir,
  RookDir,
  KingDir,
  KingDir,
];

const LoopNonSlidePiece = [
  PIECES.wKnight,
  PIECES.wKing,
  0,
  PIECES.bKnight,
  PIECES.bKing,
  0,
];
const LoopNonSlideIndex = [0, 3];

const LoopSlidePiece = [
  PIECES.wBishop,
  PIECES.wRook,
  PIECES.wQueen,
  0,
  PIECES.bBishop,
  PIECES.bRook,
  PIECES.bQueen,
  0,
];
const LoopSlideIndex = [0, 4];

const PieceKeys = new Array(14 * 120);
let SideKey;
const CastleKeys = new Array(26);

const Sq120toSq64 = new Array(BRD_SQ_NUM);
const Sq64toSq120 = new Array(64);

function RAND_32() {
  return (
    (Math.floor(Math.random() * 255 + 1) << 23) |
    (Math.floor(Math.random() * 255 + 1) << 16) |
    (Math.floor(Math.random() * 255 + 1) << 8) |
    Math.floor(Math.random() * 255 + 1)
  );
}

function SQ64(sq120) {
  return Sq120toSq64[sq120];
}

function SQ120(sq64) {
  return Sq64toSq120[sq64];
}

function PIECE_INDEX(pce, pceNum) {
  return pce * 10 + pceNum;
}

function FROM_SQ(m) {
  return m & 0x7f;
}

function TO_SQ(m) {
  return (m >> 7) & 0x7f;
}

function CAPTURED(m) {
  return (m >> 14) & 0xf;
}

function PROMOTED(m) {
  return (m >> 20) & 0xf;
}

const MOVE_FLAG_EN_PASSANT = 0x40000;
const MOVE_FLAG_PAWN_START = 0x80000;
const MOVE_FLAG_CASTLING = 0x100000;

const MOVE_FLAG_CAPTURED = 0x7c000;
const MOVE_FLAG_PROMOTED = 0xf00000;

const NO_MOVE = 0;

function SQ_OFF_BOARD(sq) {
  if (FilesBrd[sq] == SQUARES.OFF_BOARD) {
    return BOOL.TRUE;
  }
  return BOOL.FALSE;
}
