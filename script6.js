// =============================
// VARIABLES GLOBALES
// =============================
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
    snake: { regles: "", victoire: "", defaite: "", manches: 1, punition: "", vitesse: 120, scoreGoal: 50 },
    action: { regles: "", victoire: "", defaite: "", manches: 10, punition: "", actions: "", verites: "", timePerQuestion: 10 },
    calcul: { regles: "", victoire: "", defaite: "", manches: 10, punition: "", niveau: "facile", timePerQuestion: 10 },
    pong: { regles: "", victoire: "", defaite: "", manches: 3, punition: "", vitesse: 5, pointsToWin: 5 }
};

// Données pour les jeux
let gameBoard = [];
let currentPlayer = 'X';

// Variables spécifiques au Snake (corrigé)
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
    timerLimit: 120,
    speed: 120 // Vitesse en millisecondes
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
        answer: 2
    },
    {
        question: "Combien de côtés a un hexagone?",
        options: ["4", "5", "6", "7"],
        answer: 2
    },
    {
        question: "Quel est le plus grand mammifère du monde?",
        options: ["Éléphant", "Girafe", "Baleine bleue", "Rhinocéros"],
        answer: 2
    },
    {
        question: "Qui a peint la Joconde?",
        options: ["Van Gogh", "Picasso", "Léonard de Vinci", "Michel-Ange"],
        answer: 2
    },
    {
        question: "Quel est le symbole chimique de l'or?",
        options: ["Ag", "Fe", "Au", "Cu"],
        answer: 2
    }
];

// =============================
// FONCTIONS GÉNÉRALES
// =============================

// Fonction pour créer des particules
function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initializeApp();
    updateStats();
    checkUserLogin();
});

// Vérifier si l'utilisateur est connecté
function checkUserLogin() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        updateUserInterface(user.username);
    }
}

// Mettre à jour l'interface après connexion
function updateUserInterface(username) {
    const btnSignin = document.getElementById('btn-signin');
    if (!btnSignin) return;
    
    btnSignin.innerHTML = `
        <span>👤 ${username}</span>
        <div class="user-menu">
            <a href="#" onclick="showUserProfile()">Profil</a>
            <a href="#" onclick="showUserGames()">Mes jeux</a>
            <a href="#" onclick="logout()">Déconnexion</a>
        </div>
    `;
    btnSignin.classList.add('logged-in');
}

// Initialiser l'application
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

    // Bouton "Create a game"
    const btnCreateGame = document.getElementById('btn-create-game');
    if (btnCreateGame) {
        btnCreateGame.addEventListener('click', function() {
            showPage('choix');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const choixLink = document.querySelector('[data-page="choix"]');
            if (choixLink) choixLink.classList.add('active');
        });
    }

    // Bouton "Créer un jeu"
    const btnCreer = document.getElementById('btn-creer');
    if (btnCreer) {
        btnCreer.addEventListener('click', function() {
            showPage('choix');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const choixLink = document.querySelector('[data-page="choix"]');
            if (choixLink) choixLink.classList.add('active');
        });
    }

    // Boutons de retour
    const btnRetourChoix = document.getElementById('btn-retour-choix');
    if (btnRetourChoix) {
        btnRetourChoix.addEventListener('click', function() {
            showPage('accueil');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const accueilLink = document.querySelector('[data-page="accueil"]');
            if (accueilLink) accueilLink.classList.add('active');
        });
    }

    const btnRetourPerso = document.getElementById('btn-retour-perso');
    if (btnRetourPerso) {
        btnRetourPerso.addEventListener('click', function() {
            showPage('choix');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const choixLink = document.querySelector('[data-page="choix"]');
            if (choixLink) choixLink.classList.add('active');
        });
    }

    const btnRetourJeu = document.getElementById('btn-retour-jeu');
    if (btnRetourJeu) {
        btnRetourJeu.addEventListener('click', function() {
            showPage('choix');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const choixLink = document.querySelector('[data-page="choix"]');
            if (choixLink) choixLink.classList.add('active');
        });
    }

    // Sélection du type de jeu
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            currentGameType = this.getAttribute('data-game');
            prefillCustomizationFields(currentGameType);
            showPage('personnalisation');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const persoLink = document.querySelector('[data-page="personnalisation"]');
            if (persoLink) persoLink.classList.add('active');
        });
    });

    // Génération du jeu
    const btnGenerer = document.getElementById('btn-generer');
    if (btnGenerer) {
        btnGenerer.addEventListener('click', generateGame);
    }

    // Bouton Rejouer
    const btnRejouer = document.getElementById('btn-rejouer');
    if (btnRejouer) {
        btnRejouer.addEventListener('click', function() {
            if (currentGameType) {
                initializeGame(currentGameType);
            }
        });
    }

    // Gestion du modal de connexion
    setupLoginModal();
}

// Configuration du modal de connexion
function setupLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;

    const closeModal = document.getElementById('closeModal');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    
    const btnSignin = document.getElementById('btn-signin');
    if (btnSignin && !btnSignin.classList.contains('logged-in')) {
        btnSignin.addEventListener('click', openLoginModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeLoginModal);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeLoginModal();
        }
    });
    
    if (showSignup) {
        showSignup.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Fonctions pour le modal
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForms();
    }
}

function showSignupForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const modalHeader = document.querySelector('.modal-header h2');
    const modalSubtitle = document.querySelector('.modal-header p');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (modalHeader) modalHeader.textContent = '👤 Inscription';
    if (modalSubtitle) modalSubtitle.textContent = 'Créez votre compte pour sauvegarder vos jeux';
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const modalHeader = document.querySelector('.modal-header h2');
    const modalSubtitle = document.querySelector('.modal-header p');
    
    if (signupForm) signupForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (modalHeader) modalHeader.textContent = '🔐 Connexion';
    if (modalSubtitle) modalSubtitle.textContent = 'Connectez-vous pour sauvegarder vos jeux et scores';
}

function resetForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
    showLoginForm();
}

// Gestion de la connexion
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const submitBtn = event.target.querySelector('.btn-modal');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Connexion...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        if (email && password) {
            if (rememberMe) {
                localStorage.setItem('userEmail', email);
            }
            
            updateUserInterface(email.split('@')[0]);
            closeLoginModal();
            showNotification('Connexion réussie ! Bienvenue !', 'success');
        } else {
            showNotification('Veuillez remplir tous les champs', 'error');
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Gestion de l'inscription
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn-modal');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Inscription...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const userData = {
            username: username,
            email: email,
            games: [],
            stats: {
                gamesCreated: 0,
                gamesPlayed: 0,
                highScores: {}
            }
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        updateUserInterface(username);
        closeLoginModal();
        showNotification(`Compte créé avec succès ! Bienvenue ${username} !`, 'success');
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Fonctions du menu utilisateur
function showUserProfile() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        const profileHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="closeLoginModal()">&times;</span>
                <div class="modal-header">
                    <h2>👤 Profil de ${userData.username}</h2>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <p><strong>Email :</strong> ${userData.email}</p>
                        <p><strong>Jeux créés :</strong> ${userData.stats.gamesCreated}</p>
                        <p><strong>Parties jouées :</strong> ${userData.stats.gamesPlayed}</p>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('loginModal');
        modal.innerHTML = profileHTML;
        modal.style.display = 'block';
    }
}

function showUserGames() {
    showNotification('Fonctionnalité à venir !', 'info');
}

function logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    const btnSignin = document.getElementById('btn-signin');
    if (btnSignin) {
        btnSignin.innerHTML = 'Sign In';
        btnSignin.classList.remove('logged-in');
        btnSignin.addEventListener('click', openLoginModal);
    }
    
    showNotification('Déconnexion réussie', 'success');
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #FF6B6B, #C62828)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #2196F3, #0D47A1)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Fonctions principales du jeu
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.add('active');
        pageElement.style.display = 'block';
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const stats = JSON.parse(localStorage.getItem('gameforge_stats')) || {
        gamesCreated: 0,
        playersActive: 0,
        gamesPlayed: 0
    };
    
    const gamesCount = document.getElementById('games-count');
    const playersCount = document.getElementById('players-count');
    const gamesPlayed = document.getElementById('games-played');
    
    if (gamesCount) gamesCount.textContent = stats.gamesCreated + 128;
    if (playersCount) playersCount.textContent = stats.playersActive + 567;
    if (gamesPlayed) gamesPlayed.textContent = stats.gamesPlayed + 892;
}

// =============================
// PERSONNALISATION DES JEUX
// =============================

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
            vitesse: 120
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
            victoire: "Obtenir un score de 8/10 ou mais",
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
    
    const reglesInput = document.getElementById('regles');
    const victoireInput = document.getElementById('victoire');
    const defaiteInput = document.getElementById('defaite');
    const manchesInput = document.getElementById('manches');
    const punitionInput = document.getElementById('punition');
    
    if (reglesInput) reglesInput.value = currentRules.regles || defaultValues.regles || "";
    if (victoireInput) victoireInput.value = currentRules.victoire || defaultValues.victoire || "";
    if (defaiteInput) defaiteInput.value = currentRules.defaite || defaultValues.defaite || "";
    if (manchesInput) manchesInput.value = currentRules.manches || defaultValues.manches || 1;
    if (punitionInput) punitionInput.value = currentRules.punition || defaultValues.punition || "";
    
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
    
    const gameModeSelect = document.getElementById('game-mode');
    if (gameModeSelect) {
        gameModeSelect.value = defaultModes[gameType] || 'computer';
    }
    
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
    
    const currentGameTitle = document.getElementById('current-game-title');
    if (currentGameTitle) {
        currentGameTitle.textContent = `Personnalisation du jeu : ${gameTitles[gameType]}`;
    }
    
    addSpecificFields(gameType, defaultValues);
}

