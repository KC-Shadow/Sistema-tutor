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
        this.load.audio('ganar_z', 'assets/music/win.mp3');
        this.load.audio('error_z', 'assets/music/error.mp3');

        // Imágenes del tutorial de multiplicar
        for (let i = 1; i <= 8; i++) {
            this.load.image(`multiplicar${i}`, `assets/tutoria/multiplicar/multiplicar${i}.png`);
        }
    }

    create() {
        // Escenario
        this.add.image(400, 250, 'fondo_zandor').setScale(0.39);
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

    opacarJuego(opacar) {
        let alpha = opacar ? 0.3 : 1;
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
            { imagen: 'multiplicar1', texto: "¡Bienvenidos a mi espectáculo! Soy el Mago Zandor. Hoy les revelaré el truco más grande de las matemáticas: la multiplicación. Miren esta operación: 7 por 5. ¿Parece difícil? ¡Ya verán que no!" },
            { imagen: 'multiplicar2', texto: "El gran secreto es que multiplicar es lo mismo que sumar el mismo número varias veces. Decir 7 por 5 significa que vamos a sumar el número 7... ¡cinco veces seguidas!" },
            { imagen: 'multiplicar3', texto: "¡Hagamos la suma saltando juntos! Si tomamos los dos primeros sietes, 7 más 7... ¡nuestro truco nos lleva al 14!" },
            { imagen: 'multiplicar4', texto: "Damos otro salto de tiza verde y sumamos el tercer número 7. Al sumarle 7 al 14... ¡llegamos directo al número 21!" },
            { imagen: 'multiplicar5', texto: "¡No nos detenemos! Sumamos el cuarto número 7 de la fila. 21 más 7... ¡y la magia nos coloca en el 28!" },
            { imagen: 'multiplicar6', texto: "Por último, sumamos el quinto y último 7 de nuestra cadena. Al sumarle 7 al 28... ¡obtenemos el número 35!" },
            { imagen: 'multiplicar7', texto: "¡Miren qué maravilla! Como ven con las flechas verdes, sumar el 7 cinco veces da 35, lo que significa que 7 por 5 es... ¡exactamente 35!" },
            { imagen: 'multiplicar8', texto: "¡Abracadabra! Al memorizar las tablas de multiplicar, haces toda esa suma en un parpadeo. ¡Ya estás listo para descubrir el sombrero correcto y hacer aparecer mis conejos en el escenario!" }
        ];

        let paso = 0;
        this.txtPregunta.setStyle({ fontSize: '12px', fill: '#000', wordWrap: { width: 250 } });
        this.txtPregunta.setText(tutorialMult[paso].texto);

        // Animación de arco ajustada para no salir de los márgenes de la imagen de fondo
        let pathMult = new Phaser.Curves.Path(750, 450);
        pathMult.quadraticBezierTo(650, 330, 580, 330); 

        this.imgMult = this.add.follower(pathMult, 750, 450, tutorialMult[paso].imagen).setDisplaySize(375, 300).setDepth(5);
        
        const animarImagen = () => {
            this.imgMult.setPosition(750, 450);
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

        const btnSaltar = this.add.text(200, 435, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '12px', fill: '#4281aa', fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const finalizarTutorialMult = () => {
            if (this.tweenZandor) {
                this.tweenZandor.stop();
                this.zandor.y = 550;
            }
            window.TTSManager.stop();
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            txtAvanzar.destroy();
            if (this.imgMult) this.imgMult.destroy();
            
            // Restauramos el estilo del texto original para el siguiente tutorial
            this.txtPregunta.setStyle({ fontSize: '15px', fill: '#000', wordWrap: { width: 240 } });
            this.txtPregunta.setText('');
            
            this.iniciarTutorial();
        };

        const avanzar = () => {
            window.TTSManager.stop();
            paso++;
            if (paso < tutorialMult.length) {
                this.txtPregunta.setText(tutorialMult[paso].texto);
                this.imgMult.setTexture(tutorialMult[paso].imagen);
                this.imgMult.setDisplaySize(375, 300);
                animarImagen();
                darBrinco();
                
                window.TTSManager.speak(tutorialMult[paso].texto, 'Zandor');
            } else {
                finalizarTutorialMult();
            }
        };

        window.TTSManager.speak(tutorialMult[paso].texto, 'Zandor');

        btnSaltar.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            finalizarTutorialMult();
        });

        this.input.on('pointerdown', avanzar);
    }

    iniciarTutorial() {
        this.nube.setVisible(true);
        this.txtPregunta.setVisible(true);
        const frases = [
            "Se bienvenido a mi espectáculo.",
            "Debes encontrar el sombrero que oculta el resultado correcto.",
            "Si aciertas, ¡un conejo aparecerá por arte de magia!",
            "Completaremos 6 trucos. ¿Estás listo?"
        ];
        
        let paso = 0;
        this.txtPregunta.setText(frases[paso]);

        // Botón Saltar
        const btnSaltar = this.add.text(200, 435, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '12px', fill: '#4281aa', fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const finalizarTutorial = () => {
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            this.nube.setVisible(false);
            this.txtPregunta.setVisible(false);
            this.opacarJuego(false);
            this.iniciarNuevaRonda();
        };

        const avanzar = () => {
            paso++;
            if (paso < frases.length) {
                this.txtPregunta.setText(frases[paso]);
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
        this.txtPregunta.setFontSize('20px');
        this.txtPregunta.setVisible(true).setText(`¿Cuánto es\n${this.multiplicacionActual.a} x ${this.multiplicacionActual.b}?`);

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

        const valorSeleccionado = sombrero.getData('valor');
        const esCorrecto = (valorSeleccionado === this.multiplicacionActual.producto);
        const timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'MagoScene', 'Multiplicación Avanzada', 'Dificultad_Normal', 
                esCorrecto, valorSeleccionado, timeElapsed,
                `${this.multiplicacionActual.a} x ${this.multiplicacionActual.b}`, this.multiplicacionActual.producto
            );
        }

        if (esCorrecto) {
            this.sound.play('ganar_z');
            this.puntuacion += 10;
            this.txtPuntos.setText(`PUNTOS: ${this.puntuacion}`);
            
            // Cambia a conejo
            sombrero.setTexture('conejo_sombrero').setScale(0.5);
            sombrero.setY(sombrero.y);
            sombrero.setOrigin(0.45, 0.75); 
            
            this.txtPregunta.setFontSize('15px');
            this.txtPregunta.setText("¡MAGNÍFICO!");
            
            // Se reduce el tiempo de espera a 1 segundo para que el ciclo sea más rápido
            this.time.delayedCall(1000, () => this.iniciarNuevaRonda());
        } else {
            this.sound.play('error_z');
            this.cameras.main.shake(200, 0.01);
            this.txtPregunta.setFontSize('15px');
            this.txtPregunta.setText("¡INCORRECTO!");
            
            this.time.delayedCall(1000, () => this.iniciarNuevaRonda());
        }
    }

    finalizarJuego() {
        this.juegoActivo = false;
        this.rondaActiva = false;

        // Ocultar elementos de juego
        this.zandor.setAlpha(0);
        this.nube.setAlpha(0);
        this.txtPregunta.setAlpha(0);

        // Pantalla de fin de juego
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(400, 250, '¡FIN DEL JUEGO!', { fontFamily: 'Courier New', fontSize: '56px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 350, `Puntuación Final: ${this.puntuacion}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#d4a373' }).setOrigin(0.5);

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