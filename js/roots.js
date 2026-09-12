const rootsCore = window.RootsCore;
const rootsUi = window.ChallengeUI;

let rootsGameState = {
    currentQuestion: 0,
    correctAnswers: 0,
    questions: [],
    selectedOption: null,
    currentStreak: 0,
    bestStreak: 0,
    combo: 1,
    level: 1,
    specialLevelUnlocked: false
};

function processRootFree() {
    const index = Number(document.getElementById('rootIndexInput').value);
    const radicand = Number(document.getElementById('rootRadicandInput').value);
    const result = rootsCore.evaluateFree(index, radicand);
    const resultBox = document.getElementById('rootFreeResult');

    resultBox.classList.remove('root-error');
    if (result.error) {
        resultBox.classList.add('root-error');
            resultBox.innerHTML = `<strong>Revisa los datos</strong><br>${MathDisplay.format(result.error)}`;
        return;
    }

    resultBox.innerHTML = `
        <strong>${MathDisplay.format(`${rootsCore.rootText(index, radicand)} = ${result.display}`)}</strong>
        <p>${MathDisplay.format(result.definition.text)}</p>
        <span>${MathDisplay.format(result.definition.example)}</span>
    `;
}

function startRootsGame() {
    const saved = window.AppStorage.getProgress();
    rootsGameState = {
        currentQuestion: 0,
        correctAnswers: 0,
        questions: rootsCore.generateQuestions(saved.rootsLevel || 1),
        selectedOption: null,
        currentStreak: 0,
        bestStreak: 0,
        combo: 1,
        level: saved.rootsLevel || 1,
        specialLevelUnlocked: false
    };

    document.getElementById('rootsGameStart').style.display = 'none';
    document.getElementById('rootsGamePlay').style.display = 'block';
    document.getElementById('rootsGameEnd').style.display = 'none';
    loadRootsQuestion();
}

function loadRootsQuestion() {
    if (rootsGameState.currentQuestion >= rootsGameState.questions.length) {
        endRootsGame();
        return;
    }

    const question = rootsGameState.questions[rootsGameState.currentQuestion];
    rootsGameState.selectedOption = null;
    document.getElementById('rootsQuestionNum').textContent = rootsGameState.currentQuestion + 1;
    document.getElementById('rootsScoreDisplay').textContent = rootsGameState.correctAnswers;
    document.getElementById('rootsPrompt').innerHTML = MathDisplay.format(question.prompt);
    rootsUi.updateChallengeHud(rootsGameState, 'roots');

    document.getElementById('rootsOptions').innerHTML = question.options.map((option, index) => `
        <button class="composition-option" onclick="selectRootOption(${index})">${MathDisplay.format(option.label)}</button>
    `).join('');
}

function selectRootOption(index) {
    rootsGameState.selectedOption = index;
    document.querySelectorAll('#rootsOptions .composition-option').forEach((button, buttonIndex) => {
        button.classList.toggle('selected', buttonIndex === index);
    });
}

function checkRootsAnswer() {
    const question = rootsGameState.questions[rootsGameState.currentQuestion];
    const selected = question.options[rootsGameState.selectedOption];

    if (!selected) {
        showRootValidationWarning();
        return;
    }

    const isCorrect = selected.correct;
    if (isCorrect) {
        rootsGameState.correctAnswers++;
        rootsUi.registerAnswerOutcome(rootsGameState, true, 'roots');
        rootsUi.playClickSound('add');
        rootsUi.triggerConfetti();
        showRootFeedback('✅', '¡Correcto!', question.explanation, question.answer);
    } else {
        rootsUi.registerAnswerOutcome(rootsGameState, false, 'roots');
        rootsUi.playClickSound('sub');
        showRootFeedback('❌', 'Incorrecto', question.explanation, `Respuesta correcta: ${question.answer}`);
    }
}

function showRootFeedback(icon, title, message, expression) {
    document.getElementById('feedbackIcon').textContent = icon;
    document.getElementById('feedbackTitle').textContent = title;
    document.getElementById('feedbackMessage').innerHTML = MathDisplay.format(message);
    const expressionElement = document.getElementById('feedbackExpression');
    expressionElement.innerHTML = MathDisplay.format(expression);
    expressionElement.style.display = expression ? 'block' : 'none';
    document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = closeRootsFeedback;
    document.getElementById('feedbackModal').style.display = 'flex';
}

function showRootValidationWarning() {
    document.getElementById('feedbackIcon').textContent = '⚠️';
    document.getElementById('feedbackTitle').textContent = 'Elige una opción';
    document.getElementById('feedbackMessage').textContent = 'Selecciona una respuesta antes de verificar.';
    document.getElementById('feedbackExpression').style.display = 'none';
    document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = closeRootValidationWarning;
    document.getElementById('feedbackModal').style.display = 'flex';
}

function closeRootValidationWarning() {
    document.getElementById('feedbackModal').style.display = 'none';
}

function closeRootsFeedback() {
    document.getElementById('feedbackModal').style.display = 'none';
    rootsGameState.currentQuestion++;
    loadRootsQuestion();
}

function cancelRootsGame() {
    document.getElementById('confirmModal').style.display = 'flex';
}

function endRootsGame() {
    document.getElementById('rootsGamePlay').style.display = 'none';
    document.getElementById('rootsGameEnd').style.display = 'block';
    document.getElementById('rootsFinalScore').textContent = rootsGameState.correctAnswers;
    const message = rootsGameState.correctAnswers >= 8
        ? '¡Excelente dominio de las raíces!'
        : rootsGameState.correctAnswers >= 5
            ? '¡Buen trabajo! Sigue practicando los procedimientos.'
            : 'Repasa las definiciones y vuelve a intentarlo.';
    document.getElementById('rootsFinalMessage').textContent = `${message} Nivel actual: ${rootsGameState.level}`;
}