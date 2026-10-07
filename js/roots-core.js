(function () {
    'use strict';

    const QK = window.QuestionKit;
    const { sup, buildOptions, assertEquivalent, gcd } = QK;

    const concepts = Object.freeze([
        {
            id: 'real',
            title: 'Raíz real',
            text: 'La raíz n-ésima de a es el número b que cumple b^n = a.',
            example: '5 × 5 = 25, por eso √25 = 5.',
            index: 2,
            radicand: 25,
            steps: ['Tenemos 25 baldosas para formar un cuadrado.', 'El cuadrado tiene 5 filas y 5 columnas: 5 × 5 = 25.', 'Por eso, la medida de cada lado es √25 = 5.']
        },
        {
            id: 'existence',
            title: 'Condición de existencia',
            text: 'Si el índice es par, el radicando debe ser positivo o cero para que la raíz sea real. Con índice impar, también se admiten radicandos negativos.',
            example: '√(-9) no es real, pero ∛(-8) = -2.',
            index: 3,
            radicand: -8,
            steps: ['Mira el índice: 3 es impar.', 'Las raíces impares pueden trabajar con cantidades negativas.', 'Como (-2) × (-2) × (-2) = -8, entonces ∛(-8) = -2.']
        },
        {
            id: 'properties',
            title: 'Propiedades',
            text: 'Producto, cociente, potencia y raíz de una raíz pueden transformarse combinando índices y radicandos.',
            example: '√2 · √8 = √16 = 4.',
            index: 2,
            radicand: 16,
            steps: ['Combina las dos medidas: √2 × √8.', 'Multiplica los radicandos: 2 × 8 = 16.', 'Busca el lado del cuadrado de 16: √16 = 4.']
        },
        {
            id: 'simplify',
            title: 'Simplificación',
            text: 'Extrae del radical los factores que sean potencias perfectas y conserva dentro solo la parte que no se puede extraer.',
            example: '72 balones = 36 balones en un grupo cuadrado y 2 sueltos.',
            index: 2,
            radicand: 72,
            steps: ['Separa 72 en 36 × 2.', 'El grupo de 36 forma un cuadrado de 6 × 6.', '√72 = √36 · √2 = 6√2.']
        },
        {
            id: 'rationalize',
            title: 'Racionalización',
            text: 'Transforma una fracción para que el denominador no contenga raíces.',
            example: '1/√3 = √3/3: el valor no cambia, pero el denominador queda sin raíz.',
            index: 2,
            radicand: 3,
            steps: ['Multiplica arriba y abajo por la misma cantidad: √3/√3 = 1.', 'El denominador queda √3 × √3 = 3.', 'Resultado: 1/√3 = √3/3.']
        }
    ]);

    const definitions = concepts;

    /* ---------- Formato y utilidades ---------- */

    function rootSymbol(index) {
        return index === 2 ? '√' : index === 3 ? '∛' : `√[${index}]`;
    }

    function rootText(index, radicand) {
        const text = String(radicand);
        return `${rootSymbol(index)}${/^\d+(\.\d+)?$/.test(text) ? text : `(${text})`}`;
    }

    function simplifyRoot(index, value) {
        let outside = 1;
        let inside = value;
        for (let factor = 2; Math.pow(factor, index) <= inside; factor++) {
            const power = Math.pow(factor, index);
            while (inside % power === 0) {
                outside *= factor;
                inside /= power;
            }
        }
        return { outside, inside };
    }

    function simplifySquareRoot(value) {
        return simplifyRoot(2, value);
    }

    function radicalText(coef, index, inside) {
        if (inside === 1) return `${coef}`;
        const root = rootText(index, inside);
        return coef === 1 ? root : `${coef}${root}`;
    }

    function simplifiedText(value) {
        const result = simplifyRoot(2, value);
        return radicalText(result.outside, 2, result.inside);
    }

    const times = (n, value) => Array(n).fill(value).join(' × ');
    const SQUARES = '4, 9, 16, 25, 36, 49, 64, 81…';
    const CUBES = '8, 27, 64, 125…';

    // Pasos para simplificar una raíz (índice 2 o 3), en lenguaje sencillo.
    function explainSimplify(index, radicand) {
        const { outside, inside } = simplifyRoot(index, radicand);
        const original = rootText(index, radicand);
        const kind = index === 2 ? 'cuadrado perfecto' : 'cubo perfecto';
        const list = index === 2 ? SQUARES : CUBES;
        if (outside === 1) {
            return { outside, inside, steps: [`${original} ya no se puede simplificar: ningún ${kind} (${list}) divide a ${radicand}.`] };
        }
        const power = Math.pow(outside, index);
        const steps = [
            `Buscamos el mayor ${kind} (${list}) que divida a ${radicand}. Es ${power}, porque ${times(index, outside)} = ${power}.`,
            `Separamos ${radicand} = ${power} × ${inside}.`
        ];
        if (inside === 1) {
            steps.push(`${original} = ${rootText(index, power)} = ${outside}.`);
        } else {
            steps.push(`${original} = ${rootText(index, power)} · ${rootText(index, inside)}.`);
            steps.push(`${rootText(index, power)} = ${outside}, así que ese número sale del radical y queda multiplicando: ${radicalText(outside, index, inside)}.`);
        }
        return { outside, inside, steps };
    }

    function make(r, spec) {
        const { type, key, prompt, answer, wrong, steps, check, unit = '' } = spec;
        if (check) assertEquivalent(check, answer);
        let options = buildOptions(answer, wrong, r);
        if (unit) options = options.map(o => ({ label: `${o.label}${unit}`, correct: o.correct }));
        return {
            type,
            prompt,
            answer: `${answer}${unit}`,
            options,
            steps,
            explanation: steps.join(' '),
            key
        };
    }

    /* ---------- Nivel 1 ---------- */

    function exactQuestion(r) {
        const index = r.pick([2, 2, 2, 3, 3, 4]);
        const value = index === 2 ? r.int(2, 25) : index === 3 ? r.int(2, 10) : r.int(2, 5);
        const radicand = Math.pow(value, index);
        const symbol = rootText(index, radicand);
        const intro = index === 2
            ? `Imagina un cuadrado hecho con ${radicand} baldosas. ${symbol} es cuánto mide cada lado.`
            : index === 3
                ? `Imagina un cubo armado con ${radicand} cubitos. ${symbol} es cuánto mide cada arista.`
                : `${symbol} es el número que, multiplicado 4 veces por sí mismo, da ${radicand}.`;
        return make(r, {
            type: 'exact',
            key: `exact|${index}|${radicand}`,
            prompt: r.pick([`Calcula ${symbol}.`, `Encuentra el valor de ${symbol}.`, `¿Qué número resulta de ${symbol}?`]),
            answer: `${value}`,
            wrong: [`${value + 1}`, `${value - 1}`, `${radicand}`, `${value * index}`],
            check: symbol,
            steps: [
                intro,
                `Buscamos un número que, multiplicado ${index === 2 ? 'por sí mismo' : `${index === 3 ? 'tres' : 'cuatro'} veces`}, dé ${radicand}.`,
                `Probamos con ${value}: ${times(index, value)} = ${radicand}.`,
                `Por eso ${symbol} = ${value}.`
            ]
        });
    }

    function existenceQuestion(r) {
        const even = r.chance(0.5);
        const index = even ? r.pick([2, 4, 6]) : r.pick([3, 5]);
        const base = index === 3 ? r.int(1, 4) : r.int(1, 3);
        const radicand = even ? -r.pick([2, 3, 5, 7, 9, 11, 13, 16, 17, 19, 25, 30, 36, 50]) : -Math.pow(base, index);
        const text = rootText(index, radicand);
        const answer = even ? 'No, no es real' : 'Sí, es real';
        const steps = even
            ? [
                `Miramos el índice: ${index} es par.`,
                'Con índice par, el radicando no puede ser negativo.',
                'Porque 3 × 3 = 9 y también (−3) × (−3) = 9: menos por menos da más, y nunca sale un número negativo.',
                `Por eso ${text} no es un número real.`
            ]
            : [
                `Miramos el índice: ${index} es impar.`,
                'Con índice impar sí se pueden usar radicandos negativos.',
                `Buscamos un número que, multiplicado ${index} veces, dé −${Math.abs(radicand)}: (−${base})${sup(index)} = −${Math.abs(radicand)}.`,
                `Por eso ${text} = −${base}, y sí es un número real.`
            ];
        return make(r, {
            type: 'existence',
            key: `existence|${index}|${radicand}`,
            prompt: r.pick([`¿${text} pertenece a los números reales?`, `¿Existe ${text} en ℝ?`, `Clasifica ${text}: ¿es real o no?`]),
            answer,
            wrong: [even ? 'Sí, es real' : 'No, no es real', 'Solo si se cambia el índice', 'Solo si el resultado es positivo'],
            steps
        });
    }

    function appliedSideQuestion(r) {
        const side = r.int(3, 40);
        const area = side * side;
        return make(r, {
            type: 'applied',
            key: `applied|square|${area}`,
            prompt: `Un cuadrado tiene un área de ${area} cm². ¿Cuánto mide cada lado?`,
            answer: `${side}`,
            unit: ' cm',
            wrong: [`${area}`, `${side + 2}`, `${side * 2}`, `${side - 1}`],
            steps: [
                'El área de un cuadrado es lado × lado.',
                `Entonces lado × lado = ${area}.`,
                `El lado es la raíz cuadrada del área: √${area} = ${side}.`,
                `Comprobamos: ${side} × ${side} = ${area} ✓. El lado mide ${side} cm.`
            ]
        });
    }

    function estimateQuestion(r) {
        let n;
        do { n = r.int(2, 150); } while (Number.isInteger(Math.sqrt(n)));
        const lo = Math.floor(Math.sqrt(n));
        const hi = lo + 1;
        const half = Math.max(1, Math.round(n / 2));
        return make(r, {
            type: 'estimate',
            key: `estimate|${n}`,
            prompt: `¿Entre qué dos números enteros está √${n}?`,
            answer: `${lo} y ${hi}`,
            wrong: [`${lo - 1} y ${lo}`, `${hi} y ${hi + 1}`, `${half} y ${half + 1}`, `${lo * 2} y ${hi * 2}`],
            steps: [
                `Miramos los cuadrados perfectos cercanos a ${n}: ${lo} × ${lo} = ${lo * lo} y ${hi} × ${hi} = ${hi * hi}.`,
                `Como ${lo * lo} < ${n} < ${hi * hi}, la raíz de ${n} queda entre las raíces de ${lo * lo} y ${hi * hi}.`,
                `√${lo * lo} = ${lo} y √${hi * hi} = ${hi}.`,
                `Entonces √${n} está entre ${lo} y ${hi}.`
            ]
        });
    }

    /* ---------- Nivel 2 ---------- */

    function simplifyQuestion(r, level) {
        const index = level >= 3 && r.chance(0.5) ? 3 : 2;
        const inside = index === 2 ? r.pick([2, 3, 5, 6, 7, 10, 11, 13, 15, 17, 21, 30]) : r.pick([2, 3, 4, 5, 6, 7, 9, 10]);
        const outside = index === 2 ? r.pick([2, 3, 4, 5, 6, 7, 8, 9]) : r.pick([2, 3, 4, 5]);
        const radicand = Math.pow(outside, index) * inside;
        const info = explainSimplify(index, radicand);
        const answer = radicalText(info.outside, index, info.inside);
        const original = rootText(index, radicand);
        const wrong = [
            radicalText(inside, index, outside),
            rootText(index, outside * inside),
            `${outside * inside}`,
            radicalText(outside + 1, index, inside),
            radicalText(outside, index, inside * outside)
        ];
        const divisor = [2, 3, 4].find(h => h < outside && outside % h === 0);
        if (divisor) wrong.push({ text: radicalText(divisor, index, inside * Math.pow(outside / divisor, index)), partial: true });
        return make(r, {
            type: 'simplify',
            key: `simplify|${index}|${radicand}`,
            prompt: r.pick([`Simplifica al máximo ${original}.`, `Extrae los factores de ${original} y simplifica.`, `Escribe ${original} en su forma más reducida.`]),
            answer,
            wrong,
            check: original,
            steps: [...info.steps, `Resultado: ${original} = ${answer}.`]
        });
    }

    function productQuestion(r) {
        const pool = [2, 3, 5, 6, 7, 8, 10, 12, 15, 18, 20];
        if (r.chance(0.3)) {
            const k = r.int(2, 5);
            const m = r.int(2, 5);
            const radicand = r.pick([2, 3, 5, 6, 7]);
            const answer = `${k * m}√${radicand}`;
            return make(r, {
                type: 'product',
                key: `product|coef|${k}|${m}|${radicand}`,
                prompt: `Calcula ${k} · ${m}√${radicand}.`,
                answer,
                wrong: [`${k * m}√${radicand * k}`, `${k + m}√${radicand}`, `${k * m * radicand}`, `${k * m}√${radicand * m}`],
                check: `${k} * ${m}√${radicand}`,
                steps: [
                    `${m}√${radicand} significa ${m} × √${radicand}. El ${m} y la raíz se están multiplicando.`,
                    `Multiplicamos los números de afuera: ${k} × ${m} = ${k * m}.`,
                    `La raíz √${radicand} se queda igual: no cambia.`,
                    `Resultado: ${answer}.`
                ]
            });
        }
        const a = r.pick(pool);
        const b = r.pick(pool);
        const p = a * b;
        const info = explainSimplify(2, p);
        const answer = radicalText(info.outside, 2, info.inside);
        return make(r, {
            type: 'product',
            key: `product|${Math.min(a, b)}|${Math.max(a, b)}`,
            prompt: r.pick([`Calcula y simplifica √${a} · √${b}.`, `Aplica el producto de radicales y simplifica: √${a} · √${b}.`]),
            answer,
            wrong: [`√${a + b}`, `${a + b}`, `${p}`, `${a}√${b}`, `√${p * 2}`],
            check: `√${a} * √${b}`,
            steps: [
                'Las dos raíces tienen el mismo índice (2), así que se pueden juntar en una sola.',
                `√${a} · √${b} = √(${a} × ${b}) = √${p}.`,
                ...info.steps,
                `Resultado: ${answer}.`
            ]
        });
    }

    function quotientQuestion(r) {
        const divisor = r.pick([2, 3, 4, 5, 6, 7, 8, 10, 12]);
        const quotient = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 18]);
        const radicand = divisor * quotient;
        const info = explainSimplify(2, quotient);
        const answer = radicalText(info.outside, 2, info.inside);
        return make(r, {
            type: 'quotient',
            key: `quotient|${radicand}|${divisor}`,
            prompt: r.pick([`Calcula y simplifica √${radicand} / √${divisor}.`, `Aplica el cociente de radicales: √${radicand} / √${divisor}.`]),
            answer,
            wrong: [`√${radicand - divisor}`, `${quotient}`, simplifiedText(radicand), `√${radicand + divisor}`, `${radicand - divisor}`],
            check: `√${radicand} / √${divisor}`,
            steps: [
                'Las dos raíces tienen el mismo índice, así que podemos dividir los números de adentro.',
                `√${radicand} / √${divisor} = √(${radicand} ÷ ${divisor}).`,
                `${radicand} ÷ ${divisor} = ${quotient}, entonces queda √${quotient}.`,
                ...info.steps,
                `Resultado: ${answer}.`
            ]
        });
    }

    function nestedQuestion(r) {
        const [m, n] = r.pick([[2, 3], [3, 2], [2, 2]]);
        const total = m * n;
        const asValue = r.chance(0.5);
        const base = r.pick([2, 3, 4, 5]);
        const x = asValue ? Math.pow(base, total) : r.pick([2, 3, 5, 6, 7, 10]);
        const expression = `${rootSymbol(m)}(${rootText(n, x)})`;
        const joined = rootText(total, x);
        const steps = [
            'Una raíz dentro de otra raíz se puede juntar en una sola.',
            `Multiplicamos los índices: ${m} × ${n} = ${total}.`,
            `El número de adentro se queda igual: ${expression} = ${joined}.`
        ];
        if (asValue) {
            steps.push(`Buscamos qué número, multiplicado ${total} veces, da ${x}: ${times(total, base)} = ${x}.`);
            steps.push(`Entonces ${joined} = ${base}.`);
        } else {
            steps.push(`Resultado: ${joined}.`);
        }
        const answer = asValue ? `${base}` : joined;
        const wrong = asValue
            ? [`${base + 1}`, `${base - 1}`, `${x}`, `${base * total}`, `${Math.round(Math.sqrt(x))}`]
            : [rootText(m + n, x), rootText(total, x * total), rootText(m, x), rootText(n, x), rootText(total, x * x)];
        return make(r, {
            type: 'nested',
            key: `nested|${m}|${n}|${x}`,
            prompt: asValue
                ? r.pick([`Calcula ${expression}.`, `Reduce la raíz anidada ${expression} y calcula su valor.`])
                : `Convierte ${expression} en una sola raíz.`,
            answer,
            wrong,
            check: expression,
            steps
        });
    }

    function amplificationQuestion(r) {
        if (r.chance(0.3)) {
            const radicand = r.pick([2, 3, 5, 6, 7]);
            const factor = r.pick([2, 3]);
            const expression = rootText(2 * factor, radicand ** factor);
            const answer = rootText(2, radicand);
            return make(r, {
                type: 'amplification',
                key: `amplification|reduce|${radicand}|${factor}`,
                prompt: `Simplifica ${expression} dividiendo el índice y el exponente.`,
                answer,
                wrong: [rootText(factor, radicand), `${radicand}`, rootText(2 * factor, radicand), rootText(2, radicand ** factor)],
                check: expression,
                steps: [
                    `Escribimos el radicando como potencia: ${radicand ** factor} = ${radicand}${sup(factor)}.`,
                    `Ahora la raíz es ${rootText(2 * factor, `${radicand}${sup(factor)}`)}: el índice vale ${2 * factor} y el exponente vale ${factor}.`,
                    `Los dos se pueden dividir por ${factor} sin cambiar el valor: ${2 * factor} ÷ ${factor} = 2 y ${factor} ÷ ${factor} = 1.`,
                    `Resultado: ${answer}.`
                ]
            });
        }
        const radicand = r.pick([2, 3, 5, 6, 7, 10, 11, 13]);
        const factor = r.pick([2, 3, 4]);
        const target = 2 * factor;
        const answer = rootText(target, radicand ** factor);
        return make(r, {
            type: 'amplification',
            key: `amplification|amplify|${radicand}|${target}`,
            prompt: `Amplifica √${radicand} para que tenga índice ${target}.`,
            answer,
            wrong: [rootText(factor, radicand ** 2), rootText(target, radicand ** (factor + 1)), rootText(target, radicand * factor), rootText(target, radicand), `√${radicand ** target}`],
            check: `√${radicand}`,
            steps: [
                'Amplificar una raíz es cambiar su índice sin cambiar su valor.',
                `Queremos pasar del índice 2 al índice ${target}: multiplicamos por ${factor}.`,
                `Lo que hacemos al índice lo hacemos también al exponente: ${radicand} = ${radicand}¹ pasa a ${radicand}${sup(factor)}.`,
                `${radicand}${sup(factor)} = ${times(factor, radicand)} = ${radicand ** factor}.`,
                `Resultado: √${radicand} = ${answer}.`
            ]
        });
    }

    function likeRadicalsQuestion(r, level) {
        const op = r.chance(0.5) ? '+' : '-';
        const verb = op === '+' ? 'sumar' : 'restar';
        const radicand = r.pick([2, 3, 5, 6, 7, 10, 11, 13]);
        if (level >= 3) {
            let o1; let o2;
            do {
                o1 = r.int(1, 6); o2 = r.int(1, 6);
            } while (o1 === o2 || (o1 === 1 && o2 === 1) || (op === '-' && o1 < o2));
            const R1 = o1 * o1 * radicand;
            const R2 = o2 * o2 * radicand;
            const total = op === '+' ? o1 + o2 : o1 - o2;
            const answer = radicalText(total, 2, radicand);
            const part = (o, R) => (o === 1 ? `√${R} ya está simplificada: es √${radicand}.` : `√${R} = √(${o * o} × ${radicand}) = ${o}√${radicand}.`);
            return make(r, {
                type: 'likeRadicals',
                key: `likeRadicals|simplify|${R1}|${op}|${R2}`,
                prompt: `Calcula y simplifica √${R1} ${op} √${R2}.`,
                answer,
                wrong: [`√${op === '+' ? R1 + R2 : R1 - R2}`, `${o1 * o2}√${radicand}`, `${total}√${radicand + 1}`, `${total}`, `${op === '+' ? o1 + o2 : o1 - o2}√${R1}`],
                check: `√${R1} ${op} √${R2}`,
                steps: [
                    'Las raíces todavía no se parecen. Primero simplificamos cada una.',
                    part(o1, R1),
                    part(o2, R2),
                    `Ahora las dos tienen el mismo radical √${radicand}: ${o1 === 1 ? '' : o1}√${radicand} ${op} ${o2 === 1 ? '' : o2}√${radicand}.`,
                    `Es como ${verb} manzanas: ${o1} manzanas ${op} ${o2} manzanas = ${total} manzanas. Aquí la "manzana" es √${radicand}.`,
                    `Resultado: ${answer}.`
                ]
            });
        }
        let a; let b;
        do {
            a = r.int(2, 10); b = r.int(2, 10);
        } while (op === '-' && a <= b);
        const total = op === '+' ? a + b : a - b;
        const answer = radicalText(total, 2, radicand);
        return make(r, {
            type: 'likeRadicals',
            key: `likeRadicals|same|${a}|${op}|${b}|${radicand}`,
            prompt: `Calcula y simplifica ${a}√${radicand} ${op} ${b}√${radicand}.`,
            answer,
            wrong: [`${a * b}√${radicand}`, `${total}√${radicand + 1}`, `${total}`, `√${total * radicand}`, `${total}√${radicand * radicand}`],
            check: `${a}√${radicand} ${op} ${b}√${radicand}`,
            steps: [
                `Las dos raíces tienen el mismo radical √${radicand}: son "raíces hermanas", así que se pueden juntar.`,
                `Es como ${verb} manzanas: ${a} manzanas ${op} ${b} manzanas = ${total} manzanas. Aquí la "manzana" es √${radicand}.`,
                `${verb[0].toUpperCase()}${verb.slice(1)} solo los números de afuera: ${a} ${op} ${b} = ${total}.`,
                `El radical no cambia. Resultado: ${answer}.`
            ]
        });
    }

    /* ---------- Nivel 3 ---------- */

    function rationalizeQuestion(r) {
        const a = r.int(1, 9);
        const b = r.pick([1, 1, 2, 3, 4, 5, 6]);
        const c = r.pick([2, 3, 5, 6, 7, 10, 11]);
        const den = b * c;
        const g = gcd(a, den);
        const n = a / g;
        const d = den / g;
        const answer = d === 1 ? radicalText(n, 2, c) : `${radicalText(n, 2, c)}/${d}`;
        const denominator = b > 1 ? `${b}√${c}` : `√${c}`;
        const expression = `${a}/${b > 1 ? `(${denominator})` : denominator}`;
        const wrong = [`${a}/${den}`, `${a}√${c}`, `${a}√${c}/${den + 1}`, `√${c}/${den}`];
        if (b > 1) wrong.push(`${a}√${c}/${c}`, `${a}√${c}/${b}`);
        if (g > 1) wrong.push({ text: `${a}√${c}/${den}`, partial: true });
        const steps = [
            'Un denominador con raíz es incómodo. Queremos que quede sin raíz: eso se llama racionalizar.',
            `Multiplicamos arriba y abajo por √${c}. Es como multiplicar por 1 (porque √${c}/√${c} = 1), así que el valor no cambia.`,
            `Arriba: ${a} × √${c} = ${a}√${c}.`,
            `Abajo: ${b > 1 ? `${b} × ` : ''}√${c} × √${c} = ${b > 1 ? `${b} × ` : ''}${c} = ${den}. (Una raíz multiplicada por sí misma da el número de adentro.)`,
            `Nos queda ${a}√${c}/${den}.`,
            g > 1 ? `Simplificamos la fracción dividiendo arriba y abajo por ${g}: ${answer}.` : `Esa fracción ya no se puede simplificar. Resultado: ${answer}.`
        ];
        return make(r, {
            type: 'rationalize',
            key: `rationalize|${a}|${b}|${c}`,
            prompt: `Racionaliza y deja la fracción simplificada: ${expression}.`,
            answer,
            wrong,
            check: expression,
            steps
        });
    }

    function conjugateFraction(a, roots, den) {
        const g = gcd(a, den);
        const n = a / g;
        const d = den / g;
        const body = n === 1 ? (d === 1 ? roots : `(${roots})`) : `${n}(${roots})`;
        return d === 1 ? body : `${body}/${d}`;
    }

    function conjugateQuestion(r) {
        const pool = [2, 3, 5, 6, 7, 10, 11];
        let b; let c;
        do { b = r.pick(pool); c = r.pick(pool); } while (b <= c);
        const a = r.pick([1, 1, 2, 3, 4, 6]);
        const plus = r.chance(0.5);
        const den = b - c;
        const same = plus ? '+' : '-';
        const flip = plus ? '-' : '+';
        const expression = `${a}/(√${b} ${same} √${c})`;
        const answer = conjugateFraction(a, `√${b} ${flip} √${c}`, den);
        const wrong = [
            conjugateFraction(a, `√${b} ${same} √${c}`, den),
            conjugateFraction(a, `√${b} ${flip} √${c}`, b + c),
            `${a > 1 ? a : ''}(√${b} ${flip} √${c})`,
            conjugateFraction(a, `√${c} ${flip} √${b}`, den),
            conjugateFraction(a, `√${b} ${flip} √${c}`, b * c)
        ];
        return make(r, {
            type: 'conjugate',
            key: `conjugate|${a}|${b}|${c}|${same}`,
            prompt: `Racionaliza y simplifica ${expression}.`,
            answer,
            wrong,
            check: expression,
            steps: [
                `Cuando el denominador es una suma o resta de raíces, usamos su conjugado: los mismos números con el signo del medio cambiado. El conjugado de (√${b} ${same} √${c}) es (√${b} ${flip} √${c}).`,
                `Multiplicamos arriba y abajo por el conjugado. Es como multiplicar por 1, así que el valor no cambia.`,
                `Abajo usamos (m + n)(m − n) = m² − n²: (√${b})² − (√${c})² = ${b} − ${c} = ${den}.`,
                `Arriba: ${a} × (√${b} ${flip} √${c}) = ${a > 1 ? a : ''}(√${b} ${flip} √${c}).`,
                `Nos queda ${a > 1 ? a : ''}(√${b} ${flip} √${c})/${den}.`,
                `${gcd(a, den) > 1 || den === 1 ? 'Simplificamos lo que se pueda dividir. ' : 'Ya no se puede simplificar. '}Resultado: ${answer}.`
            ]
        });
    }

    function rootProductsQuestion(r) {
        const kind = r.pick(['sumDiff', 'sumDiffRoots', 'square']);
        if (kind === 'sumDiff') {
            const a = r.pick([2, 3, 5, 6, 7, 10, 11]);
            const k = r.int(1, 4);
            const result = a - k * k;
            return make(r, {
                type: 'rootProducts',
                key: `rootProducts|sumDiff|${a}|${k}`,
                prompt: `¿Cuál es el valor de (√${a} + ${k})(√${a} - ${k})?`,
                answer: `${result}`,
                wrong: [`${a + k * k}`, `${a - k}`, `${a * a - k * k}`, `${a - 2 * k}`],
                check: `(√${a} + ${k})(√${a} - ${k})`,
                steps: [
                    'Es una suma por diferencia: (m + n)(m − n) = m² − n².',
                    `Aquí m = √${a} y n = ${k}.`,
                    `m² = (√${a})² = ${a}, porque √${a} × √${a} = ${a}.`,
                    `n² = ${k}² = ${k * k}.`,
                    `${a} − ${k * k} = ${result}.`
                ]
            });
        }
        if (kind === 'sumDiffRoots') {
            let a; let b;
            do { a = r.pick([2, 3, 5, 6, 7, 10, 11]); b = r.pick([2, 3, 5, 6, 7, 10, 11]); } while (a === b);
            return make(r, {
                type: 'rootProducts',
                key: `rootProducts|sumDiffRoots|${a}|${b}`,
                prompt: `¿Cuál es el valor de (√${a} + √${b})(√${a} - √${b})?`,
                answer: `${a - b}`,
                wrong: [`${a + b}`, `${a * b}`, `${(a - b) * (a - b)}`, `${b - a === a - b ? a : b - a}`],
                check: `(√${a} + √${b})(√${a} - √${b})`,
                steps: [
                    'Es una suma por diferencia: (m + n)(m − n) = m² − n².',
                    `Aquí m = √${a} y n = √${b}.`,
                    `m² = (√${a})² = ${a} y n² = (√${b})² = ${b}.`,
                    `${a} − ${b} = ${a - b}.`
                ]
            });
        }
        const a = r.pick([2, 3, 5, 6, 7]);
        const k = r.int(1, 4);
        const plus = r.chance(0.5);
        const sign = plus ? '+' : '-';
        const flip = plus ? '-' : '+';
        const answer = `${a + k * k} ${sign} ${2 * k}√${a}`;
        return make(r, {
            type: 'rootProducts',
            key: `rootProducts|square|${a}|${k}|${sign}`,
            prompt: `Desarrolla (√${a} ${sign} ${k})².`,
            answer,
            wrong: [
                `${a + k * k}`,
                `${a + k * k} ${sign} ${k}√${a}`,
                `${a + k * k} ${flip} ${2 * k}√${a}`,
                `${a * a + k * k} ${sign} ${2 * k}√${a}`,
                `${a + k} ${sign} ${2 * k}√${a}`
            ],
            check: `(√${a} ${sign} ${k})²`,
            steps: [
                `Es un cuadrado de binomio: (m ${sign} n)² = m² ${sign} 2·m·n + n².`,
                `Aquí m = √${a} y n = ${k}.`,
                `m² = (√${a})² = ${a} y n² = ${k}² = ${k * k}.`,
                `El doble producto: 2 × √${a} × ${k} = ${2 * k}√${a}.`,
                `Juntamos: ${a} + ${k * k} ${sign} ${2 * k}√${a} = ${answer}.`
            ]
        });
    }

    function powerQuestion(r) {
        const v = r.int(2, 12);
        const kind = r.pick(['abs', 'abs', 'minus']);
        if (kind === 'minus') {
            return make(r, {
                type: 'power',
                key: `power|minus|${v}`,
                prompt: `Calcula -√${v * v}.`,
                answer: `-${v}`,
                wrong: [`${v}`, `${v * v}`, `-${v * v}`, `${v - 1}`],
                check: `-√${v * v}`,
                steps: [
                    `Primero calculamos la raíz: √${v * v} = ${v}, porque ${v} × ${v} = ${v * v}.`,
                    `El signo menos de afuera se aplica después: −${v}.`,
                    `Resultado: −${v}.`
                ]
            });
        }
        return make(r, {
            type: 'power',
            key: `power|abs|${v}`,
            prompt: `Calcula √((-${v})²).`,
            answer: `${v}`,
            wrong: [`-${v}`, `${v * v}`, `${v + 2}`, `${2 * v}`],
            check: `√((-${v})²)`,
            steps: [
                `Primero resolvemos lo de adentro: (−${v})² = (−${v}) × (−${v}) = ${v * v}. Menos por menos da más.`,
                `Ahora queda √${v * v}.`,
                `√${v * v} = ${v}, porque ${v} × ${v} = ${v * v}.`,
                `La raíz cuadrada nunca da un resultado negativo, por eso es ${v} y no −${v}. En general, √(a²) es el valor de a sin su signo.`
            ]
        });
    }

    function appliedAdvancedQuestion(r) {
        if (r.chance(0.5)) {
            let a; let b; let s; let info;
            let tries = 0;
            do {
                if (++tries > 200) throw new Error('Sin catetos válidos');
                a = r.int(1, 12); b = r.int(1, 12);
                s = a * a + b * b;
                info = simplifyRoot(2, s);
            } while (a === b || info.outside === 1 || info.inside === 1);
            const answer = radicalText(info.outside, 2, info.inside);
            return make(r, {
                type: 'applied',
                key: `applied|hypotenuse|${Math.min(a, b)}|${Math.max(a, b)}`,
                prompt: `Un triángulo rectángulo tiene catetos de ${a} cm y ${b} cm. ¿Cuánto mide su hipotenusa? Escribe la respuesta simplificada.`,
                answer,
                unit: ' cm',
                wrong: [`${a + b}`, `√${a + b}`, `${s}`, `${a * b}`],
                steps: [
                    'En un triángulo rectángulo se cumple el teorema de Pitágoras: cateto² + cateto² = hipotenusa².',
                    `Reemplazamos: ${a}² + ${b}² = ${a * a} + ${b * b} = ${s}.`,
                    `La hipotenusa es la raíz de ${s}: √${s}.`,
                    ...explainSimplify(2, s).steps,
                    `La hipotenusa mide ${answer} cm.`
                ]
            });
        }
        const a = r.int(2, 9);
        const b = r.int(2, 9);
        const c = r.int(2, 9);
        const D = a * a + b * b + c * c;
        return make(r, {
            type: 'applied',
            key: `applied|prism|${a}|${b}|${c}`,
            prompt: `La diagonal de un prisma recto de base rectangular se calcula como √(a² + b² + c²), con a, b y c las medidas de sus aristas. Si la diagonal mide √${D} cm y dos aristas miden ${a} cm y ${b} cm, ¿cuánto mide la arista que falta?`,
            answer: `${c}`,
            unit: ' cm',
            wrong: [`${c * c}`, `${D}`, `${a + b}`, `${D - a - b}`, `${c + 1}`, `${c - 1}`],
            steps: [
                `La fórmula de la diagonal es √(a² + b² + c²), y sabemos que vale √${D}.`,
                `Entonces a² + b² + c² = ${D}.`,
                `Reemplazamos las aristas conocidas: ${a}² + ${b}² + c² = ${D}, o sea ${a * a} + ${b * b} + c² = ${D}.`,
                `Sumamos: ${a * a + b * b} + c² = ${D}.`,
                `Restamos: c² = ${D} − ${a * a + b * b} = ${c * c}.`,
                `¿Qué número multiplicado por sí mismo da ${c * c}? ${c} × ${c} = ${c * c}.`,
                `La arista que falta mide ${c} cm.`
            ]
        });
    }

    function irrationalEquationQuestion(r) {
        const kind = r.pick(['basic', 'shifted', 'linear', 'noSolution']);
        if (kind === 'basic') {
            const n = r.int(2, 12);
            return make(r, {
                type: 'irrationalEquation',
                key: `irrationalEquation|basic|${n}`,
                prompt: `Resuelve √x = ${n}.`,
                answer: `${n * n}`,
                wrong: [`${n}`, `${2 * n}`, `-${n}`, `${n * n + n}`],
                steps: [
                    'La incógnita x está dentro de la raíz. Para sacarla, elevamos al cuadrado los dos lados de la igualdad.',
                    `(√x)² = ${n}², y como (√x)² = x, queda x = ${n * n}.`,
                    `Comprobamos: √${n * n} = ${n} ✓.`,
                    `La solución es x = ${n * n}.`
                ]
            });
        }
        if (kind === 'shifted') {
            const a = r.int(1, 5);
            const b = r.int(1, 8);
            const d = r.int(2, 6);
            const c = a + d;
            const x = d * d + b;
            return make(r, {
                type: 'irrationalEquation',
                key: `irrationalEquation|shifted|${a}|${b}|${c}`,
                prompt: `Resuelve ${a} + √(x - ${b}) = ${c}.`,
                answer: `${x}`,
                wrong: [`${d + b}`, `${d * d - b}`, `${c * c + b}`, `${d * d}`],
                steps: [
                    `Primero dejamos la raíz sola: pasamos el ${a} restando. √(x − ${b}) = ${c} − ${a} = ${d}.`,
                    `Elevamos al cuadrado los dos lados: (√(x − ${b}))² = ${d}², o sea x − ${b} = ${d * d}.`,
                    `Despejamos x sumando ${b}: x = ${d * d} + ${b} = ${x}.`,
                    `Comprobamos: ${a} + √(${x} − ${b}) = ${a} + √${d * d} = ${a} + ${d} = ${c} ✓.`,
                    `La solución es x = ${x}.`
                ]
            });
        }
        if (kind === 'linear') {
            const p = r.pick([2, 3, 4, 5]);
            const n = r.int(3, 9);
            const s = r.int(1, Math.floor((n * n - 1) / p));
            const q = n * n - p * s;
            return make(r, {
                type: 'irrationalEquation',
                key: `irrationalEquation|linear|${p}|${q}|${n}`,
                prompt: `Resuelve √(${p}x + ${q}) = ${n}.`,
                answer: `${s}`,
                wrong: [`${n * n - q}`, `${n - q}`, `${n * n + q}`, `${s + 1}`, `${s - 1}`],
                steps: [
                    `Elevamos al cuadrado los dos lados para quitar la raíz: ${p}x + ${q} = ${n}² = ${n * n}.`,
                    `Restamos ${q} a los dos lados: ${p}x = ${n * n} − ${q} = ${p * s}.`,
                    `Dividimos por ${p}: x = ${p * s} ÷ ${p} = ${s}.`,
                    `Comprobamos: √(${p} × ${s} + ${q}) = √${n * n} = ${n} ✓.`,
                    `La solución es x = ${s}.`
                ]
            });
        }
        const n = r.int(1, 9);
        return make(r, {
            type: 'irrationalEquation',
            key: `irrationalEquation|noSolution|${n}`,
            prompt: `¿Cuál es la solución real de √x = -${n}?`,
            answer: 'No tiene solución real',
            wrong: [`${n * n}`, `-${n}`, `${n}`],
            steps: [
                'Una raíz cuadrada nunca da un número negativo: su resultado siempre es 0 o positivo.',
                `Aquí la ecuación dice que √x vale −${n}, y eso es imposible.`,
                `Si elevamos al cuadrado sale x = ${n * n}, pero al comprobar: √${n * n} = ${n}, y no −${n} ✗.`,
                'Por eso no hay ninguna solución real.'
            ]
        });
    }

    /* ---------- Selección por nivel ---------- */

    const POOLS = {
        1: [exactQuestion, existenceQuestion, appliedSideQuestion, estimateQuestion],
        2: [simplifyQuestion, productQuestion, quotientQuestion, nestedQuestion, amplificationQuestion, likeRadicalsQuestion],
        3: [simplifyQuestion, likeRadicalsQuestion, rationalizeQuestion, conjugateQuestion, rootProductsQuestion, powerQuestion, appliedAdvancedQuestion, irrationalEquationQuestion]
    };

    function generateQuestions(level = 1, total = 10, recentKeys = [], seed) {
        const lvl = Math.min(3, Math.max(1, Math.round(level) || 1));
        const makers = POOLS[lvl].map(fn => r => fn(r, lvl));
        return QK.generateSet(makers, total, recentKeys, seed);
    }

    /* ---------- Explorador ---------- */

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

    const isPositiveInt = n => Number.isInteger(n) && n > 0;

    function evaluateExplorer(operation, values) {
        const first = Number(values.first);
        const second = Number(values.second);

        if (operation === 'calculate') {
            return evaluateFree(Number(values.index), first);
        }

        if (operation === 'simplify') {
            if (!isPositiveInt(first)) return { error: 'Escribe un radicando entero positivo.' };
            const info = explainSimplify(2, first);
            const display = radicalText(info.outside, 2, info.inside);
            return { display, steps: [...info.steps, `Resultado: ${display}.`] };
        }

        if (operation === 'combine') {
            if (!isPositiveInt(first) || !isPositiveInt(second)) return { error: 'Escribe dos radicandos enteros positivos.' };
            const product = first * second;
            const info = explainSimplify(2, product);
            const display = radicalText(info.outside, 2, info.inside);
            return {
                display,
                steps: [
                    'Las dos raíces tienen el mismo índice, así que se pueden juntar en una sola.',
                    `√${first} · √${second} = √(${first} × ${second}) = √${product}.`,
                    ...info.steps,
                    `Resultado: ${display}.`
                ]
            };
        }

        if (operation === 'quotient') {
            if (!isPositiveInt(first) || !isPositiveInt(second)) return { error: 'Escribe dos radicandos enteros positivos.' };
            if (first % second === 0) {
                const q = first / second;
                const info = explainSimplify(2, q);
                const display = radicalText(info.outside, 2, info.inside);
                return {
                    display,
                    steps: [
                        'Las dos raíces tienen el mismo índice, así que podemos dividir los números de adentro.',
                        `√${first} / √${second} = √(${first} ÷ ${second}) = √${q}.`,
                        ...info.steps,
                        `Resultado: ${display}.`
                    ]
                };
            }
            const g = gcd(first, second);
            const display = `√(${first / g}/${second / g})`;
            return {
                display,
                steps: [
                    'Las dos raíces tienen el mismo índice, así que podemos dividir los números de adentro.',
                    `√${first} / √${second} = √(${first}/${second}).`,
                    g > 1 ? `Simplificamos la fracción dividiendo por ${g}: ${first}/${second} = ${first / g}/${second / g}.` : 'La fracción ya no se puede simplificar.',
                    `Resultado: ${display}.`
                ]
            };
        }

        if (operation === 'nested') {
            if (!isPositiveInt(first)) return { error: 'Escribe un radicando entero positivo.' };
            const root = Math.round(Math.pow(first, 1 / 6));
            const exact = Math.pow(root, 6) === first;
            return {
                display: exact ? `${root}` : rootText(6, first),
                steps: [
                    'Una raíz dentro de otra se puede juntar en una sola multiplicando los índices: 2 × 3 = 6.',
                    `√(∛${first}) = ${rootText(6, first)}.`,
                    exact ? `${times(6, root)} = ${first}, entonces ${rootText(6, first)} = ${root}.` : `${first} no es una potencia sexta perfecta, así que el resultado queda como ${rootText(6, first)}.`
                ]
            };
        }

        if (operation === 'power') {
            if (!isPositiveInt(first)) return { error: 'Escribe una base entera positiva.' };
            return {
                display: `${first}`,
                steps: [
                    `Primero el cuadrado de adentro: ${first}² = ${first} × ${first} = ${first * first}.`,
                    `Ahora √${first * first} = ${first}, porque ${first} × ${first} = ${first * first}.`,
                    `Resultado: ${first}.`
                ]
            };
        }

        if (operation === 'amplification') {
            if (!Number.isInteger(first) || first <= 1) return { error: 'Escribe un radicando entero mayor que 1.' };
            return {
                display: rootText(6, first ** 3),
                steps: [
                    'Amplificar es cambiar el índice sin cambiar el valor de la raíz.',
                    'Pasamos del índice 2 al índice 6: multiplicamos por 3.',
                    `Lo mismo hacemos con el exponente: ${first} pasa a ${first}³ = ${times(3, first)} = ${first ** 3}.`,
                    `Resultado: √${first} = ${rootText(6, first ** 3)}.`
                ]
            };
        }

        if (operation === 'like' || operation === 'subtract') {
            const radicand = Number(values.radicand);
            const valid = Number.isInteger(first) && Number.isInteger(second) && first >= 0 && second >= 0;
            if (!valid) return { error: operation === 'like' ? 'Escribe dos coeficientes enteros no negativos.' : 'Escribe coeficientes y radicando válidos.' };
            if (!isPositiveInt(radicand)) return { error: 'Escribe un radicando entero positivo.' };
            const add = operation === 'like';
            const total = add ? first + second : first - second;
            const display = total === 0 ? '0' : radicalText(total, 2, radicand);
            const verb = add ? 'sumar' : 'restar';
            return {
                display,
                steps: [
                    `Las dos raíces tienen el mismo radical √${radicand}, así que se pueden juntar.`,
                    `Es como ${verb} manzanas: ${first} manzanas ${add ? '+' : '-'} ${second} manzanas = ${total} manzanas. Aquí la "manzana" es √${radicand}.`,
                    `${first} ${add ? '+' : '-'} ${second} = ${total}. El radical no cambia.`,
                    `Resultado: ${display}.`
                ]
            };
        }

        if (operation === 'rationalize') {
            if (!Number.isInteger(first) || first <= 1) return { error: 'Escribe un radicando mayor que 1.' };
            return {
                display: `√${first}/${first}`,
                steps: [
                    `Tenemos 1/√${first}. Queremos que el denominador no tenga raíz.`,
                    `Multiplicamos arriba y abajo por √${first} (es como multiplicar por 1, el valor no cambia).`,
                    `Abajo: √${first} × √${first} = ${first}. Arriba: 1 × √${first} = √${first}.`,
                    `Resultado: √${first}/${first}.`
                ]
            };
        }

        if (operation === 'conjugate') {
            const custom = Number.isInteger(first) && Number.isInteger(second) && first > 1 && second > 1 && first !== second;
            const b = custom ? Math.max(first, second) : 3;
            const c = custom ? Math.min(first, second) : 2;
            const den = b - c;
            const answer = conjugateFraction(1, `√${b} - √${c}`, den);
            return {
                display: answer,
                steps: [
                    `Tenemos 1/(√${c} + √${b}). El denominador es una suma de raíces.`,
                    `Multiplicamos arriba y abajo por su conjugado (√${b} − √${c}): los mismos números con el signo del medio cambiado.`,
                    `Abajo: (√${b} + √${c})(√${b} − √${c}) = ${b} − ${c} = ${den}.`,
                    `Arriba: 1 × (√${b} − √${c}) = √${b} − √${c}.`,
                    `Resultado: ${answer}.`
                ]
            };
        }

        if (operation === 'applied') {
            const area = first;
            const side = Math.sqrt(area);
            if (!Number.isInteger(area) || area <= 0 || !Number.isInteger(side)) return { error: 'Escribe un área cuadrada positiva.' };
            return {
                display: `${side} cm`,
                steps: [
                    `El área de un cuadrado es lado × lado, y aquí vale ${area} cm².`,
                    `El lado es la raíz cuadrada del área: √${area}.`,
                    `Como ${side} × ${side} = ${area}, el lado mide ${side} cm.`
                ]
            };
        }

        if (operation === 'equation') {
            if (!isPositiveInt(first)) return { error: 'Escribe un valor entero positivo.' };
            return {
                display: `${first ** 2}`,
                steps: [
                    `Tenemos √x = ${first}. Queremos encontrar x.`,
                    `Elevamos al cuadrado los dos lados: (√x)² = ${first}².`,
                    `x = ${first} × ${first} = ${first ** 2}.`,
                    `Comprobamos: √${first ** 2} = ${first} ✓.`
                ]
            };
        }

        return { error: 'Selecciona una operación válida.' };
    }

    window.RootsCore = Object.freeze({
        concepts,
        definitions,
        simplifySquareRoot,
        generateQuestions,
        evaluateFree,
        simplifiedText,
        rootText,
        evaluateExplorer
    });
})();
