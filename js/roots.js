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

function getRootsHelpContext() {
    const question = rootsGameState.questions[rootsGameState.currentQuestion];
    if (!question) return null;

    const help = {
        exact: ['raíz exacta', 'Busca el número que elevado al índice produce el radicando.', 'Ejemplo: √25 = 5 porque 5² = 25.'],
        existence: ['existencia en los reales', 'Con índice par, un radicando negativo no tiene raíz real. Con índice impar, sí puede tenerla.', 'Ejemplo: √(-9) no es real, pero ∛(-8) = -2.'],
        simplify: ['simplificar raíces', 'Busca factores que sean cuadrados perfectos y extráelos fuera del radical.', 'Ejemplo: √72 = √(36 × 2) = 6√2.'],
        product: ['producto de raíces', 'Combina los radicandos bajo una sola raíz y simplifica el resultado.', 'Ejemplo: √2 · √8 = √16 = 4.'],
        quotient: ['cociente de raíces', 'Combina numerador y denominador bajo una raíz y simplifica la fracción.', 'Ejemplo: √12 / √3 = √4 = 2.'],
        nested: ['raíz de una raíz', 'Multiplica los índices para convertir raíces anidadas en una sola raíz.', 'Ejemplo: √(∛64) = √[6]64 = 2.'],
        power: ['raíz de una potencia', 'La raíz cuadrada principal de un cuadrado es su valor no negativo.', 'Ejemplo: √(6²) = 6.'],
        amplification: ['amplificación de radicales', 'Multiplica el índice por un factor y eleva el radicando por ese mismo factor para conservar el valor.', 'Ejemplo: √2 = √[6]8.'],
        likeRadicals: ['suma y resta de radicales semejantes', 'Solo se pueden combinar radicales con el mismo índice y el mismo radicando. Suma o resta sus coeficientes.', 'Ejemplo: 2√3 + 5√3 = 7√3.'],
        rationalize: ['racionalizar un denominador', 'Multiplica por la misma raíz arriba y abajo para eliminarla del denominador.', 'Ejemplo: 1/√3 = √3/3.'],
        conjugate: ['racionalizar con conjugado', 'Multiplica por el conjugado para aplicar diferencia de cuadrados.', 'Ejemplo: 1/(√2 + √3) se multiplica por (√3 - √2).'],
        applied: ['problema aplicado con raíces', 'Identifica la medida desconocida y usa la raíz inversa de la potencia o del área conocida.', 'Ejemplo: si el área de un cuadrado es 49 cm², su lado mide √49 = 7 cm.'],
        irrationalEquation: ['ecuación irracional', 'Aísla la raíz y eleva ambos lados al índice correspondiente. Comprueba la solución en la ecuación original.', 'Ejemplo: √x = 5 implica x = 5² = 25.']
    }[question.type];

    return help ? { title: `Ayuda: ${help[0]}`, message: help[1], example: help[2] } : null;
}

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
    const level = saved.rootsLevel || 1;
    const questions = rootsCore.generateQuestions(
        level,
        10,
        window.AppStorage.getRecentQuestions('roots')
    );
    rootsGameState = {
        currentQuestion: 0,
        correctAnswers: 0,
        questions,
        selectedOption: null,
        currentStreak: 0,
        bestStreak: 0,
        combo: 1,
        level,
        specialLevelUnlocked: false
    };

    document.getElementById('rootsGameStart').style.display = 'none';
    document.getElementById('rootsGamePlay').style.display = 'block';
    document.getElementById('rootsGameEnd').style.display = 'none';
    window.AppStorage.rememberQuestions('roots', questions.map(question => question.key), 12);
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
    if (rootsGameState.correctAnswers >= 7) {
        rootsGameState.level = Math.min(3, rootsGameState.level + 1);
        window.AppStorage.saveSnapshot('roots', rootsGameState);
    }

    const message = rootsGameState.correctAnswers >= 8
        ? '¡Excelente dominio de las raíces!'
        : rootsGameState.correctAnswers >= 5
            ? '¡Buen trabajo! Sigue practicando los procedimientos.'
            : 'Repasa las definiciones y vuelve a intentarlo.';
    document.getElementById('rootsFinalMessage').textContent = `${message} Nivel actual: ${rootsGameState.level}`;
}