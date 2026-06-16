class PerfilScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PerfilScene' });
    }

    create() {
        let perfilContainer = document.getElementById('perfil-container');
        
        // Si no existe, lo creamos dinámicamente y lo agregamos al body
        if (!perfilContainer) {
            perfilContainer = document.createElement('div');
            perfilContainer.id = 'perfil-container';
            document.body.appendChild(perfilContainer);
        }
        
        // Estilos para centrar y ajustar el contenedor al navegador
        Object.assign(perfilContainer.style, {
            display: 'block',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#663030',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)',
            fontFamily: 'Courier New, monospace',
            zIndex: '1000'
        });

        // Lista de imágenes disponibles en la carpeta assets/perfil/
        const imagenesDisponibles = ['avatar_1.png', 'avatar_2.png', 'avatar_3.png', 'avatar_4.png'];

        // Formulario dinámicamente
        const formHTML = `
            <style>
                #perfil-form label { display: block; margin-top: 10px; font-weight: bold; }
                #perfil-form input, #perfil-form select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
                #perfil-form input[type="submit"] { background-color: #4CAF50; color: white; border: none; padding: 10px; margin-top: 20px; width: 100%; cursor: pointer; border-radius: 4px; font-size: 16px; }
                #perfil-form input[type="submit"]:hover { background-color: #45a049; }
                /* Estilos para selección de avatar */
                .avatar-grid { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 10px 0; }
                .avatar-option { cursor: pointer; }
                .avatar-option input { display: none; }
                .avatar-option img { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #ccc; object-fit: cover; transition: 0.3s; background: #fff; }
                .avatar-option input:checked + img { border-color: #4CAF50; transform: scale(1.1); box-shadow: 0 0 10px rgba(76,175,80,0.5); }
            </style>
            <h2 style="text-align:center; margin-top:0;">Perfil de Jugador</h2>
            <form id="perfil-form">
                <label>Selecciona tu Avatar:</label>
                <div class="avatar-grid">
                    ${imagenesDisponibles.map(img => `
                        <label class="avatar-option">
                            <input type="radio" name="imagen" value="assets/perfil/${img}" required>
                            <img src="assets/perfil/${img}" alt="Avatar">
                        </label>
                    `).join('')}
                </div>

                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" pattern="[a-zA-ZÁÉÍÓÚáéíóúÑñÜü ]+" title="Solo se permiten letras" required>
                <label for="apellido">Apellido:</label>
                <input type="text" id="apellido" name="apellido" pattern="[a-zA-ZÁÉÍÓÚáéíóúÑñÜü ]+" title="Solo se permiten letras" required>
                <label for="username">Nombre de Usuario (Login):</label>
                <input type="text" id="username" name="username" maxlength="8" required>
                <label for="password">Contraseña (Login):</label>
                <input type="password" id="password" name="password" maxlength="8" required>
                <label for="sexo">Sexo:</label>
                <select id="sexo" name="sexo">
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                </select>
                
                <label for="edad">Edad:</label>
                <input type="number" id="edad" name="edad" min="9" max="13" required>
                <label for="grado">Grado Escolar:</label>
                <select id="grado" name="grado" required>
                    <option value="5to A">5to Sección A</option>
                    <option value="5to B">5to Sección B</option>
                    <option value="6to Unica">6to Sección Única</option>
                </select>
                
                <input type="submit" value="Guardar y Salir">
            </form>
        `;
        perfilContainer.innerHTML = formHTML;

        // Gestionar el envío del formulario
        const form = document.getElementById('perfil-form');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            // Lógica para guardar la información del perfil
            const formData = new FormData(form);
            
            const nombre = formData.get('nombre').trim();
            const apellido = formData.get('apellido').trim();
            const username = formData.get('username').trim();
            const password = formData.get('password').trim();
            const edad = parseInt(formData.get('edad'), 10);

            // Validaciones adicionales por JavaScript por seguridad
            const regexLetras = /^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]+$/;
            if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
                alert("Los nombres y apellidos solo pueden contener letras.");
                return;
            }
            if (username.length > 8 || password.length > 8) {
                alert("El usuario y la contraseña deben tener un máximo de 8 caracteres.");
                return;
            }
            if (edad < 9 || edad > 13) {
                alert("La edad debe estar comprendida entre 9 y 13 años.");
                return;
            }
            
            const usernameLower = username.toLowerCase();
            if (usernameLower.includes('admin') || usernameLower.includes('administrador')) {
                alert("El nombre de usuario no está permitido. Por favor, elige otro.");
                return;
            }

            const perfilData = {
                id: 'STU_' + Math.floor(Math.random() * 100000), // Generar ID automático
                nombre: nombre,
                apellido: apellido,
                username: username,
                password: password,
                sexo: formData.get('sexo'),
                imagen: formData.get('imagen'),
                edad: edad,
                grado: formData.get('grado')
            };
            console.log('Información del perfil guardada:', perfilData);
            
            // Agregar usuario al log de cuentas y autorizar acceso inmediato
            let users = JSON.parse(localStorage.getItem('gameUsers')) || [];
            users.push(perfilData);
            localStorage.setItem('gameUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(perfilData));

            // Iniciar conteo de sesiones (Primera sesión al registrarse)
            let userSessions = JSON.parse(localStorage.getItem('userSessions')) || {};
            userSessions[perfilData.id] = 1;
            localStorage.setItem('userSessions', JSON.stringify(userSessions));

            // Ocultar el formulario y volver al menú principal
            perfilContainer.remove();
            this.scene.start('MenuScene');
        });
    }
}