let SearchController = {};

// no of nodes the search encounters during the search, including non-leaf
SearchController.nodes;
// how often beta-cutoff if obtained
SearchController.failHigh;
// how often beta-cutoff if obtained on the 1st legal move
SearchController.failHighFirst;
// depth till which we search
SearchController.depth;
// time provided for each move
SearchController.time;
// start time
SearchController.start;
// flag to stop searching if time exceeded
SearchController.stop;
// stores the best move
SearchController.best;
// flag if search is going on
SearchController.isThinking;

// Swaps the next best move in moveNum's position
function PickNextMove(moveNum) {
  let index = 0;
  let bestScore = -1;
  let bestNum = moveNum;

  for (
    index = moveNum;
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    index++
  ) {
    if (GameBoard.moveScores[index] > bestScore) {
      bestScore = GameBoard.moveScores[index];
      bestNum = index;
    }
  }

  if (bestNum != moveNum) {
    let temp = 0;

    temp = GameBoard.moveScores[moveNum];
    GameBoard.moveScores[moveNum] = GameBoard.moveScores[bestNum];
    GameBoard.moveScores[bestNum] = temp;

    temp = GameBoard.moveList[moveNum];
    GameBoard.moveList[moveNum] = GameBoard.moveList[bestNum];
    GameBoard.moveList[bestNum] = temp;
  }
}

// Clear all entries in the PvTable
function ClearPvTable() {
  let index = 0;
  for (index = 0; index < PV_ENTRIES; index++) {
    GameBoard.PvTable[index].move = NO_MOVE;
    GameBoard.PvTable[index].posKey = 0;
  }
}

// Switches the stop flag when time is exceeded
function CheckUp() {
  if ($.now() - SearchController.start > SearchController.time) {
    SearchController.stop = BOOL.TRUE;
  }
}

// Returns true of the current state of the board is previously encountered
function IsRepetition() {
  let index = 0;

  // Indexes before a pawn move or capture can be ignored
  for (
    index = GameBoard.historyPly - GameBoard.fiftyMoveCnt;
    index < GameBoard.historyPly - 1;
    index++
  ) {
    if (GameBoard.posKey == GameBoard.history[index].posKey) {
      return BOOL.TRUE;
    }
  }
  return BOOL.FALSE;
}

function Quiescence(alpha, beta) {
  // Call time-out function after every 2048 nodes
  if ((SearchController.nodes & 2047) == 0) {
    CheckUp();
  }

  // The current nodes which is being evaluated
  SearchController.nodes++;

  // Return score for a draw
  // ply is checked so that we can get atleast 1 move out
  if ((IsRepetition() || GameBoard.fiftyMoveCnt >= 100) && GameBoard.ply != 0) {
    return 0;
  }

  // Return static evaluation in max-depth is reached
  if (GameBoard.ply > MAX_DEPTH - 1) {
    return EvalPosition();
  }

  let score = EvalPosition();

  if (score >= beta) {
    return beta;
  }

  if (score > alpha) {
    alpha = score;
  }

  GenerateCaptures();

  let moveNum = 0;
  let legalMoves = 0;
  let oldAlpha = alpha;
  let bestMove = NO_MOVE;
  let move = NO_MOVE;

  // get PVmove - the best move
  // Order PVmove

  for (
    moveNum = GameBoard.moveListStart[GameBoard.ply];
    moveNum < GameBoard.moveListStart[GameBoard.ply + 1];
    ++moveNum
  ) {
    PickNextMove(moveNum);

    move = GameBoard.moveList[moveNum];
    if (MakeMove(move) == BOOL.FALSE) {
      continue;
    }

    legalMoves++;
    score = -Quiescence(-beta, -alpha);
    TakeMove();

    // We haven't searched completely and time-out is faced
    // So we return 0
    if (SearchController.stop == BOOL.TRUE) {
      return 0;
    }

    // Check if we improved alpha
    if (score > alpha) {
      // If beta cutoff is encountered
      if (score >= beta) {
        // For statistics, measuring how often we get beta-cutoff in the 1st move
        if (legalMoves == 1) {
          SearchController.failHighFirst++;
        }
        SearchController.failHigh++;
        return beta;
      }
      alpha = score;
      bestMove = move;
    }
  }

  if (alpha != oldAlpha) {
    StorePvMove(bestMove);
  }

  return alpha;
}

