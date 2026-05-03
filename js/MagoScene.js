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
    }

    create() {
        // Escenario
        this.add.image(400, 250, 'fondo_zandor').setScale(0.5);
        this.add.image(690, 90, 'cartelera_z').setScale(0.4);
        
        // Taburetes (Estáticos)
        this.add.image(280, 298, 'taburete').setScale(0.3375);
        this.add.image(400, 298, 'taburete').setScale(0.3375);
        this.add.image(520, 298, 'taburete').setScale(0.3375);

        // Zandor y Diálogo
        this.zandor = this.add.image(100, 550, 'zandor').setScale(0.5);
        this.nube = this.add.image(200, 420, 'nube_z').setScale(0.65).setVisible(false);
        this.txtPregunta = this.add.text(200, 400, '', { 
            fontFamily: 'Courier New', fontSize: '15px', fill: '#000', align: 'center', wordWrap: { width: 150 } 
        }).setOrigin(0.5).setVisible(false);

        // Grupo de Sombreros e Interfaz
        this.sombrerosGroup = this.add.group();
        this.txtRondas = this.add.text(680, 90, 'RONDA: 0/6', { fontFamily: 'Playbill', fontSize: '36px', fill: '#000' }).setOrigin(0.5).setAngle(-9);
        this.txtPuntos = this.add.text(680, 130, 'PUNTOS: 0', { fontFamily: 'Playbill', fontSize: '40px', fill: '#000' }).setOrigin(0.5).setAngle(-9);

        this.iniciarTutorial();
    }

    iniciarTutorial() {
        this.nube.setVisible(true);
        this.txtPregunta.setVisible(true);
        const frases = [
            "¡Soy el Mago Zandor! Bienvenido a mi espectáculo.",
            "Debes encontrar el sombrero que oculta el resultado correcto.",
            "Si aciertas, ¡un conejo aparecerá por arte de magia!",
            "Completaremos 6 trucos. ¿Estás listo?"
        ];
        
        let paso = 0;
        this.txtPregunta.setText(frases[paso]);

        // Botón Saltar
        const btnSaltar = this.add.text(200, 465, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '12px', fill: '#4281aa', fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const finalizarTutorial = () => {
            this.input.off('pointerdown', avanzar);
            btnSaltar.destroy();
            this.nube.setVisible(false);
            this.txtPregunta.setVisible(false);
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
        this.txtRondas.setText(`RONDA: ${this.rondaActual}/${this.maxRondas}`);
        this.sombrerosGroup.clear(true, true);

        // Generar Multiplicación
        this.multiplicacionActual.a = Phaser.Math.Between(1, 10);
        this.multiplicacionActual.b = Phaser.Math.Between(1, 10);
        this.multiplicacionActual.producto = this.multiplicacionActual.a * this.multiplicacionActual.b;

        // Mostrar Pregunta
        this.nube.setVisible(true);
        this.txtPregunta.setFontSize('20px');
        this.txtPregunta.setVisible(true).setText(`¿Cuánto es\n${this.multiplicacionActual.a} x ${this.multiplicacionActual.b}?`);

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
            let sombrero = this.add.image(posX, 230, `s_${numStr}`).setScale(0.055).setInteractive({ useHandCursor: true });
            
            sombrero.setData('valor', valor);
            sombrero.on('pointerdown', () => this.verificarRespuesta(sombrero));
            this.sombrerosGroup.add(sombrero);
        });
    }

    verificarRespuesta(sombrero) {
        if (!this.rondaActiva) return;
        this.rondaActiva = false;

        const valorSeleccionado = sombrero.getData('valor');

        if (valorSeleccionado === this.multiplicacionActual.producto) {
            this.sound.play('ganar_z');
            this.puntuacion += 10;
            this.txtPuntos.setText(`PUNTOS: ${this.puntuacion}`);
            
            // Cambia a conejo
            sombrero.setTexture('conejo_sombrero').setScale(0.35);
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
        this.scene.start('MenuScene');
    }
}