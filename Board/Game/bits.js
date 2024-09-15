class Coord {
    constructor(fileIndex, rankIndex) {
        if (typeof rankIndex === 'undefined') {
            // If only one argument is provided, assume it's squareIndex
            this.fileIndex = BoardHelper.FileIndex(fileIndex);
            this.rankIndex = BoardHelper.RankIndex(fileIndex);
        }else if(typeof rankIndex === 'undefined' && typeof fileIndex === 'undefined')
        {
            this.fileIndex = 0;
            this.rankIndex = 0;
        }
         else {
            this.fileIndex = fileIndex;
            this.rankIndex = rankIndex;
        }
    }

    isLightSquare() {
        return (this.fileIndex + this.rankIndex) % 2 !== 0;
    }

    compareTo(other) {
        return (this.fileIndex === other.fileIndex && this.rankIndex === other.rankIndex) ? 0 : 1;
    }

    equals(other) {
        return this.fileIndex === other.fileIndex && this.rankIndex === other.rankIndex;
    }

    get hashCode() {
        return `${this.fileIndex},${this.rankIndex}`.hashCode();
    }

    add(b) {
        return new Coord(this.fileIndex + b.fileIndex, this.rankIndex + b.rankIndex);
    }

    subtract(b) {
        return new Coord(this.fileIndex - b.fileIndex, this.rankIndex - b.rankIndex);
    }

    multiply(m) {
        return new Coord(this.fileIndex * m, this.rankIndex * m);
    }

    static multiplyScalar(m, a) {
        return Coord.multiply(a, m);
    }

    static equals(a, b) {
        return a.fileIndex === b.fileIndex && a.rankIndex === b.rankIndex;
    }

    static notEquals(a, b) {
        return !Coord.equals(a, b);
    }

    isValidSquare() {
        return this.fileIndex >= 0 && this.fileIndex < 8 && this.rankIndex >= 0 && this.rankIndex < 8;
    }

    get squareIndex() {
        return this.rankIndex * 8 + this.fileIndex;
    }
}

class BoardHelper {
    static RookDirections = [new Coord(-1, 0), new Coord(1, 0), new Coord(0, 1), new Coord(0, -1)];
    static BishopDirections = [new Coord(-1, 1), new Coord(1, 1), new Coord(1, -1), new Coord(-1, -1)];

    static fileNames = "abcdefgh";
    static rankNames = "12345678";

    static a1 = 0;
    static b1 = 1;
    static c1 = 2;
    static d1 = 3;
    static e1 = 4;
    static f1 = 5;
    static g1 = 6;
    static h1 = 7;

    static a8 = 56;
    static b8 = 57;
    static c8 = 58;
    static d8 = 59;
    static e8 = 60;
    static f8 = 61;
    static g8 = 62;
    static h8 = 63;

    static RankIndex(squareIndex) {
        return squareIndex >> 3;
    }

    static FileIndex(squareIndex) {
        return squareIndex & 0b000111;
    }

    static IndexFromCoordIndices(fileIndex, rankIndex) {
        return rankIndex * 8 + fileIndex;
    }

    static IndexFromCoord(coord) {
        return coord.rankIndex * 8 + coord.fileIndex;
    }

    static CoordFromIndex(squareIndex) {
        return new Coord(BoardHelper.FileIndex(squareIndex), BoardHelper.RankIndex(squareIndex));
    }

    static LightSquare(fileIndex, rankIndex) {
        if(typeof rankIndex == 'undefined')
        {
            return (BoardHelper.FileIndex(squareIndex) + BoardHelper.RankIndex(squareIndex)) & 2 !== 0;
        }

        return (fileIndex + rankIndex) % 2 !== 0;
    }

    static LightSquare(squareIndex) {
    }

    static SquareNameFromCoordinate(fileIndex, rankIndex) {
        return BoardHelper.fileNames[fileIndex] + (rankIndex + 1);
    }

    static SquareNameFromIndex(squareIndex) {
        return BoardHelper.SquareNameFromCoords(BoardHelper.CoordFromIndex(squareIndex));
    }

    static SquareNameFromCoords(coord) {
        return BoardHelper.SquareNameFromCoordinate(coord.fileIndex, coord.rankIndex);
    }

    static SquareIndexFromName(name) {
        let fileName = name[0];
        let rankName = name[1];
        let fileIndex = BoardHelper.fileNames.indexOf(fileName);
        let rankIndex = BoardHelper.rankNames.indexOf(rankName);
        return BoardHelper.IndexFromCoordIndices(fileIndex, rankIndex);
    }

    static IsValidCoordinate(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    static IsValidSquare(coord = new Coord())
    {
        return coord.isValidSquare();
    }

    static CreateDiagram(board, blackAtTop = true, includeFen = true, includeZobristKey = true) {
        let result = [];
        let lastMoveSquare = board.AllGameMoves.length > 0 ? board.AllGameMoves[board.AllGameMoves.length - 1].TargetSquare : -1;

        for (let y = 0; y < 8; y++) {
            let rankIndex = blackAtTop ? 7 - y : y;
            result.push("+---+---+---+---+---+---+---+---+");

            for (let x = 0; x < 8; x++) {
                let fileIndex = blackAtTop ? x : 7 - x;
                let squareIndex = BoardHelper.IndexFromCoordIndices(fileIndex, rankIndex);
                let highlight = squareIndex === lastMoveSquare;
                let piece = board.Square[squareIndex];
                if (highlight) {
                    result.push(`|(${Piece.GetSymbol(piece)})`);
                } else {
                    result.push(`| ${Piece.GetSymbol(piece)} `);
                }
            }
            result.push("|");
        }
        result.push("+---+---+---+---+---+---+---+---+");
        return result.join('\n');
    }
}


class BitOperations
{
    static TrailingZeroCount(value)
    {
        if (value == 0)
            return 64; // No set bits, so return the bit width

        const count = 0;
        while ((value & 1) == 0)
        {
            count++;
            value >>= 1;
        }
        return count;
    }
}

class BitBoardUtility 
{
    static FileA = 0x101010101010101n;

