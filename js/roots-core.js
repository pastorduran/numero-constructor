(function () {
    const definitions = Object.freeze([
        {
            title: 'Raíz real',
            text: 'La raíz n-ésima de a es el número b que cumple b^n = a.',
            example: '√25 = 5 porque 5² = 25.'
        },
        {
            title: 'Condición de existencia',
            text: 'Si el índice es par, el radicando debe ser positivo o cero para que la raíz sea real. Con índice impar, también se admiten radicandos negativos.',
            example: '√(-9) no es real, pero ∛(-8) = -2.'
        },
        {
            title: 'Propiedades',
            text: 'Producto, cociente, potencia y raíz de una raíz pueden transformarse combinando índices y radicandos.',
            example: '√a · √b = √(ab) y √[m](√[n]a) = √[mn]a.'
        },
        {
            title: 'Simplificación',
            text: 'Extrae del radical los factores que sean potencias perfectas y conserva dentro solo la parte que no se puede extraer.',
            example: '√72 = √(36 · 2) = 6√2.'
        },
        {
            title: 'Racionalización',
            text: 'Transforma una fracción para que el denominador no contenga raíces.',
            example: '1/√3 = √3/3.'
        }
    ]);

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

    function optionsFor(answer, alternatives) {
        return shuffle([...new Set([answer, ...alternatives])]).map(value => ({
            label: value,
            correct: value === answer
        }));
    }

    function createExactQuestion() {
        const value = Math.floor(Math.random() * 11) + 2;
        const radicand = value * value;
        return {
            type: 'exact',
            prompt: `Calcula ${rootText(2, radicand)}.`,
            answer: `${value}`,
            options: optionsFor(`${value}`, [`${value + 1}`, `${value - 1}`, `${radicand}`]),
            explanation: `${rootText(2, radicand)} = ${value} porque ${value}² = ${radicand}.`
        };
    }

    function createExistenceQuestion() {
        const isEven = Math.random() > 0.35;
        const radicand = isEven ? -(Math.floor(Math.random() * 8) + 2) : -(Math.floor(Math.random() * 8) + 2);
        const index = isEven ? 2 : 3;
        const answer = isEven ? 'No, no es real' : 'Sí, es real';
        return {
            type: 'existence',
            prompt: `¿${rootText(index, radicand)} pertenece a los números reales?`,
            answer,
            options: optionsFor(answer, [isEven ? 'Sí, es real' : 'No, no es real', 'Solo si se cambia el índice']),
            explanation: isEven
                ? 'Una raíz de índice par con radicando negativo no tiene resultado real.'
                : 'Una raíz de índice impar puede tener radicando negativo y conservar un resultado real.'
        };
    }

    function createSimplifyQuestion() {
        const inside = Math.floor(Math.random() * 7) + 2;
        const outside = Math.floor(Math.random() * 4) + 2;
        const radicand = outside * outside * inside;
        const answer = simplifiedText(radicand);
        return {
            type: 'simplify',
            prompt: `Simplifica ${rootText(2, radicand)}.`,
            answer,
            options: optionsFor(answer, [`${outside}√${inside + 1}`, `√${outside * inside}`, `${outside * inside}`]),
            explanation: `${rootText(2, radicand)} = ${rootText(2, outside * outside)} · ${rootText(2, inside)} = ${answer}.`
        };
    }

    function createProductQuestion() {
        const first = Math.floor(Math.random() * 7) + 2;
        const second = Math.floor(Math.random() * 7) + 2;
        const answer = simplifiedText(first * second);
        return {
            type: 'product',
            prompt: `Reduce ${rootText(2, first)} · ${rootText(2, second)}.`,
            answer,
            options: optionsFor(answer, [rootText(2, first + second), `${first + second}`, simplifiedText(first) + simplifiedText(second)]),
            explanation: `√${first} · √${second} = √${first * second} = ${answer}.`
        };
    }

    function createQuotientQuestion() {
        const divisor = Math.floor(Math.random() * 5) + 2;
        const quotient = Math.floor(Math.random() * 5) + 2;
        const radicand = divisor * quotient;
        const answer = simplifiedText(quotient);
        return {
            type: 'quotient',
            prompt: `Reduce √${radicand} / √${divisor}.`,
            answer,
            options: optionsFor(answer, [`√${radicand - divisor}`, `${radicand / divisor}`, simplifiedText(radicand)]),
            explanation: `√${radicand} / √${divisor} = √(${radicand}/${divisor}) = ${answer}.`
        };
    }

    function createNestedQuestion() {
        const value = [8, 27, 64, 125][Math.floor(Math.random() * 4)];
        const answer = `${Math.round(Math.pow(value, 1 / 6))}`;
        return {
            type: 'nested',
            prompt: `Calcula √(∛${value}).`,
            answer,
            options: optionsFor(answer, [`${answer + 1}`, `${Math.round(Math.sqrt(value))}`, `${value}`]),
            explanation: `√(∛${value}) equivale a una raíz sexta: √[6]${value} = ${answer}.`
        };
    }

    function createPowerQuestion() {
        const value = Math.floor(Math.random() * 8) + 2;
        const answer = `${value}`;
        return {
            type: 'power',
            prompt: `Calcula √(${value}²).`,
            answer,
            options: optionsFor(answer, [`-${value}`, `${value * value}`, `${value + 2}`]),
            explanation: `La raíz cuadrada principal es no negativa: √(${value}²) = ${value}.`
        };
    }

    function createRationalizationQuestion() {
        const radicand = [2, 3, 5, 7][Math.floor(Math.random() * 4)];
        const answer = `√${radicand}/${radicand}`;
        return {
            type: 'rationalize',
            prompt: `Racionaliza 1/√${radicand}.`,
            answer,
            options: optionsFor(answer, [`1/${radicand}`, `√${radicand}`, `√${radicand}/${radicand + 1}`]),
            explanation: `Multiplica numerador y denominador por √${radicand}: 1/√${radicand} = √${radicand}/${radicand}.`
        };
    }

    function createConjugateQuestion() {
        return {
            type: 'conjugate',
            prompt: 'Racionaliza 1/(√2 + √3).',
            answer: '√3 - √2',
            options: optionsFor('√3 - √2', ['√3 + √2', '√2 - √3', '(√3 - √2)/2']),
            explanation: 'Multiplica por el conjugado (√3 - √2): el denominador queda 3 - 2 = 1.'
        };
    }

    function createQuestion(level) {
        if (level === 1) return Math.random() > 0.5 ? createExactQuestion() : createExistenceQuestion();
        if (level === 2) {
            const questions = [createSimplifyQuestion, createProductQuestion, createQuotientQuestion, createNestedQuestion];
            return questions[Math.floor(Math.random() * questions.length)]();
        }
        const questions = [createRationalizationQuestion, createConjugateQuestion, createPowerQuestion, createSimplifyQuestion];
        return questions[Math.floor(Math.random() * questions.length)]();
    }

    function generateQuestions(level = 1, total = 10) {
        return Array.from({ length: total }, () => createQuestion(Math.min(3, Math.max(1, level))));
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

    window.RootsCore = Object.freeze({
        definitions,
        generateQuestions,
        evaluateFree,
        simplifiedText,
        rootText
    });
})();