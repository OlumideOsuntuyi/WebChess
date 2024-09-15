class GameState
{
    static ClearWhiteKingsideMask = 0b1110;
    static ClearWhiteQueensideMask = 0b1101;
    static ClearBlackKingsideMask = 0b1011;
    static ClearBlackQueensideMask = 0b0111;

    constructor(capturedPieceType, enPassantFile, castlingRights, fiftyMoveCounter, zobristKey = 0n)
    {
        this.capturedPieceType = capturedPieceType;
        this.enPassantFile = enPassantFile;
        this.castlingRights = castlingRights;
        this.fiftyMoveCounter = fiftyMoveCounter;
        this.zobristKey = zobristKey;
    }

    HasKingsideCastleRight(white)
    {
        const mask = white ? 1 : 4;
        return (this.castlingRights & mask) != 0;
    }

    HasQueensideCastleRight(white)
    {
        const mask = white ? 2 : 8;
        return (this.castlingRights & mask) != 0;
    }
}

// 16bit move value - 2 bytes
class Move
{
    static NullMove = new Move(0);

    // Flags
    static NoFlag = 0b0000;
    static EnPassantCaptureFlag = 0b0001;
    static CastleFlag = 0b0010;
    static PawnTwoUpFlag = 0b0011;

    static PromoteToQueenFlag = 0b0100;
    static PromoteToKnightFlag = 0b0101;
    static PromoteToRookFlag = 0b0110;
    static PromoteToBishopFlag = 0b0111;

    // Masks
    static startSquareMask = 0b0000000000111111;
    static targetSquareMask = 0b0000111111000000;
    static flagMask = 0b1111000000000000;

    // converting multi constructor pass
    constructor(startSquare, targetSquare, flag) 
    {
        if (typeof startSquare === 'undefined' && typeof targetSquare === 'undefined' && typeof flag === 'undefined') {
            this.moveValue = 0;
        } else if (typeof targetSquare === 'undefined' && typeof flag === 'undefined') {
            // Single parameter constructor
            this.moveValue = startSquare;
        } else if (typeof flag === 'undefined') {
            // Two parameters constructor
            this.moveValue = startSquare | (targetSquare << 6);
        } else {
            // Three parameters constructor
            this.moveValue = startSquare | (targetSquare << 6) | (flag << 12);
        }
    }

    get Value()
    {
        return this.moveValue;
    }

    IsNull()
    {
        return this.moveValue == 0;
    }

    get StartSquare()
    {
        return this.moveValue & Move.startSquareMask;
    }
    
    get TargetSquare()
    {
        return (this.moveValue & Move.targetSquareMask) >> 6;
    }
    
    IsPromotion()
    {
        return  this.MoveFlag >= Move.PromoteToQueenFlag;
    }
    
    get MoveFlag()
    {
        return this.moveValue >> 12;
    }

    PromotionPieceType()
    {
        switch (this.MoveFlag)
        {
            case PromoteToRookFlag:
                return Piece.Rook;
            case PromoteToKnightFlag:
                return Piece.Knight;
            case PromoteToBishopFlag:
                return Piece.Bishop;
            case PromoteToQueenFlag:
                return Piece.Queen;
            default:
                return Piece.None;
        }
    }

    RookStart()
    {
        switch(this.TargetSquare)
        {
            case BoardHelper.c1:
                {
                    return BoardHelper.a1;
                }
            case BoardHelper.c8:
                {
                    return BoardHelper.a8;
                }
            case BoardHelper.g1:
                {
                    return BoardHelper.h1;
                }
            case BoardHelper.f8:
                {
                    return BoardHelper.h8;
                }
        }
        return this.TargetSquare;
    }

    EnpassantTarget()
    {
        const shift = BoardHelper.RankIndex(this.StartSquare) == 4 ? -8 : +8;
        return this.TargetSquare + shift;
    }

    RookEnd()
    {
        switch (this.TargetSquare)
        {
            case BoardHelper.c1:
                {
                    return BoardHelper.d1;
                }
            case BoardHelper.c8:
                {
                    return BoardHelper.d8;
                }
            case BoardHelper.g1:
                {
                    return BoardHelper.f1;
                }
            case BoardHelper.f8:
                {
                    return BoardHelper.f8;
                }
        }
        return this.TargetSquare;
    }

    static SameMove(a, b)
    {
        return a.moveValue == b.moveValue;
    }