    static Rank1 = 0b11111111n;
    static Rank2 = BitBoardUtility.Rank1 << 8n;
    static Rank3 = BitBoardUtility.Rank2 << 8n;
    static Rank4 = BitBoardUtility.Rank3 << 8n;
    static Rank5 = BitBoardUtility.Rank4 << 8n;
    static Rank6 = BitBoardUtility.Rank5 << 8n;
    static Rank7 = BitBoardUtility.Rank6 << 8n;
    static Rank8 = BitBoardUtility.Rank7 << 8n;

    static notAFile = ~BitBoardUtility.FileA;
    static notHFile = ~(BitBoardUtility.FileA << 7n);

    static KnightAttacks = new Array(64).fill(0n);
    static KingMoves = new Array(64).fill(0n);
    static WhitePawnAttacks = new Array(64).fill(0n);
    static BlackPawnAttacks = new Array(64).fill(0n);

    static {
        const orthoDir = [{ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
        const diagDir = [{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }];
        const knightJumps = [
            { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 }, { x: 1, y: 2 },
            { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 }, { x: -1, y: -2 }
        ];

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                processSquare(x, y);
            }
        }

        function processSquare(x, y) {
            const squareIndex = y * 8 + x;

            for (let dirIndex = 0; dirIndex < 4; dirIndex++) {
                // Orthogonal and diagonal directions
                for (let dst = 1; dst < 8; dst++) {
                    const orthoX = x + orthoDir[dirIndex].x * dst;
                    const orthoY = y + orthoDir[dirIndex].y * dst;
                    const diagX = x + diagDir[dirIndex].x * dst;
                    const diagY = y + diagDir[dirIndex].y * dst;

                    if (validSquareIndex(orthoX, orthoY)) {
                        const orthoTargetIndex = orthoY * 8 + orthoX;
                        if (dst === 1) {
                            BitBoardUtility.KingMoves[squareIndex] |= 1n << BigInt(orthoTargetIndex);
                        }
                    }

                    if (validSquareIndex(diagX, diagY)) {
                        const diagTargetIndex = diagY * 8 + diagX;
                        if (dst === 1) {
                            BitBoardUtility.KingMoves[squareIndex] |= 1n << BigInt(diagTargetIndex);
                        }
                    }
                }

                // Knight jumps
                for (let i = 0; i < knightJumps.length; i++) {
                    const knightX = x + knightJumps[i].x;
                    const knightY = y + knightJumps[i].y;
                    if (validSquareIndex(knightX, knightY)) {
                        const knightTargetSquare = knightY * 8 + knightX;
                        BitBoardUtility.KnightAttacks[squareIndex] |= 1n << BigInt(knightTargetSquare);
                    }
                }

                // Pawn attacks
                if (validSquareIndex(x + 1, y + 1)) {
                    const whitePawnRight = (y + 1) * 8 + (x + 1);
                    BitBoardUtility.WhitePawnAttacks[squareIndex] |= 1n << BigInt(whitePawnRight);
                }
                if (validSquareIndex(x - 1, y + 1)) {
                    const whitePawnLeft = (y + 1) * 8 + (x - 1);
                    BitBoardUtility.WhitePawnAttacks[squareIndex] |= 1n << BigInt(whitePawnLeft);
                }

                if (validSquareIndex(x + 1, y - 1)) {
                    const blackPawnAttackRight = (y - 1) * 8 + (x + 1);
                    BitBoardUtility.BlackPawnAttacks[squareIndex] |= 1n << BigInt(blackPawnAttackRight);
                }
                if (validSquareIndex(x - 1, y - 1)) {
                    const blackPawnAttackLeft = (y - 1) * 8 + (x - 1);
                    BitBoardUtility.BlackPawnAttacks[squareIndex] |= 1n << BigInt(blackPawnAttackLeft);
                }
            }
        }

        function validSquareIndex(x, y) {
            return x >= 0 && x < 8 && y >= 0 && y < 8;
        }
    }

    static trailingZeroCount(value) 
    {
        if (value === 0n) {
            return 64; // No set bits, so return the bit width
        }
    
        let count = 0;
        while ((value & 1n) === 0n) {
            count++;
            value >>= 1n;
        }
        return count;
    }
    
    static PopLSB(reference) 
    {
        let i = BitBoardUtility.trailingZeroCount(reference.value);
        reference.value &= (reference.value - 1n);
        return i;
    }

    static SetSquare(bitboard = 0n, squareIndex) {
        return bitboard | (1n << BigInt(squareIndex));
    }

    static ClearSquare(bitboard = 0n, squareIndex) {
        return bitboard & ~(1n << BigInt(squareIndex));
    }

    static ToggleSquare(bitboard = 0n, squareIndex) {
        return bitboard ^ (1n << BigInt(squareIndex));
    }

    static ToggleSquares(bitboard = 0n, squareA, squareB) {
        return bitboard ^ ((1n << BigInt(squareA)) | (1n << BigInt(squareB)));
    }

    static ContainsSquare(bitboard = 0n, square) {
        return ((bitboard >> BigInt(square)) & 1n) !== 0n;
    }

    static PawnAttacks(pawnBitboard, isWhite) {
        if (isWhite) {
            return ((pawnBitboard << 9n) & BitBoardUtility.notAFile) | ((pawnBitboard << 7n) & BitBoardUtility.notHFile);
        }
        return ((pawnBitboard >> 7n) & BitBoardUtility.notAFile) | ((pawnBitboard >> 9n) & BitBoardUtility.notHFile);
    }

