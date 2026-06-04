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
        this.load.audio('ganar_milo', 'assets/music/win.mp3');
        this.load.audio('error_milo', 'assets/music/error.mp3');

        // Imágenes del tutorial de dividir
        for (let i = 1; i <= 8; i++) {
            this.load.image(`dividir${i}`, `assets/tutoria/dividir/dividir${i}.png`);
        }
    }

    create() {
        // Escenario Principal
        this.add.image(400, 300, 'fondo_milo').setDisplaySize(800, 600);
        this.cartelera = this.add.image(700, 100, 'cartelera_m').setScale(0.4);
        this.txtHUD = this.add.text(700, 120, `Ronda: 1/${this.maxRondas}\nPuntos: 0`, 
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

    iniciarTutorialDivision() {
        this.nube.setVisible(true);
        this.txtOperacion.setVisible(true);
        this.milo.setVisible(true);

        const tutorialDiv = [
            { imagen: 'dividir1', texto: "¡Hola, hola! Soy Milo el equilibrista. Hoy aprenderemos el secreto para mantener el equilibrio en la cuerda floja: ¡la división! Miren este gran reto: queremos dividir 95 entre 5." },
            { imagen: 'dividir2', texto: "Para resolverlo como un profesional, transformamos la operación horizontal en una división de galería usando nuestra famosa cajita o galera. ¡Miren cómo se convierte a la derecha!" },
            { imagen: 'dividir3', texto: "Al igual que en los otros juegos, organizamos por columnas. Las Decenas van en rojo a la izquierda y las Unidades en azul a la derecha. El divisor, que es el 5, va dentro de la cajita negra." },
            { imagen: 'dividir4', texto: "¡A diferencia de la suma, aquí empezamos por la izquierda! En el recuadro amarillo tomamos el 9 de las decenas. ¿Cuántas veces cabe el 5 en el 9? Cabe una sola vez. Colocamos el 1 verde abajo de la cajita, restamos 5 al 9... ¡y nos quedan 4 decenas!" },
            { imagen: 'dividir5', texto: "Ahora, el 5 de las unidades baja en el ascensor azul, justo al lado del 4 que nos había quedado en el recuadro amarillo. ¡Al unirse, se transforman en el número 45!" },
            { imagen: 'dividir6', texto: "Buscamos en la tabla del 5 un número que nos dé 45. ¡Es el 9 verde! Colocamos el 9 al lado del 1 bajo la cajita. Multiplicamos 5 por 9, que da 45, lo restamos al 45 azul... ¡y nos queda un residuo de cero!" },
            { imagen: 'dividir7', texto: "¡Qué gran hazaña! Como ven con la flecha verde, al repartir el 95 en 5 partes exactas, cada grupo recibe 19, y no nos sobra absolutamente nada en la pista." },
            { imagen: 'dividir8', texto: "¡Un aplauso del público! Nuestro resultado final es 19. Ahora que ya conocen el truco del reparto exacto, ¡vamos a colocar las porciones necesarias en mis platos para mantener el equilibrio perfecto!" }
        ];

        let paso = 0;
        this.txtOperacion.setStyle({ fontSize: '12px', fill: '#000', wordWrap: { width: 240 } });
        this.txtOperacion.setText(tutorialDiv[paso].texto);

        // Animación de arco ajustada para no salir de los márgenes de la pantalla (resolución de 800x600)
        let pathDiv = new Phaser.Curves.Path(680, 580);
        pathDiv.quadraticBezierTo(680, 420, 580, 420); 

        this.imgDiv = this.add.follower(pathDiv, 680, 580, tutorialDiv[paso].imagen).setDisplaySize(360, 270).setDepth(5);
        
        const animarImagen = () => {
            this.imgDiv.setPosition(680, 580);
            this.imgDiv.startFollow({
                duration: 800,
                ease: 'Sine.easeOut'
            });
        };
        animarImagen();

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

        const txtAvanzar = this.add.text(400, 570, '(Presiona la pantalla para avanzar)', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5).setDepth(6);

        const btnSaltar = this.add.text(200, 450, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#333', fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6);

        const finalizarTutorialDiv = () => {
            if (this.tweenMilo) {
                this.tweenMilo.stop();
                this.milo.y = 350;
            }
            window.TTSManager.stop();
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            txtAvanzar.destroy();
            if (this.imgDiv) this.imgDiv.destroy();
            
            // Restauramos el estilo del texto original para el siguiente tutorial
            this.txtOperacion.setStyle({ fontSize: '14px', fill: '#000', fontStyle: 'bold', wordWrap: { width: 240 } });
            this.txtOperacion.setText('');
            
            this.iniciarTutorial();
        };

        const avanzar = () => {
            window.TTSManager.stop();
            paso++;
            if (paso < tutorialDiv.length) {
                this.txtOperacion.setText(tutorialDiv[paso].texto);
                this.imgDiv.setTexture(tutorialDiv[paso].imagen);
                this.imgDiv.setDisplaySize(360, 270);
                animarImagen();
                darBrinco();
                
                window.TTSManager.speak(tutorialDiv[paso].texto, 'Milo');
            } else {
                finalizarTutorialDiv();
            }
        };

        window.TTSManager.speak(tutorialDiv[paso].texto, 'Milo');

        btnSaltar.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            finalizarTutorialDiv();
        });

        this.input.on('pointerdown', avanzar);
    }

    iniciarTutorial() {
        const frases = [
            "Bienvenido al show del equilibrista.",
            "Tu objetivo es resolver la división que te pediré.",
            "Deja en las tortas las porciones que sumen el resultado.",
            "Cuando estés seguro, presiona 'VERIFICAR EQUILIBRIO'.",
            "¡Tendrás 6 rondas para demostrar tu destreza!"
        ];

        let paso = 0;
        this.txtOperacion.setStyle({ fontSize: '14px', fill: '#000', wordWrap: { width: 240 } });
        this.txtOperacion.setText(frases[paso]);

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

        const btnSaltar = this.add.text(400, 500, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '18px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const finalizarTutorial = () => {
            if (this.tweenMilo) {
                this.tweenMilo.stop();
                this.milo.y = 350;
            }
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            
            this.txtOperacion.setStyle({ fontSize: '15px', fill: '#000', fontStyle: 'bold', wordWrap: { width: 240 } });
            this.txtOperacion.setText('');
            
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            paso++;
            if (paso < frases.length) {
                this.txtOperacion.setText(frases[paso]);
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
            cociente = Phaser.Math.Between(2, 8); // Resultado que debe sumar el jugador
            dividendo = divisor * cociente;
        } while (dividendo === this.division.dividendo && divisor === this.division.divisor);

        this.division = { dividendo, divisor, cociente };

        // Reiniciar platos
        this.platos.amarillo.porciones = 8;
        this.platos.rojo.porciones = 8;

        this.actualizarImagenTorta('amarillo');
        this.actualizarImagenTorta('rojo');

        this.txtOperacion.setText(`¡EQUILIBRIO!\n${dividendo} ÷ ${divisor} = ?\n(Deja porciones que\nsumen el resultado)`);
        this.txtHUD.setText(`Ronda: ${this.rondaActual}/${this.maxRondas}\nPuntos: ${this.puntuacion}`);
        this.rondaStartTime = this.time.now;
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
        
        // Suma de las porciones que quedan visualmente en ambos platos
        let sumaJugador = this.platos.amarillo.porciones + this.platos.rojo.porciones;
        let esCorrecto = (sumaJugador === this.division.cociente);
        let timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'MiloScene', 'Divisiones', 'Dificultad_Normal', 
                esCorrecto, sumaJugador, timeElapsed
            );
        }

        if (esCorrecto) {
            this.sound.play('ganar_milo');
            this.puntuacion += 20;
            this.txtOperacion.setText("¡EQUILIBRIO LOGRADO!");
            this.time.delayedCall(2000, () => {
                this.rondaActual++;
                this.iniciarRonda();
            });
        } else {
            this.sound.play('error_milo');
            this.txtOperacion.setText(`¡OH NO!\n${this.division.dividendo} ÷ ${this.division.divisor} es ${this.division.cociente}`);
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
        window.TTSManager.stop();
        this.scene.start('MenuScene');
    }
}