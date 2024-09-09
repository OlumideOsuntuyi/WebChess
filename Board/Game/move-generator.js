const MAX_BIGINT = (BigInt(1) << BigInt(63)) - BigInt(1);

class PromotionMode 
{ 
    static All = 0;
    static QueenOnly = 1;
    static QueenAndKnight = 2;
}

class Reference
{
    constructor(value)
    {
        this.value = value;
    }
}

class MoveGenerator
{
    static MaxMoves = 218;

    constructor()
    {
        this.promotionsToGenerate = PromotionMode.All;

        // ---- Instance variables ----
        this.isWhiteToMove = true;
        this.friendlyColour = Piece.White;
        this.opponentColour = Piece.Black;

        this.friendlyKingSquare = 4;
        this.friendlyIndex = 0;
        this.enemyIndex = 0;
    
        this.inCheck = false;
        this.inDoubleCheck = false;
    
        // If in check, this bitboard contains squares in line from checking piece up to king
        // If not in check, all bits are set to 1
        this.checkRayBitmask = 0n;
    
        this.pinRays = 0n;
        this.notPinRays = 0n;
        this.opponentAttackMapNoPawns = 0n;
        this.opponentAttackMap = 0n;
        this.opponentPawnAttackMap = 0n;
        this.opponentSlidingAttackMap = 0n;
    
        this.generateQuietMoves = false;
        this.board = new Board();
        this.currMoveIndex = 0;
    
        this.enemyPieces = 0n;
        this.friendlyPieces = 0n;
        this.allPieces = 0n;
        this.emptySquares = 0n;
        this.emptyOrEnemySquares = 0n;
        // If only captures should be generated, this will have 1s only in positions of enemy pieces.
        // Otherwise it will have 1s everywhere.
        this.moveTypeMask = 0n;
    }

    // translated from returning Span<Move>
    GenerateMoves(board, capturesOnly = false)
    {
        let moves = new Array(MoveGenerator.MaxMoves).fill(null);

        this.OnGenerateMoves(board, moves, capturesOnly);
        return moves;
    }

    // Generates list of legal moves in current position.
    // Quiet moves (non captures) can optionally be excluded. This is used in quiescence search.
    OnGenerateMoves(board, moves, capturesOnly = false)
    {
        this.board = board;
        this.generateQuietMoves = !capturesOnly;

        this.Init();

        this.GenerateKingMoves(moves);

        // Only king moves are valid in a double check position, so can return early.
        if (!this.inDoubleCheck)
        {
            this.GenerateSlidingMoves(moves);
            this.GenerateKnightMoves(moves);
            this.GeneratePawnMoves(moves);
        }

        moves = moves.slice(0, this.currMoveIndex);

        return moves.length;
    }

    // Note, this will only return correct value after GenerateMoves() has been called in the current position
    InCheck()
    {
        return this.inCheck;
    }

    Init()
    {
        // Reset state
        this.currMoveIndex = 0;
        this.inCheck = false;
        this.inDoubleCheck = false;
        this.checkRayBitmask = 0n;
        this.pinRays = 0n;

        // Store some info for convenience
        this.isWhiteToMove = this.board.MoveColour == Piece.White;
        this.friendlyColour = this.board.MoveColour;
        this.opponentColour = this.board.OpponentColour;
        this.friendlyKingSquare = this.board.KingSquare[this.board.MoveColourIndex];
        this.friendlyIndex = this.board.MoveColourIndex;
        this.enemyIndex = 1 - this.friendlyIndex;

        // Store some bitboards for convenience
        this.enemyPieces = this.board.ColourBitboards[this.enemyIndex];
        this.friendlyPieces = this.board.ColourBitboards[this.friendlyIndex];
        this.allPieces = this.board.AllPiecesBitboard;
        this.emptySquares = ~this.allPieces;
        this.emptyOrEnemySquares = this.emptySquares | this.enemyPieces;
        this.moveTypeMask = this.generateQuietMoves ? MAX_BIGINT : this.enemyPieces;

        this.CalculateAttackData();
    }

