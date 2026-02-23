class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // UI y Escenario
        this.load.image('fondo_carpa_pepe', 'assets/ui/fondo_carpa_pepe.jpg');
        this.load.image('mostrador', 'assets/ui/mostrador.png');
        this.load.image('reg_cerrada', 'assets/ui/registradora_cerrada.png');
        this.load.image('reg_abierta', 'assets/ui/registradora_abierta.png');
        this.load.image('palanca', 'assets/ui/palanca.png');
        this.load.image('cartelera', 'assets/ui/cartelera.png');

        // Personajes
        this.load.image('pepe', 'assets/personajes/pepe.png');
        this.load.image('cliente_bufalo', 'assets/personajes/bufalo.png');
        this.load.image('cliente_buho', 'assets/personajes/buho.png');
        this.load.image('cliente_cerdo', 'assets/personajes/cerdo.png');
        this.load.image('cliente_cisne', 'assets/personajes/cisne.png');
        this.load.image('cliente_conejo', 'assets/personajes/conejo.png');
        this.load.image('cliente_hipopotamo', 'assets/personajes/hipopotamo.png');
        this.load.image('cliente_jirafa', 'assets/personajes/jirafa.png');
        this.load.image('cliente_mono', 'assets/personajes/mono.png');
        this.load.image('cliente_morsa', 'assets/personajes/morsa.png');
        this.load.image('cliente_oso', 'assets/personajes/oso.png');
        this.load.image('cliente_pavo', 'assets/personajes/pavo.png');
        this.load.image('cliente_perro', 'assets/personajes/perro.png');
        this.load.image('cliente_pinguino', 'assets/personajes/pinguino.png');
        this.load.image('cliente_raton', 'assets/personajes/raton.png');
        this.load.image('cliente_tejon', 'assets/personajes/tejon.png');
        this.load.image('cliente_zorro', 'assets/personajes/zorro.png');
        
        // Monedas
        this.load.image('c1', 'assets/monedas/moneda_1.png');
        this.load.image('c5', 'assets/monedas/moneda_5.png');
        this.load.image('c10', 'assets/monedas/moneda_10.png');

        // Cuenta Regresiva
        this.load.image('go', 'assets/extra/n_004.png');
        this.load.image('n_003', 'assets/extra/n_003.png');
        this.load.image('n_002', 'assets/extra/n_002.png');
        this.load.image('n_001', 'assets/extra/n_001.png');

        // Nube de dialogo
        this.load.image('dialogo', 'assets/extra/dialogo.png');
        this.load.image('dialogo_2', 'assets/extra/dialogo_2.png');

        // Musica y Sonidos
        this.load.audio('caja_registradora', 'assets/music/caja_registradora.mp3');
        this.load.audio('musica_fondo', 'assets/music/circus_game.mp3');
        this.load.audio('cuenta_regresiva', 'assets/music/cuenta_regresiva.mp3');
        this.load.audio('error', 'assets/music/error.mp3');
        this.load.audio('ganar', 'assets/music/win.mp3');
    }

    create() {
        // Fondo y Mostrador
        this.add.image(400, 300, 'fondo_carpa_pepe').setScale(0.8);
        this.add.image(10, 10, 'cartelera').setOrigin(0, 0).setScale(0.4);
        this.cliente = this.add.image(500, 280, 'cliente_conejo').setScale(0.6).setAlpha(0);
        this.add.image(450, 525, 'mostrador');

        // Sonido de fondo
        this.musica = this.sound.add('musica_fondo', { loop: true, volume: 0.5 });
        this.musica.play();

        // Registradora y Palanca
        this.registradora = this.add.image(600, 225, 'reg_cerrada').setScale(0.6);
        this.palanca = this.add.image(700, 230, 'palanca').setScale(0.4).setInteractive({ useHandCursor: true });
        
        // Pantalla de la caja
        this.txtPantalla = this.add.text(585, 185, '0.00', { 
            fontFamily: 'Courier New', fontSize: '18px', fill: '#0f0', backgroundColor: '#000' 
        }).setOrigin(0.5);

        // Personajes
        this.pepe = this.add.image(100, 420, 'pepe').setScale(0.7);

        // Diálogo Cliente
        this.nubeCliente = this.add.image(150, 120, 'dialogo_2').setOrigin(0, 0).setScale(0.9).setAlpha(0);
        this.txtCliente = this.add.text(180, 150, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', wordWrap: { width: 180 } 
        }).setAlpha(0);

        // Tutorial y Diálogo
        this.nube = this.add.image(20, 20, 'dialogo').setOrigin(0, 0);
        this.txtPepe = this.add.text(50, 50, '', { 
            fontFamily: 'Courier New', fontSize: '15px', fill: '#000', wordWrap: { width: 250 } 
        });

        // Contenedores y Grupos
        this.grupoPagoMostrador = this.add.group();
        this.monedasVueltoContainer = this.add.container(0, 0).setAlpha(0);
        this.crearMonedasEnCaja();

        this.txtVuelto = this.add.text(430, 460, 'VUELTO: 0', { 
            fontFamily: 'Courier New', fontSize: '24px', fill: '#fff', fontWeight: 'bold' 
        }).setAlpha(0);

        // Variables de lógica
        this.juegoActivo = false;
        this.vueltoEntregado = 0;
        this.puntos = 0;

        this.iniciarTutorial();
    }

    iniciarTutorial() {
        this.txtPepe.setText('PEPE: "¡Atención! Niños: 3 Cenox, Adultos: 7 Cenox. Calcula el total, jala la palanca y da el vuelto. ¡Haz clic para empezar!"');
        this.input.once('pointerdown', () => {
            this.tweens.add({
                targets: [this.pepe, this.nube, this.txtPepe],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.pepe.setVisible(false);
                    this.iniciarCuentaRegresiva();
                }
            });
        });
    }

    iniciarCuentaRegresiva() {
        this.sound.play('cuenta_regresiva');
        let nums = ['n_003', 'n_002', 'n_001', 'go'];
        nums.forEach((n, i) => {
            this.time.delayedCall(i * 1000, () => {
                let img = this.add.image(400, 300, n).setScale(0.8);
                this.tweens.add({ targets: img, alpha: 0, duration: 800, onComplete: () => img.destroy() });
                if(n === 'go') this.nuevaVenta();
            });
        });
    }

    nuevaVenta() {
        this.juegoActivo = true;
        this.vueltoEntregado = 0;
        this.txtVuelto.setText('VUELTO: 0').setAlpha(0);
        this.registradora.setTexture('reg_cerrada');
        this.monedasVueltoContainer.setAlpha(0);
        this.grupoPagoMostrador.clear(true, true);

        // Lógica de Doble Tarifa
        let ninos = Phaser.Math.Between(0, 3);
        let adultos = Phaser.Math.Between(1, 4);

        // Actualizar diálogo del cliente
        let msg = `Hola, quiero ${adultos} de adulto`;
        if (ninos > 0) msg += ` y ${ninos} de niño`;
        msg += ".";
        this.txtCliente.setText(msg).setAlpha(1);
        this.nubeCliente.setAlpha(1);

        this.montoTotal = (ninos * 3) + (adultos * 7);
        
        // El cliente paga con el billete/monto superior más cercano
        this.pagoCliente = Math.ceil(this.montoTotal / 10) * 10;
        if (this.pagoCliente === this.montoTotal) this.pagoCliente += 10;
        this.vueltoCorrecto = this.pagoCliente - this.montoTotal;

        this.txtPantalla.setText(this.montoTotal + ".00");
        
        // Seleccionar cliente aleatorio
        const listaClientes = ['bufalo', 'buho', 'cerdo', 'cisne', 'conejo', 'hipopotamo', 'jirafa', 'mono', 'morsa', 'oso', 'pavo', 'perro', 'pinguino', 'raton', 'tejon', 'zorro'];
        this.cliente.setTexture(`cliente_${Phaser.Utils.Array.GetRandom(listaClientes)}`).setAlpha(1);
        
        this.mostrarPagoEnMostrador(this.pagoCliente);
        
        // Activar palanca para abrir
        this.palanca.removeAllListeners('pointerdown');
        this.palanca.on('pointerdown', () => this.abrirCaja());
    }

    mostrarPagoEnMostrador(monto) {
        let x = 460;
        let temp = monto;
        while(temp > 0) {
            let valor = temp >= 10 ? 10 : (temp >= 5 ? 5 : 1);
            let moneda = this.add.image(x, 485, `c${valor}`).setScale(0.08);
            this.grupoPagoMostrador.add(moneda);
            temp -= valor;
            x += 25;
        }
    }

    crearMonedasEnCaja() {
        [1, 5, 10].forEach((valor, i) => {
            let m = this.add.image(575 + (i * 35), 250, `c${valor}`).setScale(0.08).setInteractive({ useHandCursor: true });
            m.on('pointerdown', () => {
                if(this.registradora.texture.key === 'reg_abierta') {
                    this.vueltoEntregado += valor;
                    this.txtVuelto.setText(`VUELTO: ${this.vueltoEntregado}`);
                }
            });
            this.monedasVueltoContainer.add(m);
        });
    }

    abrirCaja() {
        this.sound.play('caja_registradora');
        this.registradora.setTexture('reg_abierta');
        this.monedasVueltoContainer.setAlpha(1);
        this.txtVuelto.setAlpha(1);
        
        // Al volver a pulsar la palanca se valida
        this.palanca.removeAllListeners('pointerdown');
        this.palanca.on('pointerdown', () => this.validarOperacion());
    }

    validarOperacion() {
        if (this.vueltoEntregado === this.vueltoCorrecto) {
            this.sound.play('ganar');
            this.puntos += 10;
            this.registradora.setTexture('reg_cerrada');
            this.time.delayedCall(1000, () => this.nuevaVenta());
        } else {
            this.sound.play('error');
            this.cameras.main.shake(200, 0.01);
            this.vueltoEntregado = 0;
            this.txtVuelto.setText('VUELTO: 0');
            // La caja se queda abierta para reintentar
        }
    }
}