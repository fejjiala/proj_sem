// Pong Game Implementation
class PongGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.animationId = null;
        
        // Configuration du jeu
        this.width = 600;
        this.height = 400;
        this.paddleWidth = 10;
        this.paddleHeight = 80;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeed = 4;
        
        // Positions initiales
        this.playerY = this.height / 2 - this.paddleHeight / 2;
        this.aiY = this.height / 2 - this.paddleHeight / 2;
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        this.ballDirX = Math.random() > 0.5 ? 1 : -1;
        this.ballDirY = Math.random() * 2 - 1;
        
        // Scores
        this.playerScore = 0;
        this.aiScore = 0;
        this.maxScore = 5;
        
        // Contrôles
        this.keys = {};
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Règles personnalisées
        if (data.rules.customRules) {
            const rules = data.rules.customRules.toLowerCase();
            if (rules.includes('vitesse')) {
                this.ballSpeed = 6;
                this.paddleSpeed = 6;
            }
            if (rules.includes('petite raquette')) {
                this.paddleHeight = 60;
            }
            if (rules.includes('grande balle')) {
                this.ballSize = 15;
            }
        }
        
        // Score maximum
        if (data.conditions.targetScore) {
            this.maxScore = data.conditions.targetScore;
        }
        
        // Difficulté
        switch(data.mechanics.difficulty) {
            case 'easy':
                this.aiDifficulty = 0.8;
                break;
            case 'medium':
                this.aiDifficulty = 0.9;
                break;
            case 'hard':
                this.aiDifficulty = 1.0;
                break;
            case 'extreme':
                this.aiDifficulty = 1.1;
                this.ballSpeed = 6;
                break;
            default:
                this.aiDifficulty = 0.9;
        }
        
        // Power-ups
        if (data.mechanics.powerups && data.mechanics.powerups.includes('speed')) {
            this.speedPowerup = true;
            this.speedBoostActive = false;
            this.speedBoostTimer = 0;
        }
    }
    
    init() {
        this.render();
        this.setupCanvas();
        this.setupEventListeners();
        this.startGame();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Ping Pong ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="pong-scoreboard">
                    <div class="score-player">
                        <h4>Joueur</h4>
                        <div class="score" id="player-score">0</div>
                    </div>
                    <div class="score-vs">VS</div>
                    <div class="score-ai">
                        <h4>IA</h4>
                        <div class="score" id="ai-score">0</div>
                    </div>
                </div>
                
                <canvas id="pong-canvas" width="${this.width}" height="${this.height}"></canvas>
                
                <div class="game-info">
                    <p>Mode: ${this.mode}</p>
                    <p>Premier à ${this.maxScore} points</p>
                    ${this.speedPowerup ? 
                        `<div class="powerup-status">
                            <i class="fas fa-bolt"></i> Boost de vitesse disponible
                        </div>` : 
                        ''}
                </div>
                
                <div class="game-instructions">
                    <p>Utilisez les touches ↑ et ↓ pour déplacer votre raquette</p>
                    <p>Appuyez sur ESPACE pour activer le boost de vitesse</p>
                </div>
                
                <div class="game-controls">
                    <button class="btn-secondary" id="pong-pause">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button class="btn-primary" id="pong-restart">
                        <i class="fas fa-redo"></i> Recommencer
                    </button>
                </div>
            </div>
        `;
    }
    
    setupCanvas() {
        this.canvas = this.container.querySelector('#pong-canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    setupEventListeners() {
        // Contrôles clavier
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ' && this.speedPowerup && !this.speedBoostActive) {
                this.activateSpeedBoost();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Contrôles tactiles
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchY = touch.clientY - rect.top;
            
            this.playerY = touchY - this.paddleHeight / 2;
        });
        
        // Boutons
        this.container.querySelector('#pong-pause').addEventListener('click', () => {
            this.togglePause();
        });
        
        this.container.querySelector('#pong-restart').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        
        if (this.gameRunning) {
            this.gameLoop();
            this.container.querySelector('#pong-pause').innerHTML = 
                '<i class="fas fa-pause"></i> Pause';
        } else {
            this.container.querySelector('#pong-pause').innerHTML = 
                '<i class="fas fa-play"></i> Reprendre';
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Déplacement du joueur
        if (this.keys['ArrowUp'] || this.keys['Up']) {
            this.playerY = Math.max(0, this.playerY - this.paddleSpeed);
        }
        if (this.keys['ArrowDown'] || this.keys['Down']) {
            this.playerY = Math.min(this.height - this.paddleHeight, this.playerY + this.paddleSpeed);
        }
        
        // IA
        const aiCenter = this.aiY + this.paddleHeight / 2;
        const ballCenter = this.ballY + this.ballSize / 2;
        
        if (aiCenter < ballCenter - 10) {
            this.aiY = Math.min(this.height - this.paddleHeight, 
                this.aiY + this.paddleSpeed * this.aiDifficulty);
        } else if (aiCenter > ballCenter + 10) {
            this.aiY = Math.max(0, 
                this.aiY - this.paddleSpeed * this.aiDifficulty);
        }
        
        // Gestion du boost de vitesse
        if (this.speedBoostActive) {
            this.speedBoostTimer--;
            if (this.speedBoostTimer <= 0) {
                this.speedBoostActive = false;
                this.ballSpeed = Math.max(3, this.ballSpeed - 2);
            }
        }
        
        // Mouvement de la balle
        this.ballX += this.ballDirX * this.ballSpeed;
        this.ballY += this.ballDirY * this.ballSpeed;
        
        // Rebond sur les murs supérieur et inférieur
        if (this.ballY <= 0 || this.ballY >= this.height - this.ballSize) {
            this.ballDirY *= -1;
        }
        
        // Collision avec la raquette du joueur
        if (this.ballX <= this.paddleWidth && 
            this.ballY + this.ballSize >= this.playerY && 
            this.ballY <= this.playerY + this.paddleHeight) {
            
            // Calculer l'angle de rebond
            const hitPos = (this.ballY - this.playerY) / this.paddleHeight;
            this.ballDirY = (hitPos - 0.5) * 2;
            this.ballDirX = 1;
            
            // Ajuster la vitesse
            this.ballSpeed = Math.min(8, this.ballSpeed * 1.05);
        }
        
        // Collision avec la raquette de l'IA
        if (this.ballX >= this.width - this.paddleWidth - this.ballSize && 
            this.ballY + this.ballSize >= this.aiY && 
            this.ballY <= this.aiY + this.paddleHeight) {
            
            const hitPos = (this.ballY - this.aiY) / this.paddleHeight;
            this.ballDirY = (hitPos - 0.5) * 2;
            this.ballDirX = -1;
            
            this.ballSpeed = Math.min(8, this.ballSpeed * 1.05);
        }
        
        // Vérifier les buts
        if (this.ballX < 0) {
            this.aiScore++;
            this.resetBall();
        } else if (this.ballX > this.width) {
            this.playerScore++;
            this.resetBall();
        }
        
        // Mettre à jour les scores
        this.container.querySelector('#player-score').textContent = this.playerScore;
        this.container.querySelector('#ai-score').textContent = this.aiScore;
        
        // Vérifier la fin du jeu
        if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
            this.endGame();
        }
    }
    
    resetBall() {
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        this.ballDirX = Math.random() > 0.5 ? 1 : -1;
        this.ballDirY = Math.random() * 2 - 1;
        this.ballSpeed = 4;
    }
    
    activateSpeedBoost() {
        this.speedBoostActive = true;
        this.speedBoostTimer = 300; // 5 secondes à 60 FPS
        this.ballSpeed += 2;
        
        showNotification('Boost de vitesse activé!', 'success');
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Ligne centrale
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Raquette du joueur
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, this.playerY, this.paddleWidth, this.paddleHeight);
        
        // Raquette de l'IA
        this.ctx.fillStyle = '#FF5252';
        this.ctx.fillRect(this.width - this.paddleWidth, this.aiY, this.paddleWidth, this.paddleHeight);
        
        // Balle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ballX + this.ballSize / 2, this.ballY + this.ballSize / 2, 
                    this.ballSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Effet de boost de vitesse
        if (this.speedBoostActive) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.ballX + this.ballSize / 2, this.ballY + this.ballSize / 2, 
                        this.ballSize / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        cancelAnimationFrame(this.animationId);
        
        const winner = this.playerScore > this.aiScore ? 'Joueur' : 'IA';
        const score = `${this.playerScore} - ${this.aiScore}`;
        
        this.container.innerHTML += `
            <div class="game-end">
                <h2>🎉 Match Terminé!</h2>
                <p>${winner} gagne ${score}</p>
                <button class="btn-primary" id="play-again-pong">
                    <i class="fas fa-redo"></i> Rejouer
                </button>
            </div>
        `;
        
        this.container.querySelector('#play-again-pong').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    restartGame() {
        // Réinitialiser les scores et positions
        this.playerScore = 0;
        this.aiScore = 0;
        this.playerY = this.height / 2 - this.paddleHeight / 2;
        this.aiY = this.height / 2 - this.paddleHeight / 2;
        this.resetBall();
        this.speedBoostActive = false;
        this.speedBoostTimer = 0;
        
        // Réinitialiser l'affichage
        this.container.querySelector('.game-end')?.remove();
        this.container.querySelector('#player-score').textContent = '0';
        this.container.querySelector('#ai-score').textContent = '0';
        
        // Redémarrer le jeu
        this.gameRunning = true;
        this.gameLoop();
    }
}

// Fonction globale pour charger le jeu
function loadPongGame(container, mode, customData) {
    new PongGame(container, mode, customData);
}