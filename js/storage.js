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
                bestRoots: Number(saved.bestRoots) || 0
            };
        } catch (error) {
            return {
                compositionLevel: 1,
                notationLevel: 1,
                rootsLevel: 1,
                bestComposition: 0,
                bestNotation: 0,
                bestRoots: 0
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
    }
});