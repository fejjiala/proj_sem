// Variables globales
let currentGameType = '';
let currentGameMode = 'computer';
let gameActive = true;
let currentRound = 1;
let totalRounds = 1;
let playerScore = 0;
let computerScore = 0;
let quizScore = 0;
let diceScore = 0;

// Données de personnalisation par jeu
let gameRules = {
    xo: { regles: "", victoire: "", defaite: "", manches: 1, punition: "", gridSize: 3, winLength: 3 },
    pfc: { regles: "", victoire: "", defaite: "", manches: 3, punition: "" },
    quiz: { regles: "", victoire: "", defaite: "", manches: 5, punition: "" },
    dice: { regles: "", victoire: "", defaite: "", manches: 5, punition: "" },
    mots: { regles: "", victoire: "", defaite: "", manches: 1, punition: "", mots: "", gridSize: 10, timer: 60 },
    snake: { regles: "", victoire: "", defaite: "", manches: 1, punition: "", vitesse: 5, scoreGoal: 50 },
    action: { regles: "", victoire: "", defaite: "", manches: 10, punition: "", actions: "", verites: "", timePerQuestion: 10 },
    calcul: { regles: "", victoire: "", defaite: "", manches: 10, punition: "", niveau: "facile", timePerQuestion: 10 },
    pong: { regles: "", victoire: "", defaite: "", manches: 3, punition: "", vitesse: 5, pointsToWin: 5 }
};

// Données pour les jeux
let gameBoard = [];
let currentPlayer = 'X';

// Variables spécifiques au Snake
let snakeGame = {
    canvas: null,
    ctx: null,
    snake: [],
    direction: 'right',
    food: {},
    gridSize: 20,
    score: 0,
    gameLoop: null,
    gameStarted: false,
    gameOver: false,
    timer: 0,
    timerInterval: null,
    timerLimit: 120
};

let pongGame = {
    canvas: null,
    ctx: null,
    ball: { x: 300, y: 200, dx: 5, dy: 5, radius: 10 },
    playerPaddle: { x: 50, y: 175, width: 10, height: 50 },
    computerPaddle: { x: 540, y: 175, width: 10, height: 50 },
    playerScore: 0,
    computerScore: 0,
    gameLoop: null,
    keys: {},
    isInitialized: false
};

let actionVerite = {
    actions: [],
    verites: [],
    currentTour: 1,
    currentPlayerIndex: 0,
    players: ["Joueur 1", "Joueur 2"]
};

let calculMental = {
    currentQuestion: {},
    score: 0,
    count: 0,
    timer: null,
    timeLeft: 10
};

let motsMelees = {
    grid: [],
    words: [],
    foundWords: [],
    selectedCells: [],
    gameTimer: null,
    timeLeft: 60
};

let quizQuestions = [
    {
        question: "Quelle est la capitale de la France?",
        options: ["Londres", "Berlin", "Paris", "Madrid"],
        answer: 3
    },
    {
        question: "Combien de côtés a un hexagone?",
        options: ["4", "5", "6", "7"],
        answer: 3
    },
    {
        question: "Quel est le plus grand mammifère du monde?",
        options: ["Éléphant", "Girafe", "Baleine bleue", "Rhinocéros"],
        answer: 3
    },
    {
        question: "Qui a peint la Joconde?",
        options: ["Van Gogh", "Picasso", "Léonard de Vinci", "Michel-Ange"],
        answer: 3
    },
    {
        question: "Quel est le symbole chimique de l'or?",
        options: ["Ag", "Fe", "Au", "Cu"],
        answer: 3
    }
];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateStats();
});

