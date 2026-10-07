window.MathDisplay = Object.freeze({
    escape(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    format(value) {
        let html = this.escape(value);

        html = html.replace(/([A-Za-zÁÉÍÓÚáéíóúÑñ]|\d+|\([^)]*\))\^\(?(-?[A-Za-zÁÉÍÓÚáéíóúÑñ0-9]+)\)?/g, '$1<sup>$2</sup>');
        html = html.replace(/(\d)[²³⁴⁵⁶⁷⁸⁹]/g, match => {
            const superscript = { '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
            return `${match[0]}<sup>${superscript[match[1]]}</sup>`;
        });

        // Fracciones: el coeficiente que acompaña a una raíz o a un paréntesis queda dentro
        // de la fracción (2√5/15, 3(√7 + √5)/2), para que no se lea como número mixto.
        const operand = '(?:\\d*(?:\\([^()]+\\)|√\\d+)|\\d+)';
        html = html.replace(new RegExp(`(${operand})\\s*\\/\\s*(${operand})`, 'g'), '<span class="math-fraction"><span class="math-numerator">$1</span><span class="math-denominator">$2</span></span>');

        // Índice de la raíz: √[4]81 se dibuja con el 4 pequeño sobre el radical.
        html = html.replace(/√\[(\d+)\]/g, '<sup class="math-index">$1</sup>√');
        return html;
    }
});