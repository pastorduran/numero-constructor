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

        html = html.replace(/(\d+|√\d+)\/(\d+|√\d+)/g, '<span class="math-fraction"><span class="math-numerator">$1</span><span class="math-denominator">$2</span></span>');
        return html;
    }
});