// Extracted JS from original file
const STORAGE_KEY = 'numeroConstructorProgress';

const denominations = [
    { value: 1000000, name: 'Millones', color: 'color-green' },
    { value: 100000, name: 'CienMiles', color: 'color-blue' },
    { value: 10000, name: 'DiezMiles', color: 'color-coral' },
    { value: 1000, name: 'Miles', color: 'color-purple' },
    { value: 100, name: 'Centenas', color: 'color-amber' },
    { value: 10, name: 'Decenas', color: 'color-red' },
    { value: 1, name: 'Unidades', color: 'color-lime' }
];

function getSavedProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return {
            compositionLevel: Math.max(1, Number(saved.compositionLevel) || 1),
            notationLevel: Math.max(1, Number(saved.notationLevel) || 1),
            bestComposition: Number(saved.bestComposition) || 0,
            bestNotation: Number(saved.bestNotation) || 0
        };
    } catch (e) {
        return {
            compositionLevel: 1,
            notationLevel: 1,
            bestComposition: 0,
            bestNotation: 0
        };
    }
}

function saveProgressSnapshot(key, state) {
    const saved = getSavedProgress();
    const next = {
        ...saved,
        compositionLevel: key === 'game' ? Math.max(saved.compositionLevel, Math.max(1, state.level || 1)) : saved.compositionLevel,
        notationLevel: key === 'notation' ? Math.max(saved.notationLevel, Math.max(1, state.level || 1)) : saved.notationLevel,
        bestComposition: key === 'game' ? Math.max(saved.bestComposition, state.correctAnswers || 0) : saved.bestComposition,
        bestNotation: key === 'notation' ? Math.max(saved.bestNotation, state.correctAnswers || 0) : saved.bestNotation
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
}

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
        o.frequency.value = type === 'add' ? 760 : 420;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.025, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        o.start(now);
        o.stop(now + 0.22);
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
    questions: [],
    currentStreak: 0,
    bestStreak: 0,
    combo: 1,
    level: 1,
    specialLevelUnlocked: false
};

function triggerConfetti() {
    const container = document.getElementById('confettiLayer');
    if (!container) return;

    const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#4ecdc4', '#5b8def', '#9b5de5', '#f15bb5'];
    const confettiCount = 32;

    container.innerHTML = '';

    for (let i = 0; i < confettiCount; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        const angle = (Math.PI * 2 * i) / confettiCount;
        const radius = 60 + Math.random() * 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const r = (Math.random() * 360) - 180;

        piece.style.background = colors[i % colors.length];
        piece.style.setProperty('--x', `${x}px`);
        piece.style.setProperty('--y', `${y}px`);
        piece.style.setProperty('--r', `${r}deg`);

        container.appendChild(piece);
    }

    setTimeout(() => {
        container.innerHTML = '';
    }, 1200);
}

function showComboBurst(label, key = 'game', delay = 320) {
    const burst = document.getElementById('comboBurst');
    const badge = document.getElementById(`${key}ComboBadge`);
    if (!burst || !badge) return;

    setTimeout(() => {
        burst.textContent = label;
        const rect = badge.getBoundingClientRect();
        burst.style.left = `${rect.left + rect.width / 2}px`;
        burst.style.top = `${rect.top - 8}px`;
        burst.classList.remove('show');
        void burst.offsetWidth;
        burst.classList.add('show');

        setTimeout(() => {
            burst.classList.remove('show');
        }, 1200);
    }, delay);
}

function updateChallengeHud(state, key = 'game') {
    const totalQuestions = state.questions.length || 10;
    const progressPercent = (state.currentQuestion / totalQuestions) * 100;
    const progressFill = document.getElementById(`${key}ProgressFill`);
    const comboBadge = document.getElementById(`${key}ComboBadge`);
    const streakBadge = document.getElementById(`${key}StreakBadge`);
    const levelBadge = document.getElementById(`${key}LevelBadge`);

    if (progressFill) {
        progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
    }

    if (comboBadge) {
        comboBadge.textContent = `Combo x${Math.max(1, state.combo)}`;
    }

    if (streakBadge) {
        streakBadge.textContent = `Racha ${state.currentStreak}`;
    }

    if (levelBadge) {
        levelBadge.textContent = state.specialLevelUnlocked ? '⭐ Nivel especial' : `Nivel ${state.level}`;
    }
}

