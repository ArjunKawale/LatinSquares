const SIZE = 5;
const ALPHABET = ['A', 'B', 'C', 'D', 'E'];
let currentBoard = [];
let solutionBoard = [];
let targetCell = null;
let gameActive = true;
let currentDifficulty = 'easy';

document.getElementById('new-game-btn').addEventListener('click', initGame);
document.getElementById('show-solution-btn').addEventListener('click', showSolution);

// Custom Dropdown Logic
const selected = document.querySelector(".select-selected");
const items = document.querySelector(".select-items");
const options = items.querySelectorAll("div");

selected.addEventListener("click", function(e) {
    e.stopPropagation();
    this.classList.toggle("select-arrow-active");
    items.classList.toggle("select-hide");
});

options.forEach(option => {
    option.addEventListener("click", function(e) {
        e.stopPropagation();
        selected.innerHTML = `${this.innerText} <span class="select-arrow"></span>`;
        currentDifficulty = this.getAttribute("data-value");
        
        options.forEach(opt => opt.classList.remove("same-as-selected"));
        this.classList.add("same-as-selected");
        
        selected.classList.remove("select-arrow-active");
        items.classList.add("select-hide");
        
        initGame();
    });
});

document.addEventListener("click", function() {
    selected.classList.remove("select-arrow-active");
    items.classList.add("select-hide");
});

function initGame() {
    gameActive = true;
    let msg = document.getElementById('status-message');
    msg.innerText = "Select an answer below";
    msg.style.color = "var(--text-color)";
    
    generatePuzzle(currentDifficulty);
    renderBoard();
    renderMCQ();
}

function generatePuzzle(difficulty) {
    let validPuzzleFound = false;
    let targetClues, minDepth, maxDepth;

    if (difficulty === 'random') {
        targetClues = Math.floor(Math.random() * (14 - 9 + 1)) + 9; 
        minDepth = 1;   
        maxDepth = 999; 
    } else {
        targetClues = difficulty === 'easy' ? 13 : (difficulty === 'medium' ? 11 : 9);
        minDepth = difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3);
        maxDepth = difficulty === 'easy' ? 2 : (difficulty === 'medium' ? 3 : 999);
    }

    while (!validPuzzleFound) {
        let board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
        fillBoard(board);
        solutionBoard = JSON.parse(JSON.stringify(board));

        let puzzle = JSON.parse(JSON.stringify(board));
        let cells = [];
        for (let r=0; r<SIZE; r++) for (let c=0; c<SIZE; c++) cells.push({r, c});
        cells.sort(() => Math.random() - 0.5);

        let clues = 25;
        for (let cell of cells) {
            if (clues <= targetClues) break;
            let temp = puzzle[cell.r][cell.c];
            puzzle[cell.r][cell.c] = 0;
            
            if (countSolutions(JSON.parse(JSON.stringify(puzzle))) === 1) {
                clues--;
            } else {
                puzzle[cell.r][cell.c] = temp; 
            }
        }

        let depths = calculateDeductionDepths(JSON.parse(JSON.stringify(puzzle)));
        
        let validTargets = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (puzzle[r][c] === 0) {
                    let depth = depths[`${r},${c}`] || 999; 
                    if (depth >= minDepth && depth <= maxDepth) {
                        validTargets.push({r, c});
                    }
                }
            }
        }

        if (validTargets.length > 0) {
            targetCell = validTargets[Math.floor(Math.random() * validTargets.length)];
            currentBoard = puzzle;
            validPuzzleFound = true;
        }
    }
}

function calculateDeductionDepths(board) {
    let depths = {};
    let pass = 1;
    let keepGoing = true;

    while (keepGoing) {
        keepGoing = false;
        let solvedThisPass = [];

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === 0) {
                    let possible = getPossibleNumbers(board, r, c);
                    if (possible.length === 1) {
                        solvedThisPass.push({r, c, val: possible[0]});
                        depths[`${r},${c}`] = pass;
                    }
                }
            }
        }

        if (solvedThisPass.length > 0) {
            keepGoing = true;
            solvedThisPass.forEach(cell => board[cell.r][cell.c] = cell.val);
            pass++;
        }
    }
    return depths;
}

function getPossibleNumbers(board, row, col) {
    let possible = [...ALPHABET];
    for (let i = 0; i < SIZE; i++) {
        possible = possible.filter(n => n !== board[row][i] && n !== board[i][col]);
    }
    return possible;
}

function fillBoard(board) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) {
                let nums = [...ALPHABET].sort(() => Math.random() - 0.5);
                for (let num of nums) {
                    if (isValid(board, r, c, num)) {
                        board[r][c] = num;
                        if (fillBoard(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function countSolutions(board) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) {
                let count = 0;
                for (let num of ALPHABET) {
                    if (isValid(board, r, c, num)) {
                        board[r][c] = num;
                        count += countSolutions(board);
                        board[r][c] = 0;
                        if (count > 1) return count;
                    }
                }
                return count;
            }
        }
    }
    return 1;
}

function isValid(board, row, col, num) {
    for (let i = 0; i < SIZE; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    return true;
}

function renderBoard() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            let div = document.createElement('div');
            div.classList.add('cell');
            
            if (r === targetCell.r && c === targetCell.c) {
                div.classList.add('target');
                div.innerText = '?';
                div.id = 'target-element';
            } else if (currentBoard[r][c] !== 0) {
                div.classList.add('given');
                div.innerText = currentBoard[r][c];
            }
            grid.appendChild(div);
        }
    }
}

function renderMCQ() {
    const mcq = document.getElementById('mcq-options');
    mcq.innerHTML = '';
    
    for (let i = 0; i < SIZE; i++) {
        let val = ALPHABET[i];
        let btn = document.createElement('button');
        btn.classList.add('mcq-btn');
        btn.innerText = val;
        btn.onclick = (e) => submitAnswer(val, e.target);
        mcq.appendChild(btn);
    }
}

function submitAnswer(ans, btnElement) {
    if (!gameActive) return;
    let correctAns = solutionBoard[targetCell.r][targetCell.c];
    let msg = document.getElementById('status-message');
    let targetElement = document.getElementById('target-element');

    if (ans === correctAns) {
        msg.innerText = "Correct";
        btnElement.classList.add('correct');
        targetElement.innerText = ans;
        targetElement.classList.add('revealed-correct');
        gameActive = false;
        disableMCQ();
    } else {
        msg.innerText = "Incorrect";
        btnElement.classList.add('incorrect');
        btnElement.disabled = true;
    }
}

function showSolution() {
    gameActive = false;
    disableMCQ();
    let msg = document.getElementById('status-message');
    msg.innerText = "Solution";
    msg.style.color = "var(--text-color)";
    
    let cells = document.getElementsByClassName('cell');
    let index = 0;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (currentBoard[r][c] === 0) {
                cells[index].innerText = solutionBoard[r][c];
                if (r === targetCell.r && c === targetCell.c) {
                    cells[index].classList.add('revealed-target-solution');
                } else {
                    cells[index].classList.add('revealed-solution');
                }
            }
            index++;
        }
    }
}

function disableMCQ() {
    document.querySelectorAll('.mcq-btn').forEach(btn => btn.disabled = true);
}

initGame();