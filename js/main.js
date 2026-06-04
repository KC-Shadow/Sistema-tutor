/**
 * Configuración de Phaser para "La Taquilla de Pepe"
 */

// Sistema global de Text-To-Speech (TTS)
window.TTSManager = {
    currentAudio: null,
    useOpenAI: false, // ¡Cambia esto a TRUE y pon tu API_KEY si quieres usar OpenAI!
    openAIApiKey: 'TU_API_KEY_DE_OPENAI_AQUI',

    speak: async function(text, characterName, onEndCallback) {
        this.stop(); // Detener el audio actual

        // Opción 1: Usar OpenAI TTS (Requiere API Key válida)
        if (this.useOpenAI && this.openAIApiKey && this.openAIApiKey !== 'TU_API_KEY_DE_OPENAI_AQUI') {
            // Mapeo de voces de OpenAI
            // Diana es femenina ('nova'), los demás masculinos ('echo', 'onyx', 'fable', 'alloy')
            const voiceMap = {
                'Diana': 'nova',
                'Milo': 'echo',
                'Pepe': 'onyx',
                'Zandor': 'fable',
                'Dante': 'alloy',
                'ClienteGrave': 'onyx',
                'ClienteAgudo': 'alloy',
                'MrClaw': 'onyx'
            };
            const voice = voiceMap[characterName] || 'echo';

            try {
                const response = await fetch('https://api.openai.com/v1/audio/speech', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.openAIApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ model: 'tts-1', input: text, voice: voice })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    this.currentAudio = new Audio(url);
                    if (onEndCallback) this.currentAudio.onended = onEndCallback;
                    this.currentAudio.play();
                    return;
                }
            } catch (e) {
                console.error("Error con OpenAI TTS, usando voz del navegador en su lugar...", e);
            }
        }

        // Opción 2: Fallback o uso por defecto con SpeechSynthesis (Navegador)
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; 
            
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice = null;

            if (characterName === 'Diana') {
                // Buscar voz femenina 
                selectedVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Female') || v.name.includes('Mujer') || v.name.includes('Laura') || v.name.includes('Helena') || v.name.includes('Mia')));
                utterance.pitch = 1.2; 
            } else {
                // Buscar voz masculina
                selectedVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Male') || v.name.includes('Hombre') || v.name.includes('Pablo') || v.name.includes('Diego')));
                utterance.pitch = 0.9;
                if (characterName === 'ClienteAgudo') utterance.pitch = 1.4;
                if (characterName === 'ClienteGrave') utterance.pitch = 0.6;
                if (characterName === 'MrClaw') utterance.pitch = 0.3; // Voz notablemente más grave
            }

            if (selectedVoice) utterance.voice = selectedVoice;
            if (onEndCallback) utterance.onend = onEndCallback;

            this.currentAudio = utterance;
            window.speechSynthesis.speak(utterance);
        }
    },

    stop: function() {
        if (this.currentAudio instanceof Audio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        } else if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
};

// Cargar voces del navegador inmediatamente para evitar lag en la primera llamada
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

