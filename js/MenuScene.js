/**
 * Escena del Menú Principal del "Circo Isósceles"
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Fondo del Menu
        this.load.image('fondo_menu', 'assets/menu/fondo_menu.png');

        // Carpas del Circo
        this.load.image('carpa_pepe', 'assets/menu/carpa_pepe.png');
        this.load.image('carpa_pepe_2', 'assets/menu/carpa_pepe_2.png');
        this.load.image('carpa_perfil', 'assets/menu/carpa_perfil.png');
        this.load.image('carpa_perfil_2', 'assets/menu/carpa_perfil_2.png');
        
        // Carteles
        this.load.image('cartel_isosceles', 'assets/menu/cartel_isosceles.png');
        this.load.image('cartel_pepe', 'assets/menu/cartel_pepe.png');
        this.load.image('cartel_perfil', 'assets/menu/cartel_perfil.png');

        // Tutor Mr Claw
        this.load.image('mr_claw', 'assets/personajes_principales/mr_claw.png');
        this.load.image('dialogo_2', 'assets/extra/dialogo_2.png');

        // Musica del Menu
        this.load.audio('musica_menu', 'assets/music/circus_menu.mp3');

        // Audios Tutorial Mr Claw
        for (let i = 1; i <= 4; i++) {
            this.load.audio(`audio_claw_${i}`, `assets/audios_tutor/audios_mr_claw/audio_${i}.mp3`);
        }
    }

    create() {
        // Fondo
        this.add.image(400, 300, 'fondo_menu').setDisplaySize(800, 600);

        // Cartel Isosceles
        this.add.image(20, 580, 'cartel_isosceles').setOrigin(0, 1).setScale(0.4);

        // Reproducir musica
        this.musica = this.sound.add('musica_menu', { loop: true, volume: 0.5 });
        this.musica.play();

        // Carpa para "La Taquilla de Pepe"
        this.carpaPepe = this.add.image(185, 375, 'carpa_pepe').setInteractive({ useHandCursor: true });
        this.carpaPepe.on('pointerdown', () => {
            this.musica.stop();
            this.scene.start('TaquillaScene'); // Cambiar a la escena del juego de Pepe
        }).setScale(0.1);
        this.add.image(25, 400, 'cartel_pepe').setOrigin(0, 1).setScale(0.25);

        // Animación: Alternar entre carpa_pepe y carpa_pepe_2 cada 500ms
        /*this.time.addEvent({
            delay: 500,
            callback: () => {
                const nuevaTextura = (this.carpaPepe.texture.key === 'carpa_pepe') ? 'carpa_pepe_2' : 'carpa_pepe';
                this.carpaPepe.setTexture(nuevaTextura);
            },
            loop: true
        });*/

        // Carpa para el "Perfil del Jugador"
        this.carpaPerfil = this.add.image(675, 250, 'carpa_perfil').setInteractive({ useHandCursor: true });
        this.carpaPerfil.on('pointerdown', () => {
            this.musica.stop();
            this.scene.start('PerfilScene'); // Cambiar a la escena de Perfil
        }).setScale(0.25);
        this.add.image(500, 300, 'cartel_perfil').setOrigin(0, 1).setScale(0.25);

        // Animación: Alternar entre carpa_perfil y carpa_perfil_2 cada 500ms
        /*this.time.addEvent({
            delay: 500,
            callback: () => {
                const nuevaTextura = (this.carpaPerfil.texture.key === 'carpa_perfil') ? 'carpa_perfil_2' : 'carpa_perfil';
                this.carpaPerfil.setTexture(nuevaTextura);
            },
            loop: true
        });*/

        // Mr Claw y Dialogo de Bienvenida
        this.mrClaw = this.add.image(780, 580, 'mr_claw').setOrigin(1, 1).setScale(0.4);
        this.nubeClaw = this.add.image(450, 225, 'dialogo_2').setOrigin(0, 0).setScale(0.75);
        this.txtClaw = this.add.text(480, 255, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', wordWrap: { width: 170 } 
        });

        this.iniciarTutorial();
    }

    iniciarTutorial() {
        const frases = [
            "¡Bienvenido al Circo Isósceles!",
            "Soy Mr. Claw, el dueño de este lugar.",
            "Antes de iniciar a jugar, debes crear tu perfil.",
            "Por favor, ve a la carpa con el cartel de perfil para registrarte."
        ];
        let paso = 0;
        this.txtClaw.setText(frases[paso]);

        // Reproducir primer audio
        this.audioTutorial = this.sound.add('audio_claw_1');
        this.audioTutorial.play();

        // Botón Saltar
        const btnSaltar = this.add.text(615, 340, 'SALTAR >>', { 
            fontFamily: 'Courier New', fontSize: '12px', fill: '#333', fontWeight: 'bold' 
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        const finalizar = () => {
            if (this.audioTutorial) this.audioTutorial.stop();
            this.nubeClaw.setVisible(false);
            this.txtClaw.setVisible(false);
            btnSaltar.destroy();
            this.input.off('pointerdown', avanzar);
        };

        const avanzar = () => {
            if (this.audioTutorial) this.audioTutorial.stop();
            paso++;
            if (paso < frases.length) {
                this.txtClaw.setText(frases[paso]);
                this.audioTutorial = this.sound.add(`audio_claw_${paso + 1}`);
                this.audioTutorial.play();
            } else {
                finalizar();
            }
        };

        btnSaltar.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            finalizar();
        });

        this.input.on('pointerdown', avanzar);
    }
}