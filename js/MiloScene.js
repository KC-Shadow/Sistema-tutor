class MiloScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MiloScene' });
    }

    init() {
        this.puntuacion = 0;
        this.rondaActual = 1;
        this.maxRondas = 6;
        this.division = { dividendo: 0, divisor: 0, cociente: 0 };
        
        // Estado de los platos 
        this.platos = {
            amarillo: { porciones: 8 },
            rojo: { porciones: 8 }
        };
        this.juegoActivo = false;
    }

    preload() {
        // Personajes y UI
        this.load.image('milo', 'assets/personajes_principales/milo.png');
        this.load.image('milo_2', 'assets/personajes_principales/milo_2.png');
        this.load.image('milo_3', 'assets/personajes_principales/milo_3.png');
        this.load.image('nube_m', 'assets/extra/dialogo_2.png');
        this.load.image('cartelera_m', 'assets/extra/cartelera.png');
        this.load.image('fondo_milo', 'assets/equilibrista/ui/fondo.jpg')
        
        // Elementos del Equilibrista
        this.load.image('plato_amarillo', 'assets/equilibrista/platos/p_amarillo.png');
        this.load.image('plato_rojo', 'assets/equilibrista/platos/p_rojo.png');
        this.load.image('vara', 'assets/equilibrista/ui/vara.png');
        
        // Tortas y Porciones (Cargamos t_1 y t_2)
        this.load.image('torta_base', 'assets/equilibrista/tortas/t_1.png');
        for(let i=1; i<=7; i++) {
            this.load.image(`t_1_${i}`, `assets/equilibrista/tortas/tortas_1/t_1_${i}.png`);
        }

        // Cuenta Regresiva
        this.load.image('go', 'assets/extra/n_004.png');
        this.load.image('n_003', 'assets/extra/n_003.png');
        this.load.image('n_002', 'assets/extra/n_002.png');
        this.load.image('n_001', 'assets/extra/n_001.png');
        this.load.audio('cuenta_regresiva', 'assets/music/cuenta_regresiva.mp3');

        // Sonidos de ganar y error
        this.load.audio('ganar', 'assets/music/win.mp3');
        this.load.audio('error', 'assets/music/error.mp3');
        this.load.audio('aplausos', 'assets/music/aplausos.mp3');
        this.load.audio('circus_end', 'assets/music/circus_end.mp3');
        this.load.image('pausa_juego', 'assets/extra/pausa_juego.png');

        // Imágenes del tutorial de dividir
        for (let i = 1; i <= 8; i++) {
            this.load.image(`dividir${i}`, `assets/tutoria/dividir/dividir${i}.png`);
        }

        // Audios de tutor (Milo)
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`milo_audio_00${i}`, `assets/audios_tutor/milo_audios/bienvenida/audio_00${i}.wav`);
        }
        for (let i = 1; i <= 16; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.audio(`tutoria_dividir_${numStr}`, `assets/audios_tutor/milo_audios/tutoria_dividir/tutoria_dividir_${numStr}.wav`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`milo_ap_00${i}`, `assets/audios_tutor/milo_audios/afirmaciones/positivas/ap_00${i}.wav`);
            this.load.audio(`milo_an_00${i}`, `assets/audios_tutor/milo_audios/afirmaciones/negativas/an_00${i}.wav`);
        }
    }

    create() {
        // Escenario Principal
        this.fondo = this.add.image(400, 300, 'fondo_milo').setDisplaySize(800, 600);
        this.cartelera = this.add.image(700, 100, 'cartelera_m').setScale(0.4);
        this.txtHUD = this.add.text(700, 120, `RONDAS: 1/${this.maxRondas}\nPUNTOS: 0`, 
            { fontFamily: 'Playbill', fontSize: '38px', fill: '#000000', align: 'center' }).setOrigin(0.5).setAngle(-9);

        // Milo y Diálogo
        this.milo = this.add.sprite(400, 350, 'milo').setScale(0.8);

        // Animación de secuencia rápida para Milo
        this.anims.create({
            key: 'milo_anim',
            frames: [
                { key: 'milo' },
                { key: 'milo_2' },
                { key: 'milo_3' },
                { key: 'milo_2' },
                { key: 'milo' }
            ],
            frameRate: 15, // Velocidad rápida
            repeat: -1     // Bucle infinito
        });
        this.milo.play('milo_anim');

        this.nube = this.add.image(170, 130, 'nube_m').setDisplaySize(300, 200);
        this.txtOperacion = this.add.text(170, 105, '', { fontFamily: 'Courier New', fontSize: '15px', fill: '#000', fontStyle: 'bold', align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5);

        // Varas y Platos Giratorios
        this.crearPlatosGiratorios();

        // Botón para Verificar el Resultado ---
        this.btnVerificar = this.add.text(400, 550, 'VERIFICAR EQUILIBRIO', { fontFamily: 'Courier New', fontSize: '20px', fill: '#000', backgroundColor: '#0f0', fontStyle: 'bold', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);
        this.btnVerificar.on('pointerdown', () => this.verificarEquilibrio());

        this.iniciarTutorialDivision();
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
        let alpha = opacar ? 0.3 : 1;
        if (this.fondo) this.fondo.setAlpha(alpha);
        if (this.cartelera) this.cartelera.setAlpha(alpha);
        if (this.txtHUD) this.txtHUD.setAlpha(alpha);
    }

    iniciarTutorialDivision() {
        this.opacarJuego(true);
        this.nube.setVisible(true);
        this.txtOperacion.setVisible(true);
        this.milo.setVisible(true);
        
        // Pausar animación de Milo para que se quede completamente quieto
        this.milo.anims.stop();
        this.milo.setTexture('milo');
        this.milo.setScale(0.4); // Reducir tamaño un 50%
        this.milo.setPosition(320, 350); // Subir en Y un 25% (-150px) y mover en X un 15% a la izquierda (-120px)
        
        // Reducir la nube de diálogo un 20%
        this.nube.setDisplaySize(240, 160).setPosition(150, 200); // Ajustar posición para que siga alineada con Milo
        this.txtOperacion.setPosition(150, 180); // Ajustar posición del texto

        const tutorialDiv = [
            { imagen: 'dividir1', texto: "¡Hola, hola! Soy Milo el equilibrista.", audio: 'tutoria_dividir_001' },
            { imagen: 'dividir1', texto: "Hoy aprenderemos el secreto para mantener el equilibrio en la cuerda floja: ¡la división!", audio: 'tutoria_dividir_002' },
            { imagen: 'dividir1', texto: "Miren este gran reto: queremos dividir 95 entre 5.", audio: 'tutoria_dividir_003' },
            { imagen: 'dividir2', texto: "Para resolverlo como un profesional, transformamos la operación horizontal en una división de galería usando nuestra famosa cajita.", audio: 'tutoria_dividir_004' },
            { imagen: 'dividir2', texto: "¡Miren cómo se convierte a la derecha!", audio: 'tutoria_dividir_005' },
            { imagen: 'dividir3', texto: "Al igual que en los otros juegos, organizamos por columnas.", audio: 'tutoria_dividir_006' },
            { imagen: 'dividir3', texto: "Las Decenas van en rojo a la izquierda y las Unidades en azul a la derecha. El divisor, que es el 5, va dentro de la cajita negra.", audio: 'tutoria_dividir_007' },
            { imagen: 'dividir4', texto: "¡A diferencia de la suma, aquí empezamos por la izquierda! En el recuadro amarillo tomamos el 9 de las decenas.", audio: 'tutoria_dividir_008' },
            { imagen: 'dividir4', texto: "¿Cuántas veces cabe el 5 en el 9? Cabe una sola vez. Colocamos el 1 verde abajo de la cajita, restamos 5 al 9... ¡y nos quedan 4 decenas!", audio: 'tutoria_dividir_009' },
            { imagen: 'dividir5', texto: "Ahora, el 5 de las unidades baja en el ascensor azul, justo al lado del 4 que nos había quedado en el recuadro amarillo.", audio: 'tutoria_dividir_010' },
            { imagen: 'dividir5', texto: "¡Al unirse, se transforman en el número 45!", audio: 'tutoria_dividir_011' },
            { imagen: 'dividir6', texto: "Buscamos en la tabla del 5 un número que nos dé 45. ¡Es el 9 verde!", audio: 'tutoria_dividir_012' },
            { imagen: 'dividir6', texto: "Colocamos el 9 al lado del 1 bajo la cajita. Multiplicamos 5 por 9, que da 45, lo restamos al 45 azul... ¡y nos queda un residuo de cero!", audio: 'tutoria_dividir_013' },
            { imagen: 'dividir7', texto: "¡Qué gran hazaña! Como ven con la flecha verde, al repartir el 95 en 5 partes exactas, cada grupo recibe 19, y no nos sobra absolutamente nada.", audio: 'tutoria_dividir_014' },
            { imagen: 'dividir8', texto: "¡Un aplauso del público! Nuestro resultado final es 19. Ahora que ya conocen el truco del reparto exacto,", audio: 'tutoria_dividir_015' },
            { imagen: 'dividir8', texto: "¡vamos a colocar las porciones necesarias en mis platos para mantener el equilibrio perfecto!", audio: 'tutoria_dividir_016' }
        ];

        let paso = 0;
        this.txtOperacion.setStyle({ fontSize: '12px', fill: '#000', wordWrap: { width: 190 } }); // Ajustado al nuevo tamaño de la nube
        this.txtOperacion.setText(tutorialDiv[paso].texto);
        this.reproducirAudioTutor(tutorialDiv[paso].audio);

        // Animación de arco desplazada nuevamente un 5% en X a la izquierda (-18px) y 20% en Y hacia arriba (-54px)
        let pathDiv = new Phaser.Curves.Path(590, 404);
        pathDiv.quadraticBezierTo(590, 244, 490, 244); 

        this.imgDiv = this.add.follower(pathDiv, 590, 404, tutorialDiv[paso].imagen).setDisplaySize(360, 270).setDepth(5);
        
        const animarImagen = () => {
            this.imgDiv.setPosition(590, 404);
            this.imgDiv.startFollow({
                duration: 800,
                ease: 'Sine.easeOut'
            });
        };
        animarImagen();

        const txtAvanzar = this.add.text(400, 570, '(Presiona la pantalla para avanzar)', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5).setDepth(6);

        const finalizarTutorialDiv = () => {
            if (this.audioTutor) this.audioTutor.stop();
            
            this.input.off('pointerdown', avanzar);
            txtAvanzar.destroy();
            if (this.imgDiv) this.imgDiv.destroy();
            
            // Reactivar animación de Milo para el siguiente tutorial y el juego
            this.milo.play('milo_anim');
            this.milo.setScale(0.8); // Volver al tamaño normal
            this.milo.setPosition(400, 350); // Volver a su posición original
            
            // Restaurar el tamaño normal de la nube
            this.nube.setDisplaySize(300, 200).setPosition(170, 130); // Volver a su posición original
            this.txtOperacion.setPosition(170, 105); // Volver a su posición original

            // Restauramos el estilo del texto original para el siguiente tutorial
            this.txtOperacion.setStyle({ fontSize: '14px', fill: '#000', fontStyle: 'bold', wordWrap: { width: 240 } });
            this.txtOperacion.setText('');
            
            this.iniciarTutorial();
        };

        const avanzar = () => {
            if (this.audioTutor) this.audioTutor.stop();
            paso++;
            if (paso < tutorialDiv.length) {
                this.txtOperacion.setText(tutorialDiv[paso].texto);
                this.imgDiv.setTexture(tutorialDiv[paso].imagen);
                this.imgDiv.setDisplaySize(360, 270);
                this.reproducirAudioTutor(tutorialDiv[paso].audio);
                animarImagen();
            } else {
                finalizarTutorialDiv();
            }
        };

        this.input.on('pointerdown', avanzar);
    }

    iniciarTutorial() {
        const frases = [
            { texto: "Bienvenido al show del equilibrista.", audio: 'milo_audio_001' },
            { texto: "Tu objetivo es resolver la división que te pediré.", audio: 'milo_audio_002' },
            { texto: "Deja en las tortas las porciones que sumen el resultado.", audio: 'milo_audio_003' },
            { texto: "Cuando estés seguro, presiona 'VERIFICAR EQUILIBRIO'.", audio: 'milo_audio_004' },
            { texto: "¡Tendrás 6 rondas para demostrar tu destreza!", audio: 'milo_audio_005' }
        ];

        let paso = 0;
        this.txtOperacion.setStyle({ fontSize: '14px', fill: '#000', wordWrap: { width: 240 } });
        this.txtOperacion.setText(frases[paso].texto);
        this.reproducirAudioTutor(frases[paso].audio);

        const darBrinco = () => {
            this.milo.y = 350;
            this.tweenMilo = this.tweens.add({
                targets: this.milo,
                y: 340,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        const finalizarTutorial = () => {
            if (this.audioTutor) this.audioTutor.stop();
            if (this.tweenMilo) {
                this.tweenMilo.stop();
                this.milo.y = 350;
            }
            
            this.input.off('pointerdown', avanzar);
            
            this.txtOperacion.setStyle({ fontSize: '15px', fill: '#000', fontStyle: 'bold', wordWrap: { width: 240 } });
            this.txtOperacion.setText('');
            
            this.opacarJuego(false);
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            if (this.audioTutor) this.audioTutor.stop();
            paso++;
            if (paso < frases.length) {
                this.txtOperacion.setText(frases[paso].texto);
                this.reproducirAudioTutor(frases[paso].audio);
                darBrinco();
            } else {
                finalizarTutorial();
            }
        };

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
        this.mostrarPlatos();
        this.iniciarRonda();
    }

    crearPlatosGiratorios() {
        // Vara Izquierda (Amarillo)
        this.varaIzq = this.add.image(250, 600, 'vara').setOrigin(0.5, 1).setScale(1.5, 1).setVisible(false);
        this.pAmarillo = this.add.image(250, 350, 'plato_amarillo').setScale(1).setVisible(false);
        this.tortaAmarilla = this.add.sprite(250, 350, 'torta_base').setScale(0.6).setInteractive({ useHandCursor: true }).setVisible(false);
        
        // Vara Derecha (Rojo)
        this.varaDer = this.add.image(550, 600, 'vara').setOrigin(0.5, 1).setScale(1.5, 1).setVisible(false);
        this.pRojo = this.add.image(550, 350, 'plato_rojo').setScale(1).setVisible(false);
        this.tortaRoja = this.add.sprite(550, 350, 'torta_base').setScale(0.6).setInteractive({ useHandCursor: true }).setVisible(false);

        this.tortaAmarilla.on('pointerdown', () => this.quitarPorcion('amarillo'));
        this.tortaRoja.on('pointerdown', () => this.quitarPorcion('rojo'));
    }

    mostrarPlatos() {
        // Revelar los elementos ocultos
        this.varaIzq.setVisible(true);
        this.pAmarillo.setVisible(true);
        this.tortaAmarilla.setVisible(true);
        
        this.varaDer.setVisible(true);
        this.pRojo.setVisible(true);
        this.tortaRoja.setVisible(true);

        this.btnVerificar.setVisible(true);
    }

    iniciarRonda() {
        if (this.rondaActual > this.maxRondas) {
            this.finalizarJuego();
            return;
        }

        // Generar división exacta aleatoria (variando el divisor para más dinamismo)
        // Asegurarse de que no se repita la división de la ronda anterior
        let divisor, cociente, dividendo;
        do {
            divisor = Phaser.Math.Between(2, 5); 
            cociente = Phaser.Math.Between(1, 8) * 2; // Resultado par garantizado hasta 16 (2, 4, 6, 8, 10, 12, 14, 16)
            dividendo = divisor * cociente;
        } while (dividendo === this.division.dividendo && divisor === this.division.divisor);

        this.division = { dividendo, divisor, cociente };

        // Reiniciar platos
        this.platos.amarillo.porciones = 8;
        this.platos.rojo.porciones = 8;

        this.actualizarImagenTorta('amarillo');
        this.actualizarImagenTorta('rojo');

        this.txtOperacion.setStyle({ fontSize: '15px', fill: '#000', fontStyle: 'bold', align: 'center', wordWrap: { width: 240 } });
        this.txtOperacion.setText(`¡EQUILIBRIO!\n${dividendo} ÷ ${divisor} = ?\n(Deja porciones que\nsumen el resultado)`);
        this.txtHUD.setText(`RONDAS: ${this.rondaActual}/${this.maxRondas}\nPUNTOS: ${this.puntuacion}`);
        this.rondaStartTime = this.time.now;
        
        window.TTSManager.speak(`¿Cuánto es ${dividendo} entre ${divisor}?`, 'Milo');
        
        this.juegoActivo = true;
    }

    quitarPorcion(color) {
        if (!this.juegoActivo) return;
        
        let p = this.platos[color];
        if (p.porciones > 1) {
            p.porciones--;
        } else {
            p.porciones = 8; // Reset si se acaban
        }
        this.actualizarImagenTorta(color);
    }

    actualizarImagenTorta(color) {
        let num = this.platos[color].porciones;
        let textura = (num === 8) ? 'torta_base' : `t_1_${8 - num}`;
        if (color === 'amarillo') {
            this.tortaAmarilla.setTexture(textura);
        } else {
            this.tortaRoja.setTexture(textura);
        }
    }

    verificarEquilibrio() {
        if (!this.juegoActivo) return;
        this.juegoActivo = false;
        window.TTSManager.stop();
        
        // Suma de las porciones que quedan visualmente en ambos platos
        let sumaJugador = this.platos.amarillo.porciones + this.platos.rojo.porciones;
        let esCorrecto = (sumaJugador === this.division.cociente);
        let timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'MiloScene', 'Divisiones', 'Dificultad_Normal', 
                esCorrecto, sumaJugador, timeElapsed,
                `${this.division.dividendo} ÷ ${this.division.divisor}`, this.division.cociente,
                this.rondaActual
            );
        }

        const frasesPositivas = [
            { texto: '¡Excelente!', audio: 'milo_ap_001' },
            { texto: '¡Eres muy inteligente!', audio: 'milo_ap_002' },
            { texto: '¡Buen trabajo, campeón!', audio: 'milo_ap_003' },
            { texto: '¡Buenísima esa, campeón!', audio: 'milo_ap_004' },
            { texto: '¡Lo estás logrando!', audio: 'milo_ap_005' }
        ];
        const frasesNegativas = [
            { texto: '¡Oh no, perdiste!', audio: 'milo_an_001' },
            { texto: 'Inténtalo de nuevo', audio: 'milo_an_002' },
            { texto: 'Esa no era', audio: 'milo_an_003' },
            { texto: 'Casi lo logras', audio: 'milo_an_004' },
            { texto: 'Casi, intenta otra vez', audio: 'milo_an_005' }
        ];

        if (this.audioTutor) this.audioTutor.stop();

        if (esCorrecto) {
            this.sound.play('ganar', { volume: 0.3 });
            this.puntuacion += 20;
            let frase = Phaser.Utils.Array.GetRandom(frasesPositivas);
            this.txtOperacion.setText(frase.texto);
            this.reproducirAudioTutor(frase.audio);
            this.txtOperacion.setStyle({ fontSize: '18px', fill: 'rgb(21, 0, 255)', fontStyle: 'bold', align: 'center', wordWrap: { width: 240 } });
            this.time.delayedCall(2000, () => {
                this.rondaActual++;
                this.iniciarRonda();
            });
        } else {
            this.sound.play('error', { volume: 0.3 });
            let frase = Phaser.Utils.Array.GetRandom(frasesNegativas);
            this.txtOperacion.setText(frase.texto);
            this.reproducirAudioTutor(frase.audio);
            this.txtOperacion.setStyle({ fontSize: '18px', fill: '#f00', fontStyle: 'bold', align: 'center', wordWrap: { width: 240 } });
            this.caerPlatos();
        }
    }

    caerPlatos() {
        // Animación de los platos cayendo por error
        this.tweens.add({
            targets: [this.pAmarillo, this.pRojo, this.tortaAmarilla, this.tortaRoja],
            y: '+=200',
            duration: 500,
            ease: 'Power2'
        });
        this.time.delayedCall(2000, () => {
            this.pAmarillo.y = 350;
            this.pRojo.y = 350;
            this.tortaAmarilla.y = 350;
            this.tortaRoja.y = 350;
            this.rondaActual++;
            this.iniciarRonda();
        });
    }

    finalizarJuego() {
        this.juegoActivo = false;

        this.sound.stopAll(); // Detener música, tutoriales u otros efectos
        this.sound.play('circus_end', { volume: 0.5 });

        // Ocultar elementos de juego
        this.milo.setAlpha(0);
        this.nube.setAlpha(0);
        this.txtOperacion.setAlpha(0);
        if (this.btnVerificar) this.btnVerificar.setVisible(false);

        // Pantalla de pausa de sesión (Fin de primera sesión)
        this.add.image(400, 300, 'pausa_juego').setDisplaySize(800, 600).setDepth(100);
        this.add.text(400, 550, `Puntuación Final: ${this.puntuacion}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: 5 }).setOrigin(0.5).setDepth(101);
    }
}