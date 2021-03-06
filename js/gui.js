$("#SetFen").click(function () {
  let fenStr = $("#fenIn").val();
  NewGame(fenStr);
});

$("#TakeButton").click(function () {
  if (GameBoard.historyPly > 0) {
    TakeMove();
    GameBoard.ply = 0;
    setInitialBoardPiecesUpd();
    HighlightMove();
  }
});

$("#NewGameButton").click(function () {
  NewGame(START_FEN);
});

function NewGame(fenStr) {
  ParseFen(fenStr);
  PrintBoard();
  setInitialBoardPiecesUpd();
  HighlightMove();
  CheckAndSet();
}

function ClearAllPiecesUpd() {
  $("img").remove();
}

function setInitialBoardPiecesUpd() {
  let sq, sq120, pce;

  ClearAllPiecesUpd();

  for (sq = 0; sq < 64; sq++) {
    sq120 = SQ120(sq);
    pce = GameBoard.pieces[sq120];
    if (pce >= PIECES.wPawn && pce <= PIECES.bKing) {
      AddGUIPieceUpd(sq120, pce);
    }
  }
}

function DeselectSquareUpd(sq) {
  let file = FilesBrd[sq];
  let rank = RanksBrd[sq];
  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  $("." + fileName + "-" + rankName).removeClass("selected-square");
}

function SetSquareSelectedUpd(sq) {
  let file = FilesBrd[sq];
  let rank = RanksBrd[sq];
  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  $("." + fileName + "-" + rankName).addClass("selected-square");
}

function HighlightMove() {
  let index = 0;
  // reset previous highlight
  for (index = 0; index < 64; index++) {
    DeselectSquareUpd(SQ120(index));
  }

  // insert new highlight
  if (GameBoard.historyPly >= 1) {
    previous_move = GameBoard.history[GameBoard.historyPly - 1];
    from_sq = FROM_SQ(previous_move.move);
    to_sq = TO_SQ(previous_move.move);
    SetSquareSelectedUpd(from_sq);
    SetSquareSelectedUpd(to_sq);
  }
}

function GetClickedSquare(rank, file) {
  let sq = FileRank2Sq(parseInt(file[4]) - 1, parseInt(rank[4]) - 1);
  SetSquareSelectedUpd(sq);
  return sq;
}

function UserClick(rank, file) {
  if (UserMove.from == SQUARES.NO_SQ) {
    UserMove.from = GetClickedSquare(rank, file);
  } else {
    UserMove.to = GetClickedSquare(rank, file);
  }
  MakeUserMove();
}

function AddToMoveList() {
  if (GameBoard.historyPly >= 1) {
    console.log("Add To Move List");
    previous_move = GameBoard.history[GameBoard.historyPly - 1].move;
    console.log(PrintMove(previous_move));
  }
}

function MakeUserMove() {
  if (UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
    console.log("Usermove: " + PrintSq(UserMove.from) + PrintSq(UserMove.to));

    let parsed = ParseMove(UserMove.from, UserMove.to);

    if (parsed != NO_MOVE) {
      MakeMove(parsed);
      PrintBoard();
      MoveGUIPieceUpd(parsed);
      AddToMoveList();
      CheckAndSet();
      PreSearch();
    }

    DeselectSquareUpd(UserMove.from);
    DeselectSquareUpd(UserMove.to);
    HighlightMove();

    UserMove.from = SQUARES.NO_SQ;
    UserMove.to = SQUARES.NO_SQ;
  }
}

function RemoveGUIPieceUpd(sq) {
  let file = FilesBrd[sq];
  let rank = RanksBrd[sq];
  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  $("." + fileName + "-" + rankName).empty();
}

function AddGUIPieceUpd(sq, pce) {
  let file = FilesBrd[sq];
  let rank = RanksBrd[sq];

  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  let pieceFileName =
    "images/" + SideChar[PieceCol[pce]] + PieceChar[pce].toUpperCase() + ".png";

  let imageString = "<img src='" + pieceFileName + "' />";

  $("." + fileName + "-" + rankName).append(imageString);
}

function MoveGUIPieceUpd(move) {
  let from = FROM_SQ(move);
  let to = TO_SQ(move);

  if (move & MOVE_FLAG_EN_PASSANT) {
    let epRemove;
    if (GameBoard.side == COLORS.BLACK) {
      epRemove = to - 10;
    } else {
      epRemove = to + 10;
    }
    RemoveGUIPieceUpd(epRemove);
  } else if (CAPTURED(move)) {
    RemoveGUIPieceUpd(to);
  }

  let file = FilesBrd[from];
  let rank = RanksBrd[from];
  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  let imageString = $("." + fileName + "-" + rankName)[0].innerHTML;
  $("." + fileName + "-" + rankName)
    .children()
    .remove();

  file = FilesBrd[to];
  rank = RanksBrd[to];
  rankName = "rank" + (rank + 1);
  fileName = "file" + (file + 1);

  $("." + fileName + "-" + rankName).append(imageString);

  if (move & MOVE_FLAG_CASTLING) {
    switch (to) {
      case SQUARES.G1:
        RemoveGUIPieceUpd(SQUARES.H1);
        AddGUIPieceUpd(SQUARES.F1, PIECES.wRook);
        break;
      case SQUARES.C1:
        RemoveGUIPieceUpd(SQUARES.A1);
        AddGUIPieceUpd(SQUARES.D1, PIECES.wRook);
        break;
      case SQUARES.G8:
        RemoveGUIPieceUpd(SQUARES.H8);
        AddGUIPieceUpd(SQUARES.F8, PIECES.bRook);
        break;
      case SQUARES.C8:
        s;
        RemoveGUIPieceUpd(SQUARES.A8);
        AddGUIPieceUpd(SQUARES.D8, PIECES.bRook);
        break;
    }
  } else if (PROMOTED(move)) {
    RemoveGUIPieceUpd(to);
    AddGUIPieceUpd(to, PROMOTED(move));
  }
}

