const chessboard = document.getElementById('chessboard');

chessboard.style.gridTemplateColumns = `repeat(8, ${Tile.squareWidth}em)`;
chessboard.style.gridTemplateRows = `repeat(8, ${Tile.squareWidth}em)`;

const gameDiv = document.getElementById('gameArea');
const matchMoves = document.getElementById('match-moves');
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const SQUARES = document.getElementsByClassName('square');
const PIECES = document.getElementsByClassName('piece');
const WHITE_PIECES = document.querySelectorAll('.piece.white');
const BLACK_PIECES = document.querySelectorAll('.piece.black');

const BOARD_OFFSET = 245;
const SQUARE_SIZE = 60;

let board = new Board();
board.loadStartPosition();

let mainEval = new Evaluation();
let boardSync = new BoardSync(board);

const reward = new ResultDisplay();
reward.appendBody();
reward.setActive(false);

const evaluationBar = new JSProgressBar();

let selectedPiece;
let selectedSquare;
let targetPiece;
let targetSquare;

function placePieceInSquare(piece, square)
{
    const pieceID = piece.classList[1];
    const previousSquareIndex = piece.classList[2];

    let colour = Piece.pieceColor(pieceID);
    let type = Piece.pieceType(pieceID);
}

let engineInterval = setInterval(GameEngine.Update, 33.33);

let moves = [new Move()];
let moveLength = 0;

function loop()
{
    let generator = new MoveGenerator();
    generator.promotionsToGenerate = PromotionMode.All;
    moves = generator.GenerateMoves(board);
    moveLength = generator.currMoveIndex;

    let gameOver = generator.inDoubleCheck || moveLength <= 0;
    reward.setActive(gameOver);

    let evaluation = mainEval.evaluate(board);
    evaluationBar.percent = (100 + evaluation) / 200.0;

    if(!board.IsWhiteToMove)
    {
        let searcher = new SearchAlgorithm(Board.createBoardFromSource(board), true);
        searcher.startSearch();
        console.log(searcher.bestMove);
        onTargetedMoveFromMove(searcher.bestMove);
    }

}

function undoMove()
{
    if(board.PlyCount > 0)
    {
        board.unmakeMove(board.AllGameMoves[board.PlyCount - 1]);
    }
}

loop();
highlightMovesBasedOnSelected();

/*
const worker = new Worker('Board\\Game\\Threaded\\worker.js');
worker.postMessage({value: board});
worker.onmessage = function(event)
{
    const search = event.data;
    onTargetedMoveFromMove(search.bestMove);
};

*/