// Ajouter des champs spécifiques selon le jeu
function addSpecificFields(gameType, defaultValues) {
    const container = document.getElementById('jeu-specific-fields');
    if (!container) return;
    
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
                        <option value="180">Lent (Niveau 1)</option>
                        <option value="120" selected>Moyen (Niveau 2)</option>
                        <option value="80">Rapide (Niveau 3)</option>
                        <option value="50">Très rapide (Niveau 4)</option>
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
    const gameModeSelect = document.getElementById('game-mode');
    if (gameModeSelect) {
        currentGameMode = gameModeSelect.value;
    }
    
    const regles = document.getElementById('regles').value;
    const victoire = document.getElementById('victoire').value;
    const defaite = document.getElementById('defaite').value;
    const manches = parseInt(document.getElementById('manches').value) || 1;
    const punition = document.getElementById('punition').value;
    
    gameRules[currentGameType] = {
        regles: regles,
        victoire: victoire,
        defaite: defaite,
        manches: manches,
        punition: punition
    };
    
    switch(currentGameType) {
        case 'mots':
            gameRules.mots.mots = document.getElementById('mots-list').value;
            gameRules.mots.gridSize = parseInt(document.getElementById('grid-size-mots').value);
            gameRules.mots.timer = parseInt(document.getElementById('mots-timer').value) || 60;
            break;
        case 'snake':
            const vitesseSelect = parseInt(document.getElementById('snake-speed').value);
            gameRules.snake.vitesse = vitesseSelect;
            gameRules.snake.scoreGoal = parseInt(document.getElementById('snake-goal').value) || 50;
            break;
        case 'action':
            gameRules.action.actions = document.getElementById('actions-list').value;
            gameRules.action.verites = document.getElementById('verites-list').value;
            const playerCount = parseInt(document.getElementById('player-count').value) || 2;
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
    
    const rules = gameRules[currentGameType];
    if (!rules.regles || !rules.victoire || !rules.defaite) {
        showNotification("Veuillez remplir au moins les règles, conditions de victoire et de défaite.", "error");
        return;
    }
    
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
    
    const titreJeu = document.getElementById('titre-jeu');
    if (titreJeu) {
        titreJeu.textContent = gameTitles[currentGameType] + ' Personnalisé';
    }
    
    updateGameInterfaceWithCustomRules();
    
    showPage('jeu');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.querySelectorAll('.jeu-type').forEach(jeu => {
        jeu.style.display = 'none';
    });
    
    const jeuElement = document.getElementById(`jeu-${currentGameType}`);
    if (jeuElement) {
        jeuElement.style.display = 'block';
        
        if (currentGameType === 'snake') {
            jeuElement.style.opacity = '1';
            jeuElement.style.visibility = 'visible';
        }
    }
    
    initializeGame(currentGameType);
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
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.prepend(rulesDisplay);
        }
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
    
    createXOGrid(gridSize);
    
    gameBoard = Array(gridSize * gridSize).fill('');
    currentPlayer = 'X';
    gameActive = true;
    
    const joueurActuel = document.getElementById('joueur-actuel');
    const mancheActuelle = document.getElementById('manche-actuelle');
    const manchesTotal = document.getElementById('manches-total');
    
    if (joueurActuel) joueurActuel.textContent = currentPlayer;
    if (mancheActuelle) mancheActuelle.textContent = currentRound;
    if (manchesTotal) manchesTotal.textContent = rules.manches;
    
    const oldResult = document.querySelector('#jeu-xo .result');
    if (oldResult) oldResult.remove();
}

function createXOGrid(size) {
    const gameBoard = document.getElementById('xo-board');
    if (!gameBoard) return;
    
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
    const joueurActuel = document.getElementById('joueur-actuel');
    if (joueurActuel) joueurActuel.textContent = currentPlayer;
    
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
        if (cell) {
            cell.click();
        }
    }
}

function checkXOWinner() {
    const size = Math.sqrt(gameBoard.length);
    const winLength = gameRules.xo.winLength || 3;
    
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
    if (!gameInfo) return;
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    
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
    
    const scoreJoueur = document.getElementById('score-joueur');
    const scoreAdversaire = document.getElementById('score-adversaire');
    const mancheActuelle = document.getElementById('manche-actuelle-pfc');
    const manchesTotal = document.getElementById('manches-total-pfc');
    const resultat = document.getElementById('resultat-pfc');
    
    if (scoreJoueur) scoreJoueur.textContent = playerScore;
    if (scoreAdversaire) scoreAdversaire.textContent = computerScore;
    if (mancheActuelle) mancheActuelle.textContent = currentRound;
    if (manchesTotal) manchesTotal.textContent = rules.manches;
    if (resultat) resultat.textContent = `🎯 ${rules.victoire}`;
    
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
    
    const resultat = document.getElementById('resultat-pfc');
    const scoreJoueur = document.getElementById('score-joueur');
    const scoreAdversaire = document.getElementById('score-adversaire');
    const mancheActuelle = document.getElementById('manche-actuelle-pfc');
    
    if (resultat) {
        resultat.textContent = `Vous: ${playerChoice} | ${currentGameMode === 'computer' ? 'Ordinateur' : 'Adversaire'}: ${adversaryChoice} - ${result}`;
    }
    if (scoreJoueur) scoreJoueur.textContent = playerScore;
    if (scoreAdversaire) scoreAdversaire.textContent = computerScore;
    
    currentRound++;
    if (mancheActuelle) mancheActuelle.textContent = currentRound;
    
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
        if (gameInfo) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result';
            resultDiv.innerHTML = `<h3>${finalResult}</h3>${punishmentText}`;
            gameInfo.appendChild(resultDiv);
        }
        
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
    const scoreQuiz = document.getElementById('score-quiz');
    const questionsTotal = document.getElementById('questions-total');
    const resultatQuiz = document.getElementById('resultat-quiz');
    
    if (scoreQuiz) scoreQuiz.textContent = quizScore;
    if (questionsTotal) questionsTotal.textContent = rules.manches;
    if (resultatQuiz) resultatQuiz.textContent = `🎯 ${rules.victoire}`;
    
    if (quizQuestions.length < rules.manches) {
        generateCustomQuizQuestions(rules.manches);
    }
    
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
            answer: Math.floor(Math.random() * 4)
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
    const questionElement = document.getElementById('question-quiz');
    if (questionElement) {
        questionElement.textContent = question.question;
    }
    
    const options = document.querySelectorAll('.quiz-option .option-text');
    options.forEach((opt, index) => {
        if (index < question.options.length) {
            opt.textContent = question.options[index];
        }
    });
}

