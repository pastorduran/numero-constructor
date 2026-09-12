(function () {
    const helpContent = {
        game: {
            title: 'Ayuda: composición',
            message: 'Cada cifra representa una posición del número. Observa el valor de cada columna y escribe la cantidad correspondiente.',
            example: 'Ejemplo: 3.204 = 3 × 1.000 + 2 × 100 + 4 × 1.'
        },
        notation: {
            title: 'Ayuda: notación científica',
            message: 'Escribe el número como un coeficiente entre 1 y 10 multiplicado por una potencia de 10. Cuenta cuántos lugares se mueve la coma.',
            example: 'Ejemplo: 470.000 = 4,7 × 10⁵.'
        },
        roots: {
            title: 'Ayuda: raíces',
            message: 'Busca el número que, elevado al índice de la raíz, produce el radicando. Revisa si el índice es par o impar.',
            example: 'Ejemplo: √25 = 5 porque 5² = 25.'
        }
    };

    function playClickSound(type = 'add') {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const context = new AudioCtx();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = type === 'add' ? 760 : 420;
            gain.gain.value = 0.0001;
            oscillator.connect(gain);
            gain.connect(context.destination);
            const now = context.currentTime;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.025, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.22);
            setTimeout(() => {
                try { context.close(); } catch (error) {}
            }, 500);
        } catch (error) {}
    }

    function triggerConfetti() {
        const container = document.getElementById('confettiLayer');
        if (!container) return;

        const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#4ecdc4', '#5b8def', '#9b5de5', '#f15bb5'];
        container.innerHTML = '';

        for (let i = 0; i < 32; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            const angle = (Math.PI * 2 * i) / 32;
            const radius = 60 + Math.random() * 120;
            piece.style.background = colors[i % colors.length];
            piece.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
            piece.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
            piece.style.setProperty('--r', `${(Math.random() * 360) - 180}deg`);
            container.appendChild(piece);
        }

        setTimeout(() => { container.innerHTML = ''; }, 1200);
    }

    function showComboBurst(label, key = 'game', delay = 320) {
        const burst = document.getElementById('comboBurst');
        const badge = document.getElementById(`${key}ComboBadge`);
        if (!burst || !badge) return;

        setTimeout(() => {
            burst.textContent = label;
            const rect = badge.getBoundingClientRect();
            burst.style.left = `${rect.left + rect.width / 2}px`;
            burst.style.top = `${rect.top - 8}px`;
            burst.classList.remove('show');
            void burst.offsetWidth;
            burst.classList.add('show');
            setTimeout(() => burst.classList.remove('show'), 1200);
        }, delay);
    }

    function updateChallengeHud(state, key = 'game') {
        const totalQuestions = state.questions.length || 10;
        const progressPercent = (state.currentQuestion / totalQuestions) * 100;
        const progressFill = document.getElementById(`${key}ProgressFill`);
        const comboBadge = document.getElementById(`${key}ComboBadge`);
        const streakBadge = document.getElementById(`${key}StreakBadge`);
        const levelBadge = document.getElementById(`${key}LevelBadge`);

        if (progressFill) progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
        if (comboBadge) comboBadge.textContent = `Combo x${Math.max(1, state.combo)}`;
        if (streakBadge) streakBadge.textContent = `Racha ${state.currentStreak}`;
        if (levelBadge) {
            levelBadge.textContent = state.specialLevelUnlocked ? '⭐ Nivel especial' : `Nivel ${state.level}`;
        }
    }

    function registerAnswerOutcome(state, isCorrect, key = 'game') {
        const previousCombo = state.combo;
        const previousLevel = state.level;

        if (isCorrect) {
            state.currentStreak += 1;
            state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
            state.combo = Math.max(1, Math.min(5, 1 + Math.floor((state.currentStreak - 1) / 2)));
            state.level = Math.min(3, Math.max(1, Math.floor(state.correctAnswers / 3) + 1));
            state.specialLevelUnlocked = state.correctAnswers > 0 && state.correctAnswers % 3 === 0;
        } else {
            state.currentStreak = 0;
            state.combo = 1;
            state.specialLevelUnlocked = false;
            state.level = 1;
        }

        updateChallengeHud(state, key);
        window.AppStorage.saveSnapshot(key, state);

        if (isCorrect && state.combo !== previousCombo) {
            showComboBurst(`¡Poder x${state.combo}!`, key, 320);
        } else if (isCorrect) {
            showComboBurst('¡Combo!', key, 320);
        } else {
            showComboBurst('Racha 0', key, 320);
        }

        if (isCorrect && state.level !== previousLevel) {
            showComboBurst(`¡Nivel ${state.level} desbloqueado!`, key, 620);
        }
    }

    function showChallengeHelp(key, context = {}) {
        const content = context.title ? context : helpContent[key];
        if (!content) return;

        document.getElementById('feedbackIcon').textContent = '💡';
        document.getElementById('feedbackTitle').textContent = content.title;
        document.getElementById('feedbackMessage').innerHTML = MathDisplay.format(content.message);
        document.getElementById('feedbackExpression').innerHTML = MathDisplay.format(content.example);
        document.getElementById('feedbackExpression').style.display = 'block';
        document.getElementById('feedbackModal').querySelector('.feedback-btn').onclick = closeChallengeHelp;
        document.getElementById('feedbackModal').style.display = 'flex';
    }

    function closeChallengeHelp() {
        document.getElementById('feedbackModal').style.display = 'none';
    }

    window.ChallengeUI = Object.freeze({
        playClickSound,
        triggerConfetti,
        showComboBurst,
        updateChallengeHud,
        registerAnswerOutcome,
        showChallengeHelp,
        closeChallengeHelp
    });
})();