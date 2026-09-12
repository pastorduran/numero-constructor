(function () {
    const concepts = Object.freeze([
        {
            id: 'real',
            title: 'Raíz real',
            text: 'La raíz n-ésima de a es el número b que cumple b^n = a.',
            example: '√25 = 5 porque 5² = 25.',
            index: 2,
            radicand: 25,
            steps: ['Identifica el radicando: 25.', 'Busca el número que elevado al cuadrado produce 25.', '√25 = 5.']
        },
        {
            id: 'existence',
            title: 'Condición de existencia',
            text: 'Si el índice es par, el radicando debe ser positivo o cero para que la raíz sea real. Con índice impar, también se admiten radicandos negativos.',
            example: '√(-9) no es real, pero ∛(-8) = -2.',
            index: 3,
            radicand: -8,
            steps: ['El índice es impar: 3.', 'Los índices impares admiten radicandos negativos.', '∛(-8) = -2.']
        },
        {
            id: 'properties',
            title: 'Propiedades',
            text: 'Producto, cociente, potencia y raíz de una raíz pueden transformarse combinando índices y radicandos.',
            example: '√a · √b = √(ab) y √[m](√[n]a) = √[mn]a.',
            index: 2,
            radicand: 16,
            steps: ['Producto: √a · √b = √(ab).', 'Ejemplo: √2 · √8 = √16.', '√16 = 4.']
        },
        {
            id: 'simplify',
            title: 'Simplificación',
            text: 'Extrae del radical los factores que sean potencias perfectas y conserva dentro solo la parte que no se puede extraer.',
            example: '√72 = √(36 · 2) = 6√2.',
            index: 2,
            radicand: 72,
            steps: ['Busca un cuadrado perfecto: 72 = 36 × 2.', 'Separa las raíces: √72 = √36 · √2.', 'Resultado: 6√2.']
        },
        {
            id: 'rationalize',
            title: 'Racionalización',
            text: 'Transforma una fracción para que el denominador no contenga raíces.',
            example: '1/√3 = √3/3.',
            index: 2,
            radicand: 3,
            steps: ['Multiplica arriba y abajo por √3.', 'El denominador queda √3 · √3 = 3.', 'Resultado: √3/3.']
        }
    ]);

    const definitions = concepts;

    function simplifySquareRoot(value) {
        let outside = 1;
        let inside = value;
        for (let factor = 2; factor * factor <= inside; factor++) {
            while (inside % (factor * factor) === 0) {
                outside *= factor;
                inside /= factor * factor;
            }
        }
        return { outside, inside };
    }

    function rootText(index, radicand) {
        if (index === 2) return `√${radicand}`;
        if (index === 3) return `∛${radicand}`;
        return `√[${index}]${radicand}`;
    }

    function simplifiedText(value) {
        const result = simplifySquareRoot(value);
        if (result.inside === 1) return `${result.outside}`;
        if (result.outside === 1) return `√${result.inside}`;
        return `${result.outside}√${result.inside}`;
    }

    function shuffle(items) {
        return [...items].sort(() => Math.random() - 0.5);
    }

    function pick(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function optionsFor(answer, alternatives) {
        return shuffle([...new Set([answer, ...alternatives])]).map(value => ({
            label: value,
            correct: value === answer
        }));
    }

    function questionKey(question) {
        return `${question.type}|${question.prompt}|${question.answer}`;
    }

    function createExactQuestion() {
        const value = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 20, 25]);
        const index = pick([2, 2, 2, 3]);
        const radicand = value ** index;
        const symbol = rootText(index, radicand);
        return {
            type: 'exact',
            prompt: pick([`Calcula ${symbol}.`, `Encuentra el valor de ${symbol}.`, `¿Qué número resulta de ${symbol}?`]),
            answer: `${value}`,
            options: optionsFor(`${value}`, [`${value + 1}`, `${value - 1}`, `${radicand}`]),
            explanation: `${symbol} = ${value} porque ${value}^${index} = ${radicand}.`,
            key: `exact|${index}|${radicand}|${value}`
        };
    }

    function createExistenceQuestion() {
        const isEven = Math.random() > 0.5;
        const index = isEven ? pick([2, 4, 6]) : pick([3, 5]);
        const radicand = -pick([2, 3, 5, 7, 8, 9, 11, 16, 25]);
        const answer = isEven ? 'No, no es real' : 'Sí, es real';
        return {
            type: 'existence',
            prompt: pick([`¿${rootText(index, radicand)} pertenece a los números reales?`, `¿Existe ${rootText(index, radicand)} en ℝ?`, `Clasifica ${rootText(index, radicand)}: ¿es real o no?`]),
            answer,
            options: optionsFor(answer, [isEven ? 'Sí, es real' : 'No, no es real', 'Solo si se cambia el índice']),
            explanation: isEven
                ? 'Una raíz de índice par con radicando negativo no tiene resultado real.'
                : 'Una raíz de índice impar puede tener radicando negativo y conservar un resultado real.',
            key: `existence|${index}|${radicand}`
        };
    }

    function createSimplifyQuestion() {
        const inside = pick([2, 3, 5, 6, 7, 10, 11, 13, 15, 17, 21, 30]);
        const outside = pick([2, 3, 4, 5, 6, 7, 8, 9]);
        const radicand = outside * outside * inside;
        const answer = simplifiedText(radicand);
        return {
            type: 'simplify',
            prompt: pick([`Simplifica ${rootText(2, radicand)}.`, `Extrae los factores de ${rootText(2, radicand)}.`, `Escribe ${rootText(2, radicand)} en forma reducida.`]),
            answer,
            options: optionsFor(answer, [`${outside}√${inside + 1}`, `√${outside * inside}`, `${outside * inside}`]),
            explanation: `${rootText(2, radicand)} = ${rootText(2, outside * outside)} · ${rootText(2, inside)} = ${answer}.`,
            key: `simplify|${radicand}`
        };
    }

    function createProductQuestion() {
        const first = pick([2, 3, 5, 6, 7, 8, 10, 12, 15, 18, 20]);
        const second = pick([2, 3, 5, 6, 7, 8, 10, 12, 15, 18, 20]);
        const answer = simplifiedText(first * second);
        return {
            type: 'product',
            prompt: pick([`Reduce ${rootText(2, first)} · ${rootText(2, second)}.`, `Calcula ${rootText(2, first)} · ${rootText(2, second)}.`, `Aplica el producto de radicales: ${rootText(2, first)} · ${rootText(2, second)}.`]),
            answer,
            options: optionsFor(answer, [rootText(2, first + second), `${first + second}`, simplifiedText(first) + simplifiedText(second)]),
            explanation: `√${first} · √${second} = √${first * second} = ${answer}.`,
            key: `product|${first}|${second}`
        };
    }

    function createQuotientQuestion() {
        const divisor = pick([2, 3, 4, 5, 6, 7, 8, 10, 12]);
        const quotient = pick([2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const radicand = divisor * quotient;
        const answer = simplifiedText(quotient);
        return {
            type: 'quotient',
            prompt: pick([`Reduce √${radicand} / √${divisor}.`, `Calcula √${radicand} / √${divisor}.`, `Aplica el cociente de radicales: √${radicand} / √${divisor}.`]),
            answer,
            options: optionsFor(answer, [`√${radicand - divisor}`, `${radicand / divisor}`, simplifiedText(radicand)]),
            explanation: `√${radicand} / √${divisor} = √(${radicand}/${divisor}) = ${answer}.`,
            key: `quotient|${radicand}|${divisor}`
        };
    }

    function createNestedQuestion() {
        const value = pick([64, 729, 4096, 15625, 46656]);
        const answer = `${Math.round(Math.pow(value, 1 / 6))}`;
        return {
            type: 'nested',
            prompt: pick([`Calcula √(∛${value}).`, `Reduce la raíz anidada √(∛${value}).`, `Convierte √(∛${value}) en una sola raíz.`]),
            answer,
            options: optionsFor(answer, [`${answer + 1}`, `${Math.round(Math.sqrt(value))}`, `${value}`]),
            explanation: `√(∛${value}) equivale a una raíz sexta: √[6]${value} = ${answer}.`,
            key: `nested|${value}`
        };
    }

    function createPowerQuestion() {
        const value = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
        const answer = `${value}`;
        return {
            type: 'power',
            prompt: pick([`Calcula √(${value}²).`, `Resuelve √(${value}²).`, `¿Cuál es la raíz principal de ${value}²?`]),
            answer,
            options: optionsFor(answer, [`-${value}`, `${value * value}`, `${value + 2}`]),
            explanation: `La raíz cuadrada principal es no negativa: √(${value}²) = ${value}.`,
            key: `power|${value}`
        };
    }

    function createAmplificationQuestion() {
        const radicand = pick([2, 3, 5, 6, 7, 10, 11, 13]);
        const factor = pick([2, 3, 4]);
        const targetIndex = 2 * factor;
        const answer = `√[${targetIndex}]${radicand ** factor}`;
        return {
            type: 'amplification',
            prompt: `Amplifica √${radicand} para que tenga índice ${targetIndex}.`,
            answer,
            options: optionsFor(answer, [`√[${targetIndex / 2}]${radicand ** 2}`, `√[${targetIndex}]${radicand ** (factor + 1)}`, `√${radicand ** targetIndex}`]),
            explanation: `Multiplicamos el índice por ${factor} y elevamos el radicando a ${factor}: √${radicand} = ${answer}.`,
            key: `amplification|${radicand}|${targetIndex}`
        };
    }

    function createLikeRadicalsQuestion() {
        const coefficientA = pick([2, 3, 4, 5, 6, 7, 8, 10]);
        const coefficientB = pick([2, 3, 4, 5, 6, 7, 8, 10]);
        const radicand = pick([2, 3, 5, 6, 7, 10, 11, 13]);
        const answer = `${coefficientA + coefficientB}√${radicand}`;
        return {
            type: 'likeRadicals',
            prompt: `Reduce ${coefficientA}√${radicand} + ${coefficientB}√${radicand}.`,
            answer,
            options: optionsFor(answer, [`${coefficientA * coefficientB}√${radicand}`, `${coefficientA + coefficientB}√${radicand + 1}`, `${coefficientA + coefficientB}`]),
            explanation: `Son radicales semejantes: se suman los coeficientes y se conserva el radical. ${coefficientA}√${radicand} + ${coefficientB}√${radicand} = ${answer}.`,
            key: `likeRadicals|${coefficientA}|${coefficientB}|${radicand}`
        };
    }

    function createAppliedQuestion() {
        const side = pick([3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25]);
        const area = side * side;
        const answer = `${side} cm`;
        return {
            type: 'applied',
            prompt: `Un cuadrado tiene un área de ${area} cm². ¿Cuánto mide cada lado?`,
            answer,
            options: optionsFor(answer, [`${area} cm`, `${side + 2} cm`, `${side * 2} cm`]),
            explanation: `El lado se obtiene calculando la raíz cuadrada del área: √${area} = ${side} cm.`,
            key: `applied|square|${area}`
        };
    }

    function createIrrationalEquationQuestion() {
        const solution = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]);
        const radicand = solution * solution;
        const answer = `${solution}`;
        return {
            type: 'irrationalEquation',
            prompt: `Resuelve √x = ${solution}.`,
            answer,
            options: optionsFor(answer, [`${radicand}`, `${solution + 1}`, `-${solution}`]),
            explanation: `Elevamos ambos lados al cuadrado: x = ${solution}² = ${radicand}.`,
            key: `irrationalEquation|${solution}`
        };
    }

    function createRationalizationQuestion() {
        const radicand = pick([2, 3, 5, 6, 7, 10, 11, 13, 17, 19]);
        const answer = `√${radicand}/${radicand}`;
        return {
            type: 'rationalize',
            prompt: `Racionaliza 1/√${radicand}.`,
            answer,
            options: optionsFor(answer, [`1/${radicand}`, `√${radicand}`, `√${radicand}/${radicand + 1}`]),
            explanation: `Multiplica numerador y denominador por √${radicand}: 1/√${radicand} = √${radicand}/${radicand}.`,
            key: `rationalize|${radicand}`
        };
    }

    function createConjugateQuestion() {
        return {
            type: 'conjugate',
            prompt: 'Racionaliza 1/(√2 + √3).',
            answer: '√3 - √2',
            options: optionsFor('√3 - √2', ['√3 + √2', '√2 - √3', '(√3 - √2)/2']),
            explanation: 'Multiplica por el conjugado (√3 - √2): el denominador queda 3 - 2 = 1.',
            key: 'conjugate|2|3'
        };
    }

    function createQuestion(level) {
        if (level === 1) return Math.random() > 0.5 ? createExactQuestion() : createExistenceQuestion();
        if (level === 2) {
            const questions = [createSimplifyQuestion, createProductQuestion, createQuotientQuestion, createNestedQuestion, createAmplificationQuestion, createLikeRadicalsQuestion];
            return questions[Math.floor(Math.random() * questions.length)]();
        }
        const questions = [createRationalizationQuestion, createConjugateQuestion, createPowerQuestion, createSimplifyQuestion, createAppliedQuestion, createIrrationalEquationQuestion];
        return questions[Math.floor(Math.random() * questions.length)]();
    }

    function generateQuestions(level = 1, total = 10, recentKeys = []) {
        const questions = [];
        const usedKeys = new Set(recentKeys);
        let attempts = 0;

        while (questions.length < total && attempts < total * 100) {
            const question = createQuestion(Math.min(3, Math.max(1, level)));
            const key = question.key || questionKey(question);
            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                questions.push(question);
            }
            attempts++;
        }

        while (questions.length < total) {
            questions.push(createQuestion(Math.min(3, Math.max(1, level))));
        }

        return questions;
    }

    function evaluateFree(index, radicand) {
        if (!Number.isInteger(index) || !Number.isInteger(radicand) || index < 2) {
            return { error: 'Usa un índice entero mayor o igual que 2 y un radicando entero.' };
        }
        if (index % 2 === 0 && radicand < 0) {
            return { error: 'Una raíz de índice par con radicando negativo no pertenece a los números reales.' };
        }
        const value = Math.sign(radicand) * Math.pow(Math.abs(radicand), 1 / index);
        return {
            value,
            display: Number.isInteger(value) ? `${value}` : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''),
            definition: index % 2 === 0 && radicand < 0 ? definitions[1] : definitions[0]
        };
    }

    function evaluateExplorer(operation, values) {
        const first = Number(values.first);
        const second = Number(values.second);

        if (operation === 'calculate') {
            return evaluateFree(Number(values.index), first);
        }

        if (operation === 'simplify') {
            if (!Number.isInteger(first) || first <= 0) return { error: 'Escribe un radicando entero positivo.' };
            const result = simplifySquareRoot(first);
            const display = result.inside === 1 ? `${result.outside}` : result.outside === 1 ? `√${result.inside}` : `${result.outside}√${result.inside}`;
            return {
                display,
                steps: [`${rootText(2, first)} = ${rootText(2, result.outside * result.outside)} · ${rootText(2, result.inside)}`, `${rootText(2, first)} = ${result.outside === 1 ? display : `${result.outside} · √${result.inside}`}`, `Resultado: ${display}.`]
            };
        }

        if (operation === 'combine') {
            if (!Number.isInteger(first) || !Number.isInteger(second) || first <= 0 || second <= 0) {
                return { error: 'Escribe dos radicandos enteros positivos.' };
            }
            const result = simplifySquareRoot(first * second);
            const display = result.inside === 1 ? `${result.outside}` : result.outside === 1 ? `√${result.inside}` : `${result.outside}√${result.inside}`;
            return { display, steps: [`√${first} · √${second} = √(${first} · ${second})`, `√${first * second} = ${display}`] };
        }

        if (operation === 'quotient') {
            const divisor = Number(values.second);
            if (!Number.isInteger(first) || !Number.isInteger(divisor) || first <= 0 || divisor <= 0) return { error: 'Escribe dos radicandos enteros positivos.' };
            const result = Math.sqrt(first / divisor);
            return { display: Number.isInteger(result) ? `${result}` : `√(${first}/${divisor})`, steps: [`√${first} / √${divisor} = √(${first}/${divisor})`, `Resultado: ${Number.isInteger(result) ? result : `√(${first}/${divisor})`}.`] };
        }

        if (operation === 'nested') {
            if (!Number.isInteger(first) || first <= 0) return { error: 'Escribe un radicando entero positivo.' };
            const result = Math.round(Math.pow(first, 1 / 6));
            return { display: `${result}`, steps: [`√(∛${first}) = √[6]${first}`, `√[6]${first} = ${result}.`] };
        }

        if (operation === 'power') {
            if (!Number.isInteger(first) || first <= 0) return { error: 'Escribe una base entera positiva.' };
            return { display: `${first}`, steps: [`√(${first}²)`, `Resultado: ${first}.`] };
        }

        if (operation === 'amplification') {
            if (!Number.isInteger(first) || first <= 1) return { error: 'Escribe un radicando entero mayor que 1.' };
            return { display: `√[6]${first ** 3}`, steps: [`√${first} = √[6]${first ** 3}`, 'Se multiplica el índice por 3 y se eleva el radicando al cubo.', `Resultado: √[6]${first ** 3}.`] };
        }

        if (operation === 'like') {
            if (!Number.isInteger(first) || !Number.isInteger(second) || first < 0 || second < 0) {
                return { error: 'Escribe dos coeficientes enteros no negativos.' };
            }
            const radicand = Number(values.radicand);
            if (!Number.isInteger(radicand) || radicand <= 0) return { error: 'Escribe un radicando entero positivo.' };
            return { display: `${first + second}√${radicand}`, steps: [`${first}√${radicand} + ${second}√${radicand}`, `(${first} + ${second})√${radicand}`, `Resultado: ${first + second}√${radicand}.`] };
        }

        if (operation === 'subtract') {
            const radicand = Number(values.radicand);
            if (!Number.isInteger(first) || !Number.isInteger(second) || !Number.isInteger(radicand) || first < 0 || second < 0 || radicand <= 0) return { error: 'Escribe coeficientes y radicando válidos.' };
            return { display: `${first - second}√${radicand}`, steps: [`${first}√${radicand} - ${second}√${radicand}`, `(${first} - ${second})√${radicand}`, `Resultado: ${first - second}√${radicand}.`] };
        }

        if (operation === 'rationalize') {
            if (!Number.isInteger(first) || first <= 1) return { error: 'Escribe un radicando mayor que 1.' };
            return { display: `√${first}/${first}`, steps: [`1/√${first}`, `Multiplica numerador y denominador por √${first}.`, `Resultado: √${first}/${first}.`] };
        }

        if (operation === 'conjugate') {
            return { display: '√3 - √2', steps: ['1/(√2 + √3)', 'Multiplica por el conjugado (√3 - √2).', 'El denominador queda 3 - 2 = 1.', 'Resultado: √3 - √2.'] };
        }

        if (operation === 'applied') {
            const area = Number(values.first);
            const side = Math.sqrt(area);
            if (!Number.isInteger(area) || area <= 0 || !Number.isInteger(side)) return { error: 'Escribe un área cuadrada positiva.' };
            return { display: `${side} cm`, steps: [`Área = ${area} cm²`, `Lado = √${area}`, `Resultado: ${side} cm.`] };
        }

        if (operation === 'equation') {
            const value = Number(values.first);
            if (!Number.isInteger(value) || value <= 0) return { error: 'Escribe un valor entero positivo.' };
            return { display: `${value ** 2}`, steps: [`√x = ${value}`, `Eleva ambos lados al cuadrado.`, `x = ${value}² = ${value ** 2}.`] };
        }

        return { error: 'Selecciona una operación válida.' };
    }

    window.RootsCore = Object.freeze({
        concepts,
        definitions,
        generateQuestions,
        evaluateFree,
        simplifiedText,
        rootText,
        evaluateExplorer
    });
})();