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
        this.load.image('carpa_dante', 'assets/menu/carpa_dante.png');
        this.load.image('carpa_poligono', 'assets/menu/carpa_poligono.png')
        this.load.image('carpa_milo', 'assets/menu/carpa_milo.png');
        this.load.image('carpa_mago', 'assets/menu/carpa_mago.png');
        
        // Carteles
        this.load.image('cartel_isosceles', 'assets/menu/cartel_isosceles.png');
        this.load.image('cartel_pepe', 'assets/menu/cartel_pepe.png');
        this.load.image('cartel_perfil', 'assets/menu/cartel_perfil.png');
        this.load.image('cartel_dante', 'assets/menu/cartel_dante.png');
        this.load.image('cartel_poligono', 'assets/menu/cartel_poligono.png');
        this.load.image('cartel_milo', 'assets/menu/cartel_milo.png');
        this.load.image('cartel_mago', 'assets/menu/cartel_mago.png');

        // Cartelera y Avatares para el UI de Usuario
        this.load.image('cartel_menu', 'assets/menu/cartel.png');
        this.load.image('avatar_1', 'assets/perfil/avatar_1.png');
        this.load.image('avatar_2', 'assets/perfil/avatar_2.png');
        this.load.image('avatar_3', 'assets/perfil/avatar_3.png');
        this.load.image('avatar_4', 'assets/perfil/avatar_4.png');

        // Tutor Mr Claw
        this.load.image('mr_claw', 'assets/personajes_principales/mr_claw.png');
        this.load.image('dialogo_2', 'assets/extra/dialogo_2.png');

        // Musica del Menu
        this.load.audio('musica_menu', 'assets/music/circus_menu.mp3');

        // Audios de tutor (Mr Claw)
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`claw_bienvenida_00${i}`, `assets/audios_tutor/mrclaw_audios/bienvenida/audio_00${i}.wav`);
        }
        for (let i = 1; i <= 4; i++) {
            this.load.audio(`claw_guia_00${i}`, `assets/audios_tutor/mrclaw_audios/guia/guia_00${i}.wav`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`claw_guia_j${i}_001`, `assets/audios_tutor/mrclaw_audios/guia/guia_j${i}_001.wav`);
            this.load.audio(`claw_guia_j${i}_002`, `assets/audios_tutor/mrclaw_audios/guia/guia_j${i}_002.wav`);
        }
    }

    create() {
        // Fondo
        this.add.image(400, 300, 'fondo_menu').setDisplaySize(800, 600);

        this.tutorialActivo = false;

        // Cartel Isosceles (Acceso Administrativo)
        this.cartelIsosceles = this.add.image(-38, 638, 'cartel_isosceles').setOrigin(0, 1).setScale(0.5).setInteractive({ useHandCursor: true });
        this.cartelIsosceles.on('pointerdown', () => {
            let pwd = prompt("ACCESO ADMINISTRATIVO\nIngrese contraseña de seguridad:");
            if (pwd === "ula2026") {
                this.musica.stop();
                this.scene.start('DashboardScene');
            } else if (pwd !== null) {
                alert("Contraseña incorrecta. Acceso denegado.");
            }
        });

        // Reproducir musica
        this.musica = this.sound.add('musica_menu', { loop: true, volume: 0.5 });
        this.musica.play();

        // 1. Carpa para "El Mago Zandor, el Magnifico" (Centro Superior)
        this.carpaMago = this.add.image(400, 160, 'carpa_mago').setScale(0.85).setInteractive({useHandCursor: true});
        this.carpaMago.on('pointerdown', () => {
            this.musica.stop();
            this.marcarJuegoJugado('MagoScene');
            this.scene.start('MagoScene');
        });
        this.agregarHoverMrClaw(this.carpaMago, "Juego de Multiplicación.");
        this.cartelMago = this.add.image(400, 195, 'cartel_mago').setOrigin(0.5, 1).setScale(0.8);

        // 2. Carpa para "El poligono de Diana" (Medio Izquierda)
        this.carpaPoligono = this.add.image(250, 210, 'carpa_poligono').setScale(0.85);
        this.carpaPoligono.setInteractive({ useHandCursor: true });
        this.carpaPoligono.on('pointerdown', () => {
            this.musica.stop();
            this.marcarJuegoJugado('PoligonoScene');
            this.scene.start('PoligonoScene');
        });
        this.agregarHoverMrClaw(this.carpaPoligono, "Juego de Suma.");
        this.cartelPoligono = this.add.image(245, 255, 'cartel_poligono').setOrigin(0.5, 1).setScale(0.75);

        // 3. Carpa para "Equilibrio de platillos" (Medio Derecha)
        this.carpaMilo = this.add.image(560, 210, 'carpa_milo').setScale(0.85).setInteractive({useHandCursor:true});
        this.carpaMilo.on('pointerdown', () => {
            this.musica.stop();
            this.marcarJuegoJugado('MiloScene');
            this.scene.start('MiloScene');
        });
        this.agregarHoverMrClaw(this.carpaMilo, "Juego de División.");
        this.cartelMilo = this.add.image(550, 246, 'cartel_milo').setOrigin(0.5, 1).setScale(0.8);

        // 4. Carpa para "La Taquilla de Pepe" (Abajo Izquierda)
        this.carpaPepe = this.add.image(100, 300, 'carpa_pepe').setInteractive({ useHandCursor: true }).setScale(0.64);
        this.carpaPepe.on('pointerdown', () => {
            this.musica.stop();
            this.marcarJuegoJugado('TaquillaScene');
            this.scene.start('TaquillaScene'); // Cambiar a la escena del juego de Pepe
        });
        this.agregarHoverMrClaw(this.carpaPepe, "Juego de Resta.");
        this.cartelPepe = this.add.image(100, 331, 'cartel_pepe').setOrigin(0.5, 1).setScale(0.8);

        // 5. Carpa para "Dagas al aire" (Abajo Derecha)
        this.carpaDante = this.add.image(700, 300, 'carpa_dante').setScale(0.85);
        this.carpaDante.setInteractive({ useHandCursor: true });
        this.carpaDante.on('pointerdown', () => {
            this.musica.stop();
            this.marcarJuegoJugado('DagasScene');
            this.scene.start('DagasScene');
        });
        this.agregarHoverMrClaw(this.carpaDante, "Juego Final.");
        this.cartelDante = this.add.image(700, 331, 'cartel_dante').setOrigin(0.5, 1).setScale(0.8);

        // 6. Carpa para el "Perfil del Jugador" (Abajo Centro)
        this.carpaPerfil = this.add.image(400, 330, 'carpa_perfil').setInteractive({ useHandCursor: true }).setScale(1);
        this.carpaPerfil.on('pointerdown', () => {
            this.mostrarOpcionesPerfil();
        });
        this.add.image(400, 380, 'cartel_perfil').setOrigin(0.5, 1).setScale(0.8);

        // Mr Claw y Dialogo de Bienvenida
        this.mrClaw = this.add.image(800, 580, 'mr_claw').setOrigin(1, 1).setScale(0.4);
        this.nubeClaw = this.add.image(450, 225, 'dialogo_2').setOrigin(0, 0).setScale(0.75);
        this.txtClaw = this.add.text(480, 265, '', { 
            fontFamily: 'Courier New', fontSize: '16px', fill: '#000', wordWrap: { width: 170 } 
        });

        // Controlar si el tutorial de Mr Claw se reproduce o no
        let currentUserStr = localStorage.getItem('currentUser');
        let userObj = currentUserStr ? JSON.parse(currentUserStr) : null;
        this.tutorialActivo = true;
        this.iniciarTutorial(userObj); // Habla Mr. Claw dependiendo de si hay usuario

        this.actualizarUIUsuario();
        
    }

    // Función de apoyo para reproducir audios de forma segura
    reproducirAudioTutor(llaveAudio) {
        if (this.audioTutor) {
            this.audioTutor.stop();
            this.audioTutor.destroy(); // Libera la memoria del audio anterior
        }
        if (!llaveAudio) return; // Si no hay audio asignado, no reproduce nada (útil para la felicitación final)
        
        if (this.cache.audio.exists(llaveAudio)) {
            this.audioTutor = this.sound.add(llaveAudio, { volume: 1 });
            this.audioTutor.play();
        } else {
            console.error(`🚨 ERROR: No se encontró o no se pudo cargar el audio '${llaveAudio}'. Revisa la ruta, el formato y la consola de red.`);
        }
    }

    agregarHoverMrClaw(carpa, texto) {
        carpa.on('pointerover', () => {
            if (!this.tutorialActivo) {
                this.nubeClaw.setVisible(true);
                this.txtClaw.setVisible(true);
                this.txtClaw.setText(texto);
            }
        });
        carpa.on('pointerout', () => {
            if (!this.tutorialActivo) {
                this.nubeClaw.setVisible(false);
                this.txtClaw.setVisible(false);
                this.txtClaw.setText('');
            }
        });
    }

    iniciarTutorial(user) {
        this.nubeClaw.setVisible(true);
        this.txtClaw.setVisible(true);
        
        // Establecer visualmente la opacidad de los juegos bloqueados/no jugados
        this.activarJuegos();

        // Desactivar interacción con las carpas durante el tutorial
        this.carpaPepe.disableInteractive();
        this.carpaDante.disableInteractive();
        this.carpaPoligono.disableInteractive();
        this.carpaMilo.disableInteractive();
        this.carpaMago.disableInteractive();
        this.carpaPerfil.disableInteractive(); // Desactivar carpa perfil durante el tutorial
        // Bajar volumen de la música durante el tutorial
        if (this.musica) this.musica.setVolume(0.1);

        let frases = [];
        if (user) {
            let jugados = JSON.parse(localStorage.getItem('juegosJugados')) || {};
            let userJugados = jugados[user.id] || [];
            let userSessions = JSON.parse(localStorage.getItem('userSessions')) || {};
            let sessionCount = userSessions[user.id] || 1;

            if (userJugados.includes('DagasScene')) {
                if (user.username === 'admin') {
                    frases = [
                        { texto: "¡Felicidades!", audio: null },
                        { texto: "Has completado todos los minijuegos del circo.", audio: null },
                        { texto: "Puedes volver a jugar el que más te guste.", audio: null }
                    ];
                } else {
                    frases = [
                        { texto: "¡Felicidades!", audio: null },
                        { texto: "Has completado todos los minijuegos del circo.", audio: null },
                        { texto: "Gracias por participar en esta aventura.", audio: null }
                    ];
                }
            } else if (userJugados.includes('MiloScene')) {
                if (user.username !== 'admin' && sessionCount < 2) {
                    frases = [
                        { texto: "¡Gran trabajo!", audio: 'claw_guia_002' },
                        { texto: "Has completado la primera sesión.", audio: null },
                        { texto: "Vuelve pronto para jugar el reto final.", audio: null }
                    ];
                } else {
                    frases = [
                        { texto: "¡Gran trabajo!", audio: 'claw_guia_002' },
                        { texto: "Solo te falta el último reto.", audio: 'claw_guia_j5_001' },
                        { texto: "Ingresa a la carpa de Dagas al Aire para jugar el juego final.", audio: 'claw_guia_j5_002' }
                    ];
                }
            } else if (userJugados.includes('MagoScene')) {
                frases = [
                    { texto: "¡Sigue así!", audio: 'claw_guia_003' },
                    { texto: "Ahora es el turno del juego de división.", audio: 'claw_guia_j4_001' },
                    { texto: "Ingresa a la carpa del Equilibrista Milo.", audio: 'claw_guia_j4_002' }
                ];
            } else if (userJugados.includes('PoligonoScene')) {
                frases = [
                    { texto: "¡Muy bien!", audio: 'claw_guia_004' },
                    { texto: "Es hora del juego de multiplicación.", audio: 'claw_guia_j3_001' },
                    { texto: "Ingresa a la carpa del Mago Zandor.", audio: 'claw_guia_j3_002' }
                ];
            } else if (userJugados.includes('TaquillaScene')) {
                frases = [
                    { texto: "¡Excelente!", audio: 'claw_guia_001' },
                    { texto: "Continuemos con el juego de sumas.", audio: 'claw_guia_j2_001' },
                    { texto: "Ingresa a la carpa del Polígono de Diana.", audio: 'claw_guia_j2_002' }
                ];
            } else {
                frases = [
                    { texto: "¡Excelente!", audio: 'claw_guia_001' },
                    { texto: "Empecemos con el primer juego.", audio: 'claw_guia_j1_001' },
                    { texto: "Ingresa a la Taquilla de Pepe.", audio: 'claw_guia_j1_002' }
                ];
            }
        } else {
            frases = [
                { texto: "¡Bienvenido al Circo Isósceles!", audio: 'claw_bienvenida_001' },
                { texto: "Soy Mister Claw, el dueño de este lugar.", audio: 'claw_bienvenida_002' },
                { texto: "Antes de empezar, ingresa a la carpa del perfil.", audio: 'claw_bienvenida_003' },
                { texto: "Si ingresas por primera vez, crea tu perfil.", audio: 'claw_bienvenida_004' },
                { texto: "Si ya tienes uno, inicia sesión.", audio: 'claw_bienvenida_005' }
            ];
        }
        
        let paso = 0;
        this.txtClaw.setText(frases[paso].texto);
        this.reproducirAudioTutor(frases[paso].audio);

        // Animación de hablar (un solo brinco)
        const darBrinco = () => {
            this.mrClaw.y = 580;
            this.tweenClaw = this.tweens.add({
                targets: this.mrClaw,
                y: 570,
                duration: 150,
                yoyo: true
            });
        };
        darBrinco();

        const finalizar = () => {
            if (this.audioTutor) this.audioTutor.stop();

            // Detener animación de hablar
            if (this.tweenClaw) {
                this.tweenClaw.stop();
                this.mrClaw.y = 580;
            }

            // Restaurar volumen de la música
            if (this.musica) this.musica.setVolume(0.5);

            this.nubeClaw.setVisible(false);
            this.txtClaw.setVisible(false);
            this.input.off('pointerdown', avanzar);
            this.tutorialActivo = false;

            // Activar la carpa de perfil siempre al finalizar el tutorial
            this.carpaPerfil.setInteractive({ useHandCursor: true });

            // Activar las carpas SOLO si ya tiene sesión iniciada
            if (localStorage.getItem('currentUser')) {
                this.activarJuegos();
            }
        };

        const avanzar = () => {
            if (this.audioTutor) this.audioTutor.stop();
            paso++;
            if (paso < frases.length) {
                this.txtClaw.setText(frases[paso].texto);
                this.reproducirAudioTutor(frases[paso].audio);
                darBrinco();
            } else {
                finalizar();
            }
        };

        this.input.on('pointerdown', avanzar);
    }

    activarJuegos() {
        const currentUserStr = localStorage.getItem('currentUser');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

        let jugados = JSON.parse(localStorage.getItem('juegosJugados')) || {};
        let userJugados = currentUser ? (jugados[currentUser.id] || []) : [];
        let userSessions = JSON.parse(localStorage.getItem('userSessions')) || {};
        let sessionCount = currentUser ? (userSessions[currentUser.id] || 1) : 1;

        // Ruta establecida
        const ordenJuegos = ['TaquillaScene', 'PoligonoScene', 'MagoScene', 'MiloScene', 'DagasScene'];
        const carpas = {
            'TaquillaScene': this.carpaPepe, 'PoligonoScene': this.carpaPoligono,
            'MagoScene': this.carpaMago, 'MiloScene': this.carpaMilo, 'DagasScene': this.carpaDante
        };
        const carteles = {
            'TaquillaScene': this.cartelPepe, 'PoligonoScene': this.cartelPoligono,
            'MagoScene': this.cartelMago, 'MiloScene': this.cartelMilo, 'DagasScene': this.cartelDante
        };

        // Calcular hasta qué nivel tiene permitido entrar
        let nivelActual = -1;
        if (currentUser) {
            nivelActual = 0;
            for (let i = 0; i < ordenJuegos.length; i++) {
                if (userJugados.includes(ordenJuegos[i])) nivelActual = i + 1; // Desbloquea el siguiente
                else break; // Frena en el primero que no haya completado
            }
        }
        
        if (currentUser && currentUser.username !== 'admin' && sessionCount < 2 && nivelActual >= 4) {
            nivelActual = -1; // Detiene el avance hacia el juego final en la primera sesión
        }

        // Configurar interactividad y visibilidad
        ordenJuegos.forEach((gameId, index) => {
            let isPlayed = userJugados.includes(gameId);
            let isAdmin = currentUser && currentUser.username === 'admin';
            let puedeRepetir = isAdmin || sessionCount >= 3;

            if (index === nivelActual) {
                // Siguiente juego a jugar
                carpas[gameId].setInteractive({ useHandCursor: true });
                carpas[gameId].setAlpha(1); // Juego activo (sin opacidad)
                carteles[gameId].setAlpha(1);
            } else if (isPlayed) { // Si el juego ya fue jugado
                if (puedeRepetir) {
                    // Admin puede repetir
                    carpas[gameId].setInteractive({ useHandCursor: true });
                    carpas[gameId].setAlpha(1);
                    carteles[gameId].setAlpha(1);
                } else {
                    // Usuario normal no puede repetir
                    carpas[gameId].disableInteractive();
                    carpas[gameId].setAlpha(0.8); // Juego ya completado (ligeramente opaco)
                    carteles[gameId].setAlpha(0.8);
                }
            } else {
                // Juego bloqueado
                carpas[gameId].disableInteractive();
                carpas[gameId].setAlpha(0.5); // Juego inactivo (opaco)
                carteles[gameId].setAlpha(0.5);
            }
        });
    }

    bloquearCarpas() {
        // Desactiva los clics en todas las carpas y el cartel
        this.carpaPepe.disableInteractive();
        this.carpaDante.disableInteractive();
        this.carpaPoligono.disableInteractive();
        this.carpaMilo.disableInteractive();
        this.carpaMago.disableInteractive();
        this.carpaPerfil.disableInteractive();
        this.cartelIsosceles.disableInteractive();
    }

    desbloquearCarpas() {
        this.carpaPerfil.setInteractive({ useHandCursor: true });
        this.cartelIsosceles.setInteractive({ useHandCursor: true });
        if (localStorage.getItem('currentUser')) {
            this.activarJuegos();
        }
    }

    mostrarOpcionesPerfil() {
        if (document.getElementById('opciones-perfil-container')) return;

        this.bloquearCarpas();

        const container = document.createElement('div');
        container.id = 'opciones-perfil-container';
        Object.assign(container.style, {
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: '1000',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });

        container.innerHTML = `
            <div style="background-color: #3d2622; padding: 25px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.8); font-family: 'Courier New'; color: #fff; text-align: center; width: 320px; border: 2px solid #d4a373;">
                <h2 style="margin-top:0; color: #d4a373;">Perfil de Jugador</h2>
                <p style="margin-bottom: 20px;">¿Qué deseas hacer?</p>
                <button id="btn-show-login" style="background: #4CAF50; color: white; font-weight: bold; border: none; padding: 12px; width: 95%; margin-bottom: 15px; cursor: pointer; border-radius: 5px;">Iniciar Sesión</button>
                <button id="btn-show-register" style="background: #008CBA; color: white; font-weight: bold; border: none; padding: 12px; width: 95%; margin-bottom: 15px; cursor: pointer; border-radius: 5px;">Crear Perfil Nuevo</button>
                <button id="btn-cerrar-opciones" style="background: #f44336; color: white; border: none; padding: 10px; width: 95%; cursor: pointer; border-radius: 5px;">Cancelar</button>
            </div>
        `;
        document.body.appendChild(container);

        document.getElementById('btn-show-login').addEventListener('click', () => {
            container.remove();
            this.mostrarFormularioLogin();
        });

        document.getElementById('btn-show-register').addEventListener('click', () => {
            container.remove();
            this.musica.stop();
            this.scene.start('PerfilScene');
        });

        document.getElementById('btn-cerrar-opciones').addEventListener('click', () => {
            container.remove();
            this.desbloquearCarpas();
        });
    }

    mostrarFormularioLogin() {
        if (document.getElementById('login-container')) return;

        this.bloquearCarpas();

        const loginContainer = document.createElement('div');
        loginContainer.id = 'login-container';
        Object.assign(loginContainer.style, {
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: '1000',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });

        loginContainer.innerHTML = `
            <div style="background-color: #3d2622; padding: 25px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.8); font-family: 'Courier New'; color: #fff; text-align: center; width: 320px; border: 2px solid #d4a373;">
                <h2 style="margin-top:0; color: #d4a373;">Iniciar Sesión</h2>
                <input type="text" id="login-user" placeholder="Nombre de usuario" maxlength="8" style="width: 90%; padding: 10px; margin: 8px 0; border-radius: 5px; border: none; font-family: 'Courier New';"><br>
                <input type="password" id="login-pass" placeholder="Contraseña" maxlength="8" style="width: 90%; padding: 10px; margin: 8px 0; border-radius: 5px; border: none; font-family: 'Courier New';"><br>
                <button id="btn-login" style="background: #4CAF50; color: white; font-weight: bold; border: none; padding: 12px; width: 95%; margin-top: 15px; cursor: pointer; border-radius: 5px;">Entrar a Jugar</button>
                <p style="font-size: 13px; margin-top: 15px;">¿No tienes cuenta? Cierra esta ventana y selecciona 'Crear Perfil Nuevo'.</p>
                <button id="btn-cerrar-login" style="background: #f44336; color: white; border: none; padding: 10px; width: 95%; cursor: pointer; border-radius: 5px;">Cerrar</button>
            </div>
        `;
        document.body.appendChild(loginContainer);
        
        document.getElementById('btn-login').addEventListener('click', () => {
            let u = document.getElementById('login-user').value;
            let p = document.getElementById('login-pass').value;
            let users = JSON.parse(localStorage.getItem('gameUsers')) || [];
            let found = users.find(x => x.username === u && x.password === p);
            
            if (found) {
                // Aumentar el contador de sesiones al iniciar sesión
                let userSessions = JSON.parse(localStorage.getItem('userSessions')) || {};
                userSessions[found.id] = (userSessions[found.id] || 0) + 1;
                localStorage.setItem('userSessions', JSON.stringify(userSessions));

                localStorage.setItem('currentUser', JSON.stringify(found));
                loginContainer.remove();
                this.activarJuegos();
                this.desbloquearCarpas();
                this.actualizarUIUsuario();
                this.tutorialActivo = true;
                this.iniciarTutorial(found);
            } else {
                alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
            }
        });
        document.getElementById('btn-cerrar-login').addEventListener('click', () => loginContainer.remove());
        document.getElementById('btn-cerrar-login').addEventListener('click', () => {
            loginContainer.remove();
            this.desbloquearCarpas();
        });
    }

    actualizarUIUsuario() {
        if (this.userUIContainer) {
            this.userUIContainer.destroy();
            this.userUIContainer = null;
        }

        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return; // Si no hay sesión iniciada, detiene la función y no dibuja la cartelera ni los círculos

        const currentUser = JSON.parse(currentUserStr);

        // Contenedor movido al centro inferior (x:400, y:405) para subir foto y texto
        this.userUIContainer = this.add.container(400, 460).setDepth(100);
        this.userUIContainer.setScale(0.75); 

        // Fondo cartel
        const cartel = this.add.image(0, 50, 'cartel_menu').setScale(0.75); // 135 compensa la subida para que se quede en 540
        this.userUIContainer.add(cartel);

        // Máscara circular para el avatar (misma posición y rotación que el contenedor)
        const maskShape = this.make.graphics();
        maskShape.x = 400;
        maskShape.y = 460;
        maskShape.setScale(0.75); // Escalar la máscara igual que el contenedor
        maskShape.fillStyle(0xffffff, 1);
        maskShape.fillCircle(-45, 0, 32); // Centro en x:-45 y radio ajustado a 32 para no rebasar la cartelera

        // Avatar
        let avatarKey = currentUser.imagen ? currentUser.imagen.split('/').pop().split('.')[0] : 'avatar_1';
        const avatar = this.add.image(-45, 0, avatarKey).setScale(0.1).setOrigin(0.5, 0.4); // Zoom reducido para que encaje mejor
        avatar.setMask(maskShape.createGeometryMask()); // Se aplica el recorte circular
        this.userUIContainer.add(avatar);

        // Borde dorado para el avatar
        const bordeAvatar = this.add.graphics();
        bordeAvatar.lineStyle(4, 0xFFD700, 1); // Grosor 4, Color dorado (Hex: FFD700), Opacidad 1
        bordeAvatar.strokeCircle(-45, 0, 32); // Coincide exactamente con la posición y radio de la máscara
        this.userUIContainer.add(bordeAvatar);

        // Nombre
        let nombreCorto = currentUser.nombre;
        if (nombreCorto.length > 10) nombreCorto = nombreCorto.substring(0, 10) + '.';
        const txtName = this.add.text(-10, -20, nombreCorto, { 
            fontFamily: 'Courier New', fontSize: '18px', fill: '#000', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.userUIContainer.add(txtName);

        let logs = JSON.parse(localStorage.getItem('gameLogs')) || [];
        let userLogs = logs.filter(l => l.userId === currentUser.id);

        // Calcular puntaje acumulado
        let puntaje = 0;
        userLogs.forEach(l => {
            if (l.isCorrect) {
                // MiloScene da 20 puntos por acierto, los demás minijuegos dan 10
                if (l.gameId === 'MiloScene') puntaje += 20;
                else puntaje += 10;
            }
        });

        // Texto Puntaje
        const txtScore = this.add.text(-10, 0, `Pts: ${puntaje}`, {
            fontFamily: 'Courier New', fontSize: '14px', fill: '#000', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.userUIContainer.add(txtScore);

        // Círculos de progreso
        const games = ['TaquillaScene', 'PoligonoScene', 'MagoScene', 'MiloScene', 'DagasScene'];
        let jugados = JSON.parse(localStorage.getItem('juegosJugados')) || {};
        let userJugados = jugados[currentUser.id] || [];

        games.forEach((gameId, index) => {
            let hasPlayed = userJugados.includes(gameId) || userLogs.some(l => l.gameId === gameId);
            let circle = this.add.graphics();
            let color = hasPlayed ? 0x00cc00 : 0xcc0000;
            circle.fillStyle(color, 1);
            circle.lineStyle(1, 0x000000, 1);
            let radio = (index === games.length - 1) ? 8 : 5; // El último círculo es más grande
            circle.fillCircle(-10 + (index * 15), 20, radio);
            circle.strokeCircle(-10 + (index * 15), 20, radio);
            this.userUIContainer.add(circle);
        });
    }

    marcarJuegoJugado(gameId) {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return;
        const currentUser = JSON.parse(currentUserStr);
        let jugados = JSON.parse(localStorage.getItem('juegosJugados')) || {};
        if (!jugados[currentUser.id]) {
            jugados[currentUser.id] = [];
        }
        if (!jugados[currentUser.id].includes(gameId)) {
            jugados[currentUser.id].push(gameId);
            localStorage.setItem('juegosJugados', JSON.stringify(jugados));
        }
    }
}