    static getPosition(index = 0) {
        return String.fromCharCode(97 + (index % 8)) + (8 - Math.floor(index / 8));
    }
    get UCI()
    {
        return BoardHelper.SquareNameFromIndex(this.StartSquare) + BoardHelper.SquareNameFromIndex(this.TargetSquare);
    }
}

class Board 
{
    static WhiteIndex = 0;
    static BlackIndex = 1;

    // Stores piece code for each square on the board
    Square = new Array(64).fill(0);
    // Square index of white and black king
    KingSquare = [0, 0];
    // Bitboards
    // Bitboard for each piece type and colour (white pawns, white knights, ... black pawns, etc.)
    PieceBitboards = new Array(12).fill(0n);
    // Bitboards for all pieces of either colour (all white pieces, all black pieces)
    ColourBitboards = [0n, 0n];
    AllPiecesBitboard = 0n;
    FriendlyOrthogonalSliders = 0n;
    FriendlyDiagonalSliders = 0n;
    EnemyOrthogonalSliders = 0n;
    EnemyDiagonalSliders = 0n;
    // Piece count excluding pawns and kings
    TotalPieceCountWithoutPawnsAndKings = 0;

    // Piece lists
    Rooks = [new PieceList(), new PieceList()];
    Bishops = [new PieceList(), new PieceList()];
    Queens = [new PieceList(), new PieceList()];
    Knights = [new PieceList(), new PieceList()];
    Pawns = [new PieceList(), new PieceList()];

    // Side to move info
    IsWhiteToMove = true;
    get MoveColour() {
        return this.IsWhiteToMove ? Piece.White : Piece.Black;
    }
    get OpponentColour() {
        return this.IsWhiteToMove ? Piece.Black : Piece.White;
    }
    get MoveColourIndex() {
        return this.IsWhiteToMove ? Board.WhiteIndex : Board.BlackIndex;
    }
    get OpponentColourIndex() {
        return this.IsWhiteToMove ? Board.BlackIndex : Board.WhiteIndex;
    }
    // List of (hashed) positions since last pawn move or capture (for detecting repetitions)
    RepetitionPositionHistory = new StackList();

    // Total plies (half-moves) played in game
    PlyCount = 0;
    get FiftyMoveCounter() {
        return this.CurrentGameState.fiftyMoveCounter;
    }
    CurrentGameState = new GameState();
    get ZobristKey() {
        return this.CurrentGameState.zobristKey;
    }
    get CurrentFEN() {
        return FenUtility.currentFen(this);
    }
    get GameStartFEN() {
        return this.StartPositionInfo.fen;
    }
    AllGameMoves = [];

    // Private stuff
    allPieceLists = [];
    gameStateHistory = [];
    StartPositionInfo = new PositionInfo(FenUtility.StartPositionFEN);
    cachedInCheckValue = false;
    hasCachedInCheckValue = false;

    constructor() {
        this.Square = new Array(64).fill(0);
        this.RepetitionPositionHistory = new StackList();
    }