function initializeApp() {
    // Navigation entre les pages
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Bouton "Créer un jeu"
    document.getElementById('btn-creer').addEventListener('click', function() {
        showPage('choix');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="choix"]').classList.add('active');
    });

    // Boutons de retour
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

    // Sélection du type de jeu
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            currentGameType = this.getAttribute('data-game');
            prefillCustomizationFields(currentGameType);
            showPage('personnalisation');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="personnalisation"]').classList.add('active');
        });
    });

    // Génération du jeu
    document.getElementById('btn-generer').addEventListener('click', function() {
        generateGame();
    });

    // Bouton Rejouer
    document.getElementById('btn-rejouer').addEventListener('click', function() {
        initializeGame(currentGameType);
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Mettre à jour les statistiques
function updateStats() {
    const stats = JSON.parse(localStorage.getItem('gameforge_stats')) || {
        gamesCreated: 0,
        playersActive: 0,
        gamesPlayed: 0
    };
    
    document.getElementById('games-count').textContent = stats.gamesCreated + 128;
    document.getElementById('players-count').textContent = stats.playersActive + 567;
    document.getElementById('games-played').textContent = stats.gamesPlayed + 892;
}

// Pré-remplir les champs selon le jeu
function prefillCustomizationFields(gameType) {
    const defaults = {
        'xo': {
            regles: "Placez tour à tour vos symboles (X et O) sur la grille 3x3. Le premier à aligner 3 symboles identiques gagne.",
            victoire: "Alignez 3 symboles identiques horizontalement, verticalement ou en diagonale",
            defaite: "Votre adversaire aligne 3 symboles avant vous ou la grille est remplie sans gagnant",
            manches: 1,
            punition: "Faire 5 pompes"
        },
        'pfc': {
            regles: "Choisissez entre pierre, papier ou ciseaux. La pierre bat les ciseaux, les ciseaux battent le papier, le papier bat la pierre.",
            victoire: "Gagner le plus de manches sur le nombre total défini",
            defaite: "Perdre plus de manches que votre adversaire",
            manches: 3,
            punition: "Chanter une chanson"
        },
        'quiz': {
            regles: "Répondez correctement aux questions qui s'affichent. Chaque bonne réponse rapporte 1 point.",
            victoire: "Obtenir un score supérieur à la moitié du nombre total de questions",
            defaite: "Obtenir un score inférieur ou égal à la moitié du nombre total de questions",
            manches: 5,
            punition: "Apprendre 3 nouveaux faits intéressants"
        },
        'dice': {
            regles: "Lancez le dé autant de fois que vous le souhaitez. Le but est d'obtenir le score le plus élevé possible.",
            victoire: "Atteindre ou dépasser le score cible de 15 points",
            defaite: "Ne pas atteindre le score cible après 5 lancers",
            manches: 5,
            punition: "Sauter sur un pied 10 fois"
        },
        'mots': {
            regles: "Trouvez tous les mots cachés dans la grille. Les mots peuvent être placés horizontalement, verticalement ou en diagonale. Vous avez 1 minute.",
            victoire: "Trouver tous les mots dans la grille avant la fin du temps",
            defaite: "Ne pas trouver tous les mots dans le temps imparti",
            manches: 1,
            punition: "Écrire 10 fois chaque mot non trouvé",
            mots: "CHAT,CHIEN,MAISON,VOITURE,ARBRE"
        },
        'snake': {
            regles: "Contrôlez le serpent avec les flèches directionnelles. Mangez la nourriture pour grandir. Évitez de vous mordre la queue ou de toucher les murs.",
            victoire: "Atteindre un score de 50 points",
            defaite: "Le serpent se mord la queue ou touche un mur",
            manches: 1,
            punition: "Faire 20 sauts",
            vitesse: 5
        },
        'action': {
            regles: "Choisissez entre Action ou Vérité à chaque tour. Les Actions sont des défis à réaliser, les Vérités sont des questions auxquelles vous devez répondre honnêtement.",
            victoire: "Terminer tous les tours sans abandonner",
            defaite: "Abandonner un défi ou refuser de répondre",
            manches: 10,
            punition: "Faire le prochain défi de l'adversaire",
            actions: "Fais 10 pompes,Chante une chanson,Danse 30 secondes",
            verites: "Quel est ton plus grand secret?,Quelle est ta plus grande peur?"
        },
        'calcul': {
            regles: "Résolvez les opérations mathématiques le plus rapidement possible. Vous avez 10 secondes par question.",
            victoire: "Obtenir un score de 8/10 ou plus",
            defaite: "Obtenir un score inférieur à 8/10",
            manches: 10,
            punition: "Résoudre 10 opérations supplémentaires",
            niveau: "facile"
        },
        'pong': {
            regles: "Utilisez les flèches haut/bas pour déplacer votre raquette. Renvoyez la balle et marquez des points quand l'adversaire rate la balle.",
            victoire: "Gagner 3 manches avant l'ordinateur",
            defaite: "Perdre 3 manches contre l'ordinateur",
            manches: 3,
            punition: "Faire 10 flexions",
            vitesse: 5
        }
    };

    const currentRules = gameRules[gameType];
    const defaultValues = defaults[gameType] || {};
    
    document.getElementById('regles').value = currentRules.regles || defaultValues.regles || "";
    document.getElementById('victoire').value = currentRules.victoire || defaultValues.victoire || "";
    document.getElementById('defaite').value = currentRules.defaite || defaultValues.defaite || "";
    document.getElementById('manches').value = currentRules.manches || defaultValues.manches || 1;
    document.getElementById('punition').value = currentRules.punition || defaultValues.punition || "";
    
    // Définir le mode par défaut selon le jeu
    const defaultModes = {
        'xo': 'computer',
        'pfc': 'computer', 
        'quiz': 'computer',
        'dice': 'computer',
        'mots': 'computer',
        'snake': 'computer',
        'action': 'friends',
        'calcul': 'computer',
        'pong': 'computer'
    };
    
    document.getElementById('game-mode').value = defaultModes[gameType] || 'computer';
    
    // Mettre à jour le titre
    const gameTitles = {
        'xo': 'Tic Tac Toe',
        'pfc': 'Pierre-Papier-Ciseaux',
        'quiz': 'Quiz',
        'dice': 'Jeu de Dé',
        'mots': 'Mots Mêlés',
        'snake': 'Jeu du Serpent',
        'action': 'Action ou Vérité',
        'calcul': 'Calcul Mental',
        'pong': 'Ping Pong'
    };
    
    document.getElementById('current-game-title').textContent = `Personnalisation du jeu : ${gameTitles[gameType]}`;
    
    // Ajouter les champs spécifiques au jeu
    addSpecificFields(gameType, defaultValues);
}

// Ajouter des champs spécifiques selon le jeu
function addSpecificFields(gameType, defaultValues) {
    const container = document.getElementById('jeu-specific-fields');
    container.innerHTML = '';
    
    switch(gameType) {
        case 'mots':
            container.innerHTML = `
                <div class="form-group">
                    <label for="mots-list">Liste des mots (séparés par des virgules) :</label>
                    <input type="text" id="mots-list" value="${defaultValues.mots || ''}" placeholder="CHAT,CHIEN,MAISON...">
                </div>
                <div class="form-group">
                    <label for="grid-size-mots">Taille de la grille :</label>
                    <select id="grid-size-mots">
                        <option value="8">8x8</option>
                        <option value="10" selected>10x10</option>
                        <option value="12">12x12</option>
                        <option value="15">15x15</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="mots-timer">Temps limite (secondes) :</label>
                    <input type="number" id="mots-timer" min="30" max="180" value="60">
                </div>
            `;
            break;
            
        case 'snake':
            container.innerHTML = `
                <div class="form-group">
                    <label for="snake-speed">Vitesse du serpent :</label>
                    <select id="snake-speed">
                        <option value="3">Lent</option>
                        <option value="5" selected>Normal</option>
                        <option value="8">Rapide</option>
                        <option value="10">Très rapide</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="snake-goal">Score objectif :</label>
                    <input type="number" id="snake-goal" min="10" max="100" value="50">
                </div>
            `;
            break;
            
        case 'action':
            container.innerHTML = `
                <div class="form-group">
                    <label for="player-count">Nombre de joueurs :</label>
                    <input type="number" id="player-count" min="2" max="8" value="2">
                </div>
                <div class="form-group">
                    <label for="actions-list">Actions (séparées par des virgules) :</label>
                    <textarea id="actions-list" rows="3" placeholder="Fais 10 pompes, Chante une chanson...">${defaultValues.actions || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="verites-list">Vérités (séparées par des virgules) :</label>
                    <textarea id="verites-list" rows="3" placeholder="Quel est ton plus grand secret?, Quelle est ta plus grande peur?...">${defaultValues.verites || ''}</textarea>
                </div>
            `;
            break;
            
        case 'calcul':
            container.innerHTML = `
                <div class="form-group">
                    <label for="calcul-level">Niveau de difficulté :</label>
                    <select id="calcul-level">
                        <option value="facile" selected>Facile (additions/soustractions)</option>
                        <option value="moyen">Moyen (multiplications)</option>
                        <option value="difficile">Difficile (divisions)</option>
                        <option value="expert">Expert (mélange)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="calcul-time">Temps par question (secondes) :</label>
                    <input type="number" id="calcul-time" min="5" max="30" value="10">
                </div>
            `;
            break;
            
        case 'pong':
            container.innerHTML = `
                <div class="form-group">
                    <label for="pong-speed">Vitesse de la balle :</label>
                    <select id="pong-speed">
                        <option value="3">Lent</option>
                        <option value="5" selected>Normal</option>
                        <option value="8">Rapide</option>
                        <option value="10">Très rapide</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pong-points">Points pour gagner une manche :</label>
                    <input type="number" id="pong-points" min="3" max="15" value="5">
                </div>
            `;
            break;
            
        case 'xo':
            container.innerHTML = `
                <div class="form-group">
                    <label for="xo-grid">Taille de la grille :</label>
                    <select id="xo-grid">
                        <option value="3">3x3 (Classique)</option>
                        <option value="4">4x4</option>
                        <option value="5">5x5</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="xo-length">Longueur pour gagner :</label>
                    <input type="number" id="xo-length" min="3" max="5" value="3">
                </div>
            `;
            break;
    }
}

// Générer le jeu
function generateGame() {
    // Sauvegarder le mode de jeu
    currentGameMode = document.getElementById('game-mode').value;
    
    // Sauvegarder les règles
    gameRules[currentGameType] = {
        regles: document.getElementById('regles').value,
        victoire: document.getElementById('victoire').value,
        defaite: document.getElementById('defaite').value,
        manches: parseInt(document.getElementById('manches').value) || 1,
        punition: document.getElementById('punition').value
    };
    
    // Sauvegarder les champs spécifiques
    switch(currentGameType) {
        case 'mots':
            gameRules.mots.mots = document.getElementById('mots-list').value;
            gameRules.mots.gridSize = parseInt(document.getElementById('grid-size-mots').value);
            gameRules.mots.timer = parseInt(document.getElementById('mots-timer').value) || 60;
            break;
        case 'snake':
            gameRules.snake.vitesse = parseInt(document.getElementById('snake-speed').value);
            gameRules.snake.scoreGoal = parseInt(document.getElementById('snake-goal').value) || 50;
            break;
        case 'action':
            gameRules.action.actions = document.getElementById('actions-list').value;
            gameRules.action.verites = document.getElementById('verites-list').value;
            // Créer la liste des joueurs
            const playerCount = parseInt(document.getElementById('player-count').value);
            actionVerite.players = Array.from({length: playerCount}, (_, i) => `Joueur ${i + 1}`);
            break;
        case 'calcul':
            gameRules.calcul.niveau = document.getElementById('calcul-level').value;
            gameRules.calcul.timePerQuestion = parseInt(document.getElementById('calcul-time').value) || 10;
            break;
        case 'pong':
            gameRules.pong.vitesse = parseInt(document.getElementById('pong-speed').value);
            gameRules.pong.pointsToWin = parseInt(document.getElementById('pong-points').value) || 5;
            break;
        case 'xo':
            gameRules.xo.gridSize = parseInt(document.getElementById('xo-grid').value) || 3;
            gameRules.xo.winLength = parseInt(document.getElementById('xo-length').value) || 3;
            break;
    }
    
    // Validation
    const rules = gameRules[currentGameType];
    if (!rules.regles || !rules.victoire || !rules.defaite) {
        alert("Veuillez remplir au moins les règles, conditions de victoire et de défaite.");
        return;
    }
    
    // Mettre à jour l'interface
    const gameTitles = {
        'xo': 'Tic Tac Toe',
        'pfc': 'Pierre-Papier-Ciseaux',
        'quiz': 'Quiz',
        'dice': 'Jeu de Dé',
        'mots': 'Mots Mêlés',
        'snake': 'Jeu du Serpent',
        'action': 'Action ou Vérité',
        'calcul': 'Calcul Mental',
        'pong': 'Ping Pong'
    };
    
    document.getElementById('titre-jeu').textContent = gameTitles[currentGameType] + ' Personnalisé';
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
    
    // Sauvegarder les statistiques
    saveGameStats();
}

// Mettre à jour l'interface avec les règles
function updateGameInterfaceWithCustomRules() {
    const rules = gameRules[currentGameType];
    let rulesDisplay = document.getElementById('regles-personnalisees');
    
    if (!rulesDisplay) {
        rulesDisplay = document.createElement('div');
        rulesDisplay.id = 'regles-personnalisees';
        rulesDisplay.className = 'game-rules-display';
        document.querySelector('.game-container').prepend(rulesDisplay);
    }
    
    const modeText = currentGameMode === 'computer' ? 'Contre l\'ordinateur' : 
                     currentGameMode === 'friends' ? 'À plusieurs' : 'Solo';
    
    rulesDisplay.innerHTML = `
        <div class="custom-rules">
            <h3>📋 Règles de votre jeu</h3>
            <p><strong>Mode :</strong> ${modeText}</p>
            <p><strong>Règles :</strong> ${rules.regles}</p>
            <p><strong>Victoire :</strong> ${rules.victoire}</p>
            <p><strong>Défaite :</strong> ${rules.defaite}</p>
            ${rules.manches ? `<p><strong>Manches :</strong> ${rules.manches}</p>` : ''}
            ${rules.punition ? `<p><strong>Pénalité du perdant :</strong> ${rules.punition}</p>` : ''}
        </div>
    `;
}

// Initialiser le jeu
function initializeGame(gameType) {
    const rules = gameRules[gameType];
    
    currentRound = 1;
    playerScore = 0;
    computerScore = 0;
    quizScore = 0;
    diceScore = 0;
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
            initializeMotsMelees();
            break;
        case 'snake':
            initializeSnake();
            break;
        case 'action':
            initializeActionVerite();
            break;
        case 'calcul':
            initializeCalcul();
            break;
        case 'pong':
            initializePong();
            break;
    }
}

// =============================
// JEU TIC TAC TOE (XO)
// =============================
function initializeXO() {
    const rules = gameRules.xo;
    const gridSize = rules.gridSize || 3;
    
    // Créer la grille
    createXOGrid(gridSize);
    
    gameBoard = Array(gridSize * gridSize).fill('');
    currentPlayer = 'X';
    gameActive = true;
    
    document.getElementById('joueur-actuel').textContent = currentPlayer;
    document.getElementById('manche-actuelle').textContent = currentRound;
    document.getElementById('manches-total').textContent = rules.manches;
    
    // Supprimer les anciens résultats
    const oldResult = document.querySelector('#jeu-xo .result');
    if (oldResult) oldResult.remove();
}

function createXOGrid(size) {
    const gameBoard = document.getElementById('xo-board');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        cell.textContent = '';
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
}

function handleCellClick() {
    if (!gameActive || currentGameType !== 'xo') return;
    
    const index = parseInt(this.getAttribute('data-index'));
    const rules = gameRules.xo;
    
    if (gameBoard[index] !== '') return;
    
    gameBoard[index] = currentPlayer;
    this.textContent = currentPlayer;
    this.style.color = currentPlayer === 'X' ? '#FF6B6B' : '#4ECDC4';
    
    if (checkXOWinner()) {
        endXOGame(`🎉 Le joueur ${currentPlayer} a gagné!`, rules);
        return;
    }
    
    if (checkXODraw()) {
        endXOGame('🤝 Match nul!', rules);
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('joueur-actuel').textContent = currentPlayer;
    
    // Tour de l'ordinateur si mode contre ordinateur
    if (currentGameMode === 'computer' && currentPlayer === 'O') {
        setTimeout(computerMoveXO, 500);
    }
}

function computerMoveXO() {
    if (!gameActive) return;
    
    const emptyCells = gameBoard.map((cell, index) => cell === '' ? index : -1)
                               .filter(index => index !== -1);
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const cell = document.querySelector(`#xo-board .cell[data-index="${randomIndex}"]`);
        cell.click();
    }
}

function checkXOWinner() {
    const size = Math.sqrt(gameBoard.length);
    const winLength = gameRules.xo.winLength || 3;
    
    // Vérifier les lignes
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const first = gameBoard[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoard[row * size + col + i])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    // Vérifier les colonnes
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winLength; row++) {
            const first = gameBoard[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoard[(row + i) * size + col])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    // Vérifier les diagonales
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const first = gameBoard[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoard[(row + i) * size + col + i])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    // Vérifier les anti-diagonales
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = winLength - 1; col < size; col++) {
            const first = gameBoard[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoard[(row + i) * size + col - i])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    return false;
}

function checkXODraw() {
    return gameBoard.every(cell => cell !== '');
}

function endXOGame(message, rules) {
    gameActive = false;
    
    const gameInfo = document.querySelector('#jeu-xo .game-info');
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    
    // Toujours afficher la punition à la fin du jeu
    let punishmentText = '';
    if (message.includes('gagné')) {
        punishmentText = `<p class="punition">💥 Le perdant doit: ${rules.punition}</p>`;
    } else {
        punishmentText = `<p class="punition">💥 Les deux joueurs doivent: ${rules.punition}</p>`;
    }
    
    resultDiv.innerHTML = `
        <h3>${message}</h3>
        ${punishmentText}
    `;
    
    gameInfo.appendChild(resultDiv);
    
    // Passer à la manche suivante ou terminer
    currentRound++;
    if (currentRound <= totalRounds) {
        setTimeout(() => {
            initializeXO();
        }, 3000);
    }
}

// =============================
// JEU PIERRE-PAPIER-CISEAUX
// =============================
function initializePFC() {
    const rules = gameRules.pfc;
    
    playerScore = 0;
    computerScore = 0;
    currentRound = 1;
    
    document.getElementById('score-joueur').textContent = playerScore;
    document.getElementById('score-adversaire').textContent = computerScore;
    document.getElementById('manche-actuelle-pfc').textContent = currentRound;
    document.getElementById('manches-total-pfc').textContent = rules.manches;
    document.getElementById('resultat-pfc').textContent = `🎯 ${rules.victoire}`;
    
    // Activer les choix
    document.querySelectorAll('.choice').forEach(c => {
        c.style.pointerEvents = 'auto';
        c.addEventListener('click', handlePFCClick);
    });
}

function handlePFCClick() {
    if (currentGameType !== 'pfc') return;
    
    const rules = gameRules.pfc;
    const playerChoice = this.getAttribute('data-choice');
    let adversaryChoice;
    
    if (currentGameMode === 'computer') {
        adversaryChoice = ['pierre', 'papier', 'ciseaux'][Math.floor(Math.random() * 3)];
    } else {
        adversaryChoice = ['pierre', 'papier', 'ciseaux'][Math.floor(Math.random() * 3)];
    }
    
    let result = '';
    
    if (playerChoice === adversaryChoice) {
        result = "Égalité!";
    } else if (
        (playerChoice === 'pierre' && adversaryChoice === 'ciseaux') ||
        (playerChoice === 'papier' && adversaryChoice === 'pierre') ||
        (playerChoice === 'ciseaux' && adversaryChoice === 'papier')
    ) {
        result = "Vous gagnez cette manche!";
        playerScore++;
    } else {
        result = `${currentGameMode === 'computer' ? "L'ordinateur" : "L'adversaire"} gagne cette manche!`;
        computerScore++;
    }
    
    document.getElementById('resultat-pfc').textContent = `Vous: ${playerChoice} | ${currentGameMode === 'computer' ? 'Ordinateur' : 'Adversaire'}: ${adversaryChoice} - ${result}`;
    document.getElementById('score-joueur').textContent = playerScore;
    document.getElementById('score-adversaire').textContent = computerScore;
    
    currentRound++;
    document.getElementById('manche-actuelle-pfc').textContent = currentRound;
    
    if (currentRound > rules.manches) {
        let finalResult = "Match nul!";
        let punishmentText = `<p class="punition">💥 Les deux joueurs doivent: ${rules.punition}</p>`;
        
        if (playerScore > computerScore) {
            finalResult = `🎉 Félicitations, vous avez gagné le match! ${rules.victoire}`;
            punishmentText = `<p class="punition">💥 Le perdant doit: ${rules.punition}</p>`;
        } else if (computerScore > playerScore) {
            finalResult = `💥 ${currentGameMode === 'computer' ? "L'ordinateur" : "L'adversaire"} a gagné! ${rules.defaite}`;
            punishmentText = `<p class="punition">💥 Vous devez: ${rules.punition}</p>`;
        }
        
        const gameInfo = document.querySelector('#jeu-pfc .game-info');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = `<h3>${finalResult}</h3>${punishmentText}`;
        gameInfo.appendChild(resultDiv);
        
        document.querySelectorAll('.choice').forEach(c => {
            c.style.pointerEvents = 'none';
        });
    }
}

// =============================
// JEU QUIZ
// =============================
function initializeQuiz() {
    const rules = gameRules.quiz;
    
    quizScore = 0;
    document.getElementById('score-quiz').textContent = quizScore;
    document.getElementById('questions-total').textContent = rules.manches;
    document.getElementById('resultat-quiz').textContent = `🎯 ${rules.victoire}`;
    
    // Générer des questions personnalisées si besoin
    if (quizQuestions.length < rules.manches) {
        generateCustomQuizQuestions(rules.manches);
    }
    
    // Activer les options
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'auto';
        opt.addEventListener('click', handleQuizClick);
    });
    
    showQuestion();
}

