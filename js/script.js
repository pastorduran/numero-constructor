// Coordinador de la interfaz. Las constantes, el estado base y la persistencia
// viven en archivos separados para que las nuevas capas puedan crecer sin ampliar este archivo.
const { denominations, createCompositionState } = window.AppConfig;
const { getProgress: getSavedProgress, saveSnapshot: saveProgressSnapshot } = window.AppStorage;
const {
    generateRandomNumbers,
    generateExpression,
    numberToAnswer,
    createCompositionOptions
} = window.CompositionCore;
const {
    playClickSound,
    triggerConfetti,
    showComboBurst,
    updateChallengeHud,
    registerAnswerOutcome
} = window.ChallengeUI;

let state = createCompositionState();

function render() {
    renderMoney();
    renderColumns();
    renderTotal();
    renderExpression();
}

function renderMoney() {
    const grid = document.getElementById('moneyGrid');
    grid.innerHTML = '';

    denominations.forEach(denom => {
        const count = state[denom.value];
        const html = `
            <div class="money-item">
                <div class="money-value-label">$${denom.value.toLocaleString('es-CL')}</div>
                <div class="money-controls">
                    <button class="control-btn" onclick="changeMoney(${denom.value}, -1)">−</button>
                    <span class="count-display">${count}</span>
                    <button class="control-btn add-btn" onclick="changeMoney(${denom.value}, 1)">+</button>
                </div>
            </div>
        `;
        grid.innerHTML += html;
    });
}

function renderColumns() {
    const total = getTotal();
    const columnsSection = document.getElementById('columnsSection');
    const columnsGrid = document.getElementById('columnsGrid');

    if (total === 0) {
        columnsSection.classList.remove('active');
        return;
    }

    columnsSection.classList.add('active');
    columnsGrid.innerHTML = '';

    const totalStr = total.toString().padStart(8, '0');

    // Limit rendered coins to avoid DOM/visual overflow. Show +N when there are more.
    const MAX_VISIBLE_COINS = 7;
    denominations.forEach((denom, idx) => {
        const count = state[denom.value];
        let coinsHtml = '';
        const visible = Math.min(count, MAX_VISIBLE_COINS);
        for (let i = 0; i < visible; i++) {
            coinsHtml += `<div class="coin ${denom.color}"></div>`;
        }

        // If there are more coins than visible, add a small badge showing the remaining
        const overflow = count - visible;
        const overflowHtml = overflow > 0 ? `<div class="coin-overflow">+${overflow}</div>` : '';

        const html = `
            <div class="column">
                <div class="stack">${coinsHtml}${overflowHtml}</div>
                <div class="column-count">${count}</div>
                <div class="column-label">${denom.name}</div>
            </div>
        `;
        columnsGrid.innerHTML += html;
    });
}

function renderTotal() {
    const total = getTotal();
    const totalStr = total.toString().padStart(7, '0');

    document.getElementById('totalAmount').textContent = '$' + total.toLocaleString('es-CL');

    let digitHtml = '';
    let hasZero = false;

    totalStr.split('').forEach(digit => {
        const isZero = digit === '0';
        if (isZero) hasZero = true;
        const cls = isZero ? 'zero' : '';
        digitHtml += `<div class="digit ${cls}">${digit}</div>`;
    });

    document.getElementById('digitBreakdown').innerHTML = digitHtml;
    document.getElementById('zeroInfo').style.display = hasZero ? 'block' : 'none';
}

function renderExpression() {
    const total = getTotal();
    const expressionSection = document.getElementById('expressionSection');
    const expressionBox = document.getElementById('expressionBox');

    if (total === 0) {
        expressionSection.classList.remove('active');
        return;
    }

    expressionSection.classList.add('active');

    const termColorMap = {
        10000000: 'term-teal',
        1000000: 'term-green',
        100000: 'term-blue',
        10000: 'term-coral',
        1000: 'term-purple',
        100: 'term-amber',
        10: 'term-red',
        1: 'term-lime'
    };

    const exponentsMap = {
        10000000: 7,
        1000000: 6,
        100000: 5,
        10000: 4,
        1000: 3,
        100: 2,
        10: 1,
        1: 0
    };

    let termsNormal = [];
    let termsExponential = [];

    denominations.forEach(denom => {
        if (state[denom.value] > 0) {
            const colorClass = termColorMap[denom.value];
            const exponent = exponentsMap[denom.value];
            const termNormal = `<span class="expression-term ${colorClass}">${state[denom.value]}×${denom.value.toLocaleString('es-CL')}</span>`;
            termsNormal.push(termNormal);
            const termExp = `<span class="expression-term ${colorClass}">${state[denom.value]}×10<sup>${exponent}</sup></span>`;
            termsExponential.push(termExp);
        }
    });

    const expressionN = termsNormal.join(' <span class="plus">+</span> ');
    const expressionE = termsExponential.join(' <span class="plus">+</span> ');
    const resultHtml = `<span class="result">${total.toLocaleString('es-CL')}</span>`;

    expressionBox.innerHTML = `
        <div class="expression-form">
            <div class="form-label">Forma normal (descomposición)</div>
            ${expressionN} <span class="equals">=</span> ${resultHtml}
        </div>
        <div class="expression-form">
            <div class="form-label">Forma exponencial (potencias de 10)</div>
            ${expressionE} <span class="equals">=</span> ${resultHtml}
        </div>
    `;
}

