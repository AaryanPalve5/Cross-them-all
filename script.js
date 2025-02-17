document.addEventListener('DOMContentLoaded', () => {
    const mazeContainer = document.getElementById('maze');
    const startBtn = document.getElementById('startBtn');
    const scoreDisplay = document.getElementById('score');
    const gameMessage = document.getElementById('gameMessage');
    const shortestPathDisplay = document.getElementById('shortestPathDisplay');
    const mazeSize = 10;
    const maze = [];
    let playerPosition = { x: 0, y: 0 };
    let moveCount = 0;
    let visitedCells = 0;
    const totalCells = mazeSize * mazeSize - 14; // Subtract obstacles
    let timer;
    let timeLeft;

    function initMaze() {
        mazeContainer.innerHTML = ''; // Clear the maze
        gameMessage.textContent = '';
        shortestPathDisplay.textContent = '';
        maze.length = 0;
        moveCount = 0;
        visitedCells = 0;
        updateScore();

        // Create the maze cells and populate the maze array:
        for (let y = 0; y < mazeSize; y++) {
            maze[y] = [];
            for (let x = 0; x < mazeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                mazeContainer.appendChild(cell);
                maze[y][x] = cell;
            }
        }

        generateMaze(); // NOW generate the maze, after the cells are created

        maze[0][0].classList.add('start');
        maze[mazeSize - 1][mazeSize - 1].classList.add('end');
        playerPosition = { x: 0, y: 0 };
        updatePlayerPosition(); 
    }

    function generateMaze() {
        const stack = [{ x: 0, y: 0 }];
        const visited = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(false));
        visited[0][0] = true;

        function carvePath(x, y) {
            const directions = [
                { dx: 2, dy: 0 }, // Right
                { dx: -2, dy: 0 }, // Left
                { dx: 0, dy: 2 }, // Down
                { dx: 0, dy: -2 } // Up
            ];

            directions.sort(() => Math.random() - 0.5);

            for (const { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;
                const mx = x + dx / 2;
                const my = y + dy / 2;

                if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    maze[mx][my].classList.remove('obstacle');
                    maze[ny][nx].classList.remove('obstacle');
                    stack.push({ x: nx, y: ny });
                    carvePath(nx, ny);
                }
            }
        }

        carvePath(0, 0);

        let placedObstacles = 0;
        while (placedObstacles < 14) {
            let x, y;
            do {
                x = Math.floor(Math.random() * mazeSize);
                y = Math.floor(Math.random() * mazeSize);
            } while ((x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1) || maze[y][x].classList.contains('obstacle'));

            maze[y][x].classList.add('obstacle');
            placedObstacles++;
        }
    }

    function updatePlayerPosition() {
        const currentCell = maze[playerPosition.y][playerPosition.x];
        if (!currentCell.classList.contains('visited')) {
            currentCell.classList.add('visited');
            visitedCells++;
        }
        currentCell.classList.add('player');
    }

    window.movePlayer = function(dx, dy) {
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize) {
            if (!maze[newY][newX].classList.contains('obstacle')) {
                maze[playerPosition.y][playerPosition.x].classList.remove('player');
                playerPosition = { x: newX, y: newY };
                updatePlayerPosition();
                moveCount++;
                updateScore();

                if (playerPosition.x === mazeSize - 1 && playerPosition.y === mazeSize - 1) {
                    if (visitedCells === totalCells) {
                        gameOver("Congratulations! You visited all cells and won!");
                    } else {
                        gameOver("YOU LOST! You didn\'t visit all cells.");
                    }
                }
            } else {
                alert('Blocked by an obstacle!');
            }
        }
    };

    function updateScore() {
        scoreDisplay.textContent = `Moves: ${moveCount}`;
    }

    function startGame() {
        initMaze();

        timeLeft = 60; // 1 minute in seconds
        updateTimerDisplay();
        gameMessage.textContent = ""; // Clear any previous messages

        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft < 0) {
                clearInterval(timer);
                gameOver("Time's up! You lost!");
            } else if (playerPosition.x === mazeSize - 1 && playerPosition.y === mazeSize - 1 && visitedCells === totalCells) {
                clearInterval(timer);
                gameOver("Congratulations! You visited all cells and won!");
            } else if (playerPosition.x === mazeSize - 1 && playerPosition.y === mazeSize - 1 && visitedCells < totalCells){
                clearInterval(timer);
                gameOver("YOU LOST! You didn\'t visit all cells.");
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer'); 
        if (timerDisplay) {
            timerDisplay.textContent = `Time: ${timeLeft}`;
        } else {
            console.error("Timer display element not found!");
        }
    }

    function gameOver(message) {
        gameMessage.textContent = message;
        clearInterval(timer); // Stop the timer
        alert(message + " Try again!");  // Or a more styled alert if you prefer
        startBtn.click();
    }

    startBtn.addEventListener('click', startGame);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') movePlayer(0, -1);
        if (e.key === 'ArrowDown') movePlayer(0, 1);
        if (e.key === 'ArrowLeft') movePlayer(-1, 0);
        if (e.key === 'ArrowRight') movePlayer(1, 0);
        if (e.key === 'q') movePlayer(-1, -1); // Diagonal: Up-left
        if (e.key === 'e') movePlayer(1, -1);  // Diagonal: Up-right
        if (e.key === 'z') movePlayer(-1, 1);  // Diagonal: Down-left
        if (e.key === 'c') movePlayer(1, 1);   // Diagonal: Down-right
    });
});