    GenerateKingMoves(moves)
    {
        let legalMask = ~(this.opponentAttackMap | this.friendlyPieces);
        let kingMoves = BitBoardUtility.KingMoves[this.friendlyKingSquare] & legalMask & this.moveTypeMask;

        let kingMovesReference = new Reference(kingMoves);

        while (kingMoves != 0n)
        {
            let targetSquare = BitBoardUtility.PopLSB(kingMovesReference);
            kingMoves = kingMovesReference.value; //retrieve modified value

            moves[this.currMoveIndex++] = new Move(this.friendlyKingSquare, targetSquare);
        }

        // Castling
        if (!this.inCheck && this.generateQuietMoves)
        {
            let castleBlockers = this.opponentAttackMap | this.board.AllPiecesBitboard;
            if (this.board.CurrentGameState.HasKingsideCastleRight(this.board.IsWhiteToMove))
            {
                let castleMask = this.board.IsWhiteToMove ? Bits.WhiteKingsideMask : Bits.BlackKingsideMask;
                if ((castleMask & castleBlockers) == 0n)
                {
                    let targetSquare = this.board.IsWhiteToMove ? BoardHelper.g1 : BoardHelper.g8;
                    moves[this.currMoveIndex++] = new Move(this.friendlyKingSquare, targetSquare, Move.CastleFlag);
                }
            }
            if (this.board.CurrentGameState.HasQueensideCastleRight(this.board.IsWhiteToMove))
            {
                let castleMask = this.board.IsWhiteToMove ? Bits.WhiteQueensideMask2 : Bits.BlackQueensideMask2;
                let castleBlockMask = this.board.IsWhiteToMove ? Bits.WhiteQueensideMask : Bits.BlackQueensideMask;
                if ((castleMask & castleBlockers) == 0n && (castleBlockMask & this.board.AllPiecesBitboard) == 0n)
                {
                    let targetSquare = this.board.IsWhiteToMove ? BoardHelper.c1 : BoardHelper.c8;
                    moves[this.currMoveIndex++] = new Move(this.friendlyKingSquare, targetSquare, Move.CastleFlag);
                }
            }
        }
    }

