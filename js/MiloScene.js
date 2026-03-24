class MiloScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MiloScene' });
    }

    init() {
        this.puntuacion = 0;
        this.rondaActual = 1;
        this.rondasMaximas = 15;
        
        // Estado de los platos (8 porciones iniciales por plato)
        this.platos = {
            amarillo: { porcionesRestantes: 8, objetivo: 0, listo: false },
            rojo: { porcionesRestantes: 8, objetivo: 0, listo: false }
        };
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
    }

    create() {
        // Escenario Principal
        this.add.image(400, 300, 'fondo_milo').setDisplaySize(800, 600);
        this.cartelera = this.add.image(700, 100, 'cartelera_m').setScale(0.5);
        this.txtHUD = this.add.text(700, 150, `Ronda: 1/15\nPuntos: 0`, 
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

        this.nube = this.add.image(150, 100, 'nube_m').setScale(0.8);
        this.txtFraccion = this.add.text(150, 80, '', { fontFamily: 'Courier New', fontSize: '18px', fill: '#000', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

        // Varas y Platos Giratorios
        this.crearPlatosGiratorios();

        // Botón para Verificar el Resultado ---
        this.btnVerificar = this.add.text(400, 550, 'VERIFICAR EQUILIBRIO', { fontFamily: 'Courier New', fontSize: '20px', fill: '#000', backgroundColor: '#0f0', fontStyle: 'bold', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);
        this.btnVerificar.on('pointerdown', () => this.verificarResultado());

        this.iniciarTutorial();
    }

    iniciarTutorial() {
        const frases = [
            "¡Hola! Soy Milo. Bienvenido al circo.",
            "Tu objetivo es representar las fracciones que te pediré.",
            "Haz clic en las tortas para quitar porciones.",
            "Cuando estés seguro, presiona 'VERIFICAR EQUILIBRIO'.",
            "¡Tendrás 15 rondas para demostrar tu destreza!"
        ];

        let paso = 0;
        this.txtFraccion.setStyle({ fontSize: '14px', fill: '#000', wordWrap: { width: 170 } });
        this.txtFraccion.setText(frases[paso]);

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
            
            this.txtFraccion.setStyle({ fontSize: '18px', fill: '#000', fontStyle: 'bold', wordWrap: null });
            this.txtFraccion.setText('');
            
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            paso++;
            if (paso < frases.length) {
                this.txtFraccion.setText(frases[paso]);
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
        this.varaIzq = this.add.image(250, 500, 'vara').setOrigin(0.5, 1).setVisible(false);
        this.pAmarillo = this.add.image(250, 350, 'plato_amarillo').setScale(1).setVisible(false);
        this.tortaAmarilla = this.add.sprite(250, 350, 'torta_base').setScale(0.6).setInteractive({ useHandCursor: true }).setVisible(false);
        
        // Vara Derecha (Rojo)
        this.varaDer = this.add.image(550, 500, 'vara').setOrigin(0.5, 1).setVisible(false);
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
        if (this.rondaActual > this.rondasMaximas) {
            this.finalizarJuego();
            return;
        }

        const opciones = [
            { texto: "1/8", val: 1 }, { texto: "1/4", val: 2 }, 
            { texto: "1/2", val: 4 }, { texto: "3/4", val: 6 }
        ];

        this.platos.amarillo.objetivo = Phaser.Utils.Array.GetRandom(opciones);
        this.platos.rojo.objetivo = Phaser.Utils.Array.GetRandom(opciones);
        this.platos.amarillo.porcionesRestantes = 8;
        this.platos.rojo.porcionesRestantes = 8;

        this.actualizarImagenTorta('amarillo');
        this.actualizarImagenTorta('rojo');

        this.txtFraccion.setText(`Amarillo: ${this.platos.amarillo.objetivo.texto}\nRojo: ${this.platos.rojo.objetivo.texto}`);
        this.txtHUD.setText(`Ronda: ${this.rondaActual}/15\nPuntos: ${this.puntuacion}`);
    }

    quitarPorcion(color) {
        let p = this.platos[color];
        if (p.porcionesRestantes > 1) {
            p.porcionesRestantes--;
        } else {
            p.porcionesRestantes = 8; // Reset si se acaban
        }
        this.actualizarImagenTorta(color);
    }

    actualizarImagenTorta(color) {
        let num = this.platos[color].porcionesRestantes;
        let textura = (num === 8) ? 'torta_base' : `t_1_${8 - num}`;
        if (color === 'amarillo') {
            this.tortaAmarilla.setTexture(textura);
        } else {
            this.tortaRoja.setTexture(textura);
        }
    }

    verificarResultado() {
        let exito = (this.platos.amarillo.porcionesRestantes === this.platos.amarillo.objetivo.val) &&
                    (this.platos.rojo.porcionesRestantes === this.platos.rojo.objetivo.val);

        if (exito) {
            this.puntuacion += 20;
            this.txtFraccion.setText("¡EXCELENTE EQUILIBRIO!");
            this.time.delayedCall(2000, () => {
                this.rondaActual++;
                this.iniciarRonda();
            });
        } else {
            // Sonido de error y platos caen
            this.txtFraccion.setText("¡OH NO! SE CAYERON");
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
    }

    finalizarJuego() {
        this.scene.start('MenuScene');
    }
}