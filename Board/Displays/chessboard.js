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
        chessboard.appendChild(piece);

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

    resetSquare()
    {
        this.jsObject.transform.LocalPosition = Tile.TilePosition(BoardHelper.CoordFromIndex(this.currentSquare));
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

    static get squareWidth()
    {
        return Math.max(window.innerWidth * 0.05, 50);
    }

    static get boardOffset()
    {
        return Math.max((window.innerWidth * 0.05 * 4), 200) + Math.max(window.innerWidth * 0.007, 12.5);
    }

    static get tileSize()
    {
        return new JSVector(Tile.squareWidth, Tile.squareWidth);
    }
    static get tileOffset()
    {
        return new JSVector(Tile.boardOffset, Tile.boardOffset);
    }
    static TilePosition(coord = new Coord())
    {
        const fileDir = 1;
        const rankDir = -1;
        let file = -4 + coord.fileIndex;
        let rank = -4 + coord.rankIndex;
        return new JSVector((Tile.tileSize.x * file * fileDir) + Tile.tileOffset.x, (Tile.tileSize.y * rank * rankDir) - Tile.tileOffset.y);
    }
}

class BoardSync
{
    ALL_TILES = {};
    MOVES = [];

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

    resetAll()
    {
        for (let square = 0; square < 64; square++) 
        {
            let tile = this.ALL_TILES[square];
            tile.piece.resetSquare();
        }
    }

    move()
    {
        let moveset;
        if(!this.board.IsWhiteToMove)
        {
            moveset = new MoveSet(this.board.PlyCount);
            matchMoves.appendChild(moveset.element);
            this.MOVES.push(moveset.transform);
        }else{moveset = this.MOVES[this.MOVES.length - 1].jsObject.component;}

        moveset.set(this.board.AllGameMoves[this.board.PlyCount - 1], this.board, this.CurrentFEN);

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


class MoveSet extends JSComponent
{
    constructor(ply)
    {
        super();
        this.ply = ply;
        this.updatedPly = ply - 2;
        this.jsObject.component = this;
        this.addElement();
        let odd = (ply - 1) % 4 == 0;
        
        this.element.className = "match-move";
        this.relativePosition();

        this.index = new JSText(this.ID);
        this.index.appendToComponent(this);
        this.index.element.className = 'index';
        this.index.color = new JSColor(255, 255, 255);
        this.index.text = `${(Math.floor(ply / 2)) + 1}.`;


        let width = 80;
        let start = 50;
        this.white = new PlayedMove(this, true, ply);
        this.white.element.style.marginLeft = `${start}px`;

        this.black = new PlayedMove(this, false, ply + 1);
    }

    set(move = new Move(), board = new Board(), PGN = "")
    {
        if(board.MoveColourIndex != Board.WhiteIndex)
        {
            this.white.set(move, board, PGN);
        }
        else
        {
            this.black.set(move, board, PGN);
        }
        matchMoves.scrollTop = matchMoves.scrollHeight;
    }

    remove(color = 0)
    {
        if(color == Board.WhiteIndex)
        {
            this.remove(this.white.board.PlyCount);
        }
        else
        {
            this.remove(this.black.board.PlyCount);
            this.black.remove();
        }
    }

}

class PlayedMove extends JSComponent
{
    get element()
    {
        return this.jsObject.element;
    }

    constructor(playedMove = new MoveSet(), isWhite = true, ply = 0)
    {
        super();
        this.isWhite = isWhite;
        this.ply = ply;
        this.transform.setParent(playedMove.ID);

        this.addElement();
        this.element.className = 'matchColor';
        this.element.classList.add(isWhite ? 'white' : 'black');
        this.appendToComponent(playedMove);
        this.relativePosition();

        this.notationObject = new JSText(this.ID);
        this.notationObject.element.className = 'notation';
        this.notationObject.element.classList.add('piece');
        this.notationObject.appendToComponent(this);
        this.notationObject.transform.setParent(this.ID);
        this.notationObject.transform.LocalPosition = new JSVector(0, 0);
        this.notationObject.absolutePosition();

        this.positionObject = new JSText(this.ID);
        this.positionObject.element.className = 'position';
        this.positionObject.appendToComponent(this);
        this.positionObject.transform.setParent(this.ID);
        this.positionObject.transform.LocalPosition = new JSVector(25, -5);
        this.positionObject.absolutePosition();

    }

    update()
    {
        
    }

    set(move = new Move(), board = new Board(), PGN = "")
    {
        this.move = move;
        this.PGN = PGN;
        this.fen = board.CurrentFEN;
        let flag = move.MoveFlag;
        let isPromotion = move.IsPromotion();
        let isCastle = Move.CastleFlag == flag;
        let isCheck = board.isInCheck();
        let pieceID = board.Square[move.TargetSquare];
        let pieceType = Piece.pieceType(pieceID);
        let piece_symbol = Piece.getSymbol(pieceID);
        if(pieceType != Piece.Pawn)
        {
            this.notationObject.text = "";
            this.notationObject.element.classList.add(piece_symbol);
        }


        const colors = [new JSColor(142, 202, 230), new JSColor(255, 183, 3), new JSColor(33, 158, 188), new JSColor(2, 48, 71), new JSColor(251, 133, 0)];
        if (isCheck)
        {
            this.element.content = piece_symbol;
            this.positionObject.text = Move.getPosition(move.TargetSquare);
            this.positionObject.color = colors[2];
        }else if (isCastle)
        {
            this.element.content = "";
            this.positionObject.text = "0-0";
            this.positionObject.color = colors[4];
        }else
        {
            this.element.content = piece_symbol;
            this.positionObject.text = Move.getPosition(move.TargetSquare);
            this.positionObject.color = colors[0];
        }
        this.set = true;
    }

    remove()
    {
        this.set = false;
        notation.text = "";
        position.text = "";
    }

    deselect(color)
    {
        this.element.style.backgroundColor = color;
    }
    select(color)
    {
        this.element.style.backgroundColor = color;
    }
}