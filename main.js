const chessboard = document.getElementById('chessboard');

const gameDiv = document.getElementById('gameArea');
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const SQUARES = document.getElementsByClassName('square');
const PIECES = document.getElementsByClassName('piece');
const WHITE_PIECES = document.querySelectorAll('.piece.white');
const BLACK_PIECES = document.querySelectorAll('.piece.black');

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
    boardSync.update();

    if(!board.IsWhiteToMove && moveLength > 0)
    {
        onTargetedMoveFromMove(moves[JSMath.RandomRange(0, moveLength - 1)]);
    }
}



loop();
highlightMovesBasedOnSelected();

