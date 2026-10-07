(function () {
    'use strict';

    const QK = window.QuestionKit;
    const { sup, lit, renderTerms, poly, assertEquivalent, buildOptions, gcd } = QK;

    const concepts = Object.freeze([
        {
            id: 'commonFactor',
            title: 'Factor común',
            text: 'Factorizar es escribir una expresión como multiplicación. El factor común es lo que todos los términos comparten.',
            example: '6n + 6c = 6(n + c), porque ambos términos tienen el factor 6.',
            steps: ['Busca qué número o letra se repite en todos los términos.', 'Escribe ese factor fuera del paréntesis.', 'Dentro del paréntesis queda lo que falta de cada término.']
        },
        {
            id: 'variableFactor',
            title: 'Factor común con letras',
            text: 'Las letras también pueden ser factores comunes: se extrae la letra con el menor exponente.',
            example: '3a + 9a² = 3a(1 + 3a).',
            steps: ['Identifica el número que divide a ambos coeficientes.', 'Identifica la letra que comparten todos los términos.', 'Divide cada término entre el factor común y escríbelo dentro del paréntesis.']
        },
        {
            id: 'perfectTrinomial',
            title: 'Trinomio cuadrado perfecto',
            text: 'Un trinomio es cuadrado perfecto cuando el primero y el tercer término son cuadrados y el del medio es el doble producto de sus raíces.',
            example: 'x² + 4x + 4 = (x + 2)², porque x² = x·x, 4 = 2·2 y 4x = 2·x·2.',
            steps: ['Calcula las raíces del primer y tercer término.', 'Comprueba que el término central sea el doble producto de esas raíces.', 'Escribe el resultado como un binomio al cuadrado.']
        },
        {
            id: 'trialError',
            title: 'Ensayo y error',
            text: 'Para factorizar x² + bx + c, busca dos números que sumen b y multipliquen c.',
            example: 'x² + 5x + 6 = (x + 2)(x + 3), porque 2 + 3 = 5 y 2 · 3 = 6.',
            steps: ['Identifica los números b (suma) y c (producto).', 'Busca dos números que sumen b y multipliquen c.', 'Escribe el resultado como dos binomios: (x + n)(x + m).']
        }
    ]);

    const LETTER_PAIRS = [['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']];
    const binomial = (a, u, b, w = '') => `(${renderTerms([{ c: a, lit: u }, { c: b, lit: w }])})`;
    const square = text => `${text}${sup(2)}`;

    /* ---------- Factor común ---------- */

    const litText = exp => Object.keys(exp).sort().filter(k => exp[k] > 0).map(k => lit(k, exp[k])).join('');
    const mulExp = (a, b) => {
        const out = { ...a };
        Object.keys(b).forEach(k => { out[k] = (out[k] || 0) + b[k]; });
        return out;
    };
    const degreeOf = exp => Object.values(exp).reduce((a, b) => a + b, 0);

    function buildCommon(r, cfg) {
        const [u, w] = r.pick(LETTER_PAIRS);
        const g = cfg.numeric ? r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]) : 1;
        const L = cfg.letters ? r.pick([{ [u]: 1 }, { [u]: 2 }, { [u]: 1, [w]: 1 }, { [w]: 1 }]) : {};
        if (g === 1 && Object.keys(L).length === 0) throw new Error('Sin factor común');

        const pool = [{}, { [u]: 1 }, { [w]: 1 }, { [u]: 1, [w]: 1 }, { [u]: 2 }, { [w]: 2 }];
        const minZero = residuals => [u, w].every(k => Math.min(...residuals.map(x => x[k] || 0)) === 0);
        let residuals = null;
        for (let i = 0; i < 80 && !residuals; i++) {
            const pick = r.shuffle(pool).slice(0, cfg.terms);
            if (minZero(pick)) residuals = pick;
        }
        if (!residuals) throw new Error('Sin residuos válidos');

        let ms;
        do {
            ms = residuals.map(() => r.int(1, 6));
        } while (ms.reduce((a, b) => gcd(a, b), 0) !== 1);

        const rows = residuals.map((R, i) => ({ m: ms[i], R, full: mulExp(L, R) }));
        rows.sort((a, b) => degreeOf(b.full) - degreeOf(a.full) || litText(a.full).localeCompare(litText(b.full)));
        rows.forEach((row, i) => { row.sign = i === 0 || !cfg.negative ? 1 : r.sign(); });

        const factorText = `${g > 1 ? g : ''}${litText(L)}`;
        const terms = rows.map(row => ({ c: g * row.m * row.sign, lit: litText(row.full) }));
        const inner = rows.map(row => ({ c: row.m * row.sign, lit: litText(row.R) }));
        return { g, L, rows, factorText, terms, inner, expression: renderTerms(terms) };
    }

    function commonFactorQuestion(r, cfg) {
        const info = buildCommon(r, cfg);
        const { g, L, rows, factorText, terms, inner, expression } = info;
        const hasLetters = Object.keys(L).length > 0;
        const answer = `${factorText}(${renderTerms(inner)})`;
        assertEquivalent(expression, answer);

        const letterText = litText(L);
        const scaled = k => renderTerms(rows.map(row => ({ c: row.m * row.sign * k, lit: litText(row.R) })));
        const withLetters = renderTerms(rows.map(row => ({ c: row.m * row.sign, lit: litText(row.full) })));
        const wrong = [];
        const divisors = [2, 3, 4, 5, 6].filter(h => h < g && g % h === 0);
        if (divisors.length) {
            const h = r.pick(divisors);
            wrong.push({ text: `${h}${letterText}(${scaled(g / h)})`, partial: true });
        }
        if (g > 1 && hasLetters) wrong.push({ text: `${letterText}(${scaled(g)})`, partial: true });
        if (hasLetters) wrong.push({ text: `${g > 1 ? g : ''}(${withLetters})`, partial: true });
        const j = r.int(0, rows.length - 1);
        wrong.push(`${factorText}(${renderTerms(inner.map((t, i) => (i === j ? { c: t.c * Math.max(g, 2), lit: t.lit } : t)))})`);
        wrong.push(`${factorText}(${renderTerms(inner.map(t => ({ c: Math.sign(t.c), lit: t.lit })))})`);
        wrong.push(`${factorText}(${renderTerms(inner.map((t, i) => (i === inner.length - 1 ? { c: -t.c, lit: t.lit } : t)))})`);

        const divisions = terms.map((t, i) => `${renderTerms([t])} ÷ ${factorText} = ${renderTerms([inner[i]])}`).join('; ');
        return {
            type: hasLetters ? 'variableFactor' : 'commonFactor',
            prompt: `Factoriza extrayendo el máximo factor común: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `El máximo factor común es ${factorText}. Divide cada término entre él: ${divisions}. Resultado: ${answer}.`,
            key: `factor|${expression}`
        };
    }

    function findGcfQuestion(r) {
        const info = buildCommon(r, { terms: 2, numeric: true, letters: r.chance(0.6), negative: false });
        const { g, L, factorText, terms, expression } = info;
        const letterText = litText(L);
        const wrong = [`${g * 2}${letterText}`, `${g}${letterText}${Object.keys(L).length ? '' : r.pick(['x', 'y'])}`, `${terms[0].c}`];
        if (letterText) wrong.push(`${g}`, letterText);
        const divisors = [2, 3, 4, 5, 6].filter(h => h < g && g % h === 0);
        divisors.forEach(h => wrong.push(`${h}${letterText}`));
        return {
            type: 'commonFactor',
            prompt: `¿Cuál es el máximo factor común de ${renderTerms([terms[0]])} y ${renderTerms([terms[1]])}?`,
            answer: factorText,
            options: buildOptions(factorText, wrong, r),
            explanation: `Busca el mayor número que divide a ambos coeficientes y las letras que se repiten con su menor exponente. En ${expression}, el factor común es ${factorText}.`,
            key: `gcf|${expression}`
        };
    }

    /* ---------- Diferencia de cuadrados ---------- */

    function differenceOfSquaresQuestion(r, level) {
        const two = level >= 3 && r.chance(0.5);
        const [u, w0] = r.pick(LETTER_PAIRS);
        const w = two ? w0 : '';
        const a = r.int(1, level >= 3 ? 5 : 3);
        const b = r.int(2, 9);
        const expression = renderTerms([{ c: a * a, lit: lit(u, 2) }, { c: -b * b, lit: w ? lit(w, 2) : '' }]);
        const plus = binomial(a, u, b, w);
        const minus = binomial(a, u, -b, w);
        const answer = `${plus}${minus}`;
        assertEquivalent(expression, answer);
        const wrong = [
            square(minus),
            square(plus),
            `${binomial(a * a, u, b * b, w)}${binomial(a * a, u, -b * b, w)}`,
            `${binomial(1, u, b, w)}${binomial(1, u, -b, w)}`,
            `${a > 1 ? a : ''}${u}(${renderTerms([{ c: a, lit: u }, { c: -b * b, lit: w }])})`
        ];
        return {
            type: 'diffSquares',
            prompt: `Factoriza la diferencia de cuadrados: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Calcula las raíces: √(${a * a}${lit(u, 2)}) = ${a > 1 ? a : ''}${u} y √(${b * b}${w ? lit(w, 2) : ''}) = ${b}${w}. Resultado: (suma)(resta) = ${answer}.`,
            key: `diffSquares|${expression}`
        };
    }

    /* ---------- Trinomio cuadrado perfecto ---------- */

    function perfectTrinomialQuestion(r, level) {
        const two = level >= 3 && r.chance(0.5);
        const [u, w0] = r.pick(LETTER_PAIRS);
        const w = two ? w0 : '';
        const a = r.int(1, level >= 3 ? 4 : 2);
        const b = r.int(2, level >= 3 ? 9 : 7);
        const s = r.sign();
        const expression = renderTerms([
            { c: a * a, lit: lit(u, 2) },
            { c: 2 * s * a * b, lit: w ? `${u}${w}` : u },
            { c: b * b, lit: w ? lit(w, 2) : '' }
        ]);
        const answer = square(binomial(a, u, s * b, w));
        assertEquivalent(expression, answer);
        const wrong = [
            square(binomial(a, u, -s * b, w)),
            square(binomial(a, u, 2 * s * b, w)),
            `${binomial(a, u, b, w)}${binomial(a, u, -b, w)}`,
            square(binomial(a * a, u, s * b * b, w)),
            `${binomial(a, u, s * b, w)}${binomial(a, u, s * 2 * b, w)}`
        ];
        return {
            type: 'perfectTrinomial',
            prompt: `Factoriza el trinomio cuadrado perfecto: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Las raíces son ${a > 1 ? a : ''}${u} y ${b}${w}. El término central ${renderTerms([{ c: 2 * s * a * b, lit: w ? `${u}${w}` : u }])} es el doble producto con su signo. Resultado: ${answer}.`,
            key: `perfectTrinomial|${expression}`
        };
    }

    /* ---------- x² + px + q (ensayo y error) ---------- */

    function trialErrorQuestion(r, level) {
        const v = r.pick(['x', 'x', 'x', 'a', 'm']);
        let m; let n;
        if (level <= 2) {
            m = r.int(1, 9); n = r.int(1, 9);
        } else {
            m = r.nonZero(-9, 9); n = r.nonZero(-9, 9);
            if (m > 0 && n > 0) n = -n;
        }
        if (m === n || m + n === 0) throw new Error('Caso degenerado');
        const p = m + n;
        const q = m * n;
        const expression = poly([q, p, 1], v);
        const pair = (s, t) => [s, t].sort((x, y) => x - y).map(root => `(${poly([root, 1], v)})`).join('');
        const answer = pair(m, n);
        assertEquivalent(expression, answer);

        const wrong = [pair(-m, -n), pair(m, -n), pair(-m, n), pair(p, q), pair(m + 1, n - 1), pair(m - 1, n + 1)];
        for (let d = 1; d <= Math.abs(q); d++) {
            if (q % d === 0 && d + q / d !== p) wrong.push(pair(d, q / d), pair(-d, -q / d));
        }
        const clean = wrong.filter(text => !text.includes('(' + v + ')'));
        return {
            type: 'trialError',
            prompt: `Factoriza por ensayo y error: ${expression}.`,
            answer,
            options: buildOptions(answer, clean, r),
            explanation: `Busca dos números que sumen ${p} y multipliquen ${q}: son ${m} y ${n}. Resultado: ${answer}.`,
            key: `trialError|${expression}`
        };
    }

    /* ---------- Agrupación ---------- */

    function groupingQuestion(r) {
        const [u, w] = r.pick(LETTER_PAIRS);
        let A; let B; let C; let D;
        do {
            A = r.int(1, 3); B = r.nonZero(-6, 6); C = r.int(1, 3); D = r.nonZero(-6, 6);
        } while (gcd(A, B) !== 1 || gcd(C, D) !== 1);

        const expression = renderTerms([
            { c: A * C, lit: `${u}${w}` },
            { c: B * C, lit: w },
            { c: A * D, lit: u },
            { c: B * D, lit: '' }
        ]);
        const first = binomial(A, u, B);
        const second = binomial(C, w, D);
        const answer = `${first}${second}`;
        assertEquivalent(expression, answer);
        const wrong = [
            `${binomial(A, u, D)}${binomial(C, w, B)}`,
            `${binomial(A, u, -B)}${binomial(C, w, -D)}`,
            `${first}${binomial(C, w, -D)}`,
            `${binomial(A, w, B)}${binomial(C, u, D)}`
        ];
        const cw = `${C > 1 ? C : ''}${w}`;
        return {
            type: 'grouping',
            prompt: `Factoriza agrupando: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Agrupa de dos en dos y saca el factor común de cada grupo: ${cw}${first} ${D < 0 ? '-' : '+'} ${Math.abs(D)}${first}. Ahora ${first} es un factor común de ambos grupos. Resultado: ${answer}.`,
            key: `grouping|${expression}`
        };
    }

    /* ---------- a·x² + b·x + c ---------- */

    function quadraticQuestion(r) {
        let p; let q; let rr; let s;
        let tries = 0;
        for (;;) {
            if (++tries > 200) throw new Error('Sin trinomio válido');
            p = r.int(1, 4); rr = r.int(1, 4); q = r.nonZero(-6, 6); s = r.nonZero(-6, 6);
            const b = p * s + q * rr;
            if (p === 1 && rr === 1) continue;
            if (b === 0 || gcd(p, q) !== 1 || gcd(rr, s) !== 1) continue;
            if (gcd(gcd(p * rr, b), q * s) !== 1) continue;
            if (p === rr && q === s) continue;
            break;
        }
        const b = p * s + q * rr;
        const expression = poly([q * s, b, p * rr], 'x');
        const ordered = [[p, q], [rr, s]].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
        const bin = (c, d) => binomial(c, 'x', d);
        const answer = ordered.map(([c, d]) => bin(c, d)).join('');
        assertEquivalent(expression, answer);
        const wrong = [
            `${bin(rr, q)}${bin(p, s)}`,
            `${bin(p, -q)}${bin(rr, -s)}`,
            `${bin(p * rr, q)}${bin(1, s)}`,
            `${bin(p, q)}${bin(rr, -s)}`,
            `${bin(p, s)}${bin(rr, q)}`
        ];
        return {
            type: 'quadraticTrinomial',
            prompt: `Factoriza: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Busca dos números que sumen ${b} y multipliquen ${p * rr} · ${q * s} = ${p * rr * q * s}: son ${p * s} y ${q * rr}. Separa el término central, agrupa y factoriza. Resultado: ${answer}.`,
            key: `quadraticTrinomial|${expression}`
        };
    }

    /* ---------- Suma y diferencia de cubos ---------- */

    function cubesQuestion(r) {
        const v = r.pick(['x', 'p', 'a']);
        const a = r.int(1, 3);
        const b = r.int(1, 4);
        const plus = r.chance(0.5);
        const expression = renderTerms([{ c: a * a * a, lit: lit(v, 3) }, { c: (plus ? 1 : -1) * b * b * b, lit: '' }]);
        const sgn = plus ? 1 : -1;
        const first = binomial(a, v, sgn * b);
        const quad = (mid) => `(${poly([b * b, mid, a * a], v)})`;
        const answer = `${first}${quad(-sgn * a * b)}`;
        assertEquivalent(expression, answer);
        const wrong = [
            `(${poly([sgn * b, a], v)})${quad(sgn * a * b)}`,
            `${binomial(a, v, -sgn * b)}${quad(sgn * a * b)}`,
            `${first}${quad(-2 * sgn * a * b)}`,
            `${first}${quad(0)}`,
            `${first}${square(first)}`
        ];
        return {
            type: 'cubes',
            prompt: `Factoriza la ${plus ? 'suma' : 'diferencia'} de cubos: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Calcula las raíces cúbicas: ${a > 1 ? a : ''}${v} y ${b}. Usa ${plus ? 'a³ + b³ = (a + b)(a² - ab + b²)' : 'a³ - b³ = (a - b)(a² + ab + b²)'}. Resultado: ${answer}.`,
            key: `cubes|${expression}`
        };
    }

    /* ---------- Selección por nivel ---------- */

    const POOLS = {
        1: [
            (r) => commonFactorQuestion(r, { terms: 2, numeric: true, letters: false, negative: false }),
            (r) => commonFactorQuestion(r, { terms: 2, numeric: false, letters: true, negative: false }),
            findGcfQuestion
        ],
        2: [
            (r) => commonFactorQuestion(r, { terms: 2, numeric: true, letters: true, negative: true }),
            (r) => commonFactorQuestion(r, { terms: 3, numeric: true, letters: false, negative: false }),
            differenceOfSquaresQuestion,
            perfectTrinomialQuestion,
            trialErrorQuestion
        ],
        3: [
            (r) => commonFactorQuestion(r, { terms: 3, numeric: true, letters: true, negative: true }),
            groupingQuestion,
            trialErrorQuestion,
            quadraticQuestion,
            cubesQuestion,
            perfectTrinomialQuestion,
            differenceOfSquaresQuestion
        ]
    };

    function generateQuestions(level = 1, total = 10, recentKeys = [], seed) {
        const lvl = Math.min(3, Math.max(1, Math.round(level) || 1));
        const makers = POOLS[lvl].map(fn => r => fn(r, lvl));
        return QK.generateSet(makers, total, recentKeys, seed);
    }

    function evaluateExplorer(operation, values) {
        const first = Number(values.first);
        const second = Number(values.second);

        if (operation === 'commonFactor') {
            if (!Number.isInteger(first) || !Number.isInteger(second) || first <= 0 || second <= 0) {
                return { error: 'Escribe dos coeficientes enteros positivos.' };
            }
            const factor = gcd(first, second);
            return {
                display: `${factor}(${first / factor}x + ${second / factor}y)`,
                steps: [
                    `Tienes ${first}x + ${second}y.`,
                    `Ambos números se dividen por ${factor}: ${first} ÷ ${factor} = ${first / factor} y ${second} ÷ ${factor} = ${second / factor}.`,
                    `Resultado: ${factor}(${first / factor}x + ${second / factor}y).`
                ]
            };
        }

        if (operation === 'perfectTrinomial') {
            if (!Number.isInteger(first) || first <= 1) return { error: 'Escribe el valor de la raíz (mayor que 1).' };
            const squareValue = first * first;
            const middle = 2 * first;
            return {
                display: `(x + ${first})²`,
                steps: [
                    `La expresión es x² + ${middle}x + ${squareValue}.`,
                    `Las raíces son x y ${first}: x · x = x² y ${first} · ${first} = ${squareValue}.`,
                    `Comprobación: 2 · x · ${first} = ${middle}x. Resultado: (x + ${first})².`
                ]
            };
        }

        if (operation === 'trialError') {
            if (!Number.isInteger(first) || !Number.isInteger(second) || first < 1 || second < 1) {
                return { error: 'Escribe dos números enteros positivos.' };
            }
            return {
                display: `(x + ${first})(x + ${second})`,
                steps: [
                    `Buscamos dos números que sumen ${first + second} y multipliquen ${first * second}.`,
                    `${first} + ${second} = ${first + second} y ${first} · ${second} = ${first * second}. ¡Funciona!`,
                    `Resultado: x² + ${first + second}x + ${first * second} = (x + ${first})(x + ${second}).`
                ]
            };
        }

        return { error: 'Selecciona una operación válida.' };
    }

    window.FactorizationCore = Object.freeze({
        concepts,
        generateQuestions,
        evaluateExplorer
    });
})();
