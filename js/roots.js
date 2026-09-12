const rootsCore = window.RootsCore;
const rootsUi = window.ChallengeUI;
let rootRepresentationIndex = 0;
let rootExplanationStarted = false;
const rootRepresentations = ['concrete', 'pictorial', 'abstract'];

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
    const operation = document.getElementById('rootOperationSelect')?.value || 'calculate';
    const result = rootsCore.evaluateExplorer(operation, {
        index: document.getElementById('rootIndexInput')?.value,
        first: operation === 'combine'
            ? document.getElementById('rootCombineFirstInput')?.value
            : operation === 'quotient'
                ? document.getElementById('rootQuotientFirstInput')?.value
                : operation === 'nested'
                    ? document.getElementById('rootNestedInput')?.value
                    : operation === 'power'
                        ? document.getElementById('rootPowerInput')?.value
                        : operation === 'amplification'
                            ? document.getElementById('rootAmplificationInput')?.value
                            : operation === 'subtract'
                                ? document.getElementById('rootSubtractFirstInput')?.value
                                : operation === 'applied'
                                    ? document.getElementById('rootAreaInput')?.value
                                    : operation === 'equation'
                                        ? document.getElementById('rootEquationInput')?.value
            : operation === 'calculate'
                ? document.getElementById('rootRadicandInput')?.value
            : operation === 'like'
                ? document.getElementById('rootLikeFirstInput')?.value
                : operation === 'rationalize'
                    ? document.getElementById('rootRationalizeInput')?.value
                    : document.getElementById('rootFirstInput')?.value || document.getElementById('rootRadicandInput')?.value,
        second: operation === 'combine'
            ? document.getElementById('rootCombineSecondInput')?.value
            : operation === 'quotient'
                ? document.getElementById('rootQuotientSecondInput')?.value
                : operation === 'subtract'
                    ? document.getElementById('rootSubtractSecondInput')?.value
            : operation === 'like'
                ? document.getElementById('rootLikeSecondInput')?.value
                : undefined,
        radicand: operation === 'subtract'
            ? document.getElementById('rootSubtractRadicandInput')?.value
            : document.getElementById('rootLikeRadicandInput')?.value || document.getElementById('rootRadicandInput')?.value
    });
    const resultBox = document.getElementById('rootFreeResult');

    resultBox.classList.remove('root-error');
    if (result.error) {
        resultBox.classList.add('root-error');
            resultBox.innerHTML = `<strong>Revisa los datos</strong><br>${MathDisplay.format(result.error)}`;
        return;
    }

    const representation = rootRepresentations[rootRepresentationIndex] || 'concrete';
    resultBox.innerHTML = renderRootRepresentation(operation, representation, result);
    rootExplanationStarted = true;
    updateRootStepButton();
}

function advanceRootExplorer() {
    if (!rootExplanationStarted) {
        processRootFree();
        return;
    }
    showNextRootRepresentation();
}

function showNextRootRepresentation() {
    rootRepresentationIndex = Math.min(rootRepresentations.length - 1, rootRepresentationIndex + 1);
    processRootFree();
}

function updateRootStepButton() {
    const button = document.getElementById('rootNextStepButton');
    if (!button) return;
    if (!rootExplanationStarted) {
        button.textContent = 'Comenzar explicación';
        button.onclick = advanceRootExplorer;
        return;
    }
    const isLastStep = rootRepresentationIndex >= rootRepresentations.length - 1;
    button.textContent = isLastStep ? 'Reiniciar explicación' : 'Ver siguiente paso';
    button.onclick = isLastStep ? resetRootRepresentation : showNextRootRepresentation;
}

function resetRootRepresentation() {
    rootRepresentationIndex = 0;
    rootExplanationStarted = false;
    document.getElementById('rootFreeResult').textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    updateRootStepButton();
}