    makeMove(move = new Move(), inSearch = false)
    {
        // Get info about move
        let startSquare = move.StartSquare;
        let targetSquare = move.TargetSquare;
        let moveFlag = move.MoveFlag;
        let isPromotion = move.IsPromotion();
        let isEnPassant = moveFlag == Move.EnPassantCaptureFlag;
    
        let movedPiece = this.Square[startSquare];
        let movedPieceType = Piece.pieceType(movedPiece);
        let capturedPiece = isEnPassant ? Piece.makePiece(Piece.Pawn, this.OpponentColour) : this.Square[targetSquare];
        let capturedPieceType = Piece.pieceType(capturedPiece);
    
        let prevCastleState = this.CurrentGameState.castlingRights;
        let prevEnPassantFile = this.CurrentGameState.enPassantFile;
        let newZobristKey = this.CurrentGameState.zobristKey;
        let newCastlingRights = this.CurrentGameState.castlingRights;
        let newEnPassantFile = 0;
    
        // Update bitboard of moved piece (pawn promotion is a special case and is corrected later)
        this.movePiece(movedPiece, startSquare, targetSquare);
    
        // Handle captures
        if (capturedPieceType != Piece.None)
        {
            let captureSquare = targetSquare;
    
            if (isEnPassant)
            {
                captureSquare = targetSquare + (this.IsWhiteToMove ? -8 : 8);
                this.Square[captureSquare] = Piece.None;
            }
            if (capturedPieceType != Piece.Pawn)
            {
                this.TotalPieceCountWithoutPawnsAndKings--;
            }
    
            // Remove captured piece from bitboards/piece list
            this.allPieceLists[capturedPiece].removePieceAtSquare(captureSquare);
            this.PieceBitboards[capturedPiece] = BitBoardUtility.ToggleSquare(this.PieceBitboards[capturedPiece], captureSquare);
            this.ColourBitboards[this.OpponentColourIndex] = BitBoardUtility.ToggleSquare(this.ColourBitboards[this.OpponentColourIndex], captureSquare);

            newZobristKey ^= Zobrist.piecesArray[capturedPiece][captureSquare];
        }
    
        // Handle king
        if (movedPieceType == Piece.King)
        {
            this.KingSquare[this.MoveColourIndex] = targetSquare;
            this.newCastlingRights &= (this.IsWhiteToMove) ? 0b1100 : 0b0011;
    
            // Handle castling
            if (moveFlag == Move.CastleFlag)
            {
                let rookPiece = Piece.makePiece(Piece.Rook, this.MoveColour);
                let kingside = targetSquare == BoardHelper.g1 || targetSquare == BoardHelper.g8;
                let castlingRookFromIndex = (kingside) ? targetSquare + 1 : targetSquare - 2;
                let castlingRookToIndex = (kingside) ? targetSquare - 1 : targetSquare + 1;
    
                // Update rook position
                this.PieceBitboards[rookPiece] = BitBoardUtility.ToggleSquares(this.PieceBitboards[rookPiece], castlingRookFromIndex, castlingRookToIndex);
                this.ColourBitboards[this.MoveColourIndex] = BitBoardUtility.ToggleSquares(this.ColourBitboards[this.MoveColourIndex], castlingRookFromIndex, castlingRookToIndex);
                this.allPieceLists[rookPiece].movePiece(castlingRookFromIndex, castlingRookToIndex);
                this.Square[castlingRookFromIndex] = Piece.None;
                this.Square[castlingRookToIndex] = Piece.Rook | this.MoveColour;
    
                newZobristKey ^= Zobrist.piecesArray[rookPiece][castlingRookFromIndex];
                newZobristKey ^= Zobrist.piecesArray[rookPiece][castlingRookToIndex];
            }
        }
    
        // Handle promotion
        if (isPromotion)
        {
            this.TotalPieceCountWithoutPawnsAndKings++;
            let promotionPieceType;
            switch (moveFlag) {
                case Move.PromoteToQueenFlag:
                    promotionPieceType = Piece.Queen;
                    break;
                case Move.PromoteToRookFlag:
                    promotionPieceType = Piece.Rook;
                    break;
                case Move.PromoteToKnightFlag:
                    promotionPieceType = Piece.Knight;
                    break;
                case Move.PromoteToBishopFlag:
                    promotionPieceType = Piece.Bishop;
                    break;
                default:
                    promotionPieceType = 0;
                    break;
            }
    
            let promotionPiece = Piece.makePiece(promotionPieceType, this.MoveColour);
    
            // Remove pawn from promotion square and add promoted piece instead

            // TODO: Fix ref instead of this.PB[]
            this.PieceBitboards[movedPiece] = BitBoardUtility.ToggleSquare(this.PieceBitboards[movedPiece], targetSquare);
            this.PieceBitboards[promotionPiece] = BitBoardUtility.ToggleSquare(this.PieceBitboards[promotionPiece], targetSquare);

            this.allPieceLists[movedPiece].removePieceAtSquare(targetSquare);
            this.allPieceLists[promotionPiece].addPieceAtSquare(targetSquare);
            this.Square[targetSquare] = promotionPiece;
        }
    
        // Pawn has moved two forwards, mark file with en-passant flag
        if (moveFlag == Move.PawnTwoUpFlag)
        {
            let file = BoardHelper.FileIndex(startSquare) + 1;
            newEnPassantFile = file;
            newZobristKey ^= Zobrist.enPassantFile[file];
        }
    
        // Update castling rights
        if (prevCastleState != 0)
        {
            // Any piece moving to/from rook square removes castling right for that side
            if (targetSquare == BoardHelper.h1 || startSquare == BoardHelper.h1)
            {
                newCastlingRights &= GameState.ClearWhiteKingsideMask;
            }
            else if (targetSquare == BoardHelper.a1 || startSquare == BoardHelper.a1)
            {
                newCastlingRights &= GameState.ClearWhiteQueensideMask;
            }
            if (targetSquare == BoardHelper.h8 || startSquare == BoardHelper.h8)
            {
                newCastlingRights &= GameState.ClearBlackKingsideMask;
            }
            else if (targetSquare == BoardHelper.a8 || startSquare == BoardHelper.a8)
            {
                newCastlingRights &= GameState.ClearBlackQueensideMask;
            }
        }
    
        // Update zobrist key with new piece position and side to move
        newZobristKey ^= Zobrist.sideToMove;
        newZobristKey ^= Zobrist.piecesArray[movedPiece][startSquare];
        newZobristKey ^= Zobrist.piecesArray[this.Square[targetSquare]][targetSquare];
        newZobristKey ^= Zobrist.enPassantFile[prevEnPassantFile];
    
        if (newCastlingRights != prevCastleState)
        {
            newZobristKey ^= Zobrist.castlingRights[prevCastleState]; // remove old castling rights state
            newZobristKey ^= Zobrist.castlingRights[newCastlingRights]; // add new castling rights state
        }
    
        // Change side to move
        this.IsWhiteToMove = !this.IsWhiteToMove;
    
        this.PlyCount++;
        let newFiftyMoveCounter = this.CurrentGameState.fiftyMoveCounter + 1;
    
        // Update extra bitboards
        this.AllPiecesBitboard = this.ColourBitboards[Board.WhiteIndex] | this.ColourBitboards[Board.BlackIndex];
        this.updateSliderBitboards();
    
        // Pawn moves and captures reset the fifty move counter and clear 3-fold repetition history
        if (movedPieceType == Piece.Pawn || capturedPieceType != Piece.None)
        {
            if (!inSearch)
            {
                this.RepetitionPositionHistory.clear();
            }
            newFiftyMoveCounter = 0;
        }
    
        let newState = new GameState(capturedPieceType, newEnPassantFile, newCastlingRights, newFiftyMoveCounter, newZobristKey);
        this.gameStateHistory.push(newState);
        this.CurrentGameState = newState;
        this.hasCachedInCheckValue = false;
    
        if (!inSearch)
        {
            this.RepetitionPositionHistory.push(newState.zobristKey);
            this.AllGameMoves.push(move);
        }
    }

    
    unmakeMove(move = new Move(), inSearch = false) {
        // Swap colour to move
        this.IsWhiteToMove = !this.IsWhiteToMove;

        let undoingWhiteMove = this.IsWhiteToMove;

        // Get move info
        let movedFrom = move.StartSquare;
        let movedTo = move.TargetSquare;
        let moveFlag = move.MoveFlag;

        let undoingEnPassant = moveFlag === Move.EnPassantCaptureFlag;
        let undoingPromotion = move.IsPromotion();
        let undoingCapture = this.CurrentGameState.capturedPieceType !== Piece.None;

        let movedPiece = undoingPromotion ? Piece.makePiece(Piece.Pawn, this.MoveColour) : this.Square[movedTo];
        let movedPieceType = Piece.pieceType(movedPiece);
        let capturedPieceType = this.CurrentGameState.capturedPieceType;

        // If undoing promotion, then remove piece from promotion square and replace with pawn
        if (undoingPromotion) {
            let promotedPiece = this.Square[movedTo];
            let pawnPiece = Piece.makePiece(Piece.Pawn, this.MoveColour);
            this.TotalPieceCountWithoutPawnsAndKings--;

            this.allPieceLists[promotedPiece].removePieceAtSquare(movedTo);
            this.allPieceLists[movedPiece].addPieceAtSquare(movedTo);
            this.PieceBitboards[promotedPiece] = BitBoardUtility.ToggleSquare(this.PieceBitboards[promotedPiece], movedTo);
            this.PieceBitboards[pawnPiece] = BitBoardUtility.ToggleSquare(this.PieceBitboards[pawnPiece], movedTo);
        }

        this.movePiece(movedPiece, movedTo, movedFrom);

        // Undo capture
        if (undoingCapture) {
            let captureSquare = movedTo;
            let capturedPiece = Piece.makePiece(capturedPieceType, this.OpponentColour);

            if (undoingEnPassant) {
                captureSquare = movedTo + (undoingWhiteMove ? -8 : 8);
            }
            if (capturedPieceType !== Piece.Pawn) {
                this.TotalPieceCountWithoutPawnsAndKings++;
            }

            // Add back captured piece
            this.PieceBitboards[capturedPiece] = BitBoardUtility.ToggleSquare(this.PieceBitboards[capturedPiece], captureSquare);
            this.ColourBitboards[this.OpponentColourIndex] = BitBoardUtility.ToggleSquare(this.ColourBitboards[this.OpponentColourIndex], captureSquare);
            this.allPieceLists[capturedPiece].addPieceAtSquare(captureSquare);
            this.Square[captureSquare] = capturedPiece;
        }

        // Update king
        if (movedPieceType === Piece.King) {
            this.KingSquare[this.MoveColourIndex] = movedFrom;

            // Undo castling
            if (moveFlag === Move.CastleFlag) {
                let rookPiece = Piece.makePiece(Piece.Rook, this.MoveColour);
                let kingside = movedTo === BoardHelper.g1 || movedTo === BoardHelper.g8;
                let rookSquareBeforeCastling = kingside ? movedTo + 1 : movedTo - 2;
                let rookSquareAfterCastling = kingside ? movedTo - 1 : movedTo + 1;

                // Undo castling by returning rook to original square
                this.PieceBitboards[rookPiece] = BitBoardUtility.ToggleSquares(this.PieceBitboards[rookPiece], rookSquareAfterCastling, rookSquareBeforeCastling);
                this.ColourBitboards[this.MoveColourIndex] = BitBoardUtility.ToggleSquares(this.ColourBitboards[this.MoveColourIndex], rookSquareAfterCastling, rookSquareBeforeCastling);
                this.Square[rookSquareAfterCastling] = Piece.None;
                this.Square[rookSquareBeforeCastling] = rookPiece;
                this.allPieceLists[rookPiece].movePiece(rookSquareAfterCastling, rookSquareBeforeCastling);
            }
        }

        this.AllPiecesBitboard = this.ColourBitboards[Board.WhiteIndex] | this.ColourBitboards[Board.BlackIndex];
        this.updateSliderBitboards();

        if (!inSearch && this.RepetitionPositionHistory.length > 0) {
            this.RepetitionPositionHistory.pop();
        }
        if (!inSearch) {
            this.AllGameMoves.pop();
        }

        // Go back to previous state
        this.gameStateHistory.pop();
        this.CurrentGameState = this.gameStateHistory[this.gameStateHistory.length - 1];
        this.PlyCount--;
        this.hasCachedInCheckValue = false;
    }

