const algebraCore = window.AlgebraCore;
const algebraUi = window.ChallengeUI;

let algebraRepresentationIndex = 0;
let algebraExplanationStarted = false;
const algebraRepresentations = ['concrete', 'pictorial', 'abstract'];

function processAlgebraFree() {
    const operation = document.getElementById('algebraOperationSelect')?.value || 'translate';
    const result = algebraCore.evaluateExplorer(operation, {
        first: document.getElementById('algebraEvaluateExpressionInput')?.value,
        second: document.getElementById('algebraEvaluateValueInput')?.value,
        a: document.getElementById('algebraSimplifyAInput')?.value,
        b: document.getElementById('algebraSimplifyBInput')?.value
    });
    const resultBox = document.getElementById('algebraFreeResult');

    resultBox.classList.remove('root-error');
    if (result.error) {
        resultBox.classList.add('root-error');
        resultBox.innerHTML = `<strong>Revisa los datos</strong><br>${MathDisplay.format(result.error)}`;
        return;
    }

    const representation = algebraRepresentations[algebraRepresentationIndex] || 'concrete';
    resultBox.innerHTML = renderAlgebraRepresentation(operation, representation, result);
    algebraExplanationStarted = true;
    updateAlgebraStepButton();
}

function advanceAlgebraExplorer() {
    if (!algebraExplanationStarted) {
        processAlgebraFree();
        return;
    }
    showNextAlgebraRepresentation();
}

function showNextAlgebraRepresentation() {
    algebraRepresentationIndex = Math.min(algebraRepresentations.length - 1, algebraRepresentationIndex + 1);
    processAlgebraFree();
}

function updateAlgebraStepButton() {
    const button = document.getElementById('algebraNextStepButton');
    if (!button) return;
    if (!algebraExplanationStarted) {
        button.textContent = 'Comenzar explicación';
        button.onclick = advanceAlgebraExplorer;
        return;
    }
    const isLastStep = algebraRepresentationIndex >= algebraRepresentations.length - 1;
    button.textContent = isLastStep ? 'Reiniciar explicación' : 'Ver siguiente paso';
    button.onclick = isLastStep ? resetAlgebraRepresentation : showNextAlgebraRepresentation;
}

function resetAlgebraRepresentation() {
    algebraRepresentationIndex = 0;
    algebraExplanationStarted = false;
    document.getElementById('algebraFreeResult').textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    updateAlgebraStepButton();
}

