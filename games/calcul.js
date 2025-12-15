// Variables pour le jeu Calcul Mental
let calculMental = {
    currentQuestion: {},
    score: 0,
    count: 0,
    timer: null,
    timeLeft: 10
};

// Initialiser le jeu Calcul Mental
window.initializeCalcul = function() {
    const rules = window.gameRules.calcul;
    
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
    
    // Activer le bouton valider
    document.getElementById('btn-valider-calcul').addEventListener('click', validateCalculAnswer);
    document.getElementById('calcul-reponse').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateCalculAnswer();
        }
    });
}

function generateCalculQuestion() {
    const rules = window.gameRules.calcul;
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
        default: // expert - mélange
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
            } else { // division
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
    calculMental.timeLeft = window.gameRules.calcul.timePerQuestion || 10;
    document.getElementById('timer-progress').style.width = '100%';
    document.getElementById('calcul-timer').textContent = calculMental.timeLeft;
    
    calculMental.timer = setInterval(() => {
        calculMental.timeLeft--;
        const progress = (calculMental.timeLeft / (window.gameRules.calcul.timePerQuestion || 10)) * 100;
        document.getElementById('timer-progress').style.width = progress + '%';
        document.getElementById('calcul-timer').textContent = calculMental.timeLeft;
        
        if (calculMental.timeLeft <= 0) {
            clearInterval(calculMental.timer);
            calculMental.count++;
            document.getElementById('calcul-count').textContent = calculMental.count;
            
            if (calculMental.count >= window.gameRules.calcul.manches) {
                endCalculGame();
            } else {
                generateCalculQuestion();
                startCalculTimer();
            }
        }
    }, 1000);
}

function validateCalculAnswer() {
    if (window.currentGameType !== 'calcul') return;
    
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
        document.getElementById('calcul-score').textContent = calculMental.score;
        document.getElementById('resultat-calcul').textContent = "✅ Bonne réponse!";
        document.getElementById('resultat-calcul').style.color = '#4CAF50';
    } else {
        document.getElementById('resultat-calcul').textContent = `❌ Mauvaise réponse! La réponse était ${correctAnswer}`;
        document.getElementById('resultat-calcul').style.color = '#FF6B6B';
    }
    
    calculMental.count++;
    document.getElementById('calcul-count').textContent = calculMental.count;
    
    if (calculMental.count >= window.gameRules.calcul.manches) {
        setTimeout(endCalculGame, 1500);
    } else {
        setTimeout(() => {
            generateCalculQuestion();
            startCalculTimer();
        }, 1500);
    }
}

function endCalculGame() {
    const rules = window.gameRules.calcul;
    let message = `Jeu terminé! Score: ${calculMental.score}/${rules.manches}`;
    
    if (calculMental.score >= Math.ceil(rules.manches * 0.8)) {
        message += ` 🎉 ${rules.victoire}`;
    } else {
        message += ` 💥 ${rules.defaite} - ${rules.punition}`;
    }
    
    document.getElementById('resultat-calcul').textContent = message;
    document.getElementById('calcul-reponse').disabled = true;
    document.getElementById('btn-valider-calcul').disabled = true;
}