function generateCustomQuizQuestions(count) {
    quizQuestions = [];
    const questionTemplates = [
        "Quelle est la réponse à la question #NUM ?",
        "Lequel de ces éléments est correct pour la question #NUM ?",
        "Pour la question #NUM, quelle est la bonne réponse ?",
        "Sélectionnez la bonne réponse pour la question #NUM"
    ];
    
    for (let i = 0; i < count; i++) {
        quizQuestions.push({
            question: questionTemplates[Math.floor(Math.random() * questionTemplates.length)].replace('#NUM', i + 1),
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: Math.floor(Math.random() * 4) + 1
        });
    }
}

function showQuestion() {
    const currentIndex = quizScore;
    
    if (currentIndex >= quizQuestions.length) {
        endQuizGame();
        return;
    }
    
    const question = quizQuestions[currentIndex];
    document.getElementById('question-quiz').textContent = question.question;
    
    const options = document.querySelectorAll('.quiz-option .option-text');
    options.forEach((opt, index) => {
        opt.textContent = question.options[index];
    });
}

function handleQuizClick() {
    if (currentGameType !== 'quiz') return;
    
    const selectedOption = parseInt(this.getAttribute('data-option'));
    const correctOption = quizQuestions[quizScore].answer;
    
    if (selectedOption === correctOption) {
        quizScore++;
        document.getElementById('resultat-quiz').textContent = "✅ Bonne réponse!";
        document.getElementById('resultat-quiz').style.color = '#4CAF50';
    } else {
        document.getElementById('resultat-quiz').textContent = `❌ Mauvaise réponse! La bonne réponse était : ${quizQuestions[quizScore].options[correctOption - 1]}`;
        document.getElementById('resultat-quiz').style.color = '#FF6B6B';
    }
    
    document.getElementById('score-quiz').textContent = quizScore;
    
    setTimeout(showQuestion, 1500);
}