    static Shift(bitboard, numSquaresToShift) {
        if (numSquaresToShift > 0) {
            return bitboard << BigInt(numSquaresToShift);
        } else {
            return bitboard >> BigInt(-numSquaresToShift);
        }
    }
}

class PositionInfo {
    constructor(fen = "") {
        this.fen = fen;
        this.squares = new Array(64).fill(0);
        const sections = fen.split(" ");

        let file = 0;
        let rank = 7;

        for (const symbol of sections[0]) {
            if (symbol === '/') {
                file = 0;
                rank--;
            } else {
                if (/\d/.test(symbol)) {
                    file += parseInt(symbol, 10);
                } else {
                    const pieceColour = (symbol === symbol.toUpperCase()) ? Piece.White : Piece.Black;
                    const pieceType = {
                        'k': Piece.King,
                        'p': Piece.Pawn,
                        'n': Piece.Knight,
                        'b': Piece.Bishop,
                        'r': Piece.Rook,
                        'q': Piece.Queen
                    }[symbol.toLowerCase()] || Piece.None;

                    this.squares[rank * 8 + file] = pieceType | pieceColour;
                    file++;
                }
            }
        }

        this.whiteToMove = (sections[1] === 'w');

        const castlingRights = sections[2];
        this.whiteCastleKingside = castlingRights.includes('K');
        this.whiteCastleQueenside = castlingRights.includes('Q');
        this.blackCastleKingside = castlingRights.includes('k');
        this.blackCastleQueenside = castlingRights.includes('q');

        // Default values
        this.epFile = 0;
        this.fiftyMovePlyCount = 0;
        this.moveCount = 0;

        if (sections.length > 3) {
            const enPassantFileName = sections[3][0];
            if (BoardHelper.fileNames.includes(enPassantFileName)) {
                this.epFile = BoardHelper.fileNames.indexOf(enPassantFileName) + 1;
            }
        }

        // Half-move clock
        if (sections.length > 4) {
            this.fiftyMovePlyCount = parseInt(sections[4], 10) || 0;
        }
        // Full move number
        if (sections.length > 5) {
            this.moveCount = parseInt(sections[5], 10) || 0;
        }
    }
}

class FenUtility {
    static StartPositionFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // Load position from fen string
    static positionFromFen(fen = this.StartPositionFEN) {
        return new PositionInfo(fen);
    }

    static currentFen(board, alwaysIncludeEPSquare = true) {
        let fen = "";
        for (let rank = 7; rank >= 0; rank--) {
            let numEmptyFiles = 0;
            for (let file = 0; file < 8; file++) {
                let i = rank * 8 + file;
                let piece = board.Square[i];
                if (piece !== 0) {
                    if (numEmptyFiles !== 0) {
                        fen += numEmptyFiles;
                        numEmptyFiles = 0;
                    }
                    let isBlack = Piece.isColour(piece, Piece.Black);
                    let pieceType = Piece.pieceType(piece);
                    let pieceChar = ' ';
                    switch (pieceType) {
                        case Piece.Rook:
                            pieceChar = 'R';
                            break;
                        case Piece.Knight:
                            pieceChar = 'N';
                            break;
                        case Piece.Bishop:
                            pieceChar = 'B';
                            break;
                        case Piece.Queen:
                            pieceChar = 'Q';
                            break;
                        case Piece.King:
                            pieceChar = 'K';
                            break;
                        case Piece.Pawn:
                            pieceChar = 'P';
                            break;
                    }
                    fen += (isBlack) ? pieceChar.toLowerCase() : pieceChar;
                } else {
                    numEmptyFiles++;
                }
            }
            if (numEmptyFiles !== 0) {
                fen += numEmptyFiles;
            }
            if (rank !== 0) {
                fen += '/';
            }
        }

        // Side to move
        fen += ' ';
        fen += (board.IsWhiteToMove) ? 'w' : 'b';

        // Castling
        let whiteKingside = (board.CurrentGameState.castlingRights & 1) === 1;
        let whiteQueenside = (board.CurrentGameState.castlingRights >> 1 & 1) === 1;
        let blackKingside = (board.CurrentGameState.castlingRights >> 2 & 1) === 1;
        let blackQueenside = (board.CurrentGameState.castlingRights >> 3 & 1) === 1;
        fen += ' ';
        fen += (whiteKingside) ? "K" : "";
        fen += (whiteQueenside) ? "Q" : "";
        fen += (blackKingside) ? "k" : "";
        fen += (blackQueenside) ? "q" : "";
        fen += ((board.CurrentGameState.castlingRights) === 0) ? "-" : "";

        // En-passant
        fen += ' ';
        let epFileIndex = board.CurrentGameState.enPassantFile - 1;
        let epRankIndex = (board.IsWhiteToMove) ? 5 : 2;

        let isEnPassant = epFileIndex !== -1;
        let includeEP = alwaysIncludeEPSquare || FenUtility.enPassantCanBeCaptured(epFileIndex, epRankIndex, board);
        if (isEnPassant && includeEP) {
            fen += BoardHelper.SquareNameFromCoordinate(epFileIndex, epRankIndex);
        } else {
            fen += '-';
        }

        // 50 move counter
        fen += ' ';
        fen += board.CurrentGameState.fiftyMoveCounter;

        // Full-move count (should be one at start, and increase after each move by black)
        fen += ' ';
        fen += Math.floor(board.PlyCount / 2) + 1;

        return fen;
    }

    static enPassantCanBeCaptured(epFileIndex, epRankIndex, board) {
        let captureFromA = new Coord(epFileIndex - 1, epRankIndex + (board.IsWhiteToMove ? -1 : 1));
        let captureFromB = new Coord(epFileIndex + 1, epRankIndex + (board.IsWhiteToMove ? -1 : 1));
        let epCaptureSquare = new Coord(epFileIndex, epRankIndex).SquareIndex;
        let friendlyPawn = Piece.MakePiece(Piece.Pawn, board.MoveColour);

        return FenUtility.CanCapture(board, captureFromA, friendlyPawn, epCaptureSquare) ||
               FenUtility.CanCapture(board, captureFromB, friendlyPawn, epCaptureSquare);
    }

