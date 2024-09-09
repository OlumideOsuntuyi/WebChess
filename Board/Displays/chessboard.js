class TilePiece
{
    constructor(id = 0)
    {
        this.pID = id;
        this.currentSquare = id;
        this.pieceID = 0;
        this.jsObject = new JSObject();
        this.jsObject.component = this;
    }

    get element()
    {
        return this.jsObject.element;
    }

    get square()
    {
        return boardSync.ALL_TILES[this.currentSquare];
    }

    get squarePosition()
    {
        return Tile.TilePosition(BoardHelper.CoordFromIndex(this.currentSquare));
    }

    create(square, squareName)
    {
        const piece = document.createElement('div');
        gameDiv.appendChild(piece);

        const pieceID = board.Square[this.currentSquare]; this.pieceID = pieceID;
        const pieceType = Piece.pieceType(pieceID);
        
        const pieceColor = Piece.pieceColor(pieceID);
        let symbol = Piece.getSymbol(pieceID);
        if(pieceID == 0)
        {
            symbol = 'e';
        }
        
        piece.className = 'piece';
        piece.classList.add(pieceColor == Piece.White ? 'white' : 'black');
        piece.classList.add(symbol);
        piece.classList.add(pieceID); // index 1 of class list should always be piece id.
        piece.classList.add(squareName); // index 4 of class list should always be current square.
        
        piece.textContent = symbol;

        piece.draggable = true;
        piece.addEventListener('dragstart', this.dragStart);
        piece.addEventListener('dragend', this.dragEnd);
        piece.addEventListener('click', function(event){
            event.stopImmediatePropagation();
        });

        this.jsObject.lockElement(piece);

        this.jsObject.transform.localPosition = this.squarePosition;
        this.jsObject.updateElement();
    }

    moveToSquare(square)
    {
        const piece = this.element;
        piece.classList.replace(piece.classList[4], square.element.classList[2]);

        this.currentSquare = square.index;
        this.jsObject.static = false;

        this.pieceID = board.Square[this.currentSquare];
        let pieceType = Piece.pieceType(this.pieceID);
        let pieceColor = Piece.pieceColor(this.pieceID);
        let symbol = Piece.getSymbol(this.pieceID);
        if(this.pieceID == 0)
        {
            symbol = 'e';
        }

        piece.classList.replace(piece.classList[2], symbol);
        piece.classList.replace(piece.classList[3], this.pieceID);
    }

    moveTowards()
    {
        let position = this.jsObject.transform.localPosition;
        let squarePosition = this.squarePosition;
        let distance = JSVector.distance(position, squarePosition);

        let vector = squarePosition.subtract(position);
        vector.normalizeSelf();

        let speed = Time.deltaTime * (distance / 0.3);
        vector.multiplySelf(speed);
        position.addSelf(vector);

        distance = JSVector.distance(position, squarePosition);
        if(distance < 0.1)
        {
            this.jsObject.static = true;
            return;
        }
    }
    
    dragStart()
    {

    }

    dragEnd()
    {
        
    }

    update()
    {
        if(!this.jsObject.static)
        {
            this.moveTowards();
        }
    }
}

class Tile
{
    constructor(id)
    {
        this.index = id;
        this.jsObject = new JSObject();
        this.jsObject.component = this;
        this.piece = new TilePiece(id);
    }

    get element()
    {
        return this.jsObject.element;
    }

    get rect()
    {
        return this.element.getBoundingClientRect();
    }

    get rectPosition()
    {
        return new JSVector(rect.right, rect.top);
    }

    init()
    {
        const square = document.createElement('div');
        let squareName = BoardHelper.SquareNameFromIndex(this.index);
        let i = BoardHelper.FileIndex(this.index);
        let j = BoardHelper.RankIndex(this.index);

        square.className = 'square';

        square.dataset.row = i;
        square.dataset.col = j;

        square.classList.add(((i + j) % 2 === 0 ? 'white' : 'black'));
        square.classList.add(squareName);
        square.classList.add(this.index);

        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', drop);
        square.addEventListener('click', onClickSquare);

        chessboard.appendChild(square);

        this.jsObject.lockElement(square);

        this.jsObject.transform.localPosition.set(this.rect.right, this.rect.top);
        this.piece.create(this, squareName);
    }

    update()
    {
        
    }

    static tileSize = new JSVector(60, 60);
    static tileOffset = new JSVector(250, 250);
    static TilePosition(coord = new Coord())
    {
        const fileDir = 1;
        const rankDir = 1;
        let file = -4 + coord.fileIndex;
        let rank = -4 + coord.rankIndex;
        return new JSVector((Tile.tileSize.x * file * fileDir) + Tile.tileOffset.x, (Tile.tileSize.y * rank * rankDir) + Tile.tileOffset.y);
    }
}

class BoardSync
{
    ALL_TILES = {};

    constructor(board = new Board())
    {
        this.board = board;
        this.ply = 0;
        this.jsObject = new JSObject();
        this.init();
    }

    init()
    {
        for (let square = 0; square < 64; square++) 
        {
            let tile = new Tile(square);
            this.ALL_TILES[square] = tile;
            tile.jsObject.transform.setParent(this.jsObject.jsID);
            tile.init();
        }
    }

    update()
    {
        let currentPly = this.board.PlyCount;
        while(currentPly > this.ply)
        {
            this.move();
        }
    }

    move()
    {
        const movePlayed = this.board.AllGameMoves[this.ply++];
        let start = movePlayed.StartSquare;
        let end = movePlayed.TargetSquare;

        const startSquare = this.ALL_TILES[start];
        const endSquare = this.ALL_TILES[end];

        const startPiece = startSquare.piece;
        const endPiece = endSquare.piece;

        let startPieceIndex = startPiece.pieceID;
        let endPieceIndex = endPiece.pieceID;
        let isCapture = (endPieceIndex > 0 && movePlayed.moveFlag != Move.CastleFlag) || movePlayed.moveFlag == Move.EnPassantCaptureFlag;
        let isPromote = movePlayed.IsPromotion();

        startSquare.piece = endPiece;
        endSquare.piece = startPiece;

        startPiece.moveToSquare(endSquare);
        endPiece.moveToSquare(startSquare);

        if(isPromote)
        {

        }else if(isCapture)
        {
            GameAudio.playCapture();
        }else
        {
            GameAudio.playMove();
        }
    }
}