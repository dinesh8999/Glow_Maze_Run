(() => {
  // Elements
  const landingScreen = document.getElementById('landing-screen');
  const gameScreen = document.getElementById('game-screen');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const backBtn = document.getElementById('backBtn');
  const timerEl = document.getElementById('timer');
  const movesEl = document.getElementById('moves');
  const messageEl = document.getElementById('message');
  const canvas = document.getElementById('maze');
  const ctx = canvas.getContext('2d');

  const mazeSize = 15; // 15x15 grid
  const cellSize = canvas.width / mazeSize;

  // Maze layout
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,1,0,1,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // Player start position
  let player = {x:1, y:1};
  let moves = 0;
  let startTime = null;
  let elapsedTime = 0;
  let gameWon = false;
  let animationId;

  // Show screen helper
  function showScreen(screenToShow) {
    [landingScreen, gameScreen].forEach(s => s.classList.remove('active'));
    screenToShow.classList.add('active');
  }

  // Draw functions
  function drawCell(x, y, type) {
    const px = x * cellSize;
    const py = y * cellSize;
    ctx.lineWidth = 2;

    if(type === 1) { // Wall
      const grad = ctx.createRadialGradient(px + cellSize/2, py + cellSize/2, cellSize/4, px + cellSize/2, py + cellSize/2, cellSize/2);
      grad.addColorStop(0, '#0ff');
      grad.addColorStop(1, '#004d4d');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 15;
      ctx.fillRect(px, py, cellSize, cellSize);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#0ff';
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 10;
      ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
      ctx.shadowBlur = 0;

    } else if(type === 0) { // Path
      ctx.fillStyle = '#050505';
      ctx.fillRect(px, py, cellSize, cellSize);
    } else if(type === 2) { // Goal
      ctx.fillStyle = '#0f0';
      ctx.shadowColor = '#0f0';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/3, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawPlayer() {
    const px = player.x * cellSize;
    const py = player.y * cellSize;

    ctx.fillStyle = '#f0f';
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(px + cellSize/2, py + cellSize/2, cellSize/3, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawMaze() {
    for(let y = 0; y < mazeSize; y++) {
      for(let x = 0; x < mazeSize; x++) {
        drawCell(x, y, maze[y][x]);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPlayer();
  }

  // Movement check
  function canMove(x, y) {
    if(x < 0 || y < 0 || x >= mazeSize || y >= mazeSize) return false;
    return maze[y][x] !== 1;
  }

  // Handle player movement
  function handleMovement(dx, dy) {
    if(gameWon) return;
    const nx = player.x + dx;
    const ny = player.y + dy;

    if(canMove(nx, ny)) {
      player.x = nx;
      player.y = ny;
      moves++;
      movesEl.textContent = moves;
      if(!startTime) startTime = performance.now();

      if(maze[ny][nx] === 2) {
        gameWon = true;
        elapsedTime = (performance.now() - startTime) / 1000;
        messageEl.textContent = `🎉 You Won! Time: ${elapsedTime.toFixed(1)}s Moves: ${moves}`;
      }
    }
  }

  // Timer update
  function updateTimer() {
    if(gameWon || !startTime) return;
    elapsedTime = (performance.now() - startTime) / 1000;
    timerEl.textContent = elapsedTime.toFixed(1);
  }

  // Main game loop
  function gameLoop() {
    draw();
    updateTimer();
    animationId = requestAnimationFrame(gameLoop);
  }

  // Start game setup
  function startGame() {
    player = {x:1, y:1};
    moves = 0;
    startTime = null;
    elapsedTime = 0;
    gameWon = false;
    timerEl.textContent = '0.0';
    movesEl.textContent = '0';
    messageEl.textContent = '';
    showScreen(gameScreen);
    gameLoop();
  }

  // Stop game loop
  function stopGame() {
    cancelAnimationFrame(animationId);
  }

  // Event Listeners

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if(!gameScreen.classList.contains('active')) return;
    if(gameWon) return;

    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        handleMovement(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        handleMovement(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        handleMovement(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        handleMovement(1, 0);
        break;
    }
  });

  startBtn.addEventListener('click', () => {
    startGame();
  });

  restartBtn.addEventListener('click', () => {
    startGame();
  });

  backBtn.addEventListener('click', () => {
    stopGame();
    showScreen(landingScreen);
  });

})();