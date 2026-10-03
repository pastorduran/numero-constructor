const factorizationCore = window.FactorizationCore;
const factorizationUi = window.ChallengeUI;

let factorizationRepresentationIndex = 0;
let factorizationExplanationStarted = false;
const factorizationRepresentations = ['concrete', 'pictorial', 'abstract'];

function processFactorizationFree() {
    const operation = document.getElementById('factorizationOperationSelect')?.value || 'commonFactor';
    const result = factorizationCore.evaluateExplorer(operation, {
        first: document.getElementById('factorizationCommonAInput')?.value,
        second: document.getElementById('factorizationCommonBInput')?.value,
        root: document.getElementById('factorizationPerfectRootInput')?.value,
        n: document.getElementById('factorizationTrialNInput')?.value,
        m: document.getElementById('factorizationTrialMInput')?.value
    });
    const resultBox = document.getElementById('factorizationFreeResult');

    resultBox.classList.remove('root-error');
    if (result.error) {
        resultBox.classList.add('root-error');
        resultBox.innerHTML = `<strong>Revisa los datos</strong><br>${MathDisplay.format(result.error)}`;
        return;
    }

    const representation = factorizationRepresentations[factorizationRepresentationIndex] || 'concrete';
    resultBox.innerHTML = renderFactorizationRepresentation(operation, representation, result);
    factorizationExplanationStarted = true;
    updateFactorizationStepButton();
}

function advanceFactorizationExplorer() {
    if (!factorizationExplanationStarted) {
        processFactorizationFree();
        return;
    }
    showNextFactorizationRepresentation();
}

function showNextFactorizationRepresentation() {
    factorizationRepresentationIndex = Math.min(factorizationRepresentations.length - 1, factorizationRepresentationIndex + 1);
    processFactorizationFree();
}

function updateFactorizationStepButton() {
    const button = document.getElementById('factorizationNextStepButton');
    if (!button) return;
    if (!factorizationExplanationStarted) {
        button.textContent = 'Comenzar explicación';
        button.onclick = advanceFactorizationExplorer;
        return;
    }
    const isLastStep = factorizationRepresentationIndex >= factorizationRepresentations.length - 1;
    button.textContent = isLastStep ? 'Reiniciar explicación' : 'Ver siguiente paso';
    button.onclick = isLastStep ? resetFactorizationRepresentation : showNextFactorizationRepresentation;
}

function resetFactorizationRepresentation() {
    factorizationRepresentationIndex = 0;
    factorizationExplanationStarted = false;
    document.getElementById('factorizationFreeResult').textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    updateFactorizationStepButton();
}

