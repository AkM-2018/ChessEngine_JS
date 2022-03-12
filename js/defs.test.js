import * as defs from "./defs.js";

test("Chess BOARD SQUARES COUNT is correct", () => {
  expect(defs.BRD_SQ_NUM).toBe(120);
});

test("PIECES is initialized correctly", () => {
  const actual_pieces = {
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
  expect(defs.PIECES).toStrictEqual(actual_pieces);
});

test("FILES are covered", () => {
  const actual_files = {
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
  expect(defs.FILES).toStrictEqual(actual_files);
});

test("RANKS are covered", () => {
  const actual_ranks = {
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
  expect(defs.RANKS).toStrictEqual(actual_ranks);
});

test("COLORS are covered", () => {
  const actual_colors = {
    WHITE: 0,
    BLACK: 1,
    BOTH: 2,
  };
  expect(defs.COLORS).toStrictEqual(actual_colors);
});

test("CASTLING-BITS are properly initialized", () => {
  const actual_castlebit = {
    wKingSideCastle: 1,
    wQueenSideCastle: 2,
    bKingSideCastle: 4,
    bQueenSideCastle: 8,
  };
  expect(defs.CASTLEBIT).toStrictEqual(actual_castlebit);
});

test("Values at SQUARES is correct", () => {
  const actual_squares = {
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
  expect(defs.SQUARES).toStrictEqual(actual_squares);
});

test("BOOL object is correct", () => {
  const actual_bool_obj = {
    FALSE: 0,
    TRUE: 1,
  };
  expect(defs.BOOL).toStrictEqual(actual_bool_obj);
});

test("Max values of GAME MOVES, POSITION MOVES and DEPTH", () => {
  expect(defs.MAX_GAME_MOVES).toBe(2048);
  expect(defs.MAX_POSITION_MOVES).toBe(256);
  expect(defs.MAX_DEPTH).toBe(64);
});

test("FilesBrd and RanksBrd arrays have expected length", () => {
  expect(defs.FilesBrd.length).toBe(120);
  expect(defs.RanksBrd.length).toBe(120);
});

test("Character strings are initialized properly", () => {
  expect(defs.PieceChar).toMatch(".PNBRQKpnbrqk");
  expect(defs.SideChar).toMatch("wb-");
  expect(defs.RankChar).toMatch("12345678");
  expect(defs.FileChar).toMatch("abcdefgh");
});

test("Converts (file, rank) to square properly", () => {
  const file_a = 0;
  const rank_1 = 0;
  expect(defs.FileRank2Sq(file_a, rank_1)).toBe(21);
  expect(defs.FileRank2Sq(file_a + 7, rank_1 + 7)).toBe(98);
  expect(defs.FileRank2Sq(file_a + 3, rank_1 + 2)).toBe(44);
});

test("FLAGS are correctly initialized", () => {
  expect(defs.MOVE_FLAG_CAPTURED).toBe(0x7c000);
  expect(defs.MOVE_FLAG_CASTLING).toBe(0x1000000);
  expect(defs.MOVE_FLAG_EN_PASSANT).toBe(0x40000);
  expect(defs.MOVE_FLAG_PAWN_START).toBe(0x80000);
  expect(defs.MOVE_FLAG_PROMOTED).toBe(0xf00000);
  expect(defs.NO_MOVE).toBe(0);
});

test("DIRECTIONS for pieces are corretly initialized", () => {
  expect(defs.KingDir).toEqual([-1, -10, 1, 10, -9, -11, 11, 9]);
  expect(defs.BishopDir).toEqual([-9, -11, 9, 11]);
  expect(defs.RookDir).toEqual([-1, -10, 1, 10]);
  expect(defs.KnightDir).toEqual([-8, -19, -21, -12, 8, 19, 21, 12]);
});

/** Not sure how to implement.
 *  Should be called after FilesBrd is initialized

test("OFF BOARD SQUARES are recognized properly", () => {
  const actual_filesbrd = [
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 0, 1, 2, 3, 4, 5, 6, 7, 100, 100, 0, 1, 2, 3,
    4, 5, 6, 7, 100, 100, 0, 1, 2, 3, 4, 5, 6, 7, 100, 100, 0, 1, 2, 3, 4, 5, 6,
    7, 100, 100, 0, 1, 2, 3, 4, 5, 6, 7, 100, 100, 0, 1, 2, 3, 4, 5, 6, 7, 100,
    100, 0, 1, 2, 3, 4, 5, 6, 7, 100, 100, 0, 1, 2, 3, 4, 5, 6, 7, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100,
  ];
  expect(defs.SQ_OFF_BOARD(10)).toBe(1);
  expect(defs.SQ_OFF_BOARD(20)).toBe(1);
  expect(defs.SQ_OFF_BOARD(21)).toBe(0);
  expect(defs.SQ_OFF_BOARD(42)).toBe(0);
  expect(defs.SQ_OFF_BOARD(98)).toBe(0);
  expect(defs.SQ_OFF_BOARD(99)).toBe(1);
});

 */