function handleQuizClick() {
    if (currentGameType !== 'quiz') return;
    
    const selectedOption = parseInt(this.getAttribute('data-option'));
    const correctOption = quizQuestions[quizScore].answer;
    const resultatQuiz = document.getElementById('resultat-quiz');
    const scoreQuiz = document.getElementById('score-quiz');
    
    if (selectedOption === correctOption) {
        quizScore++;
        if (resultatQuiz) {
            resultatQuiz.textContent = "✅ Bonne réponse!";
            resultatQuiz.style.color = '#4CAF50';
        }
    } else {
        if (resultatQuiz) {
            resultatQuiz.textContent = `❌ Mauvaise réponse! La bonne réponse était : ${quizQuestions[quizScore].options[correctOption]}`;
            resultatQuiz.style.color = '#FF6B6B';
        }
    }
    
    if (scoreQuiz) scoreQuiz.textContent = quizScore;
    
    setTimeout(showQuestion, 1500);
}

function endQuizGame() {
    const rules = gameRules.quiz;
    const resultatQuiz = document.getElementById('resultat-quiz');
    if (!resultatQuiz) return;
    
    let finalMessage = `Quiz terminé! Votre score: ${quizScore}/${quizQuestions.length}`;
    let punishmentText = '';
    
    if (quizScore >= Math.ceil(quizQuestions.length / 2)) {
        finalMessage += ` 🎉 ${rules.victoire}`;
        punishmentText = `<p class="punition">💥 Vous avez évité la punition!</p>`;
    } else {
        finalMessage += ` 💥 ${rules.defaite}`;
        punishmentText = `<p class="punition">💥 Vous devez: ${rules.punition}</p>`;
    }
    
    resultatQuiz.innerHTML = `<h3>${finalMessage}</h3>${punishmentText}`;
    
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
    const scoreDice = document.getElementById('score-dice');
    const resultatDice = document.getElementById('resultat-dice');
    
    if (scoreDice) scoreDice.textContent = diceScore;
    if (resultatDice) resultatDice.textContent = `🎯 ${rules.victoire}`;
    
    const rollButton = document.getElementById('btn-roll-dice');
    if (rollButton) {
        rollButton.disabled = false;
        rollButton.addEventListener('click', rollDice);
    }
}

