window.AppConfig = Object.freeze({
    STORAGE_KEY: 'numeroConstructorProgress',
    denominations: Object.freeze([
        { value: 10000000, name: 'DiezMillones', color: 'color-teal' },
        { value: 1000000, name: 'Millones', color: 'color-green' },
        { value: 100000, name: 'CienMiles', color: 'color-blue' },
        { value: 10000, name: 'DiezMiles', color: 'color-coral' },
        { value: 1000, name: 'Miles', color: 'color-purple' },
        { value: 100, name: 'Centenas', color: 'color-amber' },
        { value: 10, name: 'Decenas', color: 'color-red' },
        { value: 1, name: 'Unidades', color: 'color-lime' }
    ]),
    createCompositionState() {
        return {
            10000000: 0,
            1000000: 0,
            100000: 0,
            10000: 0,
            1000: 0,
            100: 0,
            10: 0,
            1: 0
        };
    }
});