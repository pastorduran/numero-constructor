window.AppStorage = Object.freeze({
    getProgress() {
        try {
            const saved = JSON.parse(localStorage.getItem(window.AppConfig.STORAGE_KEY) || '{}');
            return {
                compositionLevel: Math.max(1, Number(saved.compositionLevel) || 1),
                notationLevel: Math.max(1, Number(saved.notationLevel) || 1),
                rootsLevel: Math.max(1, Number(saved.rootsLevel) || 1),
                bestComposition: Number(saved.bestComposition) || 0,
                bestNotation: Number(saved.bestNotation) || 0,
                bestRoots: Number(saved.bestRoots) || 0,
                recentQuestions: saved.recentQuestions && typeof saved.recentQuestions === 'object'
                    ? saved.recentQuestions
                    : {},
                errorCounts: saved.errorCounts && typeof saved.errorCounts === 'object'
                    ? saved.errorCounts
                    : {}
            };
        } catch (error) {
            return {
                compositionLevel: 1,
                notationLevel: 1,
                rootsLevel: 1,
                bestComposition: 0,
                bestNotation: 0,
                bestRoots: 0,
                recentQuestions: {},
                errorCounts: {}
            };
        }
    },

    saveSnapshot(key, state) {
        const saved = window.AppStorage.getProgress();
        const next = {
            ...saved,
            compositionLevel: key === 'game' ? Math.max(saved.compositionLevel, Math.max(1, state.level || 1)) : saved.compositionLevel,
            notationLevel: key === 'notation' ? Math.max(saved.notationLevel, Math.max(1, state.level || 1)) : saved.notationLevel,
            rootsLevel: key === 'roots' ? Math.max(saved.rootsLevel, Math.max(1, state.level || 1)) : saved.rootsLevel,
            bestComposition: key === 'game' ? Math.max(saved.bestComposition, state.correctAnswers || 0) : saved.bestComposition,
            bestNotation: key === 'notation' ? Math.max(saved.bestNotation, state.correctAnswers || 0) : saved.bestNotation,
            bestRoots: key === 'roots' ? Math.max(saved.bestRoots, state.correctAnswers || 0) : saved.bestRoots
        };

        try {
            localStorage.setItem(window.AppConfig.STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            // La aplicación continúa funcionando aunque el almacenamiento no esté disponible.
        }
    },

    getRecentQuestions(moduleKey) {
        const progress = this.getProgress();
        return Array.isArray(progress.recentQuestions[moduleKey])
            ? progress.recentQuestions[moduleKey]
            : [];
    },

    recordError(moduleKey, errorType) {
        const progress = this.getProgress();
        const moduleErrors = progress.errorCounts[moduleKey] || {};
        const errorCounts = {
            ...progress.errorCounts,
            [moduleKey]: {
                ...moduleErrors,
                [errorType]: (moduleErrors[errorType] || 0) + 1
            }
        };

        try {
            localStorage.setItem(window.AppConfig.STORAGE_KEY, JSON.stringify({
                ...progress,
                errorCounts
            }));
        } catch (error) {
            // La aplicación continúa funcionando aunque el almacenamiento no esté disponible.
        }
    },

    rememberQuestions(moduleKey, keys, limit = 30) {
        const progress = window.AppStorage.getProgress();
        const previous = window.AppStorage.getRecentQuestions(moduleKey);
        const recentQuestions = {
            ...progress.recentQuestions,
            [moduleKey]: [...new Set([...previous, ...keys])].slice(-limit)
        };

        try {
            localStorage.setItem(window.AppConfig.STORAGE_KEY, JSON.stringify({
                ...progress,
                recentQuestions
            }));
        } catch (error) {
            // La aplicación continúa funcionando aunque el almacenamiento no esté disponible.
        }
    }
});