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
        this.load.audio('aplausos', 'assets/music/aplausos.mp3');

        // Imágenes del tutorial de restar
        for (let i = 1; i <= 6; i++) {
            this.load.image(`restar${i}`, `assets/tutoria/restar/restar${i}.png`);
        }

        // Audios de tutor (Pepe)
        for (let i = 1; i <= 6; i++) {
            this.load.audio(`pepe_audio_00${i}`, `assets/audios_tutor/pepe_audios/bienvenida/audio_00${i}.wav`);
        }
        for (let i = 1; i <= 12; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.audio(`tutoria_restar_${numStr}`, `assets/audios_tutor/pepe_audios/tutoria_restar/tutoria_restar_${numStr}.wav`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`pepe_ap_00${i}`, `assets/audios_tutor/pepe_audios/afirmaciones/positivas/ap_00${i}.wav`);
            this.load.audio(`pepe_an_00${i}`, `assets/audios_tutor/pepe_audios/afirmaciones/negativas/an_00${i}.wav`);
        }
    }

    create() {
        // Fondo y Mostrador
        this.fondo = this.add.image(400, 300, 'fondo_carpa_pepe').setScale(0.8);
        this.cartelera_2 = this.add.image(10, -30, 'cartelera_2').setOrigin(0, 0).setScale(0.4);
        
        // Cartelera Derecha (Tiempo y Puntos)
        this.cartelera = this.add.image(550, -30, 'cartelera').setOrigin(0, 0).setScale(0.4);
        this.txtVentas = this.add.text(600, 80, 'RONDAS: 1/6', { fontFamily: 'Playbill', fontSize: '30px', fill: '#000000', fontWeight: 'bold' }).setAngle(-9);
        this.txtPuntos = this.add.text(600, 120, 'PUNTOS: 0', { fontFamily: 'Playbill', fontSize: '40px', fill: '#000000', fontWeight: 'bold' }).setAngle(-9);

        // Clientes
        this.cliente = this.add.image(390, 400, 'cliente_conejo').setScale(0.6).setAlpha(0);
        
        // Mostrador
        this.mostrador = this.add.image(400, 525, 'mostrador');

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
        this.txtCliente = this.add.text(175, 225, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', align: 'center', wordWrap: { width: 140 } 
        }).setAlpha(0);

        // Tutorial y Diálogo
        this.nube = this.add.image(50, 150, 'dialogo').setOrigin(0, 0);
        this.txtPepe = this.add.text(80, 190, '', { 
            fontFamily: 'Courier New', fontSize: '18px', fill: '#000', wordWrap: { width: 230 } 
        });

        // Contenedores y Grupos
        this.grupoPagoMostrador = this.add.group();
        this.monedasVueltoContainer = this.add.container(0, 0).setAlpha(0);
        this.crearMonedasEnCaja();

        // Variables de lógica
        this.juegoActivo = false;
        this.vueltoEntregado = 0;
        this.puntos = 0;
        this.lastNinos = -1; // Para evitar ventas repetidas
        this.lastAdultos = -1; // Para evitar ventas repetidas
        this.ventasRealizadas = 0;
        this.maxVentas = 6;

        this.iniciarTutorialResta();
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
        if (this.cartelera_2) this.cartelera_2.setAlpha(alpha);
        if (this.cartelera) this.cartelera.setAlpha(alpha);
        if (this.txtVentas) this.txtVentas.setAlpha(alpha);
        if (this.txtPuntos) this.txtPuntos.setAlpha(alpha);
        if (this.mostrador) this.mostrador.setAlpha(alpha);
        if (this.registradora) this.registradora.setAlpha(alpha);
        if (this.palanca) this.palanca.setAlpha(alpha);
        if (this.txtPantalla) this.txtPantalla.setAlpha(alpha);
    }

    iniciarTutorialResta() {
        this.opacarJuego(true);
        this.nube.setVisible(true);
        this.txtPepe.setVisible(true);
        this.pepe.setVisible(true);

        const tutorialResta = [
            { imagen: 'restar1', texto: "¡Hola, amiguito! Soy Pepe. Hoy te enseñaré cómo restar prestando de una forma muy sencilla.", audio: 'tutoria_restar_001' },
            { imagen: 'restar1', texto: "Imagina que un cliente viene a la taquilla y me toca resolver esta operación: 62 menos 38.", audio: 'tutoria_restar_002' },
            { imagen: 'restar2', texto: "Para no equivocarnos con el dinero, organizamos los números en columnas.", audio: 'tutoria_restar_003' },
            { imagen: 'restar2', texto: "Las Unidades van a la derecha en color azul, y las Decenas a la izquierda en color rojo.", audio: 'tutoria_restar_004' },
            { imagen: 'restar3', texto: "¡Siempre empezamos por la columna de las unidades! En el recuadro amarillo vemos que a 2 debemos quitarle 8.", audio: 'tutoria_restar_005' },
            { imagen: 'restar3', texto: "Pero ¡ay, caramba!, el 2 es menor que el 8 y no le alcanza. Así que el 2 le pide ayuda a su vecino, el 6.", audio: 'tutoria_restar_006' },
            { imagen: 'restar4', texto: "El 6, que es un buen vecino, le presta una decena al 2. Al colocarle ese 1 al lado, el 2 se transforma en un poderoso 12.", audio: 'tutoria_restar_007' },
            { imagen: 'restar4', texto: "Ahora sí podemos restar en el recuadro amarillo: ¡12 menos 8 nos da 4!", audio: 'tutoria_restar_008' },
            { imagen: 'restar5', texto: "¡Ahora vamos con la columna de las decenas! Como el 6 prestó una, ya no es un 6, ¡ahora es un 5!", audio: 'tutoria_restar_009' },
            { imagen: 'restar5', texto: "En el recuadro amarillo restamos las decenas que nos quedan: 5 menos 3, lo que nos da 2.", audio: 'tutoria_restar_010' },
            { imagen: 'restar6', texto: "¡Y listo! Al juntar las decenas y las unidades descubrimos el resultado final: ¡24!", audio: 'tutoria_restar_011' },
            { imagen: 'restar6', texto: "¡Ya aprendiste a restar prestando! Prepárate para calcular los vueltos y ganarle al reloj en la taquilla.", audio: 'tutoria_restar_012' }
        ];

        let paso = 0;
        this.txtPepe.setStyle({ fontSize: '16px', fill: '#000', wordWrap: { width: 230 } });
        this.txtPepe.setText(tutorialResta[paso].texto);
        this.reproducirAudioTutor(tutorialResta[paso].audio);

        if (this.musica) this.musica.setVolume(0.05);

        // Desplazamiento más hacia la derecha (650px)
        let pathResta = new Phaser.Curves.Path(400, 750);
        pathResta.quadraticBezierTo(525, 270, 650, 270); 

        this.imgResta = this.add.follower(pathResta, 400, 750, tutorialResta[paso].imagen).setDisplaySize(400, 300).setDepth(5);
        
        const animarImagen = () => {
            this.imgResta.setPosition(400, 750);
            this.imgResta.startFollow({
                duration: 800,
                ease: 'Sine.easeOut'
            });
        };
        animarImagen();

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

        const txtAvanzar = this.add.text(400, 560, '(Presiona la pantalla para avanzar)', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5);

        const finalizarTutorialResta = () => {
            if (this.audioTutor) this.audioTutor.stop();
            if (this.tweenPepe) {
                this.tweenPepe.stop();
                this.pepe.y = 500;
            }
            
            this.input.off('pointerdown', avanzar);
            txtAvanzar.destroy();
            if (this.imgResta) this.imgResta.destroy();
            
            this.txtPepe.setStyle({ fontSize: '18px', fill: '#000', wordWrap: { width: 230 } });
            this.txtPepe.setText('');
            
            this.iniciarTutorial();
        };

        const avanzar = () => {
            if (this.audioTutor) this.audioTutor.stop();
            paso++;
            if (paso < tutorialResta.length) {
                this.txtPepe.setText(tutorialResta[paso].texto);
                this.imgResta.setTexture(tutorialResta[paso].imagen);
                this.imgResta.setDisplaySize(400, 300);
                this.reproducirAudioTutor(tutorialResta[paso].audio);
                animarImagen();
                darBrinco();
            } else {
                finalizarTutorialResta();
            }
        };

        this.input.on('pointerdown', avanzar);
    }

    iniciarTutorial() {
        // Secuencia de diálogos del tutorial
        const dialogos = [
            { texto: '"Bienvenido a la taquilla. Tu misión es vender entradas para el circo."', audio: 'pepe_audio_001' },
            { texto: '"Las tarifas son: 4 Bs para los NIÑOS y 7 Bs para los ADULTOS. ¡Memorízalo bien!"', audio: 'pepe_audio_002' },
            { texto: '"Calcula el total y mira cuánto paga el cliente. Si sobra dinero, debes dar VUELTO."', audio: 'pepe_audio_003' },
            { texto: '"Jala la PALANCA para abrir la caja y haz clic en las monedas para sumar el vuelto exacto."', audio: 'pepe_audio_004' },
            { texto: '"Debes atender a 6 clientes. ¡Gana PUNTOS por cada venta correcta!"', audio: 'pepe_audio_005' },
            { texto: '"Cuando termines, jala la PALANCA de nuevo para confirmar. (Haz clic para empezar)"', audio: 'pepe_audio_006' }
        ];

        let pasoActual = 0;
        this.txtPepe.setText(dialogos[pasoActual].texto);
        this.reproducirAudioTutor(dialogos[pasoActual].audio);

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

        const finalizarTutorial = () => {
            if (this.audioTutor) this.audioTutor.stop();
            // Detener animación de hablar
            if (this.tweenPepe) {
                this.tweenPepe.stop();
                this.pepe.y = 500;
            }

            // Restaurar volumen de música de fondo
            if (this.musica) this.musica.setVolume(0.1);

            this.input.off('pointerdown', avanzarDialogo);
            this.tweens.add({
                targets: [this.pepe, this.nube, this.txtPepe],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.pepe.setVisible(false);
                    this.opacarJuego(false);
                    this.iniciarCuentaRegresiva();
                }
            });
        };

        // Función para avanzar al siguiente texto
        const avanzarDialogo = () => {
            if (this.audioTutor) this.audioTutor.stop();
            pasoActual++;
            if (pasoActual < dialogos.length) {
                this.txtPepe.setText(dialogos[pasoActual].texto);
                this.reproducirAudioTutor(dialogos[pasoActual].audio);
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
        
        this.nube.setVisible(false);
        this.txtPepe.setVisible(false);

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
        const animalesGraves = ['bufalo', 'hipopotamo', 'oso', 'morsa', 'cerdo', 'tejon'];
        let charVoice = animalesGraves.includes(clienteSeleccionado) ? 'ClienteGrave' : 'ClienteAgudo';
        window.TTSManager.speak(msg, charVoice);

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

        // Botón Borrar Vuelto (Agregado al mismo contenedor para que solo se vea con la caja abierta)
        this.btnBorrar = this.add.text(515, 450, 'BORRAR', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#ffffff', backgroundColor: '#3b1d09', fontStyle: 'bold', padding: { x: 8, y: 4 } 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.btnBorrar.on('pointerdown', () => {
            if (this.registradora.texture.key === 'reg_abierta') {
                this.vueltoEntregado = 0;
                this.txtPantalla.setText(`TOTAL: ${this.montoTotal}.00\nVUELTO: 0.00`);
            }
        });
        this.monedasVueltoContainer.add(this.btnBorrar);
    }

    abrirCaja() {
        this.sound.play('caja_registradora');
        this.registradora.setTexture('reg_abierta');
        this.palanca.setTexture('palanca_2');
        this.palanca.y = 400;
        this.monedasVueltoContainer.setAlpha(1);
        this.txtPantalla.setText(`TOTAL: ${this.montoTotal}.00\nVUELTO: 0.00`);
        
        this.rondaStartTime = this.time.now; // Iniciar cronómetro de respuesta
        // Al volver a pulsar la palanca se valida
        this.palanca.removeAllListeners('pointerdown');
        this.palanca.on('pointerdown', () => this.validarOperacion());
    }

    validarOperacion() {
        this.sound.play('caja_registradora');
        
        this.palanca.setTexture('palanca');
        this.palanca.y = 320;

        let esCorrecto = (this.vueltoEntregado === this.vueltoCorrecto);
        let timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        // Registrar Interacción en BKT y RL
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'TaquillaScene', 'Resta Monetaria', 'Dificultad_Normal', 
                esCorrecto, this.vueltoEntregado, timeElapsed,
                `${this.pagoCliente} - ${this.montoTotal}`, this.vueltoCorrecto,
                this.ventasRealizadas + 1
            );
        }

        const frasesPositivas = [
            { texto: '¡Excelente!', audio: 'pepe_ap_001' },
            { texto: '¡Eres muy inteligente!', audio: 'pepe_ap_002' },
            { texto: '¡Buen trabajo, campeón!', audio: 'pepe_ap_003' },
            { texto: '¡Buenísima esa, campeón!', audio: 'pepe_ap_004' },
            { texto: '¡Lo estás logrando!', audio: 'pepe_ap_005' }
        ];
        const frasesNegativas = [
            { texto: '¡Oh no, perdiste!', audio: 'pepe_an_001' },
            { texto: 'Inténtalo de nuevo', audio: 'pepe_an_002' },
            { texto: 'Esa no era', audio: 'pepe_an_003' },
            { texto: 'Casi lo logras', audio: 'pepe_an_004' },
            { texto: 'Casi, intenta otra vez', audio: 'pepe_an_005' }
        ];

        if (this.audioTutor) this.audioTutor.stop();

        this.nube.setVisible(true);
        this.txtPepe.setVisible(true);

        if (esCorrecto) {
            this.sound.play('ganar', { volume: 0.3 });
            this.puntos += 10;
            this.txtPuntos.setText('PUNTOS: ' + this.puntos);
            
            let frase = Phaser.Utils.Array.GetRandom(frasesPositivas);
            this.txtPepe.setText(frase.texto);
            this.reproducirAudioTutor(frase.audio);
            this.txtPepe.setStyle({ fontSize: '18px', fill: 'rgb(21, 0, 255)', wordWrap: { width: 230 } });
        } else {
            this.sound.play('error', { volume: 0.3 });
            this.cameras.main.shake(200, 0.01);
            let frase = Phaser.Utils.Array.GetRandom(frasesNegativas);
            this.txtPepe.setText(frase.texto);
            this.reproducirAudioTutor(frase.audio);
            this.txtPepe.setStyle({ fontSize: '18px', fill: '#f00', wordWrap: { width: 230 } });
        }
        
        this.ventasRealizadas++;
        let rondaMostrada = this.ventasRealizadas < this.maxVentas ? this.ventasRealizadas + 1 : this.maxVentas;
        this.txtVentas.setText(`RONDAS: ${rondaMostrada}/${this.maxVentas}`);

        // Ocultar las monedas ANTES de que la caja se cierre visualmente
        this.monedasVueltoContainer.setAlpha(0); 
        this.grupoPagoMostrador.clear(true, true); 

        if (this.ventasRealizadas >= this.maxVentas) {
            this.time.delayedCall(1500, () => this.finDelJuego());
        } else {
            this.registradora.setTexture('reg_cerrada');
            this.time.delayedCall(1500, () => this.nuevaVenta());
        }
    }

    finDelJuego() {
        this.juegoActivo = false;

        this.sound.play('aplausos', { volume: 0.5 });

        // Ocultar elementos de juego
        this.cliente.setAlpha(0);
        this.nubeCliente.setAlpha(0);
        this.txtCliente.setAlpha(0);

        // Pantalla de fin de juego
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(400, 250, '¡FIN DEL JUEGO!', { fontFamily: 'Courier New', fontSize: '56px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 350, `Puntuación Final: ${this.puntos}`, { fontFamily: 'Courier New', fontSize: '32px', fill: '#d4a373' }).setOrigin(0.5);

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