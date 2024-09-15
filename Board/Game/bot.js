class PieceSquareTable
{

    static read(table = [], square = 0, isWhite = true)
    {
        if (isWhite)
        {
            let file = BoardHelper.FileIndex(square);
            let rank = BoardHelper.RankIndex(square);
            rank = 7 - rank;
            square = BoardHelper.IndexFromCoordIndices(file, rank);
        }

        return table[square];
    }

    static readSquare(piece = 0, square = 0)
    {
        return this.Tables[piece][square];
    }

    static Pawns = [
         0,   0,   0,   0,   0,   0,   0,   0,
        50,  50,  50,  50,  50,  50,  50,  50,
        10,  10,  20,  30,  30,  20,  10,  10,
         5,   5,  10,  25,  25,  10,   5,   5,
         0,   0,   0,  20,  20,   0,   0,   0,
         5,  -5, -10,   0,   0, -10,  -5,   5,
         5,  10,  10, -20, -20,  10,  10,   5,
         0,   0,   0,   0,   0,   0,   0,   0
    ];

    static PawnsEnd = [
         0,   0,   0,   0,   0,   0,   0,   0,
        80,  80,  80,  80,  80,  80,  80,  80,
        50,  50,  50,  50,  50,  50,  50,  50,
        30,  30,  30,  30,  30,  30,  30,  30,
        20,  20,  20,  20,  20,  20,  20,  20,
        10,  10,  10,  10,  10,  10,  10,  10,
        10,  10,  10,  10,  10,  10,  10,  10,
         0,   0,   0,   0,   0,   0,   0,   0
    ];

    static Rooks =  [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ];
    static Knights = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50,
    ];
    static Bishops = [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20,
    ];
    static Queens = [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
        -5,   0,  5,  5,  5,  5,  0, -5,
        0,    0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ];
    static KingStart =
    [
        -80, -70, -70, -70, -70, -70, -70, -80,
        -60, -60, -60, -60, -60, -60, -60, -60,
        -40, -50, -50, -60, -60, -50, -50, -40,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -20, -30, -30, -40, -40, -30, -30, -20,
        -10, -20, -20, -20, -20, -20, -20, -10,
        20,  20,  -5,  -5,  -5,  -5,  20,  20,
        20,  30,  10,   0,   0,  10,  30,  20
    ];

    static KingEnd =
    [
        -20, -10, -10, -10, -10, -10, -10, -20,
        -5,   0,   5,   5,   5,   5,   0,  -5,
        -10, -5,   20,  30,  30,  20,  -5, -10,
        -15, -10,  35,  45,  45,  35, -10, -15,
        -20, -15,  30,  40,  40,  30, -15, -20,
        -25, -20,  20,  25,  25,  20, -20, -25,
        -30, -25,   0,   0,   0,   0, -25, -30,
        -50, -30, -30, -30, -30, -30, -30, -50
    ];

    static Tables;

    static {
        this.Tables = new Array(Piece.MaxPieceIndex + 1).fill([]);
        this.Tables[Piece.makePiece(Piece.Pawn, Piece.White)] = this.Pawns;
        this.Tables[Piece.makePiece(Piece.Rook, Piece.White)] = this.Rooks;
        this.Tables[Piece.makePiece(Piece.Knight, Piece.White)] = this.Knights;
        this.Tables[Piece.makePiece(Piece.Bishop, Piece.White)] = this.Bishops;
        this.Tables[Piece.makePiece(Piece.Queen, Piece.White)] = this.Queens;

        this.Tables[Piece.makePiece(Piece.Pawn, Piece.Black)] = PieceSquareTable.GetFlippedTable(this.Pawns);
        this.Tables[Piece.makePiece(Piece.Rook, Piece.Black)] = PieceSquareTable.GetFlippedTable(this.Rooks);
        this.Tables[Piece.makePiece(Piece.Knight, Piece.Black)] = PieceSquareTable.GetFlippedTable(this.Knights);
        this.Tables[Piece.makePiece(Piece.Bishop, Piece.Black)] = PieceSquareTable.GetFlippedTable(this.Bishops);
        this.Tables[Piece.makePiece(Piece.Queen, Piece.Black)] = PieceSquareTable.GetFlippedTable(this.Queens);
    }

    static GetFlippedTable(table = [])
    {
        let flippedTable = [table.Length];

        for (let i = 0; i < table.Length; i++)
        {
            let coord = new Coord(i);
            let flippedCoord = new Coord(coord.fileIndex, 7 - coord.rankIndex);
            flippedTable[flippedCoord.SquareIndex] = table[i];
        }
        return flippedTable;
    }
}

class SearchDiagnostics
{
    constructor()
    {
        this.branches = 0;
        this.leaves = 0;
        this.prunes = 0;
        this.entries = 0;
        this.retrievals = 0;
        this.tableSize = 0.0;
    }
}

class RepetitionTable
{
    constructor()
    {
        this.count = 0;
        this.hashes = new Array(256).fill(0n);
        this.startIndices = new Array(this.hashes.length + 1).fill(0);
    }

    init(board = new Board())
    {
        let initialHashes = [...board.RepetitionPositionHistory.items].reverse();
        this.count = initialHashes.Length;

        for (let i = 0; i < initialHashes.length; i++)
        {
            this.hashes[i] = initialHashes[i];
            this.startIndices[i] = 0;
        }
        this.startIndices[this.count] = 0;
    }


    push(hash = 0n, reset = false)
    {
        // Check bounds just in case
        if (this.count < this.hashes.Length)
        {
            this.hashes[count] = hash;
            this.startIndices[count + 1] = reset ? this.count : this.startIndices[count];
        }
        this.count++;
    }

