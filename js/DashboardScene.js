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
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs')) || [];
        const allUsers = JSON.parse(localStorage.getItem('gameUsers')) || [];

        // Identificar y excluir al admin de los datos a exportar
        const adminIds = allUsers.filter(u => u.username === 'admin' || u.id === 'ADMIN_000').map(u => u.id);
        const usuariosExportados = allUsers.filter(u => !adminIds.includes(u.id));
        const logsExportados = gameLogs.filter(l => !adminIds.includes(l.userId));
        
        // Mapear métricas para que el JSON exportado tenga exactamente los campos y orden solicitados
        const metricasExportadas = logsExportados.map(l => ({
            userId: l.userId,
            gameId: l.gameId,
            kc: l.kc,
            numeroIntento: l.numeroIntento || l["numero de intento"] || 1,
            isCorrect: l.isCorrect,
            input: l.input,
            pregunta: l.pregunta || 'N/A',
            respuestaCorrecta: l.respuestaCorrecta !== undefined ? l.respuestaCorrecta : (l["respuesta correcta"] !== undefined ? l["respuesta correcta"] : 'N/A'),
            responseTime: l.responseTime,
            timestamp: l.timestamp
        }));

        // Obtener el resto de los datos y limpiar registros del admin
        let bktState = JSON.parse(localStorage.getItem('bktState')) || {};
        let qTable = JSON.parse(localStorage.getItem('qTable')) || {};
        let juegosJugados = JSON.parse(localStorage.getItem('juegosJugados')) || {};

        adminIds.forEach(id => {
            delete bktState[id];
            delete qTable[id];
            delete juegosJugados[id];
        });

        const data = {
            usuarios: usuariosExportados,
            metricas: metricasExportadas,
            bktState: bktState,
            qTable: qTable,
            juegosJugados: juegosJugados
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'datos_completos_circo.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    generateGradeComparisonChart() {
        let users = JSON.parse(localStorage.getItem('gameUsers')) || [];
        let logs = JSON.parse(localStorage.getItem('gameLogs')) || [];

        let components = ["Suma", "Resta", "Multiplicación", "División"];
        
        // Función para normalizar el nombre del KC en 4 categorías principales
        let normalizeKC = (kc) => {
            if (!kc) return "Otro";
            let k = kc.toLowerCase();
            if (k.includes("suma")) return "Suma";
            if (k.includes("resta")) return "Resta";
            if (k.includes("multiplic")) return "Multiplicación";
            if (k.includes("divisi")) return "División";
            return "Otro";
        };

        let stats = {
            "5to A": { "Suma": {c:0, t:0}, "Resta": {c:0, t:0}, "Multiplicación": {c:0, t:0}, "División": {c:0, t:0} },
            "5to B": { "Suma": {c:0, t:0}, "Resta": {c:0, t:0}, "Multiplicación": {c:0, t:0}, "División": {c:0, t:0} },
            "6to Unica": { "Suma": {c:0, t:0}, "Resta": {c:0, t:0}, "Multiplicación": {c:0, t:0}, "División": {c:0, t:0} }
        };

        // Procesar todos los logs y clasificarlos por grado y componente
        logs.forEach(log => {
            let user = users.find(u => u.id === log.userId);
            if (!user) return;
            
            let grade = null;
            if (user.grado === "5to A" || user.grado === "5to") grade = "5to A"; // "5to" como fallback de registros antiguos
            else if (user.grado === "5to B") grade = "5to B";
            else if (user.grado === "6to Unica" || user.grado === "6to") grade = "6to Unica";

            if (!grade) return;

            let comp = normalizeKC(log.kc);
            if (stats[grade] && stats[grade][comp]) {
                stats[grade][comp].t++;
                if (log.isCorrect) stats[grade][comp].c++;
            }
        });

        // Construir la interfaz de la gráfica comparativa
        let html = `<div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <h2 style="margin-top: 0; margin-bottom: 20px; color: #d4a373;">Comparativa de Rendimiento por Grado</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">`;

        let colors = { "5to A": "#4CAF50", "5to B": "#2196F3", "6to Unica": "#FF9800" };

        components.forEach(comp => {
            html += `<div style="background: #333; padding: 15px; border-radius: 8px;">
                <h3 style="text-align: center; margin-top: 0; border-bottom: 1px solid #555; padding-bottom: 10px;">${comp}</h3>`;
            
            Object.keys(stats).forEach(grade => {
                let data = stats[grade][comp];
                let pct = data.t > 0 ? Math.round((data.c / data.t) * 100) : 0;
                let color = colors[grade];
                
                html += `
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px;">
                            <span>${grade}</span>
                            <span title="${data.c} aciertos de ${data.t} intentos">${pct}%</span>
                        </div>
                        <div style="width: 100%; background: #555; border-radius: 4px; height: 12px; overflow: hidden;">
                            <div style="width: ${pct}%; background: ${color}; height: 100%;"></div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        });

        html += `</div></div>`;
        return html;
    }

   renderUserList() {
        let allUsers = JSON.parse(localStorage.getItem('gameUsers')) || []; //
        
        // Excluir al admin de la lista visual y de los contadores del Dashboard
        let users = allUsers.filter(u => u.username !== 'admin' && u.id !== 'ADMIN_000'); //

        // === NUEVA LÓGICA DE CONTADORES POR GRADO ===
        let contadores = {
            "5to A": 0,
            "5to B": 0,
            "6to Unica": 0,
            "Total": users.length
        };

        // Procesar y contar cada estudiante según su grado escolar registrado
        users.forEach(u => {
            if (u.grado === "5to A") contadores["5to A"]++;
            else if (u.grado === "5to B") contadores["5to B"]++;
            else if (u.grado === "6to Unica") contadores["6to Unica"]++;
        });

        // Crear los bloques de HTML para los contadores rápidos
        let contadoresHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: #333; padding: 15px; border-radius: 8px; text-align: center; border-left: 5px solid #4CAF50; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <h4 style="margin: 0; color: #aaa; font-size: 14px;">5to grado "A"</h4>
                    <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #fff;">${contadores["5to A"]}</p>
                </div>
                <div style="background: #333; padding: 15px; border-radius: 8px; text-align: center; border-left: 5px solid #2196F3; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <h4 style="margin: 0; color: #aaa; font-size: 14px;">5to grado "B"</h4>
                    <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #fff;">${contadores["5to B"]}</p>
                </div>
                <div style="background: #333; padding: 15px; border-radius: 8px; text-align: center; border-left: 5px solid #FF9800; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <h4 style="margin: 0; color: #aaa; font-size: 14px;">6to grado "U"</h4>
                    <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #fff;">${contadores["6to Unica"]}</p>
                </div>
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; text-align: center; border: 1px dashed #d4a373; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <h4 style="margin: 0; color: #d4a373; font-size: 14px;">Total Estudiantes</h4>
                    <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #d4a373;">${contadores["Total"]}</p>
                </div>
            </div>
        `;

        // Construir el HTML completo inyectando la barra de navegación, los contadores, la gráfica y la lista
        let html = this.getNavbarHTML() + `
            ${contadoresHTML}
            ${this.generateGradeComparisonChart()}
            <h2>Estudiantes Registrados</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        `; //

        if (users.length === 0) {
            html += `<p>No hay estudiantes registrados en el sistema.</p>`; //
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
                `; //
            });
        }
        html += `</div>`; //
        this.dashContainer.innerHTML = html; //

        this.attachNavbarEvents(); //

        const cards = this.dashContainer.querySelectorAll('.user-card'); //
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.05)'); //
            card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)'); //
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-delete-user')) {
                    this.renderUserMetrics(card.getAttribute('data-id')); //
                }
            });
        });

        const deleteBtns = this.dashContainer.querySelectorAll('.btn-delete-user'); //
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); //
                const userId = btn.getAttribute('data-id'); //
                if (confirm('¿Estás seguro de que deseas eliminar a este estudiante? Se borrarán todos sus datos y métricas permanentemente.')) {
                    this.deleteUser(userId); //
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
                    <div style="margin-top: 15px; font-size: 13px; text-align: center;">
                        <span style="color:#4CAF50; font-weight: bold;">■ Barra Verde:</span> Aciertos &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
                        <span style="color:#F44336; font-weight: bold;">■ Barra Roja:</span> Errores &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
                        <span style="color:#ccc; font-weight: bold;">Total:</span> Cantidad de preguntas realizadas
                    </div>
                </div>
            </div>

            <!-- 2 y 3. Trazas de Interacción y Evidencias -->
            <div style="margin-top: 20px; background: #2a2a2a; padding: 20px; border-radius: 8px; overflow-x: auto;">
                <h3>2 & 3. Trazas de Interacción y Evidencias (Event Log)</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead><tr style="border-bottom: 1px solid #555; background: #333;">
                        <th style="padding: 10px;">Juego</th>
                        <th style="padding: 10px;">Habilidad (KC)</th>
                        <th style="padding: 10px;">Intento</th>
                        <th style="padding: 10px;">Respuesta</th>
                        <th style="padding: 10px;">Input Niño</th>
                        <th style="padding: 10px;">Pregunta</th>
                        <th style="padding: 10px;">R. Correcta</th>
                        <th style="padding: 10px;">Tiempo (s)</th>
                        <th style="padding: 10px;">Timestamp</th>
                    </tr></thead>
                    <tbody>${userLogs.map(l => `<tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 8px;">${l.gameId}</td>
                        <td style="padding: 8px;">${l.kc}</td>
                        <td style="padding: 8px;">${l.numeroIntento || l["numero de intento"] || 1}</td>
                        <td style="padding: 8px; font-weight: bold; color: ${l.isCorrect ? '#4CAF50' : '#F44336'}">${l.isCorrect ? 'Correcto' : 'Incorrecto'}</td>
                        <td style="padding: 8px;">${l.input}</td>
                        <td style="padding: 8px;">${l.pregunta || 'N/A'}</td>
                        <td style="padding: 8px;">${l['respuesta correcta'] !== undefined ? l['respuesta correcta'] : (l.respuestaCorrecta !== undefined ? l.respuestaCorrecta : 'N/A')}</td>
                        <td style="padding: 8px;">${l.responseTime}s</td>
                        <td style="padding: 8px;">${new Date(l.timestamp).toLocaleString()}</td>
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
            html += `<div style="display: flex; flex-direction: column; align-items: center; width: 100px;">
                <div style="display: flex; gap: 2px; height: 100px; align-items: flex-end; margin-bottom: 5px;">
                    <div style="width: 25px; height: ${correctPct}%; background: #4CAF50; display: flex; justify-content: center; align-items: flex-start; padding-top: 4px; color: white; font-size: 11px; font-weight: bold;" title="Correctos: ${stats[game].correct}">${stats[game].correct > 0 ? stats[game].correct : ''}</div>
                    <div style="width: 25px; height: ${errorPct}%; background: #F44336; display: flex; justify-content: center; align-items: flex-start; padding-top: 4px; color: white; font-size: 11px; font-weight: bold;" title="Errores: ${stats[game].error}">${stats[game].error > 0 ? stats[game].error : ''}</div>
                    <div style="font-size: 10px; color: #ccc; margin-left: 4px; align-self: center; text-align: center;">Total<br><b style="font-size: 12px; color: #fff;">${stats[game].total}</b></div>
                </div><span style="font-size: 12px; text-align: center; word-wrap: break-word; width: 100%; font-weight: bold; color: #d4a373;">${game.replace('Scene','')}</span>
            </div>`;
        }
        return html;
    }
}