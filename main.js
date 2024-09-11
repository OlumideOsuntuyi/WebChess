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

let boardSync = new BoardSync(board);

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

// createBoard();
console.log(board.CurrentFEN);

let moves = [new Move()];
let moveLength = 0;

function loop()
{
    let generator = new MoveGenerator();
    moves = generator.GenerateMoves(board);
    moveLength = generator.currMoveIndex;

    let gameOver = generator.inDoubleCheck || moveLength <= 0;
    reward.setActive(gameOver);

    boardSync.update();
    if(!board.IsWhiteToMove && moveLength > 0)
    {
        onTargetedMoveFromMove(moves[JSMath.RandomRange(0, moveLength - 1)]);
    }
}

const reward = new ResultDisplay();
reward.appendBody();
reward.setActive(false);

function undoMove()
{
    if(board.PlyCount > 0)
    {
        board.unmakeMove(board.AllGameMoves[board.PlyCount - 1]);
        boardSync.update();
    }
}


loop();
//let loopInterval = setInterval(loop, 1000 * JSMath.RandomRange(5, 10));
highlightMovesBasedOnSelected();


