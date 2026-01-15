// Ponto de entrada principal do jogo

// Espera o DOM e THREE estarem carregados
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se THREE está disponível
    if (typeof THREE === 'undefined') {
        console.error('THREE.js não foi carregado!');
        alert('Erro: THREE.js não carregou. Recarregue a página.');
        return;
    }
    
    // Aguarda mais um pouco para garantir que tudo carregou
    setTimeout(initGame, 100);
});

function initGame() {
    try {
        // Cria instância do jogo
        window.game = new Game();
        
        // Configura botões do menu
        const startBtn = document.getElementById('start-btn');
        const controlsBtn = document.getElementById('controls-btn');
        const backBtn = document.getElementById('back-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                window.game.start();
                document.getElementById('start-menu').classList.add('hidden');
            });
        }
        
        if (controlsBtn) {
            controlsBtn.addEventListener('click', function() {
                document.getElementById('start-menu').classList.add('hidden');
                document.getElementById('controls-menu').classList.remove('hidden');
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                document.getElementById('controls-menu').classList.add('hidden');
                document.getElementById('start-menu').classList.remove('hidden');
            });
        }
        
        // Detecta se é mobile e mostra controles touch
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'flex';
            }
        }
        
        // Pausa/Continua com a tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && window.game) {
                window.game.togglePause();
            }
        });
        
        // Previne comportamento padrão em mobile
        document.addEventListener('touchmove', function(e) {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Previne menu de contexto no canvas
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
        }
        
        console.log('Jogo inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
        document.getElementById('loading-text').textContent = 'Erro ao carregar o jogo: ' + error.message;
    }
}