function endQuizGame() {
    const rules = gameRules.quiz;
    let finalMessage = `Quiz terminé! Votre score: ${quizScore}/${quizQuestions.length}`;
    let punishmentText = '';
    
    if (quizScore >= Math.ceil(quizQuestions.length / 2)) {
        finalMessage += ` 🎉 ${rules.victoire}`;
        punishmentText = `<p class="punition">💥 Vous avez évité la punition!</p>`;
    } else {
        finalMessage += ` 💥 ${rules.defaite}`;
        punishmentText = `<p class="punition">💥 Vous devez: ${rules.punition}</p>`;
    }
    
    const resultDiv = document.getElementById('resultat-quiz');
    resultDiv.innerHTML = `<h3>${finalMessage}</h3>${punishmentText}`;
    
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
}

// =============================
// JEU DE DÉ
// =============================
function initializeDice() {
    const rules = gameRules.dice;
    
    diceScore = 0;
    document.getElementById('score-dice').textContent = diceScore;
    document.getElementById('resultat-dice').textContent = `🎯 ${rules.victoire}`;
    
    // Activer le lancer de dé
    const rollButton = document.getElementById('btn-roll-dice');
    if (rollButton) {
        rollButton.disabled = false;
        rollButton.addEventListener('click', rollDice);
    }
}

function rollDice() {
    if (currentGameType !== 'dice') return;
    
    const dice = document.getElementById('de');
    dice.classList.add('rolling');
    
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        
        dice.textContent = diceFaces[roll - 1];
        dice.classList.remove('rolling');
        
        diceScore += roll;
        document.getElementById('score-dice').textContent = diceScore;
        document.getElementById('resultat-dice').textContent = `Vous avez obtenu un ${roll}!`;
        
        // Vérifier la victoire
        const rules = gameRules.dice;
        if (diceScore >= 15) {
            const resultDiv = document.getElementById('resultat-dice');
            resultDiv.innerHTML = `
                <h3>🎉 Félicitations! ${rules.victoire}</h3>
                <p class="punition">💥 Vous avez évité la punition!</p>
            `;
            document.getElementById('btn-roll-dice').disabled = true;
        }
    }, 1000);
}

// =============================
// JEU MOTS MÊLÉS (avec timer)
// =============================
function initializeMotsMelees() {
    const rules = gameRules.mots;
    
    // Préparer les mots
    const mots = rules.mots.split(',').map(mot => mot.trim().toUpperCase()).filter(mot => mot.length > 0);
    
    if (mots.length === 0) {
        alert("Veuillez entrer au moins un mot dans la liste des mots.");
        return;
    }
    
    motsMelees.words = mots;
    motsMelees.foundWords = [];
    motsMelees.selectedCells = [];
    motsMelees.timeLeft = rules.timer || 60;
    
    document.getElementById('mots-trouves').textContent = '0';
    document.getElementById('mots-total').textContent = mots.length;
    
    // Créer l'élément timer s'il n'existe pas
    let timerElement = document.getElementById('mots-timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'mots-timer';
        timerElement.className = 'timer';
        document.querySelector('#jeu-mots .game-info').appendChild(timerElement);
    }
    
    // Générer la grille
    generateWordSearchGrid();
    
    // Afficher la liste des mots
    displayWordList();
    
    // Démarrer le timer
    startMotsTimer();
}

function startMotsTimer() {
    clearInterval(motsMelees.gameTimer);
    
    motsMelees.gameTimer = setInterval(() => {
        motsMelees.timeLeft--;
        document.getElementById('mots-timer').textContent = `Temps restant: ${motsMelees.timeLeft}s`;
        
        if (motsMelees.timeLeft <= 0) {
            clearInterval(motsMelees.gameTimer);
            endMotsGame(false);
        }
    }, 1000);
}

function generateWordSearchGrid() {
    const gridSize = gameRules.mots.gridSize;
    const grid = document.getElementById('mots-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Créer une grille vide
    motsMelees.grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    
    // Placer les mots dans la grille
    placeWordsInGrid();
    
    // Remplir les cases vides avec des lettres aléatoires
    fillEmptyCells();
    
    // Afficher la grille
    displayGrid();
}

function placeWordsInGrid() {
    const gridSize = gameRules.mots.gridSize;
    
    for (let mot of motsMelees.words) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = Math.floor(Math.random() * 3);
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
            
            if (canPlaceWord(mot, row, col, direction)) {
                placeWord(mot, row, col, direction);
                placed = true;
            }
            attempts++;
        }
    }
}

function canPlaceWord(mot, row, col, direction) {
    const gridSize = gameRules.mots.gridSize;
    
    for (let i = 0; i < mot.length; i++) {
        let r = row, c = col;
        
        switch(direction) {
            case 0: c = col + i; break;
            case 1: r = row + i; break;
            case 2: r = row + i; c = col + i; break;
        }
        
        if (r >= gridSize || c >= gridSize) return false;
        if (motsMelees.grid[r][c] !== '' && motsMelees.grid[r][c] !== mot[i]) return false;
    }
    
    return true;
}

function placeWord(mot, row, col, direction) {
    for (let i = 0; i < mot.length; i++) {
        let r = row, c = col;
        
        switch(direction) {
            case 0: c = col + i; break;
            case 1: r = row + i; break;
            case 2: r = row + i; c = col + i; break;
        }
        
        motsMelees.grid[r][c] = mot[i];
    }
}

function fillEmptyCells() {
    const gridSize = gameRules.mots.gridSize;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (motsMelees.grid[i][j] === '') {
                motsMelees.grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
}

function displayGrid() {
    const grid = document.getElementById('mots-grid');
    const gridSize = gameRules.mots.gridSize;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'word-cell';
            cell.textContent = motsMelees.grid[i][j];
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);
            
            cell.addEventListener('click', () => selectWordCell(i, j));
            
            grid.appendChild(cell);
        }
    }
}

function displayWordList() {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    
    for (let mot of motsMelees.words) {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = mot;
        wordList.appendChild(wordItem);
    }
}

