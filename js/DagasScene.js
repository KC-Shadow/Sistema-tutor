class DagasScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DagasScene' }); // Clave única para esta escena en main.js
    }

    preload() {
        
        // Personajes
        this.load.image('dante', 'assets/personajes_principales/dante.png');

        //Diálogo
        this.load.image('dialogo', 'assets/extra/dialogo.png');

        // UI
        this.load.image('diana', 'assets/dagas/ui/diana.png');
        this.load.image('fondo_dagas', 'assets/dagas/ui/fondo_dagas.jpg ');
        this.load.image('impacto', 'assets/extra/impacto.png');
        
        // Cartelera
        this.load.image('cartelera', 'assets/extra/cartelera.png');

        // Globos
        for (let i = 0; i <= 100; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image(`globo_${numStr}`, `assets/dagas/globos/g_${numStr}.png`);
        }

        // Dagas 
        for (let i = 0; i <= 10; i++) {
            let numStr = i.toString().padStart(3, '0'); // Formato: 000, 001...
            this.load.image(`daga_${numStr}`, `assets/dagas/dagas/d_${numStr}.png`);
        }

        // Cuenta Regresiva
        this.load.image('go', 'assets/extra/n_004.png');
        this.load.image('n_003', 'assets/extra/n_003.png');
        this.load.image('n_002', 'assets/extra/n_002.png');
        this.load.image('n_001', 'assets/extra/n_001.png');
        this.load.audio('cuenta_regresiva', 'assets/music/cuenta_regresiva.mp3');
        this.load.audio('musica_dagas', 'assets/music/circus_game2.mp3');

        // Sonidos de los globos y resultados
        this.load.audio('boom', 'assets/music/globo_boom.mp3');
        this.load.audio('ganar', 'assets/music/win.mp3');
        this.load.audio('error', 'assets/music/error.mp3');
    }

    init() {
        //  Variables de Estado del Juego
        this.puntuacion = 0;
        this.operacionActual = { a: 0, b: 0, resultado: 0, signo: '' };
        this.rondaActiva = false; // Controla si los 10s de la ronda están corriendo
        this.juegoActivo = false;  // Controla si los 120s del juego están corriendo

        this.preguntasRealizadas = 0;
        this.maxPreguntas = 24;
        
        // 24 rondas en total: 6 ciclos de Suma(0), Resta(1), Multiplicación(2), División(3)
        this.operacionesPendientes = [
            0, 1, 2, 3, 
            0, 1, 2, 3,
            0, 1, 2, 3, 
            0, 1, 2, 3, 
            0, 1, 2, 3, 
            0, 1, 2, 3 
        ];

        this.globosGroup = null; // Grupo de físicas para gestionar colisiones
    }

    create() {
        this.juegoActivo = false;

        this.add.image(400, 300, 'fondo_dagas').setDisplaySize(800, 600);

        // Musica de fondo (Volumen bajo inicial por el tutorial)
        this.musica = this.sound.add('musica_dagas', { loop: true, volume: 0.1 });
        this.musica.play();

        // Entorno Visual
        this.diana = this.add.image(400, 300, 'diana').setScale(0.8);
        this.cartelera = this.add.image(680, 100, 'cartelera').setScale(0.50);

        // Dante y su Diálogo
        this.dante = this.add.image(100, 500, 'dante').setScale(0.7);
        this.dialogo = this.add.image(200, 390, 'dialogo').setScale(0.75).setVisible(false);

        // Grupo de Globos
        this.globosGroup = this.physics.add.group();

        // UI 
        this.txtOperacion = this.add.text(200, 380, '', { 
            fontFamily: 'Courier New', fontSize: '26px', fill: 'rgb(0, 0, 0)', fontStyle: 'bold', align: 'center', wordWrap: { width: 180 } }).setOrigin(0.5);
        this.txtOperacion.setVisible(false);

        // Texto para el Tutorial
        this.txtTutorial = this.add.text(200, 380, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', align: 'center', wordWrap: { width: 180 } 
        }).setOrigin(0.5).setVisible(false);

        // Rondas
        this.txtRondas = this.add.text(680, 90, 'RONDAS: 0/32', { fontFamily: 'Playbill', fontSize: '46px', fill: '#000000' }).setOrigin(0.5).setAngle(-9);
        
        // Mensajes de Ronda
        this.txtMensaje = this.add.text(680, 125, '', { fontFamily: 'Playbill', fontSize: '44px', fill: '#000000'}).setOrigin(0.5).setAngle(-9);

        // Marcador de Puntuación
        this.txtPuntuacion = this.add.text(680, 160, 'Puntos: 0', { fontFamily: 'Playbill', fontSize: '48px', fill: '#000000' }).setOrigin(0.5).setAngle(-9);

        // Botón para volver al menú principal (esquina inferior derecha)
        this.btnVolver = this.add.text(780, 580, 'Volver', { fontFamily: 'Courier New', fontSize: '18px', fill: '#fff', backgroundColor: '#3d2622', padding: { x: 10, y: 5 } }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
        this.btnVolver.on('pointerdown', () => {
            this.sound.stopAll();
            window.TTSManager.stop();
            this.scene.start('MenuScene'); // Detiene DanteScene y vuelve al menú
        });

        this.iniciarTutorial();
    }

    opacarJuego(opacar) {
        let alpha = opacar ? 0.3 : 1;
        if (this.diana) this.diana.setAlpha(alpha);
        if (this.cartelera) this.cartelera.setAlpha(alpha);
        if (this.txtRondas) this.txtRondas.setAlpha(alpha);
        if (this.txtMensaje) this.txtMensaje.setAlpha(alpha);
        if (this.txtPuntuacion) this.txtPuntuacion.setAlpha(alpha);
        if (this.btnVolver) this.btnVolver.setAlpha(alpha);
    }

    iniciarTutorial() {
        this.opacarJuego(true);
        this.dialogo.setVisible(true);
        this.txtTutorial.setVisible(true);

        // Asegurar volumen bajo durante el tutorial
        if (this.musica) this.musica.setVolume(0.1);

        const frases = [
            "¡Hola! Soy Dante. Bienvenido al reto de 'Dagas en el Aire'.",
            "Tu objetivo es reventar el globo que tenga la respuesta correcta.",
            "Yo te mostraré una operación matemática, ¡calcula rápido!",
            "Haz clic en el globo correcto para lanzar una daga.",
            "Tendrás 32 rondas para conseguir la mayor puntuación posible."
        ];

        let paso = 0;
        this.txtTutorial.setText(frases[paso]);
        
        window.TTSManager.speak(frases[paso], 'Dante');

        // Animación de hablar
        const darBrinco = () => {
            this.dante.y = 500;
            this.tweenDante = this.tweens.add({
                targets: this.dante,
                y: 490,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        // Botón Saltar
        const btnSaltar = this.add.text(400, 550, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '20px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const finalizarTutorial = () => {
            window.TTSManager.stop();
            
            // Restaurar volumen de la música al finalizar tutorial
            if (this.musica) this.musica.setVolume(0.5);

            // Detener animación de hablar
            if (this.tweenDante) {
                this.tweenDante.stop();
                this.dante.y = 500;
            }
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            this.txtTutorial.setVisible(false);
            this.dialogo.setVisible(false); 
            this.opacarJuego(false);
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            window.TTSManager.stop();
            paso++;
            if (paso < frases.length) {
                this.txtTutorial.setText(frases[paso]);
                window.TTSManager.speak(frases[paso], 'Dante');
                darBrinco();
            } else {
                finalizarTutorial();
            }
        };

        btnSaltar.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            finalizarTutorial();
        });

        this.input.on('pointerdown', avanzar);
    }

    iniciarCuentaRegresiva() {
        this.sound.play('cuenta_regresiva');
        let nums = ['n_003', 'n_002', 'n_001', 'go'];
        nums.forEach((n, i) => {
            this.time.delayedCall(i * 1000, () => {
                let img = this.add.image(400, 300, n).setScale(0.8);
                this.tweens.add({ targets: img, alpha: 0, duration: 800, onComplete: () => img.destroy() });
                if(n === 'go') {
                    this.comenzarJuego();
                }
            });
        });
    }

    comenzarJuego() {
        this.juegoActivo = true;

        // Iniciar la primera ronda de operación automáticamente
        this.iniciarNuevaRonda();
    }

    update() {
    }

    iniciarNuevaRonda() {
        if (!this.juegoActivo || this.rondaActiva) return; // Evitar iniciar si el juego acabó
        
        if (this.preguntasRealizadas >= this.maxPreguntas) {
            this.finDelJuego();
            return;
        }
        
        this.rondaActiva = true;
        this.preguntasRealizadas++;
        
        this.txtRondas.setText(`RONDAS: ${this.preguntasRealizadas}/${this.maxPreguntas}`);
        this.txtMensaje.setText('');

        // Limpiar ronda anterior (eliminar globos existentes)
        this.globosGroup.clear(true, true);

        // Obtener la siguiente operación en orden secuencial
        const tipoOperacion = this.operacionesPendientes.shift();
        let a, b, resultado, signo, textoVoz;

        switch (tipoOperacion) {
            case 0: // Suma
                a = Phaser.Math.Between(0, 100);
                b = Phaser.Math.Between(0, 100 - a); // El total no pasará de 100
                resultado = a + b;
                signo = '+';
                textoVoz = `¿Cuánto es ${a} más ${b}?`;
                break;
            case 1: // Resta
                a = Phaser.Math.Between(0, 100);
                b = Phaser.Math.Between(0, a); // Para que no dé negativo
                resultado = a - b;
                signo = '-';
                textoVoz = `¿Cuánto es ${a} menos ${b}?`;
                break;
            case 2: // Multiplicación
                a = Phaser.Math.Between(0, 10);
                b = Phaser.Math.Between(0, 10); // Resultados de 0 a 100
                resultado = a * b;
                signo = 'x';
                textoVoz = `¿Cuánto es ${a} por ${b}?`;
                break;
            case 3: // División
                b = Phaser.Math.Between(1, 10);
                resultado = Phaser.Math.Between(0, 10);
                a = b * resultado; // Así el resultado es entero exacto
                signo = '÷';
                textoVoz = `¿Cuánto es ${a} entre ${b}?`;
                break;
        }

        this.operacionActual = { a, b, resultado, signo };

        // Dante indica la operación en su nube
        this.dialogo.setVisible(true);
        this.txtOperacion.setText(`${a} ${signo} ${b} = ?`);
        this.txtOperacion.setVisible(true);

        // Reproducir la operación en audio
        if (this.musica) this.musica.setVolume(0.1); 
        window.TTSManager.speak(textoVoz, 'Dante', () => {
            if (this.musica && this.juegoActivo) this.musica.setVolume(0.5); // Restaurar música
        });

        this.rondaStartTime = this.time.now;
        // Crear un grupo de globos sobre la diana (uno correcto, varios incorrectos)
        this.crearGlobos();
    }

    crearGlobos() {
        const numGlobos = 5;
        const indiceCorrecto = Phaser.Math.Between(0, numGlobos - 1);
        const valorMaximoGloboIncorrecto = 100;

        // Lista para almacenar las posiciones de los globos creados
        const posiciones = [];
        // Distancia mínima entre centros de globos para evitar superposición (ajustado a escala 0.3)
        const distanciaMinima = 60;

        for (let i = 0; i < numGlobos; i++) {
            let valorGlobo;
            if (i === indiceCorrecto) {
                valorGlobo = this.operacionActual.resultado; // Globo con el valor correcto
            } else {
                // Generar un valor incorrecto aleatorio que no sea el resultado real
                do {
                    valorGlobo = Phaser.Math.Between(0, valorMaximoGloboIncorrecto);
                } while (valorGlobo === this.operacionActual.resultado);
            }

            // Convertir el valor a formato g_000 para cargar la imagen correcta
            let numStr = valorGlobo.toString().padStart(3, '0');
            
            // Posicionar los globos aleatoriamente sobre la diana (centro 400, 300) evitando superposición
            let x, y;
            let posicionValida = false;
            let intentos = 0;

            while (!posicionValida && intentos < 50) {
                let angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
                let radio = Phaser.Math.Between(40, 120); // Distribución radial, ajustado para no salirse de la diana
                x = 400 + Math.cos(angulo) * radio;
                y = 300 + Math.sin(angulo) * radio;

                let colision = false;
                for (let pos of posiciones) {
                    if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < distanciaMinima) {
                        colision = true;
                        break;
                    }
                }
                if (!colision) posicionValida = true;
                intentos++;
            }
            posiciones.push({ x, y });

            // Crear el globo como un sprite de físicas
            let globo = this.globosGroup.create(x, y, `globo_${numStr}`).setScale(0.3);
            
            // === IMPORTANTE: Guardar el valor real oculto en los datos del sprite ===
            globo.setData('valor', valorGlobo); 
            
            globo.setInteractive({ useHandCursor: true });
            
            // Definir la interacción: Al hacer clic en un globo, Dante lanza una daga
            globo.on('pointerdown', () => {
                this.lanzarDaga(globo);
            });
        }
    }

    lanzarDaga(globoObjetivo) {
        if (!this.juegoActivo || !this.rondaActiva) return; // No lanzar si el tiempo acabó o la ronda paró

        // Ocultar la operación temporalmente durante el lanzamiento
        this.txtOperacion.setVisible(false);
        this.dialogo.setVisible(false);
        window.TTSManager.stop();
        if (this.musica) this.musica.setVolume(0.5);

        // Crear la daga visualmente desde la posición de Dante
        let daga = this.add.sprite(this.dante.x + 60, this.dante.y - 20, 'daga_001').setScale(0.5);
        
        // Animación de giro manual para acompañar el trayecto
        this.tweens.add({ targets: daga, angle: 360, duration: 200, repeat: -1 });

        // Usar un Tween en lugar de físicas para garantizar el impacto al 100%
        this.tweens.add({
            targets: daga,
            x: globoObjetivo.x,
            y: globoObjetivo.y,
            duration: 250, // Tiempo de vuelo rápido
            onComplete: () => {
                this.verificarAcierto(globoObjetivo);
                daga.destroy();
            }
        });
    }

    verificarAcierto(globoImpactado) {
        if (!this.juegoActivo || !this.rondaActiva) return;
        this.rondaActiva = false; // Detener la lógica de la ronda inmediatamente

        // Recuperar el valor oculto del globo impactado
        let valorGlobo = globoImpactado.getData('valor');
        let esCorrecto = (valorGlobo === this.operacionActual.resultado);
        let timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        // Determinar qué KC mapear en base a la operación
        let mapKC = { '+': 'Suma', '-': 'Resta', 'x': 'Multiplicación', '÷': 'División' };
        let kcActual = mapKC[this.operacionActual.signo];

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'DagasScene', kcActual, 'Dificultad_Adaptativa', 
                esCorrecto, valorGlobo, timeElapsed,
                `${this.operacionActual.a} ${this.operacionActual.signo} ${this.operacionActual.b}`, this.operacionActual.resultado
            );
        }

        if (esCorrecto) { 
            this.sound.play('ganar');
            this.sound.play('boom');
            this.puntuacion += 10; // Sumar puntos por acierto
            this.txtPuntuacion.setText(`Puntos: ${this.puntuacion}`);
            this.txtMensaje.setText('¡CORRECTO!');
            this.txtMensaje.setColor('#0f0'); // Verde brillante (Coherente con Pepe)

            // Guardar posición del globo antes de destruirlo
            const x = globoImpactado.x;
            const y = globoImpactado.y;

            // Efecto visual: Reventar el globo (puedes añadir partículas aquí)
            globoImpactado.destroy();

            // Mostrar imagen de impacto y desvanecerla
            const imgImpacto = this.add.image(x, y, 'impacto').setScale(0.3);
            this.tweens.add({
                targets: imgImpacto,
                alpha: 0,
                duration: 500,
                onComplete: () => imgImpacto.destroy()
            });

            // Esperar 1.5 segundos mostrando el acierto y pasar a la siguiente operación
            this.time.delayedCall(1500, this.prepararSiguienteRonda, [], this);
        } else {
            // --- FALLO (Globo Incorrecto) ---
            this.sound.play('error');
            this.txtMensaje.setText('¡INCORRECTO!');
            this.txtMensaje.setColor('#f00'); // Rojo

            // Efecto visual: El globo se oscurece y la cámara vibra
            globoImpactado.setTint(0x444444); 
            this.cameras.main.shake(200, 0.01); // Agitar cámara suave

            // Esperar 2 segundos y avanzar a la SIGUIENTE ronda de operación
            this.time.delayedCall(2000, this.prepararSiguienteRonda, [], this);
        }
    }

    prepararSiguienteRonda() {
        if (!this.juegoActivo) return;
        // Ocultar UI de ronda anterior
        this.txtMensaje.setText('');
        
        // Iniciar nueva ronda con nueva operación
        this.iniciarNuevaRonda();
    }

    finDelJuego() {
        this.juegoActivo = false;
        window.TTSManager.stop();

        // Ocultar elementos de juego
        this.dialogo.setVisible(false);
        this.txtOperacion.setVisible(false);
        this.globosGroup.clear(true, true);
        this.txtMensaje.setVisible(false);
        this.txtRondas.setVisible(false);

        // Pantalla de fin de juego
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(400, 250, '¡FIN DEL JUEGO!', { fontFamily: 'Courier New', fontSize: '56px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 350, `Puntuación Final: ${this.puntuacion}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#d4a373' }).setOrigin(0.5);

        this.btnVolver.setVisible(false);
        
        const btnVolverMenu = this.add.text(400, 480, 'Volver al Menú', { 
            fontFamily: 'Courier New', fontSize: '24px', fill: '#fff', backgroundColor: '#3d2622', padding: 10 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnVolverMenu.on('pointerdown', () => {
            this.sound.stopAll();
            window.TTSManager.stop();
            this.scene.start('MenuScene');
        });
    }
}