    tryPop()
    {
        this.count = Math.max(0, this.count - 1);
    }

    contains(h)
    {
        let s = this.startIndices[this.count];
        // up to count-1 so that curr position is not counted
        for (let i = s; i < this.count - 1; i++)
        {
            if (this.hashes[i] == h)
            {
                return true;
            }
        }
        return false;
    }
}

class TranspositionTable
{

    static LookupFailed = -1;

    // The value for this position is the exact evaluation
    static Exact = 0;
    // A move was found during the search that was too good, meaning the opponent will play a different move earlier on,
    // not allowing the position where this move was available to be reached. Because the search cuts off at
    // this point (beta cut-off), an even better move may exist. This means that the evaluation for the
    // position could be even higher, making the stored value the lower bound of the actual value.
    static LowerBound = 1;
    // No move during the search resulted in a position that was better than the current player could get from playing a
    // different move in an earlier position (i.e eval was <= alpha for all moves in the position).
    // Due to the way alpha-beta search works, the value we get here won't be the exact evaluation of the position,
    // but rather the upper bound of the evaluation. This means that the evaluation is, at most, equal to this value.
    static UpperBound = 2;

    entries = [];
    count = 0n;
    enabled = true;

    constructor(board = new Board(), sizeMB = 8)
    {
        this.board = board;

        let ttEntrySizeBytes = Entry.GetSize();
        let desiredTableSizeInBytes = sizeMB * 1024 * 1024;
        let numEntries = Math.ceil(desiredTableSizeInBytes / ttEntrySizeBytes);

        this.count = BigInt(numEntries);
        this.entries = new Array(numEntries).fill(null).map(() => new Entry());;
    }

    clear()
    {
        for (let i = 0; i < this.entries.length; i++)
        {
            this.entries[i] = new Entry();
        }
    }

    get Index() {return this.board.CurrentGameState.zobristKey % this.count;}

    tryGetStoredMove()
    {
        return this.entries[this.Index].move;
    }

    tryLookupEvaluation(depth = 0, plyFromRoot = 0, alpha = 0, beta = 0, evalReference  = new Reference())
    {
        evalReference.value = 0;
        return false;
    }

    lookupEvaluation(depth = 0, plyFromRoot = 0, alpha = 0, beta = 0)
    {
        if (!this.enabled)
        {
            return TranspositionTable.LookupFailed;
        }
        let entry = this.entries[this.Index];

        if (entry.key == this.board.CurrentGameState.zobristKey)
        {
            // Only use stored evaluation if it has been searched to at least the same depth as would be searched now
            if (entry.depth >= depth)
            {
                let correctedScore = this.correctRetrievedMateScore(entry.value, plyFromRoot);
                // We have stored the exact evaluation for this position, so return it
                if (entry.nodeType == TranspositionTable.Exact)
                {
                    return correctedScore;
                }
                // We have stored the upper bound of the eval for this position. If it's less than alpha then we don't need to
                // search the moves in this position as they won't interest us; otherwise we will have to search to find the exact value
                if (entry.nodeType == TranspositionTable.UpperBound && correctedScore <= alpha)
                {
                    return correctedScore;
                }
                // We have stored the lower bound of the eval for this position. Only return if it causes a beta cut-off.
                if (entry.nodeType == TranspositionTable.LowerBound && correctedScore >= beta)
                {
                    return correctedScore;
                }
            }
        }
        return TranspositionTable.LookupFailed;
    }

    storeEvaluation(depth = 0, numPlySearched = 0, evalValue = 0, evalType = 0, move = new Move())
    {
        if (!this.enabled)
        {
            return;
        }
        let index = this.Index;

        //if (depth >= entries[Index].depth) {
        let entry = new Entry(this.board.CurrentGameState.zobristKey, this.correctMateScoreForStorage(evalValue, numPlySearched), depth, evalType, move);
        this.entries[this.Index] = entry;
        //}
    }

    correctMateScoreForStorage(score = 0, numPlySearched = 0)
    {
        //if (Searcher.IsMateScore(score))
        //{
        //    int sign = System.Math.Sign(score);
        //    return (score * sign + numPlySearched) * sign;
        //}
        return score;
    }

    correctRetrievedMateScore(score = 0, numPlySearched = 0)
    {
        if (true)//Searcher.IsMateScore(score))
        {
            let sign = Math.sign(score);
            return (score * sign - numPlySearched) * sign;
        }
        return score;
    }

    getEntry(zobristKey = 0n)
    {
        return this.entries[zobristKey % BigInt(this.entries.length)];
    }
}

class Entry
{
    constructor(key = 0n, value = 0, depth = 0, nodeType = 0, move = new Move())
    {
        this.key = key;
        this.value = value;
        this.depth = depth; // depth is how many ply were searched ahead from this position
        this.nodeType = nodeType;
        this.move = move;
    }

    static GetSize()
    {
        return 36;
    }
}

class MaterialInfo {
    static queenEndgameWeight = 45;
    static rookEndgameWeight = 20;
    static bishopEndgameWeight = 10;
    static knightEndgameWeight = 10;

    static endgameStartWeight = 2 * MaterialInfo.rookEndgameWeight + 2 * MaterialInfo.bishopEndgameWeight + 2 * MaterialInfo.knightEndgameWeight + MaterialInfo.queenEndgameWeight;

