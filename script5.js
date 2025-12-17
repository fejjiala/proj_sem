// Variables globales
let currentGameType = '';
let currentGameMode = 'computer';
let gameActive = true;
let currentRound = 1;
let totalRounds = 1;
let playerScore = 0;
let computerScore = 0;

// Données de personnalisation
const gameRules = {
    xo: { regles: "", victoire: "", defaite: "", manches: 1, punition: "" },
    pfc: { regles: "", victoire: "", defaite: "", manches: 3, punition: "" },
    quiz: { regles: "", victoire: "", defaite: "", manches: 5, punition: "" },
    dice: { regles: "", victoire: "", defaite: "", manches: 5, punition: "" },
    mots: { regles: "", victoire: "", defaite: "", manches: 1, punition: "" },
    snake: { regles: "", victoire: "", defaite: "", manches: 1, punition: "" },
    action: { regles: "", victoire: "", defaite: "", manches: 10, punition: "" },
    calcul: { regles: "", victoire: "", defaite: "", manches: 10, punition: "" },
    pong: { regles: "", victoire: "", defaite: "", manches: 3, punition: "" }
};

// Variables de jeu
let xoBoard = [];
let currentPlayer = 'X';
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let diceScore = 0;
let diceRolls = 0;
let motsGrid = [];
let motsWords = [];
let foundWords = [];
let snakeGame = null;
let pongGame = null;
let actionVeriteData = { currentPlayer: 1, currentTurn: 1 };
let calculData = { score: 0, current: 0 };

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initializeApp();
});

function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 5 + 2}px;
            height: ${Math.random() * 5 + 2}px;
            background: linear-gradient(45deg, #ff4d6d, #00d4ff);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
}

function initializeApp() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Menu mobile
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const nav = document.querySelector('nav ul');
            nav.classList.toggle('show');
        });
    }

    // Boutons principaux
    document.getElementById('btn-creer').addEventListener('click', function() {
        showPage('choix');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="choix"]').classList.add('active');
    });

    document.getElementById('btn-retour-choix').addEventListener('click', function() {
        showPage('accueil');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="accueil"]').classList.add('active');
    });

    document.getElementById('btn-retour-perso').addEventListener('click', function() {
        showPage('choix');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="choix"]').classList.add('active');
    });

    document.getElementById('btn-retour-jeu').addEventListener('click', function() {
        showPage('choix');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="choix"]').classList.add('active');
    });

    // Sélection du jeu
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            currentGameType = this.getAttribute('data-game');
            prefillCustomizationFields(currentGameType);
            showPage('personnalisation');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="personnalisation"]').classList.add('active');
        });
    });

    // Générer le jeu
    document.getElementById('btn-generer').addEventListener('click', function() {
        generateGame();
    });

    // Rejouer
    document.getElementById('btn-rejouer').addEventListener('click', function() {
        initializeGame(currentGameType);
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Fermer le menu mobile
    const nav = document.querySelector('nav ul');
    if (nav) nav.classList.remove('show');
}

function prefillCustomizationFields(gameType) {
    const defaults = {
        'xo': {
            regles: "Placez tour à tour vos symboles (X et O) sur la grille 3x3. Le premier à aligner 3 symboles identiques gagne.",
            victoire: "Alignez 3 symboles identiques horizontalement, verticalement ou en diagonale",
            defaite: "Votre adversaire aligne 3 symboles avant vous ou la grille est remplie sans gagnant",
            punition: "Faire 5 pompes"
        },
        'pfc': {
            regles: "Choisissez entre pierre, papier ou ciseaux. La pierre bat les ciseaux, les ciseaux battent le papier, le papier bat la pierre.",
            victoire: "Gagner le plus de manches sur 3",
            defaite: "Perdre plus de manches que votre adversaire",
            punition: "Chanter une chanson"
        }
    };

    const current = gameRules[gameType];
    const defaultValues = defaults[gameType] || {};
    
    document.getElementById('regles').value = current.regles || defaultValues.regles || "";
    document.getElementById('victoire').value = current.victoire || defaultValues.victoire || "";
    document.getElementById('defaite').value = current.defaite || defaultValues.defaite || "";
    document.getElementById('manches').value = current.manches || defaultValues.manches || 1;
    document.getElementById('punition').value = current.punition || defaultValues.punition || "";
    
    // Mettre à jour le titre
    const gameTitles = {
        'xo': 'Tic Tac Toe',
        'pfc': 'Rock-Paper-Scissors',
        'quiz': 'Quiz',
        'dice': 'Dice Game',
        'mots': 'Word Search',
        'snake': 'Snake Game',
        'action': 'Truth or Dare',
        'calcul': 'Mental Math',
        'pong': 'Pong'
    };
    
    document.getElementById('current-game-title').textContent = `Customize: ${gameTitles[gameType]}`;
}

function generateGame() {
    // Sauvegarder les règles
    gameRules[currentGameType] = {
        regles: document.getElementById('regles').value,
        victoire: document.getElementById('victoire').value,
        defaite: document.getElementById('defaite').value,
        manches: parseInt(document.getElementById('manches').value) || 1,
        punition: document.getElementById('punition').value
    };

    // Validation
    const rules = gameRules[currentGameType];
    if (!rules.regles || !rules.victoire || !rules.defaite) {
        alert("Please fill at least the rules, win and loss conditions.");
        return;
    }

    // Mettre à jour l'interface
    const gameTitles = {
        'xo': 'Tic Tac Toe',
        'pfc': 'Rock-Paper-Scissors',
        'quiz': 'Quiz',
        'dice': 'Dice Game',
        'mots': 'Word Search',
        'snake': 'Snake Game',
        'action': 'Truth or Dare',
        'calcul': 'Mental Math',
        'pong': 'Pong'
    };
    
    document.getElementById('titre-jeu').textContent = gameTitles[currentGameType];
    updateGameInterfaceWithCustomRules();

    // Afficher la page du jeu
    showPage('jeu');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-page="jeu"]').classList.add('active');

    // Afficher seulement le jeu sélectionné
    document.querySelectorAll('.jeu-type').forEach(jeu => {
        jeu.style.display = 'none';
    });
    document.getElementById(`jeu-${currentGameType}`).style.display = 'block';

    // Initialiser le jeu
    initializeGame(currentGameType);
}

