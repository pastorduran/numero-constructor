// Ejecutar: node tests/question-core.test.js   (desde la raíz del proyecto)
const fs = require('fs');
const path = require('path');
global.window = global;
['question-kit.js', 'algebra-core.js', 'factorization-core.js', 'roots-core.js'].forEach(f => {
    // eslint-disable-next-line no-eval
    (0, eval)(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'));
});
const QK = window.QuestionKit;
const modules = { Algebra: window.AlgebraCore, Factorization: window.FactorizationCore, Roots: window.RootsCore };
const norm = s => String(s).replace(/\s+/g, '');
let problems = 0;
const singleStep = {};
const fail = (msg) => { problems++; if (problems <= 25) console.log('  ✗', msg); };

for (const [name, core] of Object.entries(modules)) {
    for (const level of [1, 2, 3]) {
        const GAMES = 300;
        const allKeys = new Set();
        const typeCount = {};
        let recent = [];
        let crossRepeats = 0;
        let total = 0;
        for (let g = 0; g < GAMES; g++) {
            const qs = core.generateQuestions(level, 10, recent, g * 7919 + level);
            if (qs.length !== 10) fail(`${name} L${level}: ${qs.length} preguntas`);
            const keys = new Set(qs.map(q => q.key));
            if (keys.size !== qs.length) fail(`${name} L${level}: claves repetidas dentro de una partida`);
            qs.forEach(q => {
                total++;
                typeCount[q.type] = (typeCount[q.type] || 0) + 1;
                if (recent.includes(q.key)) crossRepeats++;
                allKeys.add(q.key);
                if (q.options.length !== 4) fail(`${name} L${level} ${q.type}: ${q.options.length} opciones → ${q.prompt}`);
                const correct = q.options.filter(o => o.correct);
                if (correct.length !== 1 || correct[0].label !== q.answer) fail(`${name} L${level}: opción correcta inválida → ${q.prompt}`);
                if (new Set(q.options.map(o => norm(o.label))).size !== 4) fail(`${name} L${level}: opciones duplicadas → ${q.prompt}`);
                if (!q.explanation || !q.prompt || !q.key || !q.type) fail(`${name} L${level}: campos faltantes`);
                if (!Array.isArray(q.steps) || q.steps.length < 1) fail(`${name} L${level} ${q.type}: sin pasos`);
                else if (q.steps.length < 2) { if (name === 'Roots') fail(`${name} L${level} ${q.type}: menos de 2 pasos → ${q.prompt}`); else singleStep[name] = (singleStep[name] || 0) + 1; }
                if (q.steps && q.steps.some(s => !s || /undefined|NaN|\[object/.test(s))) fail(`${name} L${level} ${q.type}: paso con valores inválidos → ${q.steps.join(' | ')}`);
                // distractores equivalentes a la respuesta solo se permiten en factor común (incompleto a propósito)
                q.options.filter(o => !o.correct).forEach(o => {
                    let eq = false;
                    try { eq = QK.equivalent(q.answer, o.label); } catch (e) { /* texto libre */ }
                    if (eq && !((name === 'Factorization' && (q.type === 'commonFactor' || q.type === 'variableFactor')) || (name === 'Roots' && (q.type === 'simplify' || q.type === 'rationalize')))) {
                        fail(`${name} L${level} ${q.type}: distractor equivalente ${o.label} ≡ ${q.answer}`);
                    }
                });
            });
            recent = [...recent, ...qs.map(q => q.key)].slice(-40);
        }
        console.log(`${name} L${level}: ${allKeys.size} preguntas distintas en ${total}; repetidas contra las 40 recientes: ${crossRepeats}`);
        console.log('   reparto:', JSON.stringify(typeCount));
    }
}
console.log('Preguntas con un solo paso (pendientes de redactar a mano):', JSON.stringify(singleStep));
console.log('Fallos internos de generadores (reintentados):', JSON.stringify(QK.failures));

// Explorador
const A = window.AlgebraCore, F = window.FactorizationCore;
const e1 = A.evaluateExplorer('evaluate', { first: '3x + 5', second: '2' });
if (e1.display !== '11') fail('explorer evaluate: ' + JSON.stringify(e1));
const e2 = A.evaluateExplorer('simplify', { first: '5x + 3x - 2 + 7' });
if (e2.display !== '8x + 5') fail('explorer simplify: ' + JSON.stringify(e2));
const e3 = F.evaluateExplorer('trialError', { first: 2, second: 3 });
if (e3.display !== '(x + 2)(x + 3)') fail('explorer factor');

const R = window.RootsCore;
const chk = (cond, msg) => { if (!cond) fail(msg); };
chk(R.evaluateExplorer('simplify', { first: 72 }).display === '6√2', 'roots explorer simplify');
chk(R.evaluateExplorer('combine', { first: 2, second: 8 }).display === '4', 'roots explorer combine');
chk(R.evaluateExplorer('like', { first: 3, second: 4, radicand: 5 }).display === '7√5', 'roots explorer like');
chk(R.evaluateExplorer('nested', { first: 64 }).display === '2', 'roots explorer nested');
chk(R.evaluateExplorer('conjugate', {}).display === '√3 - √2', 'roots explorer conjugate');
chk(R.evaluateFree(3, -8).display === '-2', 'roots evaluateFree');
chk(R.rootText(3, -8) === '∛(-8)' && R.simplifiedText(72) === '6√2', 'roots helpers');
console.log(problems === 0 ? '\n✓ Todo en orden' : `\n✗ ${problems} problemas`);
process.exit(problems ? 1 : 0);
