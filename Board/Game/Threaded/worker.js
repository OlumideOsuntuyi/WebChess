let SEARCH = new SearchAlgorithm(Board.createBoardFromSource(board), true);

onmessage = function(event)
{
    const board = event.data.value;
    let SEARCH = new SearchAlgorithm(Board.createBoardFromSource(board), true);
    SEARCH.startSearch();

    this.postMessage(SEARCH);
}