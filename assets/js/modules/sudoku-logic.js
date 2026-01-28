/**
 * Sudoku Logic Module
 * Generates 9x9 Sudoku puzzles with unique solutions.
 */
export const SudokuLogic = {
    // Difficulty levels: number of empty cells (approximate)
    DIFFICULTY: {
        EASY: 30,    // Standard Easy
        MEDIUM: 40,
        HARD: 50,
        EXPERT: 55   // Very Hard
    },

    /**
     * Generate a new puzzle
     * @param {number} holes Number of cells to remove
     * @returns {object} { puzzle: number[][], solution: number[][] }
     */
    generate(holes = 30) {
        // 1. Create a full valid board
        const solution = this.createSolvedBoard();

        // 2. Clone for puzzle
        const puzzle = solution.map(row => [...row]);

        // 3. Remove numbers to create puzzle
        this.removeNumbers(puzzle, holes);

        return {
            solution: solution,
            puzzle: puzzle
        };
    },

    /**
     * Create a fully solved 9x9 board using backtracking
     */
    createSolvedBoard() {
        // Try up to 20 times to generate a valid board within limits
        for (let attempt = 0; attempt < 20; attempt++) {
            const board = Array.from({ length: 9 }, () => Array(9).fill(0));

            // Fill diagonal 3x3 boxes first
            for (let i = 0; i < 9; i += 3) {
                this.fillBox(board, i, i);
            }

            // Solve the rest with step limit
            if (this.solve(board)) {
                return board;
            }
        }
        // Fallback
        return Array.from({ length: 9 }, () => Array(9).fill(0));
    },

    fillBox(board, row, col) {
        // Use a shuffled array of 1-9 to guarantee termination and validity
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Shuffle
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }

        // Fill box linearly
        let idx = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[row + i][col + j] = nums[idx++];
            }
        }
    },

    isSafe(board, row, col, num) {
        return !this.usedInRow(board, row, num) &&
            !this.usedInCol(board, col, num) &&
            !this.isSafeInBox(board, row - row % 3, col - col % 3, num);
    },

    usedInRow(board, row, num) {
        return board[row].includes(num);
    },

    usedInCol(board, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return true;
        }
        return false;
    },

    isSafeInBox(board, boxStartRow, boxStartCol, num) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxStartRow + i][boxStartCol + j] === num) return true;
            }
        }
        return false; // Actually strict implementation of usedInBox returns true if used
    },

    /**
     * Solves the board using backtracking with limits.
     * @returns {boolean} true if solvable
     */
    solve(board, stepState = { count: 0 }) {
        // Safety Break
        if (stepState.count++ > 50000) return false;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;

                            if (this.solve(board, stepState)) {
                                return true;
                            }

                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    },

    // Unified safety check
    isValid(board, row, col, num) {
        // Row check
        for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;

        // Col check
        for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;

        // Box check
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (board[i + startRow][j + startCol] === num) return false;

        return true;
    },

    /**
     * Remove numbers while ensuring unique solution
     */
    removeNumbers(board, holes) {
        let attempts = holes;
        const startTime = Date.now();
        const GLOBAL_TIMEOUT = 500; // ms

        // Get all filled positions
        let filledCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                filledCells.push({ r, c });
            }
        }

        // Shuffle cells to randomize removal
        for (let i = filledCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filledCells[i], filledCells[j]] = [filledCells[j], filledCells[i]];
        }

        // Try removing cells one by one
        let index = 0;
        while (attempts > 0 && index < filledCells.length) {
            if ((Date.now() - startTime) > GLOBAL_TIMEOUT) break;

            const { r, c } = filledCells[index];
            index++;

            const backup = board[r][c];
            board[r][c] = 0;

            // Clone board for checking
            const boardCopy = board.map(row => [...row]);

            const solutions = this.countSolutions(boardCopy, 2);

            if (solutions !== 1) {
                board[r][c] = backup; // Restore if not unique
            } else {
                attempts--;
            }
        }
    },

    /**
     * Count solutions with optimization (MRV heuristic) and Step Limit
     */
    countSolutions(board, limit) {
        let solutions = 0;
        let steps = 0;
        const MAX_STEPS = 5000; // Strict computation limit

        const solve = () => {
            steps++;
            if (steps > MAX_STEPS) return -1; // Abort computation
            if (solutions >= limit) return;

            // Find cell with minimum remaining values (MRV)
            let minCandidates = 10;
            let bestRow = -1;
            let bestCol = -1;
            let bestCandidates = [];

            let isEmpty = false;

            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (board[r][c] === 0) {
                        isEmpty = true;

                        // Calculate candidates for this cell
                        const candidates = [];
                        for (let num = 1; num <= 9; num++) {
                            if (this.isValid(board, r, c, num)) {
                                candidates.push(num);
                            }
                        }

                        if (candidates.length === 0) return; // Dead end

                        if (candidates.length < minCandidates) {
                            minCandidates = candidates.length;
                            bestRow = r;
                            bestCol = c;
                            bestCandidates = candidates;
                            if (minCandidates === 1) break; // Optimization: immediate pick
                        }
                    }
                }
                if (minCandidates === 1) break;
            }

            if (!isEmpty) {
                solutions++;
                return;
            }

            // Try candidates
            for (const num of bestCandidates) {
                board[bestRow][bestCol] = num;
                const res = solve();
                if (res === -1) return -1;

                if (solutions >= limit) {
                    board[bestRow][bestCol] = 0;
                    return;
                }
                board[bestRow][bestCol] = 0; // Backtrack
            }
        };

        // Deep copy board
        const boardCopy = board.map(r => [...r]);
        const result = solve();

        if (result === -1) return 999; // Treat timeout as "many solutions/too complex" -> do not remove
        return solutions;
    }
};
