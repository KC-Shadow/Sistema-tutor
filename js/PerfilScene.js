class PerfilScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PerfilScene' });
    }

    create() {
        const perfilContainer = document.getElementById('perfil-container');
        
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
                #btn-descargar { background-color: #008CBA; color: white; border: none; padding: 10px; margin-top: 10px; width: 100%; cursor: pointer; border-radius: 4px; font-size: 16px; }
                #btn-descargar:hover { background-color: #007bb5; }
                #btn-volver { background-color: #f44336; color: white; border: none; padding: 10px; margin-top: 10px; width: 100%; cursor: pointer; border-radius: 4px; font-size: 16px; }
                #btn-volver:hover { background-color: #d32f2f; }
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
                <input type="text" id="nombre" name="nombre" required>
                <label for="apellido">Apellido:</label>
                <input type="text" id="apellido" name="apellido" required>
                <label for="sexo">Sexo:</label>
                <select id="sexo" name="sexo">
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                </select>
                
                <label for="edad">Edad:</label>
                <input type="number" id="edad" name="edad" required>
                <label for="id">ID:</label>
                <input type="text" id="id" name="id" required>
                
                <input type="submit" value="Guardar y Salir">
                <button type="button" id="btn-descargar">Descargar JSON</button>
                <button type="button" id="btn-volver">Volver al Menú</button>
            </form>
        `;
        perfilContainer.innerHTML = formHTML;

        // Gestionar el envío del formulario
        const form = document.getElementById('perfil-form');

        // Botón Descargar JSON
        document.getElementById('btn-descargar').addEventListener('click', () => {
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            const formData = new FormData(form);
            const perfilData = {
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                sexo: formData.get('sexo'),
                imagen: formData.get('imagen'),
                edad: formData.get('edad'),
                id: formData.get('id')
            };
            const blob = new Blob([JSON.stringify(perfilData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'perfil_jugador.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            // Lógica para guardar la información del perfil
            const formData = new FormData(form);
            const perfilData = {
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                sexo: formData.get('sexo'),
                imagen: formData.get('imagen'),
                edad: formData.get('edad'),
                id: formData.get('id')
            };
            console.log('Información del perfil guardada:', perfilData);
            
            // Guardar en LocalStorage (para que el juego recuerde los datos)
            localStorage.setItem('perfilJugador', JSON.stringify(perfilData));

            // Ocultar el formulario y volver al menú principal
            perfilContainer.style.display = 'none';
            this.scene.start('MenuScene');
        });

        // Botón para volver al menú principal sin guardar (HTML)
        document.getElementById('btn-volver').addEventListener('click', () => {
            perfilContainer.style.display = 'none';
            this.scene.start('MenuScene');
        });
    }
}