function getTotal() {
    return Object.entries(state).reduce((sum, [val, count]) => sum + (val * count), 0);
}

function changeMoney(value, delta) {
    state[value] = Math.max(0, state[value] + delta);
    const denomIndex = denominations.findIndex(d => d.value === value);

    // Re-render y efectos visuales/sonoros
    render();

    // Sonido: diferente tono para sumar/restar
    playClickSound(delta > 0 ? 'add' : 'sub');

    // Añadir pulso al contador de la columna correspondiente (si existe)
    const columnsGrid = document.getElementById('columnsGrid');
    if (columnsGrid && columnsGrid.children && columnsGrid.children[denomIndex]) {
        const column = columnsGrid.children[denomIndex];
        const countEl = column.querySelector('.column-count');
        if (countEl) {
            countEl.classList.add('pulse');
            setTimeout(() => countEl.classList.remove('pulse'), 600);
        }

        // Resaltar la columna completa brevemente
        column.classList.add('highlight');
        setTimeout(() => column.classList.remove('highlight'), 700);
    }

    // Bloquear botones de la fila del selector por un corto periodo
    const moneyGrid = document.getElementById('moneyGrid');
    if (moneyGrid && moneyGrid.children && moneyGrid.children[denomIndex]) {
        const moneyItem = moneyGrid.children[denomIndex];
        const buttons = moneyItem.querySelectorAll('button.control-btn');
        buttons.forEach(btn => btn.disabled = true);
        setTimeout(() => buttons.forEach(btn => btn.disabled = false), 420);
    }
}

function loadExample(example) { state = { ...example }; render(); }

function resetAll() {
    state = createCompositionState();
    render();
}

// Inicializar
render();

// ===== SISTEMA DE JUEGO =====

let gameState = {
    currentQuestion: 0,
    correctAnswers: 0,
    isZeroQuestion: false,
    currentNumber: 0,
    targetAnswers: {},
    questions: [],
    currentStreak: 0,
    bestStreak: 0,
    combo: 1,
    level: 1,
    specialLevelUnlocked: false
};

function getCompositionHelpContext() {
    const question = gameState.questions[gameState.currentQuestion];
    if (!question) return null;

    if (question.type === 'selector') {
        return {
            title: 'Ayuda: valor posicional',
            message: 'Separa el número por posiciones. Cada contador debe coincidir con la cifra de millones, miles, centenas, decenas o unidades correspondiente.',
            example: `Ejemplo: ${question.number.toLocaleString('es-CL')} se construye leyendo una cifra por cada posición.`
        };
    }

    if (question.type === 'normal') {
        return {
            title: 'Ayuda: descomposición normal',
            message: 'Multiplica cada cifra por el valor de su posición y suma solo los términos cuyo dígito no sea cero.',
            example: 'Ejemplo: 3.204 = 3 × 1.000 + 2 × 100 + 4 × 1.'
        };
    }

    return {
        title: 'Ayuda: potencias de 10',
        message: 'Cada posición es una potencia de 10: unidades es 10⁰, decenas es 10¹, centenas es 10² y así sucesivamente.',
        example: 'Ejemplo: 3.204 = 3 × 10³ + 2 × 10² + 4 × 10⁰.'
    };
}

// Iniciar el juego
function startGame() {
    const saved = getSavedProgress();
    gameState.level = saved.compositionLevel || 1;
    gameState.currentQuestion = 0;
    gameState.correctAnswers = 0;
    gameState.currentStreak = 0;
    gameState.combo = 1;
    gameState.specialLevelUnlocked = false;
    gameState.selectedOption = null;
    gameState.questions = generateRandomNumbers(gameState.level);

    // Ocultar pantalla de inicio
    document.getElementById('gameStart').style.display = 'none';
    document.getElementById('gameEnd').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';

    // Limpiar estado de juego
    gameState.gameState = {
        10000000: 0,
        1000000: 0,
        100000: 0,
        10000: 0,
        1000: 0,
        100: 0,
        10: 0,
        1: 0
    };

    // Cargar primera pregunta
    loadQuestion();
}

// Cargar una pregunta
function loadQuestion() {
    if (gameState.currentQuestion >= 10) {
        endGame();
        return;
    }

    const question = gameState.questions[gameState.currentQuestion];
    gameState.currentNumber = question.number;
    gameState.isZeroQuestion = question.emphasizeZeros;
    gameState.targetAnswers = numberToAnswer(question.number);
    gameState.selectedOption = null;
    gameState.questionOptions = question.type === 'selector' ? [] : createCompositionOptions(question.number, question.type);

    // Limpiar respuesta anterior
    gameState.gameState = {
        10000000: 0,
        1000000: 0,
        100000: 0,
        10000: 0,
        1000: 0,
        100: 0,
        10: 0,
        1: 0
    };

    // Actualizar UI
    document.getElementById('questionNum').textContent = gameState.currentQuestion + 1;
    document.getElementById('gameNumber').textContent = gameState.currentNumber.toLocaleString('es-CL');
    document.getElementById('gameScoreDisplay').textContent = gameState.correctAnswers;
    updateChallengeHud(gameState, 'game');

    // Mostrar pista si es pregunta de ceros
    const hintEl = document.getElementById('gameHint');
    if (gameState.isZeroQuestion) {
        hintEl.textContent = '⚠️ Pista: Este número tiene ceros. ¡Fíjate bien en los lugares vacíos!';
        hintEl.style.display = 'block';
    } else {
        hintEl.style.display = 'none';
    }

    renderCompositionQuestion(question);
}

