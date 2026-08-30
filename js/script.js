// Extracted JS from original file
const denominations = [
    { value: 1000000, name: 'Millones', color: 'color-green' },
    { value: 100000, name: 'CienMiles', color: 'color-blue' },
    { value: 10000, name: 'DiezMiles', color: 'color-coral' },
    { value: 1000, name: 'Miles', color: 'color-purple' },
    { value: 100, name: 'Centenas', color: 'color-amber' },
    { value: 10, name: 'Decenas', color: 'color-red' },
    { value: 1, name: 'Unidades', color: 'color-lime' }
];

let state = {
    1000000: 0,
    100000: 0,
    10000: 0,
    1000: 0,
    100: 0,
    10: 0,
    1: 0
};

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

    const totalStr = total.toString().padStart(7, '0');

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
        1000000: 'term-green',
        100000: 'term-blue',
        10000: 'term-coral',
        1000: 'term-purple',
        100: 'term-amber',
        10: 'term-red',
        1: 'term-lime'
    };

    const exponentsMap = {
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

// Reproducir un efecto sonoro corto usando WebAudio (no requiere archivos externos)
function playClickSound(type = 'add') {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = type === 'add' ? 880 : 520;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        o.start(now);
        o.stop(now + 0.18);
        setTimeout(() => { try { ctx.close(); } catch (e) {} }, 500);
    } catch (e) { }
}

function loadExample(example) { state = { ...example }; render(); }

function resetAll() {
    state = { 1000000:0,100000:0,10000:0,1000:0,100:0,10:0,1:0 };
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
    questions: []
};

// Generar números aleatorios con énfasis en ceros
function generateRandomNumbers() {
    const questions = [];
    const totalQuestions = 10;
    const zeroQuestionsCount = 3;
    const normalQuestionsCount = totalQuestions - zeroQuestionsCount;

    // Preguntas NORMALES (sin énfasis en ceros)
    for (let i = 0; i < normalQuestionsCount; i++) {
        let num = 0;
        while (num === 0 || num > 9999999) {
            num = Math.floor(Math.random() * 10000000);
        }
        questions.push({ number: num, emphasizeZeros: false });
    }

    // Preguntas CON ÉNFASIS EN CEROS
    for (let i = 0; i < zeroQuestionsCount; i++) {
        let num = generateNumberWithZeros();
        questions.push({ number: num, emphasizeZeros: true });
    }

    // Barajar
    return questions.sort(() => Math.random() - 0.5);
}

// Generar número con ceros estratégicos (como en la guía)
function generateNumberWithZeros() {
    const templates = [
        // Formato: millones.centenas.miles.unidades
        [Math.floor(Math.random() * 9) + 1, 0, Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9)],
        [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, 0, Math.floor(Math.random() * 999)],
        [Math.floor(Math.random() * 9) + 1, 0, 0, Math.floor(Math.random() * 999)],
        [Math.floor(Math.random() * 9) + 1, 0, Math.floor(Math.random() * 99) + 1, 0],
        [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 99), Math.floor(Math.random() * 9)],
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template[0] * 1000000 + template[1] * 100000 + template[2] * 1000 + template[3];
}

// Convertir número a respuesta esperada (descomposición)
function numberToAnswer(num) {
    const numStr = num.toString().padStart(7, '0');
    return {
        1000000: parseInt(numStr[0]),
        100000: parseInt(numStr[1]),
        10000: parseInt(numStr[2]),
        1000: parseInt(numStr[3]),
        100: parseInt(numStr[4]),
        10: parseInt(numStr[5]),
        1: parseInt(numStr[6])
    };
}

