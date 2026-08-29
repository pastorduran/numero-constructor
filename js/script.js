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

    denominations.forEach((denom, idx) => {
        const count = state[denom.value];
        let coinsHtml = '';
        for (let i = 0; i < count; i++) {
            coinsHtml += `<div class="coin ${denom.color}"></div>`;
        }

        const html = `
            <div class="column">
                <div class="stack">${coinsHtml}</div>
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
