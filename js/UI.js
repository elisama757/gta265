// Sistema de interface do usuário

class UI {
    constructor() {
        this.fpsElement = null;
        this.scoreElement = null;
        this.healthElement = null;
        this.hitMarker = null;
        this.pauseMenu = null;
        
        this.fpsValues = [];
        this.lastFPSUpdate = 0;
        
        this.init();
    }
    
    init() {
        this.createUIElements();
        console.log('UI inicializada');
    }
    
    createUIElements() {
        // Elementos já existem no HTML, apenas obtém referências
        this.fpsElement = document.getElementById('fps-counter');
        this.scoreElement = document.getElementById('score');
        this.healthElement = document.getElementById('health');
        
        // Cria hit marker dinâmico
        this.createHitMarker();
        
        // Cria menu de pause dinâmico
        this.createPauseMenu();
    }
    
    createHitMarker() {
        this.hitMarker = document.createElement('div');
        this.hitMarker.className = 'hit-marker';
        this.hitMarker.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 0, 0, 0.8);
            border-radius: 50%;
            opacity: 0;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
            transition: opacity 0.1s;
        `;
        
        document.getElementById('game-container').appendChild(this.hitMarker);
    }
    
    createPauseMenu() {
        // Remove menu de pause existente se houver
        const existingPauseMenu = document.getElementById('pause-menu');
        if (existingPauseMenu) {
            existingPauseMenu.remove();
        }
        
        this.pauseMenu = document.createElement('div');
        this.pauseMenu.id = 'pause-menu';
        this.pauseMenu.className = 'menu hidden';
        this.pauseMenu.innerHTML = `
            <h2>JOGO PAUSADO</h2>
            <button id="resume-btn">CONTINUAR</button>
            <button id="restart-btn">REINICIAR JOGO</button>
            <button id="quit-btn">SAIR PARA MENU</button>
            <div class="instructions" style="margin-top: 20px;">
                <p>Pressione ESC para continuar</p>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(this.pauseMenu);
        
