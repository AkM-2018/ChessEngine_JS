let GameBoard = {};

// contains the state of the board according to numbering in PIECES
GameBoard.pieces = new Array(BRD_SQ_NUM);
// side playing the move
GameBoard.side = COLORS.WHITE;
// player can claim draw if 50 moves are played without pawn move or capture
// if GameBoard.fiftyMoveCnt == 100, game is draw
GameBoard.fiftyMoveCnt = 0;
// maintain the count of all the half-moves
// used to index an array where we can take back moves
GameBoard.historyPly = 0;
// index contains {move, key, enPas, fiftyMove, castlePerm}
// can be used to move the board back to a previous state
GameBoard.history = [];
// no of half moves made in the search tree
GameBoard.ply = 0;
// stores the value of the en-passant square
GameBoard.enPassant = 0;
// integer which stores the castle permission for the whole gameboard
GameBoard.castlePermission = 0;
// stores total piece value of each side
GameBoard.material = new Array(2);
// no of pieces of certain type on the board
// indexed by the PIECES
GameBoard.pieceNum = new Array(13);
// contains the position(120 based) of pieces on the board
// white pawns start from index 10-19, white knight are on index 20, 29...
// every piece is given 10 index in the array. first 10(0-9) are left blank
// no of times to loop can be obtained from pieceNum of that piece
GameBoard.pieceList = new Array(14 * 10);
// unique number which represents the position on the board
// its for repetition detection. 3 time repetition leads to draw
GameBoard.posKey = 0;
// list of moves
GameBoard.moveList = new Array(MAX_DEPTH * MAX_POSITION_MOVES);
// scores of the moves
GameBoard.moveScores = new Array(MAX_DEPTH * MAX_POSITION_MOVES);
// index where the moves for certain depth starts
GameBoard.moveListStart = new Array(MAX_DEPTH);
// contains poskey and move
// everytime we improve the alpha cutoff, we store this move in PvTable
// since this might be the one of the best moves in the position
GameBoard.PvTable = [];
// best line for a current position
GameBoard.PvArray = new Array(MAX_DEPTH);
GameBoard.searchHistory = new Array(14 * BRD_SQ_NUM);
GameBoard.searchKillers = new Array(3 * MAX_DEPTH);

// Checks if all the methods are properly working
function CheckBoard() {
  let t_pieceNum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let t_material = [0, 0];
  let sq64, t_piece, t_pce_num, sq120, color, pcount;

  // check for every piece if pieceList and GameBoard.pieces match
  for (t_piece = PIECES.wPawn; t_piece <= PIECES.bKing; t_piece++) {
    for (t_pce_num = 0; t_pce_num < GameBoard.pieceNum[t_piece]; t_pce_num++) {
      sq120 = GameBoard.pieceList[PIECE_INDEX(t_piece, t_pce_num)];
      if (GameBoard.pieces[sq120] != t_piece) {
        console.log("Error Piece Lists!");
        return BOOL.FALSE;
      }
    }
  }

  // populate temp pieceNum and temp material array
  for (sq64 = 0; sq64 < 64; sq64++) {
    sq120 = SQ120(sq64);
    t_piece = GameBoard.pieces[sq120];
    t_pieceNum[t_piece]++;
    t_material[PieceCol[t_piece]] += PieceVal[t_piece];
  }

  // check for every piece if the no of pieces match in GameBoard and temp pieceNum
  for (t_piece = PIECES.wPawn; t_piece <= PIECES.bKing; t_piece++) {
    if (t_pieceNum[t_piece] != GameBoard.pieceNum[t_piece]) {
      console.log("Error t_pieceNum!");
      return BOOL.FALSE;
    }
  }

  // check if total piece values match in Gameboard and temp material
  if (
    t_material[COLORS.WHITE] != GameBoard.material[COLORS.WHITE] ||
    t_material[COLORS.BLACK] != GameBoard.material[COLORS.BLACK]
  ) {
    console.log("Error t_material!");
    return BOOL.FALSE;
  }

  // check if Gameboard side is valid
  if (GameBoard.side != COLORS.WHITE && GameBoard.side != COLORS.BLACK) {
    console.log("Error Gameboard.side");
    return BOOL.FALSE;
  }

  // check if Gameboard posKey matches with generated posKey
  if (GeneratePosKey() != GameBoard.posKey) {
    console.log("Error Gameboard.poskey");
    return BOOL.FALSE;
  }

  return BOOL.TRUE;
}

// Prints the board to the console
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