function selectWordCell(row, col) {
    if (currentGameType !== 'mots') return;
    
    const cell = document.querySelector(`.word-cell[data-row="${row}"][data-col="${col}"]`);
    
    checkWordAtPosition(row, col);
    
    cell.classList.add('selected');
    
    // Vérifier si tous les mots sont trouvés
    if (motsMelees.foundWords.length === motsMelees.words.length) {
        endMotsGame(true);
    }
}

function checkWordAtPosition(row, col) {
    const gridSize = gameRules.mots.gridSize;
    
    for (let mot of motsMelees.words) {
        if (motsMelees.foundWords.includes(mot)) continue;
        
        for (let direction = 0; direction < 3; direction++) {
            if (isWordAtPosition(mot, row, col, direction)) {
                motsMelees.foundWords.push(mot);
                updateFoundWords();
                return;
            }
        }
    }
}

function isWordAtPosition(mot, row, col, direction) {
    const gridSize = gameRules.mots.gridSize;
    
    for (let i = 0; i < mot.length; i++) {
        let r = row, c = col;
        
        switch(direction) {
            case 0: c = col + i; break;
            case 1: r = row + i; break;
            case 2: r = row + i; c = col + i; break;
        }
        
        if (r >= gridSize || c >= gridSize) return false;
        if (motsMelees.grid[r][c] !== mot[i]) return false;
    }
    
    return true;
}

function updateFoundWords() {
    document.getElementById('mots-trouves').textContent = motsMelees.foundWords.length;
    
    const wordItems = document.querySelectorAll('.word-item');
    wordItems.forEach(item => {
        if (motsMelees.foundWords.includes(item.textContent)) {
            item.classList.add('found');
            item.style.textDecoration = 'line-through';
            item.style.color = '#4CAF50';
        }
    });
}

function endMotsGame(hasWon) {
    clearInterval(motsMelees.gameTimer);
    const rules = gameRules.mots;
    
    let message = '';
    let punishmentText = '';
    
    if (hasWon) {
        message = `🎉 Félicitations! Vous avez trouvé tous les mots en ${rules.timer - motsMelees.timeLeft} secondes! ${rules.victoire}`;
        punishmentText = `<p class="punition">💥 Vous avez évité la punition!</p>`;
    } else {
        message = `💥 Temps écoulé! Vous avez trouvé ${motsMelees.foundWords.length}/${motsMelees.words.length} mots. ${rules.defaite}`;
        const motsNonTrouves = motsMelees.words.filter(mot => !motsMelees.foundWords.includes(mot));
        punishmentText = `<p class="punition">💥 Vous devez: ${rules.punition.replace('chaque mot non trouvé', `écrire 10 fois "${motsNonTrouves.join(', ')}"`)}</p>`;
    }
    
    const resultDiv = document.getElementById('resultat-mots');
    resultDiv.innerHTML = `<h3>${message}</h3>${punishmentText}`;
    
    // Désactiver les cellules
    document.querySelectorAll('.word-cell').forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
}

// =============================
// JEU SNAKE (CORRIGÉ COMPLÈTEMENT)
// =============================
function initializeSnake() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    
    // Arrêter le jeu précédent s'il existe
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
        clearInterval(snakeGame.timerInterval);
        document.removeEventListener('keydown', handleSnakeKeyPress);
    }
    
    // Réinitialiser complètement le jeu
    snakeGame.canvas = canvas;
    snakeGame.ctx = ctx;
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = 'right';
    snakeGame.food = {x: 15, y: 15};
    snakeGame.score = 0;
    snakeGame.gameLoop = null;
    snakeGame.gameStarted = false;
    snakeGame.gameOver = false;
    snakeGame.timer = 0;
    snakeGame.timerInterval = null;
    
    // Réinitialiser l'affichage
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-length').textContent = '1';
    document.getElementById('resultat-snake').innerHTML = '';
    
    // Créer ou mettre à jour l'élément timer
    let timerElement = document.getElementById('snake-timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'snake-timer';
        timerElement.className = 'timer-display';
        document.querySelector('#jeu-snake .game-info').prepend(timerElement);
    }
    timerElement.textContent = 'Temps: 00:00';
    
    // Créer l'écran de démarrage
    createSnakeStartScreen();
    
    // Dessiner l'état initial
    drawSnake();
    
    // Désactiver les contrôles au début
    disableSnakeControls();
}

function createSnakeStartScreen() {
    // Supprimer l'écran existant
    const existingScreen = document.getElementById('snake-start-screen');
    if (existingScreen) {
        existingScreen.remove();
    }
    
    // Créer un nouvel écran de démarrage
    const startScreen = document.createElement('div');
    startScreen.id = 'snake-start-screen';
    startScreen.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        z-index: 100;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const rules = gameRules.snake;
    startScreen.innerHTML = `
        <h2 style="color: #4ecdc4; margin-bottom: 20px;">🐍 Jeu du Serpent</h2>
        <p style="margin-bottom: 15px;"><strong>Objectif :</strong> Atteindre ${rules.scoreGoal || 50} points</p>
        <p style="margin-bottom: 15px;"><strong>Contrôles :</strong> Flèches directionnelles ou boutons</p>
        <p style="margin-bottom: 20px;"><strong>Pénalité :</strong> ${rules.punition || "Faire 20 sauts"}</p>
        <p style="margin-bottom: 25px; color: #ff9f43;"><strong>⏱️ Temps limite : 2 minutes</strong></p>
        <button id="start-snake-game-btn" style="
            background: linear-gradient(135deg, #4ecdc4 0%, #2ecc71 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.2em;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        ">
            🎮 Commencer le jeu
        </button>
    `;
    
    document.querySelector('.snake-container').appendChild(startScreen);
    
    // Ajouter l'événement au bouton de démarrage
    document.getElementById('start-snake-game-btn').addEventListener('click', startSnakeGame);
}

function startSnakeGame() {
    // Masquer l'écran de démarrage
    const startScreen = document.getElementById('snake-start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
    
    // Supprimer l'écran de fin s'il existe
    const gameOverScreen = document.getElementById('snake-game-over');
    if (gameOverScreen) {
        gameOverScreen.remove();
    }
    
    // Réinitialiser le jeu
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = 'right';
    snakeGame.food = {x: 15, y: 15};
    snakeGame.score = 0;
    snakeGame.gameStarted = true;
    snakeGame.gameOver = false;
    snakeGame.timer = 0;
    
    // Mettre à jour l'affichage
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-length').textContent = '1';
    document.getElementById('resultat-snake').innerHTML = '';
    
    // Activer les contrôles
    enableSnakeControls();
    
    // Ajouter les écouteurs d'événements
    setupSnakeControls();
    
    // Démarrer le timer
    startSnakeTimer();
    
    // Démarrer la boucle de jeu
    const speed = 1000 / (gameRules.snake.vitesse * 10);
    if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
    snakeGame.gameLoop = setInterval(updateSnake, speed);
}

function setupSnakeControls() {
    // Configurer les boutons tactiles
    const upBtn = document.getElementById('up');
    const downBtn = document.getElementById('down');
    const leftBtn = document.getElementById('left');
    const rightBtn = document.getElementById('right');
    
    if (upBtn) {
        upBtn.onclick = null;
        upBtn.addEventListener('click', () => changeSnakeDirection('up'));
    }
    if (downBtn) {
        downBtn.onclick = null;
        downBtn.addEventListener('click', () => changeSnakeDirection('down'));
    }
    if (leftBtn) {
        leftBtn.onclick = null;
        leftBtn.addEventListener('click', () => changeSnakeDirection('left'));
    }
    if (rightBtn) {
        rightBtn.onclick = null;
        rightBtn.addEventListener('click', () => changeSnakeDirection('right'));
    }
    
    // Ajouter l'écouteur clavier
    document.removeEventListener('keydown', handleSnakeKeyPress);
    document.addEventListener('keydown', handleSnakeKeyPress);
}

function enableSnakeControls() {
    const controls = ['up', 'down', 'left', 'right'];
    controls.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    });
}

function disableSnakeControls() {
    const controls = ['up', 'down', 'left', 'right'];
    controls.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        }
    });
}

function handleSnakeKeyPress(e) {
    if (!snakeGame.gameStarted || snakeGame.gameOver || currentGameType !== 'snake') return;
    
    switch(e.key) {
        case 'ArrowUp': changeSnakeDirection('up'); break;
        case 'ArrowDown': changeSnakeDirection('down'); break;
        case 'ArrowLeft': changeSnakeDirection('left'); break;
        case 'ArrowRight': changeSnakeDirection('right'); break;
    }
}

