$(function () {
  init();
  console.log("Main init called");
  NewGame(START_FEN);
});

// Initialize FilesBrd and RanksBrd
function InitFilesRanksBrd() {
  let index = 0;
  let file = FILES.FILE_A;
  let rank = RANKS.RANK_1;
  let sq = SQUARES.A1;

  // Init everything as OFF_BOARD
  for (index = 0; index < BRD_SQ_NUM; index++) {
    FilesBrd[index] = SQUARES.OFF_BOARD;
    RanksBrd[index] = SQUARES.OFF_BOARD;
  }

  // Updates the file and rank at particular square
  for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FileRank2Sq(file, rank);
      FilesBrd[sq] = file;
      RanksBrd[sq] = rank;
    }
  }
}

// Initialize random numbers in PieceKeys, SideKey and CastleKeys
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

// Initialize arrays to convert 120 board to 64 board and vice-versa
function InitSq120ToSq64() {
  let index = 0;
  let file = FILES.FILE_A;
  let rank = RANKS.RANK_1;
  let sq = SQUARES.A1;
  let sq64 = 0;

  // Filling extreme value first
  for (index = 0; index < BRD_SQ_NUM; index++) {
    Sq120toSq64[index] = 65;
  }

  // Filling extreme value first
  for (index = 0; index < 64; index++) {
    Sq64toSq120[index] = 120;
  }

  // Init with actual values
  for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FileRank2Sq(file, rank);
      Sq64toSq120[sq64] = sq;
      Sq120toSq64[sq] = sq64;
      sq64++;
    }
  }
}

// Initializes the history array and PvTable
function InitBoardVariables() {
  let index = 0;

  for (index = 0; index < MAX_GAME_MOVES; index++) {
    GameBoard.history.push({
      move: NO_MOVE,
      castlePermission: 0,
      enPassant: 0,
      fiftyMove: 0,
      posKey: 0,
    });
  }

  for (index = 0; index < PV_ENTRIES; index++) {
    GameBoard.PvTable.push({
      move: NO_MOVE,
      posKey: 0,
    });
  }
}

function InitBoardSquares() {
  let light = 1;
  let rankName, fileName;
  let divString, rankIter, fileIter;
  let lightString;

  for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
    light ^= 1;
    rankName = "rank" + (rankIter + 1);
    for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
      fileName = "file" + (fileIter + 1);
      if (light == 0) lightString = "Light";
      else lightString = "Dark";
      light ^= 1;
      divString =
        '<div class="Square ' +
        rankName +
        " " +
        fileName +
        " " +
        lightString +
        '"/>';
      $("#Board").append(divString);
    }
  }
}

// Calls the other init methods
function init() {
  console.log("init() called");
  InitFilesRanksBrd();
  InitHashKeys();
  InitSq120ToSq64();
  InitBoardVariables();
  InitMvvLva();
  InitBoardSquares();
}
