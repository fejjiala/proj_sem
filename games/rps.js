// RPS Game Implementation
class RPSGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.playerScore = 0;
        this.computerScore = 0;
        this.round = 0;
        this.totalRounds = 3;
        this.gameActive = true;
        
        this.choices = ['rock', 'paper', 'scissors'];
        this.results = {
            rock: { beats: 'scissors', loses: 'paper' },
            paper: { beats: 'rock', loses: 'scissors' },
            scissors: { beats: 'paper', loses: 'rock' }
        };
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Règles personnalisées
        if (data.rules.customRules) {
            const rules = data.rules.customRules.toLowerCase();
            
            // Modifier les règles
            if (rules.includes('pierre bat ciseaux')) {
                this.results.rock.beats = 'scissors';
            }
            if (rules.includes('ciseaux bat papier')) {
                this.results.scissors.beats = 'paper';
            }
            if (rules.includes('papier bat pierre')) {
                this.results.paper.beats = 'rock';
            }
            
            // Ajouter d'autres règles personnalisées
            if (rules.includes('égalité compte double')) {
                this.tieCountsDouble = true;
            }
        }
        
        // Nombre de rounds
        if (data.rules.rounds) {
            this.totalRounds = data.rules.rounds;
        }
        
        // Conditions de victoire
        if (data.conditions.targetScore) {
            this.totalRounds = data.conditions.targetScore;
        }
        
        // Difficulté
        switch(data.mechanics.difficulty) {
            case 'easy':
                this.computerStrategy = 'random';
                break;
            case 'medium':
                this.computerStrategy = 'counter';
                break;
            case 'hard':
                this.computerStrategy = 'predictive';
                this.playerHistory = [];
                break;
            case 'extreme':
                this.computerStrategy = 'cheating';
                break;
        }
        
        // Power-ups
        if (data.mechanics.powerups && data.mechanics.powerups.includes('double')) {
            this.doublePoints = true;
        }
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Pierre-Papier-Ciseaux ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="rps-scoreboard">
                    <div class="score-player">
                        <h4>Joueur</h4>
                        <div class="score" id="player-score">${this.playerScore}</div>
                    </div>
                    <div class="score-vs">VS</div>
                    <div class="score-computer">
                        <h4>Ordinateur</h4>
                        <div class="score" id="computer-score">${this.computerScore}</div>
                    </div>
                </div>
                
                <div class="rps-rounds">
                    <p>Round: <span id="round-count">${this.round}</span>/<span id="total-rounds">${this.totalRounds}</span></p>
                </div>
                
                <div class="rps-choices">
                    <div class="rps-choice" data-choice="rock">
                        <i class="fas fa-hand-rock"></i>
                        <span>Pierre</span>
                    </div>
                    <div class="rps-choice" data-choice="paper">
                        <i class="fas fa-hand-paper"></i>
                        <span>Papier</span>
                    </div>
                    <div class="rps-choice" data-choice="scissors">
                        <i class="fas fa-hand-scissors"></i>
                        <span>Ciseaux</span>
                    </div>
                </div>
                
                <div class="rps-result">
                    <div class="choices-display">
                        <div class="choice-display" id="player-choice">
                            <i class="fas fa-question"></i>
                        </div>
                        <div class="vs-text">VS</div>
                        <div class="choice-display" id="computer-choice">
                            <i class="fas fa-question"></i>
                        </div>
                    </div>
                    <h2 id="result-text">Faites votre choix !</h2>
                </div>
                
                <div class="rps-controls">
                    <button class="btn-secondary" id="rps-reset">
                        <i class="fas fa-redo"></i> Recommencer
                    </button>
                    <button class="btn-primary" id="rps-auto">
                        <i class="fas fa-robot"></i> Mode Auto
                    </button>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Choix du joueur
        this.container.querySelectorAll('.rps-choice').forEach(choice => {
            choice.addEventListener('click', () => {
                if (!this.gameActive) return;
                
                const playerChoice = choice.dataset.choice;
                this.playRound(playerChoice);
            });
        });
        
        // Boutons de contrôle
        this.container.querySelector('#rps-reset').addEventListener('click', () => {
            this.resetGame();
        });
        
        this.container.querySelector('#rps-auto').addEventListener('click', () => {
            this.toggleAutoPlay();
        });
    }
    
    playRound(playerChoice) {
        if (!this.gameActive || this.round >= this.totalRounds) return;
        
        this.round++;
        this.container.querySelector('#round-count').textContent = this.round;
        
        // Choix de l'ordinateur
        const computerChoice = this.getComputerChoice(playerChoice);
        
        // Mettre à jour l'affichage des choix
        this.updateChoicesDisplay(playerChoice, computerChoice);
        
        // Déterminer le gagnant
        const winner = this.determineWinner(playerChoice, computerChoice);
        
        // Mettre à jour les scores et afficher le résultat
        setTimeout(() => {
            let resultMessage = '';
            let points = 1;
            
            if (this.doublePoints) points = 2;
            
            switch(winner) {
                case 'player':
                    this.playerScore += points;
                    resultMessage = 'Vous gagnez ce round!';
                    this.container.querySelector('#player-score').textContent = this.playerScore;
                    this.animateScore('player-score');
                    break;
                case 'computer':
                    this.computerScore += points;
                    resultMessage = 'L\'ordinateur gagne ce round!';
                    this.container.querySelector('#computer-score').textContent = this.computerScore;
                    this.animateScore('computer-score');
                    break;
                default:
                    if (this.tieCountsDouble) {
                        this.playerScore += points;
                        this.computerScore += points;
                        this.container.querySelector('#player-score').textContent = this.playerScore;
                        this.container.querySelector('#computer-score').textContent = this.computerScore;
                        resultMessage = 'Égalité! Points doublés!';
                    } else {
                        resultMessage = 'Égalité!';
                    }
                    break;
            }
            
            this.container.querySelector('#result-text').textContent = resultMessage;
            
            // Vérifier la fin du jeu
            this.checkGameEnd();
        }, 600);
    }
    
    getComputerChoice(playerChoice) {
        switch(this.computerStrategy) {
            case 'random':
                return this.choices[Math.floor(Math.random() * 3)];
                
            case 'counter':
                // Contre le dernier coup du joueur
                if (this.playerHistory.length > 0) {
                    const lastPlayerChoice = this.playerHistory[this.playerHistory.length - 1];
                    return this.results[lastPlayerChoice].loses;
                }
                return this.choices[Math.floor(Math.random() * 3)];
                
            case 'predictive':
                // Essaye de prédire le prochain coup
                this.playerHistory.push(playerChoice);
                
                // Analyse des tendances
                if (this.playerHistory.length >= 3) {
                    const lastThree = this.playerHistory.slice(-3);
                    const mostCommon = this.findMostCommonChoice(lastThree);
                    if (mostCommon) {
                        return this.results[mostCommon].beats;
                    }
                }
                return this.choices[Math.floor(Math.random() * 3)];
                
            case 'cheating':
                // Triche légèrement
                const random = Math.random();
                if (random < 0.6) { // 60% de chance de contre
                    return this.results[playerChoice].beats;
                }
                return this.choices[Math.floor(Math.random() * 3)];
                
            default:
                return this.choices[Math.floor(Math.random() * 3)];
        }
    }
    
    findMostCommonChoice(choices) {
        const counts = {};
        choices.forEach(choice => {
            counts[choice] = (counts[choice] || 0) + 1;
        });
        
        let maxCount = 0;
        let mostCommon = null;
        
        for (const [choice, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = choice;
            }
        }
        
        return mostCommon;
    }
    
    updateChoicesDisplay(playerChoice, computerChoice) {
        const icons = {
            rock: 'fas fa-hand-rock',
            paper: 'fas fa-hand-paper',
            scissors: 'fas fa-hand-scissors'
        };
        
        const playerChoiceEl = this.container.querySelector('#player-choice');
        const computerChoiceEl = this.container.querySelector('#computer-choice');
        
        // Animation de retournement
        playerChoiceEl.style.transform = 'rotateY(90deg)';
        computerChoiceEl.style.transform = 'rotateY(90deg)';
        
        setTimeout(() => {
            playerChoiceEl.innerHTML = `<i class="${icons[playerChoice]}"></i>`;
            computerChoiceEl.innerHTML = `<i class="${icons[computerChoice]}"></i>`;
            
            playerChoiceEl.style.transform = 'rotateY(0deg)';
            computerChoiceEl.style.transform = 'rotateY(0deg)';
        }, 200);
    }
    
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) return 'tie';
        
        if (this.results[playerChoice].beats === computerChoice) {
            return 'player';
        } else {
            return 'computer';
        }
    }
    
    animateScore(scoreId) {
        const scoreElement = this.container.querySelector(`#${scoreId}`);
        scoreElement.style.transform = 'scale(1.2)';
        scoreElement.style.color = '#FFD700';
        
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = '';
        }, 300);
    }
    
    checkGameEnd() {
        if (this.round >= this.totalRounds) {
            this.gameActive = false;
            
            setTimeout(() => {
                let finalMessage = '';
                
                if (this.playerScore > this.computerScore) {
                    finalMessage = `🎉 Félicitations ! Vous gagnez ${this.playerScore} à ${this.computerScore}`;
                } else if (this.computerScore > this.playerScore) {
                    finalMessage = `😢 L'ordinateur gagne ${this.computerScore} à ${this.playerScore}`;
                    
                    // Appliquer la pénalité si configurée
                    if (this.customData?.data?.penalties?.type !== 'none') {
                        this.applyPenalty();
                    }
                } else {
                    finalMessage = '🤝 Match nul !';
                }
                
                this.container.querySelector('#result-text').textContent = finalMessage;
                
                // Ajouter un bouton pour rejouer
                this.container.querySelector('.rps-controls').innerHTML += `
                    <button class="btn-primary" id="rps-play-again">
                        <i class="fas fa-redo"></i> Rejouer
                    </button>
                `;
                
                this.container.querySelector('#rps-play-again').addEventListener('click', () => {
                    this.resetGame();
                });
            }, 1000);
        }
    }
    
    applyPenalty() {
        const penaltyType = this.customData?.data?.penalties?.type;
        let penaltyMessage = '';
        
        switch(penaltyType) {
            case 'score':
                penaltyMessage = 'Pénalité: -10 points au prochain jeu';
                break;
            case 'time':
                penaltyMessage = 'Pénalité: 10 secondes en moins au prochain tour';
                break;
            case 'custom':
                penaltyMessage = this.customData.data.penalties.customPenalty || 'Pénalité appliquée!';
                break;
        }
        
        if (penaltyMessage) {
            setTimeout(() => {
                this.container.querySelector('#result-text').textContent += ` | ${penaltyMessage}`;
            }, 2000);
        }
    }
    
    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.round = 0;
        this.gameActive = true;
        this.playerHistory = [];
        
        this.render();
        this.setupEventListeners();
    }
    
    toggleAutoPlay() {
        const autoBtn = this.container.querySelector('#rps-auto');
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            autoBtn.innerHTML = '<i class="fas fa-robot"></i> Mode Auto';
            this.container.querySelector('#result-text').textContent = 'Mode auto désactivé';
        } else {
            this.autoPlayInterval = setInterval(() => {
                if (this.gameActive) {
                    const randomChoice = this.choices[Math.floor(Math.random() * 3)];
                    this.playRound(randomChoice);
                } else {
                    clearInterval(this.autoPlayInterval);
                    this.autoPlayInterval = null;
                }
            }, 1500);
            autoBtn.innerHTML = '<i class="fas fa-stop"></i> Arrêter';
            this.container.querySelector('#result-text').textContent = 'Mode auto activé';
        }
    }
}

// Fonction globale pour charger le jeu
function loadRPSGame(container, mode, customData) {
    new RPSGame(container, mode, customData);
}