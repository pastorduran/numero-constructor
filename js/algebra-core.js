(function () {
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

    function createTranslateQuestion() {
        const templates = [
            { text: 'el doble de un número', answer: '2x', wrong: ['x + 2', 'x²', 'x/2'] },
            { text: 'un número aumentado en 5', answer: 'x + 5', wrong: ['5x', 'x - 5', 'x · 5'] },
            { text: 'el triple de un número disminuido en 2', answer: '3x - 2', wrong: ['3(x - 2)', '2x - 3', '3x + 2'] },
            { text: 'la mitad de un número', answer: 'x/2', wrong: ['2x', 'x - 2', 'x²'] },
            { text: 'un número disminuido en 7', answer: 'x - 7', wrong: ['7 - x', '7x', 'x + 7'] },
            { text: 'el cuadrado de un número', answer: 'x²', wrong: ['2x', 'x + 2', 'x/2'] },
            { text: 'el producto de un número por sí mismo', answer: 'x · x', wrong: ['2x', 'x + x', 'x + 2'] },
            { text: 'el doble de mi edad aumentado en 6', answer: '2x + 6', wrong: ['6x + 2', '2(x + 6)', '2x - 6'] },
            { text: 'la mitad de una distancia', answer: 'd/2', wrong: ['2d', 'd - 2', 'd²'] },
            { text: 'cinco tercios del precio', answer: '(5/3)x', wrong: ['5x/3', 'x + 5/3', '5x · 3'] },
            { text: 'el cuadrado de la distancia', answer: 'd²', wrong: ['2d', 'd + 2', 'd · d · d'] }
        ];
        const item = pick(templates);
        return {
            type: 'translate',
            prompt: `¿Cómo se escribe «${item.text}» en lenguaje algebraico?`,
            answer: item.answer,
            options: optionsFor(item.answer, item.wrong),
            explanation: `«${item.text}» se traduce como ${item.answer}. La letra x representa el número desconocido.`,
            key: `translate|${item.text}`
        };
    }

    function createTermPartQuestion() {
        const templates = [
            { expression: '7x', coefficient: '7', literal: 'x' },
            { expression: '3ab', coefficient: '3', literal: 'ab' },
            { expression: '-5x²', coefficient: '-5', literal: 'x²' },
            { expression: '9y', coefficient: '9', literal: 'y' }
        ];
        const item = pick(templates);
        const askCoefficient = Math.random() > 0.5;
        const answer = askCoefficient ? item.coefficient : item.literal;
        const wrongs = askCoefficient ? [item.literal, '1', `${Number(item.coefficient) + 1 || 1}`] : [item.coefficient, 'x', '1'];
        return {
            type: 'termPart',
            prompt: askCoefficient
                ? `¿Cuál es el coeficiente numérico de ${item.expression}?`
                : `¿Cuál es el factor literal de ${item.expression}?`,
            answer,
            options: optionsFor(answer, wrongs),
            explanation: askCoefficient
                ? `En ${item.expression}, el número que acompaña a la letra es ${item.coefficient}.`
                : `En ${item.expression}, la parte con letras es ${item.literal}.`,
            key: `termPart|${item.expression}|${askCoefficient ? 'coef' : 'literal'}`
        };
    }

    function createEvaluateQuestion() {
        const a = pick([1, 2, 3, 4, 5]);
        const b = pick([2, 3, 4]);
        const c = pick([1, 2, 3, 5, 7]);
        const value = pick([2, 3, 4, 5]);
        const result = a * value * b + c;
        const answer = `${result}`;
        return {
            type: 'evaluate',
            prompt: `Si x = ${value}, ¿cuál es el valor de ${a}x · ${b} + ${c}?`,
            answer,
            options: optionsFor(answer, [`${a * value + c}`, `${result + b}`, `${result - c}`]),
            explanation: `Reemplaza x por ${value}: ${a} · ${value} · ${b} + ${c} = ${a * value * b} + ${c} = ${result}.`,
            key: `evaluate|${a}|${b}|${c}|${value}`
        };
    }

    function createSimplifyQuestion() {
        const a = pick([2, 3, 4, 5, 6, 7]);
        const b = pick([2, 3, 4, 5, 6, 8]);
        const letter = pick(['x', 'y', 'm']);
        const sum = a + b;
        const answer = `${sum}${letter}`;
        return {
            type: 'simplify',
            prompt: `Reduce: ${a}${letter} + ${b}${letter}.`,
            answer,
            options: optionsFor(answer, [`${a * b}${letter}`, `${sum}${letter}${letter}`, `${a + b}`]),
            explanation: `Los términos son semejantes porque comparten ${letter}. Sumamos los coeficientes: ${a} + ${b} = ${sum}. Resultado: ${sum}${letter}.`,
            key: `simplify|${a}|${b}|${letter}`
        };
    }

    function createDistributeQuestion() {
        const a = pick([2, 3, 4, 5]);
        const b = pick([2, 3, 4, 5, 6]);
        const letter = pick(['x', 'y']);
        const answer = `${a}${letter} + ${a * b}`;
        return {
            type: 'distribute',
            prompt: `Aplica la propiedad distributiva: ${a}(${letter} + ${b}).`,
            answer,
            options: optionsFor(answer, [`${a + letter} + ${a + b}`, `${a}${letter} + ${b}`, `${a * b}${letter}`]),
            explanation: `Multiplica ${a} por cada término: ${a} · ${letter} = ${a}${letter} y ${a} · ${b} = ${a * b}. Resultado: ${a}${letter} + ${a * b}.`,
            key: `distribute|${a}|${b}|${letter}`
        };
    }

    function createProblemQuestion() {
        const items = [
            {
                prompt: 'Juan anota x goles y Pedro anota el triple. ¿Cuántos goles anotan entre los dos?',
                answer: '4x',
                wrong: ['3x', 'x + 3', '3x + x²']
            },
            {
                prompt: 'Un cuaderno cuesta x y un lápiz cuesta la mitad. ¿Cuánto cuestan ambos juntos?',
                answer: 'x + x/2',
                wrong: ['2x', 'x/2', 'x · x/2']
            },
            {
                prompt: 'María tiene x años y su hermana tiene 6 años más. ¿Cuál expresión representa la suma de sus edades?',
                answer: '2x + 6',
                wrong: ['x + 6', '6x', 'x² + 6']
            },
            {
                prompt: 'Un rectángulo tiene lados x y 2x. ¿Cuál expresión representa su perímetro?',
                answer: '6x',
                wrong: ['3x', '2x²', '4x']
            },
            {
                prompt: 'En una jaula hay p gallinas. ¿Cuántas patas hay en total?',
                answer: '2p',
                wrong: ['4p', 'p + 2', 'p²']
            },
            {
                prompt: 'Una escalada usa a metros de cuerda y otra usa b metros. ¿Cuánta cuerda usan juntas?',
                answer: 'a + b',
                wrong: ['a · b', 'a - b', 'ab']
            },
            {
                prompt: 'Un baño tiene b baldosas en el largo y m en el ancho. ¿Cuántas baldosas hay en total?',
                answer: 'b · m',
                wrong: ['b + m', '2(b + m)', 'b² + m²']
            },
            {
                prompt: 'Un grupo tiene l leones y otro tiene c cebras. ¿Cuántos animales hay en total?',
                answer: 'l + c',
                wrong: ['l · c', 'l - c', 'lc']
            }
        ];
        const item = pick(items);
        return {
            type: 'problem',
            prompt: item.prompt,
            answer: item.answer,
            options: optionsFor(item.answer, item.wrong),
            explanation: `${item.prompt} → ${item.answer}. Traducimos cada relación y luego reducimos.`,
            key: `problem|${item.prompt}`
        };
    }

    function createQuestion(level) {
        if (level === 1) {
            const questions = [createTranslateQuestion, createTranslateQuestion, createTermPartQuestion];
            return pick(questions)();
        }
        if (level === 2) {
            const questions = [createEvaluateQuestion, createSimplifyQuestion, createTranslateQuestion];
            return pick(questions)();
        }
        const questions = [createDistributeQuestion, createProblemQuestion, createEvaluateQuestion, createSimplifyQuestion];
        return pick(questions)();
    }

    function questionKey(question) {
        return question.key || `${question.type}|${question.prompt}|${question.answer}`;
    }

    function generateQuestions(level = 1, total = 10, recentKeys = []) {
        const questions = [];
        const usedKeys = new Set(recentKeys);
        let attempts = 0;
        while (questions.length < total && attempts < total * 120) {
            const question = createQuestion(Math.min(3, Math.max(1, level)));
            const key = questionKey(question);
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

    function evaluateExplorer(operation, values) {
        const first = String(values.first || '').trim();

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
            return {
                display: `${value}`,
                steps: [`La letra vale ${value}.`, 'Reemplaza la letra por ese valor.', 'Calcula siguiendo el orden de las operaciones.']
            };
        }

        if (operation === 'simplify') {
            return {
                display: '8x',
                steps: ['Ambos términos tienen la misma letra: son semejantes.', 'Suma los coeficientes.', 'Conserva la letra en el resultado.']
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