    constructor(numPawns = 0, numKnights = 0, numBishops = 0, numQueens = 0, numRooks = 0, myPawns = 0, enemyPawns = 0) {
        this.numPawns = numPawns;
        this.numBishops = numBishops;
        this.numQueens = numQueens;
        this.numRooks = numRooks;
        this.pawns = myPawns;
        this.enemyPawns = enemyPawns;

        this.numMajors = numRooks + numQueens;
        this.numMinors = numBishops + numKnights;

        this.materialScore = 0;
        this.materialScore += numPawns * Evaluation.PawnValue;
        this.materialScore += numKnights * Evaluation.KnightValue;
        this.materialScore += numBishops * Evaluation.BishopValue;
        this.materialScore += numRooks * Evaluation.RookValue;
        this.materialScore += numQueens * Evaluation.QueenValue;

        let endgameWeightSum = numQueens * MaterialInfo.queenEndgameWeight + numRooks * MaterialInfo.rookEndgameWeight + numBishops * MaterialInfo.bishopEndgameWeight + numKnights * MaterialInfo.knightEndgameWeight;
        this.endgameT = 1 - Math.min(1, endgameWeightSum / MaterialInfo.endgameStartWeight);
    }
}

class EvaluationData
{
    constructor()
    {
        this.materialScore = 0;
        this.mopUpScore = 0;
        this.pieceSquareScore = 0;
        this.pawnScore = 0;
        this.pawnShieldScore = 0;
    }

    Sum()    
    {
        return this.materialScore + this.mopUpScore + this.pieceSquareScore + this.pawnScore + this.pawnShieldScore;
    }
}

class PrecomputedEvaluationData
{
    static{
        this.PawnShieldSquaresWhite = new Array(64).fill([]);
        this.PawnShieldSquaresBlack = new Array(64).fill([]);
        for (let squareIndex = 0; squareIndex < 64; squareIndex++)
        {
            PrecomputedEvaluationData.CreatePawnShieldSquare(squareIndex);
        }
    }

    static CreatePawnShieldSquare(squareIndex = 0)
    {
        let shieldIndicesWhite = [];
        let shieldIndicesBlack = [];
        let coord = new Coord(squareIndex);
        let rank = coord.rankIndex;
        let file = JSMath.clamp(coord.fileIndex, 1, 6);

        for (let fileOffset = -1; fileOffset <= 1; fileOffset++)
        {
            PrecomputedEvaluationData.AddIfValid(new Coord(file + fileOffset, rank + 1), shieldIndicesWhite);
            PrecomputedEvaluationData.AddIfValid(new Coord(file + fileOffset, rank - 1), shieldIndicesBlack);
        }

        for (let fileOffset = -1; fileOffset <= 1; fileOffset++)
        {
            PrecomputedEvaluationData.AddIfValid(new Coord(file + fileOffset, rank + 2), shieldIndicesWhite);
            PrecomputedEvaluationData.AddIfValid(new Coord(file + fileOffset, rank - 2), shieldIndicesBlack);
        }

        this.PawnShieldSquaresWhite[squareIndex] = shieldIndicesWhite;
        this.PawnShieldSquaresBlack[squareIndex] = shieldIndicesBlack;

    }

    static AddIfValid(coord = new Coord(), list = [])
    {
        if (coord.isValidSquare())
        {
            list.push(coord.squareIndex);
        }
    }
}

class Evaluation
{
    static PawnValue = 100;
    static KnightValue = 300;
    static BishopValue = 320;
    static RookValue = 500;
    static QueenValue = 900;
    static passedPawnBonuses = [ 0, 120, 80, 50, 30, 15, 15 ];
    static isolatedPawnPenaltyByCount = [ 0, -10, -25, -50, -75, -75, -75, -75, -75 ];
    static  kingPawnShieldScores = [ 4, 7, 4, 3, 6, 3 ];
    static endgameMaterialStart = Evaluation.RookValue * 2 + Evaluation.BishopValue + Evaluation.KnightValue;

    constructor()
    {
        this.board = new Board();
        this.whiteEval = new EvaluationData();
        this.blackEval = new EvaluationData();
    }

    // Performs static evaluation of the current position.
    // The position is assumed to be 'quiet', i.e no captures are available that could drastically affect the evaluation.
    // The score that's returned is given from the perspective of whoever's turn it is to move.
    // So a positive score means the player who's turn it is to move has an advantage, while a negative score indicates a disadvantage.
    evaluate(board = new Board())
    {
        this.board = board;
        this.whiteEval = new EvaluationData();
        this.blackEval = new EvaluationData();

        let whiteMaterial = this.getMaterialInfo(Board.WhiteIndex);
        let blackMaterial = this.getMaterialInfo(Board.BlackIndex);

        // Score based on number (and type) of pieces on board
        this.whiteEval.materialScore = whiteMaterial.materialScore;
        this.blackEval.materialScore = blackMaterial.materialScore;

        // Score based on positions of pieces
        this.whiteEval.pieceSquareScore = this.EvaluatePieceSquareTables(true, blackMaterial.endgameT);
        this.blackEval.pieceSquareScore = this.EvaluatePieceSquareTables(false, whiteMaterial.endgameT);

        // Encourage using own king to push enemy king to edge of board in winning endgame
        this.whiteEval.mopUpScore = this.MopUpEval(true, whiteMaterial, blackMaterial);
        this.blackEval.mopUpScore = this.MopUpEval(false, blackMaterial, whiteMaterial);

        this.whiteEval.pawnScore = this.EvaluatePawns(Board.WhiteIndex);
        this.blackEval.pawnScore = this.EvaluatePawns(Board.BlackIndex);

        this.whiteEval.pawnShieldScore = this.KingPawnShield(Board.WhiteIndex, blackMaterial, this.blackEval.pieceSquareScore);
        this.blackEval.pawnShieldScore = this.KingPawnShield(Board.BlackIndex, whiteMaterial, this.whiteEval.pieceSquareScore);

        let perspective = board.IsWhiteToMove ? 1 : -1;
        let evalValue = this.whiteEval.Sum() - this.blackEval.Sum();
        return evalValue * perspective;
    }