    static canCapture(board, from, friendlyPawn, epCaptureSquare) {
        const isPawnOnSquare = board.Square[from.squareIndex] === friendlyPawn;
        if (from.isValidSquare() && isPawnOnSquare) {
            const move = new Move(from.squareIndex, epCaptureSquare, Move.EnPassantCaptureFlag);
            board.makeMove(move);
            board.makeNullMove();
            const wasLegalMove = !board.calculateInCheckState();

            board.unmakeNullMove();
            board.unmakeMove(move);
            return wasLegalMove;
        }

        return false;
    }

    static flipFen(fen) {
        let flippedFen = "";
        const sections = fen.split(' ');

        const fenRanks = sections[0].split('/');
        for (let i = fenRanks.length - 1; i >= 0; i--) {
            const rank = fenRanks[i];
            for (const c of rank) {
                flippedFen += FenUtility.invertCase(c);
            }
            if (i !== 0) {
                flippedFen += '/';
            }
        }

        flippedFen += " " + (sections[1][0] === 'w' ? 'b' : 'w');
        const castlingRights = sections[2];
        let flippedRights = "";
        for (const c of "kqKQ") {
            if (castlingRights.includes(c)) {
                flippedRights += FenUtility.invertCase(c);
            }
        }
        flippedFen += " " + (flippedRights.length === 0 ? "-" : flippedRights);

        const ep = sections[3];
        let flippedEp = ep[0];
        if (ep.length > 1) {
            flippedEp += ep[1] === '6' ? '3' : '6';
        }
        flippedFen += " " + flippedEp;
        flippedFen += " " + sections[4] + " " + sections[5];

        return flippedFen;
    }

    static invertCase(c) {
        return c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase();
    }
}

class Random {
    constructor(seed) {
        this.seed = seed;
    }

    nextBytes(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.floor(Math.random() * 256);
        }
    }
}

class Zobrist {
    // Random numbers are generated for each aspect of the game state, and are used for calculating the hash:

    // piece type, colour, square index
    static piecesArray = Array.from({ length: Piece.MaxPieceIndex + 1 }, () => new Array(64).fill(0n));
    // Each player has 4 possible castling right states: none, queenside, kingside, both.
    // So, taking both sides into account, there are 16 possible states.
    static castlingRights = new Array(16).fill(0n);
    // En passant file (0 = no ep).
    // Rank does not need to be specified since side to move is included in key
    static enPassantFile = new Array(9).fill(0n);
    static sideToMove = 0n;

    static {
        const seed = 29426028;
        const rng = new Random(seed);

        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            for (const piece of Piece.PieceIndices) {
                Zobrist.piecesArray[piece][squareIndex] = Zobrist.randomUnsigned64BitNumber(rng);
            }
        }

        for (let i = 0; i < Zobrist.castlingRights.length; i++) {
            Zobrist.castlingRights[i] = Zobrist.randomUnsigned64BitNumber(rng);
        }

        for (let i = 0; i < Zobrist.enPassantFile.length; i++) {
            Zobrist.enPassantFile[i] = i === 0 ? 0n : Zobrist.randomUnsigned64BitNumber(rng);
        }

