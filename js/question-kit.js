(function () {
    'use strict';

    const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const SUP_INDEX = {};
    [...SUP].forEach((ch, i) => { SUP_INDEX[ch] = i; });

    /* ---------- Aleatoriedad (con semilla opcional para pruebas) ---------- */

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function makeRandom(seed) {
        const rand = (seed === undefined || seed === null) ? Math.random : mulberry32(seed);
        const r = {
            int: (min, max) => min + Math.floor(rand() * (max - min + 1)),
            pick: items => items[Math.floor(rand() * items.length)],
            chance: p => rand() < p,
            sign: () => (rand() < 0.5 ? -1 : 1),
            shuffle(items) {
                const a = [...items];
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(rand() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            },
            nonZero(min, max) {
                let v = 0;
                while (v === 0) v = r.int(min, max);
                return v;
            }
        };
        return r;
    }

    function gcd(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a;
    }

    /* ---------- Intérprete mínimo de expresiones (verificación numérica) ---------- */

    function tokenize(source) {
        const s = String(source).replace(/−/g, '-').replace(/[·×]/g, '*').replace(/\s+/g, '');
        const tokens = [];
        let i = 0;
        while (i < s.length) {
            const ch = s[i];
            if (/[0-9.]/.test(ch)) {
                let j = i;
                while (j < s.length && /[0-9.]/.test(s[j])) j++;
                tokens.push({ t: 'num', v: parseFloat(s.slice(i, j)) });
                i = j;
            } else if (/[a-zA-Z]/.test(ch)) {
                tokens.push({ t: 'var', v: ch });
                i++;
            } else if (Object.prototype.hasOwnProperty.call(SUP_INDEX, ch)) {
                let j = i;
                let digits = '';
                while (j < s.length && Object.prototype.hasOwnProperty.call(SUP_INDEX, s[j])) {
                    digits += SUP_INDEX[s[j]];
                    j++;
                }
                tokens.push({ t: 'sup', v: parseInt(digits, 10) });
                i = j;
            } else if ('+-*/^()'.includes(ch)) {
                tokens.push({ t: 'op', v: ch });
                i++;
            } else {
                throw new Error(`Carácter no válido: ${ch}`);
            }
        }
        return tokens;
    }

    function compile(source) {
        const tokens = tokenize(source);
        const vars = new Set();
        let pos = 0;
        const isOp = value => {
            const t = tokens[pos];
            return !!t && t.t === 'op' && t.v === value;
        };

        function parseExpression() {
            let left = parseTerm();
            while (isOp('+') || isOp('-')) {
                const op = tokens[pos++].v;
                const l = left;
                const right = parseTerm();
                left = op === '+' ? env => l(env) + right(env) : env => l(env) - right(env);
            }
            return left;
        }

        function parseTerm() {
            let left = parseUnary();
            for (;;) {
                const t = tokens[pos];
                if (!t) break;
                const l = left;
                if (t.t === 'op' && (t.v === '*' || t.v === '/')) {
                    pos++;
                    const right = parseUnary();
                    left = t.v === '*' ? env => l(env) * right(env) : env => l(env) / right(env);
                } else if (t.t === 'var' || (t.t === 'op' && t.v === '(')) {
                    const right = parsePower();
                    left = env => l(env) * right(env);
                } else {
                    break;
                }
            }
            return left;
        }

        function parseUnary() {
            if (isOp('-')) {
                pos++;
                const inner = parseUnary();
                return env => -inner(env);
            }
            if (isOp('+')) {
                pos++;
                return parseUnary();
            }
            return parsePower();
        }

        function parsePower() {
            let base = parseAtom();
            for (;;) {
                const t = tokens[pos];
                const b = base;
                if (t && t.t === 'sup') {
                    pos++;
                    base = env => Math.pow(b(env), t.v);
                } else if (isOp('^')) {
                    pos++;
                    const n = tokens[pos++];
                    if (!n || n.t !== 'num') throw new Error('Exponente no válido');
                    base = env => Math.pow(b(env), n.v);
                } else {
                    break;
                }
            }
            return base;
        }

        function parseAtom() {
            const t = tokens[pos++];
            if (!t) throw new Error('Expresión incompleta');
            if (t.t === 'num') return () => t.v;
            if (t.t === 'var') {
                const name = t.v;
                vars.add(name);
                return env => {
                    if (!(name in env)) throw new Error(`Falta el valor de ${name}`);
                    return env[name];
                };
            }
            if (t.t === 'op' && t.v === '(') {
                const inner = parseExpression();
                if (!isOp(')')) throw new Error('Falta cerrar un paréntesis');
                pos++;
                return inner;
            }
            throw new Error('Símbolo inesperado');
        }

        const fn = parseExpression();
        if (pos < tokens.length) throw new Error('Expresión no válida');
        return { fn, vars };
    }

    function evaluate(source, env) {
        return compile(source).fn(env || {});
    }

    const SAMPLES = [2, 3, -2, 5, -3, 7, 4, -5, 6, -4];

    function equivalent(a, b) {
        const A = compile(a);
        const B = compile(b);
        const names = [...new Set([...A.vars, ...B.vars])];
        let valid = 0;
        for (let k = 0; k < SAMPLES.length; k++) {
            const env = {};
            names.forEach((name, i) => { env[name] = SAMPLES[(k + i * 3) % SAMPLES.length]; });
            const x = A.fn(env);
            const y = B.fn(env);
            if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
            valid++;
            if (Math.abs(x - y) > 1e-7 * Math.max(1, Math.abs(x), Math.abs(y))) return false;
        }
        return valid >= 3;
    }

    function safeEquivalent(a, b) {
        try { return equivalent(a, b); } catch (error) { return false; }
    }

    function assertEquivalent(a, b) {
        if (!equivalent(a, b)) throw new Error(`No equivalentes: ${a} ≠ ${b}`);
    }

    /* ---------- Formato de expresiones ---------- */

    function sup(n) {
        return String(n).split('').map(d => SUP[Number(d)]).join('');
    }

    function lit(letter, exponent) {
        if (exponent === 0) return '';
        return exponent === 1 ? letter : `${letter}${sup(exponent)}`;
    }

    function renderTerms(terms) {
        let out = '';
        terms.forEach(t => {
            if (t.c === 0) return;
            const abs = Math.abs(t.c);
            const body = t.lit ? (abs === 1 ? t.lit : `${abs}${t.lit}`) : `${abs}`;
            if (out === '') out = (t.c < 0 ? '-' : '') + body;
            else out += ` ${t.c < 0 ? '-' : '+'} ${body}`;
        });
        return out || '0';
    }

    // coefs[i] es el coeficiente del término de grado i
    function poly(coefs, letter = 'x') {
        const terms = [];
        for (let d = coefs.length - 1; d >= 0; d--) terms.push({ c: coefs[d], lit: lit(letter, d) });
        return renderTerms(terms);
    }

    function polyAdd(a, b) {
        const out = [];
        for (let i = 0; i < Math.max(a.length, b.length); i++) out.push((a[i] || 0) + (b[i] || 0));
        return out;
    }

    function polyScale(a, k) { return a.map(c => c * k); }

    function polyShift(a, n) { return [...new Array(n).fill(0), ...a]; }

    function polyMul(a, b) {
        const out = new Array(a.length + b.length - 1).fill(0);
        a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; }));
        return out;
    }

    /* ---------- Opciones de respuesta ---------- */

    const norm = text => String(text).replace(/\s+/g, '');

    // Un distractor puede ser un texto o { text, partial: true }.
    // «partial» marca factorizaciones equivalentes pero incompletas (error pedagógico real).
    function buildOptions(answer, distractors, r) {
        const seen = new Set([norm(answer)]);
        const accepted = [];
        distractors.forEach(d => {
            const partial = typeof d === 'object' && d !== null;
            const text = partial ? d.text : d;
            const key = norm(text);
            if (!key || seen.has(key)) return;
            if (!partial) {
                if (safeEquivalent(answer, text)) return;
                if (accepted.some(a => !a.partial && safeEquivalent(a.text, text))) return;
            }
            seen.add(key);
            accepted.push({ text, partial });
        });
        if (accepted.length < 3) throw new Error('Distractores insuficientes');
        const chosen = r.shuffle(accepted).slice(0, 3).map(a => a.text);
        return r.shuffle([answer, ...chosen]).map(label => ({ label, correct: label === answer }));
    }

    /* ---------- Conjunto de preguntas sin repeticiones ---------- */

    const failures = {};

    function noteFailure(error) {
        failures[error.message] = (failures[error.message] || 0) + 1;
    }

    // makers: funciones (r) => pregunta. Se reparten de forma equilibrada entre habilidades.
    function generateSet(makers, total, recentKeys, seed) {
        const r = makeRandom(seed);
        const recent = new Set(recentKeys || []);
        const used = new Set();
        const counts = new Map(makers.map(m => [m, 0]));
        const questions = [];

        function attempt(pool, accept) {
            const maker = r.pick(pool);
            let q;
            try { q = maker(r); } catch (error) { noteFailure(error); return null; }
            return q && accept(q.key) ? { maker, q } : null;
        }

        while (questions.length < total) {
            const min = Math.min(...counts.values());
            const balanced = makers.filter(m => counts.get(m) === min);
            let hit = null;
            for (let i = 0; i < 80 && !hit; i++) hit = attempt(balanced, k => !used.has(k) && !recent.has(k));
            for (let i = 0; i < 80 && !hit; i++) hit = attempt(makers, k => !used.has(k) && !recent.has(k));
            for (let i = 0; i < 80 && !hit; i++) hit = attempt(makers, k => !used.has(k));
            for (let i = 0; i < 80 && !hit; i++) hit = attempt(makers, () => true);
            if (!hit) throw new Error('No se pudo generar la pregunta');
            used.add(hit.q.key);
            counts.set(hit.maker, counts.get(hit.maker) + 1);
            questions.push(hit.q);
        }
        return r.shuffle(questions);
    }

    window.QuestionKit = Object.freeze({
        makeRandom, gcd, compile, evaluate, equivalent, assertEquivalent,
        sup, lit, renderTerms, poly, polyAdd, polyScale, polyShift, polyMul,
        buildOptions, generateSet, failures
    });
})();