function changeSnakeDirection(newDirection) {
    if (!snakeGame.gameStarted || snakeGame.gameOver) return;
    
    const opposites = {up: 'down', down: 'up', left: 'right', right: 'left'};
    if (newDirection !== opposites[snakeGame.direction]) {
        snakeGame.direction = newDirection;
    }
}

function startSnakeTimer() {
    if (snakeGame.timerInterval) clearInterval(snakeGame.timerInterval);
    
    snakeGame.timerInterval = setInterval(() => {
        if (!snakeGame.gameStarted || snakeGame.gameOver) return;
        
        snakeGame.timer++;
        updateSnakeTimerDisplay();
        
        // Vérifier si le temps est écoulé (2 minutes = 120 secondes)
        if (snakeGame.timer >= 120) {
            endSnakeGame("⏰ Temps écoulé !");
        }
    }, 1000);
}

function updateSnakeTimerDisplay() {
    const timerElement = document.getElementById('snake-timer');
    if (!timerElement) return;
    
    const minutes = Math.floor(snakeGame.timer / 60);
    const seconds = snakeGame.timer % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.textContent = `⏱️ ${timeString}`;
    
    // Changer la couleur selon le temps restant
    const timeLeft = 120 - snakeGame.timer;
    if (timeLeft <= 30) {
        timerElement.style.color = '#ff9f43';
        if (timeLeft <= 10) {
            timerElement.style.color = '#ff6b6b';
            timerElement.style.animation = 'blink 1s infinite';
        }
    }
}

function generateSnakeFood() {
    const x = Math.floor(Math.random() * (snakeGame.canvas.width / snakeGame.gridSize));
    const y = Math.floor(Math.random() * (snakeGame.canvas.height / snakeGame.gridSize));
    
    // Vérifier que la nourriture n'apparaît pas sur le serpent
    for (let segment of snakeGame.snake) {
        if (segment.x === x && segment.y === y) {
            return generateSnakeFood(); // Réessayer
        }
    }
    
    snakeGame.food = {x, y};
}

function updateSnake() {
    if (!snakeGame.gameStarted || snakeGame.gameOver) return;
    
    const head = {...snakeGame.snake[0]};
    
    switch(snakeGame.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Vérifier les collisions avec les murs
    if (head.x < 0 || head.x >= snakeGame.canvas.width / snakeGame.gridSize ||
        head.y < 0 || head.y >= snakeGame.canvas.height / snakeGame.gridSize) {
        endSnakeGame("💥 Le serpent a touché un mur !");
        return;
    }
    
    // Vérifier les collisions avec soi-même
    for (let i = 1; i < snakeGame.snake.length; i++) {
        if (head.x === snakeGame.snake[i].x && head.y === snakeGame.snake[i].y) {
            endSnakeGame("💥 Le serpent s'est mordu la queue !");
            return;
        }
    }
    
    snakeGame.snake.unshift(head);
    
    // Vérifier si la nourriture est mangée
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        document.getElementById('snake-score').textContent = snakeGame.score;
        document.getElementById('snake-length').textContent = snakeGame.snake.length;
        generateSnakeFood();
        
        // Vérifier la victoire
        if (snakeGame.score >= (gameRules.snake.scoreGoal || 50)) {
            const minutes = Math.floor(snakeGame.timer / 60);
            const seconds = snakeGame.timer % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            endSnakeGame(`🎉 Victoire ! ${gameRules.snake.victoire || "Vous avez atteint l'objectif !"}`, true);
            return;
        }
    } else {
        snakeGame.snake.pop();
    }
    
    drawSnake();
}

function drawSnake() {
    if (!snakeGame.ctx) return;
    
    const ctx = snakeGame.ctx;
    // Effacer le canvas
    ctx.clearRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Dessiner le fond
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Dessiner la grille
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < snakeGame.canvas.width; x += snakeGame.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, snakeGame.canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < snakeGame.canvas.height; y += snakeGame.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(snakeGame.canvas.width, y);
        ctx.stroke();
    }
    
    // Dessiner le serpent
    snakeGame.snake.forEach((segment, index) => {
        if (index === 0) {
            // Tête du serpent
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(
                segment.x * snakeGame.gridSize,
                segment.y * snakeGame.gridSize,
                snakeGame.gridSize - 2,
                snakeGame.gridSize - 2
            );
        } else {
            // Corps du serpent
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(
                segment.x * snakeGame.gridSize,
                segment.y * snakeGame.gridSize,
                snakeGame.gridSize - 2,
                snakeGame.gridSize - 2
            );
        }
    });
    
    // Dessiner la nourriture
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        snakeGame.food.x * snakeGame.gridSize + snakeGame.gridSize / 2,
        snakeGame.food.y * snakeGame.gridSize + snakeGame.gridSize / 2,
        snakeGame.gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function endSnakeGame(message, isVictory = false) {
    if (snakeGame.gameOver) return;
    
    snakeGame.gameOver = true;
    snakeGame.gameStarted = false;
    
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
        snakeGame.gameLoop = null;
    }
    
    if (snakeGame.timerInterval) {
        clearInterval(snakeGame.timerInterval);
        snakeGame.timerInterval = null;
    }
    
    // Désactiver les contrôles
    disableSnakeControls();
    
    // Retirer l'écouteur clavier
    document.removeEventListener('keydown', handleSnakeKeyPress);
    
    const rules = gameRules.snake;
    const minutes = Math.floor(snakeGame.timer / 60);
    const seconds = snakeGame.timer % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Afficher l'écran de fin de jeu
    createSnakeGameOverScreen(message, isVictory, timeString);
}

function createSnakeGameOverScreen(message, isVictory, timeString) {
    // Créer l'écran de fin de jeu
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'snake-game-over';
    gameOverScreen.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        z-index: 200;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const rules = gameRules.snake;
    let punishmentText = '';
    
    if (!isVictory && rules.punition) {
        punishmentText = `<div style="
            background: rgba(255, 107, 107, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff6b6b;
        ">
            💥 Vous devez: ${rules.punition}
        </div>`;
    } else if (isVictory) {
        punishmentText = `<div style="
            background: rgba(78, 205, 196, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4ecdc4;
        ">
            🎉 Vous avez évité la punition !
        </div>`;
    }
    
    gameOverScreen.innerHTML = `
        <h2 style="color: ${isVictory ? '#4ecdc4' : '#ff6b6b'}; margin-bottom: 20px;">
            ${isVictory ? '🎉 VICTOIRE !' : '💥 GAME OVER'}
        </h2>
        <p style="margin-bottom: 15px; font-size: 1.1em;">${message}</p>
        <p style="margin-bottom: 10px;"><strong>Score final :</strong> ${snakeGame.score} points</p>
        <p style="margin-bottom: 10px;"><strong>Longueur :</strong> ${snakeGame.snake.length}</p>
        <p style="margin-bottom: 20px;"><strong>Temps :</strong> ${timeString}</p>
        ${punishmentText}
        <button id="restart-snake-game-btn" style="
            background: linear-gradient(135deg, #4ecdc4 0%, #2ecc71 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 1.1em;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 15px;
        ">
            🔄 Rejouer
        </button>
    `;
    
    document.querySelector('.snake-container').appendChild(gameOverScreen);
    
    // Ajouter l'événement au bouton de redémarrage
    document.getElementById('restart-snake-game-btn').addEventListener('click', () => {
        gameOverScreen.remove();
        initializeSnake();
    });
}

// =============================
// JEU ACTION OU VÉRITÉ
// =============================
function initializeActionVerite() {
    const rules = gameRules.action;
    
    actionVerite.actions = rules.actions.split(',').map(a => a.trim()).filter(a => a.length > 0);
    actionVerite.verites = rules.verites.split(',').map(v => v.trim()).filter(v => v.length > 0);
    
    if (actionVerite.actions.length === 0) {
        actionVerite.actions = [
            "Fais 10 pompes",
            "Chante une chanson",
            "Danse pendant 30 secondes",
            "Fais une imitation",
            "Raconte une blague",
            "Fais 20 sauts sur place",
            "Fais le tour de la pièce en marchant comme un crabe",
            "Mime ton animal préféré",
            "Fais 10 flexions",
            "Récite l'alphabet à l'envers"
        ];
    }
    
    if (actionVerite.verites.length === 0) {
        actionVerite.verites = [
            "Quel est ton plus grand secret?",
            "Quelle est ta plus grande peur?",
            "Quel est ton plus grand regret?",
            "Qui est ta célébrité préférée?",
            "Quel est ton rêve le plus fou?",
            "Quelle est la chose la plus embarrassante qui te soit arrivée?",
            "Quel est ton plus mauvais défaut?",
            "Quel est ton plus beau souvenir?",
            "Quelle est ta plus grande fierté?",
            "Quel est ton endroit préféré au monde?"
        ];
    }
    
    actionVerite.currentTour = 1;
    actionVerite.currentPlayerIndex = 0;
    
    document.getElementById('current-player').textContent = actionVerite.players[0];
    document.getElementById('tour-action').textContent = actionVerite.currentTour;
    document.getElementById('tours-total').textContent = rules.manches;
    document.getElementById('resultat-action').textContent = '';
    document.getElementById('card-content').textContent = 'Cliquez sur un bouton pour commencer!';
    
    // Réactiver les boutons
    document.getElementById('btn-action').disabled = false;
    document.getElementById('btn-verite').disabled = false;
    document.getElementById('btn-next-player').disabled = false;
    
    document.getElementById('btn-action').addEventListener('click', showRandomAction);
    document.getElementById('btn-verite').addEventListener('click', showRandomVerite);
    document.getElementById('btn-next-player').addEventListener('click', nextPlayer);
}

