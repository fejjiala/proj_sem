// Variables pour le jeu Quiz
let quizScore = 0;
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

// Initialiser le jeu Quiz
window.initializeQuiz = function() {
    const rules = window.gameRules.quiz;
    
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
    if (window.currentGameType !== 'quiz') return;
    
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
    const rules = window.gameRules.quiz;
    let finalMessage = `Quiz terminé! Votre score: ${quizScore}/${quizQuestions.length}`;
    
    if (quizScore >= Math.ceil(quizQuestions.length / 2)) {
        finalMessage += ` 🎉 ${rules.victoire}`;
    } else {
        finalMessage += ` 💥 ${rules.defaite} - ${rules.punition}`;
    }
    
    document.getElementById('resultat-quiz').textContent = finalMessage;
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.removeEventListener('click', handleQuizClick);
    });
}