        Zobrist.sideToMove = Zobrist.randomUnsigned64BitNumber(rng);
    }

    // Calculate zobrist key from current board position.
    // NOTE: this function is slow and should only be used when the board is initially set up from fen.
    // During search, the key should be updated incrementally instead.
    static calculateZobristKey(board) {
        let zobristKey = 0n;

        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            const piece = board.Square[squareIndex];

            if (Piece.pieceType(piece) !== Piece.None) {
                zobristKey ^= Zobrist.piecesArray[piece][squareIndex];
            }
        }

        zobristKey ^= Zobrist.enPassantFile[board.CurrentGameState.enPassantFile];

        if (board.MoveColour === Piece.Black) {
            zobristKey ^= Zobrist.sideToMove;
        }

        zobristKey ^= Zobrist.castlingRights[board.CurrentGameState.castlingRights];

        return zobristKey;
    }

    static randomUnsigned64BitNumber(rng) {
        const buffer = new Uint8Array(8);
        rng.nextBytes(buffer);
        return BigInt.asUintN(64, BigInt('0x' + Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')));
    }
}

class PrecomputedMagics {
    static RookShifts = [
        52, 52, 52, 52, 52, 52, 52, 52, 53, 53, 53, 54, 53, 53, 54, 53, 53, 54, 54, 54, 53, 53, 54, 53, 53, 54, 53, 53, 54, 54, 54, 53, 52, 54, 53, 53, 53, 53, 54, 53, 52, 53, 54, 54, 53, 53, 54, 53, 53, 54, 54, 54, 53, 53, 54, 53, 52, 53, 53, 53, 53, 53, 53, 52
    ];

    static BishopShifts = [
        58, 60, 59, 59, 59, 59, 60, 58, 60, 59, 59, 59, 59, 59, 59, 60, 59, 59, 57, 57, 57, 57, 59, 59, 59, 59, 57, 55, 55, 57, 59, 59, 59, 59, 57, 55, 55, 57, 59, 59, 59, 59, 57, 57, 57, 57, 59, 59, 60, 60, 59, 59, 59, 59, 60, 60, 58, 60, 59, 59, 59, 59, 59, 58
    ];

    static RookMagics = [
        468374916371625120n, 18428729537625841661n, 2531023729696186408n, 6093370314119450896n, 13830552789156493815n, 16134110446239088507n, 12677615322350354425n, 5404321144167858432n, 2111097758984580n, 18428720740584907710n, 17293734603602787839n, 4938760079889530922n, 7699325603589095390n, 9078693890218258431n, 578149610753690728n, 9496543503900033792n, 1155209038552629657n, 9224076274589515780n, 1835781998207181184n, 509120063316431138n, 16634043024132535807n, 18446673631917146111n, 9623686630121410312n, 4648737361302392899n, 738591182849868645n, 1732936432546219272n, 2400543327507449856n, 5188164365601475096n, 10414575345181196316n, 1162492212166789136n, 9396848738060210946n, 622413200109881612n, 7998357718131801918n, 7719627227008073923n, 16181433497662382080n, 18441958655457754079n, 1267153596645440n, 18446726464209379263n, 1214021438038606600n, 4650128814733526084n, 9656144899867951104n, 18444421868610287615n, 3695311799139303489n, 10597006226145476632n, 18436046904206950398n, 18446726472933277663n, 3458977943764860944n, 39125045590687766n, 9227453435446560384n, 6476955465732358656n, 1270314852531077632n, 2882448553461416064n, 11547238928203796481n, 1856618300822323264n, 2573991788166144n, 4936544992551831040n, 13690941749405253631n, 15852669863439351807n, 18302628748190527413n, 12682135449552027479n, 13830554446930287982n, 18302628782487371519n, 7924083509981736956n, 4734295326018586370n
    ];

    static BishopMagics = [
        16509839532542417919n, 14391803910955204223n, 1848771770702627364n, 347925068195328958n, 5189277761285652493n, 3750937732777063343n, 18429848470517967340n, 17870072066711748607n, 16715520087474960373n, 2459353627279607168n, 7061705824611107232n, 8089129053103260512n, 7414579821471224013n, 9520647030890121554n, 17142940634164625405n, 9187037984654475102n, 4933695867036173873n, 3035992416931960321n, 15052160563071165696n, 5876081268917084809n, 1153484746652717320n, 6365855841584713735n, 2463646859659644933n, 1453259901463176960n, 9808859429721908488n, 2829141021535244552n, 576619101540319252n, 5804014844877275314n, 4774660099383771136n, 328785038479458864n, 2360590652863023124n, 569550314443282n, 17563974527758635567n, 11698101887533589556n, 5764964460729992192n, 6953579832080335136n, 1318441160687747328n, 8090717009753444376n, 16751172641200572929n, 5558033503209157252n, 17100156536247493656n, 7899286223048400564n, 4845135427956654145n, 2368485888099072n, 2399033289953272320n, 6976678428284034058n, 3134241565013966284n, 8661609558376259840n, 17275805361393991679n, 15391050065516657151n, 11529206229534274423n, 9876416274250600448n, 16432792402597134585n, 11975705497012863580n, 11457135419348969979n, 9763749252098620046n, 16960553411078512574n, 15563877356819111679n, 14994736884583272463n, 9441297368950544394n, 14537646123432199168n, 9888547162215157388n, 18140215579194907366n, 18374682062228545019n
    ];
}

class Bits {
    static FileA = 0x101010101010101n;

    static WhiteKingsideMask = (1n << BigInt(BoardHelper.f1)) | (1n << BigInt(BoardHelper.g1));
    static BlackKingsideMask = (1n << BigInt(BoardHelper.f8)) | (1n << BigInt(BoardHelper.g8));

    static WhiteQueensideMask2 = (1n << BigInt(BoardHelper.d1)) | (1n << BigInt(BoardHelper.c1));
    static BlackQueensideMask2 = (1n << BigInt(BoardHelper.d8)) | (1n << BigInt(BoardHelper.c8));

    static WhiteQueensideMask = Bits.WhiteQueensideMask2 | (1n << BigInt(BoardHelper.b1));
    static BlackQueensideMask = Bits.BlackQueensideMask2 | (1n << BigInt(BoardHelper.b8));

    static WhitePassedPawnMask = new Array(64).fill(0n);
    static BlackPassedPawnMask = new Array(64).fill(0n);

    static WhitePawnSupportMask = new Array(64).fill(0n);
    static BlackPawnSupportMask = new Array(64).fill(0n);

    static FileMask = new Array(8).fill(0n);
    static AdjacentFileMasks = new Array(8).fill(0n);

    static KingSafetyMask = new Array(64).fill(0n);

    static WhiteForwardFileMask = new Array(64).fill(0n);
    static BlackForwardFileMask = new Array(64).fill(0n);

    static TripleFileMask = new Array(8).fill(0n);

    static {
        for (let i = 0; i < 8; i++) {
            Bits.FileMask[i] = Bits.FileA << BigInt(i);
            const left = i > 0 ? Bits.FileA << BigInt(i - 1) : 0n;
            const right = i < 7 ? Bits.FileA << BigInt(i + 1) : 0n;
            Bits.AdjacentFileMasks[i] = left | right;
        }

        for (let i = 0; i < 8; i++) {
            const clampedFile = Math.max(1, Math.min(i, 6));
            Bits.TripleFileMask[i] = Bits.FileMask[clampedFile] | Bits.AdjacentFileMasks[clampedFile];
        }

        for (let square = 0; square < 64; square++) {
            const file = BoardHelper.FileIndex(square);
            const rank = BoardHelper.RankIndex(square);
            const adjacentFiles = (Bits.FileA << BigInt(Math.max(0, file - 1))) | (Bits.FileA << BigInt(Math.min(7, file + 1)));
            // Passed pawn mask
            const whiteForwardMask = ~(BigInt.asUintN(64, ~0n) >> BigInt(64 - 8 * (rank + 1)));
            const blackForwardMask = (1n << BigInt(8 * rank)) - 1n;

            Bits.WhitePassedPawnMask[square] = (Bits.FileA << BigInt(file) | adjacentFiles) & whiteForwardMask;
            Bits.BlackPassedPawnMask[square] = (Bits.FileA << BigInt(file) | adjacentFiles) & blackForwardMask;
            // Pawn support mask
            const adjacent = ((1n << BigInt(square - 1)) | (1n << BigInt(square + 1))) & adjacentFiles;
            Bits.WhitePawnSupportMask[square] = adjacent | BitBoardUtility.Shift(adjacent, -8);
            Bits.BlackPawnSupportMask[square] = adjacent | BitBoardUtility.Shift(adjacent, 8);

            Bits.WhiteForwardFileMask[square] = whiteForwardMask & Bits.FileMask[file];
            Bits.BlackForwardFileMask[square] = blackForwardMask & Bits.FileMask[file];
        }

        for (let i = 0; i < 64; i++) {
            Bits.KingSafetyMask[i] = BitBoardUtility.KingMoves[i] | (1n << BigInt(i));
        }
    }
}

class PrecomputedMoveData {
    static directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
    static dirOffsets2D = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: -1 }
    ];
    static pawnAttackDirections = [
        [4, 6],
        [7, 5]
    ];

    static numSquaresToEdge = Array(64).fill(null).map(() => Array(8).fill(0));
    static knightMoves = Array(64).fill(null).map(() => []);
    static kingMoves = Array(64).fill(null).map(() => []);
    static pawnAttacksWhite = Array(64).fill(null).map(() => []);
    static pawnAttacksBlack = Array(64).fill(null).map(() => []);
    static directionLookup = Array(127).fill(0);
    static kingAttackBitboards = Array(64).fill(0n);
    static knightAttackBitboards = Array(64).fill(0n);
    static pawnAttackBitboards = Array(64).fill(null).map(() => [0n, 0n]);
    static rookMoves = Array(64).fill(0);
    static bishopMoves = Array(64).fill(0);
    static queenMoves = Array(64).fill(0);
    static OrthogonalDistance = Array(64).fill(null).map(() => Array(64).fill(0));
    static kingDistance = Array(64).fill(null).map(() => Array(64).fill(0));
    static CentreManhattanDistance = Array(64).fill(0);
    static alignMask = Array(64).fill(null).map(() => Array(64).fill(0n));
    static dirRayMask = Array(8).fill(null).map(() => Array(64).fill(0n));

    static NumRookMovesToReachSquare(startSquare, targetSquare) {
        return PrecomputedMoveData.OrthogonalDistance[startSquare][targetSquare];
    }

    static NumKingMovesToReachSquare(startSquare, targetSquare) {
        return PrecomputedMoveData.kingDistance[startSquare][targetSquare];
    }

    static{
        const allKnightJumps = [15, 17, -17, -15, 10, -6, 6, -10];

        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            let y = Math.floor(squareIndex / 8);
            let x = squareIndex % 8;

            let north = 7 - y;
            let south = y;
            let west = x;
            let east = 7 - x;
            PrecomputedMoveData.numSquaresToEdge[squareIndex] = [north, south, west, east, Math.min(north, west), Math.min(south, east), Math.min(north, east), Math.min(south, west)];

            // Calculate knight moves
            let knightMoveList = [];
            for (let i = 0; i < allKnightJumps.length; i++) {
                let targetX = x + allKnightJumps[i] % 8;
                let targetY = y + Math.floor(allKnightJumps[i] / 8);
                if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                    let targetSquare = targetY * 8 + targetX;
                    knightMoveList.push(targetSquare);
                    PrecomputedMoveData.knightAttackBitboards[squareIndex] |= 1n << BigInt(targetSquare);
                }
            }
            PrecomputedMoveData.knightMoves[squareIndex] = PrecomputedMoveData.knightMoveList;

            // Calculate king moves
            let kingMoveList = [];
            for (let i = 0; i < PrecomputedMoveData.dirOffsets2D.length; i++) {
                let targetX = x + PrecomputedMoveData.dirOffsets2D[i].x;
                let targetY = y + PrecomputedMoveData.dirOffsets2D[i].y;
                if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                    let targetSquare = targetY * 8 + targetX;
                    kingMoveList.push(targetSquare);
                    PrecomputedMoveData.kingAttackBitboards[squareIndex] |= 1n << BigInt(targetSquare);
                }
            }
            PrecomputedMoveData.kingMoves[squareIndex] = kingMoveList;

            // Calculate pawn attacks
            let pawnAttacksWhiteList = [];
            let pawnAttacksBlackList = [];
            for (let i = 0; i < PrecomputedMoveData.pawnAttackDirections[0].length; i++) {
                let targetX = x + PrecomputedMoveData.dirOffsets2D[PrecomputedMoveData.pawnAttackDirections[0][i]].x;
                let targetY = y + PrecomputedMoveData.dirOffsets2D[PrecomputedMoveData.pawnAttackDirections[0][i]].y;
                if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                    let targetSquare = targetY * 8 + targetX;
                    pawnAttacksWhiteList.push(targetSquare);
                    PrecomputedMoveData.pawnAttackBitboards[squareIndex][0] |= 1n << BigInt(targetSquare);
                }
                targetX = x + PrecomputedMoveData.dirOffsets2D[PrecomputedMoveData.pawnAttackDirections[1][i]].x;
                targetY = y + PrecomputedMoveData.dirOffsets2D[PrecomputedMoveData.pawnAttackDirections[1][i]].y;
                if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                    let targetSquare = targetY * 8 + targetX;
                    pawnAttacksBlackList.push(targetSquare);
                    PrecomputedMoveData.pawnAttackBitboards[squareIndex][1] |= 1n << BigInt(targetSquare);
                }
            }
            PrecomputedMoveData.pawnAttacksWhite[squareIndex] = pawnAttacksWhiteList;
            PrecomputedMoveData.pawnAttacksBlack[squareIndex] = pawnAttacksBlackList;
        }

        // Calculate rook moves
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            PrecomputedMoveData.rookMoves[squareIndex] = 0n;
            for (let dir = 0; dir < 4; dir++) {
                let currentSquare = squareIndex;
                for (let n = 0; n < PrecomputedMoveData.numSquaresToEdge[squareIndex][dir]; n++) {
                    currentSquare += PrecomputedMoveData.directionOffsets[dir];
                    PrecomputedMoveData.rookMoves[squareIndex] |= 1n << BigInt(currentSquare);
                }
            }
        }

        // Calculate bishop moves
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            PrecomputedMoveData.bishopMoves[squareIndex] = 0n;
            for (let dir = 4; dir < 8; dir++) {
                let currentSquare = squareIndex;
                for (let n = 0; n < PrecomputedMoveData.numSquaresToEdge[squareIndex][dir]; n++) {
                    currentSquare += PrecomputedMoveData.directionOffsets[dir];
                    PrecomputedMoveData.bishopMoves[squareIndex] |= 1n << BigInt(currentSquare);
                }
            }
        }

        // Calculate queen moves (combination of rook and bishop moves)
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            PrecomputedMoveData.queenMoves[squareIndex] = PrecomputedMoveData.rookMoves[squareIndex] | PrecomputedMoveData.bishopMoves[squareIndex];
        }

        // Calculate orthogonal and king distances
        for (let squareA = 0; squareA < 64; squareA++) {
            for (let squareB = 0; squareB < 64; squareB++) {
                let xDistance = Math.abs((squareA % 8) - (squareB % 8));
                let yDistance = Math.abs(Math.floor(squareA / 8) - Math.floor(squareB / 8));
                PrecomputedMoveData.OrthogonalDistance[squareA][squareB] = xDistance + yDistance;
                PrecomputedMoveData.kingDistance[squareA][squareB] = Math.max(xDistance, yDistance);
            }
        }

        // Calculate centre manhattan distances
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            let xDistance = Math.abs((squareIndex % 8) - 3);
            let yDistance = Math.abs(Math.floor(squareIndex / 8) - 3);
            PrecomputedMoveData.CentreManhattanDistance[squareIndex] = xDistance + yDistance;
        }

        // Direction lookup
        for (let i = 0; i < 127; i++) {
            let offset = i - 63;
            let absOffset = Math.abs(offset);
            let absDir = 1;
            if (absOffset % 9 === 0) {
                absDir = 9;
            } else if (absOffset % 8 === 0) {
                absDir = 8;
            } else if (absOffset % 7 === 0) {
                absDir = 7;
            }
            PrecomputedMoveData.directionLookup[i] = absDir * Math.sign(offset);
        }

        // align mask and dir-ray-mask
        PrecomputedMoveData.OrthogonalDistance = Array(64).fill(null).map(() => Array(64).fill(0));
        PrecomputedMoveData.kingDistance = Array(64).fill(null).map(() => Array(64).fill(0));
        PrecomputedMoveData.CentreManhattanDistance = Array(64).fill(0);

        for (let squareA = 0; squareA < 64; squareA++) {
            let coordA = BoardHelper.CoordFromIndex(squareA);
            let fileDstFromCentre = Math.max(3 - coordA.fileIndex, coordA.fileIndex - 4);
            let rankDstFromCentre = Math.max(3 - coordA.rankIndex, coordA.rankIndex - 4);
            PrecomputedMoveData.CentreManhattanDistance[squareA] = fileDstFromCentre + rankDstFromCentre;
        
            for (let squareB = 0; squareB < 64; squareB++) {
                let coordB = BoardHelper.CoordFromIndex(squareB);
                let rankDistance = Math.abs(coordA.rankIndex - coordB.rankIndex);
                let fileDistance = Math.abs(coordA.fileIndex - coordB.fileIndex);
                PrecomputedMoveData.OrthogonalDistance[squareA][squareB] = fileDistance + rankDistance;
                PrecomputedMoveData.kingDistance[squareA][squareB] = Math.max(fileDistance, rankDistance);
            }
        }
        
        PrecomputedMoveData.alignMask = Array(64).fill(null).map(() => Array(64).fill(0n));
        for (let squareA = 0; squareA < 64; squareA++) {
            for (let squareB = 0; squareB < 64; squareB++) {
                let cA = BoardHelper.CoordFromIndex(squareA);
                let cB = BoardHelper.CoordFromIndex(squareB);
                let delta = { fileIndex: cB.fileIndex - cA.fileIndex, rankIndex: cB.rankIndex - cA.rankIndex };
                let dir = { fileIndex: Math.sign(delta.fileIndex), rankIndex: Math.sign(delta.rankIndex) };
        
                for (let i = -8; i < 8; i++) {
                    let coord = BoardHelper.CoordFromIndex(squareA);
                    coord.fileIndex += dir.fileIndex * i;
                    coord.rankIndex += dir.rankIndex * i;
                    if (coord.isValidSquare()) {
                        PrecomputedMoveData.alignMask[squareA][squareB] |= 1n << BigInt(BoardHelper.IndexFromCoord(coord));
                    }
                }
            }
        }
        
        PrecomputedMoveData.dirRayMask = Array(8).fill(null).map(() => Array(64).fill(0n));
        for (let dirIndex = 0; dirIndex < PrecomputedMoveData.dirOffsets2D.length; dirIndex++) {
            for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
                let square = BoardHelper.CoordFromIndex(squareIndex);
        
                for (let i = 0; i < 8; i++) {
                    let coord = new Coord(square.fileIndex + PrecomputedMoveData.dirOffsets2D[dirIndex].x * i, 
                        square.rankIndex + PrecomputedMoveData.dirOffsets2D[dirIndex].y * i );
                    if (coord.isValidSquare()) {
                        PrecomputedMoveData.dirRayMask[dirIndex][squareIndex] |= 1n << BigInt(BoardHelper.IndexFromCoord(coord));
                    } else {
                        break;
                    }
                }
            }
        }
    }
}

