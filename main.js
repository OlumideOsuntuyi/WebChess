const chessboard = document.getElementById('chessboard');
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const initialBoard = [
    'rnbqkbnr',
    'pppppppp',
    '........',
    '........',
    '........',
    '........',
    'PPPPPPPP',
    'RNBQKBNR'
];

function createBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((i + j) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = i;
            square.dataset.col = j;
            if (initialBoard[i][j] !== '.') {
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.textContent = pieces[initialBoard[i][j]];
                piece.draggable = true;
                piece.addEventListener('dragstart', dragStart);
                piece.addEventListener('dragend', dragEnd);
                square.appendChild(piece);
            }
            square.addEventListener('dragover', dragOver);
            square.addEventListener('drop', drop);
            chessboard.appendChild(square);
        }
    }
}

createBoard();
let board = new Board();
board.initialize();
board.loadStartPosition();

console.log(board.CurrentFEN);
