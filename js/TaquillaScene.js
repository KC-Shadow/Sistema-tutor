class TaquillaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TaquillaScene' });
    }

    preload() {
        // UI y Escenario
        this.load.image('fondo_carpa_pepe', 'assets/taquilla/ui/fondo_carpa_pepe.jpg');
        this.load.image('mostrador', 'assets/taquilla/ui/mostrador.png');
        this.load.image('reg_cerrada', 'assets/taquilla/ui/registradora_cerrada.png');
        this.load.image('reg_abierta', 'assets/taquilla/ui/registradora_abierta.png');
        this.load.image('palanca', 'assets/taquilla/ui/palanca.png');
        this.load.image('palanca_2', 'assets/taquilla/ui/palanca_2.png');
        this.load.image('cartelera', 'assets/taquilla/ui/cartelera.png');
        this.load.image('cartelera_2', 'assets/taquilla/ui/cartelera_2.png');

        // Personajes
        this.load.image('pepe', 'assets/personajes_principales/pepe.png');
        this.load.image('cliente_bufalo', 'assets/taquilla/personajes/bufalo.png');
        this.load.image('cliente_buho', 'assets/taquilla/personajes/buho.png');
        this.load.image('cliente_cerdo', 'assets/taquilla/personajes/cerdo.png');
        this.load.image('cliente_cisne', 'assets/taquilla/personajes/cisne.png');
        this.load.image('cliente_conejo', 'assets/taquilla/personajes/conejo.png');
        this.load.image('cliente_hipopotamo', 'assets/taquilla/personajes/hipopotamo.png');
        this.load.image('cliente_jirafa', 'assets/taquilla/personajes/jirafa.png');
        this.load.image('cliente_mono', 'assets/taquilla/personajes/mono.png');
        this.load.image('cliente_morsa', 'assets/taquilla/personajes/morsa.png');
        this.load.image('cliente_oso', 'assets/taquilla/personajes/oso.png');
        this.load.image('cliente_pavo', 'assets/taquilla/personajes/pavo.png');
        this.load.image('cliente_perro', 'assets/taquilla/personajes/perro.png');
        this.load.image('cliente_pinguino', 'assets/taquilla/personajes/pinguino.png');
        this.load.image('cliente_raton', 'assets/taquilla/personajes/raton.png');
        this.load.image('cliente_tejon', 'assets/taquilla/personajes/tejon.png');
        this.load.image('cliente_zorro', 'assets/taquilla/personajes/zorro.png');
        
        // Monedas
        this.load.image('c1', 'assets/taquilla/monedas/moneda_1.png');
        this.load.image('c5', 'assets/taquilla/monedas/moneda_5.png');
        this.load.image('c10', 'assets/taquilla/monedas/moneda_10.png');

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

        // Audios Tutorial Pepe
        for (let i = 1; i <= 6; i++) {
            this.load.audio(`audio_pepe_${i}`, `assets/audios_tutor/audios_pepe/audio_${i}.mp3`);
        }
    }

    create() {
        // Fondo y Mostrador
        this.add.image(400, 300, 'fondo_carpa_pepe').setScale(0.8);
        this.add.image(10, -30, 'cartelera_2').setOrigin(0, 0).setScale(0.4);
        
        // Cartelera Derecha (Tiempo y Puntos)
        this.add.image(550, -30, 'cartelera').setOrigin(0, 0).setScale(0.4);
        this.txtVentas = this.add.text(600, 80, 'CLIENTES: 0/15', { fontFamily: 'Playbill', fontSize: '30px', fill: '#000000', fontWeight: 'bold' }).setAngle(-9);
        this.txtPuntos = this.add.text(600, 120, 'PUNTOS: 0', { fontFamily: 'Playbill', fontSize: '40px', fill: '#000000', fontWeight: 'bold' }).setAngle(-9);

        // Clientes
        this.cliente = this.add.image(390, 400, 'cliente_conejo').setScale(0.6).setAlpha(0);
        
        // Mostrador
        this.add.image(400, 525, 'mostrador');

        // Sonido de fondo
        this.musica = this.sound.add('musica_fondo', { loop: true, volume: 0.1 });
        this.musica.play();

        // Registradora y Palanca
        this.registradora = this.add.image(515, 350, 'reg_cerrada').setScale(1);
        this.palanca = this.add.image(620, 335, 'palanca').setScale(0.2).setInteractive({ useHandCursor: true });
        
        // Pantalla de la caja
        this.txtPantalla = this.add.text(570, 320, 'TOTAL: 0.00\nVUELTO: 0.00', { 
            fontFamily: 'Courier New', fontSize: '22px', fill: '#0f0', backgroundColor: '#000', align: 'right' 
        }).setOrigin(0.80);

        // Personajes
        this.pepe = this.add.image(100, 500, 'pepe').setScale(0.7);

        // Diálogo Cliente
        this.nubeCliente = this.add.image(150, 190, 'dialogo_2').setOrigin(0, 0).setScale(0.7).setAlpha(0);
        this.txtCliente = this.add.text(175, 215, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', align: 'center', wordWrap: { width: 140 } 
        }).setAlpha(0);

        // Tutorial y Diálogo
        this.nube = this.add.image(50, 150, 'dialogo').setOrigin(0, 0);
        this.txtPepe = this.add.text(80, 180, '', { 
            fontFamily: 'Courier New', fontSize: '18px', fill: '#000', wordWrap: { width: 230 } 
        });

        // Contenedores y Grupos
        this.grupoPagoMostrador = this.add.group();
        this.monedasVueltoContainer = this.add.container(0, 0).setAlpha(0);
        this.crearMonedasEnCaja();

        // Botón para volver al menú
        this.btnVolver = this.add.text(780, 580, 'Volver', { 
            fontFamily: 'Courier New', fontSize: '18px', fill: '#fff', backgroundColor: '#3d2622', padding: { x: 10, y: 5 } 
        })
        .setOrigin(1, 1)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.sound.stopAll(); // Detener música y tutoriales
            if (window.speechSynthesis) window.speechSynthesis.cancel(); // Detener voz del cliente si está hablando
            this.scene.start('MenuScene');
        });

        // Variables de lógica
        this.juegoActivo = false;
        this.vueltoEntregado = 0;
        this.puntos = 0;
        this.lastNinos = -1; // Para evitar ventas repetidas
        this.lastAdultos = -1; // Para evitar ventas repetidas
        this.ventasRealizadas = 0;
        this.maxVentas = 15;

        this.iniciarTutorial();
    }

    iniciarTutorial() {
        // Secuencia de diálogos del tutorial
        const dialogos = [
            '"¡Hola! Soy Pepe. Bienvenido a la taquilla. Tu misión es vender entradas para el circo."',
            '"Las tarifas son: 4 Bs para los NIÑOS y 7 Bs para los ADULTOS. ¡Memorízalo bien!"',
            '"Calcula el total y mira cuánto paga el cliente. Si sobra dinero, debes dar VUELTO."',
            '"Jala la PALANCA para abrir la caja y haz clic en las monedas para sumar el vuelto exacto."',
            '"Debes atender a 15 clientes. ¡Gana PUNTOS por cada venta correcta!"',
            '"Cuando termines, jala la PALANCA de nuevo para confirmar. (Haz clic para empezar)"'
        ];

        let pasoActual = 0;
        this.txtPepe.setText(dialogos[pasoActual]);

        // Reproducir primer audio
        this.audioTutorial = this.sound.add('audio_pepe_1', { volume: 1.0 });
        this.audioTutorial.play();

        // Animación de hablar (un solo brinco)
        const darBrinco = () => {
            this.pepe.y = 500;
            this.tweenPepe = this.tweens.add({
                targets: this.pepe,
                y: 490,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        // Bajar volumen de música de fondo durante el tutorial
        if (this.musica) this.musica.setVolume(0.05);

        // Botón de saltar
        const btnSaltar = this.add.text(200, 290, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#0c0b0b', fontWeight: 'bold' 
        }).setInteractive({ useHandCursor: true });

        const finalizarTutorial = () => {
            if (this.audioTutorial) this.audioTutorial.stop();

            // Detener animación de hablar
            if (this.tweenPepe) {
                this.tweenPepe.stop();
                this.pepe.y = 500;
            }

            // Restaurar volumen de música de fondo
            if (this.musica) this.musica.setVolume(0.1);

            this.input.off('pointerdown', avanzarDialogo);
            btnSaltar.destroy();
            this.tweens.add({
                targets: [this.pepe, this.nube, this.txtPepe],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.pepe.setVisible(false);
                    this.iniciarCuentaRegresiva();
                }
            });
        };

        btnSaltar.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            finalizarTutorial();
        });

        // Función para avanzar al siguiente texto
        const avanzarDialogo = () => {
            if (this.audioTutorial) this.audioTutorial.stop();
            pasoActual++;
            if (pasoActual < dialogos.length) {
                this.txtPepe.setText(dialogos[pasoActual]);
                this.audioTutorial = this.sound.add(`audio_pepe_${pasoActual + 1}`, { volume: 1.0 });
                this.audioTutorial.play();
                darBrinco();
            } else {
                finalizarTutorial();
            }
        };

        // Detectar clic en cualquier parte para avanzar
        this.input.on('pointerdown', avanzarDialogo);
    }

    iniciarCuentaRegresiva() {
        this.sound.play('cuenta_regresiva');
        let nums = ['n_003', 'n_002', 'n_001', 'go'];
        nums.forEach((n, i) => {
            this.time.delayedCall(i * 1000, () => {
                let img = this.add.image(400, 300, n).setScale(0.8);
                this.tweens.add({ targets: img, alpha: 0, duration: 800, onComplete: () => img.destroy() });
                if(n === 'go') {
                    this.nuevaVenta();
                }
            });
        });
    }

    nuevaVenta() {
        this.juegoActivo = true;
        this.vueltoEntregado = 0;
        this.registradora.setTexture('reg_cerrada');
        this.monedasVueltoContainer.setAlpha(0);
        this.grupoPagoMostrador.clear(true, true);

        // Lógica de Doble Tarifa para evitar pago completo
        const combinacionesEvitar = [
            { n: 5, a: 0 },
            { n: 4, a: 2 },
            { n: 3, a: 4 },
            { n: 2, a: 6 },
            { n: 1, a: 8 },
            { n: 10, a: 0 },
            { n: 0, a: 10 }
        ];

        let ninos, adultos;
        let esInvalida = false;
        do {
            ninos = Phaser.Math.Between(0, 3);
            adultos = Phaser.Math.Between(1, 4);
            esInvalida = combinacionesEvitar.some(c => c.n === ninos && c.a === adultos);
        } while ((ninos === this.lastNinos && adultos === this.lastAdultos) || esInvalida);

        this.lastNinos = ninos;
        this.lastAdultos = adultos;

        // Actualizar diálogo del cliente
        let txtAdultos = (adultos === 1) ? 'entrada' : 'entradas';
        let msg = `Hola, quiero ${adultos} ${txtAdultos} de adulto`;
        if (ninos > 0) {
            let txtNinos = (ninos === 1) ? 'entrada' : 'entradas';
            msg += ` y ${ninos} ${txtNinos} de niño`;
        }
        msg += ".";
        this.txtCliente.setText(msg).setAlpha(1);
        this.nubeCliente.setAlpha(1);

        this.montoTotal = (ninos * 4) + (adultos * 7);
        
        // Determinar pago del cliente (siempre mayor al monto total para asegurar vuelto)
        const tipoPago = Phaser.Math.Between(1, 2);
        if (tipoPago === 1) {
            // Pago redondeado al siguiente múltiplo de 5 (estrictamente mayor)
            this.pagoCliente = Math.ceil((this.montoTotal + 1) / 5) * 5;
        } else {
            // Pago redondeado al siguiente múltiplo de 10 (estrictamente mayor)
            this.pagoCliente = Math.ceil((this.montoTotal + 1) / 10) * 10;
        }
        
        this.vueltoCorrecto = this.pagoCliente - this.montoTotal;

        this.txtPantalla.setText(`TOTAL: ${this.montoTotal}.00\nVUELTO: 0.00`);
        
        // Seleccionar cliente aleatorio
        const listaClientes = ['bufalo', 'buho', 'cerdo', 'cisne', 'conejo', 'hipopotamo', 'jirafa', 'mono', 'morsa', 'oso', 'pavo', 'perro', 'pinguino', 'raton', 'tejon', 'zorro'];
        const clienteSeleccionado = Phaser.Utils.Array.GetRandom(listaClientes);
        this.cliente.setTexture(`cliente_${clienteSeleccionado}`).setAlpha(1);
        
        // TEXT-TO-SPEECH
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel(); 
            const voz = new SpeechSynthesisUtterance(msg);
            voz.volume = 1; 
            voz.lang = 'es-VE'; 

            // Ajustar tono 
            const animalesGraves = ['bufalo', 'hipopotamo', 'oso', 'morsa', 'cerdo', 'tejon'];
            const animalesAgudos = ['raton', 'conejo', 'pinguino', 'cisne', 'pavo', 'buho'];

            if (animalesGraves.includes(clienteSeleccionado)) {
                voz.pitch = 0.6; 
                voz.rate = 0.9; 
            } else if (animalesAgudos.includes(clienteSeleccionado)) {
                voz.pitch = 1.4; 
                voz.rate = 1.1; 
            }
            window.speechSynthesis.speak(voz);
        }

        this.mostrarPagoEnMostrador(this.pagoCliente);
        
        // Activar palanca para abrir
        this.palanca.removeAllListeners('pointerdown');
        this.palanca.on('pointerdown', () => this.abrirCaja());
    }

    mostrarPagoEnMostrador(monto) {
        let monedas = [];
        let temp = monto;
        while(temp > 0) {
            let valor = temp >= 10 ? 10 : (temp >= 5 ? 5 : 1);
            monedas.push(valor);
            temp -= valor;
        }

        const tamanoMoneda = 50; 
        const limiteIzquierdo = 220; // Inicio en el escritorio
        const limiteDerecho = 480;   // Límite antes de tocar la registradora
        
        let paso = 55;
        if (limiteIzquierdo + (monedas.length * paso) > limiteDerecho) {
            paso = (limiteDerecho - limiteIzquierdo - tamanoMoneda) / Math.max(1, monedas.length - 1);
        }

        let x = limiteIzquierdo;
        monedas.forEach(valor => {
            let moneda = this.add.image(x, 430, `c${valor}`).setDisplaySize(tamanoMoneda, tamanoMoneda);
            this.grupoPagoMostrador.add(moneda);
            x += paso;
        });
    }

    crearMonedasEnCaja() {
        [1, 5, 10].forEach((valor, i) => {
            let escala = (valor === 10) ? 0.020 : 0.07;
            let m = this.add.image(475 + (i * 40), 415, `c${valor}`).setScale(escala).setInteractive({ useHandCursor: true });
            m.on('pointerdown', () => {
                if(this.registradora.texture.key === 'reg_abierta') {
                    this.vueltoEntregado += valor;
                    this.txtPantalla.setText(`TOTAL: ${this.montoTotal}.00\nVUELTO: ${this.vueltoEntregado}.00`);
                }
            });
            this.monedasVueltoContainer.add(m);
        });
    }

    abrirCaja() {
        this.sound.play('caja_registradora');
        this.registradora.setTexture('reg_abierta');
        this.palanca.setTexture('palanca_2');
        this.palanca.y = 400;
        this.monedasVueltoContainer.setAlpha(1);
        this.txtPantalla.setText(`TOTAL: ${this.montoTotal}.00\nVUELTO: 0.00`);
        
        // Al volver a pulsar la palanca se valida
        this.palanca.removeAllListeners('pointerdown');
        this.palanca.on('pointerdown', () => this.validarOperacion());
    }

    validarOperacion() {
        this.sound.play('caja_registradora');
        
        this.palanca.setTexture('palanca');
        this.palanca.y = 320;

        if (this.vueltoEntregado === this.vueltoCorrecto) {
            this.sound.play('ganar');
            this.puntos += 10;
            this.txtPuntos.setText('PUNTOS: ' + this.puntos);
        } else {
            this.sound.play('error');
            this.cameras.main.shake(200, 0.01);
        }
        
        this.ventasRealizadas++;
        this.txtVentas.setText(`CLIENTES: ${this.ventasRealizadas}/${this.maxVentas}`);

        // Ocultar las monedas ANTES de que la caja se cierre visualmente
        this.monedasVueltoContainer.setAlpha(0); 
        this.grupoPagoMostrador.clear(true, true); 

        if (this.ventasRealizadas >= this.maxVentas) {
            this.time.delayedCall(1000, () => this.finDelJuego());
        } else {
            this.registradora.setTexture('reg_cerrada');
            this.time.delayedCall(1000, () => this.nuevaVenta());
        }
    }

    finDelJuego() {
        this.juegoActivo = false;
        this.btnVolver.setVisible(false);

        // Ocultar elementos de juego
        this.cliente.setAlpha(0);
        this.nubeCliente.setAlpha(0);
        this.txtCliente.setAlpha(0);

        // Pantalla de fin de juego
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(400, 250, '¡FIN DEL JUEGO!', { fontFamily: 'Courier New', fontSize: '56px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 350, `Puntuación Final: ${this.puntos}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#d4a373' }).setOrigin(0.5);

        const btnVolverMenu = this.add.text(400, 480, 'Volver al Menú', { 
            fontFamily: 'Courier New', fontSize: '24px', fill: '#fff', backgroundColor: '#3d2622', padding: 10 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnVolverMenu.on('pointerdown', () => {
            this.sound.stopAll();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            this.scene.start('MenuScene');
        });
    }
}