function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.parentElement.dataset.row + ',' + event.target.parentElement.dataset.col);
    setTimeout(() => {
        event.target.style.display = 'none';
    }, 0);
}

function dragEnd(event) {
    event.target.style.display = 'block';
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain').split(',');
    const fromRow = data[0];
    const fromCol = data[1];
    const toRow = event.target.dataset.row;
    const toCol = event.target.dataset.col;

    const fromSquare = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}']`);
    const piece = fromSquare.querySelector('.piece');
    if (piece) {
        event.target.appendChild(piece);
    }
}


function deselectPiece() 
{ 
    selectedPiece.classList.remove('selected'); selectedPiece = undefined; 
    selectedSquare.classList.remove('selected'); selectedSquare = undefined;

    console.log('deselected');
}

function deselectTarget() 
{ 
    if(typeof targetPiece != 'undefined')
    {
        targetPiece.classList.remove('targeted'); targetPiece = undefined; 
    }
    targetSquare.classList.remove('targeted'); targetSquare = undefined;
}

function isPieceSelected() { return (typeof selectedPiece != 'undefined'); }
function isTargetSelected() { return (typeof targetSquare != 'undefined'); }

function squareIndex(square)
{
    return Number(square.classList[3]);
}

function squareFromIndex(index)
{
    return Array.from(SQUARES).filter(square => square.classList.contains(BoardHelper.SquareNameFromIndex(index)))[0];
}

function pieceFromIndex(index)
{
    return Array.from(PIECES).filter(piece => piece.classList.contains(BoardHelper.SquareNameFromIndex(index)))[0];
}

function movePiece(square, target)
{
    square.classList.replace(square.classList[4], target.classList[2]);
}

function onClickSquare(event)
{
    const target = event.target;

    if(!target.classList.contains('square'))
    {
        return;
    }

    if(isPieceSelected())
    {
        targetSquare = target;
        targetSquare.classList.add('targeted');

        // check if valid move
        onTargetedMove(selectedPiece, targetSquare);
    }else
    {
        selectedSquare = target;

        let squareIndexStr = selectedSquare.classList[2];
        selectedPiece = Array.from(PIECES).filter(piece => piece.classList.contains(squareIndexStr))[0];

        selectedPiece.classList.add('selected');
        selectedSquare.classList.add('selected');
    }
    
    highlightMovesBasedOnSelected();
}

function onTargetedMoveFromMove(move = new Move())
{
    onTargetedIndexMove(move.StartSquare, move.TargetSquare);
}

function onTargetedIndexMove(pieceIndex, squareIndex)
{
    onTargetedMove(pieceFromIndex(pieceIndex), squareFromIndex(squareIndex));
}

function onTargetedMove(piece, square)
{
    const endIndex = BoardHelper.SquareIndexFromName(square.classList[2]);// return square index
    const startIndex = BoardHelper.SquareIndexFromName(piece.classList[4]); // return current square index

    let move = new Move(startIndex, endIndex);
    board.makeMove(move);

    movePiece(piece, square);

    square.appendChild(piece);

    if(isPieceSelected())
    {
        deselectPiece();
    }

    if(isTargetSelected())
    {
        deselectTarget();
    }

    loop();
}