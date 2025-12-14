// Word Search Game Implementation
class WordSearchGame {
    constructor(container, mode, customData) {
        this.container = container;
        this.mode = mode;
        this.customData = customData;
        
        this.gridSize = 10;
        this.words = ['HTML', 'CSS', 'JAVASCRIPT', 'GAME', 'CODE', 'WEB', 'APP'];
        this.foundWords = [];
        this.selectedCells = [];
        this.grid = [];
        
        if (mode === 'custom' && customData) {
            this.applyCustomization(customData.data);
        }
        
        this.init();
    }
    
    applyCustomization(data) {
        // Règles personnalisées
        if (data.rules.customRules) {
            const rules = data.rules.customRules.toUpperCase();
            // Extraire des mots des règles
            const customWords = rules.match(/[A-Z]{3,}/g);
            if (customWords) {
                this.words = [...new Set([...this.words, ...customWords])].slice(0, 7);
            }
        }
        
        // Nombre de rounds
        if (data.rules.rounds) {
            this.maxWords = data.rules.rounds;
        }
        
        // Difficulté
        switch(data.mechanics.difficulty) {
            case 'easy':
                this.gridSize = 8;
                break;
            case 'medium':
                this.gridSize = 10;
                break;
            case 'hard':
                this.gridSize = 12;
                break;
            case 'extreme':
                this.gridSize = 15;
                break;
        }
    }
    
    init() {
        this.generateGrid();
        this.render();
        this.setupEventListeners();
    }
    
    generateGrid() {
        // Initialiser la grille vide
        this.grid = Array(this.gridSize).fill().map(() => 
            Array(this.gridSize).fill().map(() => ({
                letter: '',
                isWord: false,
                wordIndex: -1
            }))
        );
        
        // Placer les mots
        this.words.forEach((word, wordIndex) => {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                attempts++;
                
                // Direction aléatoire
                const directions = [
                    { dx: 1, dy: 0 },   // Horizontal
                    { dx: 0, dy: 1 },   // Vertical
                    { dx: 1, dy: 1 },   // Diagonal
                    { dx: 1, dy: -1 }   // Anti-diagonal
                ];
                
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const wordLength = word.length;
                
                // Position de départ aléatoire
                let startX = Math.floor(Math.random() * this.gridSize);
                let startY = Math.floor(Math.random() * this.gridSize);
                
                // Ajuster la position de départ pour que le mot tienne
                if (direction.dx === 1) {
                    startX = Math.min(startX, this.gridSize - wordLength);
                }
                if (direction.dy === 1) {
                    startY = Math.min(startY, this.gridSize - wordLength);
                }
                if (direction.dy === -1) {
                    startY = Math.max(wordLength - 1, Math.min(startY, this.gridSize - 1));
                }
                
                // Vérifier si on peut placer le mot
                let canPlace = true;
                for (let i = 0; i < wordLength; i++) {
                    const x = startX + i * direction.dx;
                    const y = startY + i * direction.dy;
                    const cell = this.grid[y][x];
                    
                    if (cell.letter !== '' && cell.letter !== word[i]) {
                        canPlace = false;
                        break;
                    }
                }
                
                // Placer le mot
                if (canPlace) {
                    for (let i = 0; i < wordLength; i++) {
                        const x = startX + i * direction.dx;
                        const y = startY + i * direction.dy;
                        this.grid[y][x] = {
                            letter: word[i],
                            isWord: true,
                            wordIndex: wordIndex
                        };
                    }
                    placed = true;
                }
            }
        });
        
