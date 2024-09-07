function markElement(element, tag)
{
    if(!element.classList.contains(tag))
    {
        element.classList.add(tag);
    }
}

function unmarkElement(element, tag)
{
    if(element.classList.contains(tag))
    {
        element.unmark(tag);
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
    

    if(isPieceSelected())
    {
        let selectedPieceIndex = squareIndex(selectedSquare);
        for (let index = 0; index < moveLength; index++) 
        {
            const move = moves[index];
            let start = move.StartSquare;

            if(start == selectedPieceIndex)
            {
                let target = move.TargetSquare;
        
                const targetSquare = SQUARES[target];
        
                markElement(targetSquare, 'targetable');
            }
        }
    }
}