    KingPawnShield(colourIndex, enemyMaterial, enemyPieceSquareScore) 
    {
        if (enemyMaterial.endgameT >= 1) {
            return 0;
        }
    
        let penalty = 0;
    
        let isWhite = colourIndex === Board.WhiteIndex;
        let friendlyPawn = Piece.makePiece(Piece.Pawn, isWhite);
        let kingSquare = this.board.KingSquare[colourIndex];
        let kingFile = BoardHelper.FileIndex(kingSquare);
    
        let uncastledKingPenalty = 0;
    
        if (kingFile <= 2 || kingFile >= 5) 
        {
            let squares = isWhite ? PrecomputedEvaluationData.PawnShieldSquaresWhite[kingSquare] : PrecomputedEvaluationData.PawnShieldSquaresBlack[kingSquare];
    
            for (let i = 0; i < squares.length / 2; i++) {
                let shieldSquareIndex = squares[i];
                if (this.board.Square[shieldSquareIndex] !== friendlyPawn) {
                    if (squares.length > 3 && this.board.Square[squares[i + 3]] === friendlyPawn) {
                        penalty += Evaluation.kingPawnShieldScores[i + 3];
                    } else {
                        penalty += Evaluation.kingPawnShieldScores[i];
                    }
                }
            }
            penalty *= penalty;
        } else 
        {
            let enemyDevelopmentScore = Math.min(1, (enemyPieceSquareScore + 10) / 130);
            uncastledKingPenalty = Math.floor(50 * enemyDevelopmentScore);
        }
    
        let openFileAgainstKingPenalty = 0;
    
        if (enemyMaterial.numRooks > 1 || (enemyMaterial.numRooks > 0 && enemyMaterial.numQueens > 0)) {
            let clampedKingFile = Math.min(Math.max(kingFile, 1), 6);
            let myPawns = enemyMaterial.enemyPawns;
            for (let attackFile = clampedKingFile; attackFile <= clampedKingFile + 1; attackFile++) {
                let fileMask = Bits.FileMask[attackFile];
                let isKingFile = attackFile === kingFile;
                if ((enemyMaterial.pawns & fileMask) === 0n) {
                    openFileAgainstKingPenalty += isKingFile ? 25 : 15;
                    if ((myPawns & fileMask) === 0n) {
                        openFileAgainstKingPenalty += isKingFile ? 15 : 10;
                    }
                }
            }
        }
    
        let pawnShieldWeight = 1 - enemyMaterial.endgameT;
        if (this.board.Queens[1 - colourIndex].length === 0) {
            pawnShieldWeight *= 0.6;
        }
    
        return Math.floor((-penalty - uncastledKingPenalty - openFileAgainstKingPenalty) * pawnShieldWeight);
    }

    EvaluatePawns(colourIndex) 
    {
        let pawns = this.board.Pawns[colourIndex];
        let isWhite = colourIndex === Board.WhiteIndex;
        let opponentPawns = this.board.PieceBitboards[Piece.makePiece(Piece.Pawn, isWhite ? Piece.Black : Piece.White)];
        let friendlyPawns = this.board.PieceBitboards[Piece.makePiece(Piece.Pawn, isWhite ? Piece.White : Piece.Black)];
        let masks = isWhite ? Bits.WhitePassedPawnMask : Bits.BlackPassedPawnMask;
        let bonus = 0;
        let numIsolatedPawns = 0;
    
        for (let i = 0; i < pawns.length; i++) {
            let square = pawns[i];
            let passedMask = masks[square];
            if ((opponentPawns & passedMask) === 0n) {
                let rank = BoardHelper.RankIndex(square);
                let numSquaresFromPromotion = isWhite ? 7 - rank : rank;
                bonus += Evaluation.passedPawnBonuses[numSquaresFromPromotion];
            }
    
            if ((friendlyPawns & Bits.AdjacentFileMasks[BoardHelper.FileIndex(square)]) === 0n) {
                numIsolatedPawns++;
            }
        }
        return bonus + Evaluation.isolatedPawnPenaltyByCount[numIsolatedPawns];
    }
    
    EndgamePhaseWeight(materialCountWithoutPawns) {
        const multiplier = 1 / Evaluation.endgameMaterialStart;
        return 1 - Math.min(1, materialCountWithoutPawns * multiplier);
    }
    
    MopUpEval(isWhite, myMaterial, enemyMaterial) 
    {
        if (myMaterial.materialScore > enemyMaterial.materialScore + Evaluation.PawnValue * 2 && enemyMaterial.endgameT > 0) 
        {
            let mopUpScore = 0;
            let friendlyIndex = isWhite ? Board.WhiteIndex : Board.BlackIndex;
            let opponentIndex = isWhite ? Board.BlackIndex : Board.WhiteIndex;
    
            let friendlyKingSquare = this.board.KingSquare[friendlyIndex];
            let opponentKingSquare = this.board.KingSquare[opponentIndex];
            mopUpScore += (14 - PrecomputedMoveData.OrthogonalDistance[friendlyKingSquare][opponentKingSquare]) * 4;
            mopUpScore += PrecomputedMoveData.CentreManhattanDistance[opponentKingSquare] * 10;
            return Math.floor(mopUpScore * enemyMaterial.endgameT);
        }
        return 0;
    }
    
