window.NotationCore = Object.freeze({
    normalizeLocaleNumber(value) {
        if (value === null || value === undefined) return NaN;

        let raw = String(value).trim().replace(/\s+/g, '');
        if (!raw) return NaN;

        if (raw.includes(',') && raw.includes('.')) {
            const lastComma = raw.lastIndexOf(',');
            const lastDot = raw.lastIndexOf('.');
            if (lastComma > lastDot) {
                raw = raw.replace(/\./g, '').replace(',', '.');
            } else {
                raw = raw.replace(/,/g, '');
            }
        } else if (raw.includes(',')) {
            const parts = raw.split(',');
            if (parts.length > 2) {
                raw = raw.replace(/,/g, '');
            } else {
                raw = raw.replace(',', '.');
            }
        } else if (raw.includes('.')) {
            const parts = raw.split('.');
            if (parts.length > 2) {
                raw = raw.replace(/\./g, '');
            }
        }

        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : NaN;
    },

    parseExponentInput(value) {
        if (value === null || value === undefined) return NaN;

        let raw = String(value).trim().toLowerCase().replace(/\s+/g, '');
        if (!raw) return NaN;

        raw = raw.replace(/×/g, 'x');

        if (/^[-+]?\d+$/.test(raw)) return Number(raw);

        const scientificMatch = /^x?10\^(?:[-+]?\d+)$/.test(raw);
        if (scientificMatch) {
            return Number(raw.replace(/^x?10\^/, ''));
        }

        return NaN;
    },

    numberToScientific(num) {
        if (num === 0) return { coefficient: 0, exponent: 0, scientific: '0' };

        const isNegative = num < 0;
        num = Math.abs(num);

        let exponent = 0;
        let coefficient = num;

        if (num >= 10) {
            while (coefficient >= 10) {
                coefficient /= 10;
                exponent++;
            }
        } else if (num < 1) {
            while (coefficient < 1) {
                coefficient *= 10;
                exponent--;
            }
        }

        coefficient = Math.round(coefficient * 100) / 100;

        const sign = isNegative ? '-' : '';
        const scientific = `${sign}${coefficient} × 10^${exponent}`;

        return { coefficient: sign + coefficient, exponent, scientific };
    },

    scientificToNumber(coefficient, exponent) {
        return parseFloat(coefficient) * Math.pow(10, parseInt(exponent));
    },

    scientificToHtml(coefficient, exponent) {
        const formattedCoefficient = window.MathDisplay.escape(coefficient);
        const sign = exponent < 0 ? '-' : '';
        return `${formattedCoefficient} × 10<sup>${sign}${Math.abs(exponent)}</sup>`;
    },

    formatDisplay(value) {
        return window.MathDisplay.format(value);
    }
});