// Math Game Implementation
class MathGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.timeLeft = 60;
        this.gameActive = true;
        this.currentProblem = null;
        this.totalProblems = 10;
        this.currentProblemNumber = 1;
        this.operations = ['+', '-', '*', '/'];
        this.timer = null;
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Règles personnalisées
        if (data.rules.customRules) {
            const rules = data.rules.customRules.toLowerCase();
            
            // Filtrer les opérations
            const allowedOperations = [];
            if (rules.includes('addition')) allowedOperations.push('+');
            if (rules.includes('soustraction')) allowedOperations.push('-');
            if (rules.includes('multiplication')) allowedOperations.push('*');
            if (rules.includes('division')) allowedOperations.push('/');
            
            if (allowedOperations.length > 0) {
                this.operations = allowedOperations;
            }
            
            // Règles spéciales
            if (rules.includes('nombres négatifs')) {
                this.allowNegative = true;
            }
        }
        
        // Nombre de problèmes
        if (data.rules.rounds) {
            this.totalProblems = data.rules.rounds;
        }
        
        // Conditions de victoire
        if (data.conditions.targetScore) {
            this.targetScore = data.conditions.targetScore;
        }
        
        // Difficulté
        switch(data.mechanics.difficulty) {
            case 'easy':
                this.maxNumber = 20;
                this.timeLeft = 90;
                break;
            case 'medium':
                this.maxNumber = 50;
                this.timeLeft = 60;
                break;
            case 'hard':
                this.maxNumber = 100;
                this.timeLeft = 45;
                this.operations = ['*', '/', '+', '-'];
                break;
            case 'extreme':
                this.maxNumber = 200;
                this.timeLeft = 30;
                this.operations = ['*', '/'];
                break;
            default:
                this.maxNumber = 50;
        }
        
        // Power-ups
        if (data.mechanics.powerups && data.mechanics.powerups.includes('double')) {
            this.doublePoints = true;
        }
        
        // Temps limite
        if (data.mechanics.timeLimit) {
            this.timeLeft = data.mechanics.timeLimit;
        }
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.generateProblem();
        this.startTimer();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Calcul Mental ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="math-game-info">
                    <div class="math-problem-display">
                        <h2 id="math-equation">Chargement...</h2>
                        <div class="input-container">
                            <input type="number" id="math-answer" placeholder="Votre réponse">
                            <button id="math-submit">
                                <i class="fas fa-check"></i> Vérifier
                            </button>
                        </div>
                    </div>
                    
                    <div class="math-stats">
                        <div class="stat">
                            <i class="fas fa-clock"></i>
                            <span>Temps: <span id="math-time">${this.timeLeft}</span>s</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-star"></i>
                            <span>Score: <span id="math-score">${this.score}</span></span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-check-circle"></i>
                            <span>Correctes: <span id="correct-count">${this.correctAnswers}</span></span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-times-circle"></i>
                            <span>Incorrectes: <span id="incorrect-count">${this.incorrectAnswers}</span></span>
                        </div>
                    </div>
                    
                    <div class="math-progress">
                        <p>Problème: <span id="current-problem">${this.currentProblemNumber}</span>/<span id="total-problems">${this.totalProblems}</span></p>
                        <div class="progress-bar">
                            <div class="progress-fill" id="math-progress"></div>
                        </div>
                    </div>
                    
                    ${this.doublePoints ? 
                        `<div class="powerup-indicator">
                            <i class="fas fa-bolt"></i> Points doublés activés!
                        </div>` : 
                        ''}
                </div>
                
                <div class="math-controls">
                    <button class="btn-secondary" id="math-skip">
                        <i class="fas fa-forward"></i> Passer
                    </button>
                    <button class="btn-primary" id="math-hint">
                        <i class="fas fa-lightbulb"></i> Indice
                    </button>
                </div>
            </div>
        `;
        
        this.updateProgress();
    }
    
    setupEventListeners() {
        this.container.querySelector('#math-submit').addEventListener('click', () => {
            this.checkAnswer();
        });
        
        this.container.querySelector('#math-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        this.container.querySelector('#math-skip').addEventListener('click', () => {
            this.skipProblem();
        });
        
        this.container.querySelector('#math-hint').addEventListener('click', () => {
            this.showHint();
        });
    }
    
    generateProblem() {
        if (!this.gameActive) return;
        
        const operation = this.operations[Math.floor(Math.random() * this.operations.length)];
        let num1, num2, answer;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * this.maxNumber) + 1;
                num2 = Math.floor(Math.random() * this.maxNumber) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * this.maxNumber) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
            case '/':
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = Math.floor(Math.random() * 10) + 1;
                num1 = num2 * answer;
                break;
        }
        
        this.currentProblem = {
            num1,
            num2,
            operation,
            answer,
            hint: this.generateHint(num1, num2, operation)
        };
        
        this.container.querySelector('#math-equation').textContent = 
            `${num1} ${operation} ${num2} = ?`;
        this.container.querySelector('#math-answer').value = '';
        this.container.querySelector('#math-answer').focus();
    }
    
    generateHint(num1, num2, operation) {
        switch(operation) {
            case '+':
                return `Essaie ${num1 + 10} - 10 + ${num2}`;
            case '-':
                return `Pense à ${num1} comme ${num2} + ${num1 - num2}`;
            case '*':
                if (num2 === 10) return `Ajoute un zéro à ${num1}`;
                return `Essaie ${num1} × ${Math.floor(num2/2)} × 2`;
            case '/':
                return `Combien de fois ${num2} dans ${num1}?`;
            default:
                return '';
        }
    }
    
    checkAnswer() {
        if (!this.gameActive) return;
        
        const userAnswer = parseFloat(this.container.querySelector('#math-answer').value);
        const correctAnswer = this.currentProblem.answer;
        
        if (isNaN(userAnswer)) {
            showNotification('Veuillez entrer un nombre!', 'error');
            return;
        }
        
        if (Math.abs(userAnswer - correctAnswer) < 0.001) {
            // Bonne réponse
            let points = 10;
            if (this.doublePoints) points *= 2;
            
            this.score += points;
            this.correctAnswers++;
            
            this.container.querySelector('#math-score').textContent = this.score;
            this.container.querySelector('#correct-count').textContent = this.correctAnswers;
            
            showNotification(`Bonne réponse! +${points} points`, 'success');
        } else {
            // Mauvaise réponse
            this.incorrectAnswers++;
            this.container.querySelector('#incorrect-count').textContent = this.incorrectAnswers;
            
            showNotification(`Mauvaise réponse! La réponse était ${correctAnswer}`, 'error');
        }
        
        // Passer au problème suivant
        this.nextProblem();
    }
    
    skipProblem() {
        if (!this.gameActive) return;
        
        this.incorrectAnswers++;
        this.container.querySelector('#incorrect-count').textContent = this.incorrectAnswers;
        
        showNotification(`Problème sauté! La réponse était ${this.currentProblem.answer}`, 'info');
        
        this.nextProblem();
    }
    
    showHint() {
        if (!this.gameActive || !this.currentProblem.hint) return;
        
        const hintElement = document.createElement('div');
        hintElement.className = 'hint-popup';
        hintElement.textContent = `Indice: ${this.currentProblem.hint}`;
        
        this.container.querySelector('.math-problem-display').appendChild(hintElement);
        
        setTimeout(() => {
            hintElement.remove();
        }, 3000);
    }
    
    nextProblem() {
        this.currentProblemNumber++;
        
        if (this.currentProblemNumber > this.totalProblems) {
            this.endGame();
            return;
        }
        
        this.updateProgress();
        this.generateProblem();
        
        // Vérifier le score cible
        if (this.targetScore && this.score >= this.targetScore) {
            this.endGame(true);
        }
    }
    
    updateProgress() {
        const progress = ((this.currentProblemNumber - 1) / this.totalProblems) * 100;
        this.container.querySelector('#math-progress').style.width = `${progress}%`;
        this.container.querySelector('#current-problem').textContent = this.currentProblemNumber;
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.gameActive) return;
            
            this.timeLeft--;
            this.container.querySelector('#math-time').textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                this.container.querySelector('#math-time').style.color = '#FF5252';
                this.container.querySelector('#math-time').style.fontWeight = 'bold';
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.endGame();
            }
        }, 1000);
    }
    
    endGame(isWin = false) {
        this.gameActive = false;
        clearInterval(this.timer);
        
        let message = '';
        if (isWin) {
            message = `🎉 Félicitations! Vous avez atteint le score cible de ${this.targetScore} points!`;
        } else if (this.targetScore && this.score < this.targetScore) {
            message = `Temps écoulé! Score final: ${this.score}/${this.targetScore}`;
        } else {
            message = `Jeu terminé! Score final: ${this.score}`;
        }
        
        this.container.innerHTML += `
            <div class="game-end">
                <h2>${isWin ? '🎉 Victoire!' : '⏰ Temps écoulé!'}</h2>
                <p>${message}</p>
                <div class="final-stats">
                    <p>Réponses correctes: ${this.correctAnswers}/${this.totalProblems}</p>
                    <p>Réponses incorrectes: ${this.incorrectAnswers}</p>
                    <p>Score final: ${this.score}</p>
                    <p>Précision: ${((this.correctAnswers / this.totalProblems) * 100).toFixed(1)}%</p>
                </div>
                <button class="btn-primary" id="play-again-math">
                    <i class="fas fa-redo"></i> Rejouer
                </button>
            </div>
        `;
        
        this.container.querySelector('#play-again-math').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    restartGame() {
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.timeLeft = this.customData?.data?.mechanics?.timeLimit || 60;
        this.gameActive = true;
        this.currentProblemNumber = 1;
        
        clearInterval(this.timer);
        this.init();
    }
}

// Fonction globale pour charger le jeu
function loadMathGame(container, mode, customData) {
    new MathGame(container, mode, customData);
}