// Variables pour le jeu Action ou Vérité
let actionVerite = {
    actions: [],
    verites: [],
    currentTour: 1,
    currentPlayerIndex: 0,
    players: ["Joueur 1", "Joueur 2"]
};

// Initialiser le jeu Action ou Vérité
window.initializeActionVerite = function() {
    const rules = window.gameRules.action;
    
    // Préparer les actions et vérités
    actionVerite.actions = rules.actions.split(',').map(a => a.trim()).filter(a => a.length > 0);
    actionVerite.verites = rules.verites.split(',').map(v => v.trim()).filter(v => v.length > 0);
    
    // Si pas assez d'actions/vérités, utiliser les valeurs par défaut
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
    
    // Activer les boutons
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
    
    // Si on revient au premier joueur, on passe au tour suivant
    if (actionVerite.currentPlayerIndex === 0) {
        actionVerite.currentTour++;
        document.getElementById('tour-action').textContent = actionVerite.currentTour;
        
        // Vérifier la fin du jeu
        if (actionVerite.currentTour > window.gameRules.action.manches) {
            document.getElementById('resultat-action').textContent = `🎉 ${window.gameRules.action.victoire}`;
            document.getElementById('btn-action').disabled = true;
            document.getElementById('btn-verite').disabled = true;
            document.getElementById('btn-next-player').disabled = true;
        }
    }
    
    // Réinitialiser la carte
    document.getElementById('card-content').innerHTML = '<p>Choisissez Action ou Vérité</p>';
}