    CountMaterial(colourIndex) {
        let material = 0;
        material += this.board.Pawns[colourIndex].Count * Evaluation.PawnValue;
        material += this.board.Knights[colourIndex].Count * Evaluation.KnightValue;
        material += this.board.Bishops[colourIndex].Count * Evaluation.BishopValue;
        material += this.board.Rooks[colourIndex].Count * Evaluation.RookValue;
        material += this.board.Queens[colourIndex].Count * Evaluation.QueenValue;
        return material;
    }

    EvaluatePieceSquareTables(isWhite = false, endgameT = 0)
    {
        let value = 0;
        let colourIndex = isWhite ? Board.WhiteIndex : Board.BlackIndex;
        //value += EvaluatePieceSquareTable(PieceSquareTable.Pawns, board.pawns[colourIndex], isWhite);
        value += Evaluation.EvaluatePieceSquareTable(PieceSquareTable.Rooks, this.board.Rooks[colourIndex], isWhite);
        value += Evaluation.EvaluatePieceSquareTable(PieceSquareTable.Knights, this.board.Knights[colourIndex], isWhite);
        value += Evaluation.EvaluatePieceSquareTable(PieceSquareTable.Bishops, this.board.Bishops[colourIndex], isWhite);
        value += Evaluation.EvaluatePieceSquareTable(PieceSquareTable.Queens, this.board.Queens[colourIndex], isWhite);

        let pawnEarly = Evaluation.EvaluatePieceSquareTable(PieceSquareTable.Pawns, this.board.Pawns[colourIndex], isWhite);
        let pawnLate = Evaluation.EvaluatePieceSquareTable(PieceSquareTable.PawnsEnd, this.board.Pawns[colourIndex], isWhite);
        value += Number(pawnEarly * (1 - endgameT));
        value += Number(pawnLate * endgameT);

        let kingEarlyPhase = PieceSquareTable.read(PieceSquareTable.KingStart, this.board.KingSquare[colourIndex], isWhite);
        value += Number(kingEarlyPhase * (1 - endgameT));
        let kingLatePhase = PieceSquareTable.read(PieceSquareTable.KingEnd, this.board.KingSquare[colourIndex], isWhite);
        value += Number(kingLatePhase * (endgameT));
        return value;
    }

    static EvaluatePieceSquareTable(table = [0], pieceList = new PieceList(), isWhite = false)
    {
        let value = 0;
        for (let i = 0; i < pieceList.Count; i++)
        {
            value += PieceSquareTable.read(table, pieceList.get(i), isWhite);
        }
        return value;
    }

    getMaterialInfo(colourIndex = 0)
    {
        let numPawns = this.board.Pawns[colourIndex].Count;
        let numKnights = this.board.Knights[colourIndex].Count;
        let numBishops = this.board.Bishops[colourIndex].Count;
        let numRooks = this.board.Rooks[colourIndex].Count;
        let numQueens = this.board.Queens[colourIndex].Count;

        let isWhite = colourIndex == Board.WhiteIndex;
        let myPawns = board.PieceBitboards[Piece.makePiece(Piece.Pawn, isWhite)];
        let enemyPawns = board.PieceBitboards[Piece.makePiece(Piece.Pawn, !isWhite)];

        return new MaterialInfo(numPawns, numKnights, numBishops, numQueens, numRooks, myPawns, enemyPawns);
    }
}

class Killers
{
    moveA;
    moveB;

    constructor()
    {
        this.moveA = new Move();
        this.moveB = new Move();
    }

    add(move = new Move())
    {
        if (move.Value != moveA.Value)
        {
            moveB = moveA;
            moveA = move;
        }
    }

    match(move = new Move()){ return move.Value == this.moveA.Value || move.Value == this.moveB.Value;}
}

class MoveOrdering
{
    static maxMoveCount = 218;
    static squareControlledByOpponentPawnPenalty = 350;
    static capturedPieceValueMultiplier = 100;
    static maxKillerMovePly = 32;
    static million = 1000000;
    static hashMoveScore = 100 * MoveOrdering.million;
    static winningCaptureBias = 8 * MoveOrdering.million;
    static promoteBias = 6 * MoveOrdering.million;
    static killerBias = 4 * MoveOrdering.million;
    static losingCaptureBias = 2 * MoveOrdering.million;
    static regularBias = 0;

    constructor(m = new MoveGenerator(), tt = new TranspositionTable())
    {
        this.moveScores = new Array(MoveOrdering.maxMoveCount);
        this.transpositionTable = tt;
        this.invalidMove = Move.NullMove;
        this.killerMoves = new Array(MoveOrdering.maxKillerMovePly).fill(null).map(() => new Killers());
        this.History = Array.from({ length: 2 }, () => 
            Array.from({ length: 64 }, () => 
                new Array(64).fill(0)
            )
        );
    }

    clearHistory()
    {
        this.History = Array.from({ length: 2 }, () => 
            Array.from({ length: 64 }, () => 
                new Array(64).fill(0)
            )
        );
    }

    clearKillers()
    {
        this.killerMoves = new Array(MoveOrdering.maxKillerMovePly).fill(null).map(() => new Killers());
    }

    clear()
    {
        this.clearKillers();
        this.clearHistory();
    }

