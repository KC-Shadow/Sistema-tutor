class PoligonoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PoligonoScene' }); // Clave vinculada en main.js
    }

    init() {
        // Variables de Control
        this.puntuacion = 0;
        this.juegoActivo = false;
        this.figuraObjetivo = '';
        this.rondaActiva = false;
        
        // Sistema de Munición
        this.balasMaximas = 15; // Límite de 15 rondas de tiros
        this.balasRestantes = this.balasMaximas;

        // Grupos y Listas
        this.figurasGroup = null; 
        this.nombresFiguras = [
            'circulo', 'corazon', 'cruz', 'cuadrado', 'estrella', 'flecha', 
            'heptagono', 'nube', 'ovalo', 'paralelogramo', 'pentagono',
            'rectangulo', 'rombo', 'semicirculo', 'trapecio', 'triangulo'
        ];
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

        // Cartelera
        this.load.image('cartelera', 'assets/extra/cartelera.png');

        // Figuras Geométricas
        this.nombresFiguras.forEach(nombre => {
            this.load.image(`fig_${nombre}`, `assets/poligono/figuras/${nombre}.png`);
        });

        // Audios Tutorial Diana
        for (let i = 1; i <= 5; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.audio(`audio_diana_${numStr}`, `assets/audios_tutor/audios_diana/audio_${numStr}.mp3`);
        }
    }

    create() {
        // UI
        this.add.image(400, 250, 'fondo_p').setScale(1);
        this.add.image(350, 290, 'galeria_p').setScale(0.90); // Escala aumentada a 0.90

        // Diana y Nube de Diálogo
        this.diana = this.add.image(730, 500, 'diana_p').setScale(0.35);
        this.dialogo = this.add.image(660, 340, 'nube_p').setScale(0.75);
        this.txtInstruccion = this.add.text(660, 315, '', { fontFamily: 'Courier New', fontSize: '18px', fill: '#0f0', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

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
        this.btnVolver.on('pointerdown', () => {
            this.sound.stopAll();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            this.scene.start('MenuScene');
        });

        // Música de fondo
        this.musica = this.sound.add('musica_poligono', { loop: true, volume: 0.3 });
        this.musica.play();

        // Eventos de Entrada
        this.input.on('pointerdown', this.disparar, this);

        // Iniciar Tutorial
        this.iniciarTutorial();
    }

    iniciarTutorial() {
        this.dialogo.setVisible(true);
        this.txtInstruccion.setVisible(true);

        const frases = [
            "¡Hola! Soy Diana. Bienvenido al Polígono de Tiro.",
            "Tu objetivo es disparar a la figura geométrica correcta.",
            "Yo te indicaré qué figura.",
            "Apunta con tu ratón y haz clic para disparar el arma.",
            "¡Tienes 15 tiros, consigue la mayor puntuación!"
        ];

        let paso = 0;
        this.txtInstruccion.setStyle({ fontSize: '14px', fill: '#000', wordWrap: { width: 160 } });
        this.txtInstruccion.setText(frases[paso]);

        // Bajar volumen de la música de fondo durante el tutorial
        if (this.musica) this.musica.setVolume(0.1);

        // Reproducir primer audio
        let numStr = (paso + 1).toString().padStart(3, '0');
        this.audioTutorial = this.sound.add(`audio_diana_${numStr}`);
        this.audioTutorial.play();

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
            // Detener el audio si está sonando y restaurar la música
            if (this.audioTutorial) this.audioTutorial.stop();
            if (this.musica) this.musica.setVolume(0.3); 

            if (this.tweenDiana) {
                this.tweenDiana.stop();
                this.diana.y = 500;
            }
            
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            
            // Restaurar estilo original de la instrucción para el juego
            this.txtInstruccion.setStyle({ fontSize: '18px', fill: '#0f0', wordWrap: null });
            this.txtInstruccion.setText('');
            
            this.iniciarCuentaRegresiva();
        };

        const avanzar = () => {
            if (this.audioTutorial) this.audioTutorial.stop();
            
            paso++;
            if (paso < frases.length) {
                this.txtInstruccion.setText(frases[paso]);
                
                let numStr = (paso + 1).toString().padStart(3, '0');
                this.audioTutorial = this.sound.add(`audio_diana_${numStr}`);
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

        // Diana elige objetivo
        this.figuraObjetivo = Phaser.Math.RND.pick(this.nombresFiguras);
        let articulo = ['cruz', 'estrella', 'flecha', 'nube'].includes(this.figuraObjetivo) ? 'LA' : 'EL';
        this.txtInstruccion.setText(`¡BUSCA ${articulo}\n${this.figuraObjetivo.toUpperCase()}!`);
        this.txtInstruccion.setColor('#000000');

        // Reproducir la instrucción por voz (Text-to-Speech)
        if (window.speechSynthesis) {
            if (this.musica) this.musica.setVolume(0.1); 
            window.speechSynthesis.cancel();
            
            // Ajustar tildes para una pronunciación perfecta
            let tildes = { 'circulo': 'círculo', 'corazon': 'corazón', 'heptagono': 'heptágono', 'ovalo': 'óvalo', 'pentagono': 'pentágono', 'rectangulo': 'rectángulo', 'semicirculo': 'semicírculo', 'triangulo': 'triángulo' };
            let figuraPronunciada = tildes[this.figuraObjetivo] || this.figuraObjetivo;
            
            const texto = `Busca ${articulo.toLowerCase()} ${figuraPronunciada}`;
            let voz = new SpeechSynthesisUtterance(texto);
            voz.lang = 'es-VE';
            voz.onend = () => {
                if (this.musica && this.juegoActivo) this.musica.setVolume(0.3); // Restaurar música
            };
            window.speechSynthesis.speak(voz);
        }

        this.crearObjetivosEnMovimiento();
    }

    crearObjetivosEnMovimiento() {
        let seleccion = [this.figuraObjetivo];
        
        // Necesitamos 9 figuras (3 filas x 3 columnas) para llenar la galería
        while (seleccion.length < 9) {
            let aleatorio = Phaser.Math.RND.pick(this.nombresFiguras);
            if (!seleccion.includes(aleatorio)) seleccion.push(aleatorio);
        }

        Phaser.Utils.Array.Shuffle(seleccion);

        const filasY = [210, 280, 350]; // Alturas de las 3 filas más separadas
        const columnasX = [210, 350, 490]; // Centradas en la galería (X=350) con mayor separación horizontal

        let i = 0;
        filasY.forEach(y => {
            columnasX.forEach(x => {
                let nombre = seleccion[i];
                let fig = this.figurasGroup.create(x, y, `fig_${nombre}`).setScale(1.2);
                
                fig.setData('valor', nombre);
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
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (this.musica) this.musica.setVolume(0.3);

        // Crear bala
        let bala = this.physics.add.sprite(this.arma.x, this.arma.y, 'bala_p').setScale(0.4);
        bala.rotation = this.arma.rotation;
        this.physics.moveTo(bala, pointer.x, pointer.y, 900);

        // Determinar a qué fila apuntó el jugador según la posición Y del puntero
        let targetY = 350; // Fila inferior por defecto
        if (pointer.y < 245) {
            targetY = 210; // Fila superior
        } else if (pointer.y < 315) {
            targetY = 280; // Fila del medio
        }

        // Filtrar las figuras para que la bala solo colisione con las de la fila apuntada
        let figurasFila = this.figurasGroup.getChildren().filter(fig => fig.y === targetY);

        // Detectar impacto SOLO con las figuras de esa fila (evita obstáculos en el camino)
        this.physics.add.overlap(bala, figurasFila, (b, f) => {
            b.destroy();
            this.procesarImpacto(f);
        });
    }

    procesarImpacto(figura) {
        if (!this.rondaActiva) return;
        this.rondaActiva = false;

        this.sound.play('boom'); // Efecto de sonido al impactar la figura

        let nombreImpactado = figura.getData('valor');

        if (nombreImpactado === this.figuraObjetivo) {
            this.puntuacion += 10;
            this.txtPuntos.setText(`PUNTOS: ${this.puntuacion}`);
            this.txtInstruccion.setText('¡EXCELENTE!');
            this.txtInstruccion.setColor('#0f0');
            figura.destroy();
            this.time.delayedCall(1500, this.iniciarNuevaRonda, [], this);
        } else {
            this.txtInstruccion.setText('¡FALLASTE!');
            this.txtInstruccion.setColor('#f00');
            figura.setTint(0x444444);
            this.cameras.main.shake(200, 0.01);
            this.time.delayedCall(2000, this.repetirMismoObjetivo, [], this);
        }
    }

    repetirMismoObjetivo() {
        if (this.balasRestantes > 0) {
            this.figurasGroup.clear(true, true);
            let articulo = ['cruz', 'estrella', 'flecha', 'nube'].includes(this.figuraObjetivo) ? 'LA' : 'EL';
            this.txtInstruccion.setText(`¡BUSCA ${articulo}\n${this.figuraObjetivo.toUpperCase()}!`);
            this.txtInstruccion.setColor('#0f0');
            
            // Reproducir la instrucción por voz al repetir
            if (window.speechSynthesis) {
                if (this.musica) this.musica.setVolume(0.1);
                window.speechSynthesis.cancel();
                
                let tildes = { 'circulo': 'círculo', 'corazon': 'corazón', 'heptagono': 'heptágono', 'ovalo': 'óvalo', 'pentagono': 'pentágono', 'rectangulo': 'rectángulo', 'semicirculo': 'semicírculo', 'triangulo': 'triángulo' };
                let figuraPronunciada = tildes[this.figuraObjetivo] || this.figuraObjetivo;
                
                const texto = `Busca ${articulo.toLowerCase()} ${figuraPronunciada}`;
                let voz = new SpeechSynthesisUtterance(texto);
                voz.lang = 'es-VE';
                voz.onend = () => {
                    if (this.musica && this.juegoActivo) this.musica.setVolume(0.3);
                };
                window.speechSynthesis.speak(voz);
            }

            this.crearObjetivosEnMovimiento();
            this.rondaActiva = true;
        } else {
            this.finalizarJuego();
        }
    }

    finalizarJuego() {
        this.rondaActiva = false;
        this.physics.pause();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
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