        // Configura botões do pause menu
        this.setupPauseMenuButtons();
    }
    
    setupPauseMenuButtons() {
        const resumeBtn = document.getElementById('resume-btn');
        const restartBtn = document.getElementById('restart-btn');
        const quitBtn = document.getElementById('quit-btn');
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.resume();
                }
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (confirm('Reiniciar o jogo? O progresso será perdido.')) {
                    location.reload();
                }
            });
        }
        
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.isPaused = false;
                    this.hidePauseMenu();
                    
                    // Mostra menu inicial
                    document.getElementById('start-menu').classList.remove('hidden');
                    document.getElementById('controls-menu').classList.add('hidden');
                    
                    // Reseta estado do jogo
                    window.game.gameStarted = false;
                    window.game.score = 0;
                    this.updateScore(0);
                    
                    // Reposiciona jogador
                    if (window.game.player && window.game.player.mesh) {
                        window.game.player.mesh.position.set(0, 0, 0);
                    }
                }
            });
        }
    }
    
    updateFPS(fps) {
        if (!this.fpsElement) return;
        
        // Adiciona FPS à lista para média
        this.fpsValues.push(fps);
        
        // Atualiza a cada 500ms para suavizar
        const now = Date.now();
        if (now - this.lastFPSUpdate > 500) {
            const avgFPS = Math.round(
                this.fpsValues.reduce((a, b) => a + b, 0) / this.fpsValues.length
            );
            
            this.fpsElement.textContent = `FPS: ${avgFPS}`;
            
            // Cor baseada no FPS
            if (avgFPS >= 50) {
                this.fpsElement.style.color = '#2ecc71';
                this.fpsElement.style.borderColor = '#2ecc71';
            } else if (avgFPS >= 30) {
                this.fpsElement.style.color = '#f39c12';
                this.fpsElement.style.borderColor = '#f39c12';
            } else {
                this.fpsElement.style.color = '#e74c3c';
                this.fpsElement.style.borderColor = '#e74c3c';
            }
            
            this.fpsValues = [];
            this.lastFPSUpdate = now;
        }
    }
    
    updateScore(score) {
        if (!this.scoreElement) return;
        
        this.scoreElement.textContent = `Pontos: ${score}`;
        
        // Efeito visual ao ganhar muitos pontos rapidamente
        if (score > 0 && score % 500 === 0) {
            this.scoreElement.style.animation = 'none';
            setTimeout(() => {
                this.scoreElement.style.animation = 'pulse 0.5s';
            }, 10);
        }
    }
    
    updateHealth(health) {
        if (!this.healthElement) return;
        
        this.healthElement.textContent = `Vida: ${health}%`;
        
        // Cor baseada na vida
        if (health >= 70) {
            this.healthElement.style.color = '#2ecc71';
            this.healthElement.style.borderColor = '#2ecc71';
        } else if (health >= 30) {
            this.healthElement.style.color = '#f39c12';
            this.healthElement.style.borderColor = '#f39c12';
        } else {
            this.healthElement.style.color = '#e74c3c';
            this.healthElement.style.borderColor = '#e74c3c';
            
            // Pisca quando vida baixa
            if (health > 0) {
                this.healthElement.style.animation = 'pulse 1s infinite';
            }
        }
    }
    
    showHitMarker() {
        if (!this.hitMarker) return;
        
        // Reseta animação
        this.hitMarker.style.transition = 'none';
        this.hitMarker.style.opacity = '1';
        
        // Força reflow
        void this.hitMarker.offsetWidth;
        
        // Anima fade out
        this.hitMarker.style.transition = 'opacity 0.3s ease-out';
        this.hitMarker.style.opacity = '0';
    }
    
    showGameUI() {
        const uiOverlay = document.getElementById('ui-overlay');
        if (uiOverlay) {
            uiOverlay.style.display = 'block';
        }
        
        // Mostra controles mobile se for mobile
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'flex';
            }
        }
    }
    
    showPauseMenu() {
        if (!this.pauseMenu) return;
        
        this.pauseMenu.classList.remove('hidden');
        
        // Pausa o jogo (já está pausado, mas garante)
        if (window.game) {
            window.game.isPaused = true;
        }
    }
    
    hidePauseMenu() {
        if (!this.pauseMenu) return;
        
        this.pauseMenu.classList.add('hidden');
    }
    
    showGameOver() {
        // Cria tela de game over
        const gameOverMenu = document.createElement('div');
        gameOverMenu.id = 'gameover-menu';
        gameOverMenu.className = 'menu';
        gameOverMenu.innerHTML = `
            <h2 style="color: #e74c3c;">GAME OVER</h2>
            <div style="font-size: 24px; margin: 20px 0;">
                Pontuação Final: <span id="final-score">${window.game ? window.game.score : 0}</span>
            </div>
            <button id="play-again-btn">JOGAR NOVAMENTE</button>
            <button id="gameover-quit-btn">SAIR PARA MENU</button>
        `;
        
        document.getElementById('game-container').appendChild(gameOverMenu);
        
        // Configura botões
        document.getElementById('play-again-btn').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('gameover-quit-btn').addEventListener('click', () => {
            gameOverMenu.remove();
            
            // Mostra menu inicial
            document.getElementById('start-menu').classList.remove('hidden');
            
            // Esconde UI do jogo
            const uiOverlay = document.getElementById('ui-overlay');
            if (uiOverlay) {
                uiOverlay.style.display = 'none';
            }
        });
    }
    
    showMessage(text, duration = 3000) {
        // Remove mensagem existente
        const existingMessage = document.getElementById('ui-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Cria nova mensagem
        const message = document.createElement('div');
        message.id = 'ui-message';
        message.textContent = text;
        message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 1001;
            text-align: center;
            border: 2px solid #00a8ff;
            box-shadow: 0 0 20px rgba(0, 168, 255, 0.5);
            animation: fadeIn 0.3s;
        `;
        
        // Adiciona ao container
        document.getElementById('game-container').appendChild(message);
        
        // Remove após a duração
        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'fadeOut 0.3s';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    // Atualiza UI completa
    update(score, health, fps) {
        this.updateScore(score);
        this.updateHealth(health);
        this.updateFPS(fps);
    }
    
    // Limpa recursos
    dispose() {
        if (this.hitMarker && this.hitMarker.parentNode) {
            this.hitMarker.parentNode.removeChild(this.hitMarker);
        }
        
        if (this.pauseMenu && this.pauseMenu.parentNode) {
            this.pauseMenu.parentNode.removeChild(this.pauseMenu);
        }
    }
}

window.UI = UI;