function updateGameInterfaceWithCustomRules() {
    const rules = gameRules[currentGameType];
    const modeText = currentGameMode === 'computer' ? 'Against Computer' : 'With Friends';
    
    const rulesDisplay = document.getElementById('regles-personnalisees');
    rulesDisplay.innerHTML = `
        <div class="custom-rules">
            <h3>📋 Your Game Rules</h3>
            <p><strong>Mode:</strong> ${modeText}</p>
            <p><strong>Rules:</strong> ${rules.regles}</p>
            <p><strong>Win:</strong> ${rules.victoire}</p>
            <p><strong>Loss:</strong> ${rules.defaite}</p>
            ${rules.manches ? `<p><strong>Rounds:</strong> ${rules.manches}</p>` : ''}
            ${rules.punition ? `<p><strong>Penalty:</strong> ${rules.punition}</p>` : ''}
        </div>
    `;
}

function initializeGame(gameType) {
    const rules = gameRules[gameType];
    
    currentRound = 1;
    playerScore = 0;
    computerScore = 0;
    quizScore = 0;
    diceScore = 0;
    diceRolls = 0;
    gameActive = true;
    totalRounds = rules.manches;
    
    switch(gameType) {
        case 'xo':
            initializeXO();
            break;
        case 'pfc':
            initializePFC();
            break;
        case 'quiz':
            initializeQuiz();
            break;
        case 'dice':
            initializeDice();
            break;
        case 'mots':
            initializeMots();
            break;
        case 'snake':
            initializeSnake();
            break;
        case 'action':
            initializeAction();
            break;
        case 'calcul':
            initializeCalcul();
            break;
        case 'pong':
            initializePong();
            break;
    }
}

// ==================== XO (TIC TAC TOE) ====================
function initializeXO() {
    const board = document.getElementById('xo-board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = 'repeat(3, 1fr)';
    
    xoBoard = Array(9).fill('');
    currentPlayer = 'X';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.textContent = '';
        cell.addEventListener('click', () => handleXOClick(i));
        board.appendChild(cell);
    }
    
    document.getElementById('joueur-actuel').textContent = currentPlayer;
    document.getElementById('manche-actuelle').textContent = currentRound;
    document.getElementById('manches-total').textContent = totalRounds;
}