        // Remplir les cellules vides avec des lettres aléatoires
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x].letter) {
                    this.grid[y][x] = {
                        letter: alphabet[Math.floor(Math.random() * alphabet.length)],
                        isWord: false,
                        wordIndex: -1
                    };
                }
            }
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-interface">
                <h3>Mots Mêlés ${this.mode === 'custom' ? 'Personnalisé' : 'Classique'}</h3>
                
                <div class="wordsearch-grid" id="wordsearch-grid">
                    ${this.grid.map((row, y) => 
                        row.map((cell, x) => `
                            <div class="wordsearch-cell" 
                                 data-x="${x}" 
                                 data-y="${y}"
                                 data-word="${cell.wordIndex}">
                                ${cell.letter}
                            </div>
                        `).join('')
                    ).join('')}
                </div>
                
                <div class="wordsearch-controls">
                    <div class="words-list">
                        <h4>Mots à trouver:</h4>
                        <ul id="words-to-find">
                            ${this.words.map((word, index) => `
                                <li class="${this.foundWords.includes(index) ? 'found' : ''}" 
                                    data-word-index="${index}">
                                    ${word}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="game-info">
                        <p>Trouvés: <span id="found-count">${this.foundWords.length}</span>/${this.words.length}</p>
                        <p>Mode: ${this.mode}</p>
                    </div>
                    
                    <div class="game-actions">
                        <button class="btn-secondary" id="clear-selection">
                            <i class="fas fa-eraser"></i> Effacer
                        </button>
                        <button class="btn-primary" id="check-word">
                            <i class="fas fa-check"></i> Vérifier
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        const grid = this.container.querySelector('#wordsearch-grid');
        const cells = grid.querySelectorAll('.wordsearch-cell');
        
        let isSelecting = false;
        
        cells.forEach(cell => {
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isSelecting = true;
                this.clearSelection();
                this.selectCell(cell);
            });
            
            cell.addEventListener('mouseenter', () => {
                if (isSelecting) {
                    this.selectCell(cell);
                }
            });
            
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isSelecting = true;
                this.clearSelection();
                this.selectCell(cell);
            });
            
            cell.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (isSelecting) {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.classList.contains('wordsearch-cell')) {
                        this.selectCell(element);
                    }
                }
            });
        });
        
        document.addEventListener('mouseup', () => {
            isSelecting = false;
            this.checkSelectedWord();
        });
        
        document.addEventListener('touchend', () => {
            isSelecting = false;
            this.checkSelectedWord();
        });
        
        // Boutons
        this.container.querySelector('#clear-selection').addEventListener('click', () => {
            this.clearSelection();
        });
        
        this.container.querySelector('#check-word').addEventListener('click', () => {
            this.checkSelectedWord();
        });
    }
    
    selectCell(cell) {
        if (!cell.classList.contains('selected')) {
            cell.classList.add('selected');
            this.selectedCells.push(cell);
        }
    }
    
    clearSelection() {
        this.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selectedCells = [];
    }
    
    checkSelectedWord() {
        if (this.selectedCells.length < 3) {
            this.clearSelection();
            return;
        }
        
        // Récupérer le texte des cellules sélectionnées
        const selectedWord = this.selectedCells.map(cell => cell.textContent).join('');
        
        // Vérifier dans les deux sens
        const reversedWord = selectedWord.split('').reverse().join('');
        
        let foundWordIndex = -1;
        
        // Rechercher le mot dans la liste
        this.words.forEach((word, index) => {
            if (selectedWord === word || reversedWord === word) {
                foundWordIndex = index;
            }
        });
        
        if (foundWordIndex !== -1 && !this.foundWords.includes(foundWordIndex)) {
            // Mot trouvé!
            this.foundWords.push(foundWordIndex);
            
            // Marquer les cellules comme trouvées
            this.selectedCells.forEach(cell => {
                cell.classList.add('found');
                cell.classList.remove('selected');
            });
            
            // Mettre à jour la liste des mots
            const wordItem = this.container.querySelector(`[data-word-index="${foundWordIndex}"]`);
            if (wordItem) {
                wordItem.classList.add('found');
            }
            
            // Mettre à jour le compteur
            this.container.querySelector('#found-count').textContent = this.foundWords.length;
            
            // Notification
            showNotification(`Mot trouvé: ${this.words[foundWordIndex]}!`, 'success');
            
            // Vérifier si tous les mots sont trouvés
            if (this.foundWords.length === this.words.length) {
                setTimeout(() => {
                    this.gameComplete();
                }, 1000);
            }
        } else {
            // Mauvais mot
            showNotification('Ce mot n\'existe pas dans la grille!', 'error');
            this.clearSelection();
        }
    }
    
    gameComplete() {
        this.container.innerHTML += `
            <div class="game-complete">
                <h2>🎉 Félicitations !</h2>
                <p>Vous avez trouvé tous les mots !</p>
                <button class="btn-primary" id="play-again">
                    <i class="fas fa-redo"></i> Rejouer
                </button>
            </div>
        `;
        
        this.container.querySelector('#play-again').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    restartGame() {
        this.foundWords = [];
        this.selectedCells = [];
        this.generateGrid();
        this.render();
        this.setupEventListeners();
    }
}

// Fonction globale pour charger le jeu
function loadWordSearchGame(container, mode, customData) {
    new WordSearchGame(container, mode, customData);
}