function showRandomAction() {
    const randomIndex = Math.floor(Math.random() * actionVerite.actions.length);
    const randomAction = actionVerite.actions[randomIndex];
    document.getElementById('card-content').innerHTML = `<h3>🎭 ACTION</h3><p>${randomAction}</p>`;
}

function showRandomVerite() {
    const randomIndex = Math.floor(Math.random() * actionVerite.verites.length);
    const randomVerite = actionVerite.verites[randomIndex];
    document.getElementById('card-content').innerHTML = `<h3>📖 VÉRITÉ</h3><p>${randomVerite}</p>`;
}

function nextPlayer() {
    actionVerite.currentPlayerIndex = (actionVerite.currentPlayerIndex + 1) % actionVerite.players.length;
    document.getElementById('current-player').textContent = actionVerite.players[actionVerite.currentPlayerIndex];
    
    if (actionVerite.currentPlayerIndex === 0) {
        actionVerite.currentTour++;
        document.getElementById('tour-action').textContent = actionVerite.currentTour;
        
        if (actionVerite.currentTour > gameRules.action.manches) {
            const rules = gameRules.action;
            document.getElementById('resultat-action').innerHTML = `
                <h3>🎉 ${rules.victoire}</h3>
                <p class="punition">💥 Tous les joueurs ont évité la punition!</p>
            `;
            document.getElementById('btn-action').disabled = true;
            document.getElementById('btn-verite').disabled = true;
            document.getElementById('btn-next-player').disabled = true;
        }
    }
    
    document.getElementById('card-content').innerHTML = '<p>Choisissez Action ou Vérité</p>';
}

// =============================
// JEU CALCUL MENTAL
// =============================
function initializeCalcul() {
    const rules = gameRules.calcul;
    
    calculMental.score = 0;
    calculMental.count = 0;
    calculMental.timeLeft = rules.timePerQuestion || 10;
    
    document.getElementById('calcul-score').textContent = calculMental.score;
    document.getElementById('calcul-count').textContent = calculMental.count;
    document.getElementById('calcul-total').textContent = rules.manches;
    document.getElementById('resultat-calcul').textContent = '';
    document.getElementById('timer-progress').style.width = '100%';
    document.getElementById('calcul-timer').textContent = calculMental.timeLeft;
    document.getElementById('calcul-reponse').disabled = false;
    document.getElementById('btn-valider-calcul').disabled = false;
    
    generateCalculQuestion();
    startCalculTimer();
    
    document.getElementById('btn-valider-calcul').addEventListener('click', validateCalculAnswer);
    document.getElementById('calcul-reponse').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateCalculAnswer();
        }
    });
}

function generateCalculQuestion() {
    const rules = gameRules.calcul;
    let a, b, operation, result;
    
    switch(rules.niveau) {
        case 'facile':
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            operation = Math.random() > 0.5 ? '+' : '-';
            result = operation === '+' ? a + b : a - b;
            break;
        case 'moyen':
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            operation = '×';
            result = a * b;
            break;
        case 'difficile':
            b = Math.floor(Math.random() * 9) + 2;
            result = Math.floor(Math.random() * 10) + 1;
            a = b * result;
            operation = '÷';
            break;
        default:
            const operations = ['+', '-', '×', '÷'];
            operation = operations[Math.floor(Math.random() * operations.length)];
            
            if (operation === '+' || operation === '-') {
                a = Math.floor(Math.random() * 20) + 1;
                b = Math.floor(Math.random() * 20) + 1;
                result = operation === '+' ? a + b : a - b;
            } else if (operation === '×') {
                a = Math.floor(Math.random() * 10) + 1;
                b = Math.floor(Math.random() * 10) + 1;
                result = a * b;
            } else {
                b = Math.floor(Math.random() * 9) + 2;
                result = Math.floor(Math.random() * 10) + 1;
                a = b * result;
            }
            break;
    }
    
    calculMental.currentQuestion = { a, b, operation, result };
    document.getElementById('calcul-question').textContent = `${a} ${operation} ${b} = ?`;
    document.getElementById('calcul-reponse').value = '';
    document.getElementById('calcul-reponse').focus();
}

function startCalculTimer() {
    clearInterval(calculMental.timer);
    calculMental.timeLeft = gameRules.calcul.timePerQuestion || 10;
    document.getElementById('timer-progress').style.width = '100%';
    document.getElementById('calcul-timer').textContent = calculMental.timeLeft;
    
    calculMental.timer = setInterval(() => {
        calculMental.timeLeft--;
        const progress = (calculMental.timeLeft / (gameRules.calcul.timePerQuestion || 10)) * 100;
        document.getElementById('timer-progress').style.width = progress + '%';
        document.getElementById('calcul-timer').textContent = calculMental.timeLeft;
        
        if (calculMental.timeLeft <= 0) {
            clearInterval(calculMental.timer);
            calculMental.count++;
            document.getElementById('calcul-count').textContent = calculMental.count;
            
            if (calculMental.count >= gameRules.calcul.manches) {
                endCalculGame();
            } else {
                generateCalculQuestion();
                startCalculTimer();
            }
        }
    }, 1000);
}

function validateCalculAnswer() {
    if (currentGameType !== 'calcul') return;
    
    const userAnswer = parseInt(document.getElementById('calcul-reponse').value);
    const correctAnswer = calculMental.currentQuestion.result;
    
    if (isNaN(userAnswer)) {
        document.getElementById('resultat-calcul').textContent = "Veuillez entrer un nombre!";
        document.getElementById('resultat-calcul').style.color = '#FF6B6B';
        return;
    }
    
    clearInterval(calculMental.timer);
    
    if (userAnswer === correctAnswer) {
        calculMental.score++;
        document.getElementById('resultat-calcul').textContent = "✅ Bonne réponse!";
        document.getElementById('resultat-calcul').style.color = '#4CAF50';
    } else {
        document.getElementById('resultat-calcul').textContent = `❌ Mauvaise réponse! La réponse était ${correctAnswer}`;
        document.getElementById('resultat-calcul').style.color = '#FF6B6B';
    }
    
    document.getElementById('calcul-score').textContent = calculMental.score;
    
    calculMental.count++;
    document.getElementById('calcul-count').textContent = calculMental.count;
    
    if (calculMental.count >= gameRules.calcul.manches) {
        setTimeout(endCalculGame, 1500);
    } else {
        setTimeout(() => {
            generateCalculQuestion();
            startCalculTimer();
        }, 1500);
    }
}

function endCalculGame() {
    const rules = gameRules.calcul;
    let message = `Jeu terminé! Score: ${calculMental.score}/${rules.manches}`;
    let punishmentText = '';
    
    if (calculMental.score >= Math.ceil(rules.manches * 0.8)) {
        message += ` 🎉 ${rules.victoire}`;
        punishmentText = `<p class="punition">💥 Vous avez évité la punition!</p>`;
    } else {
        message += ` 💥 ${rules.defaite}`;
        punishmentText = `<p class="punition">💥 Vous devez: ${rules.punition}</p>`;
    }
    
    document.getElementById('resultat-calcul').innerHTML = `<h3>${message}</h3>${punishmentText}`;
    document.getElementById('calcul-reponse').disabled = true;
    document.getElementById('btn-valider-calcul').disabled = true;
}