class MagicHelper {
    static CreateAllBlockerBitboards(movementMask) {
        // Create a list of the indices of the bits that are set in the movement mask
        let moveSquareIndices = [];
        for (let i = 0; i < 64; i++) {
            if (((movementMask >> BigInt(i)) & 1n) === 1n) {
                moveSquareIndices.push(i);
            }
        }

        // Calculate total number of different bitboards (one for each possible arrangement of pieces)
        let numPatterns = 1 << moveSquareIndices.length; // 2^n
        let blockerBitboards = new Array(numPatterns).fill(0n);

        // Create all bitboards
        for (let patternIndex = 0; patternIndex < numPatterns; patternIndex++) {
            for (let bitIndex = 0; bitIndex < moveSquareIndices.length; bitIndex++) {
                let bit = (patternIndex >> bitIndex) & 1;
                blockerBitboards[patternIndex] |= BigInt(bit) << BigInt(moveSquareIndices[bitIndex]);
            }
        }

        return blockerBitboards;
    }

    static CreateMovementMask(squareIndex, ortho) {
        let mask = 0n;
        let directions = ortho ? BoardHelper.RookDirections : BoardHelper.BishopDirections;
        let startCoord = new Coord(squareIndex);

        for (let dir of directions) {
            for (let dst = 1; dst < 8; dst++) {
                let coord = startCoord.add(dir.multiply(dst));
                let nextCoord = startCoord.add(dir.multiply(dst + 1));

                if (nextCoord.isValidSquare()) {
                    mask = BitBoardUtility.SetSquare(mask, coord.squareIndex);
                } else {
                    break;
                }
            }
        }
        return mask;
    }