// Generar expresión matemática para un número
function generateExpression(num) {
    const answer = numberToAnswer(num);
    
    const termColorMap = {
        1000000: 'term-green',
        100000: 'term-blue',
        10000: 'term-coral',
        1000: 'term-purple',
        100: 'term-amber',
        10: 'term-red',
        1: 'term-lime'
    };

    const exponentsMap = {
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

    for (const [value, count] of Object.entries(answer)) {
        const val = parseInt(value);
        if (count > 0) {
            const colorClass = termColorMap[val];
            const exponent = exponentsMap[val];
            const termNormal = `<span class="expression-term ${colorClass}">${count}×${val.toLocaleString('es-CL')}</span>`;
            termsNormal.push(termNormal);
            const termExp = `<span class="expression-term ${colorClass}">${count}×10<sup>${exponent}</sup></span>`;
            termsExponential.push(termExp);
        }
    }

    const expressionN = termsNormal.length > 0 ? termsNormal.join(' <span class="plus">+</span> ') : '0';
    const expressionE = termsExponential.length > 0 ? termsExponential.join(' <span class="plus">+</span> ') : '0';
    const resultHtml = `<span class="result">${num.toLocaleString('es-CL')}</span>`;

    return `
        <div class="expression-form">
            <div class="form-label">Forma normal</div>
            ${expressionN} <span class="equals">=</span> ${resultHtml}
        </div>
        <div class="expression-form">
            <div class="form-label">Forma exponencial</div>
            ${expressionE} <span class="equals">=</span> ${resultHtml}
        </div>
    `;
}

// Iniciar el juego
function startGame() {
    gameState.currentQuestion = 0;
    gameState.correctAnswers = 0;
    gameState.questions = generateRandomNumbers();

    // Ocultar pantalla de inicio
    document.getElementById('gameStart').style.display = 'none';
    document.getElementById('gameEnd').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';

    // Limpiar estado de juego
    gameState.gameState = {
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

    // Limpiar respuesta anterior
    gameState.gameState = {
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

    // Mostrar pista si es pregunta de ceros
    const hintEl = document.getElementById('gameHint');
    if (gameState.isZeroQuestion) {
        hintEl.textContent = '⚠️ Pista: Este número tiene ceros. ¡Fíjate bien en los lugares vacíos!';
        hintEl.style.display = 'block';
    } else {
        hintEl.style.display = 'none';
    }

    renderGameMoney();
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

// Cambiar dinero en el juego
function gameChangeMoney(value, delta) {
    gameState.gameState[value] = Math.max(0, gameState.gameState[value] + delta);
    renderGameMoney();
}

// Verificar respuesta
function checkAnswer() {
    const isCorrect = JSON.stringify(gameState.gameState) === JSON.stringify(gameState.targetAnswers);

    if (isCorrect) {
        gameState.correctAnswers++;
        const expression = generateExpression(gameState.currentNumber);
        showFeedback('✅', '¡Correcto!', 'Muy bien, lo hiciste perfecto.', expression);
    } else {
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

    document.getElementById('finalMessage').textContent = message;
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

    // Ocultar menú principal
    mainMenu.classList.remove('active');

    // Ocultar todos los modos
    if (modoFree) modoFree.classList.remove('active');
    if (compositionGameMode) compositionGameMode.classList.remove('active');
    if (notationFreeMode) notationFreeMode.classList.remove('active');
    if (notationGameMode) notationGameMode.classList.remove('active');

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
    }
}

// Volver al menú principal
function backToMenu() {
    const mainMenu = document.getElementById('mainMenu');
    const modoFree = document.getElementById('modoFree');
    const compositionGameMode = document.getElementById('compositionGameMode');
    const notationFreeMode = document.getElementById('notationFreeMode');
    const notationGameMode = document.getElementById('notationGameMode');

    // Ocultar todos los modos
    if (modoFree) modoFree.classList.remove('active');
    if (compositionGameMode) compositionGameMode.classList.remove('active');
    if (notationFreeMode) notationFreeMode.classList.remove('active');
    if (notationGameMode) notationGameMode.classList.remove('active');

    // Mostrar menú principal
    mainMenu.classList.add('active');
}

// ===== NOTACIÓN CIENTÍFICA =====

// Convertir número a notación científica
function numberToScientific(num) {
    if (num === 0) return { coefficient: 0, exponent: 0, scientific: '0' };
    
    const isNegative = num < 0;
    num = Math.abs(num);
    
    let exponent = 0;
    let coefficient = num;
    
    // Para números grandes
    if (num >= 10) {
        while (coefficient >= 10) {
            coefficient /= 10;
            exponent++;
        }
    }
    // Para números pequeños
    else if (num < 1) {
        while (coefficient < 1) {
            coefficient *= 10;
            exponent--;
        }
    }
    
    // Redondear a 2 decimales
    coefficient = Math.round(coefficient * 100) / 100;
    
    const sign = isNegative ? '-' : '';
    const scientific = `${sign}${coefficient} × 10^${exponent}`;
    
    return { coefficient: sign + coefficient, exponent, scientific };
}

// Convertir notación científica a número
function scientificToNumber(coefficient, exponent) {
    const coef = parseFloat(coefficient);
    const exp = parseInt(exponent);
    return coef * Math.pow(10, exp);
}

// Procesar número en notación científica (modo libre)
function processNotationNumber() {
    const input = document.getElementById('numberInput').value.trim();
    
    if (!input) {
        alert('Por favor ingresa un número');
        return;
    }
    
    const num = parseFloat(input.replace(/,/g, ''));
    
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
    document.getElementById('notationFormula').innerHTML = `${result.scientific}`;
    
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
    currentQuestion: 0,
    currentType: 'toScientific', // toScientific o toNumber
    currentNumber: 0,
    currentAnswer: null
};

const notationThemeBank = [
    {
        type: 'toScientific',
        prompt: 'En un partido, un jugador corrió',
        displayValue: '12 500 metros',
        number: 12500
    },
    {
        type: 'toScientific',
        prompt: 'Un estadio tiene',
        displayValue: '45 000 asientos',
        number: 45000
    },
    {
        type: 'toScientific',
        prompt: 'En una ciudad viven',
        displayValue: '3 800 000 personas',
        number: 3800000
    },
    {
        type: 'toScientific',
        prompt: 'Un manga vendió',
        displayValue: '2 500 000 copias',
        number: 2500000
    },
    {
        type: 'toNumber',
        prompt: 'Escribe este número en forma decimal:',
        displayValue: '2,5 × 10^6 copias',
        coefficient: 2.5,
        exponent: 6
    },
    {
        type: 'toNumber',
        prompt: 'Escribe este número en forma decimal:',
        displayValue: '4,8 × 10^4 km',
        coefficient: 4.8,
        exponent: 4
    },
    {
        type: 'toScientific',
        prompt: 'La distancia de una misión espacial fue',
        displayValue: '78 000 000 metros',
        number: 78000000
    },
    {
        type: 'toScientific',
        prompt: 'Un videojuego tuvo',
        displayValue: '1 200 000 visitas',
        number: 1200000
    }
];

// Generar preguntas de notación
function generateNotationQuestions() {
    const questions = [];
    const totalQuestions = 10;
    const themeCount = Math.floor(totalQuestions * 0.25);
    const toScientificCount = 5;

    // 25% de preguntas temáticas para niños
    for (let i = 0; i < themeCount; i++) {
        const themeQuestion = notationThemeBank[Math.floor(Math.random() * notationThemeBank.length)];
        questions.push({
            ...themeQuestion,
            themed: true,
            prompt: themeQuestion.prompt,
            displayValue: themeQuestion.displayValue
        });
    }

    // 5 preguntas: convertir a notación científica
    for (let i = 0; i < toScientificCount; i++) {
        let num;
        if (Math.random() > 0.5) {
            num = Math.floor(Math.random() * 999000000) + 1000000;
        } else {
            num = Math.random() * 0.00001;
        }
        questions.push({ type: 'toScientific', number: num, themed: false });
    }

    // 5 preguntas: convertir de notación científica a número
    for (let i = 0; i < 5; i++) {
        const coefficient = Math.floor(Math.random() * 90) + 10;
        const exponent = Math.floor(Math.random() * 20) - 10;
        questions.push({ type: 'toNumber', coefficient, exponent, themed: false });
    }

    return questions.sort(() => Math.random() - 0.5).slice(0, totalQuestions);
}

// Iniciar juego de notación
function startNotationGame() {
    notationGameState.currentQuestion = 0;
    notationGameState.correctAnswers = 0;
    notationGameState.questions = generateNotationQuestions();
    
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
    
    let inputArea = document.getElementById('notationInputArea');
    inputArea.innerHTML = '';
    
    if (question.type === 'toScientific') {
        notationGameState.currentNumber = question.number;

        if (question.themed) {
            document.getElementById('notationPrompt').textContent = `${question.prompt}:`;
            document.getElementById('notationNumber').textContent = question.displayValue;
        } else {
            document.getElementById('notationPrompt').textContent = 'Convierte este número a notación científica:';
            document.getElementById('notationNumber').textContent = question.number.toLocaleString('es-CL', {maximumFractionDigits: 10});
        }
        
        inputArea.innerHTML = `
            <div class="notation-input-row">
                <label>Coeficiente (a):</label>
                <input type="text" id="notationCoeff" placeholder="ej: 4.7" maxlength="10">
            </div>
            <div class="notation-input-row">
                <label>Exponente (n):</label>
                <input type="text" id="notationExp" placeholder="ej: 8 o -5" maxlength="5">
            </div>
        `;
    } else {
        notationGameState.currentNumber = scientificToNumber(question.coefficient, question.exponent);

        if (question.themed) {
            document.getElementById('notationPrompt').textContent = question.prompt;
            document.getElementById('notationNumber').textContent = question.displayValue;
        } else {
            document.getElementById('notationPrompt').textContent = 'Escribe este número en forma decimal:';
            document.getElementById('notationNumber').textContent = `${question.coefficient} × 10^${question.exponent}`;
        }
        
        inputArea.innerHTML = `
            <div class="notation-input-row">
                <label>Número completo:</label>
                <input type="text" id="notationFull" placeholder="ej: 470000000 o 0.0000000065">
            </div>
        `;
    }
}

// Verificar respuesta de notación
function checkNotationAnswer() {
    const type = notationGameState.currentType;
    let isCorrect = false;
    let feedbackExpression = '';
    
    if (type === 'toScientific') {
        const coeffInput = document.getElementById('notationCoeff').value.trim();
        const expInput = document.getElementById('notationExp').value.trim();
        
        if (!coeffInput || !expInput) {
            alert('Por favor completa ambos campos');
            return;
        }
        
        const coeff = parseFloat(coeffInput);
        const exp = parseInt(expInput);
        
        if (isNaN(coeff) || isNaN(exp)) {
            alert('Por favor ingresa valores válidos');
            return;
        }
        
        const expected = numberToScientific(notationGameState.currentNumber);
        isCorrect = Math.abs(coeff - parseFloat(expected.coefficient)) < 0.01 && exp === expected.exponent;
        feedbackExpression = expected.scientific;
        
        if (isCorrect) {
            notationGameState.correctAnswers++;
            showNotationFeedback('✅', '¡Correcto!', `${coeff} × 10^${exp}`, true, feedbackExpression);
        } else {
            showNotationFeedback('❌', 'Incorrecto', `La respuesta correcta es: ${expected.scientific}`, false, feedbackExpression);
        }
    } else {
        const fullInput = document.getElementById('notationFull').value.trim().replace(/,/g, '');
        
        if (!fullInput) {
            alert('Por favor ingresa el número');
            return;
        }
        
        const num = parseFloat(fullInput);
        
        if (isNaN(num)) {
            alert('Por favor ingresa un número válido');
            return;
        }
        
        isCorrect = Math.abs(num - notationGameState.currentNumber) < 0.0001;
        const expectedScientific = numberToScientific(notationGameState.currentNumber);
        feedbackExpression = expectedScientific.scientific;
        
        if (isCorrect) {
            notationGameState.correctAnswers++;
            showNotationFeedback('✅', '¡Correcto!', `${num.toLocaleString('es-CL', {maximumFractionDigits: 10})}`, true, feedbackExpression);
        } else {
            showNotationFeedback('❌', 'Incorrecto', `La respuesta correcta es: ${notationGameState.currentNumber.toLocaleString('es-CL', {maximumFractionDigits: 10})}`, false, feedbackExpression);
        }
    }
}

// Mostrar retroalimentación de notación
function showNotationFeedback(icon, title, message, isCorrect, expression = '') {
    const feedbackElement = document.getElementById('feedbackModal');
    const feedbackExpression = document.getElementById('feedbackExpression');
    document.getElementById('feedbackIcon').textContent = icon;
    document.getElementById('feedbackTitle').textContent = title;
    document.getElementById('feedbackMessage').textContent = message;
    
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
    
    document.getElementById('notationFinalMessage').textContent = message;
}