// Sistema global de tracking para métricas de RL y BKT
window.LearningAgent = {
    // Parámetros iniciales del BKT
    bkt: { pL0: 0.30, pT: 0.10, pS: 0.20, pG: 0.25 },
    // Parámetros iniciales del Reinforcement Learning
    rl: { alpha: 0.1, gamma: 0.9 },

    getKnowledgeState: function(userId, kc) {
        let state = JSON.parse(localStorage.getItem('bktState')) || {};
        if (!state[userId]) state[userId] = {};
        if (typeof state[userId][kc] === 'undefined') state[userId][kc] = this.bkt.pL0;
        return state[userId][kc];
    },

    updateBKT: function(userId, kc, isCorrect) {
        let pL_prev = this.getKnowledgeState(userId, kc);
        let pL_post;

        // Fórmulas de actualización BKT
        if (isCorrect) {
            let num = pL_prev * (1 - this.bkt.pS);
            let den = num + (1 - pL_prev) * this.bkt.pG;
            pL_post = num / den;
        } else {
            let num = pL_prev * this.bkt.pS;
            let den = num + (1 - pL_prev) * (1 - this.bkt.pG);
            pL_post = num / den;
        }

        // Paso de Transición
        let pL_next = pL_post + (1 - pL_post) * this.bkt.pT;

        let state = JSON.parse(localStorage.getItem('bktState')) || {};
        if (!state[userId]) state[userId] = {};
        state[userId][kc] = pL_next;
        localStorage.setItem('bktState', JSON.stringify(state));

        return { prev: pL_prev, next: pL_next };
    },

    getQValue: function(userId, kc, state, action) {
        let qTable = JSON.parse(localStorage.getItem('qTable')) || {};
        if (!qTable[userId]) qTable[userId] = {};
        if (!qTable[userId][kc]) qTable[userId][kc] = {};
        if (!qTable[userId][kc][state]) qTable[userId][kc][state] = {};
        if (typeof qTable[userId][kc][state][action] === 'undefined') qTable[userId][kc][state][action] = 0.0;
        return qTable[userId][kc][state][action];
    },

    updateRL: function(userId, kc, bktState, action, isCorrect, isTooEasy) {
        // Discretizar el estado de conocimiento (S) basado en la probabilidad de BKT
        let stateCategory = bktState < 0.4 ? 'Bajo' : (bktState < 0.75 ? 'Medio' : 'Alto');
        
        // Función de recompensa (R): +1 ZDP correcta, -1 Error, 0 Muy fácil
        let reward = isCorrect ? (isTooEasy ? 0 : 1) : -1;

        let qCurrent = this.getQValue(userId, kc, stateCategory, action);
        // Fórmula Q-Learning: Q(s,a) <- Q(s,a) + alpha * [r + gamma * maxQ(s',a') - Q(s,a)]
        // Simplificación: asumimos que para este paso de iteración maxQ(s') ~ 0 para aislar el KC
        let qNew = qCurrent + this.rl.alpha * (reward + (this.rl.gamma * 0) - qCurrent);

        let qTable = JSON.parse(localStorage.getItem('qTable')) || {};
        if (!qTable[userId]) qTable[userId] = {};
        if (!qTable[userId][kc]) qTable[userId][kc] = {};
        if (!qTable[userId][kc][stateCategory]) qTable[userId][kc][stateCategory] = {};
        qTable[userId][kc][stateCategory][action] = qNew;
        localStorage.setItem('qTable', JSON.stringify(qTable));

        return { prediction: stateCategory, reward: reward, qUpdate: qNew };
    },

    logInteraction: function(userId, gameId, kc, action, isCorrect, inputVal, responseTime) {
        let initialState = this.getKnowledgeState(userId, kc);
        
        // Heurística de "Muy fácil": Si responde correctamente en menos de 2.5 segundos
        let isTooEasy = (isCorrect && responseTime < 2.5);

        let rlResult = this.updateRL(userId, kc, initialState, action, isCorrect, isTooEasy);
        let bktResult = this.updateBKT(userId, kc, isCorrect);

        let logs = JSON.parse(localStorage.getItem('gameLogs')) || [];
        logs.push({
            userId, gameId, kc, 
            initialState: bktResult.prev, 
            tutorAction: action, 
            isCorrect, 
            input: inputVal, 
            responseTime: parseFloat(responseTime.toFixed(2)), 
            algoPrediction: rlResult.prediction, 
            reward: rlResult.reward, 
            qUpdate: rlResult.qUpdate, 
            bktParams: { pL0: bktResult.prev, pT: this.bkt.pT, pS: this.bkt.pS, pG: this.bkt.pG, pNext: bktResult.next },
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('gameLogs', JSON.stringify(logs));
    }
};

const config = {
    type: Phaser.CANVAS, 
    
    width: 800,
    height: 600,
    parent: 'game-container',
    
    backgroundColor: '#2c1a1a', 

    // Escalado responsivo: ajusta el canvas a la vista manteniendo la relación de aspecto
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },

    render: {
        pixelArt: true,      
        antialias: false,    
        roundPixels: true
    },

    scene: [
        MenuScene, 
        PerfilScene, 
        TaquillaScene, 
        DagasScene, 
        PoligonoScene, 
        MiloScene,
        MagoScene,
        DashboardScene
    ],

    // Física Arcade ligera
    physics: {
        default: 'arcade',
        arcade: {
            debug: false 
        }
    },

    fps: {
        target: 60,
        forceSetTimeOut: true
    }
};

// Inicialización del motor
const game = new Phaser.Game(config);

const style = document.createElement('style');
style.innerHTML = `
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: #2c1a1a; 
        overflow: hidden; 
    }
    #game-container {
        width: 100%;
        height: 100%;
        touch-action: none; 
    }
`;
document.head.appendChild(style);