    static LegalMoveBitboardFromBlockers(startSquare, blockerBitboard, ortho) {
        let bitboard = 0n;

        let directions = ortho ? BoardHelper.RookDirections : BoardHelper.BishopDirections;
        let startCoord = new Coord(startSquare);

        for (let dir of directions) {
            for (let dst = 1; dst < 8; dst++) {
                let coord = startCoord.add(dir.multiply(dst));

                if (coord.isValidSquare()) {
                    bitboard = BitBoardUtility.SetSquare(bitboard, coord.squareIndex);
                    if (BitBoardUtility.ContainsSquare(blockerBitboard, coord.squareIndex)) {
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        return bitboard;
    }
}

class Magic {
    // Rook and bishop mask bitboards for each origin square.
    // A mask is simply the legal moves available to the piece from the origin square
    // (on an empty board), except that the moves stop 1 square before the edge of the board.
    static RookMask = new Array(64).fill(0n);
    static BishopMask = new Array(64).fill(0n);

    static RookAttacks = new Array(64).fill(null).map(() => []);
    static BishopAttacks = new Array(64).fill(null).map(() => []);

    static GetSliderAttacks(square, blockers, ortho) {
        return ortho ? this.GetRookAttacks(square, blockers) : this.GetBishopAttacks(square, blockers);
    }

    static GetRookAttacks(square, blockers) {
        let key = ((blockers & this.RookMask[square]) * PrecomputedMagics.RookMagics[square]) >> BigInt(PrecomputedMagics.RookShifts[square]);
        return this.RookAttacks[square][key];
    }

    static GetBishopAttacks(square, blockers) {
        let key = ((blockers & this.BishopMask[square]) * PrecomputedMagics.BishopMagics[square]) >> BigInt(PrecomputedMagics.BishopShifts[square]);
        return this.BishopAttacks[square][key];
    }

    static initialize() {
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            this.RookMask[squareIndex] = MagicHelper.CreateMovementMask(squareIndex, true);
            this.BishopMask[squareIndex] = MagicHelper.CreateMovementMask(squareIndex, false);
        }

        for (let i = 0; i < 64; i++) {
            this.RookAttacks[i] = this.CreateTable(i, true, PrecomputedMagics.RookMagics[i], PrecomputedMagics.RookShifts[i]);
            this.BishopAttacks[i] = this.CreateTable(i, false, PrecomputedMagics.BishopMagics[i], PrecomputedMagics.BishopShifts[i]);
        }
    }

    static CreateTable(square, rook, magic, leftShift) {
        let numBits = 64 - leftShift;
        let lookupSize = 1 << numBits;
        let table = new Array(lookupSize).fill(0n);

        let movementMask = MagicHelper.CreateMovementMask(square, rook);
        let blockerPatterns = MagicHelper.CreateAllBlockerBitboards(movementMask);

        for (let pattern of blockerPatterns) {
            let index = (pattern * magic) >> BigInt(leftShift);
            let moves = MagicHelper.LegalMoveBitboardFromBlockers(square, pattern, rook);
            table[index] = moves;
        }

        return table;
    }
}

Magic.initialize();

class StackList {
    constructor() {
        this.items = [];
    }

    // Add an element to the stack
    push(element) {
        this.items.push(element);
    }

    // Remove and return the top element from the stack
    pop() {
        if (this.isEmpty()) {
            return 'Underflow';
        }
        return this.items.pop();
    }

    // Return the top element without removing it
    peek() {
        if (this.isEmpty()) {
            return 'No elements in Stack';
        }
        return this.items[this.items.length - 1];
    }

    // Check if the stack is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Return the size of the stack
    size() {
        return this.items.length;
    }

    // Print the elements in the stack
    printStack() {
        let str = '';
        for (let i = 0; i < this.items.length; i++) {
            str += this.items[i] + ' ';
        }
        return str;
    }

    // Clear the stack
    clear() {
        this.items = [];
    }
}