    makeNullMove() {
        this.IsWhiteToMove = !this.IsWhiteToMove;
        this.PlyCount++;

        let newZobristKey = this.CurrentGameState.zobristKey;
        newZobristKey ^= Zobrist.sideToMove;
        newZobristKey ^= Zobrist.enPassantFile[this.CurrentGameState.enPassantFile];

        let newState = new GameState(Piece.None, 0, this.CurrentGameState.castlingRights, this.CurrentGameState.fiftyMoveCounter + 1, newZobristKey);
        this.CurrentGameState = newState;
        this.gameStateHistory.push(this.CurrentGameState);
        this.updateSliderBitboards();
        this.hasCachedInCheckValue = true;
        this.cachedInCheckValue = false;
    }

    unmakeNullMove() {
        this.IsWhiteToMove = !this.IsWhiteToMove;
        this.PlyCount--;
        this.gameStateHistory.pop();
        this.CurrentGameState = this.gameStateHistory[this.gameStateHistory.length - 1];
        this.updateSliderBitboards();
        this.hasCachedInCheckValue = true;
        this.cachedInCheckValue = false;
    }

    // Is current player in check?
    // Note: caches check value so calling multiple times does not require recalculating
    isInCheck() {
        if (this.hasCachedInCheckValue) {
            return this.cachedInCheckValue;
        }
        this.cachedInCheckValue = this.calculateInCheckState();
        this.hasCachedInCheckValue = true;

        return this.cachedInCheckValue;
    }

