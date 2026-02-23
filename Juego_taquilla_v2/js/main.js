/**
 * Configuración de Phaser para "La Taquilla de Pepe"
 */

const config = {
    type: Phaser.CANVAS, 
    
    width: 800,
    height: 600,
    parent: 'game-container',
    
    backgroundColor: '#2c1a1a', 

    render: {
        pixelArt: true,      
        antialias: false,    
        roundPixels: true
    },

    scene: [GameScene],

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