function DrawMaterial() {
  if (
    GameBoard.pieceNum[PIECES.wPawn] != 0 ||
    GameBoard.pieceNum[PIECES.bPawn] != 0
  )
    return BOOL.FALSE;

  if (
    GameBoard.pieceNum[PIECES.wQueen] != 0 ||
    GameBoard.pieceNum[PIECES.bQueen] != 0 ||
    GameBoard.pieceNum[PIECES.wRook] != 0 ||
    GameBoard.pieceNum[PIECES.bRook] != 0
  )
    return BOOL.FALSE;

  if (
    GameBoard.pieceNum[PIECES.wBishop] > 1 ||
    GameBoard.pieceNum[PIECES.bBishop] > 1
  )
    return BOOL.FALSE;

  if (
    GameBoard.pieceNum[PIECES.wKnight] > 1 ||
    GameBoard.pieceNum[PIECES.bKnight] > 1
  )
    return BOOL.FALSE;

  if (
    GameBoard.pieceNum[PIECES.wKnight] != 0 &&
    GameBoard.pieceNum[PIECES.wBishop] != 0
  )
    return BOOL.FALSE;

  if (
    GameBoard.pieceNum[PIECES.bKnight] != 0 &&
    GameBoard.pieceNum[PIECES.bBishop] != 0
  )
    return BOOL.FALSE;

  return BOOL.TRUE;
}

function ThreeFoldRepetition() {
  let index = 0;
  let r = 0;

  for (index = 0; index < GameBoard.historyPly; index++) {
    if (GameBoard.history[index].posKey == GameBoard.posKey) {
      r++;
    }
  }

  return r;
}

// Checks if the game is over in any possible way
function CheckResult() {
  if (GameBoard.fiftyMoveCnt >= 100) {
    $("#GameStatus").text("Game Drawn - Fifty move rule");
    return BOOL.TRUE;
  }

  if (ThreeFoldRepetition() >= 2) {
    $("#GameStatus").text("Game Drawn - 3-fold repetition");
    return BOOL.TRUE;
  }

  if (DrawMaterial() == BOOL.TRUE) {
    $("#GameStatus").text("Game Drawn -Insufficient material");
    return BOOL.TRUE;
  }

  GenerateMoves();

  let moveNum = 0;
  let found = 0;

  for (
    moveNum = GameBoard.moveListStart[GameBoard.ply];
    moveNum < GameBoard.moveListStart[GameBoard.ply + 1];
    moveNum++
  ) {
    if (MakeMove(GameBoard.moveList[moveNum]) == BOOL.FALSE) {
      continue;
    }
    found++;
    TakeMove();
    break;
  }

  if (found != 0) return BOOL.FALSE;

  let inCheck = SqAttacked(
    GameBoard.pieceList[PIECE_INDEX(Kings[GameBoard.side], 0)],
    GameBoard.side ^ 1
  );

  if (inCheck == BOOL.TRUE) {
    if (GameBoard.side == COLORS.WHITE) {
      $("#GameStatus").text("CheckMate - Black wins");
      return BOOL.TRUE;
    } else {
      $("#GameStatus").text("CheckMate - White wins");
      return BOOL.TRUE;
    }
  } else {
    $("#GameStatus").text("Stalemate");
    return BOOL.TRUE;
  }
}

// Sets gamestatus according to CheckResult()
function CheckAndSet() {
  if (CheckResult() == BOOL.TRUE) {
    GameController.gameOver = BOOL.TRUE;
  } else {
    GameController.gameOver = BOOL.FALSE;
    $("#GameStatus").text("");
  }
}

function PreSearch() {
  if (GameController.gameOver == BOOL.FALSE) {
    SearchController.isThinking = BOOL.TRUE;
    setTimeout(function () {
      StartSearch();
    }, 200);
  }
}

$("#SearchButton").click(function () {
  GameController.playerSide = GameBoard.side ^ 1;
  PreSearch();
});

function StartSearch() {
  SearchController.depth = MAX_DEPTH;
  let t = $.now();
  let thinkingTime = $("#think-time-choice").val();

  SearchController.time = parseInt(thinkingTime) * 1000;
  SearchController.start = t;
  SearchPosition();

  MakeMove(SearchController.best);
  MoveGUIPieceUpd(SearchController.best);
  HighlightMove();
  CheckAndSet();
}