    // Update piece lists / bitboards based on given move info.
    // Note that this does not account for the following things, which must be handled separately:
    // 1. Removal of a captured piece
    // 2. Movement of rook when castling
    // 3. Removal of pawn from 1st/8th rank during pawn promotion
    // 4. Addition of promoted piece during pawn promotion
    movePiece(piece, startSquare, targetSquare) {
        this.PieceBitboards[piece] = BitBoardUtility.ToggleSquares(this.PieceBitboards[piece], startSquare, targetSquare);
        this.ColourBitboards[this.MoveColourIndex] = BitBoardUtility.ToggleSquares(this.ColourBitboards[this.MoveColourIndex], startSquare, targetSquare);

        this.allPieceLists[piece].movePiece(startSquare, targetSquare);
        this.Square[startSquare] = Piece.None;
        this.Square[targetSquare] = piece;
    }

    updateSliderBitboards() {
        let friendlyRook = Piece.makePiece(Piece.Rook, this.MoveColour);
        let friendlyQueen = Piece.makePiece(Piece.Queen, this.MoveColour);
        let friendlyBishop = Piece.makePiece(Piece.Bishop, this.MoveColour);
        this.FriendlyOrthogonalSliders = this.PieceBitboards[friendlyRook] | this.PieceBitboards[friendlyQueen];
        this.FriendlyDiagonalSliders = this.PieceBitboards[friendlyBishop] | this.PieceBitboards[friendlyQueen];

        let enemyRook = Piece.makePiece(Piece.Rook, this.OpponentColour);
        let enemyQueen = Piece.makePiece(Piece.Queen, this.OpponentColour);
        let enemyBishop = Piece.makePiece(Piece.Bishop, this.OpponentColour);
        this.EnemyOrthogonalSliders = this.PieceBitboards[enemyRook] | this.PieceBitboards[enemyQueen];
        this.EnemyDiagonalSliders = this.PieceBitboards[enemyBishop] | this.PieceBitboards[enemyQueen];
    }