function renderCompositionQuestion(question) {
    const prompt = document.querySelector('#gamePlay .game-prompt');
    const moneyGrid = document.getElementById('gameMoney');
    const options = document.getElementById('compositionOptions');
    const isSelectorQuestion = question.type === 'selector';

    prompt.textContent = isSelectorQuestion
        ? 'Compón este número:'
        : question.type === 'normal'
            ? 'Elige la descomposición normal correcta:'
            : 'Elige la descomposición con potencias de 10 correcta:';

    moneyGrid.style.display = isSelectorQuestion ? 'grid' : 'none';
    options.style.display = isSelectorQuestion ? 'none' : 'grid';

    if (isSelectorQuestion) {
        renderGameMoney();
        return;
    }

    options.innerHTML = gameState.questionOptions.map((option, index) => `
        <button class="composition-option ${gameState.selectedOption === index ? 'selected' : ''}" onclick="selectCompositionOption(${index})">
            ${option.expression}
        </button>
    `).join('');
}

function selectCompositionOption(index) {
    gameState.selectedOption = index;
    renderCompositionQuestion(gameState.questions[gameState.currentQuestion]);
}

// Renderizar controles de dinero en el juego
function renderGameMoney() {
    const grid = document.getElementById('gameMoney');
    grid.innerHTML = '';

    denominations.forEach(denom => {
        const count = gameState.gameState[denom.value];
        const html = `
            <div class="game-money-item">
                <div class="game-money-label">$${denom.value.toLocaleString('es-CL')}</div>
                <div class="game-controls">
                    <button onclick="gameChangeMoney(${denom.value}, -1)">−</button>
                    <span class="game-display">${count}</span>
                    <button onclick="gameChangeMoney(${denom.value}, 1)" class="add-btn">+</button>
                </div>
            </div>
        `;
        grid.innerHTML += html;
    });
}

function shouldWrapDigitSelector(value) {
    return [10000000, 1000000, 100000, 10000, 1000, 100, 10, 1].includes(value);
}

// Cambiar dinero en el juego
function gameChangeMoney(value, delta) {
    if (shouldWrapDigitSelector(value)) {
        const nextValue = gameState.gameState[value] + delta;
        if (nextValue > 9) {
            gameState.gameState[value] = 0;
        } else if (nextValue < 0) {
            gameState.gameState[value] = 9;
        } else {
            gameState.gameState[value] = nextValue;
        }
    } else {
        gameState.gameState[value] = Math.max(0, gameState.gameState[value] + delta);
    }
    renderGameMoney();
}

// Verificar respuesta
function checkAnswer() {
    const question = gameState.questions[gameState.currentQuestion];
    const isCorrect = question.type === 'selector'
        ? JSON.stringify(gameState.gameState) === JSON.stringify(gameState.targetAnswers)
        : gameState.questionOptions[gameState.selectedOption]?.correct === true;

    if (isCorrect) {
        gameState.correctAnswers++;
        registerAnswerOutcome(gameState, true, 'game');
        playClickSound('add');
        triggerConfetti();
        const expression = generateExpression(gameState.currentNumber);
        const specialMessage = gameState.specialLevelUnlocked ? ' ¡Nivel especial desbloqueado! 🔓' : '';
        showFeedback('✅', '¡Correcto!', `Muy bien, lo hiciste perfecto.${specialMessage}`, expression);
    } else {
        registerAnswerOutcome(gameState, false, 'game');
        playClickSound('sub');
        const expression = generateExpression(gameState.currentNumber);
        showFeedback('❌', 'Incorrecto', 'Aquí está la respuesta correcta:', expression);
    }
}

// Mostrar modal de retroalimentación
function showFeedback(icon, title, message, expression) {
    document.getElementById('feedbackIcon').textContent = icon;
    document.getElementById('feedbackTitle').textContent = title;
    document.getElementById('feedbackMessage').textContent = message;
    
    const expressionEl = document.getElementById('feedbackExpression');
    if (expression) {
        expressionEl.innerHTML = expression;
        expressionEl.style.display = 'block';
    } else {
        expressionEl.style.display = 'none';
    }
        // Usar función de composición
    document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = () => closeFeedback();    document.getElementById('feedbackModal').style.display = 'flex';
}

// Cerrar modal y continuar
function closeFeedback() {
    document.getElementById('feedbackModal').style.display = 'none';
    gameState.currentQuestion++;
    loadQuestion();
}

// Cancelar juego con confirmación
function cancelGame() {
    document.getElementById('confirmModal').style.display = 'flex';
}

// Cerrar modal de confirmación
function closeConfirm() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Confirmar cancelación del juego
function confirmCancel() {
    document.getElementById('confirmModal').style.display = 'none';
    backToMenu();
}

