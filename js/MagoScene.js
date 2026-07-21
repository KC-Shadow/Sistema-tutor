class MagoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MagoScene' });
    }

    init() {
        this.puntuacion = 0;
        this.rondaActual = 0;
        this.maxRondas = 6;
        this.multiplicacionActual = { a: 0, b: 0, producto: 0 };
        this.rondaActiva = false;
        this.sombrerosGroup = null;
    }

    preload() {
        // Personajes
        this.load.image('zandor', 'assets/personajes_principales/Zandor.png');
        
        // Elementos 
        this.load.image('nube_z', 'assets/extra/dialogo.png');
        this.load.image('cartelera_z', 'assets/extra/cartelera.png');

        // UI
        this.load.image('fondo_zandor', 'assets/mago/ui/fondo.png');
        this.load.image('taburete', 'assets/mago/ui/taburete.png');
        this.load.image('conejo_sombrero', 'assets/mago/ui/conejo_sombrero.png');
        
        // Sombreros secuenciales (s_000 a s_100)
        for (let i = 0; i <= 100; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image(`s_${numStr}`, `assets/mago/sombreros/s_${numStr}.png`);
        }

        // Audios (Reutilizando sistema de cuenta regresiva)
        this.load.audio('cuenta_regresiva', 'assets/music/cuenta_regresiva.mp3');
        this.load.audio('ganar', 'assets/music/win.mp3');
        this.load.audio('error', 'assets/music/error.mp3');
        this.load.audio('aplausos', 'assets/music/aplausos.mp3');

        // Imágenes del tutorial de multiplicar
        for (let i = 1; i <= 8; i++) {
            this.load.image(`multiplicar${i}`, `assets/tutoria/multiplicar/multiplicar${i}.png`);
        }

        // Audios de tutor (Zandor)
        for (let i = 1; i <= 4; i++) {
            this.load.audio(`zandor_audio_00${i}`, `assets/audios_tutor/zandor_audios/bienvenida/audio_00${i}.wav`);
        }
        for (let i = 1; i <= 10; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.audio(`tutoria_multiplicar_${numStr}`, `assets/audios_tutor/zandor_audios/tutoria_multiplicar/tutoria_multiplicar_${numStr}.wav`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`zandor_ap_00${i}`, `assets/audios_tutor/zandor_audios/afirmaciones/positivas/ap_00${i}.wav`);
            this.load.audio(`zandor_an_00${i}`, `assets/audios_tutor/zandor_audios/afirmaciones/negativas/an_00${i}.wav`);
        }
    }

    create() {
        // Escenario
        this.fondo = this.add.image(400, 250, 'fondo_zandor').setScale(0.39);
        this.cartelera_z = this.add.image(690, 90, 'cartelera_z').setScale(0.4);
        
        // Taburetes (Estáticos)
        this.taburete1 = this.add.image(280, 298, 'taburete').setScale(0.3375);
        this.taburete2 = this.add.image(400, 298, 'taburete').setScale(0.3375);
        this.taburete3 = this.add.image(520, 298, 'taburete').setScale(0.3375);

        // Zandor y Diálogo
        this.zandor = this.add.image(100, 550, 'zandor').setScale(0.5);
        this.nube = this.add.image(200, 420, 'nube_z').setScale(0.8).setVisible(false).setDisplaySize(300, 150);
        this.txtPregunta = this.add.text(200, 400, '', { 
            fontFamily: 'Courier New', fontSize: '15px', fill: '#000', align: 'center', wordWrap: { width: 240 } 
        }).setOrigin(0.5).setVisible(false);

        // Grupo de Sombreros e Interfaz
        this.sombrerosGroup = this.add.group();
        this.txtRondas = this.add.text(680, 90, 'RONDAS: 1/6', { fontFamily: 'Playbill', fontSize: '36px', fill: '#000' }).setOrigin(0.5).setAngle(-9);
        this.txtPuntos = this.add.text(680, 130, 'PUNTOS: 0', { fontFamily: 'Playbill', fontSize: '40px', fill: '#000' }).setOrigin(0.5).setAngle(-9);

        this.iniciarTutorialMultiplicacion();
    }

    // Función de apoyo para reproducir audios de forma segura
    reproducirAudioTutor(llaveAudio) {
        if (this.audioTutor) {
            this.audioTutor.stop();
            this.audioTutor.destroy(); // Libera la memoria del audio anterior
        }
        if (this.cache.audio.exists(llaveAudio)) {
            this.audioTutor = this.sound.add(llaveAudio, { volume: 1 });
            this.audioTutor.play();
        } else {
            console.error(`🚨 ERROR: No se encontró o no se pudo cargar el audio '${llaveAudio}'. Revisa la ruta, el formato y la consola de red.`);
        }
    }

    opacarJuego(opacar) {
        let alpha = 1; // Se mantiene siempre visible
        if (this.fondo) this.fondo.setAlpha(alpha);
        if (this.cartelera_z) this.cartelera_z.setAlpha(alpha);
        if (this.txtRondas) this.txtRondas.setAlpha(alpha);
        if (this.txtPuntos) this.txtPuntos.setAlpha(alpha);
        if (this.taburete1) this.taburete1.setAlpha(alpha);
        if (this.taburete2) this.taburete2.setAlpha(alpha);
        if (this.taburete3) this.taburete3.setAlpha(alpha);
    }

    iniciarTutorialMultiplicacion() {
        this.opacarJuego(true);
        this.nube.setVisible(true);
        this.txtPregunta.setVisible(true);

        const tutorialMult = [
            { imagen: 'multiplicar1', texto: "¡Bienvenidos a mi espectáculo! Soy el Mago Zandor. Hoy les revelaré el truco más grande de las matemáticas: ¡la multiplicación!", audio: 'tutoria_multiplicar_001' },
            { imagen: 'multiplicar2', texto: "El gran secreto es que multiplicar es lo mismo que sumar el mismo número varias veces.", audio: 'tutoria_multiplicar_002' },
            { imagen: 'multiplicar2', texto: "Es decir 7 por 5 significa que vamos a sumar el número 7... ¡cinco veces seguidas!", audio: 'tutoria_multiplicar_003' },
            { imagen: 'multiplicar3', texto: "¡Hagamos la suma saltando juntos! Si tomamos los dos primeros sietes, 7 más 7... ¡nuestro truco nos lleva al 14!", audio: 'tutoria_multiplicar_004' },
            { imagen: 'multiplicar4', texto: "Damos otro salto de tiza verde y sumamos el tercer número 7. Al sumarle 7 al 14... ¡llegamos directo al número 21!", audio: 'tutoria_multiplicar_005' },
            { imagen: 'multiplicar5', texto: "¡No nos detenemos! Sumamos el cuarto número 7 de la fila. 21 más 7... ¡y la magia nos coloca en el 28!", audio: 'tutoria_multiplicar_006' },
            { imagen: 'multiplicar6', texto: "Por último, sumamos el quinto y último 7 de nuestra cadena. Al sumarle 7 al 28... ¡obtenemos el número 35!", audio: 'tutoria_multiplicar_007' },
            { imagen: 'multiplicar7', texto: "¡Miren qué maravilla! Como ven con las flechas verdes, sumar el 7 cinco veces da 35, lo que significa que 7 por 5 es... ¡exactamente 35!", audio: 'tutoria_multiplicar_008' },
            { imagen: 'multiplicar8', texto: "¡Abracadabra! Al memorizar las tablas de multiplicar, haces toda esa suma en un parpadeo.", audio: 'tutoria_multiplicar_009' },
            { imagen: 'multiplicar8', texto: "¡Ya estás listo para descubrir el sombrero correcto y hacer aparecer mis conejos en el escenario!", audio: 'tutoria_multiplicar_010' }
        ];

        let paso = 0;
        this.txtPregunta.setStyle({ fontSize: '14px', fill: '#000', wordWrap: { width: 250 } });
        this.txtPregunta.setText(tutorialMult[paso].texto);
        this.reproducirAudioTutor(tutorialMult[paso].audio);

        // Animación de arco desplazada un 20% más en X a la derecha (+75px)
        let pathMult = new Phaser.Curves.Path(585, 300);
        pathMult.quadraticBezierTo(485, 180, 415, 180); 

        this.imgMult = this.add.follower(pathMult, 585, 300, tutorialMult[paso].imagen).setDisplaySize(375, 300).setDepth(5);
        
        const animarImagen = () => {
            this.imgMult.setPosition(585, 300);
            this.imgMult.startFollow({
                duration: 800,
                ease: 'Sine.easeOut'
            });
        };
        animarImagen();

        const darBrinco = () => {
            this.zandor.y = 550;
            this.tweenZandor = this.tweens.add({
                targets: this.zandor,
                y: 540,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        const txtAvanzar = this.add.text(400, 485, '(Presiona la pantalla para avanzar)', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5).setDepth(6);

        const finalizarTutorialMult = () => {
            if (this.audioTutor) this.audioTutor.stop();
            if (this.tweenZandor) {
                this.tweenZandor.stop();
                this.zandor.y = 550;
            }
            
            this.input.off('pointerdown', avanzar);
            txtAvanzar.destroy();
            if (this.imgMult) this.imgMult.destroy();
            
            // Restauramos el estilo del texto original para el siguiente tutorial
            this.txtPregunta.setStyle({ fontSize: '15px', fill: '#000', wordWrap: { width: 240 } });
            this.txtPregunta.setText('');
            
            this.iniciarTutorial();
        };

        const avanzar = () => {
            if (this.audioTutor) this.audioTutor.stop();
            paso++;
            if (paso < tutorialMult.length) {
                this.txtPregunta.setText(tutorialMult[paso].texto);
                this.imgMult.setTexture(tutorialMult[paso].imagen);
                this.imgMult.setDisplaySize(375, 300);
                this.reproducirAudioTutor(tutorialMult[paso].audio);
                animarImagen();
                darBrinco();
            } else {
                finalizarTutorialMult();
            }
        };

        this.input.on('pointerdown', avanzar);
    }

    iniciarTutorial() {
        this.nube.setVisible(true);
        this.txtPregunta.setVisible(true);
        const frases = [
            { texto: "Se bienvenido a mi espectáculo.", audio: 'zandor_audio_001' },
            { texto: "Debes encontrar el sombrero que oculta el resultado correcto.", audio: 'zandor_audio_002' },
            { texto: "Si aciertas, ¡un conejo aparecerá por arte de magia!", audio: 'zandor_audio_003' },
            { texto: "Completaremos 6 trucos. ¿Estás listo?", audio: 'zandor_audio_004' }
        ];
        
        let paso = 0;
        this.txtPregunta.setText(frases[paso].texto);
        this.reproducirAudioTutor(frases[paso].audio);

        // Animación del mago al hablar
        const darBrinco = () => {
            this.zandor.y = 550;
            this.tweenZandor = this.tweens.add({
                targets: this.zandor,
                y: 540,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        const finalizarTutorial = () => {
            if (this.audioTutor) this.audioTutor.stop();
            if (this.tweenZandor) {
                this.tweenZandor.stop();
                this.zandor.y = 550;
            }
            this.input.off('pointerdown', avanzar);
            this.nube.setVisible(false);
            this.txtPregunta.setVisible(false);
            this.opacarJuego(false);
            this.iniciarNuevaRonda();
        };

        const avanzar = () => {
            if (this.audioTutor) this.audioTutor.stop();
            paso++;
            if (paso < frases.length) {
                this.txtPregunta.setText(frases[paso].texto);
                this.reproducirAudioTutor(frases[paso].audio);
                darBrinco();
            } else {
                finalizarTutorial();
            }
        };

        this.input.on('pointerdown', avanzar);
    }

    iniciarNuevaRonda() {
        if (this.rondaActual >= this.maxRondas) {
            this.finalizarJuego();
            return;
        }

        this.rondaActual++;
        this.rondaActiva = true;
        this.txtRondas.setText(`RONDAS: ${this.rondaActual}/${this.maxRondas}`);
        this.sombrerosGroup.clear(true, true);

        // Generar Multiplicación
        this.multiplicacionActual.a = Phaser.Math.Between(1, 10);
        this.multiplicacionActual.b = Phaser.Math.Between(1, 10);
        this.multiplicacionActual.producto = this.multiplicacionActual.a * this.multiplicacionActual.b;

        // Mostrar Pregunta
        this.nube.setVisible(true);
        this.txtPregunta.setStyle({ fontSize: '20px', fill: '#000', align: 'center', wordWrap: { width: 240 } });
        this.txtPregunta.setVisible(true).setText(`¿Cuánto es\n${this.multiplicacionActual.a} x ${this.multiplicacionActual.b}?`);

        window.TTSManager.speak(`¿Cuánto es ${this.multiplicacionActual.a} por ${this.multiplicacionActual.b}?`, 'Zandor');

        this.rondaStartTime = this.time.now;
        this.crearSombreros();
    }

    crearSombreros() {
        const posicionesX = [280, 400, 520];
        const indiceCorrecto = Phaser.Math.Between(0, 2);
        
        posicionesX.forEach((posX, i) => {
            let valor;
            if (i === indiceCorrecto) {
                valor = this.multiplicacionActual.producto;
            } else {
                do {
                    valor = Phaser.Math.Between(1, 100);
                } while (valor === this.multiplicacionActual.producto);
            }

            let numStr = valor.toString().padStart(3, '0');
            let sombrero = this.add.image(posX, 230, `s_${numStr}`).setScale(0.5).setInteractive({ useHandCursor: true });
            
            sombrero.setData('valor', valor);
            sombrero.on('pointerdown', () => this.verificarRespuesta(sombrero));
            this.sombrerosGroup.add(sombrero);
        });
    }

    verificarRespuesta(sombrero) {
        if (!this.rondaActiva) return;
        this.rondaActiva = false;
        window.TTSManager.stop();

        const valorSeleccionado = sombrero.getData('valor');
        const esCorrecto = (valorSeleccionado === this.multiplicacionActual.producto);
        const timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'MagoScene', 'Multiplicación Avanzada', 'Dificultad_Normal', 
                esCorrecto, valorSeleccionado, timeElapsed,
                `${this.multiplicacionActual.a} x ${this.multiplicacionActual.b}`, this.multiplicacionActual.producto,
                this.rondaActual
            );
        }

        const frasesPositivas = [
            { texto: '¡Excelente!', audio: 'zandor_ap_001' },
            { texto: '¡Eres muy inteligente!', audio: 'zandor_ap_002' },
            { texto: '¡Buen trabajo, campeón!', audio: 'zandor_ap_003' },
            { texto: '¡Buenísima esa, campeón!', audio: 'zandor_ap_004' },
            { texto: '¡Lo estás logrando!', audio: 'zandor_ap_005' }
        ];
        const frasesNegativas = [
            { texto: '¡Oh no, perdiste!', audio: 'zandor_an_001' },
            { texto: 'Inténtalo de nuevo', audio: 'zandor_an_002' },
            { texto: 'Esa no era', audio: 'zandor_an_003' },
            { texto: 'Casi lo logras', audio: 'zandor_an_004' },
            { texto: 'Casi, intenta otra vez', audio: 'zandor_an_005' }
        ];

        if (this.audioTutor) this.audioTutor.stop();

        if (esCorrecto) {
            this.sound.play('ganar', { volume: 0.3 });
            this.puntuacion += 10;
            this.txtPuntos.setText(`PUNTOS: ${this.puntuacion}`);
            
            // Cambia a conejo
            sombrero.setTexture('conejo_sombrero').setScale(0.5);
            sombrero.setY(sombrero.y);
            sombrero.setOrigin(0.45, 0.75); 
            
            let frase = Phaser.Utils.Array.GetRandom(frasesPositivas);
            this.txtPregunta.setText(frase.texto);
            this.reproducirAudioTutor(frase.audio);
            this.txtPregunta.setStyle({ fontSize: '18px', fill: 'rgb(21, 0, 255)', align: 'center', wordWrap: { width: 240 } });
            
            // Se aumenta el tiempo de espera a 1.5s para que el audio termine
            this.time.delayedCall(1500, () => this.iniciarNuevaRonda());
        } else {
            this.sound.play('error', { volume: 0.3 });
            this.cameras.main.shake(200, 0.01);
            let frase = Phaser.Utils.Array.GetRandom(frasesNegativas);
            this.txtPregunta.setText(frase.texto);
            this.reproducirAudioTutor(frase.audio);
            this.txtPregunta.setStyle({ fontSize: '18px', fill: '#f00', align: 'center', wordWrap: { width: 240 } });
            
            this.time.delayedCall(1500, () => this.iniciarNuevaRonda());
        }
    }

    finalizarJuego() {
        this.juegoActivo = false;
        this.rondaActiva = false;

        this.sound.play('aplausos', { volume: 0.5 });

        // Ocultar elementos de juego
        this.zandor.setAlpha(0);
        this.nube.setAlpha(0);
        this.txtPregunta.setAlpha(0);

        // Pantalla de fin de juego
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(400, 250, '¡FIN DEL JUEGO!', { fontFamily: 'Courier New', fontSize: '56px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 350, `Puntuación Final: ${this.puntuacion}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#d4a373' }).setOrigin(0.5);

        const btnRegresar = this.add.text(400, 450, 'Regresa al circo', { 
            fontFamily: 'Courier New', fontSize: '24px', fill: '#fff', backgroundColor: '#3d2622', padding: 10 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnRegresar.on('pointerdown', () => {
            this.sound.stopAll();
            window.TTSManager.stop();
            this.scene.start('MenuScene');
        });
    }
}