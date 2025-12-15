// Variables pour le jeu Pong
let pongGame = {
    canvas: null,
    ctx: null,
    ball: { x: 300, y: 200, dx: 5, dy: 5, radius: 10 },
    playerPaddle: { x: 50, y: 175, width: 10, height: 50 },
    computerPaddle: { x: 540, y: 175, width: 10, height: 50 },
    playerScore: 0,
    computerScore: 0,
    gameLoop: null
};

// Initialiser le jeu Pong
window.initializePong = function() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    
    pongGame.canvas = canvas;
    pongGame.ctx = ctx;
    pongGame.ball = { 
        x: canvas.width / 2, 
        y: canvas.height / 2, 
        dx: window.gameRules.pong.vitesse, 
        dy: window.gameRules.pong.vitesse, 
        radius: 10 
    };
    pongGame.playerPaddle = { x: 50, y: canvas.height / 2 - 25, width: 10, height: 50 };
    pongGame.computerPaddle = { x: canvas.width - 60, y: canvas.height / 2 - 25, width: 10, height: 50 };
    pongGame.playerScore = 0;
    pongGame.computerScore = 0;
    window.currentRound = 1;
    
    document.getElementById('pong-score-joueur').textContent = pongGame.playerScore;
    document.getElementById('pong-score-adversaire').textContent = pongGame.computerScore;
    document.getElementById('pong-manche').textContent = window.currentRound;
    document.getElementById('pong-manches').textContent = window.gameRules.pong.manches;
    document.getElementById('resultat-pong').textContent = '';
    
    // Contrôles
    document.addEventListener('keydown', handlePongKeyPress);
    
    // Démarrer le jeu
    if (pongGame.gameLoop) clearInterval(pongGame.gameLoop);
    pongGame.gameLoop = setInterval(updatePong, 1000 / 60);
    
    drawPong();
}

function handlePongKeyPress(e) {
    if (window.currentGameType !== 'pong') return;
    
    const paddleSpeed = 10;
    switch(e.key) {
        case 'ArrowUp':
            pongGame.playerPaddle.y = Math.max(0, pongGame.playerPaddle.y - paddleSpeed);
            break;
        case 'ArrowDown':
            pongGame.playerPaddle.y = Math.min(
                pongGame.canvas.height - pongGame.playerPaddle.height,
                pongGame.playerPaddle.y + paddleSpeed
            );
            break;
    }
}

function updatePong() {
    const ball = pongGame.ball;
    const player = pongGame.playerPaddle;
    const computer = pongGame.computerPaddle;
    
    // Déplacer la balle
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Rebond sur les murs haut/bas
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > pongGame.canvas.height) {
        ball.dy = -ball.dy;
    }
    
    // IA de l'ordinateur
    computer.y += (ball.y - (computer.y + computer.height / 2)) * 0.1;
    computer.y = Math.max(0, Math.min(pongGame.canvas.height - computer.height, computer.y));
    
    // Collision avec les raquettes
    if (ball.x - ball.radius < player.x + player.width && 
        ball.y > player.y && ball.y < player.y + player.height) {
        ball.dx = Math.abs(ball.dx);
    }
    
    if (ball.x + ball.radius > computer.x && 
        ball.y > computer.y && ball.y < computer.y + computer.height) {
        ball.dx = -Math.abs(ball.dx);
    }
    
    // Marquer un point
    if (ball.x - ball.radius < 0) {
        pongGame.computerScore++;
        resetPongBall();
    } else if (ball.x + ball.radius > pongGame.canvas.width) {
        pongGame.playerScore++;
        resetPongBall();
    }
    
    // Mettre à jour l'affichage
    document.getElementById('pong-score-joueur').textContent = pongGame.playerScore;
    document.getElementById('pong-score-adversaire').textContent = pongGame.computerScore;
    
    // Vérifier la fin de manche
    const pointsToWin = window.gameRules.pong.pointsToWin || 5;
    if (pongGame.playerScore >= pointsToWin || pongGame.computerScore >= pointsToWin) {
        endPongRound();
    }
    
    drawPong();
}

function resetPongBall() {
    pongGame.ball.x = pongGame.canvas.width / 2;
    pongGame.ball.y = pongGame.canvas.height / 2;
    pongGame.ball.dx = -pongGame.ball.dx;
    pongGame.ball.dy = (Math.random() - 0.5) * 10;
}

function drawPong() {
    const ctx = pongGame.ctx;
    const ball = pongGame.ball;
    const player = pongGame.playerPaddle;
    const computer = pongGame.computerPaddle;
    
    // Effacer le canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
    
    // Ligne centrale
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(pongGame.canvas.width / 2, 0);
    ctx.lineTo(pongGame.canvas.width / 2, pongGame.canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dessiner la balle
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Dessiner les raquettes
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
}

function endPongRound() {
    window.currentRound++;
    document.getElementById('pong-manche').textContent = window.currentRound;
    
    if (window.currentRound > window.gameRules.pong.manches) {
        clearInterval(pongGame.gameLoop);
        let message = "Match terminé! ";
        if (pongGame.playerScore > pongGame.computerScore) {
            message += `🎉 ${window.gameRules.pong.victoire}`;
        } else {
            message += `💥 ${window.gameRules.pong.defaite} - ${window.gameRules.pong.punition}`;
        }
        document.getElementById('resultat-pong').textContent = message;
        document.removeEventListener('keydown', handlePongKeyPress);
    } else {
        pongGame.playerScore = 0;
        pongGame.computerScore = 0;
        document.getElementById('pong-score-joueur').textContent = pongGame.playerScore;
        document.getElementById('pong-score-adversaire').textContent = pongGame.computerScore;
        resetPongBall();
    }
}