// Finalizar juego
function endGame() {
    document.getElementById('gamePlay').style.display = 'none';
    document.getElementById('gameEnd').style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.correctAnswers;

    if (gameState.correctAnswers >= 7) {
        const previousLevel = gameState.level;
        gameState.level = Math.min(3, gameState.level + 1);
        if (gameState.level !== previousLevel) {
            showComboBurst(`¡Nivel ${gameState.level} desbloqueado!`, 'game', 420);
        }
    }
    saveProgressSnapshot('game', gameState);

    // Mensaje personalizado
    let message = '';
    if (gameState.correctAnswers === 10) {
        message = '🌟 ¡Perfecto! ¡Eres un maestro de los números!';
    } else if (gameState.correctAnswers >= 8) {
        message = '⭐ ¡Excelente! Casi perfecto.';
    } else if (gameState.correctAnswers >= 6) {
        message = '👍 ¡Bien hecho! Sigue practicando.';
    } else if (gameState.correctAnswers >= 4) {
        message = '📚 Buen intento. Practica un poco más.';
    } else {
        message = '💪 ¡Vamos! Inténtalo de nuevo.';
    }

    document.getElementById('finalMessage').textContent = `${message} Nivel actual: ${gameState.level}`;
}

// Cambiar de modo
function switchMode(mode) {
    const modes = document.querySelectorAll('.mode-content');
    const buttons = document.querySelectorAll('.mode-btn');

    modes.forEach(m => m.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    if (mode === 'free') {
        document.getElementById('modoFree').classList.add('active');
        buttons[0].classList.add('active');
    } else if (mode === 'game') {
        document.getElementById('compositionGameMode').classList.add('active');
        buttons[1].classList.add('active');
        // Mostrar pantalla de inicio del juego
        document.getElementById('gameStart').style.display = 'block';
        document.getElementById('gamePlay').style.display = 'none';
        document.getElementById('gameEnd').style.display = 'none';
    }
}

// Entrar a un modo desde el menú principal
function enterMode(mode) {
    const mainMenu = document.getElementById('mainMenu');
    const modoFree = document.getElementById('modoFree');
    const compositionGameMode = document.getElementById('compositionGameMode');
    const notationFreeMode = document.getElementById('notationFreeMode');
    const notationGameMode = document.getElementById('notationGameMode');
    const rootsFreeMode = document.getElementById('rootsFreeMode');
    const rootsGameMode = document.getElementById('rootsGameMode');

    // Ocultar menú principal
    mainMenu.classList.remove('active');

    // Ocultar todos los modos
    if (modoFree) modoFree.classList.remove('active');
    if (compositionGameMode) compositionGameMode.classList.remove('active');
    if (notationFreeMode) notationFreeMode.classList.remove('active');
    if (notationGameMode) notationGameMode.classList.remove('active');
    if (rootsFreeMode) rootsFreeMode.classList.remove('active');
    if (rootsGameMode) rootsGameMode.classList.remove('active');

    // Mostrar modo seleccionado
    if (mode === 'compositionFree') {
        modoFree.classList.add('active');
    } else if (mode === 'compositionGame') {
        compositionGameMode.classList.add('active');
        // Mostrar pantalla de inicio del juego
        document.getElementById('gameStart').style.display = 'block';
        document.getElementById('gamePlay').style.display = 'none';
        document.getElementById('gameEnd').style.display = 'none';
    } else if (mode === 'notationFree') {
        notationFreeMode.classList.add('active');
    } else if (mode === 'notationGame') {
        notationGameMode.classList.add('active');
    } else if (mode === 'rootsFree') {
        rootsFreeMode.classList.add('active');
    } else if (mode === 'rootsGame') {
        rootsGameMode.classList.add('active');
        document.getElementById('rootsGameStart').style.display = 'block';
        document.getElementById('rootsGamePlay').style.display = 'none';
        document.getElementById('rootsGameEnd').style.display = 'none';
    }
}

// Volver al menú principal
function backToMenu() {
    const mainMenu = document.getElementById('mainMenu');
    const modoFree = document.getElementById('modoFree');
    const compositionGameMode = document.getElementById('compositionGameMode');
    const notationFreeMode = document.getElementById('notationFreeMode');
    const notationGameMode = document.getElementById('notationGameMode');
    const rootsFreeMode = document.getElementById('rootsFreeMode');
    const rootsGameMode = document.getElementById('rootsGameMode');

    // Ocultar todos los modos
    if (modoFree) modoFree.classList.remove('active');
    if (compositionGameMode) compositionGameMode.classList.remove('active');
    if (notationFreeMode) notationFreeMode.classList.remove('active');
    if (notationGameMode) notationGameMode.classList.remove('active');
    if (rootsFreeMode) rootsFreeMode.classList.remove('active');
    if (rootsGameMode) rootsGameMode.classList.remove('active');

    // Mostrar menú principal
    mainMenu.classList.add('active');
}

// ===== NOTACIÓN CIENTÍFICA =====
const {
    normalizeLocaleNumber,
    parseExponentInput,
    numberToScientific,
    scientificToNumber
} = window.NotationCore;

// Procesar número en notación científica (modo libre)
function processNotationNumber() {
    const input = document.getElementById('numberInput').value.trim();
    
    if (!input) {
        alert('Por favor ingresa un número');
        return;
    }
    
    const num = normalizeLocaleNumber(input);
    
    if (isNaN(num)) {
        alert('Por favor ingresa un número válido');
        return;
    }
    
    const result = numberToScientific(num);
    
    // Mostrar resultado con pasos
    document.getElementById('notationStep1').textContent = num.toLocaleString('es-CL');
    
    // Paso 2: mostrar cómo se mueve la coma
    const steps = Math.abs(result.exponent);
    const direction = result.exponent > 0 ? 'izquierda' : 'derecha';
    document.getElementById('notationStep2').textContent = `${result.coefficient}`;
    document.getElementById('notationSpaces').textContent = `Movemos la coma ${steps} lugar(es) a la ${direction}`;
    
    // Resultado final
    document.getElementById('notationFormula').innerHTML = NotationCore.scientificToHtml(result.coefficient, result.exponent);
    
    document.getElementById('notationResult').style.display = 'block';
}

// Cargar número aleatorio en notación libre
function randomNotationNumber() {
    const examples = [
        470000000,
        0.0000000065,
        5980000000000000000000000,
        0.00008,
        3897000000000000,
        0.0000000000000238,
        400000000,
        1989100000000000000000000000000
    ];
    
    const random = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('numberInput').value = random;
    processNotationNumber();
}

// Cargar ejemplo específico
function loadNotationExample(num) {
    document.getElementById('numberInput').value = num;
    processNotationNumber();
}

// Estado del juego de notación
let notationGameState = {
    currentQuestion: 0,
    correctAnswers: 0,
    questions: [],
    currentType: 'toScientific', // toScientific o toNumber
    currentNumber: 0,
    currentAnswer: null,
    currentStreak: 0,
    bestStreak: 0,
    combo: 1,
    level: 1,
    specialLevelUnlocked: false
};

const notationThemeBank = [
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '12 500 metros que corrió un equipo de fútbol en Madrid',
        number: 12500
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '3 800 000 visitantes en una feria de Osaka',
        number: 3800000
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '15 600 metros del recorrido de una carrera en Kyoto',
        number: 15600
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '2 500 000 copias vendidas de un manga en Tokyo',
        number: 2500000
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '45 000 asientos del estadio donde jugaron en Madrid',
        number: 45000
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '1 650 000 habitantes de la ciudad de Barcelona',
        number: 1650000
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '8 400 metros del sendero de una caminata en Nagano',
        number: 8400
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '7 800 metros que recorrieron en una misión por la ciudad',
        number: 7800
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '2,5 × 10^6 personas de una ciudad grande en Tokyo',
        coefficient: 2.5,
        exponent: 6
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '4,8 × 10^4 metros del entrenamiento en Kyoto',
        coefficient: 4.8,
        exponent: 4
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '3,2 × 10^3 km del viaje en Osaka',
        coefficient: 3.2,
        exponent: 3
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '6,7 × 10^5 visitas en un torneo de anime durante la semana',
        coefficient: 6.7,
        exponent: 5
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '9,4 × 10^2 metros del trayecto de una misión secreta',
        coefficient: 9.4,
        exponent: 2
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '1,2 × 10^7 pasos de una aventura nocturna por la ciudad',
        coefficient: 1.2,
        exponent: 7
    },
    {
        type: 'toScientific',
        prompt: 'Convierte a notación científica:',
        displayValue: '420 000 flores del jardín del parque de Kyoto',
        number: 420000
    },
    {
        type: 'toNumber',
        prompt: 'Convierte a número decimal:',
        displayValue: '5,6 × 10^5 seguidores de un canal de videos populares',
        coefficient: 5.6,
        exponent: 5
    }
];

