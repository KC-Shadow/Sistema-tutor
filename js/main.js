/**
 * Configuración de Phaser para "La Taquilla de Pepe"
 */

const config = {
    type: Phaser.CANVAS, 
    
    width: 800,
    height: 600,
    parent: 'game-container',
    
    backgroundColor: '#2c1a1a', 

    // Escalado responsivo: ajusta el canvas a la vista manteniendo la relación de aspecto
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },

    render: {
        pixelArt: true,      
        antialias: false,    
        roundPixels: true
    },

    scene: [MenuScene, PerfilScene, TaquillaScene, DagasScene, PoligonoScene, MiloScene],

    // Física Arcade ligera
    physics: {
        default: 'arcade',
        arcade: {
            debug: false 
        }
    },

    fps: {
        target: 60,
        forceSetTimeOut: true
    }
};

// Inicialización del motor
const game = new Phaser.Game(config);

const style = document.createElement('style');
style.innerHTML = `
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: #2c1a1a; 
        overflow: hidden; 
    }
    #game-container {
        width: 100%;
        height: 100%;
        touch-action: none; 
    }
`;
document.head.appendChild(style);