    orderMoves(hashMove = new Move(), board = new Board(), moves = [new Move()], oppAttacks = 0n, oppPawnAttacks = 0n, inQSearch = false, ply = 0)
    {
        //Move hashMove = inQSearch ? invalidMove : transpositionTable.GetStoredMove();
        let oppPieces = board.EnemyDiagonalSliders | board.EnemyOrthogonalSliders | board.PieceBitboards[Piece.makePiece(Piece.Knight, board.OpponentColour)];
        let pawnAttacks = board.IsWhiteToMove ? BitBoardUtility.WhitePawnAttacks : BitBoardUtility.BlackPawnAttacks;
        //bool danger = board.queens[1 - board.MoveColourIndex].Count > 0 || board.rooks[1 - board.MoveColourIndex].Count > 1;

        for (let i = 0; i < moves.length; i++)
        {
            let move = moves[i];
            if (Move.SameMove(move, hashMove))
            {
                this.moveScores[i] = MoveOrdering.hashMoveScore;
                continue;
            }
            let score = 0;
            let startSquare = move.StartSquare;
            let targetSquare = move.TargetSquare;

            let movePiece = board.Square[startSquare];
            let movePieceType = Piece.pieceType(movePiece);
            let capturePieceType = Piece.pieceType(board.Square[targetSquare]);
            let isCapture = capturePieceType != Piece.None;
            let flag = moves[i].MoveFlag;
            let pieceValue = MoveOrdering.getPieceValue(movePieceType);

            if (isCapture)
            {
                // Order moves to try capturing the most valuable opponent piece with least valuable of own pieces first
                let captureMaterialDelta = MoveOrdering.getPieceValue(capturePieceType) - pieceValue;
                let opponentCanRecapture = BitBoardUtility.ContainsSquare(oppPawnAttacks | oppAttacks, targetSquare);
                if (opponentCanRecapture)
                {
                    score += (captureMaterialDelta >= 0 ? MoveOrdering.winningCaptureBias : MoveOrdering.losingCaptureBias) + captureMaterialDelta;
                }
                else
                {
                    score += MoveOrdering.winningCaptureBias + MoveOrdering.captureMaterialDelta;
                }
            }

            if (movePieceType == Piece.Pawn)
            {
                if (flag == Move.PromoteToQueenFlag && !isCapture)
                {
                    score += MoveOrdering.promoteBias;
                }
            }
            else if (movePieceType == Piece.King)
            {
            }
            else
            {
                let toScore = PieceSquareTable.readSquare(movePiece, targetSquare);
                let fromScore = PieceSquareTable.readSquare(movePiece, startSquare);
                score += toScore - fromScore;

                if (BitBoardUtility.ContainsSquare(oppPawnAttacks, targetSquare))
                {
                    score -= 50;
                }
                else if (BitBoardUtility.ContainsSquare(oppAttacks, targetSquare))
                {
                    score -= 25;
                }

            }

            if (!isCapture)
            {
                //score += regularBias;
                let isKiller = !inQSearch && ply < MoveOrdering.maxKillerMovePly && this.killerMoves[ply].match(move);
                score += isKiller ? MoveOrdering.killerBias : MoveOrdering.regularBias;
                score += this.History[board.MoveColourIndex][startSquare][targetSquare];
            }
            this.moveScores[i] = score;
        }

        //Sort(moves, moveScores);
        MoveOrdering.sort(moves, this.moveScores, 0, moves.Length - 1);
    }

    static getPieceValue(pieceType = 0)
    {
        switch (pieceType)
        {
            case Piece.Queen:
                return Evaluation.QueenValue;
            case Piece.Rook:
                return Evaluation.RookValue;
            case Piece.Knight:
                return Evaluation.KnightValue;
            case Piece.Bishop:
                return Evaluation.BishopValue;
            case Piece.Pawn:
                return Evaluation.PawnValue;
            default:
                return 0;
        }
    }

    getScore(index = 0)
    {
        let score = this.moveScores[index];

        const scoreTypes = [ MoveOrdering.hashMoveScore,  MoveOrdering.winningCaptureBias,  MoveOrdering.losingCaptureBias,  MoveOrdering.promoteBias,  MoveOrdering.killerBias,  MoveOrdering.regularBias ];
        const typeNames = [ "Hash Move", "Good Capture", "Bad Capture", "Promote", "Killer Move", "Regular" ];
        let typeName = "";
        let closest = Number.MAX_VALUE;

        for (let i = 0; i < scoreTypes.Length; i++)
        {
            let delta = Math.abs(score - scoreTypes[i]);
            if (delta < closest)
            {
                closest = delta;
                typeName = typeNames[i];
            }
        }

        return `${score} ${typeName}`;
    }

    static sort(moves = [], scores = []) 
    {
        // Sort the moves list based on scores
        for (let i = 0; i < moves.length - 1; i++) {
            for (let j = i + 1; j > 0; j--) {
                let swapIndex = j - 1;
                if (scores[swapIndex] < scores[j]) {
                    [moves[j], moves[swapIndex]] = [moves[swapIndex], moves[j]];
                    [scores[j], scores[swapIndex]] = [scores[swapIndex], scores[j]];
                }
            }
        }
    }
    
    static quicksort(values = 0, scores = 0, low = 0, high = 0) 
    {
        if (low < high) {
            let pivotIndex = MoveOrdering.partition(values, scores, low, high);
            MoveOrdering.quicksort(values, scores, low, pivotIndex - 1);
            MoveOrdering.quicksort(values, scores, pivotIndex + 1, high);
        }
    }
    
