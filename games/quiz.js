// Quiz Game Implementation
class QuizGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        // Questions par catégorie
        this.questionBank = {
            general: this.getGeneralQuestions(),
            science: this.getScienceQuestions(),
            history: this.getHistoryQuestions(),
            geography: this.getGeographyQuestions()
        };
        
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.totalQuestions = 10;
        this.timePerQuestion = 30;
        this.timeLeft = 30;
        this.selectedCategory = 'general';
        this.questions = [];
        this.timer = null;
        this.gameActive = true;
        this.selectedAnswer = null;
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    getGeneralQuestions() {
        return [
            {
                question: "Quelle est la capitale de la France?",
                options: ["Londres", "Berlin", "Paris", "Madrid"],
                correct: 2,
                category: "Géographie",
                difficulty: "easy",
                hint: "C'est la ville de la Tour Eiffel"
            },
            {
                question: "Combien de planètes dans notre système solaire?",
                options: ["7", "8", "9", "10"],
                correct: 1,
                category: "Science",
                difficulty: "easy",
                hint: "Pluton n'est plus considérée comme une planète"
            },
            {
                question: "Qui a peint la Mona Lisa?",
                options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Rembrandt"],
                correct: 2,
                category: "Art",
                difficulty: "medium",
                hint: "Artiste italien de la Renaissance"
            }
        ];
    }
    
    getScienceQuestions() {
        return [
            {
                question: "Quelle est la formule chimique de l'eau?",
                options: ["H2O", "CO2", "O2", "NaCl"],
                correct: 0,
                category: "Chimie",
                difficulty: "easy",
                hint: "Deux atomes d'hydrogène et un d'oxygène"
            }
        ];
    }
    
    getHistoryQuestions() {
        return [
            {
                question: "En quelle année a eu lieu la Révolution française?",
                options: ["1776", "1789", "1799", "1815"],
                correct: 1,
                category: "Histoire",
                difficulty: "medium",
                hint: "Année de la prise de la Bastille"
            }
        ];
    }
    
    getGeographyQuestions() {
        return [
            {
                question: "Quel est le plus grand océan du monde?",
                options: ["Atlantique", "Indien", "Arctique", "Pacifique"],
                correct: 3,
                category: "Géographie",
                difficulty: "easy",
                hint: "Il couvre environ un tiers de la surface terrestre"
            }
        ];
    }
    
    applyCustomization(data) {
        // Catégorie
        if (data.rules.customRules) {
            const rules = data.rules.customRules.toLowerCase();
            if (rules.includes('science') || rules.includes('scientifique')) {
                this.selectedCategory = 'science';
            } else if (rules.includes('histoire')) {
                this.selectedCategory = 'history';
            } else if (rules.includes('géographie')) {
                this.selectedCategory = 'geography';
            }
        }
        
        // Nombre de questions
        if (data.rules.rounds) {
            this.totalQuestions = data.rules.rounds;
        }
        
        // Temps par question
        if (data.mechanics.timeLimit) {
            this.timePerQuestion = data.mechanics.timeLimit;
            this.timeLeft = data.mechanics.timeLimit;
        }
        
        // Difficulté
        if (data.mechanics.difficulty) {
            this.difficulty = data.mechanics.difficulty;
        }
        
        // Power-ups
        if (data.mechanics.powerups && data.mechanics.powerups.includes('double')) {
            this.doublePoints = true;
        }
    }
    
    init() {
        this.selectQuestions();
        this.render();
        this.setupEventListeners();
        this.loadQuestion();
        this.startTimer();
    }
    
    selectQuestions() {
        let availableQuestions = [...this.questionBank[this.selectedCategory]];
        
        // Filtrer par difficulté si spécifié
        if (this.difficulty && this.difficulty !== 'all') {
            availableQuestions = availableQuestions.filter(
                q => q.difficulty === this.difficulty
            );
        }
        
        // Mélanger et sélectionner
        availableQuestions = this.shuffleArray(availableQuestions);
        this.questions = availableQuestions.slice(0, this.totalQuestions);
        
        // Si pas assez de questions, répéter certaines
        while (this.questions.length < this.totalQuestions) {
            this.questions.push(...availableQuestions);
        }
        this.questions = this.questions.slice(0, this.totalQuestions);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Quiz ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="quiz-header">
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="quiz-progress"></div>
                        </div>
                        <div class="progress-text">
                            Question <span id="current-question">${this.currentQuestionIndex + 1}</span>/
                            <span id="total-questions">${this.totalQuestions}</span>
                        </div>
                    </div>
                    
                    <div class="quiz-timer">
                        <div class="timer-circle">
                            <span id="time-left">${this.timeLeft}</span>s
                        </div>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h3 id="question-text">Chargement...</h3>
                </div>
                
                <div class="quiz-options" id="quiz-options">
                    <!-- Les options seront chargées dynamiquement -->
                </div>
                
                <div class="quiz-footer">
                    <div class="quiz-score">
                        <div class="score-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Correctes: <span id="correct-count">${this.correctAnswers}</span></span>
                        </div>
                        <div class="score-item">
                            <i class="fas fa-times-circle"></i>
                            <span>Incorrectes: <span id="incorrect-count">${this.incorrectAnswers}</span></span>
                        </div>
                        <div class="score-item">
                            <i class="fas fa-star"></i>
                            <span>Score: <span id="quiz-score">${this.score}</span></span>
                        </div>
                    </div>
                    
                    <div class="quiz-controls">
                        <button class="btn-secondary" id="quiz-hint">
                            <i class="fas fa-lightbulb"></i> Indice
                        </button>
                        <button class="btn-primary" id="quiz-next" disabled>
                            <i class="fas fa-arrow-right"></i> Suivant
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.updateProgress();
    }
    
    setupEventListeners() {
        // Le bouton suivant sera activé dans loadQuestion
        this.container.querySelector('#quiz-next').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        this.container.querySelector('#quiz-hint').addEventListener('click', () => {
            this.showHint();
        });
    }
    
    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        
        // Mettre à jour la question
        this.container.querySelector('#question-text').textContent = question.question;
        
        // Créer les options
        const optionsContainer = this.container.querySelector('#quiz-options');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <div class="quiz-option" data-answer="${index}">
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <span>${option}</span>
            </div>
        `).join('');
        
        // Ajouter les écouteurs d'événements
        this.container.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectAnswer(option);
            });
        });
        
        // Désactiver le bouton suivant
        this.container.querySelector('#quiz-next').disabled = true;
        this.selectedAnswer = null;
        
        // Réinitialiser le timer
        this.timeLeft = this.timePerQuestion;
        this.container.querySelector('#time-left').textContent = this.timeLeft;
        
        this.updateProgress();
    }
    
    selectAnswer(option) {
        if (this.selectedAnswer !== null || !this.gameActive) return;
        
        const answerIndex = parseInt(option.dataset.answer);
        const question = this.questions[this.currentQuestionIndex];
        
        this.selectedAnswer = answerIndex;
        
        // Désactiver tous les boutons
        this.container.querySelectorAll('.quiz-option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        // Afficher la bonne réponse
        this.container.querySelectorAll('.quiz-option').forEach((opt, index) => {
            if (index === question.correct) {
                opt.classList.add('correct');
            } else if (index === answerIndex && index !== question.correct) {
                opt.classList.add('incorrect');
            }
        });
        
        // Calculer les points
        let points = 10;
        if (this.doublePoints) points *= 2;
        
        // Bonus de temps
        const timeBonus = Math.floor(this.timeLeft / 5);
        points += timeBonus;
        
        if (answerIndex === question.correct) {
            this.score += points;
            this.correctAnswers++;
            
            this.container.querySelector('#quiz-score').textContent = this.score;
            this.container.querySelector('#correct-count').textContent = this.correctAnswers;
            
            showNotification(`Bonne réponse! +${points} points (${timeBonus} bonus temps)`, 'success');
        } else {
            this.incorrectAnswers++;
            this.container.querySelector('#incorrect-count').textContent = this.incorrectAnswers;
            
            showNotification(`Mauvaise réponse! La bonne réponse était: ${question.options[question.correct]}`, 'error');
        }
        
        // Activer le bouton suivant
        this.container.querySelector('#quiz-next').disabled = false;
        
        // Arrêter le timer
        clearInterval(this.timer);
    }
    
    showHint() {
        if (!this.gameActive || this.selectedAnswer !== null) return;
        
        const question = this.questions[this.currentQuestionIndex];
        if (question.hint) {
            showNotification(`Indice: ${question.hint}`, 'info');
            
            // Pénalité pour l'indice
            this.timeLeft = Math.max(5, this.timeLeft - 5);
            this.container.querySelector('#time-left').textContent = this.timeLeft;
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.gameActive || this.selectedAnswer !== null) return;
            
            this.timeLeft--;
            this.container.querySelector('#time-left').textContent = this.timeLeft;
            
            // Animation d'avertissement
            if (this.timeLeft <= 10) {
                const timerCircle = this.container.querySelector('.timer-circle');
                timerCircle.style.animation = 'pulse 0.5s infinite';
                timerCircle.style.backgroundColor = '#FF5252';
            }
            
            // Temps écoulé
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                
                if (this.selectedAnswer === null) {
                    this.container.querySelectorAll('.quiz-option').forEach((opt, index) => {
                        if (index === this.questions[this.currentQuestionIndex].correct) {
                            opt.classList.add('correct');
                        }
                    });
                    
                    this.incorrectAnswers++;
                    this.container.querySelector('#incorrect-count').textContent = this.incorrectAnswers;
                    
                    showNotification('Temps écoulé!', 'error');
                    
                    // Activer le bouton suivant
                    this.container.querySelector('#quiz-next').disabled = false;
                }
            }
        }, 1000);
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.loadQuestion();
            this.startTimer();
        } else {
            this.endGame();
        }
    }
    
    updateProgress() {
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        this.container.querySelector('#quiz-progress').style.width = `${progress}%`;
        this.container.querySelector('#current-question').textContent = this.currentQuestionIndex + 1;
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        const accuracy = (this.correctAnswers / this.questions.length) * 100;
        let message = '';
        
        if (accuracy >= 80) {
            message = '🎉 Excellent travail!';
        } else if (accuracy >= 60) {
            message = '👍 Bon score!';
        } else if (accuracy >= 40) {
            message = '😊 Pas mal!';
        } else {
            message = '💪 Continuez à pratiquer!';
        }
        
        this.container.innerHTML = `
            <div class="game-end">
                <h2>Quiz Terminé!</h2>
                <p>${message}</p>
                
                <div class="final-results">
                    <div class="result-item">
                        <i class="fas fa-trophy"></i>
                        <h3>Score Final</h3>
                        <div class="final-score">${this.score}</div>
                    </div>
                    
                    <div class="result-details">
                        <p><i class="fas fa-check"></i> Réponses correctes: ${this.correctAnswers}/${this.questions.length}</p>
                        <p><i class="fas fa-times"></i> Réponses incorrectes: ${this.incorrectAnswers}</p>
                        <p><i class="fas fa-chart-line"></i> Précision: ${accuracy.toFixed(1)}%</p>
                        ${this.doublePoints ? '<p><i class="fas fa-bolt"></i> Points doublés activés</p>' : ''}
                    </div>
                </div>
                
                <button class="btn-primary" id="quiz-restart">
                    <i class="fas fa-redo"></i> Refaire le quiz
                </button>
            </div>
        `;
        
        this.container.querySelector('#quiz-restart').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    restartGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.timeLeft = this.timePerQuestion;
        this.gameActive = true;
        this.selectedAnswer = null;
        
        clearInterval(this.timer);
        this.selectQuestions();
        this.init();
    }
}

// Fonction globale pour charger le jeu
function loadQuizGame(container, mode, customData) {
    new QuizGame(container, mode, customData);
}