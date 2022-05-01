let perft_leafNodes;

// Checks total leaf nodes for a certain depth for a particular board position
function Perft(depth) {
  if (depth == 0) {
    // Increment leafNode count when leaf node is encountered
    perft_leafNodes++;
    return;
  }

  GenerateMoves();

  let index;
  let move;

  for (
    index = GameBoard.moveListStart[GameBoard.ply];
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    ++index
  ) {
    move = GameBoard.moveList[index];
    if (MakeMove(move) == BOOL.FALSE) {
      continue;
    }
    Perft(depth - 1);
    TakeMove();
  }

  return;
}

// Calls Perft function
// Prints leaf nodes for every starting move
function PerftTest(depth) {
  PrintBoard();
  console.log("Starting Test To Depth:" + depth);
  perft_leafNodes = 0;

  let index;
  let move;
  let moveNum = 0;

  GenerateMoves();

  for (
    index = GameBoard.moveListStart[GameBoard.ply];
    index < GameBoard.moveListStart[GameBoard.ply + 1];
    ++index
  ) {
    move = GameBoard.moveList[index];
    if (MakeMove(move) == BOOL.FALSE) {
      continue;
    }
    moveNum++;
    let cumnodes = perft_leafNodes;
    Perft(depth - 1);
    TakeMove();
    let oldnodes = perft_leafNodes - cumnodes;
    console.log("move:" + moveNum + " " + PrintMove(move) + " " + oldnodes);
  }

  console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");
  return;
}
