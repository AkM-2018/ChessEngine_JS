$(function () {
  init();
  console.log("Main init called");
  ParseFen(START_FEN);
  PrintBoard();
  GenerateMoves();
  PrintMoveList();
});

function InitFilesRanksBrd() {
  let index = 0;
  let file = FILES.FILE_A;
  let rank = RANKS.RANK_1;
  let sq = SQUARES.A1;

  for (index = 0; index < BRD_SQ_NUM; index++) {
    FilesBrd[index] = SQUARES.OFF_BOARD;
    RanksBrd[index] = SQUARES.OFF_BOARD;
  }

  for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FileRank2Sq(file, rank);
      FilesBrd[sq] = file;
      RanksBrd[sq] = rank;
    }
  }
}

function InitHashKeys() {
  let index = 0;

  for (index = 0; index < 14 * 120; index++) {
    PieceKeys[index] = RAND_32();
  }

  SideKey = RAND_32();

  for (index = 0; index < 16; index++) {
    CastleKeys[index] = RAND_32();
  }
}

function InitSq120ToSq64() {
  let index = 0;
  let file = FILES.FILE_A;
  let rank = RANKS.RANK_1;
  let sq = SQUARES.A1;
  let sq64 = 0;

  for (index = 0; index < BRD_SQ_NUM; index++) {
    Sq120toSq64[index] = 65;
  }

  for (index = 0; index < 64; index++) {
    Sq64toSq120[index] = 120;
  }

  for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FileRank2Sq(file, rank);
      Sq64toSq120[sq64] = sq;
      Sq120toSq64[sq] = sq64;
      sq64++;
    }
  }
}

function init() {
  console.log("init() called");
  InitFilesRanksBrd();
  InitHashKeys();
  InitSq120ToSq64();
}
