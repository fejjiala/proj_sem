// Tic Tac Toe Game Implementation
class TicTacToeGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.round = 1;
        this.totalRounds = 3;
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Nombre de rounds
        if (data.rules.rounds) {
            this.totalRounds = data.rules.rounds;
        }
        
        // Règles personnalisées
        if (data.rules.customRules) {
            const rules = data.rules.customRules.toLowerCase();
            if (rules.includes('o commence')) {
                this.currentPlayer = 'O';
            }
            if (rules.includes('diagonales comptent double')) {
                this.doubleDiagonal = true;
            }
        }
        
        // Conditions de victoire
        if (data.conditions.winConditions) {
            if (data.conditions.winConditions.includes('score')) {
                this.targetScore = data.conditions.targetScore || 100;
            }
        }
        
        // Difficulté pour le mode IA
        if (data.mechanics.difficulty) {
            this.aiDifficulty = data.mechanics.difficulty;
        }
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Tic Tac Toe ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="tic-tac-toe-scoreboard">
                    <div class="score-x">
                        <h4>Joueur X</h4>
                        <div class="score">${this.scores.X}</div>
                    </div>
                    <div class="score-vs">VS</div>
                    <div class="score-o">
                        <h4>Joueur O</h4>
                        <div class="score">${this.scores.O}</div>
                    </div>
                </div>
                
                <div class="game-status">
                    <p>Tour: <span class="player-indicator ${this.currentPlayer.toLowerCase()}">${this.currentPlayer}</span></p>
                    <p>Round: ${this.round}/${this.totalRounds}</p>
                </div>
                
                <div class="game-board" id="tic-tac-toe-board">
                    ${this.board.map((cell, index) => `
                        <div class="cell ${cell.toLowerCase()}" data-index="${index}">
                            ${cell}
                        </div>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="btn-secondary" id="reset-round">
                        <i class="fas fa-redo"></i> Nouveau Round
                    </button>
                    <button class="btn-primary" id="new-game">
                        <i class="fas fa-plus-circle"></i> Nouvelle Partie
                    </button>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        const cells = this.container.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.dataset.index);
                
                if (this.board[index] === '' && this.gameActive) {
                    this.makeMove(index);
                }
            });
        });
        
        this.container.querySelector('#reset-round').addEventListener('click', () => {
            this.resetRound();
        });
        
        this.container.querySelector('#new-game').addEventListener('click', () => {
            this.newGame();
        });
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        
        // Mettre à jour l'affichage
        this.container.querySelector(`[data-index="${index}"]`).textContent = this.currentPlayer;
        this.container.querySelector(`[data-index="${index}"]`).classList.add(this.currentPlayer.toLowerCase());
        
        // Vérifier la victoire
        if (this.checkWin()) {
            this.handleWin();
            return;
        }
        
        // Vérifier le match nul
        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }
        
        // Changer de joueur
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        // Mettre à jour l'indicateur de joueur
        const indicator = this.container.querySelector('.player-indicator');
        if (indicator) {
            indicator.textContent = this.currentPlayer;
            indicator.className = `player-indicator ${this.currentPlayer.toLowerCase()}`;
        }
        
        // Si c'est le tour de l'IA (en mode solo)
        if (this.currentPlayer === 'O' && this.mode === 'classic') {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch(this.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
            default:
                move = this.getRandomMove();
        }
        
        if (move !== -1) {
            this.makeMove(move);
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : -1)
            .filter(index => index !== -1);
        
        if (availableMoves.length === 0) return -1;
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    getMediumMove() {
        // Essaie de gagner
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinForPlayer('O')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Essaie de bloquer
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinForPlayer('X')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Sinon, coup aléatoire
        return this.getRandomMove();
    }
    
    getBestMove() {
        // Minimax algorithm (simplifié)
        return this.getMediumMove();
    }
    
    checkWinForPlayer(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
            [0, 4, 8], [2, 4, 6]             // Diagonales
        ];
        
        return winPatterns.some(pattern => 
            pattern.every(index => this.board[index] === player)
        );
    }
    
    checkWin() {
        return this.checkWinForPlayer(this.currentPlayer);
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        
        // Mettre à jour le scoreboard
        this.container.querySelector(`.score-${this.currentPlayer.toLowerCase()} .score`).textContent = 
            this.scores[this.currentPlayer];
        
        // Afficher le message de victoire
        showNotification(`Le joueur ${this.currentPlayer} gagne ce round!`, 'success');
        
        // Vérifier si la partie est terminée
        setTimeout(() => {
            if (this.round >= this.totalRounds) {
                this.endGame();
            } else {
                this.round++;
                this.resetRound();
            }
        }, 1500);
    }
    
    handleDraw() {
        this.gameActive = false;
        
        showNotification('Match nul!', 'info');
        
        setTimeout(() => {
            if (this.round >= this.totalRounds) {
                this.endGame();
            } else {
                this.round++;
                this.resetRound();
            }
        }, 1500);
    }
    
    resetRound() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.render();
        this.setupEventListeners();
    }
    
    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.round = 1;
        this.render();
        this.setupEventListeners();
    }
    
    endGame() {
        let winner = '';
        if (this.scores.X > this.scores.O) {
            winner = 'X';
        } else if (this.scores.O > this.scores.X) {
            winner = 'O';
        }
        
        const message = winner 
            ? `Le joueur ${winner} remporte la partie!`
            : 'Match nul!';
        
        this.container.innerHTML += `
            <div class="game-end">
                <h2>Partie Terminée!</h2>
                <p>${message}</p>
                <p>Score final: X: ${this.scores.X} - O: ${this.scores.O}</p>
                <button class="btn-primary" id="play-again-ttt">
                    <i class="fas fa-redo"></i> Rejouer
                </button>
            </div>
        `;
        
        this.container.querySelector('#play-again-ttt').addEventListener('click', () => {
            this.newGame();
        });
    }
}

// Fonction globale pour charger le jeu
function loadTicTacToeGame(container, mode, customData) {
    new TicTacToeGame(container, mode, customData);
}