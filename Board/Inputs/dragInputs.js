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