class TilePiece extends JSImage
{
    constructor(id = 0)
    {
        super();
        this.pID = id;
        this.currentSquare = id;
        this.pieceID = 0;
        this.unit = 'em';
        this.element.style.borderStyle = 'none';
        this.size = new JSVector(Tile.pieceWidth, Tile.pieceWidth);
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
        const piece = this.element;
        this.jsObject.lockElement(piece);
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

        this.jsObject.transform.localPosition = this.squarePosition;
        this.jsObject.updateElement();
    }

    resetSquare()
    {
        this.jsObject.transform.LocalPosition = Tile.TilePosition(BoardHelper.CoordFromIndex(this.pID));
        this.currentSquare = this.pID;
    }

    moveToSquare(board = new Board(), square, instant = false)
    {
        const piece = this.element;
        piece.classList.replace(piece.classList[4], square.element.classList[2]);

        this.currentSquare = square.index;
        if(instant)
        {
            this.jsObject.transform.LocalPosition = Tile.TilePosition(BoardHelper.CoordFromIndex(this.currentSquare));
        }else{this.jsObject.static = false;}

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

class Tile extends JSComponent
{
    constructor(id)
    {
        super();
        this.unit = 'em';
        this.index = id;
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
    
    static pieceWidth = 4;
    static squareWidth = 5;
    static pieceOffset = (Tile.squareWidth - Tile.pieceWidth) * 0.5;
    static boardOffset = (Tile.squareWidth * 4) + Tile.pieceOffset;
    static tileSize = new JSVector(Tile.squareWidth, Tile.squareWidth);
    static tileOffset = new JSVector(Tile.boardOffset, Tile.boardOffset);
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
        this.jsObject = new JSObject();
        this.jsObject.component = this;

        this.board = board;
        this.cloneBoard = Board.createBoardFromSource(board);
        this.ply = 0;
        this.init();

        this.whitePlayer = new PlayerInfo('white');
        this.whitePlayer.transform.setParent(this.jsObject.transform);

        this.blackPlayer = new PlayerInfo('black');
        this.blackPlayer.transform.setParent(this.jsObject.transform);


        this.FenDisplay = new JSComponent();
        this.FenDisplay.addElement();
        this.FenDisplay.appendElement(document.getElementById('gameArea-top'));
        this.FenDisplay.backgroundColor = new JSColor(22, 40, 30);
        this.FenDisplay.element.style.width = '100%';

        this.FenText = new JSText();
        this.FenText.unit = 'em';
        this.FenText.fontSize = 1 + 'em';
        this.FenText.appendToComponent(this.FenDisplay);
        this.FenText.color = new JSColor(255, 255, 255);
        this.FenText.autoWidth();
        this.FenText.paddingHeight = '0.20em';
        this.FenText.paddingWidth = '0.5em';
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
        this.FenText.text = `FEN : ${this.board.CurrentFEN}`;

        let currentPly = this.board.PlyCount;
        while(currentPly != this.ply)
        {
            let difference = currentPly - this.ply;
            if(difference > 0)
            {
                let move = this.board.AllGameMoves[this.ply++];
                this.makeMove(move);
                this.cloneBoard.makeMove(move)
            }else if(difference < 0)
            {
                this.unmakeMove(this.cloneBoard.AllGameMoves[--this.ply]);
            }
        }
    }

    resetAll()
    {
        let pieceMap = {};
        for (let square = 0; square < 64; square++) 
        {
            let tile = this.ALL_TILES[square];
            tile.piece.resetSquare();
            pieceMap[tile.piece.pID] = tile.piece;
        }

        for (let square = 0; square < 64; square++) 
        {
            tile.piece = pieceMap[square];
        }
    }

    makeMove(movePlayed = new Move())
    {
        let start = movePlayed.StartSquare;
        let end = movePlayed.TargetSquare;

        let startPieceID = this.cloneBoard.Square[start];
        let targetPieceID = this.cloneBoard.Square[end];

        let moveset;
        if(!this.board.IsWhiteToMove)
        {
            moveset = new MoveSet(this.board.PlyCount);
            matchMoves.appendChild(moveset.element);
            this.MOVES.push(moveset);
        }else{moveset = this.MOVES[this.MOVES.length - 1];}
        moveset.set(this.board.AllGameMoves[this.board.PlyCount - 1], this.board, this.CurrentFEN);

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

        startPiece.moveToSquare(this.board, endSquare);
        endPiece.moveToSquare(this.board, startSquare);

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

    unmakeMove(movePlayed = new Move())
    {
        let start = movePlayed.StartSquare;
        let end = movePlayed.TargetSquare;
        
        const startSquare = this.ALL_TILES[start];
        const endSquare = this.ALL_TILES[end];

        const startPiece = startSquare.piece;
        const endPiece = endSquare.piece;

        startSquare.piece = endPiece;
        endSquare.piece = startPiece;

        this.cloneBoard.unmakeMove(movePlayed);
        startPiece.moveToSquare(this.cloneBoard, endSquare, true); endPiece.moveToSquare(this.cloneBoard, startSquare, true);
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

class PlayerInfo extends JSComponent
{

    static getAvatar(index)
    {
        return `Resources\\Icons\\PlayerIcons\\${index}.png`;
    }

    constructor(name)
    {
        super();
        const parent = document.getElementById(`player-${name}`);
        this.jsObject.lockElement(parent);

        this.element.className = 'player';
        this.profilePicture = new JSImage();
        this.profilePicture.transform.setParent(this.transform);
        this.profilePicture.appendToComponent(this);
        this.profilePicture.backgroundImage = PlayerInfo.getAvatar(name == 'white' ? 1 : 1);
        this.profilePicture.size = this.elementSize.subtract(new JSVector(5, 5));
        this.profilePicture.setAspect();

        this.profileName = new JSText();
        this.profileName.text = name;

        let color = (name == 'black' ? 255 : 0);
        this.profileName.color = new JSColor(color, color, color);
        this.profileName.transform.setParent(this.transform);
        this.profileName.appendToComponent(this);
    }
}

class ResultDisplay extends JSComponent
{
    constructor()
    {
        super();
        this.unit = 'em';
        this.addElement();
        this.appendBody();
        this.absolutePosition();
        this.setFlex('column', 'center');
        this.backgroundColor = new JSColor(40, 40, 40);
        this.radius = 0.25;
        this.size = new JSVector(20, 20);
        this.element.style.zIndex = 1000;
        this.element.style.overflow = 'none';

        //top layout
        this.topLayout = new JSComponent();
        this.topLayout.unit = 'em';
        this.topLayout.addElement();
        this.topLayout.relativePosition();
        this.topLayout.appendToComponent(this);
        this.topLayout.setFlex('row', 'center');
        this.topLayout.justifyContent('center');
        this.topLayout.element.style.width = '100%';
        this.topLayout.element.style.height = '3em';

            this.resultText = new JSText();
            this.resultText.unit = 'em';
            this.resultText.fontSize = '1em';
            this.resultText.text = `Black won by checkmate`;
            this.resultText.autoWidth();
            this.resultText.appendToComponent(this.topLayout);

            this.cancelButton = new JSImage();
            this.cancelButton.unit = 'em';
            this.cancelButton.appendToComponent(this.topLayout);
            this.cancelButton.absolutePosition();
            this.cancelButton.size = new JSVector(1, 1); this.cancelButton.setAspect();
            this.cancelButton.backgroundImage = 'Resources\\Icons\\cancel.png';
            this.cancelButton.element.style.right = '0.5em';
            this.cancelButton.element.style.alignSelf = 'center';

        this.bodyLayout = new JSComponent();
        this.bodyLayout.unit = 'em';
        this.bodyLayout.addElement();
        this.bodyLayout.appendToComponent(this);
        this.bodyLayout.size = new JSVector(20, 18);
        this.bodyLayout.setFlex('column', 'center');
        this.bodyLayout.justifyContent('flex-start');

            this.playerArea = new JSComponent();
            this.playerArea.unit = 'em';
            this.playerArea.addElement();
            this.playerArea.appendToComponent(this.bodyLayout);
            this.playerArea.setFlex('row', 'center');
            this.playerArea.justifyContent('flex-start');
            this.playerArea.element.style.width = 'auto';
            this.playerArea.element.style.height = 10 + 'em';
            this.playerArea.element.style.gap = 2 + 'em';

                this.playerWhiteArea = new JSComponent();
                this.playerWhiteArea.addElement();
                this.playerWhiteArea.relativePosition();
                this.playerWhiteArea.unit = 'em';
                this.playerWhiteArea.appendToComponent(this.playerArea);
                this.playerWhiteArea.backgroundColor = new JSColor(50, 50, 50);
                this.playerWhiteArea.radius = 0.5;
                this.playerWhiteArea.element.style.borderStyle = 'solid';
                this.playerWhiteArea.element.style.borderWidth = 0.2 + 'em';
                this.playerWhiteArea.element.style.borderColor = new JSColor(255, 255, 255).toString();
                this.playerWhiteArea.setFlex('none', 'center');
                this.playerWhiteArea.justifyContent('center');

                    this.playerWhite = new JSImage();
                    this.playerWhite.unit = 'em';
                    this.playerWhite.appendToComponent(this.playerWhiteArea);
                    this.playerWhite.size = new JSVector(5, 5);
                    this.playerWhite.backgroundImage = PlayerInfo.getAvatar(1);

                    this.playerWhiteName = new JSText();
                    this.playerWhiteName.unit = 'em';
                    this.playerWhiteName.fontSize = 0.75 + 'em';
                    this.playerWhiteName.element.style.fontWeight = '900';
                    this.playerWhiteName.text = `White Player`;
                    this.playerWhiteName.autoWidth();
                    this.playerWhiteName.appendToComponent(this.playerWhiteArea);
                    this.playerWhiteName.absolutePosition();
                    this.playerWhiteName.element.style.bottom = -4 + 'em';

                this.playerVS = new JSText();
                this.playerVS.unit = 'em';
                this.playerVS.fontSize = 2.5 + 'em';
                this.playerVS.text = `vs`;
                this.playerVS.autoWidth();
                this.playerVS.appendToComponent(this.playerArea);
                
                this.playerBlackArea = new JSComponent();
                this.playerBlackArea.addElement();
                this.playerBlackArea.relativePosition();
                this.playerBlackArea.unit = 'em';
                this.playerBlackArea.appendToComponent(this.playerArea);
                this.playerBlackArea.backgroundColor = new JSColor(50, 50, 50);
                this.playerBlackArea.radius = 0.5;
                this.playerBlackArea.element.style.borderStyle = 'solid';
                this.playerBlackArea.element.style.borderWidth = 0.2 + 'em';
                this.playerBlackArea.element.style.borderColor = new JSColor(80, 200, 20).toString();
                this.playerBlackArea.setFlex('none', 'center');
                this.playerBlackArea.justifyContent('center');

                    this.playerBlack = new JSImage();
                    this.playerBlack.unit = 'em';
                    this.playerBlack.appendToComponent(this.playerBlackArea);
                    this.playerBlack.size = new JSVector(5, 5);
                    this.playerBlack.radius = 1;
                    this.playerBlack.backgroundImage = PlayerInfo.getAvatar(2);

                    this.playerBlackName = new JSText();
                    this.playerBlackName.unit = 'em';
                    this.playerBlackName.fontSize = 0.75 + 'em';
                    this.playerBlackName.element.style.fontWeight = '900';
                    this.playerBlackName.text = `Black Player`;
                    this.playerBlackName.autoWidth();
                    this.playerBlackName.appendToComponent(this.playerBlackArea);
                    this.playerBlackName.absolutePosition();
                    this.playerBlackName.element.style.bottom = -4 + 'em';

            this.bottomButtons = new JSComponent();
            this.bottomButtons.addElement();
            this.bottomButtons.appendToComponent(this.bodyLayout);
            this.bottomButtons.absolutePosition();
            this.bottomButtons.setFlex('column', 'center');
            this.bottomButtons.justifyContent('center');
            this.bottomButtons.element.style.bottom = 0;
            this.bottomButtons.element.style.width = '15em';
            this.bottomButtons.element.style.height = 'auto';
            this.bottomButtons.paddingWidth = '1em';
            this.bottomButtons.element.style.gap = '0.5em';
            this.bottomButtons.paddingHeight = '0.5em';

                this.rematchButton = new JSButton();
                this.rematchButton.unit = 'em';
                this.rematchButton.radius = 0.25;
                this.rematchButton.label = "Rematch Now";
                this.rematchButton.color = new JSColor(255, 255, 255);
                this.rematchButton.fontSize = 1;
                this.rematchButton.setFlex('none', 'center');
                this.rematchButton.justifyContent('center');
                this.rematchButton.size = new JSVector(15, 2);
                this.rematchButton.appendToComponent(this.bottomButtons);
                this.rematchButton.backgroundColor = new JSColor(80, 120, 200);
                this.rematchButton.element.style.boxShadow = `${0.0 + 'em'} ${0.1 + 'em'} ${0.25 + 'em'} ${new JSColor(30, 100, 200)}`;

                this.bottom2ButtonLayout = new JSComponent();
                this.bottom2ButtonLayout.addElement();
                this.bottom2ButtonLayout.appendToComponent(this.bottomButtons);
                this.bottom2ButtonLayout.setFlex('row', 'center');
                this.bottom2ButtonLayout.justifyContent('center');
                this.bottom2ButtonLayout.element.style.bottom = 0;
                this.bottom2ButtonLayout.element.style.width = '15em';
                this.bottom2ButtonLayout.element.style.height = 'auto';
                this.bottom2ButtonLayout.paddingWidth = '1em';
                this.bottom2ButtonLayout.element.style.gap = '1em';

                    this.selectionMenu = new JSButton();
                    this.selectionMenu.unit = 'em';
                    this.selectionMenu.radius = 0.25;
                    this.selectionMenu.label = "Analysis";
                    this.selectionMenu.color = new JSColor(255, 255, 255);
                    this.selectionMenu.fontSize = 1;
                    this.selectionMenu.setFlex('none', 'center');
                    this.selectionMenu.justifyContent('center');
                    this.selectionMenu.size = new JSVector(8, 2);
                    this.selectionMenu.appendToComponent(this.bottom2ButtonLayout);
                    this.selectionMenu.backgroundColor = new JSColor(80, 80, 80);
                    this.selectionMenu.element.style.boxShadow = `${0.0 + 'em'} ${0.1 + 'em'} ${0.25 + 'em'} ${new JSColor(80, 80, 80)}`;

                    this.analysisButton = new JSButton();
                    this.analysisButton.unit = 'em';
                    this.analysisButton.radius = 0.25;
                    this.analysisButton.label = "Bot Selection";
                    this.analysisButton.color = new JSColor(255, 255, 255);
                    this.analysisButton.fontSize = 1;
                    this.analysisButton.setFlex('none', 'center');
                    this.analysisButton.justifyContent('center');
                    this.analysisButton.size = new JSVector(8, 2);
                    this.analysisButton.appendToComponent(this.bottom2ButtonLayout);
                    this.analysisButton.backgroundColor = new JSColor(80, 80, 80);
                    this.analysisButton.element.style.boxShadow = `${0.0 + 'em'} ${0.1 + 'em'} ${0.25 + 'em'} ${new JSColor(80, 80, 80)}`;
    }
}