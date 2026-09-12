(function () {
const compositionDenominations = window.AppConfig.denominations;

function generateRandomNumbers(level = 1) {
    const questions = [];
    const totalQuestions = 10;
    const questionTypes = ['selector', 'normal', 'exponential', 'selector', 'normal', 'exponential', 'selector', 'normal', 'exponential', 'selector'];
    const zeroQuestionsCount = 3 + (level >= 2 ? 1 : 0);
    const normalQuestionsCount = totalQuestions - zeroQuestionsCount;
    const maxRange = level >= 3 ? 99999999 : 9999999;

    for (let i = 0; i < normalQuestionsCount; i++) {
        let num = 0;
        while (num === 0 || num > maxRange) {
            num = Math.floor(Math.random() * (maxRange + 1));
        }
        questions.push({ number: num, emphasizeZeros: false });
    }

    for (let i = 0; i < zeroQuestionsCount; i++) {
        let num = generateNumberWithZeros();
        if (level >= 2) {
            num = Math.max(1000, num + Math.floor(Math.random() * 50000));
        }
        questions.push({ number: num, emphasizeZeros: true });
    }

    return questions
        .sort(() => Math.random() - 0.5)
        .map((question, index) => ({ ...question, type: questionTypes[index] }));
}

function generateNumberWithZeros() {
    const templates = [
        [Math.floor(Math.random() * 9) + 1, 0, Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9)],
        [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, 0, Math.floor(Math.random() * 999)],
        [Math.floor(Math.random() * 9) + 1, 0, 0, Math.floor(Math.random() * 999)],
        [Math.floor(Math.random() * 9) + 1, 0, Math.floor(Math.random() * 99) + 1, 0],
        [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 99), Math.floor(Math.random() * 9)]
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template[0] * 1000000 + template[1] * 100000 + template[2] * 1000 + template[3];
}

function numberToAnswer(num) {
    const numStr = num.toString().padStart(8, '0');
    return {
        10000000: parseInt(numStr[0]),
        1000000: parseInt(numStr[1]),
        100000: parseInt(numStr[2]),
        10000: parseInt(numStr[3]),
        1000: parseInt(numStr[4]),
        100: parseInt(numStr[5]),
        10: parseInt(numStr[6]),
        1: parseInt(numStr[7])
    };
}

function generateExpression(num) {
    const answer = numberToAnswer(num);
    const termColorMap = {
        10000000: 'term-teal', 1000000: 'term-green', 100000: 'term-blue', 10000: 'term-coral',
        1000: 'term-purple', 100: 'term-amber', 10: 'term-red', 1: 'term-lime'
    };
    const exponentsMap = {
        10000000: 7, 1000000: 6, 100000: 5, 10000: 4,
        1000: 3, 100: 2, 10: 1, 1: 0
    };
    const termsNormal = [];
    const termsExponential = [];

    for (const [value, count] of Object.entries(answer)) {
        const denomination = parseInt(value);
        if (count > 0) {
            const colorClass = termColorMap[denomination];
            const exponent = exponentsMap[denomination];
            termsNormal.push(`<span class="expression-term ${colorClass}">${count}×${denomination.toLocaleString('es-CL')}</span>`);
            termsExponential.push(`<span class="expression-term ${colorClass}">${count}×10<sup>${exponent}</sup></span>`);
        }
    }

    const expressionN = termsNormal.length ? termsNormal.join(' <span class="plus">+</span> ') : '0';
    const expressionE = termsExponential.length ? termsExponential.join(' <span class="plus">+</span> ') : '0';
    const resultHtml = `<span class="result">${num.toLocaleString('es-CL')}</span>`;

    return `
        <div class="expression-form">
            <div class="form-label">Forma normal</div>
            ${expressionN} <span class="equals">=</span> ${resultHtml}
        </div>
        <div class="expression-form">
            <div class="form-label">Forma exponencial</div>
            ${expressionE} <span class="equals">=</span> ${resultHtml}
        </div>
    `;
}

function formatCompositionExpression(answer, type) {
    const terms = compositionDenominations
        .filter(denom => answer[denom.value] > 0)
        .map(denom => type === 'normal'
            ? `${answer[denom.value]} × ${denom.value.toLocaleString('es-CL')}`
            : `${answer[denom.value]} × 10<sup>${Math.log10(denom.value)}</sup>`
        );

    return terms.length ? terms.join(' + ') : '0';
}

function createCompositionOptions(num, type) {
    const answer = numberToAnswer(num);
    const incorrectAnswer = { ...answer };
    const changedDenomination = [...compositionDenominations].reverse().find(denom => answer[denom.value] > 0);

    if (changedDenomination) {
        incorrectAnswer[changedDenomination.value] = (incorrectAnswer[changedDenomination.value] + 1) % 10;
    }

    const alternateAnswer = { ...answer };
    const alternateDenomination = compositionDenominations.find(denom => answer[denom.value] > 0);
    if (alternateDenomination) {
        alternateAnswer[alternateDenomination.value] = (alternateAnswer[alternateDenomination.value] + 2) % 10;
    }

    return [
        { expression: formatCompositionExpression(answer, type), correct: true },
        { expression: formatCompositionExpression(incorrectAnswer, type), correct: false },
        { expression: formatCompositionExpression(alternateAnswer, type), correct: false }
    ].sort(() => Math.random() - 0.5);
}

window.CompositionCore = Object.freeze({
    generateRandomNumbers,
    generateExpression,
    numberToAnswer,
    createCompositionOptions
});
})();