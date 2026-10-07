(function () {
    'use strict';

    const QK = window.QuestionKit;
    const { sup, lit, renderTerms, poly, polyAdd, polyScale, polyShift, polyMul, assertEquivalent, buildOptions } = QK;

    const concepts = Object.freeze([
        {
            id: 'translate',
            title: 'Lenguaje algebraico',
            text: 'Una expresión algebraica traduce palabras a símbolos: las letras representan cantidades desconocidas.',
            example: '«El doble de un número» se escribe 2x.',
            steps: ['Identifica la cantidad desconocida y asígnale una letra.', 'Busca las operaciones en la frase: doble, triple, suma, quita, mitad.', 'Escribe la expresión uniendo coeficiente y letra.']
        },
        {
            id: 'evaluate',
            title: 'Valorizar una expresión',
            text: 'Valorizar es reemplazar cada letra por su valor y luego calcular siguiendo el orden de las operaciones.',
            example: 'Si x = 2, entonces 3x + 5 = 3·2 + 5 = 11.',
            steps: ['Escribe el valor de cada letra.', 'Reemplaza las letras por sus valores entre paréntesis.', 'Resuelve siguiendo el orden de las operaciones.']
        },
        {
            id: 'simplify',
            title: 'Reducir términos semejantes',
            text: 'Los términos semejantes tienen la misma parte literal. Se combinan sumando o restando sus coeficientes.',
            example: '5x + 3x = 8x, porque ambos términos comparten la letra x.',
            steps: ['Identifica los términos que tienen la misma letra.', 'Suma o resta solo los coeficientes.', 'Escribe el resultado conservando la letra.']
        },
        {
            id: 'problem',
            title: 'Problemas con expresiones',
            text: 'Los problemas se resuelven traduciendo la situación a una expresión algebraica y luego calculando.',
            example: 'Si un jugador anota x goles y otro anota el doble, entre ambos anotan x + 2x = 3x.',
            steps: ['Asigna letras a las cantidades desconocidas.', 'Traduce las relaciones del enunciado a operaciones.', 'Reduce la expresión y calcula si hay valores dados.']
        }
    ]);

    const VARS = ['x', 'y', 'm', 'n', 'a', 'p'];
    const MULT = { 2: 'doble', 3: 'triple', 4: 'cuádruplo', 5: 'quíntuplo' };
    const FRACTION = { 2: 'la mitad', 3: 'la tercera parte', 4: 'la cuarta parte' };
    const paren = n => (n < 0 ? `(${n})` : `${n}`);

    /* ---------- Lenguaje algebraico ---------- */

    const NOUNS = [
        { text: 'un número', v: 'x', g: 'm' },
        { text: 'un número', v: 'n', g: 'm' },
        { text: 'la edad de Ana', v: 'e', g: 'f' },
        { text: 'la distancia', v: 'd', g: 'f' },
        { text: 'el precio de un helado', v: 'p', g: 'm' },
        { text: 'la altura de un árbol', v: 'h', g: 'f' },
        { text: 'el largo de una cancha', v: 'l', g: 'm' }
    ];

    function translateQuestion(r, level) {
        const noun = r.pick(NOUNS);
        let v = noun.v;
        const kind = r.pick(level === 1 ? ['multiple', 'shift', 'fraction'] : ['compound', 'square', 'successor', 'product']);
        let text; let answer; let wrong; let hint = `la letra ${v}`;

        if (kind === 'multiple') {
            const k = r.int(2, 5);
            text = `el ${MULT[k]} de ${noun.text}`;
            answer = `${k}${v}`;
            wrong = [`${v} + ${k}`, `${v}${sup(k)}`, `${v}/${k}`, `${v} - ${k}`];
        } else if (kind === 'shift') {
            const n = r.int(2, 9);
            const up = r.chance(0.5);
            const word = up ? (noun.g === 'm' ? 'aumentado' : 'aumentada') : (noun.g === 'm' ? 'disminuido' : 'disminuida');
            text = `${noun.text} ${word} en ${n}`;
            answer = `${v} ${up ? '+' : '-'} ${n}`;
            wrong = [`${n}${v}`, `${v} ${up ? '-' : '+'} ${n}`, up ? `${v}/${n}` : `${n} - ${v}`, `${v}${sup(n)}`];
        } else if (kind === 'fraction') {
            const d = r.int(2, 4);
            text = `${FRACTION[d]} de ${noun.text}`;
            answer = `${v}/${d}`;
            wrong = [`${d}${v}`, `${v} - ${d}`, `${v}${sup(d)}`, `${d}/${v}`];
        } else if (kind === 'compound') {
            const k = r.int(2, 5);
            const n = r.int(2, 9);
            const up = r.chance(0.5);
            const op = up ? '+' : '-';
            const flip = up ? '-' : '+';
            text = `el ${MULT[k]} de ${noun.text}, ${up ? 'aumentado' : 'disminuido'} en ${n}`;
            answer = `${k}${v} ${op} ${n}`;
            wrong = [`${k}(${v} ${op} ${n})`, `${k + n}${v}`, `${k}${v} ${flip} ${n}`, `${n}${v} ${op} ${k}`];
        } else if (kind === 'square') {
            const n = r.int(2, 9);
            if (r.chance(0.5)) {
                text = `el cuadrado de ${noun.text}, aumentado en ${n}`;
                answer = `${v}${sup(2)} + ${n}`;
                wrong = [`(${v} + ${n})${sup(2)}`, `${v}${sup(2)} + ${n}${sup(2)}`, `2${v} + ${n}`, `${n}${v}${sup(2)}`];
            } else {
                text = `el cuadrado de la suma de ${noun.text} y ${n}`;
                answer = `(${v} + ${n})${sup(2)}`;
                wrong = [`${v}${sup(2)} + ${n}`, `${v}${sup(2)} + ${n}${sup(2)}`, `2(${v} + ${n})`, `${v} + ${n}${sup(2)}`];
            }
        } else if (kind === 'successor') {
            v = r.pick(['x', 'n', 'm', 'a', 'p']);
            hint = `la letra ${v}`;
            const d = r.int(2, 4);
            const word = r.pick(['sucesor', 'antecesor']);
            const s = word === 'sucesor' ? '+' : '-';
            const opposite = s === '+' ? '-' : '+';
            text = `${FRACTION[d]} del ${word} de un número`;
            answer = `(${v} ${s} 1)/${d}`;
            wrong = [`${v}/${d} ${s} 1`, `${d}(${v} ${s} 1)`, `${v} ${s} 1/${d}`, `(${v} ${opposite} 1)/${d}`];
        } else {
            const [u, w] = r.pick([['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q']]);
            const k = r.int(2, 5);
            hint = `las letras ${u} y ${w}`;
            text = `el ${MULT[k]} del producto de dos números, ${u} y ${w}`;
            answer = `${k}${u}${w}`;
            wrong = [`${k}${u} + ${w}`, `${u}${w} + ${k}`, `${k}${u} · ${k}${w}`, `${k}(${u} + ${w})`];
        }

        return {
            type: 'translate',
            prompt: `¿Cómo se escribe «${text}» en lenguaje algebraico? Usa ${hint}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `«${text}» se traduce como ${answer}. Cada palabra de la frase indica una operación.`,
            key: `translate|${text}`
        };
    }

    /* ---------- Partes de un término ---------- */

    function termPartQuestion(r) {
        const letters = r.pick([['x'], ['y'], ['a', 'b'], ['m', 'n'], ['x', 'y'], ['p', 'q']]).slice(0, r.int(1, 2));
        const exps = letters.map(() => r.pick([1, 1, 2, 3]));
        const literal = letters.map((l, i) => lit(l, exps[i])).join('');
        const degree = exps.reduce((a, b) => a + b, 0);
        const c = r.int(2, 12) * r.sign();
        const expression = renderTerms([{ c, lit: literal }]);
        const ask = r.pick(['coef', 'literal', 'degree']);
        let prompt; let answer; let wrong; let explanation;

        if (ask === 'coef') {
            prompt = `¿Cuál es el coeficiente numérico de ${expression}?`;
            answer = `${c}`;
            wrong = [`${-c}`, `${c + 1}`, `${c - 1}`, `${degree}`, '1'];
            explanation = `En ${expression}, el número que acompaña a las letras es ${c}, con su signo.`;
        } else if (ask === 'literal') {
            prompt = `¿Cuál es el factor literal de ${expression}?`;
            answer = literal;
            const other = letters[0] === 'x' ? 'y' : 'x';
            wrong = [`${Math.abs(c)}${literal}`, `${other}${literal.slice(1)}`, `${letters[0]}${sup(exps[0] + 1)}${letters.slice(1).map((l, i) => lit(l, exps[i + 1])).join('')}`];
            if (letters.length === 2) wrong.push(lit(letters[0], exps[0]), lit(letters[1], exps[1]));
            explanation = `En ${expression}, la parte con letras es ${literal}.`;
        } else {
            prompt = `¿Cuál es el grado del término ${expression}?`;
            answer = `${degree}`;
            wrong = [`${letters.length}`, `${degree + 1}`, `${degree + 2}`, `${Math.abs(c)}`, ...(degree > 1 ? [`${degree - 1}`] : [])];
            explanation = `El grado es la suma de los exponentes de las letras: ${exps.join(' + ')} = ${degree}.`;
        }

        return { type: 'termPart', prompt, answer, options: buildOptions(answer, wrong, r), explanation, key: `termPart|${expression}|${ask}` };
    }

    /* ---------- Valorizar ---------- */

    function substitution(coefs, value) {
        let out = '';
        for (let d = coefs.length - 1; d >= 0; d--) {
            const c = coefs[d];
            if (c === 0) continue;
            const body = d === 0 ? `${Math.abs(c)}` : `${Math.abs(c)} · ${paren(value)}${d > 1 ? sup(d) : ''}`;
            out += out === '' ? `${c < 0 ? '-' : ''}${body}` : ` ${c < 0 ? '-' : '+'} ${body}`;
        }
        return out;
    }

    function evaluateQuestion(r, level) {
        const v = r.pick(['x', 'y', 'm', 'n']);
        let coefs; let value;
        if (level === 1) {
            coefs = [r.int(1, 9), r.int(2, 6)];
            value = r.int(2, 6);
        } else if (level === 2) {
            if (r.chance(0.5)) {
                coefs = [r.nonZero(-9, 9), 0, r.int(1, 4)];
                value = r.int(2, 4);
            } else {
                coefs = [r.nonZero(-9, 9), r.nonZero(2, 7) * r.sign()];
                value = r.int(2, 8);
            }
        } else {
            coefs = [r.nonZero(-9, 9), r.nonZero(-6, 6), r.int(2, 4)];
            value = r.nonZero(-5, 5);
        }
        const expr = poly(coefs, v);
        const at = x => coefs.reduce((sum, c, d) => sum + c * Math.pow(x, d), 0);
        const result = at(value);
        const quad = coefs.length > 2 ? coefs[2] : 0;
        const wrong = [
            at(-value),
            result - coefs[0],
            result + coefs[1],
            result - coefs[1],
            result + 1,
            result - 1
        ];
        if (coefs.length === 2 && value > 0 && coefs[1] > 0) wrong.push(Number(`${coefs[1]}${value}`) + coefs[0]);
        if (quad > 1) wrong.push(result - quad * value * value + Math.pow(quad * value, 2));
        if (quad) wrong.push(coefs[0] + coefs[1] * value + quad * value * 2);
        const answer = `${result}`;
        return {
            type: 'evaluate',
            prompt: `Si ${v} = ${value}, ¿cuál es el valor de ${expr}?`,
            answer,
            options: buildOptions(answer, wrong.map(String), r),
            explanation: `Reemplaza ${v} por ${paren(value)}: ${expr} = ${substitution(coefs, value)} = ${result}. Primero las potencias, luego las multiplicaciones y al final sumas y restas.`,
            key: `evaluate|${expr}|${v}=${value}`
        };
    }

    /* ---------- Reducir términos semejantes ---------- */

    const LIT_ORDER = ['x²', 'y²', 'x', 'y', 'm', 'a', 'b', ''];

    function simplifyQuestion(r, level) {
        let classes; let counts;
        if (level === 1) {
            classes = [r.pick(['x', 'y', 'm', 'a'])];
            counts = [2];
        } else if (level === 2) {
            classes = r.chance(0.7) ? ['x', 'y'] : [r.pick(['x', 'y']), ''];
            counts = [2, 2];
        } else {
            classes = r.shuffle(r.pick([['x²', 'x', ''], ['x²', 'y', ''], ['x', 'y', ''], ['x²', 'x', 'y']]));
            counts = [2, 2, 1];
        }

        const groups = classes.map((literal, i) => {
            let cs;
            do {
                cs = Array.from({ length: counts[i] }, () => (level === 1 ? r.int(2, 9) : r.nonZero(-9, 9)));
            } while (cs.reduce((a, b) => a + b, 0) === 0);
            return { literal, cs, sum: cs.reduce((a, b) => a + b, 0) };
        });

        const all = r.shuffle(groups.flatMap(g => g.cs.map(c => ({ c, lit: g.literal }))));
        const expression = renderTerms(all);
        const ordered = [...groups].sort((a, b) => LIT_ORDER.indexOf(a.literal) - LIT_ORDER.indexOf(b.literal));
        const answer = renderTerms(ordered.map(g => ({ c: g.sum, lit: g.literal })));
        assertEquivalent(expression, answer);

        const wrong = [];
        const target = r.pick(groups);
        const [c1, c2] = target.cs;
        const rebuild = coef => renderTerms(ordered.map(g => ({ c: g === target ? coef : g.sum, lit: g.literal })));
        [Math.abs(c1) + Math.abs(c2), c1 * c2, c1 - c2, -target.sum].forEach(coef => wrong.push(rebuild(coef)));
        const total = groups.reduce((a, g) => a + g.sum, 0);
        if (groups.length > 1 && total !== 0) wrong.push(renderTerms([{ c: total, lit: ordered[0].literal }]));
        if (target.literal && target.literal.length === 1) {
            wrong.push(renderTerms(ordered.map(g => ({ c: g.sum, lit: g === target ? `${g.literal}${sup(2)}` : g.literal }))));
        }

        const lines = groups.map(g => {
            const label = g.literal ? `Con ${g.literal}` : 'Los números';
            return `${label}: ${renderTerms(g.cs.map(c => ({ c, lit: g.literal })))} = ${renderTerms([{ c: g.sum, lit: g.literal }])}`;
        });
        const signature = all.map(t => `${t.c}${t.lit}`).sort().join(',');
        return {
            type: 'simplify',
            prompt: `Reduce: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Agrupa los términos semejantes y suma sus coeficientes. ${lines.join('. ')}. Resultado: ${answer}.`,
            key: `simplify|${signature}`
        };
    }

    /* ---------- Eliminar paréntesis ---------- */

    function parenthesesQuestion(r, level) {
        const v = r.pick(['x', 'y', 'm', 'a']);
        const maxDeg = level >= 3 ? 2 : 1;
        const randomPoly = terms => {
            const degs = r.shuffle([...Array(maxDeg + 1).keys()]).slice(0, terms);
            const coefs = new Array(maxDeg + 1).fill(0);
            degs.forEach(d => { coefs[d] = r.nonZero(-9, 9); });
            return coefs;
        };

        const items = [];
        if (level >= 3 && r.chance(0.35)) {
            items.push({ sign: -1, coefs: randomPoly(2), paren: true });
        } else {
            items.push({ sign: 1, coefs: randomPoly(level >= 3 ? 2 : r.int(1, 2)), paren: false });
            items.push({ sign: -1, coefs: randomPoly(2), paren: true });
        }
        if (level >= 3) items.push({ sign: r.sign(), coefs: randomPoly(2), paren: true });
        if (!items.some(it => it.sign < 0 && it.paren)) items[items.length - 1].sign = -1;

        const expression = items.map((it, i) => {
            const body = it.paren ? `(${poly(it.coefs, v)})` : poly(it.coefs, v);
            if (i === 0) return (it.sign < 0 ? '-' : '') + body;
            return `${it.sign < 0 ? '-' : '+'} ${body}`;
        }).join(' ');

        const combine = transform => items.reduce((acc, it) => polyAdd(acc, transform(it)), [0]);
        const top = coefs => { for (let d = coefs.length - 1; d >= 0; d--) if (coefs[d] !== 0) return d; return -1; };
        const bottom = coefs => coefs.findIndex(c => c !== 0);
        const flipOne = (coefs, index) => coefs.map((c, d) => (d === index ? -c : c));

        const correct = combine(it => polyScale(it.coefs, it.sign));
        if (correct.every(c => c === 0)) throw new Error('Resultado nulo');
        const answer = poly(correct, v);
        assertEquivalent(expression, answer);

        const variants = [
            combine(it => it.coefs),
            combine(it => (it.sign < 0 && it.paren ? flipOne(it.coefs, top(it.coefs)) : it.coefs)),
            combine(it => (it.sign < 0 && it.paren ? flipOne(it.coefs, bottom(it.coefs)) : it.coefs)),
            correct.map((c, d) => (d === bottom(correct) ? -c : c))
        ];
        const bump = correct.map((c, d) => (d === bottom(correct) ? c + 1 : c));
        const wrong = [...variants, bump].map(c => poly(c, v));

        const expanded = renderTerms(items.flatMap(it => it.coefs
            .map((c, d) => ({ c: c * it.sign, lit: lit(v, d), d }))
            .filter(t => t.c !== 0)
            .sort((a, b) => b.d - a.d)));
        return {
            type: 'parentheses',
            prompt: `Elimina los paréntesis y reduce: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Un signo menos delante del paréntesis cambia el signo de todos los términos de adentro: ${expanded}. Al reducir queda ${answer}.`,
            key: `parentheses|${expression}`
        };
    }

    /* ---------- Propiedad distributiva ---------- */

    function distributeQuestion(r, level) {
        const v = r.pick(['x', 'y', 'm', 'a']);
        const e = level >= 3 ? r.int(1, 2) : 0;
        const c = r.int(2, 6) * r.sign();
        const inner = level >= 3
            ? [r.nonZero(-7, 7), r.nonZero(-7, 7), r.nonZero(-4, 4)]
            : [r.nonZero(-9, 9), r.nonZero(-9, 9)];
        const mono = renderTerms([{ c, lit: lit(v, e) }]);
        const expression = `${mono}(${poly(inner, v)})`;

        const product = polyScale(polyShift(inner, e), c);
        const answer = poly(product, v);
        assertEquivalent(expression, answer);

        const top = inner.length - 1;
        const firstOnly = polyShift(inner, e).map((k, d) => (d === top + e ? k * c : k));
        const lastOnly = polyShift(inner, e).map((k, d) => (d === e ? k : k * c));
        const addCoef = polyShift(inner.map(k => k + c), e);
        const noShift = polyScale(inner, c);
        const signErr = polyScale(polyShift(inner, e), Math.abs(c));
        const mixed = product.map((k, d) => (d === e ? -k : k));
        const wrong = [firstOnly, lastOnly, addCoef, noShift, signErr, mixed].map(p => poly(p, v));

        return {
            type: 'distribute',
            prompt: `Aplica la propiedad distributiva: ${expression}.`,
            answer,
            options: buildOptions(answer, wrong, r),
            explanation: `Multiplica ${mono} por cada término del paréntesis, cuidando los signos y sumando los exponentes. Resultado: ${answer}.`,
            key: `distribute|${expression}`
        };
    }

    /* ---------- Productos notables ---------- */

    function notableQuestion(r) {
        const v = r.pick(['x', 'y', 'm', 'a']);
        const kind = r.pick(['square', 'square', 'sumDiff', 'common']);
        let expression; let correct; let candidates;

        if (kind === 'square') {
            const a = r.int(1, 4);
            const b = r.int(2, 9);
            const s = r.sign();
            expression = `(${poly([s * b, a], v)})${sup(2)}`;
            correct = [b * b, 2 * s * a * b, a * a];
            candidates = [[b * b, 0, a * a], [b * b, s * a * b, a * a], [b * b, -2 * s * a * b, a * a], [-b * b, 2 * s * a * b, a * a], [b * b, 2 * s * a * b, a]];
        } else if (kind === 'sumDiff') {
            const a = r.int(1, 4);
            const b = r.int(2, 9);
            expression = `(${poly([b, a], v)})(${poly([-b, a], v)})`;
            correct = [-b * b, 0, a * a];
            candidates = [[b * b, 0, a * a], [-b * b, 0, a], [-b, 0, a * a], [b * b, -2 * a * b, a * a], [-b * b, a * b, a * a]];
        } else {
            const a = r.int(1, 3);
            const p = r.nonZero(-8, 8);
            const q = r.nonZero(-8, 8);
            if (p === q || p + q === 0) throw new Error('Caso degenerado');
            expression = `(${poly([p, a], v)})(${poly([q, a], v)})`;
            correct = [p * q, a * (p + q), a * a];
            candidates = [[p + q, p * q, a * a], [p * q, p + q, a * a], [p * q, p * q, a * a], [p * q, a * (p + q), a], [p * q, 0, a * a]];
        }
        const answer = poly(correct, v);
        assertEquivalent(expression, answer);
        return {
            type: 'notable',
            prompt: `Desarrolla: ${expression}.`,
            answer,
            options: buildOptions(answer, candidates.map(c => poly(c, v)), r),
            explanation: `Aplica el producto notable correspondiente (cuadrado de binomio, suma por diferencia o binomios con término común). Resultado: ${answer}.`,
            key: `notable|${expression}`
        };
    }

    /* ---------- Problemas ---------- */

    const PROBLEM_BUILDERS = [
        function purchase(r) {
            const [P, M] = r.pick([['P', 'M'], ['d', 'p'], ['a', 'b']]);
            const k = r.int(3, 24);
            const item = r.pick(['yogures', 'alfajores', 'bebidas', 'cuadernos', 'helados']);
            const answer = `${P} - ${k}${M}`;
            return {
                prompt: `Una persona va a comprar ${k} ${item}. El precio de cada uno es $${M} y lleva $${P}, monto suficiente para pagar. ¿Qué expresión representa el dinero que le sobra?`,
                answer,
                wrong: [`${P} - ${M}`, `${k}${M} - ${P}`, `(${P} - ${k})/${M}`, `${P} + ${k}${M}`],
                explanation: `Los ${k} ${item} cuestan ${k}${M}. Lo que sobra es lo que lleva menos lo que gasta: ${answer}.`
            };
        },
        function equalDays(r) {
            const a = r.pick(['a', 'm', 'x']);
            const days = r.pick([4, 6, 8, 10, 12]);
            const divisors = [2, 3, 4, 6].filter(q => days % q === 0 && q < days);
            const q = r.pick(divisors);
            const dd = days / q;
            const T = r.pick([200, 400, 600, 800, 1200, 1600]);
            const answer = `(${a} + ${T})/${q}`;
            return {
                prompt: `Una persona gastó $(${a} + ${T}) en ${days} días. Si todos los días gastó lo mismo, ¿qué expresión representa lo que gastó en ${dd} días?`,
                answer,
                wrong: [`${a} + ${T}/${q}`, `(${a} + ${T})/${days}`, `${dd}(${a} + ${T})`, `(${a} + ${T}) · ${q}`],
                explanation: `${dd} días son la ${q}ª parte de ${days} días, así que se divide el gasto total entre ${q}: ${answer}.`
            };
        },
        function rectangle(r) {
            const v = r.pick(['x', 'a', 'm']);
            const k = r.int(2, 4);
            const word = { 2: 'el doble', 3: 'el triple', 4: 'el cuádruple' }[k];
            if (r.chance(0.5)) {
                const answer = `${2 + 2 * k}${v}`;
                return {
                    prompt: `Un rectángulo tiene un lado de ${v} cm y el otro mide ${word}. ¿Qué expresión representa su perímetro?`,
                    answer,
                    wrong: [`${k + 1}${v}`, `${2 * k}${v}`, `${2 + k}${v}`, `${k}${v}${sup(2)}`],
                    explanation: `El perímetro suma los cuatro lados: ${v} + ${k}${v} + ${v} + ${k}${v} = ${answer}.`
                };
            }
            const answer = `${k}${v}${sup(2)}`;
            return {
                prompt: `Un rectángulo tiene un lado de ${v} cm y el otro mide ${word}. ¿Qué expresión representa su área?`,
                answer,
                wrong: [`${k + 1}${v}`, `${k}${v}`, `${2 + 2 * k}${v}`, `${v}${sup(2)} + ${k}${v}`],
                explanation: `El área es largo por ancho: ${v} · ${k}${v} = ${answer}.`
            };
        },
        function sharing(r) {
            const v = r.pick(['x', 'g', 'p']);
            const pair = r.pick([['Juan', 'Pedro', 'goles'], ['Camila', 'Sofía', 'puntos'], ['Tomás', 'Luca', 'figuritas']]);
            if (r.chance(0.5)) {
                const k = r.int(2, 5);
                const word = { 2: 'el doble', 3: 'el triple', 4: 'el cuádruple', 5: 'el quíntuple' }[k];
                const answer = `${k + 1}${v}`;
                return {
                    prompt: `${pair[0]} tiene ${v} ${pair[2]} y ${pair[1]} tiene ${word}. ¿Cuántos tienen entre los dos?`,
                    answer,
                    wrong: [`${k}${v}`, `${v} + ${k}`, `${k}${v}${sup(2)}`, `${k + 2}${v}`],
                    explanation: `${pair[1]} tiene ${k}${v}. Entre los dos: ${v} + ${k}${v} = ${answer}.`
                };
            }
            const k = r.int(2, 9);
            const answer = `2${v} + ${k}`;
            return {
                prompt: `${pair[0]} tiene ${v} ${pair[2]} y ${pair[1]} tiene ${k} más. ¿Cuántos tienen entre los dos?`,
                answer,
                wrong: [`${v} + ${k}`, `${k}${v}`, `${v}${sup(2)} + ${k}`, `2${v}`],
                explanation: `${pair[1]} tiene ${v} + ${k}. Entre los dos: ${v} + ${v} + ${k} = ${answer}.`
            };
        },
        function recipe(r) {
            const [C, q] = r.pick([[325, 20], [450, 16], [250, 12], [180, 8], [90, 12]]);
            const answer = `${C}n/${q}`;
            return {
                prompt: `Una receta indica usar ${C} gramos de harina para hacer ${q} galletas. Si se sigue esa receta, ¿qué fórmula permite calcular los gramos de harina para hacer n galletas?`,
                answer,
                wrong: [`${q}n/${C}`, `${C}n`, `${C} + n`, `${C}/${q} + n`],
                explanation: `Cada galleta usa ${C}/${q} gramos. Para n galletas: ${answer}.`
            };
        }
    ];

    function problemQuestion(r) {
        const item = r.pick(PROBLEM_BUILDERS)(r);
        return {
            type: 'problem',
            prompt: item.prompt,
            answer: item.answer,
            options: buildOptions(item.answer, item.wrong, r),
            explanation: item.explanation,
            key: `problem|${item.prompt}`
        };
    }

    /* ---------- Selección por nivel ---------- */

    const POOLS = {
        1: [translateQuestion, termPartQuestion, evaluateQuestion, simplifyQuestion],
        2: [translateQuestion, evaluateQuestion, simplifyQuestion, parenthesesQuestion, distributeQuestion],
        3: [evaluateQuestion, simplifyQuestion, parenthesesQuestion, distributeQuestion, notableQuestion, problemQuestion]
    };

    function generateQuestions(level = 1, total = 10, recentKeys = [], seed) {
        const lvl = Math.min(3, Math.max(1, Math.round(level) || 1));
        const makers = POOLS[lvl].map(fn => r => fn(r, lvl));
        return QK.generateSet(makers, total, recentKeys, seed);
    }

    /* ---------- Explorador ---------- */

    function parseTerms(text) {
        const s = String(text).replace(/\s+/g, '').replace(/−/g, '-').replace(/[·*]/g, '');
        if (!s || /[()/]/.test(s)) return null;
        const raw = s.match(/[+-]?[^+-]+/g);
        if (!raw || raw.join('') !== s) return null;
        const supDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        const map = new Map();
        for (const piece of raw) {
            const m = /^([+-]?)(\d*\.?\d*)(.*)$/.exec(piece);
            if (!m) return null;
            const c = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
            const exps = {};
            const re = /([a-zA-Z])(?:\^(\d+)|([⁰-⁹]+))?/g;
            let rest = m[3];
            let consumed = '';
            let hit;
            while ((hit = re.exec(rest)) !== null) {
                consumed += hit[0];
                const exp = hit[2] ? Number(hit[2]) : hit[3] ? Number([...hit[3]].map(ch => supDigits.indexOf(ch)).join('')) : 1;
                exps[hit[1]] = (exps[hit[1]] || 0) + exp;
            }
            if (consumed !== rest || (m[2] === '' && !rest)) return null;
            const literal = Object.keys(exps).sort().map(k => lit(k, exps[k])).join('');
            map.set(literal, (map.get(literal) || 0) + c);
        }
        return map;
    }

    function evaluateExplorer(operation, values) {
        if (operation === 'translate') {
            return {
                display: 'x',
                steps: ['La cantidad desconocida es «un número»: la llamamos x.', '«El doble» significa multiplicar por 2.', 'Resultado: 2x.']
            };
        }

        if (operation === 'evaluate') {
            const expression = String(values.first || '').trim();
            const value = Number(values.second);
            if (!expression || !Number.isFinite(value)) return { error: 'Escribe la expresión y el valor de la letra.' };
            let compiled;
            try { compiled = QK.compile(expression); } catch (error) { return { error: 'No pude leer la expresión. Ejemplo: 3x + 5' }; }
            if (compiled.vars.size !== 1) return { error: 'Usa una sola letra en la expresión.' };
            const letter = [...compiled.vars][0];
            const result = compiled.fn({ [letter]: value });
            if (!Number.isFinite(result)) return { error: 'El resultado no es un número válido.' };
            const shown = Number.isInteger(result) ? `${result}` : `${Math.round(result * 1000) / 1000}`;
            const substituted = expression.replace(new RegExp(letter, 'g'), `(${value})`);
            return {
                display: shown,
                steps: [`La letra ${letter} vale ${value}.`, `Reemplaza la letra por ese valor: ${substituted}.`, `Calcula siguiendo el orden de las operaciones. Resultado: ${shown}.`]
            };
        }

        if (operation === 'simplify') {
            const raw = String(values.first || '').trim();
            let terms = /^-?\d+$/.test(raw) && Number.isFinite(Number(values.second))
                ? new Map([['x', Number(raw) + Number(values.second)]])
                : parseTerms(raw);
            if (!terms || terms.size === 0) return { error: 'Escribe una expresión como 5x + 3x - 2.' };
            const order = [...terms.entries()].sort((a, b) => LIT_ORDER.indexOf(a[0]) - LIT_ORDER.indexOf(b[0]));
            const display = renderTerms(order.map(([literal, c]) => ({ c, lit: literal })));
            const shownExpression = /^-?\d+$/.test(raw) ? `${raw}x + ${values.second}x` : raw;
            return {
                display,
                steps: [
                    `Expresión: ${shownExpression}. Identifica los términos semejantes: misma letra y mismo exponente.`,
                    'Suma o resta solo los coeficientes de cada grupo.',
                    `Conserva la parte literal. Resultado: ${display}.`
                ]
            };
        }

        return { error: 'Selecciona una operación válida.' };
    }

    window.AlgebraCore = Object.freeze({
        concepts,
        generateQuestions,
        evaluateExplorer
    });
})();
