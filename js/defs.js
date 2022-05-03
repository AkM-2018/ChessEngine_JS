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

// Maximum possible moves to be played in a chess game
const MAX_GAME_MOVES = 2048;
// Maximum moves for a position
const MAX_POSITION_MOVES = 256;
// Max depth the engine searches to
const MAX_DEPTH = 64;
const INFINITE = 30000;
const MATE = 29000;
const PV_ENTRIES = 10000;

// Stores which file it is in 120 square board
const FilesBrd = new Array(BRD_SQ_NUM);
// Stores which rank it is in 120 square board
const RanksBrd = new Array(BRD_SQ_NUM);

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const PieceChar = ".PNBRQKpnbrqk";
const SideChar = "wb-";
const RankChar = "12345678";
const FileChar = "abcdefgh";

// Given a file and rank, returns the sq no in 120 board
function FileRank2Sq(file, rank) {
  return 21 + file + rank * 10;
}

// Not Pawn
const PieceBig = [
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

// Queen or Rook or King
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

// Value of a piece, for the algorithm
const PieceVal = [
  0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000,
];

// Color of a piece
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

const KnightDir = [-8, -19, -21, -12, 8, 19, 21, 12];
const RookDir = [-1, -10, 1, 10];
const BishopDir = [-9, -11, 11, 9];
const KingDir = [-1, -10, 1, 10, -9, -11, 11, 9];

// How many directions can piece move
const DirNum = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];

// Directions for a piece
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

// key of a piece on a particular square
// index 0-9 will be used for en-passant square
const PieceKeys = new Array(14 * 120);
let SideKey;
const CastleKeys = new Array(16);

// Arrays converts index from 120 board to 64 board and vice-versa
const Sq120toSq64 = new Array(BRD_SQ_NUM);
const Sq64toSq120 = new Array(64);

// Random 32-bit number
function RAND_32() {
  // Four random numbers filling 8-bits each and shifting them appropriately
  // Good coverage of all the 32-bits
  return (
    (Math.floor(Math.random() * 255 + 1) << 23) |
    (Math.floor(Math.random() * 255 + 1) << 16) |
    (Math.floor(Math.random() * 255 + 1) << 8) |
    Math.floor(Math.random() * 255 + 1)
  );
}

// Mirror values in the PieceTables used for evaluation of position
const Mirror64 = [
  56, 57, 58, 59, 60, 61, 62, 63, 48, 49, 50, 51, 52, 53, 54, 55, 40, 41, 42,
  43, 44, 45, 46, 47, 32, 33, 34, 35, 36, 37, 38, 39, 24, 25, 26, 27, 28, 29,
  30, 31, 16, 17, 18, 19, 20, 21, 22, 23, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2,
  3, 4, 5, 6, 7,
];

// Returns the 64-board equivalent of 120-board index
function SQ64(sq120) {
  return Sq120toSq64[sq120];
}

// Returns the 120-board equivalent of 64-board index
function SQ120(sq64) {
  return Sq64toSq120[sq64];
}

// Gives the index of the piece in the pieceList array
function PIECE_INDEX(pce, pceNum) {
  return pce * 10 + pceNum;
}

// Returns the mirror value of a square
function MIRROR64(sq) {
  return Mirror64[sq];
}

const Kings = [PIECES.wKing, PIECES.bKing];

// For updating the GameBoard.castlePerm on every move
const CastlePerm = [
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 13, 15, 15, 15, 12, 15, 15, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 7, 15, 15, 15, 3,
  15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
  15, 15, 15, 15, 15,
];

// Single number stores all the information a move
// From the right, first 7 bits store the from-square
function FROM_SQ(m) {
  return m & 0x7f;
}

// Next 7 bits store the to-square
function TO_SQ(m) {
  return (m >> 7) & 0x7f;
}

// Next 4 bits cover the captured piece
function CAPTURED(m) {
  return (m >> 14) & 0xf;
}

// Next 2 bits are for en-passant and pawn-start move
// The next 4 are for which piece we promote to
function PROMOTED(m) {
  return (m >> 20) & 0xf;
}

const MOVE_FLAG_EN_PASSANT = 0x40000;
const MOVE_FLAG_PAWN_START = 0x80000;
const MOVE_FLAG_CASTLING = 0x1000000;

const MOVE_FLAG_CAPTURED = 0x7c000;
const MOVE_FLAG_PROMOTED = 0xf00000;

const NO_MOVE = 0;

// Returns if a square is off-board
function SQ_OFF_BOARD(sq) {
  if (FilesBrd[sq] == SQUARES.OFF_BOARD) {
    return BOOL.TRUE;
  }
  return BOOL.FALSE;
}

// Hash a piece in/out
function HASH_PIECE(pce, sq) {
  GameBoard.posKey ^= PieceKeys[pce * 120 + sq];
}

// Hash the castling permission
function HASH_CASTLING() {
  GameBoard.posKey ^= CastleKeys[GameBoard.castlePermission];
}

// Hash side
function HASH_SIDE() {
  GameBoard.posKey ^= SideKey;
}

// Hash en-passant
function HASH_ENPASSANT() {
  GameBoard.posKey ^= PieceKeys[GameBoard.enPassant];
}

let GameController = {};
GameController.engineSide = COLORS.BOTH;
GameController.playerSide = COLORS.BOTH;
GameController.gameOver = BOOL.FALSE;

let UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;