function renderFactorizationRepresentation(operation, representation, result) {
    const abstract = `<strong>${MathDisplay.format(result.display || '')}</strong><ol class="root-concept-steps root-result-steps">${(result.steps || []).map((step, index) => `<li><span>${index + 1}</span>${MathDisplay.format(step)}</li>`).join('')}</ol>`;
    if (representation === 'abstract') return abstract;

    if (operation === 'commonFactor') {
        const a = Number(document.getElementById('factorizationCommonAInput').value);
        const b = Number(document.getElementById('factorizationCommonBInput').value);
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Agrupa lo que comparten</strong><p>Tienes ${a}x y ${b}y. Ambos números se dividen por el mismo factor.</p><div class="root-groups"><span>${a}x</span><span>+</span><span>${b}y</span></div><strong>Busca el número que los dos comparten.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Escribe la multiplicación</strong><p>El factor común va fuera y lo que queda va dentro del paréntesis.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'perfectTrinomial') {
        const root = Number(document.getElementById('factorizationPerfectRootInput').value);
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Construye un cuadrado</strong><p>Imagina un cuadrado de lado (x + ${root}). Su área tiene cuatro partes: un cuadrado grande, dos rectángulos iguales y un cuadrado pequeño.</p><div class="root-groups"><span>x²</span><span>+</span><span>2 · x · ${root}</span><span>+</span><span>${root * root}</span></div><strong>Todo junto forma (x + ${root})².</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Comprueba las raíces</strong><p>Las raíces del primero y tercer término son x y ${root}. El del medio es su doble producto.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'trialError') {
        const n = Number(document.getElementById('factorizationTrialNInput').value);
        const m = Number(document.getElementById('factorizationTrialMInput').value);
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Busca dos números que funcionen</strong><p>Necesitas dos números que sumen ${n + m} y multipliquen ${n * m}.</p><div class="root-groups"><span>? + ? = ${n + m}</span><span>? × ? = ${n * m}</span></div><strong>Prueba con pares de números hasta encontrar la combinación correcta.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Comprueba los números</strong><p>${n} y ${m} suman ${n + m} y multiplican ${n * m}.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    return `<div class="root-model"><strong class="root-model-title">Observa la transformación</strong><p>Sigue el paso a paso para entender la operación.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
}

function updateFactorizationExplorerFields() {
    const operation = document.getElementById('factorizationOperationSelect').value;
    factorizationRepresentationIndex = 0;
    factorizationExplanationStarted = false;
    document.querySelectorAll('.root-explorer-fields[data-factorization-fields]').forEach(field => field.hidden = true);
    document.querySelector(`[data-factorization-fields="${operation}"]`).hidden = false;
    document.getElementById('factorizationFreeResult').textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    updateFactorizationStepButton();

    const conceptByOperation = {
        commonFactor: 'commonFactor',
        perfectTrinomial: 'perfectTrinomial',
        trialError: 'trialError'
    };
    const concept = factorizationCore.concepts.find(item => item.id === conceptByOperation[operation]);
    if (concept) renderFactorizationConceptDetails(concept);
}

function renderFactorizationConceptDetails(concept) {
    document.querySelectorAll('#factorizationConceptGrid .root-concept-card').forEach(card => {
        const isSelected = card.dataset.conceptId === concept.id;
        card.hidden = !isSelected;
        card.classList.toggle('selected', isSelected);
    });
    document.getElementById('factorizationConceptTitle').textContent = concept.title;
    document.getElementById('factorizationConceptText').innerHTML = MathDisplay.format(concept.text);
    document.getElementById('factorizationConceptExample').innerHTML = MathDisplay.format(concept.example);
    document.getElementById('factorizationConceptSteps').innerHTML = concept.steps
        .map((step, index) => `<li><span>${index + 1}</span>${MathDisplay.format(step)}</li>`)
        .join('');
}

function selectFactorizationConcept(conceptId) {
    const concept = factorizationCore.concepts.find(item => item.id === conceptId);
    if (!concept) return;
    const operationByConcept = { commonFactor: 'commonFactor', variableFactor: 'commonFactor', perfectTrinomial: 'perfectTrinomial', trialError: 'trialError' };
    const operation = operationByConcept[conceptId] || 'commonFactor';
    document.getElementById('factorizationOperationSelect').value = operation;
    factorizationRepresentationIndex = 0;
    factorizationExplanationStarted = false;
    updateFactorizationExplorerFields();
    renderFactorizationConceptDetails(concept);
}

function renderFactorizationConceptGrid() {
    const grid = document.getElementById('factorizationConceptGrid');
    if (!grid) return;
    grid.innerHTML = factorizationCore.concepts.map(concept => `
        <button class="root-concept-card" data-concept-id="${concept.id}" onclick="selectFactorizationConcept('${concept.id}')">
            <span>🧬</span><strong>${concept.title}</strong><small>${concept.text.substring(0, 40)}...</small>
        </button>
    `).join('');
}

let factorizationGameState = {
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

function getFactorizationHelpContext() {
    const question = factorizationGameState.questions[factorizationGameState.currentQuestion];
    if (!question) return null;

    const help = {
        commonFactor: ['factor común', 'Busca el número que divide a todos los términos y sácalo fuera del paréntesis.', 'Ejemplo: 6x + 6y = 6(x + y).'],
        variableFactor: ['factor común con letras', 'Extrae el número y la letra que comparten todos los términos.', 'Ejemplo: 3a + 9a² = 3a(1 + 3a).'],
        perfectTrinomial: ['trinomio cuadrado perfecto', 'Comprueba las raíces del primero y tercer término, y que el del medio sea el doble producto.', 'Ejemplo: x² + 4x + 4 = (x + 2)².'],
        trialError: ['ensayo y error', 'Busca dos números que sumen el coeficiente de x y multipliquen el término constante.', 'Ejemplo: x² + 5x + 6 = (x + 2)(x + 3).'],
        grouping: ['factor común por agrupación', 'Agrupa los términos en parejas, extrae el factor común de cada grupo y luego extrae el binomio común.', 'Ejemplo: ax + bx + a + b = (a + b)(x + 1).']
    }[question.type];

    return help ? { title: `Ayuda: ${help[0]}`, message: help[1], example: help[2] } : null;
}

function startFactorizationGame() {
    const saved = window.AppStorage.getProgress();
    const level = saved.factorizationLevel || 1;
    const questions = factorizationCore.generateQuestions(
        level,
        10,
        window.AppStorage.getRecentQuestions('factorization')
    );
    factorizationGameState = {
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

    document.getElementById('factorizationGameStart').style.display = 'none';
    document.getElementById('factorizationGamePlay').style.display = 'block';
    document.getElementById('factorizationGameEnd').style.display = 'none';
    window.AppStorage.rememberQuestions('factorization', questions.map(question => question.key), 12);
    loadFactorizationQuestion();
}

function loadFactorizationQuestion() {
    if (factorizationGameState.currentQuestion >= factorizationGameState.questions.length) {
        endFactorizationGame();
        return;
    }

    const question = factorizationGameState.questions[factorizationGameState.currentQuestion];
    factorizationGameState.selectedOption = null;
    document.getElementById('factorizationQuestionNum').textContent = factorizationGameState.currentQuestion + 1;
    document.getElementById('factorizationScoreDisplay').textContent = factorizationGameState.correctAnswers;
    document.getElementById('factorizationPrompt').innerHTML = MathDisplay.format(question.prompt);
    factorizationUi.updateChallengeHud(factorizationGameState, 'factorization');

    document.getElementById('factorizationOptions').innerHTML = question.options.map((option, index) => `
        <button class="composition-option" onclick="selectFactorizationOption(${index})">${MathDisplay.format(option.label)}</button>
    `).join('');
}

function selectFactorizationOption(index) {
    factorizationGameState.selectedOption = index;
    document.querySelectorAll('#factorizationOptions .composition-option').forEach((button, buttonIndex) => {
        button.classList.toggle('selected', buttonIndex === index);
    });
}

function checkFactorizationAnswer() {
    const question = factorizationGameState.questions[factorizationGameState.currentQuestion];
    const selected = question.options[factorizationGameState.selectedOption];

    if (!selected) {
        showFactorizationValidationWarning();
        return;
    }

    const isCorrect = selected.correct;
    if (isCorrect) {
        factorizationGameState.correctAnswers++;
        factorizationUi.registerAnswerOutcome(factorizationGameState, true, 'factorization');
        factorizationUi.playClickSound('add');
        factorizationUi.triggerConfetti();
        showFactorizationFeedback('✅', '¡Correcto!', question.explanation, question.answer);
    } else {
        factorizationUi.registerAnswerOutcome(factorizationGameState, false, 'factorization', question.type);
        factorizationUi.playClickSound('sub');
        showFactorizationFeedback('❌', 'Incorrecto', question.explanation, `Respuesta correcta: ${question.answer}`);
    }
}

function showFactorizationFeedback(icon, title, message, expression) {
    document.getElementById('feedbackIcon').textContent = icon;
    document.getElementById('feedbackTitle').textContent = title;
    document.getElementById('feedbackMessage').innerHTML = MathDisplay.format(message);
    const expressionElement = document.getElementById('feedbackExpression');
    expressionElement.innerHTML = MathDisplay.format(expression);
    expressionElement.style.display = expression ? 'block' : 'none';
    document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = closeFactorizationFeedback;
    document.getElementById('feedbackModal').style.display = 'flex';
}

function showFactorizationValidationWarning() {
    document.getElementById('feedbackIcon').textContent = '⚠️';
    document.getElementById('feedbackTitle').textContent = 'Elige una opción';
    document.getElementById('feedbackMessage').textContent = 'Selecciona una respuesta antes de verificar.';
    document.getElementById('feedbackExpression').style.display = 'none';
    document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = closeFactorizationValidationWarning;
    document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFactorizationValidationWarning() {
    document.getElementById('feedbackModal').style.display = 'none';
}

function closeFactorizationFeedback() {
    document.getElementById('feedbackModal').style.display = 'none';
    factorizationGameState.currentQuestion++;
    loadFactorizationQuestion();
}

function cancelFactorizationGame() {
    document.getElementById('confirmModal').style.display = 'flex';
}

function endFactorizationGame() {
    document.getElementById('factorizationGamePlay').style.display = 'none';
    document.getElementById('factorizationGameEnd').style.display = 'block';
    document.getElementById('factorizationFinalScore').textContent = factorizationGameState.correctAnswers;

    if (factorizationGameState.correctAnswers >= 7) {
        factorizationGameState.level = Math.min(3, factorizationGameState.level + 1);
        window.AppStorage.saveSnapshot('factorization', factorizationGameState);
    }

    const message = factorizationGameState.correctAnswers >= 8
        ? '¡Excelente dominio de la factorización!'
        : factorizationGameState.correctAnswers >= 5
            ? '¡Buen trabajo! Sigue practicando los métodos.'
            : 'Repasa los conceptos y vuelve a intentarlo.';
    document.getElementById('factorizationFinalMessage').textContent = `${message} Nivel actual: ${factorizationGameState.level}`;
}