function handleXOClick(index) {
    if (!gameActive || xoBoard[index] !== '') return;
    
    xoBoard[index] = currentPlayer;
    document.querySelector(`.cell[data-index="${index}"]`).textContent = currentPlayer;
    
    if (checkXOWin()) {
        endGame(`Player ${currentPlayer} wins!`, 'xo');
        return;
    }
    
    if (xoBoard.every(cell => cell !== '')) {
        endGame("It's a draw!", 'xo');
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('joueur-actuel').textContent = currentPlayer;
    
    // Computer move
    if (currentGameMode === 'computer' && currentPlayer === 'O') {
        setTimeout(computerMoveXO, 500);
    }
}

function computerMoveXO() {
    const emptyCells = xoBoard
        .map((cell, index) => cell === '' ? index : -1)
        .filter(index => index !== -1);
    
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        handleXOClick(randomIndex);
    }
}

function checkXOWin() {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Columns
        [0,4,8], [2,4,6] // Diagonals
    ];
    
    return winPatterns.some(pattern => 
        xoBoard[pattern[0]] !== '' &&
        xoBoard[pattern[0]] === xoBoard[pattern[1]] &&
        xoBoard[pattern[1]] === xoBoard[pattern[2]]
    );
}

// ==================== ROCK PAPER SCISSORS ====================
function initializePFC() {
    playerScore = 0;
    computerScore = 0;
    currentRound = 1;
    
    document.getElementById('score-joueur').textContent = playerScore;
    document.getElementById('score-adversaire').textContent = computerScore;
    document.getElementById('manche-actuelle-pfc').textContent = currentRound;
    document.getElementById('manches-total-pfc').textContent = totalRounds;
    document.getElementById('resultat-pfc').textContent = '';
    
    document.querySelectorAll('.choice').forEach(choice => {
        choice.addEventListener('click', handlePFCClick);
    });
}

function handlePFCClick() {
    if (!gameActive) return;
    
    const playerChoice = this.dataset.choice;
    const choices = ['pierre', 'papier', 'ciseaux'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    
    let result = '';
    
    if (playerChoice === computerChoice) {
        result = "Draw!";
    } else if (
        (playerChoice === 'pierre' && computerChoice === 'ciseaux') ||
        (playerChoice === 'papier' && computerChoice === 'pierre') ||
        (playerChoice === 'ciseaux' && computerChoice === 'papier')
    ) {
        result = "You win this round!";
        playerScore++;
    } else {
        result = "Computer wins this round!";
        computerScore++;
    }
    
    document.getElementById('resultat-pfc').textContent = 
        `You: ${getEmoji(playerChoice)} vs Computer: ${getEmoji(computerChoice)} - ${result}`;
    document.getElementById('score-joueur').textContent = playerScore;
    document.getElementById('score-adversaire').textContent = computerScore;
    
    currentRound++;
    document.getElementById('manche-actuelle-pfc').textContent = currentRound;
    
    if (currentRound > totalRounds) {
        endGame(
            playerScore > computerScore ? "You win the game!" :
            computerScore > playerScore ? "Computer wins the game!" :
            "It's a draw!",
            'pfc'
        );
    }
}

function getEmoji(choice) {
    const emojis = {
        'pierre': '🪨',
        'papier': '📄',
        'ciseaux': '✂️'
    };
    return emojis[choice] || choice;
}

// ==================== QUIZ ====================
function initializeQuiz() {
    quizQuestions = [
        { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: 3 },
        { question: "How many sides does a hexagon have?", options: ["4", "5", "6", "7"], answer: 3 },
        { question: "What is the largest mammal?", options: ["Elephant", "Giraffe", "Blue Whale", "Rhino"], answer: 3 },
        { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 3 },
        { question: "What is the chemical symbol for gold?", options: ["Ag", "Fe", "Au", "Cu"], answer: 3 }
    ];
    
    currentQuizIndex = 0;
    quizScore = 0;
    
    document.getElementById('score-quiz').textContent = quizScore;
    document.getElementById('questions-total').textContent = quizQuestions.length;
    document.getElementById('resultat-quiz').textContent = '';
    
    showQuizQuestion();
    
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', handleQuizClick);
    });
}

function showQuizQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
        endGame(`Quiz finished! Score: ${quizScore}/${quizQuestions.length}`, 'quiz');
        return;
    }
    
    const question = quizQuestions[currentQuizIndex];
    document.getElementById('question-quiz').textContent = question.question;
    
    document.querySelectorAll('.quiz-option').forEach((option, index) => {
        option.querySelector('.option-text').textContent = question.options[index];
    });
}

function handleQuizClick() {
    const selectedOption = parseInt(this.dataset.option);
    const correctOption = quizQuestions[currentQuizIndex].answer;
    
    if (selectedOption === correctOption) {
        quizScore++;
        document.getElementById('resultat-quiz').textContent = "Correct!";
        document.getElementById('resultat-quiz').style.color = '#4CAF50';
    } else {
        document.getElementById('resultat-quiz').textContent = `Wrong! Correct answer: ${quizQuestions[currentQuizIndex].options[correctOption-1]}`;
        document.getElementById('resultat-quiz').style.color = '#FF6B6B';
    }
    
    document.getElementById('score-quiz').textContent = quizScore;
    currentQuizIndex++;
    
    setTimeout(showQuizQuestion, 1000);
}

// ==================== DICE GAME ====================
function initializeDice() {
    diceScore = 0;
    diceRolls = 0;
    
    document.getElementById('score-dice').textContent = diceScore;
    document.getElementById('resultat-dice').textContent = '';
    
    document.getElementById('btn-roll-dice').addEventListener('click', rollDice);
}

function rollDice() {
    if (!gameActive) return;
    
    const dice = document.getElementById('de');
    dice.style.animation = 'roll 1s ease';
    
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        
        dice.textContent = diceFaces[roll - 1];
        dice.style.animation = '';
        
        diceScore += roll;
        diceRolls++;
        document.getElementById('score-dice').textContent = diceScore;
        document.getElementById('resultat-dice').textContent = `Roll ${diceRolls}: You got ${roll}!`;
        
        if (diceRolls >= totalRounds) {
            endGame(`Final score: ${diceScore}`, 'dice');
        }
    }, 1000);
}

// ==================== WORD SEARCH ====================
function initializeMots() {
    motsWords = ['CAT', 'DOG', 'HOUSE', 'CAR', 'TREE'];
    foundWords = [];
    motsGrid = [];
    
    document.getElementById('mots-trouves').textContent = '0';
    document.getElementById('mots-total').textContent = motsWords.length;
    document.getElementById('resultat-mots').textContent = '';
    
    generateWordSearch();
}

function generateWordSearch() {
    const grid = document.getElementById('mots-grid');
    grid.innerHTML = '';
    
    // Créer une grille 10x10 avec des lettres aléatoires
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'word-cell';
        cell.textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        grid.appendChild(cell);
    }
    
    // Afficher la liste des mots
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    motsWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordList.appendChild(wordItem);
    });
}

// ==================== SNAKE ====================
function initializeSnake() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    
    if (snakeGame) {
        clearInterval(snakeGame);
    }
    
    // Réinitialiser l'affichage
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-length').textContent = '1';
    document.getElementById('resultat-snake').textContent = '';
    
    // Dessiner l'écran de démarrage
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake Game', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Click Play Again to start', canvas.width/2, canvas.height/2 + 20);
}

// ==================== TRUTH OR DARE ====================
function initializeAction() {
    actionVeriteData = { currentPlayer: 1, currentTurn: 1 };
    
    document.getElementById('current-player').textContent = `Player ${actionVeriteData.currentPlayer}`;
    document.getElementById('tour-action').textContent = actionVeriteData.currentTurn;
    document.getElementById('tours-total').textContent = totalRounds;
    document.getElementById('card-content').textContent = 'Choose Truth or Dare to start!';
    document.getElementById('resultat-action').textContent = '';
    
    document.getElementById('btn-action').addEventListener('click', () => showRandomAction());
    document.getElementById('btn-verite').addEventListener('click', () => showRandomTruth());
    document.getElementById('btn-next-player').addEventListener('click', nextPlayer);
}

