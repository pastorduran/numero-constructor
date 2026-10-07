// Ejecutar: node tests/question-core.test.js   (desde la raíz del proyecto)
const fs = require('fs');
const path = require('path');
global.window = global;
['question-kit.js', 'algebra-core.js', 'factorization-core.js'].forEach(f => {
    // eslint-disable-next-line no-eval
    (0, eval)(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'));
});
const QK = window.QuestionKit;
const modules = { Algebra: window.AlgebraCore, Factorization: window.FactorizationCore };
const norm = s => String(s).replace(/\s+/g, '');
let problems = 0;
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
                // distractores equivalentes a la respuesta solo se permiten en factor común (incompleto a propósito)
                q.options.filter(o => !o.correct).forEach(o => {
                    let eq = false;
                    try { eq = QK.equivalent(q.answer, o.label); } catch (e) { /* texto libre */ }
                    if (eq && !(name === 'Factorization' && (q.type === 'commonFactor' || q.type === 'variableFactor'))) {
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
console.log('Fallos internos de generadores (reintentados):', JSON.stringify(QK.failures));

// Explorador
const A = window.AlgebraCore, F = window.FactorizationCore;
const e1 = A.evaluateExplorer('evaluate', { first: '3x + 5', second: '2' });
if (e1.display !== '11') fail('explorer evaluate: ' + JSON.stringify(e1));
const e2 = A.evaluateExplorer('simplify', { first: '5x + 3x - 2 + 7' });
if (e2.display !== '8x + 5') fail('explorer simplify: ' + JSON.stringify(e2));
const e3 = F.evaluateExplorer('trialError', { first: 2, second: 3 });
if (e3.display !== '(x + 2)(x + 3)') fail('explorer factor');

console.log(problems === 0 ? '\n✓ Todo en orden' : `\n✗ ${problems} problemas`);
process.exit(problems ? 1 : 0);
