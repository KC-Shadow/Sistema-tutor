class PoligonoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PoligonoScene' }); // Clave vinculada en main.js
    }

    init() {
        // Variables de Control
        this.puntuacion = 0;
        this.juegoActivo = false;
        this.sumaActual = { a: 0, b: 0, resultado: 0 };
        this.rondaActiva = false;
        
        // Sistema de Munición
        this.balasMaximas = 6; // Límite de 6 rondas de tiros
        this.balasRestantes = this.balasMaximas;

        // Grupos y Listas
        this.figurasGroup = null; 
    }

    preload() {
        // Carga de Personajes 
        this.load.image('diana_p', 'assets/personajes_principales/diana.png');

        // UI
        this.load.image('nube_p', 'assets/extra/dialogo_2.png');
        this.load.image('galeria_p', 'assets/poligono/ui/galeria.png');
        this.load.image('fondo_p', 'assets/poligono/ui/fondo_poligono.jpg');
        this.load.image('arma_p', 'assets/poligono/ui/arma.png');
        this.load.image('bala_p', 'assets/poligono/ui/bala.png');

        // Cuenta Regresiva
        this.load.image('go', 'assets/extra/n_004.png');
        this.load.image('n_003', 'assets/extra/n_003.png');
        this.load.image('n_002', 'assets/extra/n_002.png');
        this.load.image('n_001', 'assets/extra/n_001.png');
        this.load.audio('cuenta_regresiva', 'assets/music/cuenta_regresiva.mp3');
        
        // Música y Sonidos
        this.load.audio('musica_poligono', 'assets/music/circus_game3.mp3');
        this.load.audio('boom', 'assets/music/boom.mp3');
        this.load.audio('ganar_p', 'assets/music/win.mp3');
        this.load.audio('error_p', 'assets/music/error.mp3');

        // Cartelera
        this.load.image('cartelera', 'assets/extra/cartelera.png');

        // Dianas Pequeñas (0 al 100)
        for (let i = 0; i <= 100; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image(`dp_${numStr}`, `assets/poligono/diana_pequena/dp_${numStr}.png`);
        }

        // Imágenes del tutorial de sumar
        for (let i = 1; i <= 6; i++) {
            this.load.image(`sumar${i}`, `assets/tutoria/sumar/sumar${i}.png`);
        }
    }

    create() {
        // UI
        this.add.image(400, 250, 'fondo_p').setScale(1);
        this.add.image(350, 290, 'galeria_p').setScale(0.90); // Escala aumentada a 0.90

        // Diana y Nube de Diálogo
        this.diana = this.add.image(730, 500, 'diana_p').setScale(0.35);
        this.dialogo = this.add.image(660, 340, 'nube_p').setScale(0.75);
        this.txtInstruccion = this.add.text(660, 325, '', { fontFamily: 'Courier New', fontSize: '18px', fill: '#0f0', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

        // Grupo de Figuras
        this.figurasGroup = this.physics.add.group();

        // El Arma
        this.arma = this.physics.add.sprite(100, 550, 'arma_p').setScale(0.6).setOrigin(0.5, 0.5);

        // Cartelera
        this.add.image(690, 90, 'cartelera').setScale(0.4).setDepth(10);

        // Interfaz de Usuario
        this.txtBalas = this.add.text(670, 90, `TIROS: ${this.balasRestantes}`, { fontFamily: 'Playbill', fontSize: '36px', fill: '#000000' }).setOrigin(0.5).setAngle(-9).setDepth(10);
        this.txtPuntos = this.add.text(670, 130, 'PUNTOS: 0', { fontFamily: 'Playbill', fontSize: '36px', fill: '#000000' }).setOrigin(0.5).setAngle(-9).setDepth(10);

        // Botón Volver
        this.btnVolver = this.add.text(100, 570, 'MENÚ', { fontFamily: 'Courier New', fontSize: '16px', fill: '#fff', backgroundColor: '#3d2622', padding: 5 }).setInteractive({ useHandCursor: true });
        this.btnVolver.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation(); // Evita avanzar el tutorial al hacer clic en menú
            this.sound.stopAll();
            window.TTSManager.stop();
            this.scene.start('MenuScene');
        });

        // Música de fondo
        this.musica = this.sound.add('musica_poligono', { loop: true, volume: 0.3 });
        this.musica.play();

        // Eventos de Entrada
        this.input.on('pointerdown', this.disparar, this);

        // Iniciar Tutorial de Suma primero
        this.iniciarTutorialSuma();
    }

    iniciarTutorialSuma() {
        this.dialogo.setVisible(true);
        this.txtInstruccion.setVisible(true);

        const tutorialSuma = [
            { imagen: 'sumar1', texto: "¡Hola! Soy Diana. Hoy te enseñaré a resolver sumas de dos cifras con llevadas. ¡Es súper fácil! Mira este reto: queremos sumar 23 más 67." },
            { imagen: 'sumar2', texto: "Para no confundirnos, primero ordenamos los números en columnas: las Unidades van en la columna azul a la derecha, y las Decenas en la columna roja a la izquierda." },
            { imagen: 'sumar3', texto: "¡Siempre empezamos a sumar por la columna de las unidades! Fíjate en el recuadro amarillo: debemos calcular cuánto es 3 más 7." },
            { imagen: 'sumar4', texto: "Al sumar 3 más 7 nos da 10. Como 10 no cabe entero ahí abajo, colocamos el cero en las unidades y 'llevamos' el 1 verde arriba de la columna de las decenas." },
            { imagen: 'sumar5', texto: "Ahora sumamos la columna de las decenas. No olvides el 1 que llevamos: sumamos 1 más 2, que da 3... y 3 más 6, ¡nos da 9!" },
            { imagen: 'sumar6', texto: "¡Y listo! Al juntar las decenas y las unidades, nuestro resultado final es 90. ¡Ahora estás preparado para apuntar y disparar a las dianas correctas en el juego!" }
        ];

        let paso = 0;
        this.txtInstruccion.setStyle({ fontSize: '12px', fill: '#000', wordWrap: { width: 170 } });
        this.txtInstruccion.setText(tutorialSuma[paso].texto);

        // Bajar volumen de la música
        if (this.musica) this.musica.setVolume(0.1);

        // Crear la imagen para el tutorial (animación de arco de 90 grados desde la esquina inferior izquierda)
        let path = new Phaser.Curves.Path(50, 700);
        path.quadraticBezierTo(260, 340, 50, 340); // Termina al centro (260, 340), punto de control en (50, 340) para formar el arco

        this.imgSuma = this.add.follower(path, 50, 750, tutorialSuma[paso].imagen).setDisplaySize(400, 300).setDepth(5);
        this.imgSuma.startFollow({
            duration: 1000,
            ease: 'Sine.easeOut'
        });

        const darBrinco = () => {
            this.diana.y = 500;
            this.tweenDiana = this.tweens.add({
                targets: this.diana,
                y: 490,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        // Instrucción para avanzar
        const txtAvanzar = this.add.text(400, 560, '(Presiona la pantalla para avanzar)', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#fff', backgroundColor: '#000', padding: 5 
        }).setOrigin(0.5);

        // Botón Saltar
        const btnSaltar = this.add.text(760, 360, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#333', fontStyle: 'bold' 
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        const finalizarTutorialSuma = () => {
            if (this.tweenDiana) {
                this.tweenDiana.stop();
                this.diana.y = 500;
            }
            window.TTSManager.stop();
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            txtAvanzar.destroy();
            if (this.imgSuma) this.imgSuma.destroy();
            
            // Iniciar el tutorial del juego original
            this.iniciarTutorial();
        };

        const avanzar = () => {
            window.TTSManager.stop();
            paso++;
            if (paso < tutorialSuma.length) {
                this.txtInstruccion.setText(tutorialSuma[paso].texto);
                this.imgSuma.setTexture(tutorialSuma[paso].imagen);
                this.imgSuma.setDisplaySize(400, 300); // Forzar el mismo tamaño para la nueva imagen
                darBrinco();
                window.TTSManager.speak(tutorialSuma[paso].texto, 'Diana');
            } else {
                finalizarTutorialSuma();
            }
        };

        window.TTSManager.speak(tutorialSuma[paso].texto, 'Diana');

        btnSaltar.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            finalizarTutorialSuma();
        });

        this.input.on('pointerdown', avanzar);
    }

    iniciarTutorial() {
        this.dialogo.setVisible(true);
        this.txtInstruccion.setVisible(true);

        const frases = [
            "Bienvenido al Polígono de Tiro.",
            "Tu objetivo es disparar a la diana con la respuesta correcta.",
            "Yo te mostraré una suma.",
            "Apunta con tu ratón y haz clic para disparar el arma.",
            "¡Tienes 6 tiros, consigue la mayor puntuación!"
        ];

        let paso = 0;
        this.txtInstruccion.setStyle({ fontSize: '14px', fill: '#000', wordWrap: { width: 160 } });
        this.txtInstruccion.setText(frases[paso]);

        // Bajar volumen de la música de fondo durante el tutorial
        if (this.musica) this.musica.setVolume(0.1);

        window.TTSManager.speak(frases[paso], 'Diana');

        const darBrinco = () => {
            this.diana.y = 500;
            this.tweenDiana = this.tweens.add({
                targets: this.diana,
                y: 490,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        // Botón Saltar
        const btnSaltar = this.add.text(760, 360, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '14px', fill: '#333', fontStyle: 'bold' 
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        const finalizarTutorial = () => {
            window.TTSManager.stop();
            // Restaurar la música
            if (this.musica) this.musica.setVolume(0.3); 

            if (this.tweenDiana) {
                this.tweenDiana.stop();
                this.diana.y = 500;
            }
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            
            // Restaurar estilo original de la instrucción para el juego
            this.txtInstruccion.setStyle({ fontSize: '22px', fill: '#0f0', wordWrap: null });
            this.txtInstruccion.setText('');
            
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            window.TTSManager.stop();
            paso++;
            if (paso < frases.length) {
                this.txtInstruccion.setText(frases[paso]);
                window.TTSManager.speak(frases[paso], 'Diana');
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
                    this.juegoActivo = true;
                    this.iniciarNuevaRonda();
                }
            });
        });
    }

    update() {
        // Rotación del arma hacia el cursor del mouse
        let angulo = Phaser.Math.Angle.Between(this.arma.x, this.arma.y, this.input.x, this.input.y);
        this.arma.rotation = angulo + Math.PI / 2;

        if (!this.juegoActivo) return;

        // Envolver (wrap) las figuras al llegar a la pared izquierda hacia la derecha
        this.figurasGroup.getChildren().forEach(figura => {
            if (figura.x < 140) { // Límite de la pared izquierda ajustado al nuevo tamaño
                figura.x += 420;  // Salto exacto al límite derecho (140 + 420 = 560) para mantener la distancia perfecta
            }
        });
    }

    iniciarNuevaRonda() {
        if (this.balasRestantes <= 0) {
            this.finalizarJuego();
            return;
        }

        this.rondaActiva = true;
        this.figurasGroup.clear(true, true);

        // Generar suma asegurando que no se repita la anterior
        let nuevoA, nuevoB;
        do {
            nuevoA = Phaser.Math.Between(0, 100);
            nuevoB = Phaser.Math.Between(0, 100 - nuevoA);
        } while (nuevoA === this.sumaActual.a && nuevoB === this.sumaActual.b);

        this.sumaActual.a = nuevoA;
        this.sumaActual.b = nuevoB;
        this.sumaActual.resultado = this.sumaActual.a + this.sumaActual.b;

        this.txtInstruccion.setText(`¿Cuánto es\n${this.sumaActual.a} + ${this.sumaActual.b}?`);
        this.txtInstruccion.setColor('#000000');

        // Reproducir la instrucción por voz (Text-to-Speech)
        if (this.musica) this.musica.setVolume(0.1); 
        const texto = `¿Cuánto es ${this.sumaActual.a} más ${this.sumaActual.b}?`;
        window.TTSManager.speak(texto, 'Diana', () => {
            if (this.musica && this.juegoActivo) this.musica.setVolume(0.3); // Restaurar música
        });

        this.rondaStartTime = this.time.now; // Iniciar cronómetro
        this.crearObjetivosEnMovimiento();
    }

    crearObjetivosEnMovimiento() {
        let seleccion = [this.sumaActual.resultado];
        
        // Necesitamos 9 dianas (3 filas x 3 columnas) para llenar la galería
        while (seleccion.length < 9) {
            let aleatorio = Phaser.Math.Between(0, 100);
            if (!seleccion.includes(aleatorio)) seleccion.push(aleatorio);
        }

        Phaser.Utils.Array.Shuffle(seleccion);

        const filasY = [210, 280, 350]; // Alturas de las 3 filas más separadas
        const columnasX = [210, 350, 490]; // Centradas en la galería (X=350) con mayor separación horizontal

        let i = 0;
        filasY.forEach(y => {
            columnasX.forEach(x => {
                let valor = seleccion[i];
                let numStr = valor.toString().padStart(3, '0');
                let fig = this.figurasGroup.create(x, y, `dp_${numStr}`).setScale(0.5);
                
                fig.setData('valor', valor);
                fig.setVelocity(-100, 0); // Velocidad constante para que nunca se superpongan
                
                i++;
            });
        });
    }

    disparar(pointer) {
        if (!this.juegoActivo || !this.rondaActiva || this.balasRestantes <= 0) return;

        this.balasRestantes--;
        this.txtBalas.setText(`TIROS: ${this.balasRestantes}`);

        // Detener la voz si el jugador dispara rápido y restaurar la música
        window.TTSManager.stop();
        if (this.musica) this.musica.setVolume(0.3);

        // Crear bala
        let bala = this.add.sprite(this.arma.x, this.arma.y, 'bala_p').setScale(0.4);
        bala.rotation = this.arma.rotation;

        // Detectar exactamente qué figura fue clickeada evitando problemas de físicas rápidas (tunneling)
        let figuraImpactada = null;
        this.figurasGroup.getChildren().forEach(fig => {
            // Expandir un poco el área de la figura (hitbox) para que sea más fácil acertar
            let bounds = fig.getBounds();
            bounds.x -= 15; bounds.y -= 15; bounds.width += 30; bounds.height += 30;
            if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
                figuraImpactada = fig;
            }
        });

        this.tweens.add({
            targets: bala,
            x: pointer.x,
            y: pointer.y,
            duration: 150, // Vuelo ultra rápido visual
            onComplete: () => {
                bala.destroy();
                if (figuraImpactada) {
                    this.procesarImpacto(figuraImpactada);
                }
            }
        });
    }

    procesarImpacto(figura) {
        if (!this.rondaActiva) return;
        this.rondaActiva = false;

        this.sound.play('boom'); // Efecto de sonido al impactar la figura

        let valorImpactado = figura.getData('valor');
        let esCorrecto = (valorImpactado === this.sumaActual.resultado);
        let timeElapsed = (this.time.now - this.rondaStartTime) / 1000;

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.LearningAgent.logInteraction(
                currentUser.id, 'PoligonoScene', 'Suma', 'Dificultad_Normal', 
                esCorrecto, valorImpactado, timeElapsed
            );
        }

        if (esCorrecto) {
            this.sound.play('ganar_p');
            this.puntuacion += 10;
            this.txtPuntos.setText(`PUNTOS: ${this.puntuacion}`);
            this.txtInstruccion.setText('¡EXCELENTE!');
            this.txtInstruccion.setColor('rgb(21, 0, 255)');
            figura.destroy();
            this.time.delayedCall(1500, this.iniciarNuevaRonda, [], this);
        } else {
            this.sound.play('error_p');
            this.txtInstruccion.setText('¡FALLASTE!');
            this.txtInstruccion.setColor('#f00');
            figura.setTint(0x444444);
            this.cameras.main.shake(200, 0.01);
            // Al fallar, avanza y coloca una nueva pregunta
            this.time.delayedCall(2000, this.iniciarNuevaRonda, [], this);
        }
    }

    finalizarJuego() {
        this.rondaActiva = false;
        this.physics.pause();
        window.TTSManager.stop();
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        this.add.text(400, 300, `FIN DEL JUEGO\nPuntos: ${this.puntuacion}`, { 
            fontFamily: 'Courier New', fontSize: '40px', fill: '#f00', align: 'center' 
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.sound.stopAll();
            this.scene.start('MenuScene');
        });
    }
}