// Variables pour le jeu PFC
let playerScorePFC = 0;
let computerScorePFC = 0;

// Initialiser le jeu PFC
window.initializePFC = function() {
    const rules = window.gameRules.pfc;
    
    playerScorePFC = 0;
    computerScorePFC = 0;
    window.currentRound = 1;
    
    document.getElementById('score-joueur').textContent = playerScorePFC;
    document.getElementById('score-adversaire').textContent = computerScorePFC;
    document.getElementById('manche-actuelle-pfc').textContent = window.currentRound;
    document.getElementById('manches-total-pfc').textContent = rules.manches;
    document.getElementById('resultat-pfc').textContent = `🎯 ${rules.victoire}`;
    
    // Activer les choix
    document.querySelectorAll('.choice').forEach(c => {
        c.style.pointerEvents = 'auto';
        c.addEventListener('click', handlePFCClick);
    });
}

function handlePFCClick() {
    if (window.currentGameType !== 'pfc') return;
    
    const rules = window.gameRules.pfc;
    const playerChoice = this.getAttribute('data-choice');
    let adversaryChoice;
    
    if (window.currentGameMode === 'computer') {
        adversaryChoice = ['pierre', 'papier', 'ciseaux'][Math.floor(Math.random() * 3)];
    } else {
        // Mode 2 joueurs - pour simplifier, on utilise un choix aléatoire pour l'adversaire
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
        playerScorePFC++;
    } else {
        result = `${window.currentGameMode === 'computer' ? "L'ordinateur" : "L'adversaire"} gagne cette manche!`;
        computerScorePFC++;
    }
    
    document.getElementById('resultat-pfc').textContent = `Vous: ${playerChoice} | ${window.currentGameMode === 'computer' ? 'Ordinateur' : 'Adversaire'}: ${adversaryChoice} - ${result}`;
    document.getElementById('score-joueur').textContent = playerScorePFC;
    document.getElementById('score-adversaire').textContent = computerScorePFC;
    
    window.currentRound++;
    document.getElementById('manche-actuelle-pfc').textContent = window.currentRound;
    
    if (window.currentRound > rules.manches) {
        let finalResult = "Match nul!";
        if (playerScorePFC > computerScorePFC) {
            finalResult = `🎉 Félicitations, vous avez gagné le match! ${rules.victoire}`;
        } else if (computerScorePFC > playerScorePFC) {
            finalResult = `💥 ${window.currentGameMode === 'computer' ? "L'ordinateur" : "L'adversaire"} a gagné! ${rules.defaite} - Punition: ${rules.punition}`;
        }
        
        document.getElementById('resultat-pfc').textContent = finalResult;
        document.querySelectorAll('.choice').forEach(c => {
            c.style.pointerEvents = 'none';
            c.removeEventListener('click', handlePFCClick);
        });
    }
}