// Generar preguntas de notación
function shuffleArray(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function buildMatchingNotationQuestion() {
    const pairs = shuffleArray([
        { number: '301.964.898', scientific: '3.02 × 10^8' },
        { number: '48.000.000', scientific: '4.8 × 10^7' },
        { number: '0,00000065', scientific: '6.5 × 10^-7' },
        { number: '7.800.000', scientific: '7.8 × 10^6' },
        { number: '0,0000042', scientific: '4.2 × 10^-6' },
        { number: '12.500', scientific: '1.25 × 10^4' }
    ]).slice(0, 3);

    return {
        type: 'matchScientific',
        themed: true,
        matchData: {
            pairs: pairs.map((pair, index) => ({
                id: `match-${index}-${Date.now()}`,
                number: pair.number,
                scientific: pair.scientific
            }))
        }
    };
}

function generateNotationQuestions(level = 1) {
    const totalQuestions = 10;
    const themeIndexes = [1, 5, 8];
    const questions = Array(totalQuestions).fill(null);
    const normalQuestions = [];
    const maxCoefficient = level >= 3 ? 99 : 90;
    const exponentRange = level >= 3 ? 25 : 20;

    // 3 preguntas temáticas distribuidas a lo largo del desafío
    for (let i = 0; i < themeIndexes.length; i++) {
        const themeQuestion = notationThemeBank[Math.floor(Math.random() * notationThemeBank.length)];
        questions[themeIndexes[i]] = {
            ...themeQuestion,
            themed: true,
            prompt: themeQuestion.prompt,
            displayValue: themeQuestion.displayValue
        };
    }

    questions[3] = buildMatchingNotationQuestion();

    // 3 preguntas: convertir a notación científica
    for (let i = 0; i < 3; i++) {
        let num;
        if (Math.random() > 0.5) {
            num = Math.floor(Math.random() * (level >= 3 ? 9999999999 : 999000000)) + (level >= 2 ? 100000 : 1000000);
        } else {
            num = Math.random() * (level >= 3 ? 0.0000001 : 0.00001);
        }
        normalQuestions.push({ type: 'toScientific', number: num, themed: false });
    }

    // 3 preguntas: convertir de notación científica a número
    for (let i = 0; i < 3; i++) {
        const coefficient = Math.floor(Math.random() * maxCoefficient) + 10;
        const exponent = Math.floor(Math.random() * exponentRange) - Math.floor(exponentRange / 2);
        normalQuestions.push({ type: 'toNumber', coefficient, exponent, themed: false });
    }

    let normalIndex = 0;
    for (let i = 0; i < totalQuestions; i++) {
        if (!questions[i]) {
            questions[i] = normalQuestions[normalIndex];
            normalIndex++;
        }
    }

    return questions;
}

// Iniciar juego de notación
function startNotationGame() {
    const saved = getSavedProgress();
    notationGameState.currentQuestion = 0;
    notationGameState.correctAnswers = 0;
    notationGameState.currentStreak = 0;
    notationGameState.bestStreak = 0;
    notationGameState.combo = 1;
    notationGameState.level = saved.notationLevel || 1;
    notationGameState.specialLevelUnlocked = false;
    notationGameState.questions = generateNotationQuestions(notationGameState.level);
    
    document.getElementById('notationGameStart').style.display = 'none';
    document.getElementById('notationGamePlay').style.display = 'block';
    document.getElementById('notationGameEnd').style.display = 'none';
    
    loadNotationQuestion();
}

// Cargar una pregunta de notación
function loadNotationQuestion() {
    if (notationGameState.currentQuestion >= 10) {
        endNotationGame();
        return;
    }
    
    const question = notationGameState.questions[notationGameState.currentQuestion];
    notationGameState.currentType = question.type;
    
    document.getElementById('notationQuestionNum').textContent = notationGameState.currentQuestion + 1;
    document.getElementById('notationScoreDisplay').textContent = notationGameState.correctAnswers;
    updateChallengeHud(notationGameState, 'notation');
    
    let inputArea = document.getElementById('notationInputArea');
    inputArea.innerHTML = '';
    
    if (question.type === 'toScientific') {
        notationGameState.currentNumber = question.number;

        if (question.themed) {
            document.getElementById('notationPrompt').textContent = question.prompt;
            document.getElementById('notationNumber').innerHTML = MathDisplay.format(question.displayValue);
        } else {
            document.getElementById('notationPrompt').textContent = 'Convierte este número a notación científica:';
            document.getElementById('notationNumber').textContent = question.number.toLocaleString('es-CL', {maximumFractionDigits: 10});
        }
        
        inputArea.innerHTML = `
            <div class="notation-input-row">
                <label>Coeficiente (a):</label>
                <input type="text" id="notationCoeff" placeholder="Escribe 1 a 9,9 (ej: 3,02)" maxlength="10">
            </div>
            <div class="notation-input-row">
                <label>Exponente (n):</label>
                <input type="text" id="notationExp" placeholder="Solo escribe el exponente (ej: 8, 5 o -3). No pongas x10^" maxlength="10">
            </div>
        `;
    } else if (question.type === 'matchScientific') {
        notationGameState.currentType = 'matchScientific';
        notationGameState.currentNumber = null;
        document.getElementById('notationPrompt').textContent = 'Arrastra cada número hasta su notación científica';
        document.getElementById('notationNumber').textContent = 'Une cada valor con su pareja correcta.';

        const matchData = question.matchData.pairs;
        const leftItems = shuffleArray(matchData.map(item => ({
            id: item.id,
            value: item.number,
            type: 'number'
        })));
        const rightItems = shuffleArray(matchData.map(item => ({
            id: item.id,
            value: item.scientific,
            type: 'scientific'
        })));

        inputArea.innerHTML = `
            <div class="notation-match-container">
                <div class="notation-match-column">
                    <div class="match-column-title">Números</div>
                    <div id="notationMatchLeft" class="match-drop-list"></div>
                </div>
                <div class="notation-match-column">
                    <div class="match-column-title">Notación científica</div>
                    <div id="notationMatchRight" class="match-drop-list"></div>
                </div>
            </div>
        `;

        const leftColumn = document.getElementById('notationMatchLeft');
        const rightColumn = document.getElementById('notationMatchRight');

        leftItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'notation-match-item';
            card.draggable = true;
            card.dataset.matchId = item.id;
            card.textContent = item.value;
            card.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', item.id);
                event.dataTransfer.effectAllowed = 'move';
            });
            leftColumn.appendChild(card);
        });

        rightItems.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'notation-match-slot';
            slot.dataset.matchId = item.id;
            slot.innerHTML = `<span class="match-slot-target">${MathDisplay.format(item.value)}</span>`;
            slot.addEventListener('dragover', (event) => {
                event.preventDefault();
                if (!slot.classList.contains('match-correct')) {
                    slot.classList.add('drag-over');
                }
            });
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const draggedId = event.dataTransfer.getData('text/plain');
                const correctId = slot.dataset.matchId;

                if (draggedId === correctId) {
                    slot.classList.add('match-correct');
                    slot.innerHTML = `<span class="match-slot-correct">${MathDisplay.format(item.value)}</span>`;
                    const sourceCard = leftColumn.querySelector(`[data-match-id="${draggedId}"]`);
                    if (sourceCard) {
                        sourceCard.classList.add('matched');
                        sourceCard.draggable = false;
                        sourceCard.style.opacity = '0.45';
                    }
                    checkAllMatchesResolved();
                } else {
                    slot.classList.add('match-error');
                    const originalText = slot.innerHTML;
                    slot.innerHTML = '<span class="match-slot-hint">Intenta otra vez</span>';
                    setTimeout(() => {
                        slot.classList.remove('match-error');
                        slot.innerHTML = originalText;
                    }, 750);
                }
            });
            rightColumn.appendChild(slot);
        });
    } else {
        notationGameState.currentNumber = scientificToNumber(question.coefficient, question.exponent);

        if (question.themed) {
            document.getElementById('notationPrompt').textContent = question.prompt;
            document.getElementById('notationNumber').textContent = question.displayValue;
        } else {
            document.getElementById('notationPrompt').textContent = 'Convierte a número decimal:';
            document.getElementById('notationNumber').innerHTML = NotationCore.scientificToHtml(question.coefficient, question.exponent);
        }
        
        inputArea.innerHTML = `
            <div class="notation-input-row">
                <label>Número completo:</label>
                <input type="text" id="notationFull" placeholder="Escribe el número completo (ej: 470000000 o 0,0000000065)">
            </div>
        `;
    }
}

