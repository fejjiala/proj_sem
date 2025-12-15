// Variables pour le jeu Mots Mêlés
let motsMelees = {
    grid: [],
    words: [],
    foundWords: [],
    selectedCells: []
};

// Initialiser le jeu Mots Mêlés
window.initializeMotsMelees = function() {
    const rules = window.gameRules.mots;
    
    // Préparer les mots
    const mots = rules.mots.split(',').map(mot => mot.trim().toUpperCase()).filter(mot => mot.length > 0);
    
    if (mots.length === 0) {
        alert("Veuillez entrer au moins un mot dans la liste des mots.");
        return;
    }
    
    motsMelees.words = mots;
    motsMelees.foundWords = [];
    motsMelees.selectedCells = [];
    
    document.getElementById('mots-trouves').textContent = '0';
    document.getElementById('mots-total').textContent = mots.length;
    document.getElementById('resultat-mots').textContent = '';
    
    // Générer la grille
    generateWordSearchGrid();
    
    // Afficher la liste des mots
    displayWordList();
}

function generateWordSearchGrid() {
    const gridSize = window.gameRules.mots.gridSize;
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
    const gridSize = window.gameRules.mots.gridSize;
    
    for (let mot of motsMelees.words) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
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
    const gridSize = window.gameRules.mots.gridSize;
    
    for (let i = 0; i < mot.length; i++) {
        let r = row, c = col;
        
        switch(direction) {
            case 0: c = col + i; break; // horizontal
            case 1: r = row + i; break; // vertical
            case 2: r = row + i; c = col + i; break; // diagonal
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
    const gridSize = window.gameRules.mots.gridSize;
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
    const gridSize = window.gameRules.mots.gridSize;
    
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
    if (window.currentGameType !== 'mots') return;
    
    const cell = document.querySelector(`.word-cell[data-row="${row}"][data-col="${col}"]`);
    
    // Pour simplifier, on vérifie si la cellule fait partie d'un mot
    checkWordAtPosition(row, col);
    
    // Marquer la cellule comme sélectionnée
    cell.classList.add('selected');
}

function checkWordAtPosition(row, col) {
    const gridSize = window.gameRules.mots.gridSize;
    
    for (let mot of motsMelees.words) {
        if (motsMelees.foundWords.includes(mot)) continue;
        
        // Vérifier dans toutes les directions
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
    const gridSize = window.gameRules.mots.gridSize;
    
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
    
    // Mettre à jour la liste des mots
    const wordItems = document.querySelectorAll('.word-item');
    wordItems.forEach(item => {
        if (motsMelees.foundWords.includes(item.textContent)) {
            item.classList.add('found');
            item.style.textDecoration = 'line-through';
            item.style.color = '#4CAF50';
        }
    });
    
    // Vérifier si tous les mots sont trouvés
    if (motsMelees.foundWords.length === motsMelees.words.length) {
        document.getElementById('resultat-mots').textContent = `🎉 ${window.gameRules.mots.victoire}`;
    }
}