function showRandomAction() {
    const actions = [
        "Do 10 push-ups",
        "Sing a song",
        "Dance for 30 seconds",
        "Do an impression",
        "Tell a joke"
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    document.getElementById('card-content').textContent = `DARE: ${randomAction}`;
}

function showRandomTruth() {
    const truths = [
        "What's your biggest secret?",
        "What's your biggest fear?",
        "What's your biggest regret?",
        "Who's your celebrity crush?",
        "What's your craziest dream?"
    ];
    const randomTruth = truths[Math.floor(Math.random() * truths.length)];
    document.getElementById('card-content').textContent = `TRUTH: ${randomTruth}`;
}

function nextPlayer() {
    actionVeriteData.currentPlayer = actionVeriteData.currentPlayer % 2 + 1;
    document.getElementById('current-player').textContent = `Player ${actionVeriteData.currentPlayer}`;
    
    if (actionVeriteData.currentPlayer === 1) {
        actionVeriteData.currentTurn++;
        document.getElementById('tour-action').textContent = actionVeriteData.currentTurn;
        
        if (actionVeriteData.currentTurn > totalRounds) {
            endGame("Game finished! Everyone avoided the penalty!", 'action');
        }
    }
}

// ==================== MENTAL MATH ====================
function initializeCalcul() {
    calculData = { score: 0, current: 0 };
    
    document.getElementById('calcul-score').textContent = '0';
    document.getElementById('calcul-count').textContent = '0';
    document.getElementById('calcul-total').textContent = totalRounds;
    document.getElementById('resultat-calcul').textContent = '';
    
    generateMathQuestion();
    
    document.getElementById('btn-valider-calcul').addEventListener('click', validateMathAnswer);
    document.getElementById('calcul-reponse').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validateMathAnswer();
    });
}

function generateMathQuestion() {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    let answer;
    
    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;
    
    calculData.current = { a, b, op, answer };
    document.getElementById('calcul-question').textContent = `${a} ${op} ${b} = ?`;
    document.getElementById('calcul-reponse').value = '';
}

function validateMathAnswer() {
    const userAnswer = parseInt(document.getElementById('calcul-reponse').value);
    
    if (isNaN(userAnswer)) {
        document.getElementById('resultat-calcul').textContent = "Please enter a number!";
        return;
    }
    
    if (userAnswer === calculData.current.answer) {
        calculData.score++;
        document.getElementById('resultat-calcul').textContent = "Correct!";
        document.getElementById('resultat-calcul').style.color = '#4CAF50';
    } else {
        document.getElementById('resultat-calcul').textContent = `Wrong! Answer: ${calculData.current.answer}`;
        document.getElementById('resultat-calcul').style.color = '#FF6B6B';
    }
    
    document.getElementById('calcul-score').textContent = calculData.score;
    calculData.current++;
    document.getElementById('calcul-count').textContent = calculData.current;
    
    if (calculData.current >= totalRounds) {
        endGame(`Math game finished! Score: ${calculData.score}/${totalRounds}`, 'calcul');
    } else {
        setTimeout(generateMathQuestion, 1000);
    }
}

// ==================== PONG ====================
function initializePong() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    
    if (pongGame) {
        cancelAnimationFrame(pongGame);
    }
    
    // Réinitialiser les scores
    document.getElementById('pong-score-joueur').textContent = '0';
    document.getElementById('pong-score-adversaire').textContent = '0';
    document.getElementById('pong-manche').textContent = currentRound;
    document.getElementById('pong-manches').textContent = totalRounds;
    document.getElementById('resultat-pong').textContent = '';
    
    // Dessiner l'écran de démarrage
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pong Game', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Click Play Again to start', canvas.width/2, canvas.height/2 + 20);
}

// ==================== FIN DE JEU ====================
function endGame(message, gameType) {
    gameActive = false;
    const rules = gameRules[gameType];
    
    let punishmentText = '';
    if (message.includes('win') || message.includes('finished')) {
        punishmentText = `<p class="punition">🎉 You avoided the penalty!</p>`;
    } else if (message.includes('lose') || message.includes('lost')) {
        punishmentText = `<p class="punition">💥 You must: ${rules.punition}</p>`;
    }
    
    const resultElement = document.getElementById(`resultat-${gameType}`);
    if (resultElement) {
        resultElement.innerHTML = `<h3>${message}</h3>${punishmentText}`;
    }
}

// Animation pour le dé
const style = document.createElement('style');
style.textContent = `
    @keyframes roll {
        0% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(90deg) scale(1.1); }
        50% { transform: rotate(180deg) scale(1); }
        75% { transform: rotate(270deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
    }
    
    @keyframes floatParticle {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);