function renderRootRepresentation(operation, representation, result) {
    const abstract = `<strong>${MathDisplay.format(result.display || '')}</strong><ol class="root-concept-steps root-result-steps">${(result.steps || []).map((step, index) => `<li><span>${index + 1}</span>${MathDisplay.format(step)}</li>`).join('')}</ol>`;
    if (representation === 'abstract') return abstract;

    if (operation === 'calculate') {
        const radicand = Number(document.getElementById('rootRadicandInput').value);
        const index = Number(document.getElementById('rootIndexInput').value);
        if (representation === 'concrete' && index === 2 && Number.isInteger(Math.sqrt(radicand)) && Math.sqrt(radicand) <= 5) {
            const side = Math.sqrt(radicand);
            const cells = Array.from({ length: radicand }, () => '<span></span>').join('');
            return `<div class="root-model"><strong class="root-model-title">⚽ Diseña una cancha de entrenamiento</strong><p>Una cancha cuadrada usa ${radicand} baldosas. ¿Cuántas baldosas debe tener cada lado?</p><div class="root-square-model" style="grid-template-columns:repeat(${side},24px)">${cells}</div><strong>Cada lado mide √${radicand} = ${side} baldosas.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">⚽ Mira la cancha desde arriba</strong><p>El área de la cancha es ${radicand}. La raíz nos dice cuánto mide cada lado.</p><div class="root-groups"><span>largo del campo</span><span>×</span><span>ancho del campo</span><span>= ${radicand}</span></div><strong>${MathDisplay.format(`${rootsCore.rootText(index, radicand)} = ${result.display}`)}</strong></div>`;
    }

    if (operation === 'simplify') {
        const radicand = Number(document.getElementById('rootFirstInput').value);
        const simplified = rootsCore.simplifySquareRoot(radicand);
        const perfect = simplified.outside ** 2;
        const remainder = simplified.inside;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">⚽ Organiza los balones del entrenamiento</strong><p>Tienes ${radicand} balones. Forma un grupo cuadrado de ${perfect} y deja ${remainder} balones fuera.</p><div class="root-groups"><span>grupo cuadrado: ${perfect} balones</span><span>resto: ${remainder}</span></div><strong>El grupo cuadrado puede salir de la raíz.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">⚽ Separa los grupos de balones</strong><p>Un grupo cuadrado representa una formación completa; lo que sobra permanece dentro de la raíz.</p><div class="root-groups"><span>${perfect} balones</span><span>×</span><span>${remainder}</span></div><strong>${MathDisplay.format(`√${radicand} = √(${perfect} × ${remainder}) = ${result.display}`)}</strong></div>`;
    }

    if (operation === 'like' || operation === 'subtract') {
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">⚽ Junta tarjetas de jugadores</strong><p>Cada tarjeta representa una unidad de ${MathDisplay.format('√a')}. Junta o retira tarjetas según el resultado de la jugada.</p><div class="root-groups"><span>√a</span><span>√a</span><span>√a</span><span>...</span></div><strong>Solo cambian las cantidades; el radical se conserva.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">⚽ Cuenta las tarjetas iguales</strong><p>Si las tarjetas representan la misma jugada, suma o resta sus cantidades y conserva el radical.</p><div class="root-groups"><span>√a</span><span>√a</span><span>√a</span><span>...</span></div><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'combine') {
        const first = document.getElementById('rootCombineFirstInput').value;
        const second = document.getElementById('rootCombineSecondInput').value;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">⚽ Combina dos medidas del campo</strong><p>El largo √${first} y el ancho √${second} forman juntos el área de entrenamiento.</p><div class="root-groups"><span>largo √${first}</span><span>×</span><span>ancho √${second}</span></div><strong>El producto reúne ambas medidas.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">⚽ Observa el área de la cancha</strong><p>Multiplicar las medidas del campo equivale a calcular la raíz del producto de sus radicandos.</p><div class="root-groups"><span>√${first}</span><span>×</span><span>√${second}</span><span>→</span><span>√(${first} × ${second})</span></div><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'quotient') {
        const first = document.getElementById('rootQuotientFirstInput').value;
        const second = document.getElementById('rootQuotientSecondInput').value;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Compara las dos medidas</strong><p>Compara √${first} con √${second}. Dividir significa medir cuántas veces cabe la segunda cantidad en la primera.</p><div class="root-groups"><span>√${first}</span><span>÷</span><span>√${second}</span></div></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Mira la razón entre áreas</strong><p>El cociente de raíces puede escribirse como una sola raíz con un cociente de radicandos.</p><strong>${MathDisplay.format(`√${first} / √${second} = √(${first}/${second})`)}</strong></div>`;
    }

    if (operation === 'nested') {
        const value = document.getElementById('rootNestedInput').value;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Sigue dos pasos de raíz</strong><p>Primero encuentra la raíz cúbica de ${value}. Después busca la raíz cuadrada del resultado.</p><div class="root-groups"><span>∛${value}</span><span>→</span><span>√(resultado)</span></div><strong>Son dos operaciones una después de la otra.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Une los dos índices</strong><p>Cuando una raíz está dentro de otra, los índices se multiplican: 2 × 3 = 6.</p><div class="root-groups"><span>√(∛${value})</span><span>→</span><span>√[6]${value}</span></div><strong>${MathDisplay.format(`Resultado: √[6]${value} = ${result.display}`)}</strong></div>`;
    }

    if (operation === 'power') {
        const value = document.getElementById('rootPowerInput').value;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Forma un cuadrado con la misma medida</strong><p>Imagina dos lados iguales de longitud ${value}. Juntos forman un cuadrado.</p><div class="root-groups"><span>${value}</span><span>×</span><span>${value}</span><span>= ${value ** 2}</span></div><strong>La raíz deshace el cuadrado y recupera el lado.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Relaciona potencia y raíz</strong><p>Una potencia cuadrada y su raíz son operaciones inversas.</p><div class="root-groups"><span>${value}²</span><span>→</span><span>√(${value}²)</span><span>→</span><span>${value}</span></div><strong>${MathDisplay.format(`Resultado: √(${value}²) = ${result.display}`)}</strong></div>`;
    }

    if (operation === 'amplification') {
        const value = document.getElementById('rootAmplificationInput').value;
        const targetIndex = 6;
        const amplified = Number(value) ** 3;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Repite la misma cantidad tres veces</strong><p>Para cambiar el índice de 2 a 6, usamos el mismo factor 3 en el índice y en el radicando.</p><div class="root-groups"><span>índice 2 × 3 = 6</span><span>radicando ${value} × ${value} × ${value} = ${amplified}</span></div><strong>El valor de la raíz se conserva.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Mira la equivalencia</strong><p>El índice y el exponente del radicando crecen con el mismo factor.</p><div class="root-groups"><span>√${value}</span><span>→</span><span>√[${targetIndex}]${amplified}</span></div><strong>${MathDisplay.format(`Resultado: √${value} = √[${targetIndex}]${amplified}`)}</strong></div>`;
    }

    if (operation === 'rationalize' || operation === 'conjugate') {
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Conserva el valor de la fracción</strong><p>Multiplicamos por una expresión equivalente a 1 para no cambiar el valor de la fracción.</p><div class="root-groups"><span>fracción original</span><span>×</span><span>1</span><span>=</span><span>fracción equivalente</span></div></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Deja el denominador sin raíces</strong><p>El objetivo es conservar el valor, pero dejar el denominador sin radicales.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
    }

    if (operation === 'applied') {
        const area = document.getElementById('rootAreaInput').value;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">⚽ Marca una cancha cuadrada</strong><p>La cancha tiene un área de ${area} m². Queremos saber cuánto mide cada lado.</p><div class="root-groups"><span>área = ${area} m²</span><span>→</span><span>buscar un lado</span></div><strong>La raíz nos ayuda a encontrar la medida desconocida.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Relaciona área y lado</strong><p>Si lado × lado forma el área, buscamos el lado calculando la raíz cuadrada.</p><div class="root-groups"><span>lado × lado</span><span>= ${area}</span><span>→</span><span>lado = √${area}</span></div><strong>${MathDisplay.format(`Resultado: lado = ${result.display}`)}</strong></div>`;
    }

    if (operation === 'equation') {
        const value = document.getElementById('rootEquationInput').value;
        if (representation === 'concrete') {
            return `<div class="root-model"><strong class="root-model-title">Descubre el número escondido</strong><p>Buscamos un número que, al multiplicarse por sí mismo, produzca ${value} × ${value}.</p><div class="root-groups"><span>□ × □</span><span>= ${value} × ${value}</span></div><strong>El número escondido es el lado del cuadrado.</strong></div>`;
        }
        return `<div class="root-model"><strong class="root-model-title">Mira cómo se despeja</strong><p>Aplicamos la operación inversa: elevamos ambos lados al cuadrado.</p><div class="root-groups"><span>√x = ${value}</span><span>→</span><span>x = ${value}²</span></div><strong>${MathDisplay.format(`Resultado: x = ${result.display}`)}</strong></div>`;
    }

    return `<div class="root-model"><strong class="root-model-title">Observa la transformación</strong><p>Observa qué cantidad se conserva al transformar la expresión.</p><strong>${MathDisplay.format(`Resultado: ${result.display}`)}</strong></div>`;
}

function updateRootExplorerFields() {
    const operation = document.getElementById('rootOperationSelect').value;
    rootRepresentationIndex = 0;
    rootExplanationStarted = false;
    document.querySelectorAll('.root-explorer-fields').forEach(field => field.hidden = true);
    document.querySelector(`[data-root-fields="${operation}"]`).hidden = false;
    document.getElementById('rootFreeResult').textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    updateRootStepButton();

    const conceptByOperation = {
        calculate: 'real',
        simplify: 'simplify',
        combine: 'properties',
        quotient: 'properties',
        nested: 'properties',
        power: 'properties',
        amplification: 'properties',
        like: 'properties',
        subtract: 'properties',
        rationalize: 'rationalize'
        ,conjugate: 'rationalize',
        applied: 'real',
        equation: 'real'
    };
    const concept = rootsCore.concepts.find(item => item.id === conceptByOperation[operation]);
    if (concept) {
        const defaults = {
            calculate: { index: 2, radicand: 25 },
            simplify: { first: 72 },
            combine: { first: 2, second: 8 },
            quotient: { first: 12, second: 3 },
            nested: { first: 64 },
            power: { first: 6 },
            amplification: { first: 2 },
            like: { first: 2, second: 5, radicand: 3 },
            subtract: { first: 7, second: 2, radicand: 3 },
            rationalize: { first: 3 },
            conjugate: {},
            applied: { first: 49 },
            equation: { first: 5 }
        }[operation];

        if (defaults.index) document.getElementById('rootIndexInput').value = defaults.index;
        if (defaults.radicand) document.getElementById('rootRadicandInput').value = defaults.radicand;
        if (defaults.first) {
            const firstInputId = {
                combine: 'rootCombineFirstInput', quotient: 'rootQuotientFirstInput', nested: 'rootNestedInput',
                power: 'rootPowerInput', amplification: 'rootAmplificationInput', like: 'rootLikeFirstInput',
                subtract: 'rootSubtractFirstInput', rationalize: 'rootRationalizeInput', applied: 'rootAreaInput',
                equation: 'rootEquationInput'
            }[operation] || 'rootFirstInput';
            const firstInput = document.getElementById(firstInputId);
            if (firstInput) firstInput.value = defaults.first;
        }
        if (defaults.second) {
            const secondInputId = operation === 'combine' ? 'rootCombineSecondInput' : operation === 'quotient' ? 'rootQuotientSecondInput' : operation === 'subtract' ? 'rootSubtractSecondInput' : 'rootLikeSecondInput';
            const secondInput = document.getElementById(secondInputId);
            if (secondInput) secondInput.value = defaults.second;
        }
        if (defaults.radicand && operation === 'like') document.getElementById('rootLikeRadicandInput').value = defaults.radicand;
        if (defaults.radicand && operation === 'subtract') document.getElementById('rootSubtractRadicandInput').value = defaults.radicand;
        renderRootConceptDetails(concept);
    }
}

function renderRootConceptDetails(concept) {
    document.querySelectorAll('.root-concept-card').forEach(card => {
        const isSelected = card.dataset.conceptId === concept.id;
        card.hidden = !isSelected;
        card.classList.toggle('selected', isSelected);
    });
    document.getElementById('rootConceptTitle').textContent = concept.title;
    document.getElementById('rootConceptText').innerHTML = MathDisplay.format(concept.text);
    document.getElementById('rootConceptExample').innerHTML = MathDisplay.format(concept.example);
    document.getElementById('rootConceptSteps').innerHTML = concept.steps
        .map((step, index) => `<li><span>${index + 1}</span>${MathDisplay.format(step)}</li>`)
        .join('');
}

function selectRootConcept(conceptId) {
    const concept = rootsCore.concepts.find(item => item.id === conceptId);
    if (!concept) return;
    rootRepresentationIndex = 0;
    rootExplanationStarted = false;

    document.getElementById('rootOperationSelect').value = concept.id === 'simplify' ? 'simplify' : concept.id === 'rationalize' ? 'rationalize' : 'calculate';
    updateRootExplorerFields();
    document.getElementById('rootIndexInput').value = concept.index;
    document.getElementById('rootRadicandInput').value = concept.radicand;
    document.getElementById('rootFirstInput').value = concept.radicand;
    const resultBox = document.getElementById('rootFreeResult');
    resultBox.classList.remove('root-error');
    resultBox.textContent = 'Pulsa “Comenzar explicación” para ver el desarrollo paso a paso.';
    renderRootConceptDetails(concept);
    updateRootStepButton();
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
        rootsUi.registerAnswerOutcome(rootsGameState, false, 'roots', question.type);
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