function getNotationHelpContext() {
    const question = notationGameState.questions[notationGameState.currentQuestion];
    if (!question) return null;

    if (question.type === 'toScientific') {
        return {
            title: 'Ayuda: convertir a notación científica',
            message: 'Mueve la coma hasta dejar un solo dígito distinto de cero antes de ella. La cantidad de lugares indica el exponente.',
            example: 'Ejemplo: 470.000 = 4,7 × 10⁵.'
        };
    }

    if (question.type === 'toNumber') {
        return {
            title: 'Ayuda: convertir a número decimal',
            message: 'Si el exponente es positivo, mueve la coma hacia la derecha. Si es negativo, muévela hacia la izquierda y completa con ceros.',
            example: 'Ejemplo: 4,7 × 10⁻³ = 0,0047.'
        };
    }

    return {
        title: 'Ayuda: relacionar equivalencias',
        message: 'Compara el valor decimal con el exponente: una potencia positiva representa un número grande y una negativa, uno pequeño.',
        example: 'Ejemplo: 48.000.000 = 4,8 × 10⁷.'
    };
}

function checkAllMatchesResolved() {
    const slots = document.querySelectorAll('.notation-match-slot');
    const allResolved = Array.from(slots).every(slot => slot.classList.contains('match-correct'));

    if (allResolved) {
        notationGameState.correctAnswers++;
        registerAnswerOutcome(notationGameState, true, 'notation');
        playClickSound('add');
        triggerConfetti();
        const specialMessage = notationGameState.specialLevelUnlocked ? ' ¡Nivel especial desbloqueado! 🔓' : '';
        showNotationFeedback('✅', '¡Perfecto!', `Relacionaste todos los números correctamente.${specialMessage}`, true, 'Todas las parejas están bien');
    }
}