function AlphaBeta(alpha, beta, depth) {
  if (depth <= 0) {
    // Return quiescance evaluation
    return Quiescence(alpha, beta);
  }

  // Call time-out function after every 2048 nodes
  if ((SearchController.nodes & 2047) == 0) {
    CheckUp();
  }

  // The current nodes which is being evaluated
  SearchController.nodes++;

  // Return score for a draw
  // ply is checked so that we can get atleast 1 move out
  if ((IsRepetition() || GameBoard.fiftyMoveCnt >= 100) && GameBoard.ply != 0) {
    return 0;
  }

  // Return static evaluation in max-depth is reached
  if (GameBoard.ply > MAX_DEPTH - 1) {
    return EvalPosition();
  }

  let inCheck = SqAttacked(
    GameBoard.pieceList[PIECE_INDEX(Kings[GameBoard.side], 0)],
    GameBoard.side ^ 1
  );
  if (inCheck == BOOL.TRUE) {
    depth++;
  }

  let score = -INFINITE;

  GenerateMoves();

  let moveNum = 0;
  let legalMoves = 0;
  let oldAlpha = alpha;
  let bestMove = NO_MOVE;
  let move = NO_MOVE;

  // Get PVmove - the best move and give a high score
  let PvMove = ProbePvTable();
  if (PvMove != NO_MOVE) {
    for (
      moveNum = GameBoard.moveListStart[GameBoard.ply];
      moveNum < GameBoard.moveListStart[GameBoard.ply + 1];
      ++moveNum
    ) {
      if (GameBoard.moveList[moveNum] == PvMove) {
        GameBoard.moveScores[moveNum] = 2000000;
        break;
      }
    }
  }

  for (
    moveNum = GameBoard.moveListStart[GameBoard.ply];
    moveNum < GameBoard.moveListStart[GameBoard.ply + 1];
    ++moveNum
  ) {
    PickNextMove(moveNum);

    move = GameBoard.moveList[moveNum];
    if (MakeMove(move) == BOOL.FALSE) {
      continue;
    }

    legalMoves++;
    score = -AlphaBeta(-beta, -alpha, depth - 1);
    TakeMove();

    // We haven't searched completely and time-out is faced
    // So we return 0
    if (SearchController.stop == BOOL.TRUE) {
      return 0;
    }

    // Check if we improved alpha
    if (score > alpha) {
      // If beta cutoff is encountered
      if (score >= beta) {
        // For statistics, measuring how often we get beta-cutoff in the 1st move
        if (legalMoves == 1) {
          SearchController.failHighFirst++;
        }
        SearchController.failHigh++;

        // update killer moves - recent 2 moves that caused beta cutoff
        // will be used inside move ordering
        if ((move & MOVE_FLAG_CAPTURED) == 0) {
          GameBoard.searchKillers[MAX_DEPTH + GameBoard.ply] =
            GameBoard.searchKillers[GameBoard.ply];
          GameBoard.searchKillers[GameBoard.ply] = move;
        }

        return beta;
      }

      // update history table
      if ((move & MOVE_FLAG_CAPTURED) == 0) {
        GameBoard.searchHistory[
          GameBoard.pieces[FROM_SQ(move)] * BRD_SQ_NUM + TO_SQ(move)
        ] += depth * depth;
      }

      alpha = score;
      bestMove = move;
    }
  }

  // If we dont have any legal moves, we are either in checkmate or stalemate
  if (legalMoves == 0) {
    if (inCheck == BOOL.TRUE) {
      return -MATE + GameBoard.ply;
    } else {
      return 0;
    }
  }

  // We found a better move. Store it in PvTable
  if (alpha != oldAlpha) {
    StorePvMove(bestMove);
  }

  return alpha;
}

// Clear out things to start our search
function ClearForSearch() {
  let index = 0;

  // Indexed by pieceType * square
  for (index = 0; index < 14 * BRD_SQ_NUM; index++) {
    GameBoard.searchHistory[index] = 0;
  }

  // 2 moves are stored
  // Move 1 - [0, 63], move 2 - [64, 127]
  // killer moves are moves that improve beta at a given ply
  for (index = 0; index < 3 * MAX_DEPTH; index++) {
    GameBoard.searchKillers[index] = 0;
  }

  ClearPvTable();
  GameBoard.ply = 0;
  SearchController.nodes = 0;
  SearchController.failHigh = 0;
  SearchController.failHighFirst = 0;
  SearchController.start = $.now();
  SearchController.stop = BOOL.FALSE;
}

// Searches the best move via iterative deepening for the current position
function SearchPosition() {
  let bestMove = NO_MOVE;
  let bestScore = -INFINITE;
  let score = -INFINITE;
  let currentDepth = 0;
  let line;
  let pvNum;
  let c;

  ClearForSearch();

  for (
    currentDepth = 1;
    currentDepth <= SearchController.depth;
    currentDepth++
  ) {
    score = AlphaBeta(-INFINITE, INFINITE, currentDepth);

    if (SearchController.stop == BOOL.TRUE) {
      break;
    }

    bestScore = score;
    bestMove = ProbePvTable();

    line =
      "Depth: " +
      currentDepth +
      " BestMove: " +
      PrintMove(bestMove) +
      " Score: " +
      bestScore +
      " Nodes: " +
      SearchController.nodes;

    pvNum = GetPvLine(currentDepth);
    line += " Pv:";

    for (c = 0; c < pvNum; c++) {
      line += " " + PrintMove(GameBoard.PvArray[c]);
    }

    if (currentDepth != 1) {
      line +=
        " Ordering: " +
        (
          (SearchController.failHighFirst / SearchController.failHigh) *
          100
        ).toFixed(2) +
        "%";
    }

    console.log(line);
  }

  SearchController.best = bestMove;
  SearchController.isThinking = BOOL.FALSE;
  UpdateDomStats(bestScore, currentDepth);
}

function UpdateDomStats(dom_score, dom_depth) {
  let scoreText = "Score: " + (dom_score / 100).toFixed(2);
  if (Math.abs(dom_score) > MATE - MAX_DEPTH) {
    scoreText = "Score: Mate in " + (MATE - Math.abs(dom_score) - 1) + " moves";
  }

  $("#OrderingOut").text(
    "Ordering: " +
      (
        (SearchController.failHighFirst / SearchController.failHigh) *
        100
      ).toFixed(2) +
      "%"
  );
  $("#DepthOut").text("Depth: " + dom_depth);
  $("#ScoreOut").text(scoreText);
  $("#NodesOut").text("Nodes: " + SearchController.nodes);
  $("#TimeOut").text(
    "Time: " + (($.now() - SearchController.start) / 1000).toFixed(1) + "s"
  );
  $("#BestOut").text("BestMove: " + PrintMove(SearchController.best));
}
