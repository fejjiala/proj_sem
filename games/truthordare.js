// Truth or Dare Game Implementation
class TruthOrDareGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.questions = [
            "Quel est ton plus grand secret?",
            "Quelle est la chose la plus embarrassante qui te soit arrivée?",
            "Si tu pouvais être invisible pendant une journée, que ferais-tu?",
            "As-tu déjà triché à un examen?",
            "Quelle est ta plus grande peur?",
            "Quel est ton pire défaut?",
            "As-tu déjà eu un coup de foudre?",
            "Quelle est la pire chose que tu aies faite à quelqu'un?",
            "Quel est ton rêve le plus fou?",
            "Si tu devais manger un seul aliment pour le reste de ta vie, ce serait quoi?"
        ];
        
        this.dares = [
            "Fais 10 pompes",
            "Chante une chanson à haute voix",
            "Danse pendant 30 secondes",
            "Fais une imitation de quelqu'un présent",
            "Mange quelque chose sans utiliser tes mains",
            "Fais le tour de la pièce en marchant comme un canard",
            "Récite l'alphabet à l'envers",
            "Fais 5 tours sur toi-même puis marche en ligne droite",
            "Parle avec un accent pendant les 2 prochaines minutes",
            "Fais ton meilleur cri d'animal"
        ];
        
        this.players = ['Joueur 1', 'Joueur 2'];
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.totalRounds = 10;
        this.gameActive = true;
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Règles personnalisées
        if (data.rules.customRules) {
            // Extraire des questions/défis personnalisés
            const lines = data.rules.customRules.split('\n');
            lines.forEach(line => {
                if (line.toLowerCase().includes('question:') || line.toLowerCase().includes('vérité:')) {
                    const question = line.split(':')[1]?.trim();
                    if (question) this.questions.push(question);
                } else if (line.toLowerCase().includes('défi:') || line.toLowerCase().includes('action:')) {
                    const dare = line.split(':')[1]?.trim();
                    if (dare) this.dares.push(dare);
                }
            });
        }
        
        // Nombre de rounds
        if (data.rules.rounds) {
            this.totalRounds = data.rules.rounds;
        }
        
        // Conditions de victoire
        if (data.conditions.winConditions && data.conditions.winConditions.includes('combo')) {
            this.comboMode = true;
            this.currentCombo = 0;
        }
        
        // Pénalités
        if (data.penalties.type === 'custom' && data.penalties.customPenalty) {
            this.customPenalty = data.penalties.customPenalty;
        }
        
        // Power-ups
        if (data.mechanics.powerups && data.mechanics.powerups.includes('shield')) {
            this.shieldEnabled = true;
            this.shields = {};
            this.players.forEach(player => {
                this.shields[player] = 1;
            });
        }
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Action ou Vérité ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="tod-game-info">
                    <div class="player-turn">
                        <h4>Tour de:</h4>
                        <div class="current-player">${this.players[this.currentPlayerIndex]}</div>
                    </div>
                    
                    <div class="game-stats">
                        <p>Round: ${this.round}/${this.totalRounds}</p>
                        ${this.shieldEnabled ? 
                            `<p>Boucliers: ${this.shields[this.players[this.currentPlayerIndex]] || 0}</p>` : 
                            ''}
                    </div>
                </div>
                
                <div class="tod-card">
                    <div class="card-content">
                        <h4 id="tod-question">Choisis: Vérité ou Action?</h4>
                        <p id="tod-hint" style="display: none; font-style: italic; margin-top: 1rem;"></p>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn-primary" id="tod-truth">
                            <i class="fas fa-comment"></i> Vérité
                        </button>
                        <button class="btn-secondary" id="tod-dare">
                            <i class="fas fa-running"></i> Action
                        </button>
                        ${this.shieldEnabled ? 
                            `<button class="btn-accent" id="tod-shield">
                                <i class="fas fa-shield-alt"></i> Bouclier (${this.shields[this.players[this.currentPlayerIndex]] || 0})
                            </button>` : 
                            ''}
                        <button class="btn-next" id="tod-next">
                            <i class="fas fa-arrow-right"></i> Suivant
                        </button>
                    </div>
                </div>
                
                <div class="tod-history">
                    <h4>Historique:</h4>
                    <div id="history-list"></div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        this.container.querySelector('#tod-truth').addEventListener('click', () => {
            this.showTruth();
        });
        
        this.container.querySelector('#tod-dare').addEventListener('click', () => {
            this.showDare();
        });
        
        if (this.shieldEnabled) {
            this.container.querySelector('#tod-shield').addEventListener('click', () => {
                this.useShield();
            });
        }
        
        this.container.querySelector('#tod-next').addEventListener('click', () => {
            this.nextTurn();
        });
    }
    
    showTruth() {
        if (!this.gameActive) return;
        
        const randomIndex = Math.floor(Math.random() * this.questions.length);
        const question = this.questions[randomIndex];
        
        this.container.querySelector('#tod-question').textContent = `VÉRITÉ: ${question}`;
        this.addToHistory(`${this.players[this.currentPlayerIndex]}: Vérité - ${question}`);
        
        // Appliquer les règles de combo
        if (this.comboMode) {
            this.currentCombo++;
            if (this.currentCombo >= 3) {
                showNotification('Combo x3! Bonus!', 'success');
                this.currentCombo = 0;
            }
        }
    }
    
    showDare() {
        if (!this.gameActive) return;
        
        const randomIndex = Math.floor(Math.random() * this.dares.length);
        const dare = this.dares[randomIndex];
        
        this.container.querySelector('#tod-question').textContent = `ACTION: ${dare}`;
        this.addToHistory(`${this.players[this.currentPlayerIndex]}: Action - ${dare}`);
        
        // Réinitialiser le combo
        if (this.comboMode) {
            this.currentCombo = 0;
        }
    }
    
    useShield() {
        const player = this.players[this.currentPlayerIndex];
        if (this.shields[player] > 0) {
            this.shields[player]--;
            showNotification(`${player} utilise un bouclier!`, 'info');
            this.addToHistory(`${player}: Utilise un bouclier`);
            this.render();
        } else {
            showNotification('Plus de boucliers disponibles!', 'error');
        }
    }
    
    nextTurn() {
        if (!this.gameActive) return;
        
        // Changer de joueur
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // Vérifier si c'est le début d'un nouveau round
        if (this.currentPlayerIndex === 0) {
            this.round++;
            
            // Vérifier la fin du jeu
            if (this.round > this.totalRounds) {
                this.endGame();
                return;
            }
        }
        
        // Réinitialiser l'affichage
        this.container.querySelector('#tod-question').textContent = 'Choisis: Vérité ou Action?';
        this.container.querySelector('#tod-hint').style.display = 'none';
        
        // Mettre à jour l'affichage
        this.container.querySelector('.current-player').textContent = this.players[this.currentPlayerIndex];
        this.container.querySelector('.game-stats p:first-child').textContent = 
            `Round: ${this.round}/${this.totalRounds}`;
            
        if (this.shieldEnabled) {
            const shieldBtn = this.container.querySelector('#tod-shield');
            if (shieldBtn) {
                shieldBtn.innerHTML = 
                    `<i class="fas fa-shield-alt"></i> Bouclier (${this.shields[this.players[this.currentPlayerIndex]] || 0})`;
            }
        }
    }
    
    addToHistory(text) {
        const historyList = this.container.querySelector('#history-list');
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = text;
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Limiter l'historique à 10 éléments
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
    
    endGame() {
        this.gameActive = false;
        
        this.container.innerHTML += `
            <div class="game-end">
                <h2>🎉 Jeu Terminé!</h2>
                <p>Tous les rounds ont été joués!</p>
                ${this.customPenalty ? 
                    `<div class="custom-penalty">
                        <h4>Pénalité personnalisée:</h4>
                        <p>${this.customPenalty}</p>
                    </div>` : 
                    ''}
                <button class="btn-primary" id="play-again-tod">
                    <i class="fas fa-redo"></i> Rejouer
                </button>
            </div>
        `;
        
        this.container.querySelector('#play-again-tod').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    restartGame() {
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.gameActive = true;
        
        if (this.shieldEnabled) {
            this.players.forEach(player => {
                this.shields[player] = 1;
            });
        }
        
        if (this.comboMode) {
            this.currentCombo = 0;
        }
        
        this.render();
        this.setupEventListeners();
    }
}

// Fonction globale pour charger le jeu
function loadTruthOrDareGame(container, mode, customData) {
    new TruthOrDareGame(container, mode, customData);
}