    calculateInCheckState() {
        let kingSquare = this.KingSquare[this.MoveColourIndex];
        let blockers = this.AllPiecesBitboard;

        if (this.EnemyOrthogonalSliders !== 0n) {
            let rookAttacks = Magic.GetRookAttacks(kingSquare, blockers);
            if ((rookAttacks & this.EnemyOrthogonalSliders) !== 0n) {
                return true;
            }
        }
        if (this.EnemyDiagonalSliders !== 0n) {
            let bishopAttacks = Magic.GetBishopAttacks(kingSquare, blockers);
            if ((bishopAttacks & this.EnemyDiagonalSliders) !== 0n) {
                return true;
            }
        }

        let enemyKnights = this.PieceBitboards[Piece.makePiece(Piece.Knight, this.opponentColour)];
        if ((BitBoardUtility.KnightAttacks[kingSquare] & enemyKnights) !== 0n) {
            return true;
        }

        let enemyPawns = this.PieceBitboards[Piece.makePiece(Piece.Pawn, this.opponentColour)];
        let pawnAttackMask = this.IsWhiteToMove ? BitBoardUtility.WhitePawnAttacks[kingSquare] : BitBoardUtility.BlackPawnAttacks[kingSquare];
        if ((pawnAttackMask & enemyPawns) !== 0n) {
            return true;
        }

        return false;
    }

    loadStartPosition() {
        this.loadPosition(FenUtility.StartPositionFEN);
    }

    loadPosition(fen) {
        let posInfo = FenUtility.positionFromFen(fen);
        this.loadPositionFromInfo(posInfo);
    }

    loadPositionFromInfo(posInfo) {
        this.StartPositionInfo = posInfo;
        this.initialize();

        // Load pieces into board array and piece lists
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            let piece = posInfo.squares[squareIndex];
            let pieceType = Piece.pieceType(piece);
            let colourIndex = Piece.isWhite(piece) ? Board.WhiteIndex : Board.BlackIndex;
            this.Square[squareIndex] = piece;

            if (piece !== Piece.None) {
                this.PieceBitboards[piece] = BitBoardUtility.SetSquare(this.PieceBitboards[piece], squareIndex);
                this.ColourBitboards[colourIndex] = BitBoardUtility.SetSquare(this.ColourBitboards[colourIndex], squareIndex);

                if (pieceType === Piece.King) {
                    this.KingSquare[colourIndex] = squareIndex;
                } else {
                    this.allPieceLists[piece].addPieceAtSquare(squareIndex);
                }
                this.TotalPieceCountWithoutPawnsAndKings += (pieceType === Piece.Pawn || pieceType === Piece.King) ? 0 : 1;
            }
        }