    static partition(values = 0, scores = 0, low = 0, high = 0) 
    {
        let pivotScore = scores[high];
        let i = low - 1;
    
        for (let j = low; j <= high - 1; j++) {
            if (scores[j] > pivotScore) {
                i++;
                [values[i], values[j]] = [values[j], values[i]];
                [scores[i], scores[j]] = [scores[j], scores[i]];
            }
        }
        [values[i + 1], values[high]] = [values[high], values[i + 1]];
        [scores[i + 1], scores[high]] = [scores[high], scores[i + 1]];
    
        return i + 1;
    }
}

class SearchAlgorithm
{
    static immediateMateScore = 1000000;
    static maxExtensions = 16;
    static transpotitionTableSize = 128;

    static positiveInfinity = 9999999;
    static negativeInfinity = -9999999;

    CurrentDepth = 0;

    // public event Action<Move>? OnSearchComplete;

    //search result
    bestMove = new Move();
    bestEval = 0;
    whiteEval = 0;
    blackEval = 0;

    get BestMoveSoFar() {return this.bestMove;}
    get BestEvalSoFar() {return this.bestEval;}
    get WhiteEval() {return this.whiteEval;}
    get BlackEval() {return this.blackEval;}
    get IsMate(){return SearchAlgorithm.isMateScore(this.bestEval);}
    get MateIn() {return SearchAlgorithm.numPlyToMateFromScore(this.bestEval);}
    get MateColor() {return 0;}

    
    isPlayingWhite = false;
    bestMoveThisIteration = new Move();
    bestEvalThisIteration = 0;
    hasSearchedAtLeastOneMove = false;
    searchCancelled = false;
    getEval = false;

    currentIterationDepth = 0;

    searchIterationTimer = new JSStopwatch();
    searchTotalTimer = new JSStopwatch();

    constructor(board = new Board(), getEval = false)
    {
        this.hasSearchedAtLeastOneMove = false;

        this.board = board;
        this.transpositionTable = new TranspositionTable(board, 128);

        this.moveGenerator = new MoveGenerator();
        this.moveGenerator.promotionsToGenerate = PromotionMode.All;

        this.moveOrderer = new MoveOrdering(this.moveGenerator, this.transpositionTable);
        this.repetitionTable = new RepetitionTable();
        this.evaluation = new Evaluation();

        this.searchDiagnostics = new SearchDiagnostics();

        this.search(1, 0, SearchAlgorithm.negativeInfinity, SearchAlgorithm.positiveInfinity);
        this.getEval = getEval;

    }
    
    startSearch()
    {
        // Initialize search
        this.bestEvalThisIteration = this.bestEval = 0;
        // this.whiteEval = 0;
        // this.blackEval = 0;
        this.bestMoveThisIteration = this.bestMove = Move.NullMove;

        this.isPlayingWhite = this.board.IsWhiteToMove;

        this.moveOrderer.clearHistory();
        this.repetitionTable.init(board);

        // Initialize debug info
        this.CurrentDepth = 0;
        this.searchCancelled = false;
        this.searchDiagnostics = new SearchDiagnostics();
        this.searchIterationTimer = new JSStopwatch;
        this.searchTotalTimer = new JSStopwatch;
        this.searchTotalTimer.start();

        // Search
        this.iterativeDeepSearch();


        // Finish up
        // In the unlikely event that the search is cancelled before a best move can be found, take any move
        if (this.bestMove.IsNull())
        {
            var moves = this.moveGenerator.GenerateMoves(this.board);
            if(moves.Length == 0)
            {
                this.bestMove = Move.NullMove;
            }
            else
            {
                this.bestMove = moves[0];
            }
        }

        // OnSearchComplete?.Invoke(bestMove);
        this.searchCancelled = false;
    }

    iterativeDeepSearch()
    {
        for (let searchDepth = 1; searchDepth < 4; searchDepth++)
        {
            this.hasSearchedAtLeastOneMove = false;
            this.searchIterationTimer.start();
            this.currentIterationDepth = searchDepth;
            this.search(searchDepth, 0, SearchAlgorithm.negativeInfinity, SearchAlgorithm.positiveInfinity);

            if (this.searchCancelled)
            {
                if (this.hasSearchedAtLeastOneMove)
                {
                    this.bestMove = this.bestMoveThisIteration;
                    this.bestEval = this.bestEvalThisIteration;
                }
                break;
            }
            else
            {
                this.CurrentDepth = searchDepth;
                this.bestMove = this.bestMoveThisIteration;
                this.bestEval = this.bestEvalThisIteration;

                if(this.getEval)
                {
                    this.whiteEval = this.evaluation.whiteEval.Sum();
                    this.blackEval = this.evaluation.blackEval.Sum();
                }

                //searchDiagnostics.tableSize = (searchDiagnostics.entries * 16) / (10248576);

                if (SearchAlgorithm.isMateScore(this.bestEval))
                {
                    //mate in ply
                }

                this.bestEvalThisIteration = Number.MIN_VALUE;
                this.bestMoveThisIteration = Move.NullMove;

                // Update diagnostics
                // Exit search if found a mate within search depth.
                // A mate found outside of search depth (due to extensions) may not be the fastest mate.
                if (SearchAlgorithm.isMateScore(this.bestEval) && SearchAlgorithm.numPlyToMateFromScore(this.bestEval) <= searchDepth)
                {
                    //debugInfo += "\nExitting search due to mate found within search depth";
                    console.log('mate found');
                    break;
                }
            }

        }
    }