// =============================
// JEU PONG (CORRIGÉ)
// =============================
function initializePong() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    
    // Arrêter le jeu précédent s'il existe
    if (pongGame.gameLoop) {
        clearInterval(pongGame.gameLoop);
        document.removeEventListener('keydown', handlePongKeyDown);
        document.removeEventListener('keyup', handlePongKeyUp);
    }
    
    // Réinitialiser le jeu
    pongGame.canvas = canvas;
    pongGame.ctx = ctx;
    pongGame.ball = { 
        x: canvas.width / 2, 
        y: canvas.height / 2, 
        dx: (Math.random() > 0.5 ? 1 : -1) * gameRules.pong.vitesse, 
        dy: (Math.random() - 0.5) * gameRules.pong.vitesse, 
        radius: 10 
    };
    pongGame.playerPaddle = { x: 50, y: canvas.height / 2 - 25, width: 10, height: 50 };
    pongGame.computerPaddle = { x: canvas.width - 60, y: canvas.height / 2 - 25, width: 10, height: 50 };
    pongGame.playerScore = 0;
    pongGame.computerScore = 0;
    pongGame.keys = {};
    currentRound = 1;
    pongGame.isInitialized = true;
    
    document.getElementById('pong-score-joueur').textContent = pongGame.playerScore;
    document.getElementById('pong-score-adversaire').textContent = pongGame.computerScore;
    document.getElementById('pong-manche').textContent = currentRound;
    document.getElementById('pong-manches').textContent = gameRules.pong.manches;
    document.getElementById('resultat-pong').textContent = '';
    
    // Ajouter les écouteurs de clavier
    document.addEventListener('keydown', handlePongKeyDown);
    document.addEventListener('keyup', handlePongKeyUp);
    
    // Démarrer le jeu
    pongGame.gameLoop = setInterval(updatePong, 1000 / 60);
    
    drawPong();
}

function handlePongKeyDown(e) {
    if (currentGameType !== 'pong') return;
    pongGame.keys[e.key] = true;
}

function handlePongKeyUp(e) {
    if (currentGameType !== 'pong') return;
    pongGame.keys[e.key] = false;
}

function updatePong() {
    // Gestion des touches pour le joueur
    const paddleSpeed = 8;
    if (pongGame.keys['ArrowUp']) {
        pongGame.playerPaddle.y = Math.max(0, pongGame.playerPaddle.y - paddleSpeed);
    }
    if (pongGame.keys['ArrowDown']) {
        pongGame.playerPaddle.y = Math.min(
            pongGame.canvas.height - pongGame.playerPaddle.height,
            pongGame.playerPaddle.y + paddleSpeed
        );
    }
    
    // Déplacer la balle
    pongGame.ball.x += pongGame.ball.dx;
    pongGame.ball.y += pongGame.ball.dy;
    
    // Rebond sur les murs haut/bas
    if (pongGame.ball.y - pongGame.ball.radius < 0 || pongGame.ball.y + pongGame.ball.radius > pongGame.canvas.height) {
        pongGame.ball.dy = -pongGame.ball.dy;
    }
    
    // IA de l'ordinateur
    const computerPaddleCenter = pongGame.computerPaddle.y + pongGame.computerPaddle.height / 2;
    if (computerPaddleCenter < pongGame.ball.y - 10) {
        pongGame.computerPaddle.y = Math.min(
            pongGame.canvas.height - pongGame.computerPaddle.height,
            pongGame.computerPaddle.y + 6
        );
    } else if (computerPaddleCenter > pongGame.ball.y + 10) {
        pongGame.computerPaddle.y = Math.max(0, pongGame.computerPaddle.y - 6);
    }
    
    // Collision avec les raquettes
    // Joueur
    if (pongGame.ball.x - pongGame.ball.radius < pongGame.playerPaddle.x + pongGame.playerPaddle.width &&
        pongGame.ball.x + pongGame.ball.radius > pongGame.playerPaddle.x &&
        pongGame.ball.y > pongGame.playerPaddle.y &&
        pongGame.ball.y < pongGame.playerPaddle.y + pongGame.playerPaddle.height) {
        
        // Calculer l'angle de rebond
        const hitPosition = (pongGame.ball.y - (pongGame.playerPaddle.y + pongGame.playerPaddle.height / 2)) / (pongGame.playerPaddle.height / 2);
        pongGame.ball.dx = Math.abs(pongGame.ball.dx);
        pongGame.ball.dy = hitPosition * 7;
    }
    
    // Ordinateur
    if (pongGame.ball.x + pongGame.ball.radius > pongGame.computerPaddle.x &&
        pongGame.ball.x - pongGame.ball.radius < pongGame.computerPaddle.x + pongGame.computerPaddle.width &&
        pongGame.ball.y > pongGame.computerPaddle.y &&
        pongGame.ball.y < pongGame.computerPaddle.y + pongGame.computerPaddle.height) {
        
        const hitPosition = (pongGame.ball.y - (pongGame.computerPaddle.y + pongGame.computerPaddle.height / 2)) / (pongGame.computerPaddle.height / 2);
        pongGame.ball.dx = -Math.abs(pongGame.ball.dx);
        pongGame.ball.dy = hitPosition * 7;
    }
    
    // Marquer un point
    if (pongGame.ball.x - pongGame.ball.radius < 0) {
        pongGame.computerScore++;
        document.getElementById('pong-score-adversaire').textContent = pongGame.computerScore;
        resetPongBall();
    } else if (pongGame.ball.x + pongGame.ball.radius > pongGame.canvas.width) {
        pongGame.playerScore++;
        document.getElementById('pong-score-joueur').textContent = pongGame.playerScore;
        resetPongBall();
    }
    
    // Vérifier la fin de manche
    const pointsToWin = gameRules.pong.pointsToWin || 5;
    if (pongGame.playerScore >= pointsToWin || pongGame.computerScore >= pointsToWin) {
        endPongRound();
    }
    
    drawPong();
}

function resetPongBall() {
    pongGame.ball.x = pongGame.canvas.width / 2;
    pongGame.ball.y = pongGame.canvas.height / 2;
    pongGame.ball.dx = (Math.random() > 0.5 ? 1 : -1) * gameRules.pong.vitesse;
    pongGame.ball.dy = (Math.random() - 0.5) * gameRules.pong.vitesse;
}

function drawPong() {
    const ctx = pongGame.ctx;
    // Effacer le canvas
    ctx.clearRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
    
    // Dessiner le fond
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
    ctx.arc(pongGame.ball.x, pongGame.ball.y, pongGame.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Dessiner les raquettes
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(pongGame.playerPaddle.x, pongGame.playerPaddle.y, 
                 pongGame.playerPaddle.width, pongGame.playerPaddle.height);
    
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(pongGame.computerPaddle.x, pongGame.computerPaddle.y, 
                 pongGame.computerPaddle.width, pongGame.computerPaddle.height);
}

function endPongRound() {
    clearInterval(pongGame.gameLoop);
    pongGame.gameLoop = null;
    
    currentRound++;
    document.getElementById('pong-manche').textContent = currentRound;
    
    if (currentRound > gameRules.pong.manches) {
        // Fin du match
        document.removeEventListener('keydown', handlePongKeyDown);
        document.removeEventListener('keyup', handlePongKeyUp);
        
        let message = "Match terminé! ";
        const rules = gameRules.pong;
        
        if (pongGame.playerScore > pongGame.computerScore) {
            message += `🎉 ${rules.victoire}`;
            document.getElementById('resultat-pong').innerHTML = `
                <h3>${message}</h3>
                <p class="punition">💥 L'ordinateur doit: ${rules.punition}</p>
            `;
        } else {
            message += `💥 ${rules.defaite}`;
            document.getElementById('resultat-pong').innerHTML = `
                <h3>${message}</h3>
                <p class="punition">💥 Vous devez: ${rules.punition}</p>
            `;
        }
    } else {
        // Nouvelle manche
        pongGame.playerScore = 0;
        pongGame.computerScore = 0;
        document.getElementById('pong-score-joueur').textContent = pongGame.playerScore;
        document.getElementById('pong-score-adversaire').textContent = pongGame.computerScore;
        resetPongBall();
        
        // Redémarrer le jeu après un délai
        setTimeout(() => {
            pongGame.gameLoop = setInterval(updatePong, 1000 / 60);
        }, 1000);
    }
}

// =============================
// SAUVEGARDE DES STATISTIQUES
// =============================
function saveGameStats() {
    const stats = JSON.parse(localStorage.getItem('gameforge_stats')) || {
        gamesCreated: 0,
        playersActive: 0,
        gamesPlayed: 0
    };
    
    stats.gamesCreated++;
    stats.gamesPlayed++;
    
    localStorage.setItem('gameforge_stats', JSON.stringify(stats));
    updateStats();
}
