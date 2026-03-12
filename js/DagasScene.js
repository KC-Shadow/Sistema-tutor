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

        // Audios Tutorial Dante
        for (let i = 1; i <= 5; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.audio(`audio_dante_${numStr}`, `assets/audios_tutor/audios_dante/audio_${numStr}.mp3`);
        }
    }

    init() {
        //  Variables de Estado del Juego
        this.puntuacion = 0;
        this.multiplicacionActual = { a: 0, b: 0, producto: 0 };
        this.rondaActiva = false; // Controla si los 10s de la ronda están corriendo
        this.juegoActivo = false;  // Controla si los 120s del juego están corriendo

        //Configuración de Tiempos 
        this.tiempoTotalJuego = 120; 
        this.tiempoRestanteJuego = this.tiempoTotalJuego;
        this.tiempoLimiteRonda = 10;  

        // Referencias a Objetos
        this.globosGroup = null; // Grupo de físicas para gestionar colisiones
        this.temporizadorJuego = null;
        this.temporizadorRonda = null;
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
        this.txtMultiplicacion = this.add.text(200, 370, '', { 
            fontFamily: 'Courier New', fontSize: '26px', fill: 'rgb(0, 0, 0)', fontStyle: 'bold', align: 'center', wordWrap: { width: 180 } }).setOrigin(0.5);
        this.txtMultiplicacion.setVisible(false);

        // Texto para el Tutorial
        this.txtTutorial = this.add.text(200, 370, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', align: 'center', wordWrap: { width: 180 } 
        }).setOrigin(0.5).setVisible(false);

        // Temporizador Global
        this.txtTiempoJuego = this.add.text(680, 90, 'Tiempo: 120s', { fontFamily: 'Playbill', fontSize: '50px', fill: '#000000' }).setOrigin(0.5).setAngle(-9);
        
        // Temporizador de Ronda
        this.txtTiempoRonda = this.add.text(680, 125, 'Ronda: 10s', { fontFamily: 'Playbill', fontSize: '44px', fill: '#000000'}).setOrigin(0.5).setAngle(-9);

        // Marcador de Puntuación
        this.txtPuntuacion = this.add.text(680, 160, 'Puntos: 0', { fontFamily: 'Playbill', fontSize: '48px', fill: '#000000' }).setOrigin(0.5).setAngle(-9);

        // Botón para volver al menú principal (esquina inferior derecha)
        this.btnVolver = this.add.text(780, 580, 'Volver', { fontFamily: 'Courier New', fontSize: '18px', fill: '#fff', backgroundColor: '#3d2622', padding: { x: 10, y: 5 } }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
        this.btnVolver.on('pointerdown', () => {
            this.pararTodosLosTemporizadores();
            this.sound.stopAll();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            this.scene.start('MenuScene'); // Detiene DanteScene y vuelve al menú
        });

        this.iniciarTutorial();
    }

    iniciarTutorial() {
        this.dialogo.setVisible(true);
        this.txtTutorial.setVisible(true);

        // Asegurar volumen bajo durante el tutorial
        if (this.musica) this.musica.setVolume(0.1);

        const frases = [
            "¡Hola! Soy Dante. Bienvenido al reto de 'Dagas en el Aire'.",
            "Tu objetivo es reventar el globo que tenga la respuesta correcta.",
            "Yo te mostraré una multiplicación, ¡calcula rápido!",
            "Haz clic en el globo correcto para lanzar una daga.",
            "Tienes 120 segundos para conseguir la mayor puntuación posible."
        ];

        let paso = 0;
        this.txtTutorial.setText(frases[paso]);
        
        // Reproducir primer audio
        let numStr = (paso + 1).toString().padStart(3, '0');
        this.audioTutorial = this.sound.add(`audio_dante_${numStr}`);
        this.audioTutorial.play();

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
            if (this.audioTutorial) this.audioTutorial.stop();
            
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
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            if (this.audioTutorial) this.audioTutorial.stop();
            paso++;
            if (paso < frases.length) {
                this.txtTutorial.setText(frases[paso]);
                let numStr = (paso + 1).toString().padStart(3, '0');
                this.audioTutorial = this.sound.add(`audio_dante_${numStr}`);
                this.audioTutorial.play();
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

        // Lógica de Temporizadores 
        this.temporizadorJuego = this.time.addEvent({
            delay: 1000,
            callback: this.actualizarTiempoJuego,
            callbackScope: this,
            loop: true
        });

        // Iniciar la primera ronda de multiplicación automáticamente
        this.iniciarNuevaRonda();
    }

    update() {
        // Actualizar el temporizador visual de la ronda (10s) si está corriendo
        if (this.rondaActiva && this.temporizadorRonda) {
            let tiempoRestanteRonda = Math.ceil(this.temporizadorRonda.getRemainingSeconds());
            this.txtTiempoRonda.setText(`Ronda: ${tiempoRestanteRonda}s`);
            
            // Efecto visual: parpadear en rojo si queda poco tiempo
            if (tiempoRestanteRonda <= 3) {
                this.txtTiempoRonda.setAlpha(this.time.now % 500 < 250 ? 0.5 : 1);
            } else {
                this.txtTiempoRonda.setAlpha(1);
            }
        }
    }

    actualizarTiempoJuego() {
        if (!this.juegoActivo) return;

        this.tiempoRestanteJuego--;
        this.txtTiempoJuego.setText(`Tiempo: ${this.tiempoRestanteJuego}s`);

        // Alerta visual de poco tiempo global
        if (this.tiempoRestanteJuego <= 10) {
            this.txtTiempoJuego.setColor('#f00');
        }

        if (this.tiempoRestanteJuego <= 0) {
            this.finDelJuego();
        }
    }

    iniciarNuevaRonda() {
        if (!this.juegoActivo || this.rondaActiva) return; // Evitar iniciar si el juego acabó
        this.rondaActiva = true;

        // Restablecer estilos de UI de ronda
        this.txtTiempoRonda.setColor('#f00');
        this.txtTiempoRonda.setAlpha(1);

        // Limpiar ronda anterior (eliminar globos existentes)
        this.globosGroup.clear(true, true);

        // Generar una nueva multiplicación (tablas del 1 al 10)
        this.multiplicacionActual.a = Phaser.Math.Between(1, 10);
        this.multiplicacionActual.b = Phaser.Math.Between(0, 10);
        this.multiplicacionActual.producto = this.multiplicacionActual.a * this.multiplicacionActual.b;

        // Dante indica la multiplicación en su nube
        this.dialogo.setVisible(true);
        this.txtMultiplicacion.setText(`${this.multiplicacionActual.a} x ${this.multiplicacionActual.b} = ?`);
        this.txtMultiplicacion.setVisible(true);

        // Reproducir la multiplicación en audio
        if (window.speechSynthesis) {
            if (this.musica) this.musica.setVolume(0.1); // Bajar volumen al hablar
            window.speechSynthesis.cancel();
            const texto = `¿Cuánto es ${this.multiplicacionActual.a} por ${this.multiplicacionActual.b}?`;
            this.voz = new SpeechSynthesisUtterance(texto);
            this.voz.lang = 'es-ES';
            this.voz.onend = () => {
                if (this.musica && this.juegoActivo) this.musica.setVolume(0.5); // Restaurar al terminar
            };
            window.speechSynthesis.speak(this.voz);
        }

        // Crear un grupo de globos sobre la diana (uno correcto, varios incorrectos)
        this.crearGlobos();

        this.temporizadorRonda = this.time.delayedCall(this.tiempoLimiteRonda * 1000, this.finDeTiempoRonda, [], this);
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
                valorGlobo = this.multiplicacionActual.producto; // Globo con el valor correcto
            } else {
                // Generar un valor incorrecto aleatorio que no sea el producto real
                do {
                    valorGlobo = Phaser.Math.Between(0, valorMaximoGloboIncorrecto);
                } while (valorGlobo === this.multiplicacionActual.producto);
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

        // Ocultar la multiplicación temporalmente durante el lanzamiento
        this.txtMultiplicacion.setVisible(false);
        this.dialogo.setVisible(false);
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel(); // Detener voz al actuar
            if (this.musica) this.musica.setVolume(0.5); // Restaurar música si se interrumpió la voz
        }

        // Crear la daga visualmente desde la posición de Dante
        let daga = this.physics.add.sprite(this.dante.x + 60, this.dante.y - 20, 'daga_001').setScale(0.5);
        daga.setAngularVelocity(800); 

        // Mover la daga hacia el globo objetivo con físicas
        this.physics.moveToObject(daga, globoObjetivo, 700); // Velocidad 700

        // Configurar colisión (overlap) entre la daga y el globo
        this.physics.add.overlap(daga, globoObjetivo, () => {
            this.verificarAcierto(globoObjetivo);
            daga.destroy(); // La daga desaparece al impactar
        });
    }

    verificarAcierto(globoImpactado) {
        if (!this.juegoActivo || !this.rondaActiva) return;
        this.rondaActiva = false; // Detener la lógica de la ronda inmediatamente

        // Detener el temporizador de 10s de la ronda
        if (this.temporizadorRonda) this.temporizadorRonda.remove();

        // Recuperar el valor oculto del globo impactado
        let valorGlobo = globoImpactado.getData('valor');

        if (valorGlobo === this.multiplicacionActual.producto) { 
            this.puntuacion += 10; // Sumar puntos por acierto
            this.txtPuntuacion.setText(`Puntos: ${this.puntuacion}`);
            this.txtTiempoRonda.setText('¡CORRECTO!');
            this.txtTiempoRonda.setColor('#0f0'); // Verde brillante (Coherente con Pepe)

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

            // Esperar 1.5 segundos mostrando el acierto y pasar a la siguiente multiplicación
            this.time.delayedCall(1500, this.prepararSiguienteRonda, [], this);
        } else {
            // --- FALLO (Globo Incorrecto) ---
            this.txtTiempoRonda.setText('¡INCORRECTO!');
            this.txtTiempoRonda.setColor('#f00'); // Rojo

            // Efecto visual: El globo se oscurece y la cámara vibra
            globoImpactado.setTint(0x444444); 
            this.cameras.main.shake(200, 0.01); // Agitar cámara suave

            // Esperar 2 segundos y reiniciar el MISMO nivel de multiplicación
            this.time.delayedCall(2000, this.prepararMismoNivel, [], this);
        }
    }

    finDeTiempoRonda() {
        if (!this.juegoActivo || !this.rondaActiva) return;
        this.rondaActiva = false; // Detener la ronda por tiempo agotado

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            if (this.musica) this.musica.setVolume(0.5);
        }

        this.txtTiempoRonda.setText('¡TIEMPO AGOTADO!');
        this.txtTiempoRonda.setColor('#f00'); // Rojo
        this.cameras.main.shake(400, 0.02); // Agitar cámara más fuerte

        // Ocultar la multiplicación
        this.txtMultiplicacion.setVisible(false);
        this.dialogo.setVisible(false);

        // Efecto visual: Oscurecer todos los globos como inactivos
        this.globosGroup.getChildren().forEach(globo => globo.setTint(0x444444));

        // Esperar 2.5 segundos y reiniciar el MISMO nivel
        this.time.delayedCall(2500, this.prepararMismoNivel, [], this);
    }

    prepararSiguienteRonda() {
        if (!this.juegoActivo) return;
        // Ocultar UI de ronda anterior
        this.txtTiempoRonda.setText('Ronda: 10s');
        this.txtTiempoRonda.setColor('#f00');
        
        // Iniciar nueva ronda con nueva multiplicación
        this.iniciarNuevaRonda();
    }

    prepararMismoNivel() {
        if (!this.juegoActivo) return;
        // Ocultar UI de ronda anterior
        this.txtTiempoRonda.setText('Ronda: 10s');
        this.txtTiempoRonda.setColor('#f00');
        
        // Limpiar y recrear globos para reiniciar el estado visual
        this.globosGroup.clear(true, true);
        this.crearGlobos();

        // Volver a mostrar globos y temporizador para la MISMA multiplicación
        this.rondaActiva = true;
        this.dialogo.setVisible(true);
        this.txtMultiplicacion.setVisible(true);

        // Repetir audio de la multiplicación al reiniciar
        if (window.speechSynthesis) {
            if (this.musica) this.musica.setVolume(0.1);
            window.speechSynthesis.cancel();
            const texto = `¿Cuánto es ${this.multiplicacionActual.a} por ${this.multiplicacionActual.b}?`;
            this.voz = new SpeechSynthesisUtterance(texto);
            this.voz.lang = 'es-ES';
            this.voz.onend = () => {
                if (this.musica && this.juegoActivo) this.musica.setVolume(0.5);
            };
            window.speechSynthesis.speak(this.voz);
        }

        // Reiniciar el temporizador de 10s
        this.temporizadorRonda = this.time.delayedCall(this.tiempoLimiteRonda * 1000, this.finDeTiempoRonda, [], this);
    }

    finDelJuego() {
        this.juegoActivo = false;
        this.pararTodosLosTemporizadores();
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        // Ocultar elementos de juego
        this.dialogo.setVisible(false);
        this.txtMultiplicacion.setVisible(false);
        this.globosGroup.clear(true, true);
        this.txtTiempoRonda.setVisible(false);

        // PANTALLA DE RESULTADOS 
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setOrigin(0.5);

        this.add.text(400, 250, '¡FIN DEL JUEGO!', { fontFamily: 'Courier New', fontSize: '56px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 350, `Puntuación Final: ${this.puntuacion}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#d4a373' }).setOrigin(0.5);

        // Reemplazar el botón Volver existente por uno de resultados
        this.btnVolver.setVisible(false);
        this.btnFinJuego = this.add.text(400, 480, 'Volver al Menú', { fontFamily: 'Courier New', fontSize: '24px', fill: '#fff', backgroundColor: '#3d2622', padding: 10 }).setInteractive({ useHandCursor: true });
        this.btnFinJuego.on('pointerdown', () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            this.scene.start('MenuScene');
        });
    }

    pararTodosLosTemporizadores() {
        if (this.temporizadorJuego) this.temporizadorJuego.remove();
        if (this.temporizadorRonda) this.temporizadorRonda.remove();
    }
}