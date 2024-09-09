function markElement(element, tag)
{
    if(typeof element != 'undefined' && !element.classList.contains(tag))
    {
        element.classList.add(tag);
    }
}

function unmarkElement(element, tag)
{
    if(typeof element != 'undefined' && element.classList.contains(tag))
    {
        element.classList.remove(tag);
    }
}

function markAll(elements, tag)
{
    Array.from(elements).forEach(element => 
    {
        markElement(element, tag);
    });
}

function unmarkAll(elements, tag)
{
    Array.from(elements).forEach(element => 
    {
        unmarkElement(element, tag);
    });
}

function highlightMovesBasedOnSelected()
{   
    unmarkAll(SQUARES, 'targetable');
    unmarkAll(SQUARES, 'movable-square');
    unmarkAll(SQUARES, 'inCheck');
    
    let selectedPieceIndex = 0;
    let pieceSelected = isPieceSelected();
    if(pieceSelected)
    {
        selectedPieceIndex = squareIndex(selectedSquare);
    }

    for (let index = 0; index < moveLength; index++) 
    {
        const move = moves[index];
        let start = move.StartSquare;
        const startSquare = SQUARES[start];
        markElement(startSquare, 'movable-square');


        if(start == selectedPieceIndex && pieceSelected)
        {
            let target = move.TargetSquare;
            const targetSquare = SQUARES[target];
    
            markElement(targetSquare, 'targetable');
        }
    }
}