function rollDice() {
    if (currentGameType !== 'dice') return;
    
    const dice = document.getElementById('de');
    if (!dice) return;
    
    dice.classList.add('rolling');
    
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        
        dice.textContent = diceFaces[roll - 1];
        dice.classList.remove('rolling');
        
        diceScore += roll;
        const scoreDice = document.getElementById('score-dice');
        const resultatDice = document.getElementById('resultat-dice');
        
        if (scoreDice) scoreDice.textContent = diceScore;
        if (resultatDice) resultatDice.textContent = `Vous avez obtenu un ${roll}!`;
        
        const rules = gameRules.dice;
        if (diceScore >= 15) {
            const resultDiv = document.getElementById('resultat-dice');
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <h3>🎉 Félicitations! ${rules.victoire}</h3>
                    <p class="punition">💥 Vous avez évité la punition!</p>
                `;
            }
            const rollButton = document.getElementById('btn-roll-dice');
            if (rollButton) rollButton.disabled = true;
        }
    }, 1000);
}

// =============================
// JEU MOTS MÊLÉS
// =============================
function initializeMotsMelees() {
    const rules = gameRules.mots;
    
    const mots = rules.mots.split(',').map(mot => mot.trim().toUpperCase()).filter(mot => mot.length > 0);
    
    if (mots.length === 0) {
        showNotification("Veuillez entrer au moins un mot dans la liste des mots.", "error");
        return;
    }
    
    motsMelees.words = mots;
    motsMelees.foundWords = [];
    motsMelees.selectedCells = [];
    motsMelees.timeLeft = rules.timer || 60;
    
    const motsTrouves = document.getElementById('mots-trouves');
    const motsTotal = document.getElementById('mots-total');
    
    if (motsTrouves) motsTrouves.textContent = '0';
    if (motsTotal) motsTotal.textContent = mots.length;
    
    let timerElement = document.getElementById('mots-timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'mots-timer';
        timerElement.className = 'timer';
        const gameInfo = document.querySelector('#jeu-mots .game-info');
        if (gameInfo) {
            gameInfo.appendChild(timerElement);
        }
    }
    
    generateWordSearchGrid();
    displayWordList();
    startMotsTimer();
}

function startMotsTimer() {
    clearInterval(motsMelees.gameTimer);
    
    motsMelees.gameTimer = setInterval(() => {
        motsMelees.timeLeft--;
        const timerElement = document.getElementById('mots-timer');
        if (timerElement) {
            timerElement.textContent = `Temps restant: ${motsMelees.timeLeft}s`;
        }
        
        if (motsMelees.timeLeft <= 0) {
            clearInterval(motsMelees.gameTimer);
            endMotsGame(false);
        }
    }, 1000);
}

function generateWordSearchGrid() {
    const gridSize = gameRules.mots.gridSize;
    const grid = document.getElementById('mots-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    motsMelees.grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    placeWordsInGrid();
    fillEmptyCells();
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
    
    if (!grid) return;
    
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
    if (!wordList) return;
    
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
    if (!cell) return;
    
    checkWordAtPosition(row, col);
    cell.classList.add('selected');
    
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
    const motsTrouves = document.getElementById('mots-trouves');
    if (motsTrouves) motsTrouves.textContent = motsMelees.foundWords.length;
    
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
    if (resultDiv) {
        resultDiv.innerHTML = `<h3>${message}</h3>${punishmentText}`;
    }
    
    document.querySelectorAll('.word-cell').forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
}

// =============================
// JEU SNAKE (CORRIGÉ)
// =============================
function initializeSnake() {
    console.log("Initialisation du Snake...");
    
    const canvas = document.getElementById('snake-canvas');
    
    if (!canvas) {
        console.error("Canvas Snake non trouvé!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
        clearInterval(snakeGame.timerInterval);
        document.removeEventListener('keydown', handleSnakeKeyPress);
    }
    
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
    
    snakeGame.speed = gameRules.snake.vitesse || 120;
    
    const jeuSnake = document.getElementById('jeu-snake');
    if (jeuSnake) {
        jeuSnake.style.display = 'block';
        jeuSnake.style.visibility = 'visible';
        jeuSnake.style.opacity = '1';
    }
    
    const snakeContainer = document.querySelector('.snake-container');
    if (snakeContainer) {
        snakeContainer.style.position = 'relative';
        snakeContainer.style.minHeight = '500px';
    }
    
    const scoreElement = document.getElementById('snake-score');
    const lengthElement = document.getElementById('snake-length');
    const resultElement = document.getElementById('resultat-snake');
    
    if (scoreElement) scoreElement.textContent = '0';
    if (lengthElement) lengthElement.textContent = '1';
    if (resultElement) resultElement.innerHTML = '';
    
    let timerElement = document.getElementById('snake-timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'snake-timer';
        timerElement.className = 'timer-display';
        timerElement.style.cssText = `
            font-size: 1.2em;
            font-weight: bold;
            color: #4ecdc4;
            margin-bottom: 10px;
        `;
        const gameInfo = document.querySelector('#jeu-snake .game-info');
        if (gameInfo) {
            gameInfo.prepend(timerElement);
        }
    }
    timerElement.textContent = 'Temps: 00:00';
    timerElement.style.color = '#4ecdc4';
    timerElement.style.animation = 'none';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createSnakeStartScreen();
    drawSnake();
    disableSnakeControls();
}

function createSnakeStartScreen() {
    const existingScreen = document.getElementById('snake-start-screen');
    if (existingScreen) {
        existingScreen.remove();
    }
    
    const gameOverScreen = document.getElementById('snake-game-over');
    if (gameOverScreen) {
        gameOverScreen.remove();
    }
    
    const startScreen = document.createElement('div');
    startScreen.id = 'snake-start-screen';
    startScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
    `;
    
    const rules = gameRules.snake;
    const scoreGoal = rules.scoreGoal || 50;
    const vitesse = snakeGame.speed;
    let vitesseText = 'Moyen';
    
    if (vitesse >= 180) vitesseText = 'Lent';
    else if (vitesse >= 120) vitesseText = 'Moyen';
    else if (vitesse >= 80) vitesseText = 'Rapide';
    else vitesseText = 'Très rapide';
    
    startScreen.innerHTML = `
        <h2 style="color: #4ecdc4; margin-bottom: 20px; text-align: center;">🐍 Jeu du Serpent</h2>
        <div style="text-align: center; margin-bottom: 20px; padding: 0 20px;">
            <p style="margin-bottom: 10px;"><strong>Objectif :</strong> Atteindre ${scoreGoal} points</p>
            <p style="margin-bottom: 10px;"><strong>Vitesse :</strong> ${vitesseText}</p>
            <p style="margin-bottom: 10px;"><strong>Contrôles :</strong> Flèches directionnelles ou boutons</p>
            <p style="margin-bottom: 10px;"><strong>Pénalité :</strong> ${rules.punition || "Faire 20 sauts"}</p>
            <p style="margin-bottom: 15px; color: #ff9f43;"><strong>⏱️ Temps limite : 2 minutes</strong></p>
        </div>
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
    
    const snakeContainer = document.querySelector('.snake-container');
    if (snakeContainer) {
        snakeContainer.appendChild(startScreen);
    }
    
    const startBtn = document.getElementById('start-snake-game-btn');
    if (startBtn) {
        startBtn.onclick = null;
        startBtn.addEventListener('click', startSnakeGame);
    }
}

function startSnakeGame() {
    console.log("Démarrage du jeu Snake...");
    
    const startScreen = document.getElementById('snake-start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
    
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = 'right';
    snakeGame.food = {x: 15, y: 15};
    snakeGame.score = 0;
    snakeGame.gameStarted = true;
    snakeGame.gameOver = false;
    snakeGame.timer = 0;
    
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-length').textContent = '1';
    document.getElementById('resultat-snake').innerHTML = '';
    
    enableSnakeControls();
    setupSnakeControls();
    startSnakeTimer();
    
    if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
    snakeGame.gameLoop = setInterval(updateSnake, snakeGame.speed);
    
    drawSnake();
}

function setupSnakeControls() {
    console.log("Configuration des contrôles Snake...");
    
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
            btn.style.cursor = 'pointer';
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
    
    const timeLeft = 120 - snakeGame.timer;
    if (timeLeft <= 30) {
        timerElement.style.color = '#ff9f43';
        if (timeLeft <= 10) {
            timerElement.style.color = '#ff6b6b';
            timerElement.style.animation = 'blink 1s infinite';
        }
    } else {
        timerElement.style.color = '#4ecdc4';
        timerElement.style.animation = 'none';
    }
}

function generateSnakeFood() {
    const x = Math.floor(Math.random() * (snakeGame.canvas.width / snakeGame.gridSize));
    const y = Math.floor(Math.random() * (snakeGame.canvas.height / snakeGame.gridSize));
    
    for (let segment of snakeGame.snake) {
        if (segment.x === x && segment.y === y) {
            return generateSnakeFood();
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
    
    if (head.x < 0 || head.x >= snakeGame.canvas.width / snakeGame.gridSize ||
        head.y < 0 || head.y >= snakeGame.canvas.height / snakeGame.gridSize) {
        endSnakeGame("💥 Le serpent a touché un mur !");
        return;
    }
    
    for (let i = 1; i < snakeGame.snake.length; i++) {
        if (head.x === snakeGame.snake[i].x && head.y === snakeGame.snake[i].y) {
            endSnakeGame("💥 Le serpent s'est mordu la queue !");
            return;
        }
    }
    
    snakeGame.snake.unshift(head);
    
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        document.getElementById('snake-score').textContent = snakeGame.score;
        document.getElementById('snake-length').textContent = snakeGame.snake.length;
        generateSnakeFood();
        
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
    ctx.clearRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
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
    
    snakeGame.snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(
                segment.x * snakeGame.gridSize,
                segment.y * snakeGame.gridSize,
                snakeGame.gridSize - 2,
                snakeGame.gridSize - 2
            );
            
            ctx.fillStyle = 'white';
            if (snakeGame.direction === 'right') {
                ctx.fillRect(segment.x * snakeGame.gridSize + snakeGame.gridSize - 4, 
                           segment.y * snakeGame.gridSize + 4, 2, 2);
                ctx.fillRect(segment.x * snakeGame.gridSize + snakeGame.gridSize - 4, 
                           segment.y * snakeGame.gridSize + snakeGame.gridSize - 6, 2, 2);
            } else if (snakeGame.direction === 'left') {
                ctx.fillRect(segment.x * snakeGame.gridSize + 2, 
                           segment.y * snakeGame.gridSize + 4, 2, 2);
                ctx.fillRect(segment.x * snakeGame.gridSize + 2, 
                           segment.y * snakeGame.gridSize + snakeGame.gridSize - 6, 2, 2);
            } else if (snakeGame.direction === 'up') {
                ctx.fillRect(segment.x * snakeGame.gridSize + 4, 
                           segment.y * snakeGame.gridSize + 2, 2, 2);
                ctx.fillRect(segment.x * snakeGame.gridSize + snakeGame.gridSize - 6, 
                           segment.y * snakeGame.gridSize + 2, 2, 2);
            } else if (snakeGame.direction === 'down') {
                ctx.fillRect(segment.x * snakeGame.gridSize + 4, 
                           segment.y * snakeGame.gridSize + snakeGame.gridSize - 4, 2, 2);
                ctx.fillRect(segment.x * snakeGame.gridSize + snakeGame.gridSize - 6, 
                           segment.y * snakeGame.gridSize + snakeGame.gridSize - 4, 2, 2);
            }
        } else {
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(
                segment.x * snakeGame.gridSize,
                segment.y * snakeGame.gridSize,
                snakeGame.gridSize - 2,
                snakeGame.gridSize - 2
            );
        }
    });
    
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
    
    disableSnakeControls();
    document.removeEventListener('keydown', handleSnakeKeyPress);
    
    const rules = gameRules.snake;
    const minutes = Math.floor(snakeGame.timer / 60);
    const seconds = snakeGame.timer % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    createSnakeGameOverScreen(message, isVictory, timeString);
}

function createSnakeGameOverScreen(message, isVictory, timeString) {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'snake-game-over';
    gameOverScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 200;
        text-align: center;
        padding: 20px;
        border-radius: 10px;
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
    
    const snakeContainer = document.querySelector('.snake-container');
    if (snakeContainer) {
        snakeContainer.appendChild(gameOverScreen);
    }
    
    const restartBtn = document.getElementById('restart-snake-game-btn');
    if (restartBtn) {
        restartBtn.onclick = null;
        restartBtn.addEventListener('click', () => {
            if (gameOverScreen) {
                gameOverScreen.remove();
            }
            initializeSnake();
        });
    }
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
    
    const calculScore = document.getElementById('calcul-score');
    const calculCount = document.getElementById('calcul-count');
    const calculTotal = document.getElementById('calcul-total');
    const resultatCalcul = document.getElementById('resultat-calcul');
    const timerProgress = document.getElementById('timer-progress');
    const calculTimer = document.getElementById('calcul-timer');
    const calculReponse = document.getElementById('calcul-reponse');
    const btnValiderCalcul = document.getElementById('btn-valider-calcul');
    
    if (calculScore) calculScore.textContent = calculMental.score;
    if (calculCount) calculCount.textContent = calculMental.count;
    if (calculTotal) calculTotal.textContent = rules.manches;
    if (resultatCalcul) resultatCalcul.textContent = '';
    if (timerProgress) timerProgress.style.width = '100%';
    if (calculTimer) calculTimer.textContent = calculMental.timeLeft;
    if (calculReponse) calculReponse.disabled = false;
    if (btnValiderCalcul) btnValiderCalcul.disabled = false;
    
    generateCalculQuestion();
    startCalculTimer();
    
    if (btnValiderCalcul) {
        btnValiderCalcul.addEventListener('click', validateCalculAnswer);
    }
    
    if (calculReponse) {
        calculReponse.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateCalculAnswer();
            }
        });
    }
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
    const calculQuestion = document.getElementById('calcul-question');
    if (calculQuestion) {
        calculQuestion.textContent = `${a} ${operation} ${b} = ?`;
    }
    const calculReponse = document.getElementById('calcul-reponse');
    if (calculReponse) {
        calculReponse.value = '';
        calculReponse.focus();
    }
}

function startCalculTimer() {
    clearInterval(calculMental.timer);
    calculMental.timeLeft = gameRules.calcul.timePerQuestion || 10;
    const timerProgress = document.getElementById('timer-progress');
    const calculTimer = document.getElementById('calcul-timer');
    
    if (timerProgress) timerProgress.style.width = '100%';
    if (calculTimer) calculTimer.textContent = calculMental.timeLeft;
    
    calculMental.timer = setInterval(() => {
        calculMental.timeLeft--;
        const progress = (calculMental.timeLeft / (gameRules.calcul.timePerQuestion || 10)) * 100;
        if (timerProgress) timerProgress.style.width = progress + '%';
        if (calculTimer) calculTimer.textContent = calculMental.timeLeft;
        
        if (calculMental.timeLeft <= 0) {
            clearInterval(calculMental.timer);
            calculMental.count++;
            const calculCount = document.getElementById('calcul-count');
            if (calculCount) calculCount.textContent = calculMental.count;
            
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
    
    const calculReponse = document.getElementById('calcul-reponse');
    if (!calculReponse) return;
    
    const userAnswer = parseInt(calculReponse.value);
    const correctAnswer = calculMental.currentQuestion.result;
    
    if (isNaN(userAnswer)) {
        const resultatCalcul = document.getElementById('resultat-calcul');
        if (resultatCalcul) {
            resultatCalcul.textContent = "Veuillez entrer un nombre!";
            resultatCalcul.style.color = '#FF6B6B';
        }
        return;
    }
    
    clearInterval(calculMental.timer);
    
    const resultatCalcul = document.getElementById('resultat-calcul');
    const calculScore = document.getElementById('calcul-score');
    const calculCount = document.getElementById('calcul-count');
    
    if (userAnswer === correctAnswer) {
        calculMental.score++;
        if (resultatCalcul) {
            resultatCalcul.textContent = "✅ Bonne réponse!";
            resultatCalcul.style.color = '#4CAF50';
        }
    } else {
        if (resultatCalcul) {
            resultatCalcul.textContent = `❌ Mauvaise réponse! La réponse était ${correctAnswer}`;
            resultatCalcul.style.color = '#FF6B6B';
        }
    }
    
    if (calculScore) calculScore.textContent = calculMental.score;
    
    calculMental.count++;
    if (calculCount) calculCount.textContent = calculMental.count;
    
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
    const resultatCalcul = document.getElementById('resultat-calcul');
    const calculReponse = document.getElementById('calcul-reponse');
    const btnValiderCalcul = document.getElementById('btn-valider-calcul');
    
    if (!resultatCalcul) return;
    
    let message = `Jeu terminé! Score: ${calculMental.score}/${rules.manches}`;
    let punishmentText = '';
    
    if (calculMental.score >= Math.ceil(rules.manches * 0.8)) {
        message += ` 🎉 ${rules.victoire}`;
        punishmentText = `<p class="punition">💥 Vous avez évité la punition!</p>`;
    } else {
        message += ` 💥 ${rules.defaite}`;
        punishmentText = `<p class="punition">💥 Vous devez: ${rules.punition}</p>`;
    }
    
    resultatCalcul.innerHTML = `<h3>${message}</h3>${punishmentText}`;
    if (calculReponse) calculReponse.disabled = true;
    if (btnValiderCalcul) btnValiderCalcul.disabled = true;
}

// =============================
// JEU PONG
// =============================
function initializePong() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    
    if (pongGame.gameLoop) {
        clearInterval(pongGame.gameLoop);
        document.removeEventListener('keydown', handlePongKeyDown);
        document.removeEventListener('keyup', handlePongKeyUp);
    }
    
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
    
    const pongScoreJoueur = document.getElementById('pong-score-joueur');
    const pongScoreAdversaire = document.getElementById('pong-score-adversaire');
    const pongManche = document.getElementById('pong-manche');
    const pongManches = document.getElementById('pong-manches');
    const resultatPong = document.getElementById('resultat-pong');
    
    if (pongScoreJoueur) pongScoreJoueur.textContent = pongGame.playerScore;
    if (pongScoreAdversaire) pongScoreAdversaire.textContent = pongGame.computerScore;
    if (pongManche) pongManche.textContent = currentRound;
    if (pongManches) pongManches.textContent = gameRules.pong.manches;
    if (resultatPong) resultatPong.textContent = '';
    
    document.addEventListener('keydown', handlePongKeyDown);
    document.addEventListener('keyup', handlePongKeyUp);
    
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
    
    pongGame.ball.x += pongGame.ball.dx;
    pongGame.ball.y += pongGame.ball.dy;
    
    if (pongGame.ball.y - pongGame.ball.radius < 0 || pongGame.ball.y + pongGame.ball.radius > pongGame.canvas.height) {
        pongGame.ball.dy = -pongGame.ball.dy;
    }
    
    const computerPaddleCenter = pongGame.computerPaddle.y + pongGame.computerPaddle.height / 2;
    if (computerPaddleCenter < pongGame.ball.y - 10) {
        pongGame.computerPaddle.y = Math.min(
            pongGame.canvas.height - pongGame.computerPaddle.height,
            pongGame.computerPaddle.y + 6
        );
    } else if (computerPaddleCenter > pongGame.ball.y + 10) {
        pongGame.computerPaddle.y = Math.max(0, pongGame.computerPaddle.y - 6);
    }
    
    if (pongGame.ball.x - pongGame.ball.radius < pongGame.playerPaddle.x + pongGame.playerPaddle.width &&
        pongGame.ball.x + pongGame.ball.radius > pongGame.playerPaddle.x &&
        pongGame.ball.y > pongGame.playerPaddle.y &&
        pongGame.ball.y < pongGame.playerPaddle.y + pongGame.playerPaddle.height) {
        
        const hitPosition = (pongGame.ball.y - (pongGame.playerPaddle.y + pongGame.playerPaddle.height / 2)) / (pongGame.playerPaddle.height / 2);
        pongGame.ball.dx = Math.abs(pongGame.ball.dx);
        pongGame.ball.dy = hitPosition * 7;
    }
    
    if (pongGame.ball.x + pongGame.ball.radius > pongGame.computerPaddle.x &&
        pongGame.ball.x - pongGame.ball.radius < pongGame.computerPaddle.x + pongGame.computerPaddle.width &&
        pongGame.ball.y > pongGame.computerPaddle.y &&
        pongGame.ball.y < pongGame.computerPaddle.y + pongGame.computerPaddle.height) {
        
        const hitPosition = (pongGame.ball.y - (pongGame.computerPaddle.y + pongGame.computerPaddle.height / 2)) / (pongGame.computerPaddle.height / 2);
        pongGame.ball.dx = -Math.abs(pongGame.ball.dx);
        pongGame.ball.dy = hitPosition * 7;
    }
    
    if (pongGame.ball.x - pongGame.ball.radius < 0) {
        pongGame.computerScore++;
        const pongScoreAdversaire = document.getElementById('pong-score-adversaire');
        if (pongScoreAdversaire) pongScoreAdversaire.textContent = pongGame.computerScore;
        resetPongBall();
    } else if (pongGame.ball.x + pongGame.ball.radius > pongGame.canvas.width) {
        pongGame.playerScore++;
        const pongScoreJoueur = document.getElementById('pong-score-joueur');
        if (pongScoreJoueur) pongScoreJoueur.textContent = pongGame.playerScore;
        resetPongBall();
    }
    
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
    ctx.clearRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
    
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(pongGame.canvas.width / 2, 0);
    ctx.lineTo(pongGame.canvas.width / 2, pongGame.canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(pongGame.ball.x, pongGame.ball.y, pongGame.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
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
    const pongManche = document.getElementById('pong-manche');
    if (pongManche) pongManche.textContent = currentRound;
    
    if (currentRound > gameRules.pong.manches) {
        document.removeEventListener('keydown', handlePongKeyDown);
        document.removeEventListener('keyup', handlePongKeyUp);
        
        let message = "Match terminé! ";
        const rules = gameRules.pong;
        
        if (pongGame.playerScore > pongGame.computerScore) {
            message += `🎉 ${rules.victoire}`;
            const resultatPong = document.getElementById('resultat-pong');
            if (resultatPong) {
                resultatPong.innerHTML = `
                    <h3>${message}</h3>
                    <p class="punition">💥 L'ordinateur doit: ${rules.punition}</p>
                `;
            }
        } else {
            message += `💥 ${rules.defaite}`;
            const resultatPong = document.getElementById('resultat-pong');
            if (resultatPong) {
                resultatPong.innerHTML = `
                    <h3>${message}</h3>
                    <p class="punition">💥 Vous devez: ${rules.punition}</p>
                `;
            }
        }
    } else {
        pongGame.playerScore = 0;
        pongGame.computerScore = 0;
        const pongScoreJoueur = document.getElementById('pong-score-joueur');
        const pongScoreAdversaire = document.getElementById('pong-score-adversaire');
        
        if (pongScoreJoueur) pongScoreJoueur.textContent = pongGame.playerScore;
        if (pongScoreAdversaire) pongScoreAdversaire.textContent = pongGame.computerScore;
        resetPongBall();
        
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