// Returns a finalKey with hashes info of Pieces, Side and CastlePerm
function GeneratePosKey() {
  let sq = 0;
  let finalKey = 0;
  let piece = PIECES.EMPTY;

  // Hash into finalKey the unique number for a given piece on a given square
  // Hash the PieceKeys
  for (sq = 0; sq < BRD_SQ_NUM; sq++) {
    piece = GameBoard.pieces[sq];
    if (piece != PIECES.EMPTY && piece != SQUARES.OFF_BOARD) {
      finalKey ^= PieceKeys[piece * 120 + sq];
    }
  }

  // Hash the SideKey
  if (GameBoard.side == COLORS.WHITE) {
    finalKey ^= SideKey;
  }

  // Hash the EnPassant square
  if (GameBoard.enPassant != SQUARES.NO_SQ) {
    finalKey ^= PieceKeys[GameBoard.enPassant];
  }

  // Hash the CastleKeys
  finalKey ^= CastleKeys[GameBoard.castlePermission];

  return finalKey;
}

// Prints for every piece where it sits
function PrintPieceLists() {
  let piece, pceNum;

  for (piece = PIECES.wPawn; piece <= PIECES.bKing; piece++) {
    for (pceNum = 0; pceNum < GameBoard.pieceNum[piece]; pceNum++) {
      console.log(
        "Piece " +
          PieceChar[piece] +
          " on " +
          PrintSq(GameBoard.pieceList[PIECE_INDEX(piece, pceNum)])
      );
    }
  }
}

// Updates the values of material, pieceList and pieceNum after a move
function UpdateListsMaterial() {
  let piece, sq, index, color;

  // Resets pieceList
  for (index = 0; index < 14 * 10; index++) {
    GameBoard.pieceList[index] = PIECES.EMPTY;
  }

  // Resets total piece values
  for (index = 0; index < 2; index++) {
    GameBoard.material[index] = 0;
  }

  // Resets no of pieces
  for (index = 0; index < 13; index++) {
    GameBoard.pieceNum[index] = 0;
  }

  // Updates total piece values, pieceList and no of pieces
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
}

// Resets the Gameboard
function ResetBoard() {
  let index = 0;

  // Make all squares OFF_BOARD
  for (index = 0; index < BRD_SQ_NUM; index++) {
    GameBoard.pieces[index] = SQUARES.OFF_BOARD;
  }

  // Make internal squares EMPTY
  for (index = 0; index < 64; index++) {
    GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
  }

  // Reset settings
  GameBoard.side = COLORS.BOTH;
  GameBoard.enPassant = SQUARES.NO_SQ;
  GameBoard.fiftyMoveCnt = 0;
  GameBoard.ply = 0;
  GameBoard.historyPly = 0;
  GameBoard.castlePermission = 0;
  GameBoard.posKey = 0;
  GameBoard.moveListStart[GameBoard.ply] = 0;
}

// Given a fen-string changes the GameBoard accordingly
function ParseFen(fen) {
  ResetBoard();

  let rank = RANKS.RANK_8;
  let file = FILES.FILE_A;
  let piece = 0;
  let count = 0;
  let i = 0;
  let sq120 = 0;
  let fenCnt = 0;

  // Traverse the chess-board part of the fen string
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

    // Updates square in Gameboard as empty count no of times
    for (i = 0; i < count; i++) {
      sq120 = FileRank2Sq(file, rank);
      GameBoard.pieces[sq120] = piece;
      file++;
    }

    fenCnt++;
  }

  // Updates color
  GameBoard.side = fen[fenCnt] == "w" ? COLORS.WHITE : COLORS.BLACK;
  fenCnt += 2;

  // Updates castle permissions
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

  // Updates en passant status
  if (fen[fenCnt] != "-") {
    file = fen[fenCnt].charCodeAt() - "a".charCodeAt();
    rank = fen[fenCnt + 1].charCodeAt() - "1".charCodeAt();
    GameBoard.enPassant = FileRank2Sq(file, rank);
  }

  GameBoard.posKey = GeneratePosKey();
  UpdateListsMaterial();
  PrintSqAttacked();
}

// Prints the board on console
// Squares which can be attacked by the playing side are marked with "X"
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

// Check if this square can be attacked by a piece
function SqAttacked(sq, side) {
  let pce, t_sq, index;

  // Can a pawn attack this square?
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

  // Can a knight attack this square?
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

  // Can a rook or queen(not moving diagonally) attack this square?
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

  // Can a bishop or queen(only moving diagonally) attack this square?
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

  // Can the king attack this square?
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
