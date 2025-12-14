// GameForge - Application Principale
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentGame = null;
    let currentTheme = 'light';
    let savedGames = JSON.parse(localStorage.getItem('gameforge_games')) || [];
    let customizationData = {
        gameType: '',
        rules: {},
        conditions: {},
        penalties: {},
        mechanics: {}
    };
    let currentStep = 1;

    // Initialisation
    initTheme();
    initNavigation();
    initGameCards();
    initCreationWizard();
    initModal();
    loadGallery();

    // Gestion du thème clair/sombre
    function initTheme() {
        const themeBtn = document.getElementById('themeBtn');
        const savedTheme = localStorage.getItem('gameforge_theme') || 'light';
        
        setTheme(savedTheme);
        
        themeBtn.addEventListener('click', () => {
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gameforge_theme', theme);
        
        const icon = document.querySelector('#themeBtn i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Navigation entre sections
    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Mettre à jour la navigation active
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Afficher la section cible
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
                
                // Scroll vers le haut
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Boutons CTA
        document.getElementById('startCreating').addEventListener('click', () => {
            document.querySelector('[href="#create"]').click();
            // Charger la sélection de jeux
            loadGameSelection();
        });

        document.getElementById('exploreGames').addEventListener('click', () => {
            document.querySelector('[href="#games"]').click();
        });
    }

    // Initialisation des cartes de jeu
    function initGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const playBtn = card.querySelector('.btn-play');
            const customizeBtn = card.querySelector('.btn-customize');
            const gameType = card.dataset.game;
            
            playBtn.addEventListener('click', () => {
                currentGame = gameType;
                playGame(gameType, 'classic');
            });
            
            customizeBtn.addEventListener('click', () => {
                currentGame = gameType;
                customizationData.gameType = gameType;
                document.querySelector('[href="#create"]').click();
                startCustomization(gameType);
            });
        });
    }

    // Charger la sélection de jeux dans l'assistant
    function loadGameSelection() {
        const gameSelection = document.getElementById('gameSelection');
        if (!gameSelection) return;
        
        const games = [
            { id: 'tictactoe', name: 'Tic Tac Toe', icon: 'fas fa-times' },
            { id: 'snake', name: 'Jeu du Serpent', icon: 'fas fa-snake' },
            { id: 'wordsearch', name: 'Mots Mêlés', icon: 'fas fa-font' },
            { id: 'truthordare', name: 'Action ou Vérité', icon: 'fas fa-question-circle' },
            { id: 'math', name: 'Calcul Mental', icon: 'fas fa-calculator' },
            { id: 'pong', name: 'Ping Pong', icon: 'fas fa-table-tennis' },
            { id: 'rps', name: 'Pierre-Papier-Ciseaux', icon: 'fas fa-hand-scissors' },
            { id: 'quiz', name: 'Quiz Général', icon: 'fas fa-question' }
        ];
        
        gameSelection.innerHTML = games.map(game => `
            <div class="game-selection-item" data-game="${game.id}">
                <div class="game-icon">
                    <i class="${game.icon}"></i>
                </div>
                <h4>${game.name}</h4>
            </div>
        `).join('');
        
        // Ajouter les écouteurs d'événements
        document.querySelectorAll('.game-selection-item').forEach(item => {
            item.addEventListener('click', () => {
                // Retirer la sélection précédente
                document.querySelectorAll('.game-selection-item').forEach(i => {
                    i.classList.remove('selected');
                });
                
                // Sélectionner l'élément actuel
                item.classList.add('selected');
                
                // Mettre à jour le jeu courant
                currentGame = item.dataset.game;
                customizationData.gameType = currentGame;
                
                // Passer à l'étape suivante après un court délai
                setTimeout(() => {
                    nextStep();
                }, 500);
            });
        });
    }

    // Assistant de création
    function initCreationWizard() {
        const steps = document.querySelectorAll('.step');
        const stepContents = document.querySelectorAll('.step-content');
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const generateBtn = document.getElementById('generateGame');

        function updateWizard() {
            // Mettre à jour les étapes
            steps.forEach(step => {
                const stepNum = parseInt(step.dataset.step);
                step.classList.toggle('active', stepNum === currentStep);
            });
            
            // Mettre à jour le contenu
            stepContents.forEach(content => {
                const stepNum = parseInt(content.dataset.step);
                content.classList.toggle('active', stepNum === currentStep);
            });
            
            // Mettre à jour les boutons
            prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
            nextBtn.style.display = currentStep === 5 ? 'none' : 'inline-flex';
            generateBtn.style.display = currentStep === 5 ? 'inline-flex' : 'none';
            
            // Si on est à l'étape 1, charger la sélection de jeux
            if (currentStep === 1) {
                loadGameSelection();
            }
            
            // Remplir avec les données existantes si on a un jeu sélectionné
            if (currentGame && currentStep > 1) {
                loadStepData(currentStep);
            }
        }

        // Navigation des étapes
        nextBtn.addEventListener('click', () => {
            if (currentStep < 5) {
                saveStepData(currentStep);
                currentStep++;
                updateWizard();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizard();
            }
        });

        // Génération du jeu
        generateBtn.addEventListener('click', () => {
            saveStepData(5);
            generateCustomGame();
        });

        // Initialiser le slider des rounds
        const roundsSlider = document.getElementById('rounds');
        if (roundsSlider) {
            roundsSlider.addEventListener('input', function() {
                document.getElementById('roundsValue').textContent = `${this.value} rounds`;
            });
        }

        updateWizard();
    }

    function nextStep() {
        if (currentStep < 5) {
            saveStepData(currentStep);
            currentStep++;
            initCreationWizard();
        }
    }

    function startCustomization(gameType) {
        // Réinitialiser l'assistant à l'étape 1
        currentStep = 1;
        customizationData = {
            gameType: gameType,
            rules: getDefaultRules(gameType),
            conditions: getDefaultConditions(gameType),
            penalties: getDefaultPenalties(gameType),
            mechanics: getDefaultMechanics(gameType)
        };
        
        // Mettre à jour l'interface
        updateCustomizationUI();
        
        // Sélectionner automatiquement le jeu dans l'assistant
        setTimeout(() => {
            const gameItem = document.querySelector(`.game-selection-item[data-game="${gameType}"]`);
            if (gameItem) {
                document.querySelectorAll('.game-selection-item').forEach(i => {
                    i.classList.remove('selected');
                });
                gameItem.classList.add('selected');
            }
        }, 100);
    }

    function getDefaultRules(gameType) {
        const defaults = {
            tictactoe: {
                type: 'classic',
                customRules: '',
                rounds: 3
            },
            snake: {
                type: 'classic',
                customRules: '',
                rounds: 1
            },
            wordsearch: {
                type: 'classic',
                customRules: '',
                rounds: 1
            },
            truthordare: {
                type: 'classic',
                customRules: '',
                rounds: 10
            },
            math: {
                type: 'classic',
                customRules: '',
                rounds: 10
            },
            pong: {
                type: 'classic',
                customRules: '',
                rounds: 3
            },
            rps: {
                type: 'classic',
                customRules: '',
                rounds: 3
            },
            quiz: {
                type: 'classic',
                customRules: '',
                rounds: 10
            }
        };
        return defaults[gameType] || defaults.tictactoe;
    }

    function getDefaultConditions(gameType) {
        return {
            winConditions: ['score'],
            loseConditions: ['timeout'],
            targetScore: gameType === 'snake' ? 100 : 10
        };
    }

    function getDefaultPenalties(gameType) {
        return {
            type: 'none',
            customPenalty: ''
        };
    }

    function getDefaultMechanics(gameType) {
        return {
            difficulty: 'medium',
            powerups: [],
            timeLimit: gameType === 'quiz' ? 30 : 60
        };
    }

    function saveStepData(step) {
        if (!currentGame) return;
        
        switch(step) {
            case 1:
                customizationData.rules.type = document.getElementById('ruleType')?.value || 'classic';
                customizationData.rules.customRules = document.getElementById('customRules')?.value || '';
                customizationData.rules.rounds = parseInt(document.getElementById('rounds')?.value || 3);
                break;
            case 2:
                // Sauvegarder les conditions de victoire
                const winConditions = [];
                document.querySelectorAll('input[name="winConditions"]:checked').forEach(cb => {
                    winConditions.push(cb.value);
                });
                customizationData.conditions.winConditions = winConditions;
                
                // Sauvegarder les conditions de défaite
                const loseConditions = [];
                document.querySelectorAll('input[name="loseConditions"]:checked').forEach(cb => {
                    loseConditions.push(cb.value);
                });
                customizationData.conditions.loseConditions = loseConditions;
                
                customizationData.conditions.targetScore = parseInt(document.getElementById('targetScore')?.value || 100);
                break;
            case 3:
                const penaltyType = document.querySelector('input[name="penalty"]:checked')?.value || 'none';
                customizationData.penalties.type = penaltyType;
                customizationData.penalties.customPenalty = document.getElementById('customPenalty')?.value || '';
                break;
            case 4:
                customizationData.mechanics.difficulty = document.getElementById('difficulty')?.value || 'medium';
                const powerups = [];
                document.querySelectorAll('input[name="powerups"]:checked').forEach(cb => {
                    powerups.push(cb.value);
                });
                customizationData.mechanics.powerups = powerups;
                customizationData.mechanics.timeLimit = parseInt(document.getElementById('timeLimit')?.value || 60);
                break;
        }
        
        // Sauvegarder dans le localStorage
        localStorage.setItem(`gameforge_custom_${currentGame}`, JSON.stringify(customizationData));
    }

    function loadStepData(step) {
        if (!currentGame) return;
        
        // Charger depuis le localStorage
        const saved = localStorage.getItem(`gameforge_custom_${currentGame}`);
        if (saved) {
            try {
                customizationData = JSON.parse(saved);
            } catch (e) {
                console.error('Erreur de chargement des données:', e);
            }
        }
        
        updateCustomizationUI();
    }

    function updateCustomizationUI() {
        // Remplir l'étape 1
        if (document.getElementById('ruleType')) {
            document.getElementById('ruleType').value = customizationData.rules.type || 'classic';
            document.getElementById('customRules').value = customizationData.rules.customRules || '';
            document.getElementById('rounds').value = customizationData.rules.rounds || 3;
            document.getElementById('roundsValue').textContent = `${customizationData.rules.rounds || 3} rounds`;
        }
        
        // Remplir l'étape 2
        if (customizationData.conditions.winConditions) {
            document.querySelectorAll('input[name="winConditions"]').forEach(cb => {
                cb.checked = customizationData.conditions.winConditions.includes(cb.value);
            });
        }
        
        if (customizationData.conditions.loseConditions) {
            document.querySelectorAll('input[name="loseConditions"]').forEach(cb => {
                cb.checked = customizationData.conditions.loseConditions.includes(cb.value);
            });
        }
        
        if (document.getElementById('targetScore')) {
            document.getElementById('targetScore').value = customizationData.conditions.targetScore || 100;
        }
        
        // Remplir l'étape 3
        if (customizationData.penalties.type) {
            const penaltyRadio = document.querySelector(`input[name="penalty"][value="${customizationData.penalties.type}"]`);
            if (penaltyRadio) {
                penaltyRadio.checked = true;
            }
            if (document.getElementById('customPenalty')) {
                document.getElementById('customPenalty').value = customizationData.penalties.customPenalty || '';
            }
        }
        
        // Remplir l'étape 4
        if (document.getElementById('difficulty')) {
            document.getElementById('difficulty').value = customizationData.mechanics.difficulty || 'medium';
        }
        
        if (customizationData.mechanics.powerups) {
            document.querySelectorAll('input[name="powerups"]').forEach(cb => {
                cb.checked = customizationData.mechanics.powerups.includes(cb.value);
            });
        }
        
        if (document.getElementById('timeLimit')) {
            document.getElementById('timeLimit').value = customizationData.mechanics.timeLimit || 60;
        }
    }

    function generateCustomGame() {
        if (!currentGame) {
            showNotification('Veuillez d\'abord sélectionner un jeu!', 'error');
            return;
        }
        
        // Créer un objet jeu personnalisé
        const customGame = {
            id: Date.now(),
            name: `${getGameName(currentGame)} Personnalisé`,
            type: currentGame,
            data: {...customizationData},
            createdAt: new Date().toISOString(),
            plays: 0
        };
        
        // Sauvegarder
        savedGames.push(customGame);
        localStorage.setItem('gameforge_games', JSON.stringify(savedGames));
        
        // Jouer le jeu
        playGame(currentGame, 'custom', customGame);
        
        // Mettre à jour la galerie
        loadGallery();
        
        // Afficher notification
        showNotification('Jeu généré avec succès !', 'success');
        
        // Revenir à la section jeux
        document.querySelector('[href="#games"]').click();
    }

    // Fonction pour jouer un jeu
    function playGame(gameType, mode = 'classic', customData = null) {
        const modal = document.getElementById('gameModal');
        const modalTitle = document.getElementById('modalTitle');
        const gameContainer = document.getElementById('gameContainer');
        
        // Préparer le conteneur de jeu
        gameContainer.innerHTML = `
            <div class="game-loader">
                <div class="loader"></div>
                <p>Chargement du jeu...</p>
            </div>
        `;
        
        // Afficher la modal
        modalTitle.textContent = `${getGameName(gameType)} - ${mode === 'custom' ? 'Personnalisé' : 'Classique'}`;
        modal.classList.add('active');
        
        // Charger le jeu après un petit délai
        setTimeout(() => {
            switch(gameType) {
                case 'tictactoe':
                    loadTicTacToe(gameContainer, mode, customData);
                    break;
                case 'snake':
                    // Le jeu Snake sera chargé depuis snake.js
                    if (typeof loadSnakeGame === 'function') {
                        loadSnakeGame(gameContainer, mode, customData);
                    } else {
                        loadSnake(gameContainer, mode, customData);
                    }
                    break;
                case 'wordsearch':
                    loadWordSearch(gameContainer, mode, customData);
                    break;
                case 'truthordare':
                    loadTruthOrDare(gameContainer, mode, customData);
                    break;
                case 'math':
                    loadMathGame(gameContainer, mode, customData);
                    break;
                case 'pong':
                    loadPong(gameContainer, mode, customData);
                    break;
                case 'rps':
                    loadRPS(gameContainer, mode, customData);
                    break;
                case 'quiz':
                    loadQuiz(gameContainer, mode, customData);
                    break;
                default:
                    gameContainer.innerHTML = '<p>Jeu non disponible</p>';
                    break;
            }
        }, 500);
    }

    function getGameName(gameType) {
        const names = {
            tictactoe: 'Tic Tac Toe',
            snake: 'Jeu du Serpent',
            wordsearch: 'Mots Mêlés',
            truthordare: 'Action ou Vérité',
            math: 'Calcul Mental',
            pong: 'Ping Pong',
            rps: 'Pierre-Papier-Ciseaux',
            quiz: 'Quiz Général'
        };
        return names[gameType] || 'Jeu';
    }

    // Initialisation de la modal
    function initModal() {
        const modal = document.getElementById('gameModal');
        const closeBtn = document.querySelector('.close-modal');
        const resetBtn = document.getElementById('resetGame');
        const saveBtn = document.getElementById('saveGame');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        resetBtn.addEventListener('click', () => {
            // Réinitialiser le jeu actuel
            if (currentGame) {
                const modalTitle = document.getElementById('modalTitle');
                const mode = modalTitle.textContent.includes('Personnalisé') ? 'custom' : 'classic';
                playGame(currentGame, mode);
            }
        });

        saveBtn.addEventListener('click', () => {
            // Sauvegarder le jeu actuel
            const modalTitle = document.getElementById('modalTitle');
            const gameData = {
                id: Date.now(),
                name: modalTitle.textContent,
                type: currentGame,
                data: {},
                createdAt: new Date().toISOString(),
                plays: 0
            };
            
            savedGames.push(gameData);
            localStorage.setItem('gameforge_games', JSON.stringify(savedGames));
            loadGallery();
            showNotification('Jeu sauvegardé dans la galerie !', 'success');
        });
    }

    // Charger la galerie
    function loadGallery() {
        const galleryContainer = document.getElementById('gamesGallery');
        
        if (!galleryContainer) return;
        
        if (savedGames.length === 0) {
            galleryContainer.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-gamepad"></i>
                    <h3>Aucun jeu créé</h3>
                    <p>Créez votre premier jeu personnalisé !</p>
                </div>
            `;
            return;
        }
        
        galleryContainer.innerHTML = savedGames.map(game => `
            <div class="gallery-item" data-game-id="${game.id}">
                <div class="gallery-item-header">
                    <h4>${game.name}</h4>
                    <span class="game-type">${getGameName(game.type)}</span>
                </div>
                <div class="gallery-item-body">
                    <p><i class="fas fa-calendar"></i> ${new Date(game.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p><i class="fas fa-play"></i> ${game.plays || 0} parties</p>
                    <div class="gallery-item-actions">
                        <button class="btn-play-small" onclick="playSavedGame(${game.id})">
                            <i class="fas fa-play"></i> Jouer
                        </button>
                        <button class="btn-delete" onclick="deleteGame(${game.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Fonctions globales pour la galerie
    window.playSavedGame = function(gameId) {
        const game = savedGames.find(g => g.id === gameId);
        if (game) {
            game.plays = (game.plays || 0) + 1;
            localStorage.setItem('gameforge_games', JSON.stringify(savedGames));
            playGame(game.type, 'custom', game);
        }
    };

    window.deleteGame = function(gameId) {
        if (confirm('Supprimer ce jeu ?')) {
            savedGames = savedGames.filter(g => g.id !== gameId);
            localStorage.setItem('gameforge_games', JSON.stringify(savedGames));
            loadGallery();
            showNotification('Jeu supprimé', 'info');
        }
    };

    // Notification
    function showNotification(message, type = 'info') {
        // Supprimer les notifications existantes
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Fonctions de chargement des jeux (fallback si les fichiers externes ne sont pas chargés)
    function loadTicTacToe(container, mode, customData) {
        container.innerHTML = `
            <div class="game-interface">
                <h3>Tic Tac Toe ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                <div class="game-board" id="tictactoe-board">
                    ${Array(9).fill().map((_, i) => `<div class="cell" data-cell="${i}"></div>`).join('')}
                </div>
                <div class="game-info">
                    <p>Tour: <span id="current-player">X</span></p>
                    <p>Mode: ${mode}</p>
                    ${customData ? `<p>Règles: ${customData.data.rules.type}</p>` : ''}
                </div>
            </div>
        `;
        
        // Logique simple du jeu
        const cells = container.querySelectorAll('.cell');
        let currentPlayer = 'X';
        
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                if (!cell.textContent) {
                    cell.textContent = currentPlayer;
                    cell.classList.add(currentPlayer.toLowerCase());
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    container.querySelector('#current-player').textContent = currentPlayer;
                    
                    // Vérifier la victoire
                    checkTicTacToeWin(container);
                }
            });
        });
        
        function checkTicTacToeWin(container) {
            const cells = container.querySelectorAll('.cell');
            const winningCombinations = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
                [0, 4, 8], [2, 4, 6] // Diagonales
            ];
            
            for (const combo of winningCombinations) {
                const [a, b, c] = combo;
                if (cells[a].textContent && 
                    cells[a].textContent === cells[b].textContent && 
                    cells[a].textContent === cells[c].textContent) {
                    
                    showNotification(`Le joueur ${cells[a].textContent} gagne!`, 'success');
                    return;
                }
            }
            
            // Vérifier match nul
            const allFilled = Array.from(cells).every(cell => cell.textContent);
            if (allFilled) {
                showNotification('Match nul!', 'info');
            }
        }
    }

    function loadSnake(container, mode, customData) {
        container.innerHTML = `
            <div class="game-interface">
                <h3>Jeu du Serpent ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                <canvas id="snake-canvas" width="400" height="400"></canvas>
                <div class="game-controls">
                    <p>Score: <span id="snake-score">0</span></p>
                    <p>Mode: ${mode}</p>
                    ${customData ? `<p>Difficulté: ${customData.data.mechanics.difficulty}</p>` : ''}
                </div>
            </div>
        `;
    }

    function loadWordSearch(container, mode, customData) {
        container.innerHTML = `
            <div class="game-interface">
                <h3>Mots Mêlés ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                <div class="wordsearch-grid" id="wordsearch-grid">
                    ${Array(100).fill().map((_, i) => 
                        `<div class="wordsearch-cell" data-cell="${i}">${String.fromCharCode(65 + Math.floor(Math.random() * 26))}</div>`
                    ).join('')}
                </div>
                <div class="wordsearch-words">
                    <h4>Mots à trouver:</h4>
                    <ul>
                        <li>HTML</li>
                        <li>CSS</li>
                        <li>JAVASCRIPT</li>
                        <li>GAME</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function loadTruthOrDare(container, mode, customData) {
        const questions = [
            "Quel est ton plus grand secret?",
            "Quelle est la chose la plus embarrassante qui te soit arrivée?",
            "Si tu pouvais être invisible pendant une journée, que ferais-tu?",
            "As-tu déjà triché à un examen?",
            "Quelle est ta plus grande peur?"
        ];
        
        const dares = [
            "Fais 10 pompes",
            "Chante une chanson à haute voix",
            "Danse pendant 30 secondes",
            "Fais une imitation de quelqu'un",
            "Mange quelque chose sans utiliser tes mains"
        ];
        
        container.innerHTML = `
            <div class="game-interface">
                <h3>Action ou Vérité ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                <div class="truthordare-card">
                    <div class="card-content">
                        <h4 id="tod-question">Choisis: Vérité ou Action?</h4>
                    </div>
                    <div class="card-actions">
                        <button class="btn-primary" id="tod-truth">Vérité</button>
                        <button class="btn-secondary" id="tod-dare">Action</button>
                        <button class="btn-accent" id="tod-next">Suivant</button>
                    </div>
                </div>
                <div class="game-info">
                    <p>Mode: ${mode}</p>
                    ${customData ? `<p>Rounds: ${customData.data.rules.rounds}</p>` : ''}
                </div>
            </div>
        `;
        
        const questionEl = container.querySelector('#tod-question');
        const truthBtn = container.querySelector('#tod-truth');
        const dareBtn = container.querySelector('#tod-dare');
        const nextBtn = container.querySelector('#tod-next');
        
        truthBtn.addEventListener('click', () => {
            const randomQ = questions[Math.floor(Math.random() * questions.length)];
            questionEl.textContent = randomQ;
            showNotification('Vérité sélectionnée!', 'info');
        });
        
        dareBtn.addEventListener('click', () => {
            const randomD = dares[Math.floor(Math.random() * dares.length)];
            questionEl.textContent = randomD;
            showNotification('Action sélectionnée!', 'info');
        });
        
        nextBtn.addEventListener('click', () => {
            questionEl.textContent = 'Choisis: Vérité ou Action?';
        });
    }

    function loadMathGame(container, mode, customData) {
        container.innerHTML = `
            <div class="game-interface">
                <h3>Calcul Mental ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                <div class="math-problem">
                    <h2 id="math-equation">5 + 3 = ?</h2>
                    <input type="number" id="math-answer" placeholder="Votre réponse">
                    <button id="math-submit">Vérifier</button>
                </div>
                <div class="math-score">
                    <p>Score: <span id="math-score">0</span></p>
                    <p>Temps restant: <span id="math-time">60</span>s</p>
                </div>
            </div>
        `;
        
        // Logique du jeu de math
        let score = 0;
        let timeLeft = customData?.data?.mechanics?.timeLimit || 60;
        
        function generateProblem() {
            const operations = ['+', '-', '*', '/'];
            const op = operations[Math.floor(Math.random() * operations.length)];
            let num1, num2;
            
            switch(op) {
                case '+':
                    num1 = Math.floor(Math.random() * 100);
                    num2 = Math.floor(Math.random() * 100);
                    break;
                case '-':
                    num1 = Math.floor(Math.random() * 100);
                    num2 = Math.floor(Math.random() * num1);
                    break;
                case '*':
                    num1 = Math.floor(Math.random() * 12);
                    num2 = Math.floor(Math.random() * 12);
                    break;
                case '/':
                    num2 = Math.floor(Math.random() * 10) + 1;
                    num1 = num2 * Math.floor(Math.random() * 10);
                    break;
            }
            
            container.querySelector('#math-equation').textContent = `${num1} ${op} ${num2} = ?`;
            container.querySelector('#math-answer').dataset.correct = eval(`${num1} ${op} ${num2}`);
        }
        
        container.querySelector('#math-submit').addEventListener('click', () => {
            const answer = parseFloat(container.querySelector('#math-answer').value);
            const correct = parseFloat(container.querySelector('#math-answer').dataset.correct);
            
            if (answer === correct) {
                score += 10;
                container.querySelector('#math-score').textContent = score;
                showNotification('Bonne réponse ! +10 points', 'success');
            } else {
                showNotification('Mauvaise réponse', 'info');
            }
            
            container.querySelector('#math-answer').value = '';
            generateProblem();
        });
        
        generateProblem();
        
        // Timer
        const timer = setInterval(() => {
            timeLeft--;
            container.querySelector('#math-time').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                showNotification(`Temps écoulé ! Score final: ${score}`, 'info');
                container.querySelector('#math-submit').disabled = true;
            }
        }, 1000);
    }

    function loadPong(container, mode, customData) {
        container.innerHTML = `
            <div class="game-interface">
                <h3>Ping Pong ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                <canvas id="pong-canvas" width="600" height="400"></canvas>
                <div class="game-controls">
                    <p>Score Joueur: <span id="pong-player-score">0</span></p>
                    <p>Score IA: <span id="pong-ai-score">0</span></p>
                    <p>Mode: ${mode}</p>
                </div>
                <div class="game-instructions">
                    <p>Utilisez les flèches ↑↓ pour déplacer la raquette</p>
                </div>
            </div>
        `;
    }

    function loadRPS(container, mode, customData) {
        container.innerHTML = `
            <div class="game-interface">
                <h3>Pierre-Papier-Ciseaux ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="rps-scoreboard">
                    <div class="score-player">
                        <h4>Joueur</h4>
                        <div class="score" id="player-score">0</div>
                    </div>
                    <div class="score-vs">VS</div>
                    <div class="score-computer">
                        <h4>Ordinateur</h4>
                        <div class="score" id="computer-score">0</div>
                    </div>
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
                
                <div class="game-info">
                    <p>Mode: ${mode}</p>
                    <p>Manches: <span id="round-count">0</span>/<span id="total-rounds">${customData?.data?.rules?.rounds || 3}</span></p>
                </div>
                
                <div class="game-controls">
                    <button class="btn-primary" id="rps-reset">
                        <i class="fas fa-redo"></i> Recommencer
                    </button>
                </div>
            </div>
        `;
        
        // Initialiser le jeu RPS
        let playerScore = 0;
        let computerScore = 0;
        let round = 0;
        const totalRounds = customData?.data?.rules?.rounds || 3;
        
        const choices = ['rock', 'paper', 'scissors'];
        const results = {
            rock: { beats: 'scissors', loses: 'paper' },
            paper: { beats: 'rock', loses: 'scissors' },
            scissors: { beats: 'paper', loses: 'rock' }
        };
        
        const icons = {
            rock: 'fas fa-hand-rock',
            paper: 'fas fa-hand-paper',
            scissors: 'fas fa-hand-scissors'
        };
        
        // Mettre à jour l'affichage
        container.querySelector('#total-rounds').textContent = totalRounds;
        
        // Écouteurs d'événements pour les choix
        container.querySelectorAll('.rps-choice').forEach(choice => {
            choice.addEventListener('click', () => {
                if (round >= totalRounds) return;
                
                const playerChoice = choice.dataset.choice;
                const computerChoice = choices[Math.floor(Math.random() * 3)];
                
                // Mettre à jour l'affichage des choix
                container.querySelector('#player-choice').innerHTML = `<i class="${icons[playerChoice]}"></i>`;
                container.querySelector('#computer-choice').innerHTML = `<i class="${icons[computerChoice]}"></i>`;
                
                // Déterminer le gagnant
                let result = '';
                if (playerChoice === computerChoice) {
                    result = 'Égalité !';
                } else if (results[playerChoice].beats === computerChoice) {
                    result = 'Vous gagnez !';
                    playerScore++;
                    container.querySelector('#player-score').textContent = playerScore;
                } else {
                    result = 'L\'ordinateur gagne !';
                    computerScore++;
                    container.querySelector('#computer-score').textContent = computerScore;
                }
                
                container.querySelector('#result-text').textContent = result;
                round++;
                container.querySelector('#round-count').textContent = round;
                
                // Vérifier la fin du jeu
                if (round >= totalRounds) {
                    let finalMessage = '';
                    if (playerScore > computerScore) {
                        finalMessage = `🎉 Vous gagnez ${playerScore} à ${computerScore} !`;
                    } else if (computerScore > playerScore) {
                        finalMessage = `😢 L'ordinateur gagne ${computerScore} à ${playerScore} !`;
                    } else {
                        finalMessage = '🤝 Match nul !';
                    }
                    
                    setTimeout(() => {
                        container.querySelector('#result-text').textContent = finalMessage;
                        showNotification('Partie terminée!', 'info');
                    }, 1000);
                }
            });
        });
        
        // Bouton de réinitialisation
        container.querySelector('#rps-reset').addEventListener('click', () => {
            playerScore = 0;
            computerScore = 0;
            round = 0;
            
            container.querySelector('#player-score').textContent = '0';
            container.querySelector('#computer-score').textContent = '0';
            container.querySelector('#round-count').textContent = '0';
            
            container.querySelector('#player-choice').innerHTML = '<i class="fas fa-question"></i>';
            container.querySelector('#computer-choice').innerHTML = '<i class="fas fa-question"></i>';
            container.querySelector('#result-text').textContent = 'Faites votre choix !';
        });
    }

    function loadQuiz(container, mode, customData) {
        const questions = [
            {
                question: "Quelle est la capitale de la France ?",
                options: ["Londres", "Berlin", "Paris", "Madrid"],
                correct: 2,
                category: "Géographie"
            },
            {
                question: "Combien de planètes comporte notre système solaire ?",
                options: ["7", "8", "9", "10"],
                correct: 1,
                category: "Science"
            },
            {
                question: "Qui a peint la Mona Lisa ?",
                options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Rembrandt"],
                correct: 2,
                category: "Art"
            }
        ];
        
        container.innerHTML = `
            <div class="game-interface">
                <h3>Quiz ${mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="quiz-progress" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        Question <span id="current-question">1</span>/<span id="total-questions">${questions.length}</span>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h3 id="question-text">${questions[0].question}</h3>
                </div>
                
                <div class="quiz-options" id="quiz-options">
                    ${questions[0].options.map((option, index) => `
                        <div class="quiz-option" data-answer="${index}">
                            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                            <span>${option}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="quiz-score">
                    <div class="score-display">
                        <div class="score-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Correctes: <span id="correct-count">0</span></span>
                        </div>
                        <div class="score-item">
                            <i class="fas fa-times-circle"></i>
                            <span>Incorrectes: <span id="incorrect-count">0</span></span>
                        </div>
                        <div class="score-item">
                            <i class="fas fa-star"></i>
                            <span>Score: <span id="quiz-score">0</span></span>
                        </div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn-primary" id="quiz-next">
                        <i class="fas fa-arrow-right"></i> Suivant
                    </button>
                </div>
            </div>
        `;
        
        // Logique du quiz
        let currentQuestionIndex = 0;
        let score = 0;
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let selectedAnswer = null;
        
        function updateProgress() {
            const progress = ((currentQuestionIndex) / questions.length) * 100;
            container.querySelector('#quiz-progress').style.width = `${progress}%`;
            container.querySelector('#current-question').textContent = currentQuestionIndex + 1;
        }
        
        function loadQuestion() {
            const question = questions[currentQuestionIndex];
            container.querySelector('#question-text').textContent = question.question;
            
            const optionsContainer = container.querySelector('#quiz-options');
            optionsContainer.innerHTML = question.options.map((option, index) => `
                <div class="quiz-option" data-answer="${index}">
                    <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                    <span>${option}</span>
                </div>
            `).join('');
            
            // Réinitialiser la sélection
            selectedAnswer = null;
            container.querySelectorAll('.quiz-option').forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect');
                option.addEventListener('click', handleAnswerClick);
            });
            
            updateProgress();
        }
        
        function handleAnswerClick(e) {
            if (selectedAnswer !== null) return;
            
            const option = e.currentTarget;
            const answerIndex = parseInt(option.dataset.answer);
            const question = questions[currentQuestionIndex];
            
            selectedAnswer = answerIndex;
            
            // Marquer toutes les options
            container.querySelectorAll('.quiz-option').forEach((opt, index) => {
                if (index === question.correct) {
                    opt.classList.add('correct');
                } else if (index === answerIndex && index !== question.correct) {
                    opt.classList.add('incorrect');
                }
                opt.classList.add('selected');
            });
            
            // Mettre à jour le score
            if (answerIndex === question.correct) {
                score += 10;
                correctAnswers++;
                showNotification('Bonne réponse! +10 points', 'success');
            } else {
                incorrectAnswers++;
                showNotification('Mauvaise réponse!', 'info');
            }
            
            container.querySelector('#quiz-score').textContent = score;
            container.querySelector('#correct-count').textContent = correctAnswers;
            container.querySelector('#incorrect-count').textContent = incorrectAnswers;
        }
        
        // Bouton suivant
        container.querySelector('#quiz-next').addEventListener('click', () => {
            if (selectedAnswer === null && currentQuestionIndex > 0) {
                showNotification('Veuillez sélectionner une réponse!', 'error');
                return;
            }
            
            currentQuestionIndex++;
            
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                // Fin du quiz
                container.innerHTML = `
                    <div class="game-interface">
                        <h3>Quiz Terminé !</h3>
                        <div class="quiz-result">
                            <h2>Score Final: ${score} points</h2>
                            <p>Réponses correctes: ${correctAnswers}/${questions.length}</p>
                            <p>Réponses incorrectes: ${incorrectAnswers}</p>
                            <button class="btn-primary" id="quiz-restart">
                                <i class="fas fa-redo"></i> Recommencer
                            </button>
                        </div>
                    </div>
                `;
                
                container.querySelector('#quiz-restart').addEventListener('click', () => {
                    currentQuestionIndex = 0;
                    score = 0;
                    correctAnswers = 0;
                    incorrectAnswers = 0;
                    loadQuiz(container, mode, customData);
                });
            }
        });
        
        // Initialiser le premier chargement
        loadQuestion();
    }
});

// Ajout des styles pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: white;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        max-width: 400px;
    }
    
    .notification-success {
        background: linear-gradient(45deg, #4CAF50, #45a049);
    }
    
    .notification-info {
        background: linear-gradient(45deg, #2196F3, #1976D2);
    }
    
    .notification-error {
        background: linear-gradient(45deg, #FF5252, #FF4081);
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.3s ease;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .notification button:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);