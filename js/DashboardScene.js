class DashboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DashboardScene' });
    }

    create() {
        const dashContainer = document.createElement('div');
        dashContainer.id = 'dashboard-container';
        Object.assign(dashContainer.style, {
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'Arial, sans-serif',
            overflowY: 'auto', zIndex: '2000', padding: '20px', boxSizing: 'border-box'
        });
        document.body.appendChild(dashContainer);

        this.dashContainer = dashContainer;
        this.renderUserList();
    }

    getNavbarHTML() {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #333; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <h1 style="margin: 0; font-size: 22px;">Panel de Control</h1>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-nav-usuarios" style="padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold;">Usuarios</button>
                    <button id="btn-nav-descargar" style="padding: 10px 15px; background: #008CBA; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold;">Descargar JSON</button>
                    <button id="btn-cerrar-dash" style="padding: 10px 15px; background: #f44336; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold;">Volver al Menú</button>
                </div>
            </div>
        `;
    }

    attachNavbarEvents() {
        document.getElementById('btn-nav-usuarios').addEventListener('click', () => this.renderUserList());
        document.getElementById('btn-nav-descargar').addEventListener('click', () => this.descargarJSONDatos());
        document.getElementById('btn-cerrar-dash').addEventListener('click', () => {
            this.dashContainer.remove();
            this.scene.start('MenuScene');
        });
    }

    descargarJSONDatos() {
        const data = {
            usuarios: JSON.parse(localStorage.getItem('gameUsers')) || [],
            metricas: JSON.parse(localStorage.getItem('gameLogs')) || [],
            bktState: JSON.parse(localStorage.getItem('bktState')) || {},
            qTable: JSON.parse(localStorage.getItem('qTable')) || {},
            juegosJugados: JSON.parse(localStorage.getItem('juegosJugados')) || {}
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'datos_completos_circo.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    renderUserList() {
        let users = JSON.parse(localStorage.getItem('gameUsers')) || [];
        
        let html = this.getNavbarHTML() + `
            <h2>Estudiantes Registrados</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        `;

        if (users.length === 0) {
            html += `<p>No hay estudiantes registrados en el sistema.</p>`;
        } else {
            users.forEach(u => {
                html += `
                    <div class="user-card" data-id="${u.id}" style="position: relative; background: #333; padding: 15px; border-radius: 8px; width: 250px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.2s;">
                        <span class="btn-delete-user" data-id="${u.id}" style="position: absolute; top: 5px; right: 10px; color: #ff4c4c; font-size: 20px; font-weight: bold; cursor: pointer;" title="Eliminar usuario">&times;</span>
                        <img src="${u.imagen || 'assets/perfil/avatar_1.png'}" style="width: 80px; height: 80px; border-radius: 50%; display: block; margin: 0 auto 10px; background: #fff; object-fit: cover;">
                        <h3 style="text-align: center; margin: 0 0 5px 0;">${u.nombre} ${u.apellido}</h3>
                        <p style="margin: 2px 0; font-size: 14px; text-align: center;">Edad: ${u.edad} | Grado: ${u.grado || 'N/A'}</p>
                        <p style="margin: 2px 0; font-size: 12px; text-align: center; color: #aaa;">Usuario: ${u.username}</p>
                    </div>
                `;
            });
        }
        html += `</div>`;
        this.dashContainer.innerHTML = html;

        this.attachNavbarEvents();

        const cards = this.dashContainer.querySelectorAll('.user-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.05)');
            card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
            card.addEventListener('click', (e) => {
                // Solo entramos a las métricas si NO se hizo clic en el botón de eliminar
                if (!e.target.classList.contains('btn-delete-user')) {
                    this.renderUserMetrics(card.getAttribute('data-id'));
                }
            });
        });

        const deleteBtns = this.dashContainer.querySelectorAll('.btn-delete-user');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que se abra la pantalla de métricas
                const userId = btn.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar a este estudiante? Se borrarán todos sus datos y métricas permanentemente.')) {
                    this.deleteUser(userId);
                }
            });
        });
    }

    deleteUser(userId) {
        // Eliminar de los perfiles de usuario
        let users = JSON.parse(localStorage.getItem('gameUsers')) || [];
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('gameUsers', JSON.stringify(users));

        // Eliminar las métricas (logs)
        let logs = JSON.parse(localStorage.getItem('gameLogs')) || [];
        logs = logs.filter(l => l.userId !== userId);
        localStorage.setItem('gameLogs', JSON.stringify(logs));

        // Eliminar registro de juegos jugados
        let jugados = JSON.parse(localStorage.getItem('juegosJugados')) || {};
        if (jugados[userId]) {
            delete jugados[userId];
            localStorage.setItem('juegosJugados', JSON.stringify(jugados));
        }

        // Si el usuario a eliminar es el que tiene la sesión activa actualmente, cerrarla
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id === userId) {
            localStorage.removeItem('currentUser');
        }

        // Volver a dibujar la lista actualizada
        this.renderUserList();
    }

    renderUserMetrics(userId) {
        let users = JSON.parse(localStorage.getItem('gameUsers')) || [];
        let user = users.find(u => u.id === userId);
        let logs = JSON.parse(localStorage.getItem('gameLogs')) || [];
        let userLogs = logs.filter(l => l.userId === userId);

        if (userLogs.length === 0) {
            this.dashContainer.innerHTML = this.getNavbarHTML() + `
                <div style="margin-bottom: 20px;">
                    <button id="btn-back-list" style="padding: 8px 15px; background: #555; color: white; border: none; cursor: pointer; border-radius: 5px;">&larr; Volver a Usuarios</button>
                </div>
                <h2>Métricas del Estudiante</h2>
                <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3>Metadatos del Estudiante</h3>
                    <img src="${user.imagen || 'assets/perfil/avatar_1.png'}" style="width: 100px; height: 100px; border-radius: 50%; float: right; background: #fff;">
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Nombre:</strong> ${user.nombre} ${user.apellido}</p>
                    <p><strong>Usuario:</strong> ${user.username}</p>
                    <p><strong>Contraseña:</strong> <span style="font-family: monospace; background: #111; padding: 2px 4px; border-radius: 3px; color: #d4a373;">${user.password}</span></p>
                    <p><strong>Edad:</strong> ${user.edad} | <strong>Sexo:</strong> ${user.sexo}</p>
                    <p><strong>Grado:</strong> ${user.grado}</p>
                </div>
                <p>Este estudiante aún no ha interactuado con ningún minijuego. No hay métricas disponibles.</p>
            `;
            this.attachNavbarEvents();
            document.getElementById('btn-back-list').addEventListener('click', () => this.renderUserList());
            return;
        }

        let totalTime = userLogs.reduce((acc, l) => acc + (l.responseTime || 0), 0).toFixed(2);
        
        let html = this.getNavbarHTML() + `
            <div style="margin-bottom: 20px;">
                <button id="btn-back-list" style="padding: 8px 15px; background: #555; color: white; border: none; cursor: pointer; border-radius: 5px;">&larr; Volver a Usuarios</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
                <!-- 1. Datos de Identificación y Contexto -->
                <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                    <h3>1. Metadatos del Estudiante</h3>
                    <img src="${user.imagen || 'assets/perfil/avatar_1.png'}" style="width: 100px; height: 100px; border-radius: 50%; float: right; background: #fff;">
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Nombre:</strong> ${user.nombre} ${user.apellido}</p>
                    <p><strong>Usuario:</strong> ${user.username}</p>
                    <p><strong>Contraseña:</strong> <span style="font-family: monospace; background: #111; padding: 2px 4px; border-radius: 3px; color: #d4a373;">${user.password}</span></p>
                    <p><strong>Edad:</strong> ${user.edad} | <strong>Sexo:</strong> ${user.sexo}</p>
                    <p><strong>Grado:</strong> ${user.grado}</p>
                    <p><strong>Tiempo en Sesión:</strong> ${totalTime} seg</p>
                    <p><strong>Total Interacciones:</strong> ${userLogs.length}</p>
                </div>

                <!-- 5. Gráficas de Desempeño por Juego -->
                <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                    <h3>5. Desempeño por Minijuego (Aciertos vs Errores)</h3>
                    <div style="display: flex; gap: 25px; align-items: flex-end; height: 150px; padding-top: 20px; border-bottom: 1px solid #555;">
                        ${this.generateChartsHTML(userLogs)}
                    </div>
                    <div style="margin-top: 10px; font-size: 12px;"><span style="color:#4CAF50;">■ Aciertos</span> &nbsp; <span style="color:#F44336;">■ Errores</span></div>
                </div>
            </div>

            <!-- 2 y 3. Trazas de Interacción y Evidencias -->
            <div style="margin-top: 20px; background: #2a2a2a; padding: 20px; border-radius: 8px; overflow-x: auto;">
                <h3>2 & 3. Trazas de Interacción y Evidencias (Event Log)</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead><tr style="border-bottom: 1px solid #555; background: #333;">
                        <th style="padding: 10px;">Juego</th><th style="padding: 10px;">Habilidad (KC)</th><th style="padding: 10px;">P(L_t) BKT</th>
                        <th style="padding: 10px;">Respuesta (r)</th><th style="padding: 10px;">Input Niño</th><th style="padding: 10px;">Tiempo (s)</th>
                    </tr></thead>
                    <tbody>${userLogs.map(l => `<tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 8px;">${l.gameId}</td><td style="padding: 8px;">${l.kc}</td><td style="padding: 8px;">${l.initialState.toFixed(2)}</td>
                        <td style="padding: 8px; color: ${l.isCorrect ? '#4CAF50' : '#F44336'}">${l.isCorrect ? 'Correcto (1)' : 'Error (0)'}</td><td style="padding: 8px;">${l.input}</td><td style="padding: 8px;">${l.responseTime}s</td>
                    </tr>`).join('')}</tbody>
                </table>
            </div>

            <!-- 4 y 6. Comparación Algoritmos RL vs BKT -->
            <div style="margin-top: 20px; background: #2a2a2a; padding: 20px; border-radius: 8px; overflow-x: auto;">
                <h3>4 & 6. Comparación de Agentes: RL vs BKT</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead><tr style="border-bottom: 1px solid #555; background: #333;">
                        <th style="padding: 10px;">Seq (t)</th><th style="padding: 10px;">KC</th>
                        <th style="padding: 10px; border-left: 2px solid #555;">BKT: P(Lt-1)</th><th style="padding: 10px;">BKT: Transición P(L_next)</th><th style="padding: 10px;">BKT: P(S)/P(G)</th>
                        <th style="padding: 10px; border-left: 2px solid #555;">RL: Nivel (S)</th><th style="padding: 10px;">RL: Recompensa (r)</th><th style="padding: 10px;">RL: Nuevo Q(s,a)</th>
                    </tr></thead>
                    <tbody>${userLogs.map((l, index) => `<tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 8px;">${index + 1}</td><td style="padding: 8px;">${l.kc}</td>
                        <td style="padding: 8px; border-left: 2px solid #555;">${l.bktParams.pL0.toFixed(2)}</td><td style="padding: 8px; color: #d4a373;">${l.bktParams.pNext.toFixed(2)}</td><td style="padding: 8px;">S:${l.bktParams.pS.toFixed(2)} | G:${l.bktParams.pG.toFixed(2)}</td>
                        <td style="padding: 8px; border-left: 2px solid #555;">${l.algoPrediction}</td><td style="padding: 8px; color: ${l.reward > 0 ? '#4CAF50' : '#F44336'}">${l.reward.toFixed(2)}</td><td style="padding: 8px;">${l.qUpdate.toFixed(2)}</td>
                    </tr>`).join('')}</tbody>
                </table>
            </div>
        `;
        this.dashContainer.innerHTML = html;
        this.attachNavbarEvents();
        document.getElementById('btn-back-list').addEventListener('click', () => this.renderUserList());
    }

    generateChartsHTML(logs) {
        let stats = {};
        logs.forEach(l => {
            if(!stats[l.gameId]) stats[l.gameId] = { correct: 0, error: 0, total: 0 };
            stats[l.gameId].total++;
            if(l.isCorrect) stats[l.gameId].correct++;
            else stats[l.gameId].error++;
        });

        let html = '';
        for (let game in stats) {
            let correctPct = (stats[game].correct / stats[game].total) * 100;
            let errorPct = (stats[game].error / stats[game].total) * 100;
            html += `<div style="display: flex; flex-direction: column; align-items: center; width: 80px;">
                <div style="display: flex; gap: 2px; height: 100px; align-items: flex-end; margin-bottom: 5px;">
                    <div style="width: 25px; height: ${correctPct}%; background: #4CAF50;" title="Correctos: ${stats[game].correct}"></div>
                    <div style="width: 25px; height: ${errorPct}%; background: #F44336;" title="Errores: ${stats[game].error}"></div>
                </div><span style="font-size: 11px; text-align: center; word-wrap: break-word; width: 100%;">${game.replace('Scene','')}</span>
            </div>`;
        }
        return html;
    }
}