        // Side to move
        this.IsWhiteToMove = posInfo.whiteToMove;

        // Set extra bitboards
        this.AllPiecesBitboard = this.ColourBitboards[Board.WhiteIndex] | this.ColourBitboards[Board.BlackIndex];
        this.updateSliderBitboards();

        // Create gamestate
        let whiteCastle = ((posInfo.whiteCastleKingside) ? 1 << 0 : 0) | ((posInfo.whiteCastleQueenside) ? 1 << 1 : 0);
        let blackCastle = ((posInfo.blackCastleKingside) ? 1 << 2 : 0) | ((posInfo.blackCastleQueenside) ? 1 << 3 : 0);
        let castlingRights = whiteCastle | blackCastle;

        this.PlyCount = (posInfo.moveCount - 1) * 2 + (this.IsWhiteToMove ? 0 : 1);

        // Set game state (note: calculating zobrist key relies on current game state)
        this.CurrentGameState = new GameState(Piece.None, posInfo.epFile, castlingRights, posInfo.fiftyMovePlyCount, 0n);
        let zobristKey = Zobrist.calculateZobristKey(this);
        this.CurrentGameState = new GameState(Piece.None, posInfo.epFile, castlingRights, posInfo.fiftyMovePlyCount, zobristKey);

        this.RepetitionPositionHistory.push(zobristKey);

        this.gameStateHistory.push(this.CurrentGameState);
    }

    
    initialize() 
    {
        this.AllGameMoves = [];
        this.KingSquare = [0, 0];
    
        // TODO: Check for error
        this.Square.fill(0);
    
        this.RepetitionPositionHistory = new StackList();
        this.gameStateHistory = [];
    
        this.CurrentGameState = new GameState();
        this.PlyCount = 0;
    
        this.Knights = [new PieceList(10), new PieceList(10)];
        this.Pawns = [new PieceList(8), new PieceList(8)];
        this.Rooks = [new PieceList(10), new PieceList(10)];
        this.Bishops = [new PieceList(10), new PieceList(10)];
        this.Queens = [new PieceList(9), new PieceList(9)];
    
        this.allPieceLists = new Array(Piece.MaxPieceIndex + 1);
        this.allPieceLists[Piece.WhitePawn] = this.Pawns[Board.WhiteIndex];
        this.allPieceLists[Piece.WhiteKnight] = this.Knights[Board.WhiteIndex];
        this.allPieceLists[Piece.WhiteBishop] = this.Bishops[Board.WhiteIndex];
        this.allPieceLists[Piece.WhiteRook] = this.Rooks[Board.WhiteIndex];
        this.allPieceLists[Piece.WhiteQueen] = this.Queens[Board.WhiteIndex];
        this.allPieceLists[Piece.WhiteKing] = new PieceList(1);
    
        this.allPieceLists[Piece.BlackPawn] = this.Pawns[Board.BlackIndex];
        this.allPieceLists[Piece.BlackKnight] = this.Knights[Board.BlackIndex];
        this.allPieceLists[Piece.BlackBishop] = this.Bishops[Board.BlackIndex];
        this.allPieceLists[Piece.BlackRook] = this.Rooks[Board.BlackIndex];
        this.allPieceLists[Piece.BlackQueen] = this.Queens[Board.BlackIndex];
        this.allPieceLists[Piece.BlackKing] = new PieceList(1);

        this.TotalPieceCountWithoutPawnsAndKings = 0;
    
        // Initialize bitboards
        this.PieceBitboards = new Array(Piece.MaxPieceIndex + 1).fill(0n);
        this.ColourBitboards = [0n, 0n];
        this.AllPiecesBitboard = 0n;
    }

    toString() {
        return BoardHelper.CreateDiagram(this, this.IsWhiteToMove);
    }

    static createBoard(fen = FenUtility.StartPositionFEN) {
        let board = new Board();
        board.loadPosition(fen);
        return board;
    }

    static createBoardFromSource(source = new Board()) {
        let board = new Board();
        if(source.PlyCount > 0)
        {
            board.loadPosition(source.StartPositionInfo.fen);
    
            for (let i = 0; i < source.AllGameMoves.length; i++) {
                board.makeMove(source.AllGameMoves[i]);
            }
        }else{
            board.loadStartPosition();
        }
        return board;
    }
}
