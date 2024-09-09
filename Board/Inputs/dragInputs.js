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


function selectSquare(square)
{
    selectedSquare = square; markElement(selectedSquare, 'selected');
    selectedPiece = Array.from(PIECES).filter(piece => piece.classList.contains(selectedSquare.classList[2]))[0]; markElement(selectedPiece, 'selected');
}

function selectTarget(square)
{
    targetSquare = square; markElement(targetSquare, 'targeted');
}

function deselectPiece() 
{ 
    unmarkElement(selectedPiece, 'selected'); selectedPiece = undefined; 
    unmarkElement(selectedSquare, 'selected'); selectedSquare = undefined;
}

function deselectTarget() 
{ 
    unmarkElement(targetPiece, 'targeted'); targetPiece = undefined; 
    unmarkElement(targetSquare, 'targeted'); targetSquare = undefined;
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

function movePiece(piece, square)
{
    piece.classList.replace(piece.classList[4], square.classList[2]);
    square.appendChild(piece);
}

function onClickSquare(event)
{
    const target = event.target;

    const square = target.classList.contains('square');
    const movableSquare = target.classList.contains('movable-square');
    const targetableSquare = target.classList.contains('targetable');
    const alreadySelected = isPieceSelected();


    if(!square) return;

    if(alreadySelected && !movableSquare && targetableSquare) // if selected an clicking target square
    {
        selectTarget(target); onTargetedMove(selectedSquare, targetSquare);
    }else if(alreadySelected && movableSquare && !targetableSquare) // if selected and trying to change selection
    {
        deselectPiece(); selectSquare(target);
    }else if(!alreadySelected && movableSquare) // if trying to select movable square
    {
        selectSquare(target);
    }else
    {
        deselectPiece(); deselectTarget();
    }
    highlightMovesBasedOnSelected();
}

function onSelect(target)
{
    selectedSquare = target;

    let squareIndexStr = selectedSquare.classList[2];
    selectedPiece = Array.from(PIECES).filter(piece => piece.classList.contains(squareIndexStr))[0];

    selectedPiece.classList.add('selected');
    selectedSquare.classList.add('selected');
}

function onTargetedMoveFromMove(move = new Move())
{
    onTargetedIndexMove(move.StartSquare, move.TargetSquare);
}

function onTargetedIndexMove(pieceIndex, squareIndex)
{
    onTargetedMove(pieceFromIndex(pieceIndex), squareFromIndex(squareIndex));
}

function onTargetedMove(sourceSquare, targetSquare)
{
    const startIndex = squareIndex(sourceSquare);
    const endIndex = squareIndex(targetSquare);

    let move = new Move(startIndex, endIndex);
    board.makeMove(move);
    
    deselectPiece(); deselectTarget();
    loop();
}