// Verificar respuesta de notación
function checkNotationAnswer() {
    const type = notationGameState.currentType;
    let isCorrect = false;
    let feedbackExpression = '';
    
    if (type === 'matchScientific') {
        return;
    }

    if (type === 'toScientific') {
        const coeffInput = document.getElementById('notationCoeff').value.trim();
        const expInput = document.getElementById('notationExp').value.trim();
        
        if (!coeffInput || !expInput) {
            alert('Por favor completa ambos campos');
            return;
        }
        
        const coeff = normalizeLocaleNumber(coeffInput);
        const exp = parseExponentInput(expInput);
        const attemptedAnswer = `${coeffInput.replace(/\./g, ',')} × 10^${expInput}`;
        
        if (isNaN(coeff) || isNaN(exp)) {
            alert('Escribe solo el exponente, por ejemplo 8, 5 o -3. Si quieres, también puedes escribir x10^8.');
            return;
        }
        
        const expected = numberToScientific(notationGameState.currentNumber);
        isCorrect = Math.abs(coeff - parseFloat(expected.coefficient)) < 0.01 && exp === expected.exponent;
        feedbackExpression = NotationCore.scientificToHtml(expected.coefficient, expected.exponent);
        
        if (isCorrect) {
            notationGameState.correctAnswers++;
            registerAnswerOutcome(notationGameState, true, 'notation');
            playClickSound('add');
            triggerConfetti();
            const specialMessage = notationGameState.specialLevelUnlocked ? ' ¡Nivel especial desbloqueado! 🔓' : '';
            showNotationFeedback('✅', '¡Correcto!', `${coeff} × 10^${exp}${specialMessage}`, true, feedbackExpression);
        } else {
            registerAnswerOutcome(notationGameState, false, 'notation');
            playClickSound('sub');
            const hint = exp === expected.exponent ? 'El coeficiente estaba cerca, pero no en el formato correcto.' : 'Observa cuántos lugares mueve la coma: si el número es grande, el exponente aumenta; si es pequeño, el exponente baja.';
            showNotationFeedback('❌', 'Incorrecto', `Tu respuesta fue: ${attemptedAnswer}. ${hint}`, false, feedbackExpression);
        }
    } else {
        const fullInput = document.getElementById('notationFull').value.trim();
        
        if (!fullInput) {
            alert('Por favor ingresa el número');
            return;
        }
        
        const num = normalizeLocaleNumber(fullInput);
        const attemptedAnswer = fullInput;
        
        if (isNaN(num)) {
            alert('Por favor ingresa un número válido');
            return;
        }
        
        isCorrect = Math.abs(num - notationGameState.currentNumber) < 0.0001;
        const expectedScientific = numberToScientific(notationGameState.currentNumber);
        feedbackExpression = NotationCore.scientificToHtml(expectedScientific.coefficient, expectedScientific.exponent);
        
        if (isCorrect) {
            notationGameState.correctAnswers++;
            registerAnswerOutcome(notationGameState, true, 'notation');
            playClickSound('add');
            triggerConfetti();
            const specialMessage = notationGameState.specialLevelUnlocked ? ' ¡Nivel especial desbloqueado! 🔓' : '';
            showNotationFeedback('✅', '¡Correcto!', `${num.toLocaleString('es-CL', {maximumFractionDigits: 10})}${specialMessage}`, true, feedbackExpression);
        } else {
            registerAnswerOutcome(notationGameState, false, 'notation');
            playClickSound('sub');
            const hint = notationGameState.currentNumber >= 1 ? 'Recuerda: el número grande tiene exponente positivo y la coma se mueve hacia la izquierda.' : 'Recuerda: el número pequeño tiene exponente negativo y la coma se mueve hacia la derecha.';
            showNotationFeedback('❌', 'Incorrecto', `Tu respuesta fue: ${attemptedAnswer}. ${hint} La respuesta correcta es: ${notationGameState.currentNumber.toLocaleString('es-CL', {maximumFractionDigits: 10})}`, false, feedbackExpression);
        }
    }
}