function renderAlgebraRepresentation(operation, representation, result) {
    const abstract = `<strong>${MathDisplay.format(result.display || '')}</strong><ol class="root-concept-steps root-result-steps">${(result.steps || []).map((step, index) => `<li><span>${index + 1}</span>${MathDisplay.format(step)}</li>`).join('')}</ol>`;
    if (representation === 'abstract') return abstract;

    if (operation === 'translate') {
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Identifica la cantidad desconocida</strong><p>Imagina que no sabes cuántas pelotas hay en una caja. Le ponemos una letra: x.</p><div class="root-groups"><span>cantidad desconocida</span><span>→</span><span>x</span></div><strong>La letra representa lo que aún no conocemos.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Escribe con símbolos</strong><p>Cuando las palabras dicen «el doble», significa multiplicar por 2.</p><div class="root-groups"><span>«el doble de un número»</span><span>→</span><span>2 · x</span><span>→</span><span>2x</span></div><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'evaluate') {
        const expression = document.getElementById('algebraEvaluateExpressionInput').value;
        const value = Number(document.getElementById('algebraEvaluateValueInput').value);
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Reemplaza la letra por su valor</strong><p>La letra x vale ${value}. En cada lugar donde aparezca x, escribe ${value}.</p><div class="root-groups"><span>${expression}</span><span>→</span><span>reemplaza x por ${value}</span></div><strong>Cada letra toma el valor que le corresponde.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Calcula paso a paso</strong><p>Después de reemplazar, resuelve siguiendo el orden de las operaciones.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'simplify') {
        const a = Number(document.getElementById('algebraSimplifyAInput').value);
        const b = Number(document.getElementById('algebraSimplifyBInput').value);
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Junta cantidades iguales</strong><p>Tienes ${a} grupos de x y ${b} grupos de x. Como ambos tienen la misma letra, puedes juntarlos.</p><div class="root-groups"><span>${a}x</span><span>+</span><span>${b}x</span></div><strong>Solo sumamos los números; la letra se conserva.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Suma los coeficientes</strong><p>Los términos son semejantes porque ambos tienen la letra x.</p><div class="root-groups"><span>${a} + ${b}</span><span>=</span><span>${a + b}</span></div><strong>${MathDisplay.format(`Resultado: ${a + b}x`)}</strong></div>`;
    }

    return `<div class="root-model"><strong class="root-model-title">Observa la transformación</strong><p>Sigue el paso a paso para entender la operación.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
}

function updateAlgebraExplorerFields() {
    const operation = document.getElementById('algebraOperationSelect').value;
    algebraRepresentationIndex = 0;
    algebraExplanationStarted = false;
    document.querySelectorAll('.root-explorer-fields[data-algebra-fields]').forEach(field => field.hidden = true);
    document.querySelector(`[data-algebra-fields="${operation}"]`).hidden = false;
    document.getElementById('algebraFreeResult').textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    updateAlgebraStepButton();

    const conceptByOperation = {
        translate: 'translate',
        evaluate: 'evaluate',
        simplify: 'simplify'
    };
    const concept = algebraCore.concepts.find(item => item.id === conceptByOperation[operation]);
    if (concept) renderAlgebraConceptDetails(concept);
}

function renderAlgebraConceptDetails(concept) {
    document.querySelectorAll('#algebraConceptGrid .root-concept-card').forEach(card => {
        const isSelected = card.dataset.conceptId === concept.id;
        card.hidden = !isSelected;
        card.classList.toggle('selected', isSelected);
    });
    document.getElementById('algebraConceptTitle').textContent = concept.title;
    document.getElementById('algebraConceptText').innerHTML = MathDisplay.format(concept.text);
    document.getElementById('algebraConceptExample').innerHTML = MathDisplay.format(concept.example);
    document.getElementById('algebraConceptSteps').innerHTML = concept.steps
        .map((step, index) => `<li><span>${index + 1}</span>${MathDisplay.format(step)}</li>`)
        .join('');
}

function selectAlgebraConcept(conceptId) {
    const concept = algebraCore.concepts.find(item => item.id === conceptId);
    if (!concept) return;
    const operationByConcept = { translate: 'translate', evaluate: 'evaluate', simplify: 'simplify', problem: 'translate' };
    const operation = operationByConcept[conceptId] || 'translate';
    document.getElementById('algebraOperationSelect').value = operation;
    algebraRepresentationIndex = 0;
    algebraExplanationStarted = false;
    updateAlgebraExplorerFields();
    renderAlgebraConceptDetails(concept);
}

function renderAlgebraConceptGrid() {
    const grid = document.getElementById('algebraConceptGrid');
    if (!grid) return;
    grid.innerHTML = algebraCore.concepts.map(concept => `
        <button class="root-concept-card" data-concept-id="${concept.id}" onclick="selectAlgebraConcept('${concept.id}')">
            <span>🔤</span><strong>${concept.title}</strong><small>${concept.text.substring(0, 40)}...</small>
        </button>
    `).join('');
}

let algebraGameState = {
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

function getAlgebraHelpContext() {
    const question = algebraGameState.questions[algebraGameState.currentQuestion];
    if (!question) return null;

    const help = {
        translate: ['traducir al lenguaje algebraico', 'Identifica la cantidad desconocida y asígnale una letra. Después escribe las operaciones.', 'Ejemplo: «el doble de un número» → 2x.'],
        termPart: ['partes de un término algebraico', 'El coeficiente es el número y el factor literal es la parte con letras.', 'Ejemplo: en 7x, el coeficiente es 7 y el factor literal es x.'],
        evaluate: ['valorizar una expresión', 'Reemplaza la letra por su valor y calcula siguiendo el orden de las operaciones.', 'Ejemplo: si x = 2, entonces 3x + 5 = 3·2 + 5 = 11.'],
        simplify: ['reducir términos semejantes', 'Los términos semejantes tienen la misma letra. Suma o resta solo los coeficientes.', 'Ejemplo: 5x + 3x = 8x.'],
        distribute: ['propiedad distributiva', 'Multiplica el número de afuera por cada término dentro del paréntesis.', 'Ejemplo: 3(x + 2) = 3x + 6.'],
        problem: ['problemas con expresiones', 'Traduce la situación a símbolos y luego reduce la expresión.', 'Ejemplo: x goles + el triple = x + 3x = 4x.']
    }[question.type];

    return help ? { title: `Ayuda: ${help[0]}`, message: help[1], example: help[2] } : null;
}

function startAlgebraGame() {
    const saved = window.AppStorage.getProgress();
    const level = saved.algebraLevel || 1;
    const questions = algebraCore.generateQuestions(
        level,
        10,
        window.AppStorage.getRecentQuestions('algebra')
    );
    algebraGameState = {
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

    document.getElementById('algebraGameStart').style.display = 'none';
    document.getElementById('algebraGamePlay').style.display = 'block';
    document.getElementById('algebraGameEnd').style.display = 'none';
    window.AppStorage.rememberQuestions('algebra', questions.map(question => question.key), 12);
    loadAlgebraQuestion();
}

function loadAlgebraQuestion() {
    if (algebraGameState.currentQuestion >= algebraGameState.questions.length) {
        endAlgebraGame();
        return;
    }

    const question = algebraGameState.questions[algebraGameState.currentQuestion];
    algebraGameState.selectedOption = null;
    document.getElementById('algebraQuestionNum').textContent = algebraGameState.currentQuestion + 1;
    document.getElementById('algebraScoreDisplay').textContent = algebraGameState.correctAnswers;
    document.getElementById('algebraPrompt').innerHTML = MathDisplay.format(question.prompt);
    algebraUi.updateChallengeHud(algebraGameState, 'algebra');

    document.getElementById('algebraOptions').innerHTML = question.options.map((option, index) => `
        <button class="composition-option" onclick="selectAlgebraOption(${index})">${MathDisplay.format(option.label)}</button>
    `).join('');
}

function selectAlgebraOption(index) {
    algebraGameState.selectedOption = index;
    document.querySelectorAll('#algebraOptions .composition-option').forEach((button, buttonIndex) => {
        button.classList.toggle('selected', buttonIndex === index);
    });
}

function checkAlgebraAnswer() {
    const question = algebraGameState.questions[algebraGameState.currentQuestion];
    const selected = question.options[algebraGameState.selectedOption];

    if (!selected) {
        showAlgebraValidationWarning();
        return;
    }

    const isCorrect = selected.correct;
    if (isCorrect) {
        algebraGameState.correctAnswers++;
        algebraUi.registerAnswerOutcome(algebraGameState, true, 'algebra');
        algebraUi.playClickSound('add');
        algebraUi.triggerConfetti();
        showAlgebraFeedback('✅', '¡Correcto!', question, question.answer);
    } else {
        algebraUi.registerAnswerOutcome(algebraGameState, false, 'algebra', question.type);
        algebraUi.playClickSound('sub');
        showAlgebraFeedback('❌', 'Incorrecto', question, `Respuesta correcta: ${question.answer}`);
    }
}

function showAlgebraFeedback(icon, title, question, expression) {
    algebraUi.showAnswerFeedback({ icon, title, question, expression, onContinue: closeAlgebraFeedback });
}

function showAlgebraValidationWarning() {
    document.getElementById('feedbackIcon').textContent = '⚠️';
    document.getElementById('feedbackTitle').textContent = 'Elige una opción';
    document.getElementById('feedbackMessage').textContent = 'Selecciona una respuesta antes de verificar.';
    document.getElementById('feedbackExpression').style.display = 'none';
    document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = closeAlgebraValidationWarning;
    document.getElementById('feedbackModal').style.display = 'flex';
}

function closeAlgebraValidationWarning() {
    document.getElementById('feedbackModal').style.display = 'none';
}

function closeAlgebraFeedback() {
    document.getElementById('feedbackModal').style.display = 'none';
    algebraGameState.currentQuestion++;
    loadAlgebraQuestion();
}

function cancelAlgebraGame() {
    document.getElementById('confirmModal').style.display = 'flex';
}

function endAlgebraGame() {
    document.getElementById('algebraGamePlay').style.display = 'none';
    document.getElementById('algebraGameEnd').style.display = 'block';
    document.getElementById('algebraFinalScore').textContent = algebraGameState.correctAnswers;

    if (algebraGameState.correctAnswers >= 7) {
        algebraGameState.level = Math.min(3, algebraGameState.level + 1);
        window.AppStorage.saveSnapshot('algebra', algebraGameState);
    }

    const message = algebraGameState.correctAnswers >= 8
        ? '¡Excelente dominio del álgebra!'
        : algebraGameState.correctAnswers >= 5
            ? '¡Buen trabajo! Sigue practicando las expresiones.'
            : 'Repasa los conceptos y vuelve a intentarlo.';
    document.getElementById('algebraFinalMessage').textContent = `${message} Nivel actual: ${algebraGameState.level}`;
}
