function GetPvLine(depth) {
  let move = ProbePvTable();
  let count = 0;

  while (move != NO_MOVE && count < depth) {
    if (MoveExists(move) == BOOL.TRUE) {
      MakeMove(move);
      GameBoard.PvArray[count++] = move;
    } else {
      break;
    }
    move = ProbePvTable();
  }

  while (GameBoard.ply > 0) {
    TakeMove();
  }

  return count;
}

// Returns the best move from the PvTable
function ProbePvTable() {
  let index = GameBoard.posKey % PV_ENTRIES;

  // Move at the current position that beat the alpha
  if (GameBoard.PvTable[index].posKey == GameBoard.posKey) {
    return GameBoard.PvTable[index].move;
  }

  return NO_MOVE;
}

// Stores a best move in the PvTable
function StorePvMove(move) {
  let index = GameBoard.posKey % PV_ENTRIES;
  GameBoard.PvTable[index].posKey = GameBoard.posKey;
  GameBoard.PvTable[index].move = move;
}
