(function () {
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

    function pick(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function shuffle(items) {
        return [...items].sort(() => Math.random() - 0.5);
    }

    function optionsFor(answer, alternatives) {
        return shuffle([...new Set([answer, ...alternatives])]).map(value => ({
            label: value,
            correct: value === answer
        }));
    }

    function createCommonFactorQuestion() {
        const templates = [
            {
                expression: '12ab + 36b²',
                answer: '12b(a + 3b)',
                wrong: ['12(ab + 36b²)', '12b(a + b)', '6b(2a + 6b)'],
                explanation: 'El factor común es 12b: 12ab ÷ 12b = a y 36b² ÷ 12b = 3b.'
            },
            {
                expression: 'ax + ay',
                answer: 'a(x + y)',
                wrong: ['a(x · y)', 'x(a + y)', 'a²(x + y)'],
                explanation: 'El factor común es a: ax ÷ a = x y ay ÷ a = y.'
            },
            {
                expression: '5x + 10y',
                answer: '5(x + 2y)',
                wrong: ['5(x + y)', '10(x + y)', '5x(1 + 2y)'],
                explanation: 'El factor común es 5: 5x ÷ 5 = x y 10y ÷ 5 = 2y.'
            },
            {
                expression: '8m + 12n',
                answer: '4(2m + 3n)',
                wrong: ['4(m + n)', '8(m + n)', '4(4m + 6n)'],
                explanation: 'El factor común es 4: 8m ÷ 4 = 2m y 12n ÷ 4 = 3n.'
            }
        ];
        const item = pick(templates);
        return {
            type: 'commonFactor',
            prompt: `Extrae el factor común de ${item.expression}.`,
            answer: item.answer,
            options: optionsFor(item.answer, item.wrong),
            explanation: item.explanation,
            key: `commonFactor|${item.expression}`
        };
    }

    function createVariableFactorQuestion() {
        const coef = pick([2, 3, 5, 7]);
        const letter = pick(['a', 'x', 'm']);
        const templates = [
            {
                expression: `${coef}${letter} + ${coef * coef}${letter}²`,
                answer: `${coef}${letter}(1 + ${coef}${letter})`,
                wrong: [`${coef}(${letter} + ${coef}${letter}²)`, `${coef}${letter}(${letter} + ${coef})`, `${coef * 2}${letter}(1 + ${coef}${letter})`]
            },
            {
                expression: `${coef}${letter}² + ${coef}${letter}`,
                answer: `${coef}${letter}(${letter} + 1)`,
                wrong: [`${coef}${letter}(${letter})`, `${coef}(${letter}² + ${letter})`, `${coef}${letter}²(1 + 1)`]
            }
        ];
        const item = pick(templates);
        return {
            type: 'variableFactor',
            prompt: `Extrae el factor común de ${item.expression}.`,
            answer: item.answer,
            options: optionsFor(item.answer, item.wrong),
            explanation: `El factor común es ${coef}${letter}: divide cada término entre él. ${item.expression} = ${item.answer}.`,
            key: `variableFactor|${item.expression}`
        };
    }

    function createPerfectTrinomialQuestion() {
        const templates = [
            {
                expression: 'x² + 5x + 6',
                answer: '(x + 2)(x + 3)',
                wrong: ['(x + 1)(x + 6)', '(x + 2)(x + 2)', '(x + 3)(x + 4)'],
                explanation: 'Las raíces son x y 2, y el término central 5x es el doble producto: 2 · x · 2. Resultado: (x + 2)(x + 3).'
            },
            {
                expression: 'x² + 2x + 1',
                answer: '(x + 1)²',
                wrong: ['(x + 1)(x + 2)', '(x - 1)²', 'x(x + 1)²'],
                explanation: 'Las raíces son x y 1, y el término central 2x es el doble producto: 2 · x · 1. Resultado: (x + 1)².'
            },
            {
                expression: 'x² - 4x + 4',
                answer: '(x - 2)²',
                wrong: ['(x + 2)²', '(x - 1)(x - 4)', 'x(x - 2)²'],
                explanation: 'Las raíces son x y 2, y el término central -4x es el doble producto con signo negativo: -2 · x · 2. Resultado: (x - 2)².'
            },
            {
                expression: 'x² + 6x + 9',
                answer: '(x + 3)²',
                wrong: ['(x + 1)(x + 9)', '(x - 3)²', 'x(x + 3)²'],
                explanation: 'Las raíces son x y 3, y el término central 6x es el doble producto: 2 · x · 3. Resultado: (x + 3)².'
            }
        ];
        const item = pick(templates);
        return {
            type: 'perfectTrinomial',
            prompt: `Factoriza el trinomio cuadrado perfecto: ${item.expression}.`,
            answer: item.answer,
            options: optionsFor(item.answer, item.wrong),
            explanation: item.explanation,
            key: `perfectTrinomial|${item.expression}`
        };
    }

    function createTrialErrorQuestion() {
        const templates = [
            {
                expression: 'x² + 5x + 6',
                answer: '(x + 2)(x + 3)',
                wrong: ['(x + 1)(x + 6)', '(x + 5)(x + 6)', '(x + 2)(x + 2)'],
                explanation: 'Busca dos números que sumen 5 y multipliquen 6: son 2 y 3. Resultado: (x + 2)(x + 3).'
            },
            {
                expression: 'x² + 7x + 12',
                answer: '(x + 3)(x + 4)',
                wrong: ['(x + 1)(x + 12)', '(x + 2)(x + 6)', '(x + 3)(x + 3)'],
                explanation: 'Busca dos números que sumen 7 y multipliquen 12: son 3 y 4. Resultado: (x + 3)(x + 4).'
            },
            {
                expression: 'x² + 8x + 15',
                answer: '(x + 3)(x + 5)',
                wrong: ['(x + 1)(x + 15)', '(x + 5)(x + 5)', '(x + 2)(x + 8)'],
                explanation: 'Busca dos números que sumen 8 y multipliquen 15: son 3 y 5. Resultado: (x + 3)(x + 5).'
            }
        ];
        const item = pick(templates);
        return {
            type: 'trialError',
            prompt: `Factoriza por ensayo y error: ${item.expression}.`,
            answer: item.answer,
            options: optionsFor(item.answer, item.wrong),
            explanation: item.explanation,
            key: `trialError|${item.expression}`
        };
    }

    function createGroupingQuestion() {
        const a = pick(['a', 'm']);
        const x = pick(['x', 'n']);
        const c1 = pick([1, 2, 3]);
        const c2 = pick([1, 2, 3]);
        const expression = `${c1}${a}${x} + ${c2}${a} + ${c1}${x} + ${c2}`;
        const answer = `(${c1}${x} + ${c2})(${a} + 1)`;
        return {
            type: 'grouping',
            prompt: `Factoriza agrupando: ${expression}.`,
            answer,
            options: optionsFor(answer, [
                `(${c1}${a} + ${c2})(${x} + 1)`,
                `(${a} + ${x})(${c1} + ${c2})`,
                `(${c1}${x} + ${c2}${a})(${a} + 1)`
            ]),
            explanation: `Agrupa: ${c1}${a}${x} + ${c2}${a} = ${a}(${c1}${x} + ${c2}) y ${c1}${x} + ${c2} = 1(${c1}${x} + ${c2}). El factor común es (${c1}${x} + ${c2}). Resultado: ${answer}.`,
            key: `grouping|${expression}`
        };
    }

    function createQuestion(level) {
        if (level === 1) {
            const questions = [createCommonFactorQuestion, createCommonFactorQuestion, createCommonFactorQuestion];
            return pick(questions)();
        }
        if (level === 2) {
            const questions = [createVariableFactorQuestion, createPerfectTrinomialQuestion, createCommonFactorQuestion];
            return pick(questions)();
        }
        const questions = [createTrialErrorQuestion, createGroupingQuestion, createPerfectTrinomialQuestion, createVariableFactorQuestion];
        return pick(questions)();
    }

    function generateQuestions(level = 1, total = 10, recentKeys = []) {
        const questions = [];
        const usedKeys = new Set(recentKeys);
        let attempts = 0;
        while (questions.length < total && attempts < total * 120) {
            const question = createQuestion(Math.min(3, Math.max(1, level)));
            if (!usedKeys.has(question.key)) {
                usedKeys.add(question.key);
                questions.push(question);
            }
            attempts++;
        }
        while (questions.length < total) {
            questions.push(createQuestion(Math.min(3, Math.max(1, level))));
        }
        return questions;
    }

    function evaluateExplorer(operation, values) {
        const first = Number(values.first);
        const second = Number(values.second);

        if (operation === 'commonFactor') {
            if (!Number.isInteger(first) || !Number.isInteger(second) || first <= 0 || second <= 0) {
                return { error: 'Escribe dos coeficientes enteros positivos.' };
            }
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
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
            const square = first * first;
            const middle = 2 * first;
            return {
                display: `(x + ${first})²`,
                steps: [
                    `La expresión es x² + ${middle}x + ${square}.`,
                    `Las raíces son x y ${first}: x · x = x² y ${first} · ${first} = ${square}.`,
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