    search(plyRemaining = 0, plyFromRoot = 0, alpha = 0, beta = 0, prevMove = new Move(), prevWasCapture = false)
    {
        if (this.searchCancelled)
        {
            return 0;
        }
        if (plyFromRoot > 0)
        {
            // Detect draw by three-fold repetition.
            // (Note: returns a draw score even if this position has only appeared once for sake of simplicity)
            if (this.board.CurrentGameState.fiftyMoveCounter >= 100 || this.repetitionTable.contains(this.board.CurrentGameState.zobristKey))
            {
                
                   const contempt = 50;
                   // So long as not in king and pawn ending, prefer a slightly worse position over game ending in a draw
                   if (this.board.TotalPieceCountWithoutPawnsAndKings > 0)
                   {
                       let isAITurn = this.board.IsWhiteToMove == this.isPlayingWhite;
                       return isAITurn ? -contempt : contempt;
                   }
                
                return 0;
            }
   
            // Skip this position if a mating sequence has already been found earlier in the search, which would be shorter
            // than any mate we could find from here. This is done by observing that alpha can't possibly be worse
            // (and likewise beta can't  possibly be better) than being mated in the current position.
            alpha = Math.max(alpha, -SearchAlgorithm.immediateMateScore + plyFromRoot);
            beta = Math.min(beta, SearchAlgorithm.immediateMateScore - plyFromRoot);
            if (alpha >= beta)
            {
                return alpha;
            }
        }
   
        let ttVal = this.transpositionTable.lookupEvaluation(plyRemaining, plyFromRoot, alpha, beta);
        if (ttVal != TranspositionTable.LookupFailed)
        {
            if (plyFromRoot == 0)
            {
                this.bestMoveThisIteration = this.transpositionTable.tryGetStoredMove();
                this.bestEvalThisIteration = this.transpositionTable.entries[this.transpositionTable.Index].value;
            }
            this.searchDiagnostics.retrievals++;
            return ttVal;
        }
   
        if (plyRemaining == 0)
        {
            this.searchDiagnostics.leaves++;
            let evalScore =  this.evaluation.evaluate(this.board);
            return evalScore;
        }
   
        let moves = this.moveGenerator.GenerateMoves(this.board, false);
        let prevBestMove = plyFromRoot == 0 ? this.bestMove : this.transpositionTable.tryGetStoredMove();
        this.moveOrderer.orderMoves(prevBestMove, this.board, moves, this.moveGenerator.opponentAttackMap, this.moveGenerator.opponentPawnAttackMap, false, plyFromRoot);
   
        if (moves.length == 0)
        {
            if (this.moveGenerator.InCheck())
            {
                let mateScore = SearchAlgorithm.immediateMateScore - plyFromRoot;
                return -mateScore;
            }
            else
            {
                return 0;
            }
        }
   
        if (plyFromRoot > 0)
        {
            let wasPawnMove = Piece.pieceType(this.board.Square[prevMove.TargetSquare]) == Piece.Pawn;
            this.repetitionTable.push(this.board.CurrentGameState.zobristKey, prevWasCapture || wasPawnMove);
        }
   
        let evaluationBound = TranspositionTable.UpperBound;
        let bestMoveInThisPosition = Move.NullMove;
   
        for (let i = 0; i < moves.length; i++)
        {
            this.searchDiagnostics.branches++;
            let move = moves[i];
   
            let capturedPieceType = Piece.pieceType(this.board.Square[move.TargetSquare]);
            let isCapture = capturedPieceType != Piece.None;
   
            this.board.makeMove(move, true);
   
            let evalValue = 0;
            evalValue = -this.search(plyRemaining - 1, plyFromRoot + 1, -1 * beta, -1 * alpha, move, isCapture);
            this.board.unmakeMove(move, true);
   
            //fail hard
            if (evalValue >= beta)
            {
                // Store evaluation in transposition table. Note that since we're exiting the search early, there may be an
                // even better move we haven't looked at yet, and so the current eval is a lower bound on the actual eval.
                this.transpositionTable.storeEvaluation(plyRemaining, plyFromRoot, beta, TranspositionTable.LowerBound, moves[i]);
                this.searchDiagnostics.entries++;
   
                if (plyFromRoot > 0)
                {
                    this.repetitionTable.tryPop();
                }
                this.searchDiagnostics.prunes++;
                return beta;
            }
   
   
            // Found a new best move in this position
            if (evalValue > alpha)
            {
                evaluationBound = TranspositionTable.Exact;
                this.bestMoveInThisPosition = moves[i];
                alpha = evalValue;
                if (plyFromRoot == 0)
                {
                    this.bestMoveThisIteration = moves[i];
                    this.bestEvalThisIteration = evalValue;
                    this.hasSearchedAtLeastOneMove = true;
                }

            }
        }
   
        if (plyFromRoot > 0)
        {
            this.repetitionTable.tryPop();
        }
   
        this.transpositionTable.storeEvaluation(plyRemaining, plyFromRoot, alpha, evaluationBound, bestMoveInThisPosition);
        this.searchDiagnostics.entries++;
        return alpha;
    }

    
    getSearchResult()
    {
        return {bestMove:this.bestMove, bestEval:this.bestEval};
    }

    endSearch()
    {
        searchCancelled = true;
    }

    static isMateScore(score = 0)
    {
        if (score == Number.MIN_VALUE || score == SearchAlgorithm.negativeInfinity || score == SearchAlgorithm.positiveInfinity)
        {
            return false;
        }
        const maxMateDepth = 1000;
        return Math.abs(score) > SearchAlgorithm.immediateMateScore - maxMateDepth;
    }

    static numPlyToMateFromScore(score = 0)
    {
        return SearchAlgorithm.immediateMateScore - Math.abs(score);
    }
}