function registerAnswerOutcome(state, isCorrect, key = 'game') {
    const previousCombo = state.combo;
    const previousLevel = state.level;

    if (isCorrect) {
        state.currentStreak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
        state.combo = Math.max(1, Math.min(5, 1 + Math.floor((state.currentStreak - 1) / 2)));
        state.level = Math.min(3, Math.max(1, Math.floor(state.correctAnswers / 3) + 1));
        state.specialLevelUnlocked = state.correctAnswers > 0 && state.correctAnswers % 3 === 0;
    } else {
        state.currentStreak = 0;
        state.combo = 1;
        state.specialLevelUnlocked = false;
        state.level = 1;
    }

    updateChallengeHud(state, key);
    saveProgressSnapshot(key, state);

    if (isCorrect && state.combo !== previousCombo) {
        showComboBurst(`¡Poder x${state.combo}!`, key, 320);
    } else if (isCorrect) {
        showComboBurst('¡Combo!', key, 320);
    } else {
        showComboBurst('Racha 0', key, 320);
    }

    if (isCorrect && state.level !== previousLevel) {
        showComboBurst(`¡Nivel ${state.level} desbloqueado!`, key, 620);
    }
}

// Generar números aleatorios con énfasis en ceros
function generateRandomNumbers(level = 1) {
    const questions = [];
    const totalQuestions = 10;
    const zeroQuestionsCount = 3 + (level >= 2 ? 1 : 0);
    const normalQuestionsCount = totalQuestions - zeroQuestionsCount;
    const maxRange = level >= 3 ? 99999999 : 9999999;

    // Preguntas NORMALES (sin énfasis en ceros)
    for (let i = 0; i < normalQuestionsCount; i++) {
        let num = 0;
        while (num === 0 || num > maxRange) {
            num = Math.floor(Math.random() * (maxRange + 1));
        }
        questions.push({ number: num, emphasizeZeros: false });
    }

    // Preguntas CON ÉNFASIS EN CEROS
    for (let i = 0; i < zeroQuestionsCount; i++) {
        let num = generateNumberWithZeros();
        if (level >= 2) {
            num = Math.max(1000, num + Math.floor(Math.random() * 50000));
        }
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
    const saved = getSavedProgress();
    gameState.level = saved.compositionLevel || 1;
    gameState.currentQuestion = 0;
    gameState.correctAnswers = 0;
    gameState.currentStreak = 0;
    gameState.combo = 1;
    gameState.specialLevelUnlocked = false;
    gameState.questions = generateRandomNumbers(gameState.level);

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
    updateChallengeHud(gameState, 'game');

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

function shouldWrapDigitSelector(value) {
    return [1000000, 100000, 10000, 1000, 100, 10, 1].includes(value);
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
    const isCorrect = JSON.stringify(gameState.gameState) === JSON.stringify(gameState.targetAnswers);

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

function normalizeLocaleNumber(value) {
    if (value === null || value === undefined) return NaN;

    let raw = String(value).trim().replace(/\s+/g, '');
    if (!raw) return NaN;

    if (raw.includes(',') && raw.includes('.')) {
        const lastComma = raw.lastIndexOf(',');
        const lastDot = raw.lastIndexOf('.');
        if (lastComma > lastDot) {
            raw = raw.replace(/\./g, '').replace(',', '.');
        } else {
            raw = raw.replace(/,/g, '');
        }
    } else if (raw.includes(',')) {
        const parts = raw.split(',');
        if (parts.length > 2) {
            raw = raw.replace(/,/g, '');
        } else {
            raw = raw.replace(',', '.');
        }
    } else if (raw.includes('.')) {
        const parts = raw.split('.');
        if (parts.length > 2) {
            raw = raw.replace(/\./g, '');
        }
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function parseExponentInput(value) {
    if (value === null || value === undefined) return NaN;

    let raw = String(value).trim().toLowerCase().replace(/\s+/g, '');
    if (!raw) return NaN;

    raw = raw.replace(/×/g, 'x');
    raw = raw.replace(/\^/g, '^');

    const directMatch = /^[-+]?\d+$/.test(raw);
    if (directMatch) return Number(raw);

    const scientificMatch = /^x?10\^(?:[-+]?\d+)$/.test(raw);
    if (scientificMatch) {
        const exponent = raw.replace(/^x?10\^/, '');
        return Number(exponent);
    }

    return NaN;
}

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
            document.getElementById('notationNumber').textContent = question.displayValue;
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
            slot.innerHTML = `<span class="match-slot-target">${item.value}</span>`;
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
                    slot.innerHTML = `<span class="match-slot-correct">${item.value}</span>`;
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
            document.getElementById('notationNumber').textContent = `${question.coefficient} × 10^${question.exponent}`;
        }
        
        inputArea.innerHTML = `
            <div class="notation-input-row">
                <label>Número completo:</label>
                <input type="text" id="notationFull" placeholder="Escribe el número completo (ej: 470000000 o 0,0000000065)">
            </div>
        `;
    }
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
        feedbackExpression = expected.scientific;
        
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
            showNotationFeedback('❌', 'Incorrecto', `Tu respuesta fue: ${attemptedAnswer}. ${hint} La respuesta correcta es: ${expected.scientific}`, false, feedbackExpression);
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
        feedbackExpression = expectedScientific.scientific;
        
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