    GenerateSlidingMoves(moves)
    {
        // Limit movement to empty or enemy squares, and must block check if king is in check.
        let moveMask = this.emptyOrEnemySquares & this.checkRayBitmask & this.moveTypeMask;

        let othogonalSliders = this.board.FriendlyOrthogonalSliders;
        let diagonalSliders = this.board.FriendlyDiagonalSliders;

        // Pinned pieces cannot move if king is in check
        if (this.inCheck)
        {
            othogonalSliders &= ~this.pinRays;
            diagonalSliders &= ~this.pinRays;
        }

        // Ortho
        while (othogonalSliders != 0n)
        {
            let orthogonalSlidersReference = new Reference(othogonalSliders);
            let startSquare = BitBoardUtility.PopLSB(orthogonalSlidersReference);
            let moveSquares = Magic.GetRookAttacks(startSquare, this.allPieces) & moveMask;

            othogonalSliders = orthogonalSlidersReference.value;

            // If piece is pinned, it can only move along the pin ray
            if (this.IsPinned(startSquare))
            {
                moveSquares &= PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare];
            }

            while (moveSquares != 0n)
            {
                let moveSquaresReference = new Reference(moveSquares);
                let targetSquare = BitBoardUtility.PopLSB(moveSquaresReference);

                moveSquares = moveSquaresReference.value;

                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare);
            }
        }

        // Diag
        while (diagonalSliders != 0n)
        {
            let diagonalSlidersReference = new Reference(diagonalSliders);
            let startSquare = BitBoardUtility.PopLSB(diagonalSlidersReference);
            let moveSquares = Magic.GetBishopAttacks(startSquare, this.allPieces) & moveMask;

            diagonalSliders = diagonalSlidersReference.value;

            // If piece is pinned, it can only move along the pin ray
            if (this.IsPinned(startSquare))
            {
                moveSquares &= PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare];
            }

            while (moveSquares != 0n)
            {
                let moveSquaresReference = new Reference(moveSquares);
                let targetSquare = BitBoardUtility.PopLSB(moveSquaresReference);
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare);
                moveSquares = moveSquaresReference.value;
            }
        }
    }


    GenerateKnightMoves(moves)
    {
        let friendlyKnightPiece = Piece.makePiece(Piece.Knight, this.board.MoveColour);
        // bitboard of all non-pinned knights
        let knights = this.board.PieceBitboards[friendlyKnightPiece] & this.notPinRays;
        let moveMask = this.emptyOrEnemySquares & this.checkRayBitmask & this.moveTypeMask;

        while (knights != 0n)
        {
            let knightsReference = new Reference(knights);
            let knightSquare = BitBoardUtility.PopLSB(knightsReference);
            let moveSquares = BitBoardUtility.KnightAttacks[knightSquare] & moveMask;

            knights = knightsReference.value;

            while (moveSquares != 0n)
            {
                let moveSquaresReference = new Reference(moveSquares);
                let targetSquare = BitBoardUtility.PopLSB(moveSquaresReference);
                moves[this.currMoveIndex++] = new Move(knightSquare, targetSquare);
                moveSquares = moveSquaresReference.value;
            }
        }
    }

    GeneratePawnMoves(moves)
    {
        let pushDir = this.board.IsWhiteToMove ? 1 : -1;
        let pushOffset = pushDir * 8;

        let friendlyPawnPiece = Piece.makePiece(Piece.Pawn, this.board.MoveColour);
        let pawns = this.board.PieceBitboards[friendlyPawnPiece];

        let promotionRankMask = this.board.IsWhiteToMove ? BitBoardUtility.Rank8 : BitBoardUtility.Rank1;

        let singlePush = (BitBoardUtility.Shift(pawns, pushOffset)) & this.emptySquares;

        let pushPromotions = singlePush & promotionRankMask & this.checkRayBitmask;


        let captureEdgeFileMask = this.board.IsWhiteToMove ? BitBoardUtility.notAFile : BitBoardUtility.notHFile;
        let captureEdgeFileMask2 = this.board.IsWhiteToMove ? BitBoardUtility.notHFile : BitBoardUtility.notAFile;
        let captureA = BitBoardUtility.Shift(pawns & captureEdgeFileMask, pushDir * 7) & this.enemyPieces;
        let captureB = BitBoardUtility.Shift(pawns & captureEdgeFileMask2, pushDir * 9) & this.enemyPieces;

        let singlePushNoPromotions = singlePush & ~promotionRankMask & this.checkRayBitmask;

        let capturePromotionsA = captureA & promotionRankMask & this.checkRayBitmask;
        let capturePromotionsB = captureB & promotionRankMask & this.checkRayBitmask;

        captureA &= this.checkRayBitmask & ~promotionRankMask;
        captureB &= this.checkRayBitmask & ~promotionRankMask;

        // Single / double push
        if (this.generateQuietMoves)
        {
            // Generate single pawn pushes
            while (singlePushNoPromotions != 0n)
            {
                let singlePushNoPromotionsReference = new Reference(singlePushNoPromotions);
                let targetSquare = BitBoardUtility.PopLSB(singlePushNoPromotionsReference);
                let startSquare = targetSquare - pushOffset;
                singlePushNoPromotions = singlePushNoPromotionsReference.value;

                if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.currMoveIndexfriendlyKingSquare])
                {
                    moves[this.currMoveIndex++] = new Move(startSquare, targetSquare);
                }
            }

            // Generate double pawn pushes
            let doublePushTargetRankMask = this.board.IsWhiteToMove ? BitBoardUtility.Rank4 : BitBoardUtility.Rank5;
            let doublePush = BitBoardUtility.Shift(singlePush, pushOffset) & this.emptySquares & doublePushTargetRankMask & this.checkRayBitmask;

            while (doublePush != 0n)
            {
                let doublePushReference = new Reference(doublePush);
                let targetSquare = BitBoardUtility.PopLSB(doublePushReference);
                let startSquare = targetSquare - pushOffset * 2;
                doublePush = doublePushReference.value;

                if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.friendlyKingSquare])
                {
                    moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.PawnTwoUpFlag);
                }
            }
        }

        // Captures
        while (captureA != 0n)
        {
            let captureAReference = new Reference(captureA);
            let targetSquare = BitBoardUtility.PopLSB(captureAReference);
            let startSquare = targetSquare - pushDir * 7;

            captureA = captureAReference.value;

            if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.friendlyKingSquare])
            {
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare);
            }
        }

        while (captureB != 0n)
        {
            let captureBReference = new Reference(captureB);
            let targetSquare = BitBoardUtility.PopLSB(captureBReference);
            let startSquare = targetSquare - pushDir * 9;

            captureB = captureBReference.value;

            if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.friendlyKingSquare])
            {
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare);
            }
        }



        // Promotions
        while (pushPromotions != 0n)
        {
            let pushPromotionsReference = new Reference(pushPromotions);
            let targetSquare = BitBoardUtility.PopLSB(pushPromotionsReference);
            let startSquare = targetSquare - pushOffset;

            pushPromotions = pushPromotionsReference.value;
            if (!this.IsPinned(startSquare))
            {
                this.GeneratePromotions(startSquare, targetSquare, moves);
            }
        }


        while (capturePromotionsA != 0n)
        {
            let capturePromotionsAReference = new Reference(capturePromotionsA);
            let targetSquare = BitBoardUtility.PopLSB(capturePromotionsAReference);
            let startSquare = targetSquare - pushDir * 7;

            capturePromotionsA = capturePromotionsAReference.value;

            if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.friendlyKingSquare])
            {
                this.GeneratePromotions(startSquare, targetSquare, moves);
            }
        }

        while (capturePromotionsB != 0n)
        {
            let capturePromotionsBReference = new Reference(capturePromotionsB);
            let targetSquare = BitBoardUtility.PopLSB(capturePromotionsBReference);
            let startSquare = targetSquare - pushDir * 9;

            capturePromotionsB = capturePromotionsBReference.value;

            if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.friendlyKingSquare])
            {
                this.GeneratePromotions(startSquare, targetSquare, moves);
            }
        }

        // En passant
        if (this.board.CurrentGameState.enPassantFile > 0)
        {
            let epFileIndex = this.board.CurrentGameState.enPassantFile - 1;
            let epRankIndex = this.board.IsWhiteToMove ? 5 : 2;
            let targetSquare = epRankIndex * 8 + epFileIndex;
            let capturedPawnSquare = targetSquare - pushOffset;

            if (BitBoardUtility.ContainsSquare(this.checkRayBitmask, capturedPawnSquare))
            {
                let pawnsThatCanCaptureEp = pawns & BitBoardUtility.PawnAttacks(1n << targetSquare, !this.board.IsWhiteToMove);

                while (pawnsThatCanCaptureEp != 0n)
                {
                    let pawnsThatCanCaptureEpReference = new Reference(pawnsThatCanCaptureEp);
                    let startSquare = BitBoardUtility.PopLSB(pawnsThatCanCaptureEpReference);
                    pawnsThatCanCaptureEp = pawnsThatCanCaptureEpReference.value;

                    if (!this.IsPinned(startSquare) || PrecomputedMoveData.alignMask[startSquare][this.friendlyKingSquare] == PrecomputedMoveData.alignMask[targetSquare][this.friendlyKingSquare])
                    {
                        if (!this.InCheckAfterEnPassant(startSquare, targetSquare, capturedPawnSquare))
                        {
                            moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.EnPassantCaptureFlag);
                        }
                    }
                }
            }
        }
    }

    GeneratePromotions(startSquare, targetSquare, moves)
    {
        moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.PromoteToQueenFlag);
        // Don't generate non-queen promotions in q-search
        if (this.generateQuietMoves)
        {
            if (this.promotionsToGenerate == PromotionMode.All)
            {
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.PromoteToKnightFlag);
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.PromoteToRookFlag);
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.PromoteToBishopFlag);
            }
            else if (this.promotionsToGenerate == PromotionMode.QueenAndKnight)
            {
                moves[this.currMoveIndex++] = new Move(startSquare, targetSquare, Move.PromoteToKnightFlag);
            }
        }
    }

    IsPinned(square)
    {
        return ((this.pinRays >> BigInt(square)) & 1n) != 0n;
    }

    GenSlidingAttackMap()
    {
        this.opponentSlidingAttackMap = 0n;

        this.UpdateSlideAttack(this.board.EnemyOrthogonalSliders, true);
        this.UpdateSlideAttack(this.board.EnemyDiagonalSliders, false);
    }

    UpdateSlideAttack(pieceBoard, ortho)
    {
        let blockers = this.board.AllPiecesBitboard & ~(1n << BigInt(this.friendlyKingSquare));

        while (pieceBoard != 0)
        {
            let pieceBoardReference = new Reference(pieceBoard);
            let startSquare = BitBoardUtility.PopLSB(pieceBoardReference);

            pieceBoard = pieceBoardReference.value;

            let moveBoard = Magic.GetSliderAttacks(startSquare, blockers, ortho);

            this.opponentSlidingAttackMap |= moveBoard;
        }
    }

    CalculateAttackData()
    {
        this.GenSlidingAttackMap();
        // Search squares in all directions around friendly king for checks/pins by enemy sliding pieces (queen, rook, bishop)
        let startDirIndex = 0;
        let endDirIndex = 8;

        if (this.board.Queens[this.enemyIndex].Count == 0)
        {
            startDirIndex = (this.board.Rooks[this.enemyIndex].Count > 0) ? 0 : 4;
            endDirIndex = (this.board.Bishops[this.enemyIndex].Count > 0) ? 8 : 4;
        }

        for (let dir = startDirIndex; dir < endDirIndex; dir++)
        {
            let isDiagonal = dir > 3;
            let slider = isDiagonal ? this.board.EnemyDiagonalSliders : this.board.EnemyOrthogonalSliders;
            if ((PrecomputedMoveData.dirRayMask[dir][this.friendlyKingSquare] & slider) == 0n)
            {
                continue;
            }

            let n = PrecomputedMoveData.numSquaresToEdge[this.friendlyKingSquare][dir];
            let directionOffset = PrecomputedMoveData.directionOffsets[dir];
            let isFriendlyPieceAlongRay = false;
            let rayMask = 0n;

            for (let i = 0; i < n; i++)
            {
                let squareIndex = this.friendlyKingSquare + directionOffset * (i + 1);
                rayMask |= 1n << BigInt(squareIndex);
                let piece = this.board.Square[squareIndex];

                // This square contains a piece
                if (piece != Piece.None)
                {
                    if (Piece.isColour(piece, this.friendlyColour))
                    {
                        // First friendly piece we have come across in this direction, so it might be pinned
                        if (!isFriendlyPieceAlongRay)
                        {
                            isFriendlyPieceAlongRay = true;
                        }
                        // This is the second friendly piece we've found in this direction, therefore pin is not possible
                        else
                        {
                            break;
                        }
                    }
                    // This square contains an enemy piece
                    else
                    {
                        let pieceType = Piece.pieceType(piece);

                        // Check if piece is in bitmask of pieces able to move in current direction
                        if (isDiagonal && Piece.isDiagonalSlider(pieceType) || !isDiagonal && Piece.isOrthagonalSlider(pieceType))
                        {
                            // Friendly piece blocks the check, so this is a pin
                            if (isFriendlyPieceAlongRay)
                            {
                                this.pinRays |= BigInt(rayMask);
                            }
                            // No friendly piece blocking the attack, so this is a check
                            else
                            {
                                this.checkRayBitmask |= BigInt(rayMask);
                                this.inDoubleCheck = this.inCheck; // if already in check, then this is double check
                                this.inCheck = true;
                            }
                            break;
                        }
                        else
                        {
                            // This enemy piece is not able to move in the current direction, and so is blocking any checks/pins
                            break;
                        }
                    }
                }
            }
            // Stop searching for pins if in double check, as the king is the only piece able to move in that case anyway
            if (this.inDoubleCheck)
            {
                break;
            }
        }

        this.notPinRays = ~this.pinRays;

        let opponentKnightAttacks = 0n;
        let knights = this.board.PieceBitboards[Piece.makePiece(Piece.Knight, this.board.OpponentColour)];
        let friendlyKingBoard = this.board.PieceBitboards[Piece.makePiece(Piece.King, this.board.MoveColour)];

        while (knights != 0n)
        {
            let knightsReference = new Reference(knights);
            let knightSquare = BitBoardUtility.PopLSB(knightsReference);
            knights = knightsReference.value;

            let knightAttacks = BitBoardUtility.KnightAttacks[knightSquare];
            opponentKnightAttacks |= knightAttacks;

            if ((knightAttacks & friendlyKingBoard) != 0n)
            {
                this.inDoubleCheck = this.inCheck;
                this.inCheck = true;
                this.checkRayBitmask |= 1n << BigInt(knightSquare);
            }
        }

        // Pawn attacks
        let opponentPawns = this.board.Pawns[this.enemyIndex];
        this.opponentPawnAttackMap = 0n;

        let opponentPawnsBoard = this.board.PieceBitboards[Piece.makePiece(Piece.Pawn, this.board.OpponentColour)];
        this.opponentPawnAttackMap = BitBoardUtility.PawnAttacks(opponentPawnsBoard, !this.isWhiteToMove);
        if (BitBoardUtility.ContainsSquare(this.opponentPawnAttackMap, this.friendlyKingSquare))
        {
            this.inDoubleCheck = this.inCheck; // if already in check, then this is double check
            this.inCheck = true;
            let possiblePawnAttackOrigins = this.board.IsWhiteToMove ? BitBoardUtility.WhitePawnAttacks[this.friendlyKingSquare] : BitBoardUtility.BlackPawnAttacks[this.friendlyKingSquare];
            let pawnCheckMap = opponentPawnsBoard & possiblePawnAttackOrigins;
            this.checkRayBitmask |= BigInt(pawnCheckMap);
        }

        let enemyKingSquare = this.board.KingSquare[this.enemyIndex];

        this.opponentAttackMapNoPawns = this.opponentSlidingAttackMap | opponentKnightAttacks | BitBoardUtility.KingMoves[enemyKingSquare];
        this.opponentAttackMap = this.opponentAttackMapNoPawns | this.opponentPawnAttackMap;

        if (!this.inCheck)
        {
            this.checkRayBitmask = MAX_BIGINT;
        }
    }

    // Test if capturing a pawn with en-passant reveals a sliding piece attack against the king
    // Note: this is only used for cases where pawn appears to not be pinned due to opponent pawn being on same rank
    // (therefore only need to check orthogonal sliders)
    InCheckAfterEnPassant(startSquare, targetSquare, epCaptureSquare)
    {
        let enemyOrtho = this.board.EnemyOrthogonalSliders;

        if (enemyOrtho != 0n)
        {
            let maskedBlockers = (this.allPieces ^ (1n << epCaptureSquare | 1n << startSquare | 1n << targetSquare));
            let rookAttacks = Magic.GetRookAttacks(friendlyKingSquare, maskedBlockers);
            return (rookAttacks & enemyOrtho) != 0;
        }

        return false;
    }
}