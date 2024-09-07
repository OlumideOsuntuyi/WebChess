// Piece Class
class Piece
{
    static None = 0;
    static Pawn = 1;
    static Knight = 2;
    static Bishop = 3;
    static Rook = 4;
    static Queen = 5;
    static King = 6;

    // Piece Colours
    static White = 0;
    static Black = 8;

    // Pieces
    static WhitePawn = Piece.Pawn | Piece.White; // 1
    static WhiteKnight = Piece.Knight | Piece.White; // 2
    static WhiteBishop = Piece.Bishop | Piece.White; // 3
    static WhiteRook = Piece.Rook | Piece.White; // 4
    static WhiteQueen = Piece.Queen | Piece.White; // 5
    static WhiteKing = Piece.King | Piece.White; // 6

    static BlackPawn = Piece.Pawn | Piece.Black; // 9
    static BlackKnight = Piece.Knight | Piece.Black; // 10
    static BlackBishop = Piece.Bishop | Piece.Black; // 11
    static BlackRook = Piece.Rook | Piece.Black; // 12
    static BlackQueen = Piece.Queen | Piece.Black; // 13
    static BlackKing = Piece.King | Piece.Black; // 14

    static MaxPieceIndex = Piece.BlackKing;

    static PieceIndices = [
        Piece.WhitePawn, Piece.WhiteKnight, Piece.WhiteBishop, Piece.WhiteRook, Piece.WhiteQueen, Piece.WhiteKing,
        Piece.BlackPawn, Piece.BlackKnight, Piece.BlackBishop, Piece.BlackRook, Piece.BlackQueen, Piece.BlackKing
    ];

    static typeMask = 0b0111;
    static colourMask = 0b1000;

    static makePiece(pieceType, pieceColourOrIsWhite) {
        let pieceColour = typeof pieceColourOrIsWhite === 'boolean' 
            ? (pieceColourOrIsWhite ? this.White : this.Black) 
            : pieceColourOrIsWhite;
        return pieceType | pieceColour;
    }

    static pieceType(piece)
    {
        return piece & Piece.typeMask;
    }

    static pieceColor(piece)
    {
        return piece & Piece.colourMask;
    }

    static isColour(piece, colour)
    {
        return (piece & Piece.colourMask) == colour && piece != 0;
    }

    static isWhite(piece)
    {
        return Piece.isColour(piece, Piece.White);
    }

    static isOrthagonalSlider(piece)
    {
        const p = PieceType(piece);
        return p == Piece.Queen || p == Piece.Rook;
    }

    static isDiagonalSlider(piece)
    {
        const p = PieceType(piece);
        return p == Piece.Queen || p == Piece.Bishop;
    }

    static pieceValue(piece)
    {
        const type = Piece.pieceType(piece);
        return type == Piece.Pawn ? 1 :
            type == Piece.Knight ? 3 :
            type == Piece.Bishop ? 3 :
            type == Piece.Rook ? 5 :
            type == Piece.Queen ? 9 :
            type == Piece.King ? 99999 : 0;
    }

    static getSymbol(piece) 
    {
        const type = Piece.pieceType(piece);
        const isWhite = Piece.isWhite(piece);
        let symbolStr = type == Piece.Pawn ? 'P' :
            type == Piece.Knight ? 'N' :
            type == Piece.Bishop ? 'B' :
            type == Piece.Rook ? 'R' :
            type == Piece.Queen ? 'Q' :
            type == Piece.King ? 'K': '';

        let symbol = symbolStr || ' ';
        return isWhite ? symbol : symbol.toLowerCase();
    }
}


class PieceList
{
    constructor(maxPieceCount)
    {
        this.occupiedSquares = new Array(maxPieceCount).fill(0);
        this.map = new Array(64).fill(0);
        this.numPieces = 0;
    }

    get maxCount()
    {
        return numPieces;
    }

    //square = int

    addPieceAtSquare(square)
    {
        this.occupiedSquares[this.numPieces] = square;
        this.map[square] = this.numPieces;
        this.numPieces++;
    }

    removePieceAtSquare(square)
    {
        const pieceIndex = this.map[square]; // get the index of this element in the occupiedSquares array
        this.occupiedSquares[pieceIndex] = this.occupiedSquares[this.numPieces - 1]; // move last element in array to the place of the removed element
        this.map[this.occupiedSquares[pieceIndex]] = pieceIndex; // update map to point to the moved element's new location in the array
        this.numPieces--;
    }

    movePiece(startSquare, targetSquare)
    {
        const pieceIndex = this.map[startSquare]; // get the index of this element in the occupiedSquares array
        this.occupiedSquares[pieceIndex] = targetSquare;
        this.map[targetSquare] = pieceIndex;
    }

    get(index)
    {
        this.occupiedSquares[index];
    }

}
