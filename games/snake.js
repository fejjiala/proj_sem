// Snake Game Implementation
class SnakeGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.canvas = container.querySelector('#snake-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'snake-canvas';
            this.canvas.width = 400;
            this.canvas.height = 400;
            container.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Configuration par défaut
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameSpeed = 150;
        this.gameRunning = true;
        this.gameLoopId = null;
        this.targetScore = 100;
        this.obstacles = [];
        this.wallPassing = false;
        this.powerupsEnabled = false;
        this.specialFood = null;
        this.specialFoodTimer = 0;
        
        // Personnalisation
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Appliquer les règles personnalisées
        if (data.rules.customRules) {
            if (data.rules.customRules.includes('traverse les murs')) {
                this.wallPassing = true;
            }
            if (data.rules.customRules.includes('vitesse')) {
                this.gameSpeed = Math.max(50, this.gameSpeed - 50);
            }
        }
        
        // Appliquer la difficulté
        switch(data.mechanics.difficulty) {
            case 'easy':
                this.gameSpeed = 200;
                this.gridSize = 25;
                break;
            case 'medium':
                this.gameSpeed = 150;
                this.gridSize = 20;
                break;
            case 'hard':
                this.gameSpeed = 100;
                this.gridSize = 15;
                this.generateObstacles();
                break;
            case 'extreme':
                this.gameSpeed = 70;
                this.gridSize = 12;
                this.generateObstacles();
                break;
        }
        
        // Appliquer les conditions de victoire
        if (data.conditions.targetScore) {
            this.targetScore = data.conditions.targetScore;
        }
        
        // Appliquer les power-ups
        if (data.mechanics.powerups && data.mechanics.powerups.length > 0) {
            this.powerupsEnabled = true;
        }
        
        // Appliquer le temps limite
        if (data.mechanics.timeLimit) {
            this.timeLimit = data.mechanics.timeLimit * 1000;
            this.startTime = Date.now();
        }
    }
    
    generateObstacles() {
        this.obstacles = [];
        const obstacleCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let validPosition = false;
            
            while (!validPosition) {
                obstacle = {
                    x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                    y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)),
                    width: Math.floor(Math.random() * 3) + 1,
                    height: Math.floor(Math.random() * 3) + 1
                };
                
                validPosition = true;
                
                // Vérifier le serpent
                for (const segment of this.snake) {
                    if (this.checkCollision(segment, obstacle)) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Vérifier la nourriture
                if (validPosition && this.checkCollision(this.food, obstacle)) {
                    validPosition = false;
                }
            }
            
            this.obstacles.push(obstacle);
        }
    }
    
    checkCollision(pos, obstacle) {
        return pos.x >= obstacle.x && 
               pos.x < obstacle.x + obstacle.width &&
               pos.y >= obstacle.y && 
               pos.y < obstacle.y + obstacle.height;
    }
    
    init() {
        // Mettre à jour l'affichage du score
        this.updateScoreDisplay();
        
        // Contrôles clavier
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Contrôles tactiles pour mobile
        this.setupTouchControls();
        
        // Démarrer le jeu
        this.startGame();
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
            case ' ':
                this.pauseGame();
                break;
        }
    }
    
    setupTouchControls() {
        // Créer des boutons de contrôle tactiles
        const controlsHTML = `
            <div class="mobile-controls">
                <div class="control-up" id="control-up">↑</div>
                <div class="control-row">
                    <div class="control-left" id="control-left">←</div>
                    <div class="control-center"></div>
                    <div class="control-right" id="control-right">→</div>
                </div>
                <div class="control-down" id="control-down">↓</div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', controlsHTML);
        
        // Ajouter les écouteurs d'événements
        document.getElementById('control-up').addEventListener('click', () => {
            if (this.direction !== 'down') this.nextDirection = 'up';
        });
        
        document.getElementById('control-down').addEventListener('click', () => {
            if (this.direction !== 'up') this.nextDirection = 'down';
        });
        
        document.getElementById('control-left').addEventListener('click', () => {
            if (this.direction !== 'right') this.nextDirection = 'left';
        });
        
        document.getElementById('control-right').addEventListener('click', () => {
            if (this.direction !== 'left') this.nextDirection = 'right';
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    pauseGame() {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.gameLoop();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Mettre à jour le jeu
        this.update();
        
        // Dessiner le jeu
        this.draw();
        
        // Vérifier les conditions de fin
        this.checkGameEnd();
        
        // Continuer la boucle
        if (this.gameRunning) {
            this.gameLoopId = setTimeout(() => this.gameLoop(), this.gameSpeed);
        }
    }
    
    update() {
        this.direction = this.nextDirection;
        
        // Créer une nouvelle tête
        const head = {...this.snake[0]};
        
        // Déplacer la tête selon la direction
        switch(this.direction) {
            case 'up': head.y -= 1; break;
            case 'down': head.y += 1; break;
            case 'left': head.x -= 1; break;
            case 'right': head.x += 1; break;
        }
        
        // Gérer le passage à travers les murs
        if (this.wallPassing) {
            if (head.x < 0) head.x = Math.floor(this.canvas.width / this.gridSize) - 1;
            if (head.x >= this.canvas.width / this.gridSize) head.x = 0;
            if (head.y < 0) head.y = Math.floor(this.canvas.height / this.gridSize) - 1;
            if (head.y >= this.canvas.height / this.gridSize) head.y = 0;
        }
        
        // Vérifier les collisions avec les murs
        if (!this.wallPassing && (
            head.x < 0 || 
            head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || 
            head.y >= this.canvas.height / this.gridSize
        )) {
            this.gameOver("Collision avec le mur!");
            return;
        }
        
        // Vérifier les collisions avec le serpent
        for (const segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver("Collision avec vous-même!");
                return;
            }
        }
        
        // Vérifier les collisions avec les obstacles
        for (const obstacle of this.obstacles) {
            if (this.checkCollision(head, obstacle)) {
                this.gameOver("Collision avec un obstacle!");
                return;
            }
        }
        
        // Ajouter la nouvelle tête
        this.snake.unshift(head);
        
        // Vérifier si le serpent a mangé la nourriture
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food = this.generateFood();
            
            // Vérifier la nourriture spéciale
            if (this.powerupsEnabled && Math.random() < 0.2) {
                this.generateSpecialFood();
            }
        } else {
            this.snake.pop();
        }
        
        // Vérifier la nourriture spéciale
        if (this.specialFood) {
            this.specialFoodTimer--;
            
            if (this.specialFoodTimer <= 0) {
                this.specialFood = null;
            } else if (head.x === this.specialFood.x && head.y === this.specialFood.y) {
                this.score += 50;
                this.updateScoreDisplay();
                this.specialFood = null;
            }
        }
    }
    
    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        
        for (const segment of this.snake) {
            if (segment.x === x && segment.y === y) {
                return this.generateFood();
            }
        }
        
        return {x, y};
    }
    
    generateSpecialFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        
        for (const segment of this.snake) {
            if (segment.x === x && segment.y === y) {
                return this.generateSpecialFood();
            }
        }
        
        this.specialFood = {x, y};
        this.specialFoodTimer = 100;
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la grille
        this.ctx.strokeStyle = '#2d2b55';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Dessiner les obstacles
        this.ctx.fillStyle = '#FF5252';
        for (const obstacle of this.obstacles) {
            this.ctx.fillRect(
                obstacle.x * this.gridSize,
                obstacle.y * this.gridSize,
                obstacle.width * this.gridSize - 1,
                obstacle.height * this.gridSize - 1
            );
        }
        
        // Dessiner le serpent
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Tête
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Corps - dégradé de couleur
                const colorValue = 200 - (index % 10) * 15;
                this.ctx.fillStyle = `rgb(139, ${colorValue}, 74)`;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
            
            // Dessiner les yeux sur la tête
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = 3;
                
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                switch(this.direction) {
                    case 'right':
                        leftEyeX = segment.x * this.gridSize + this.gridSize - 6;
                        leftEyeY = segment.y * this.gridSize + 6;
                        rightEyeX = segment.x * this.gridSize + this.gridSize - 6;
                        rightEyeY = segment.y * this.gridSize + this.gridSize - 6;
                        break;
                    case 'left':
                        leftEyeX = segment.x * this.gridSize + 6;
                        leftEyeY = segment.y * this.gridSize + 6;
                        rightEyeX = segment.x * this.gridSize + 6;
                        rightEyeY = segment.y * this.gridSize + this.gridSize - 6;
                        break;
                    case 'up':
                        leftEyeX = segment.x * this.gridSize + 6;
                        leftEyeY = segment.y * this.gridSize + 6;
                        rightEyeX = segment.x * this.gridSize + this.gridSize - 6;
                        rightEyeY = segment.y * this.gridSize + 6;
                        break;
                    case 'down':
                        leftEyeX = segment.x * this.gridSize + 6;
                        leftEyeY = segment.y * this.gridSize + this.gridSize - 6;
                        rightEyeX = segment.x * this.gridSize + this.gridSize - 6;
                        rightEyeY = segment.y * this.gridSize + this.gridSize - 6;
                        break;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Dessiner la nourriture
        this.ctx.fillStyle = '#FF5252';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Dessiner la nourriture spéciale
        if (this.specialFood) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(
                this.specialFood.x * this.gridSize + this.gridSize / 2,
                this.specialFood.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Animation de pulsation
            const pulseSize = Math.sin(Date.now() / 200) * 2;
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(
                this.specialFood.x * this.gridSize + this.gridSize / 2,
                this.specialFood.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 + pulseSize,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
    }
    
    updateScoreDisplay() {
        const scoreElement = this.container.querySelector('#snake-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    checkGameEnd() {
        // Vérifier le score cible
        if (this.targetScore && this.score >= this.targetScore) {
            this.gameOver("Vous avez atteint le score cible! Victoire!", true);
            return;
        }
        
        // Vérifier le temps limite
        if (this.timeLimit && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            if (elapsed >= this.timeLimit) {
                this.gameOver("Temps écoulé!");
                return;
            }
        }
    }
    
    gameOver(message, isWin = false) {
        this.gameRunning = false;
        
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }
        
        // Afficher le message de fin
        const gameOverHTML = `
            <div class="game-over">
                <h2>${isWin ? '🎉 Victoire !' : '💀 Game Over'}</h2>
                <p>${message}</p>
                <p>Score final: ${this.score}</p>
                <button class="btn-primary" id="restart-snake">
                    <i class="fas fa-redo"></i> Rejouer
                </button>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', gameOverHTML);
        
        document.getElementById('restart-snake').addEventListener('click', () => {
            this.container.querySelector('.game-over')?.remove();
            this.restartGame();
        });
        
        showNotification(message, isWin ? 'success' : 'error');
    }
    
    restartGame() {
        // Réinitialiser le jeu
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameRunning = true;
        
        if (this.obstacles.length > 0) {
            this.generateObstacles();
        }
        
        this.updateScoreDisplay();
        this.startGame();
    }
}

// Fonction globale pour charger le jeu Snake
function loadSnakeGame(container, mode, customData) {
    new SnakeGame(container, mode, customData);
}

// Fonction de secours
function showNotification(message, type) {
    console.log(`${type}: ${message}`);
}