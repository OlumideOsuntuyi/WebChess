const chessboard = document.getElementById('chessboard');
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

let selectedPiece;
let selectedSquare;
let targetPiece;
let targetSquare;

function createBoard() 
{
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) 
        {
            // create <div>
            const square = document.createElement('div');

            square.className = 'square';

            square.dataset.row = i;
            square.dataset.col = j;

            let index = j + (i * 8);
            let squareName = BoardHelper.SquareNameFromIndex(index);

            square.classList.add(((i + j) % 2 === 0 ? 'white' : 'black'));
            square.classList.add(squareName);
            square.classList.add(index);

            if (board.Square[index] !== 0) 
            {
                const piece = document.createElement('div');
                const pieceID = board.Square[index];
                const pieceType = Piece.pieceType(pieceID);
                const pieceColor = Piece.pieceColor(pieceID);
                const symbol = Piece.getSymbol(pieceID);
                
                piece.className = 'piece';
                piece.classList.add(pieceColor == Piece.White ? 'white' : 'black');
                piece.classList.add(symbol);
                piece.classList.add(pieceID); // index 1 of class list should always be piece id.
                piece.classList.add(squareName); // index 4 of class list should always be current square.
                
                piece.textContent = pieces[symbol];
                piece.draggable = true;
                piece.addEventListener('dragstart', dragStart);
                piece.addEventListener('dragend', dragEnd);
                square.appendChild(piece);
            }

            square.addEventListener('dragover', dragOver);
            square.addEventListener('drop', drop);
            square.addEventListener('click', onClickSquare);

            chessboard.appendChild(square);
        }
    }
}

function placePieceInSquare(piece, square)
{
    const pieceID = piece.classList[1];
    const previousSquareIndex = piece.classList[2];

    let colour = Piece.pieceColor(pieceID);
    let type = Piece.pieceType(pieceID);


}

createBoard();
console.log(board.CurrentFEN);

let moves = [new Move()];
let moveLength = 0;

function loop()
{
    let generator = new MoveGenerator();
    
    moves = generator.GenerateMoves(board);
    moveLength = generator.currMoveIndex;
}



loop();
highlightMovesBasedOnSelected();

