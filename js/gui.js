$("#SetFen").click(function () {
  let fenStr = $("#fenIn").val();
  NewGame(fenStr);
});

$("#TakeButton").click(function () {
  if (GameBoard.historyPly > 0) {
    TakeMove();
    GameBoard.ply = 0;
    setInitialBoardPieces();
  }
});

$("#NewGameButton").click(function () {
  NewGame(START_FEN);
});

function NewGame(fenStr) {
  ParseFen(fenStr);
  PrintBoard();
  setInitialBoardPieces();
  CheckAndSet();
}

function ClearAllPieces() {
  $(".Piece").remove();
}

function setInitialBoardPieces() {
  let sq, sq120, pce;

  ClearAllPieces();

  for (sq = 0; sq < 64; sq++) {
    sq120 = SQ120(sq);
    pce = GameBoard.pieces[sq120];
    if (pce >= PIECES.wPawn && pce <= PIECES.bKing) {
      AddGUIPiece(sq120, pce);
    }
  }
}

function DeselectSquare(sq) {
  $(".Square").each(function (index) {
    if (
      PieceOnSquare(sq, $(this).position().top, $(this).position().left) ==
      BOOL.TRUE
    ) {
      $(this).removeClass("SqSelected");
    }
  });
}

function SetSquareSelected(sq) {
  $(".Square").each(function (index) {
    if (
      PieceOnSquare(sq, $(this).position().top, $(this).position().left) ==
      BOOL.TRUE
    ) {
      $(this).addClass("SqSelected");
    }
  });
}

function ClickedSquare(pageX, pageY) {
  let positionBoard = $("#Board").position();

  let workedX = Math.floor(positionBoard.left);
  let workedY = Math.floor(positionBoard.top);

  pageX = Math.floor(pageX);
  pageY = Math.floor(pageY);

  let file = Math.floor((pageX - workedX) / 60);
  let rank = 7 - Math.floor((pageY - workedY) / 60);

  let sq = FileRank2Sq(file, rank);
  console.log("Clicked square: " + PrintSq(sq));

  SetSquareSelected(sq);

  return sq;
}

$(document).on("click", ".Piece", function (e) {
  console.log("PieceClicked");
  if (UserMove.from == SQUARES.NO_SQ) {
    UserMove.from = ClickedSquare(e.pageX, e.pageY);
  } else {
    UserMove.to = ClickedSquare(e.pageX, e.pageY);
  }
  MakeUserMove();
});

$(document).on("click", ".Square", function (e) {
  console.log("SquareClicked");
  if (UserMove.from != SQUARES.NO_SQ) {
    UserMove.to = ClickedSquare(e.pageX, e.pageY);
    MakeUserMove();
  }
});

function MakeUserMove() {
  if (UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
    console.log("Usermove: " + PrintSq(UserMove.from) + PrintSq(UserMove.to));

    let parsed = ParseMove(UserMove.from, UserMove.to);

    if (parsed != NO_MOVE) {
      MakeMove(parsed);
      PrintBoard();
      MoveGUIPiece(parsed);
      CheckAndSet();
      PreSearch();
    }

    DeselectSquare(UserMove.from);
    DeselectSquare(UserMove.to);

    UserMove.from = SQUARES.NO_SQ;
    UserMove.to = SQUARES.NO_SQ;
  }
}

function PieceOnSquare(sq, top, left) {
  if (
    RanksBrd[sq] == 7 - Math.round(top / 60) &&
    FilesBrd[sq] == Math.round(left / 60)
  ) {
    return BOOL.TRUE;
  }
  return BOOL.FALSE;
}

function RemoveGUIPiece(sq) {
  $(".Piece").each(function (index) {
    if (
      PieceOnSquare(sq, $(this).position().top, $(this).position().left) ==
      BOOL.TRUE
    ) {
      $(this).remove();
    }
  });
}

function AddGUIPiece(sq, pce) {
  let file = FilesBrd[sq];
  let rank = RanksBrd[sq];

  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  let pieceFileName =
    "images/" + SideChar[PieceCol[pce]] + PieceChar[pce].toUpperCase() + ".png";

  let imageString =
    "<image src='" +
    pieceFileName +
    "' class='Piece " +
    rankName +
    " " +
    fileName +
    "'/>";

  $("#Board").append(imageString);
}

function MoveGUIPiece(move) {
  let from = FROM_SQ(move);
  let to = TO_SQ(move);

  if (move & MOVE_FLAG_EN_PASSANT) {
    let epRemove;
    if (GameBoard.side == COLORS.BLACK) {
      epRemove = to - 10;
    } else {
      epRemove = to + 10;
    }
    RemoveGUIPiece(epRemove);
  } else if (CAPTURED(move)) {
    RemoveGUIPiece(to);
  }

  let file = FilesBrd[to];
  let rank = RanksBrd[to];
  let rankName = "rank" + (rank + 1);
  let fileName = "file" + (file + 1);

  $(".Piece").each(function (index) {
    if (
      PieceOnSquare(from, $(this).position().top, $(this).position().left) ==
      BOOL.TRUE
    ) {
      $(this).removeClass();
      $(this).addClass("Piece " + rankName + " " + fileName);
    }
  });

  if (move & MOVE_FLAG_CASTLING) {
    switch (to) {
      case SQUARES.G1:
        RemoveGUIPiece(SQUARES.H1);
        AddGUIPiece(SQUARES.F1, PIECES.wRook);
        break;
      case SQUARES.C1:
        RemoveGUIPiece(SQUARES.A1);
        AddGUIPiece(SQUARES.D1, PIECES.wRook);
        break;
      case SQUARES.G8:
        RemoveGUIPiece(SQUARES.H8);
        AddGUIPiece(SQUARES.F8, PIECES.bRook);
        break;
      case SQUARES.C8:
        RemoveGUIPiece(SQUARES.A8);
        AddGUIPiece(SQUARES.D8, PIECES.bRook);
        break;
    }
  } else if (PROMOTED(move)) {
    RemoveGUIPiece(to);
    AddGUIPiece(to, PROMOTED(move));
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

function CheckResult() {
  if (GameBoard.fiftyMoveCnt >= 100) {
    $("#GameStatus").text("Game Drawn {fifty move rule}");
    return BOOL.TRUE;
  }

  if (ThreeFoldRepetition() >= 2) {
    $("#GameStatus").text("Game Drawn {3-fold repetition}");
    return BOOL.TRUE;
  }

  if (DrawMaterial() == BOOL.TRUE) {
    $("#GameStatus").text("Game Drawn {insufficient material}");
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
      $("#GameStatus").text("CheckMate {black wins}");
      return BOOL.TRUE;
    } else {
      $("#GameStatus").text("CheckMate {white wins}");
      return BOOL.TRUE;
    }
  } else {
    $("#GameStatus").text("Stalemate");
    return BOOL.TRUE;
  }
}

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
  let thinkingTime = $("#ThinkTimeChoice").val();

  SearchController.time = parseInt(thinkingTime) * 1000;
  SearchController.start = t;
  SearchPosition();

  MakeMove(SearchController.best);
  MoveGUIPiece(SearchController.best);
  CheckAndSet();
}
