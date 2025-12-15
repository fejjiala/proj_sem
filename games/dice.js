// Variables pour le jeu de Dé
let diceScore = 0;

// Initialiser le jeu de Dé
window.initializeDice = function() {
    const rules = window.gameRules.dice;
    
    diceScore = 0;
    document.getElementById('score-dice').textContent = diceScore;
    document.getElementById('resultat-dice').textContent = `🎯 ${rules.victoire}`;
    
    // Activer le lancer de dé
    document.getElementById('btn-roll-dice').addEventListener('click', rollDice);
}

function rollDice() {
    if (window.currentGameType !== 'dice') return;
    
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
        const rules = window.gameRules.dice;
        if (diceScore >= 15) {
            document.getElementById('resultat-dice').textContent = 
               `🎉 Félicitations! ${rules.victoire}`;
            document.getElementById('btn-roll-dice').disabled = true;
        }
    }, 1000);
}