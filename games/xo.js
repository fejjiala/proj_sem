// Variables pour le jeu XO
let currentPlayerXO = 'X';
let gameBoardXO = [];

// Initialiser le jeu XO
window.initializeXO = function() {
    const rules = window.gameRules.xo;
    const gridSize = rules.gridSize || 3;
    
    // Créer la grille
    createXOGrid(gridSize);
    
    gameBoardXO = Array(gridSize * gridSize).fill('');
    currentPlayerXO = 'X';
    window.gameActive = true;
    
    document.getElementById('joueur-actuel').textContent = currentPlayerXO;
    document.getElementById('manche-actuelle').textContent = window.currentRound;
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
    if (!window.gameActive || window.currentGameType !== 'xo') return;
    
    const index = parseInt(this.getAttribute('data-index'));
    const rules = window.gameRules.xo;
    
    if (gameBoardXO[index] !== '') return;
    
    gameBoardXO[index] = currentPlayerXO;
    this.textContent = currentPlayerXO;
    this.style.color = currentPlayerXO === 'X' ? '#FF6B6B' : '#4ECDC4';
    
    if (checkXOWinner()) {
        endXOGame(`🎉 Le joueur ${currentPlayerXO} a gagné!`, rules);
        return;
    }
    
    if (checkXODraw()) {
        endXOGame('🤝 Match nul!', rules);
        return;
    }
    
    currentPlayerXO = currentPlayerXO === 'X' ? 'O' : 'X';
    document.getElementById('joueur-actuel').textContent = currentPlayerXO;
    
    // Tour de l'ordinateur si mode contre ordinateur
    if (window.currentGameMode === 'computer' && currentPlayerXO === 'O') {
        setTimeout(computerMoveXO, 500);
    }
}

function computerMoveXO() {
    if (!window.gameActive) return;
    
    const emptyCells = gameBoardXO.map((cell, index) => cell === '' ? index : -1)
                               .filter(index => index !== -1);
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const cell = document.querySelector(`#xo-board .cell[data-index="${randomIndex}"]`);
        cell.click();
    }
}

function checkXOWinner() {
    const size = Math.sqrt(gameBoardXO.length);
    const winLength = window.gameRules.xo.winLength || 3;
    
    // Vérifier les lignes
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const first = gameBoardXO[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoardXO[row * size + col + i])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    // Vérifier les colonnes
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winLength; row++) {
            const first = gameBoardXO[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoardXO[(row + i) * size + col])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    // Vérifier les diagonales
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const first = gameBoardXO[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoardXO[(row + i) * size + col + i])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    // Vérifier les anti-diagonales
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = winLength - 1; col < size; col++) {
            const first = gameBoardXO[row * size + col];
            if (first !== '' && 
                Array.from({length: winLength}, (_, i) => gameBoardXO[(row + i) * size + col - i])
                     .every(cell => cell === first)) {
                return true;
            }
        }
    }
    
    return false;
}

function checkXODraw() {
    return gameBoardXO.every(cell => cell !== '');
}

function endXOGame(message, rules) {
    window.gameActive = false;
    
    const gameInfo = document.querySelector('#jeu-xo .game-info');
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    
    let punishmentText = '';
    if (message.includes('gagné') && message.includes('O')) {
        punishmentText = `<p class="punition">💥 Le perdant doit: ${rules.punition}</p>`;
    }
    
    resultDiv.innerHTML = `
        <h3>${message}</h3>
        ${punishmentText}
    `;
    
    gameInfo.appendChild(resultDiv);
    
    // Passer à la manche suivante ou terminer
    window.currentRound++;
    if (window.currentRound <= window.totalRounds) {
        setTimeout(() => {
            window.initializeXO();
        }, 3000);
    }
}