// Mostrar retroalimentación de notación
function showNotationFeedback(icon, title, message, isCorrect, expression = '') {
    const feedbackElement = document.getElementById('feedbackModal');
    const feedbackExpression = document.getElementById('feedbackExpression');
    document.getElementById('feedbackIcon').textContent = icon;
    document.getElementById('feedbackTitle').textContent = title;
    document.getElementById('feedbackMessage').innerHTML = MathDisplay.format(message);
    
    if (expression) {
        feedbackExpression.innerHTML = `<span class="notation-feedback-formula">${expression}</span>`;
        feedbackExpression.style.display = 'block';
    } else {
        feedbackExpression.style.display = 'none';
    }
    
    feedbackElement.querySelector('.feedback-btn').onclick = () => closeNotationFeedback();
    feedbackElement.style.display = 'flex';
}

// Cerrar modal y continuar a siguiente pregunta (notación)
function closeNotationFeedback() {
    document.getElementById('feedbackModal').style.display = 'none';
    notationGameState.currentQuestion++;
    
    if (notationGameState.currentQuestion >= 10) {
        endNotationGame();
    } else {
        loadNotationQuestion();
    }
}

// Cancelar juego de notación
function cancelNotationGame() {
    document.getElementById('confirmModal').style.display = 'flex';
}

// Finalizar juego de notación
function endNotationGame() {
    document.getElementById('notationGamePlay').style.display = 'none';
    document.getElementById('notationGameEnd').style.display = 'block';
    document.getElementById('notationFinalScore').textContent = notationGameState.correctAnswers;

    if (notationGameState.correctAnswers >= 7) {
        const previousLevel = notationGameState.level;
        notationGameState.level = Math.min(3, notationGameState.level + 1);
        if (notationGameState.level !== previousLevel) {
            showComboBurst(`¡Nivel ${notationGameState.level} desbloqueado!`, 'notation', 420);
        }
    }
    saveProgressSnapshot('notation', notationGameState);
    
    let message = '';
    if (notationGameState.correctAnswers === 10) {
        message = '🌟 ¡Perfecto! ¡Eres un experto en notación científica!';
    } else if (notationGameState.correctAnswers >= 8) {
        message = '⭐ ¡Excelente! Casi perfecto.';
    } else if (notationGameState.correctAnswers >= 6) {
        message = '👍 ¡Bien hecho! Sigue practicando.';
    } else if (notationGameState.correctAnswers >= 4) {
        message = '📚 Buen intento. Practica un poco más.';
    } else {
        message = '💪 ¡Vamos! Inténtalo de nuevo.';
    }
    
    document.getElementById('notationFinalMessage').textContent = `${message} Nivel actual: ${notationGameState.level}`;
}
