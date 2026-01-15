// Sistema de controles

class Controls {
    constructor(game) {
        this.game = game;
        
        // Controles de teclado
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            shoot: false,
            aim: false
        };
        
        // Controles de mouse
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            sensitivity: 0.002
        };
        
        // Controles touch
        this.touch = {
            joystick: { x: 0, y: 0 },
            activeTouchId: null,
            shootPressed: false
        };
        
        this.isMobile = false;
        this.pointerLocked = false;
        
        this.init();
    }
    
    init() {
        this.detectDevice();
        this.setupKeyboard();
        this.setupMouse();
        this.setupTouch();
        this.setupMobileButtons();
        
        console.log('Controles inicializados' + (this.isMobile ? ' (Mobile)' : ' (Desktop)'));
    }
    
    detectDevice() {
        this.isMobile = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setupKeyboard() {
        // Teclas pressionadas
        document.addEventListener('keydown', (e) => {
            // Ignora se estiver em campo de texto
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = true;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = true;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = true;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = true;
                    break;
                case ' ':
                    if (!this.keys.jump) {
                        this.keys.jump = true;
                        if (this.game.player && this.game.gameStarted && !this.game.isPaused) {
                            this.game.player.jump();
                        }
                    }
                    break;
                case 'shift':
                    this.keys.sprint = true;
                    break;
                case 'r':
                    // Recarregar - placeholder
                    console.log('Recarregar');
                    break;
                case 'e':
                    // Interagir - placeholder
                    console.log('Interagir');
                    break;
            }
        });
        
        // Teclas liberadas
        document.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = false;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = false;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = false;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = false;
                    break;
                case ' ':
                    this.keys.jump = false;
                    break;
                case 'shift':
                    this.keys.sprint = false;
                    break;
            }
        });
    }
    
    setupMouse() {
        const canvas = this.game.renderer.domElement;
        if (!canvas) return;
        
        // Movimento do mouse
        canvas.addEventListener('mousemove', (e) => {
            if (!this.game.isPaused && this.game.gameStarted) {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            }
        });
        
        // Botão do mouse pressionado
        canvas.addEventListener('mousedown', (e) => {
            if (!this.game.isPaused && this.game.gameStarted && e.button === 0) {
                this.mouse.isDown = true;
                this.keys.shoot = true;
                
                if (this.game.player) {
                    this.game.player.shoot();
                }
            }
        });
        
        // Botão do mouse liberado
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.isDown = false;
                this.keys.shoot = false;
            }
        });
        
        // Clique direito para mirar
        canvas.addEventListener('contextmenu', (e) => {
            if (!this.game.isPaused && this.game.gameStarted) {
                e.preventDefault();
                this.keys.aim = true;
                return false;
            }
        });
        
        // Sai do aim quando soltar botão direito
        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.keys.aim = false;
            }
        });
        
        // Entra/sai do pointer lock
        canvas.addEventListener('click', () => {
            if (!this.game.isPaused && this.game.gameStarted && !this.isMobile) {
                this.requestPointerLock();
            }
        });
        
        // Atualiza estado do pointer lock
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === canvas;
        });
    }
    
    setupTouch() {
        if (!this.isMobile) return;
        
        const joystickArea = document.getElementById('movement-joystick');
        const joystickThumb = joystickArea ? joystickArea.querySelector('.joystick-thumb') : null;
        
        if (!joystickArea || !joystickThumb) return;
        
        let joystickBaseRect = null;
        
        const updateJoystickBaseRect = () => {
            joystickBaseRect = joystickArea.getBoundingClientRect();
        };
        
        // Inicializa rect
        updateJoystickBaseRect();
        window.addEventListener('resize', updateJoystickBaseRect);
        
        joystickArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.touch.activeTouchId !== null) return;
            
            const touch = e.touches[0];
            this.touch.activeTouchId = touch.identifier;
            updateJoystick(touch);
        });
        
        joystickArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touch.activeTouchId === null) return;
            
            const touch = Array.from(e.touches).find(t => t.identifier === this.touch.activeTouchId);
            if (touch) {
                updateJoystick(touch);
            }
        });
        
        joystickArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = Array.from(e.changedTouches).find(t => t.identifier === this.touch.activeTouchId);
            if (touch) {
                resetJoystick();
            }
        });
        
        joystickArea.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            resetJoystick();
        });
        
        const updateJoystick = (touch) => {
            if (!joystickBaseRect) return;
            
            const centerX = joystickBaseRect.left + joystickBaseRect.width / 2;
            const centerY = joystickBaseRect.top + joystickBaseRect.height / 2;
            
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = joystickBaseRect.width / 2;
            
            // Limita ao raio do joystick
            const limitedDistance = Math.min(distance, maxDistance);
            const angle = Math.atan2(deltaY, deltaX);
            
            const thumbX = Math.cos(angle) * limitedDistance;
            const thumbY = Math.sin(angle) * limitedDistance;
            
            // Atualiza posição visual
            joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
            
            // Normaliza valores (-1 a 1)
            this.touch.joystick.x = deltaX / maxDistance;
            this.touch.joystick.y = -deltaY / maxDistance; // Inverte Y para padrão de jogos
            
            // Limita se passou do raio
            if (distance > maxDistance) {
                this.touch.joystick.x = (deltaX / distance) * (maxDistance / maxDistance);
                this.touch.joystick.y = -(deltaY / distance) * (maxDistance / maxDistance);
            }
            
            // Converte para controles de teclado
            this.updateTouchControls();
        };
        
        const resetJoystick = () => {
            this.touch.activeTouchId = null;
            this.touch.joystick = { x: 0, y: 0 };
            
            if (joystickThumb) {
                joystickThumb.style.transform = 'translate(-50%, -50%)';
            }
            
            // Reseta controles
            this.keys.forward = false;
            this.keys.backward = false;
            this.keys.left = false;
            this.keys.right = false;
        };
        
        // Também controla camera com toque na tela
        const canvas = this.game.renderer.domElement;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let cameraTouchId = null;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Se não é no joystick e temos menos de 2 toques
            if (e.touches.length === 1 && !this.isTouchInJoystickArea(e.touches[0])) {
                const touch = e.touches[0];
                cameraTouchId = touch.identifier;
                lastTouchX = touch.clientX;
                lastTouchY = touch.clientY;
            }
            
            // Dois toques = zoom/aim
            if (e.touches.length === 2) {
                this.keys.aim = true;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            // Movimento da câmera
            if (cameraTouchId !== null) {
                const touch = Array.from(e.touches).find(t => t.identifier === cameraTouchId);
                if (touch) {
                    const deltaX = touch.clientX - lastTouchX;
                    const deltaY = touch.clientY - lastTouchY;
                    
                    // Atualiza rotação da câmera
                    this.updateCameraRotation(deltaX * 0.01, deltaY * 0.01);
                    
                    lastTouchX = touch.clientX;
                    lastTouchY = touch.clientY;
                }
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            const endedTouch = Array.from(e.changedTouches).find(t => t.identifier === cameraTouchId);
            if (endedTouch) {
                cameraTouchId = null;
            }
            
            // Sai do aim se menos de 2 toques
            if (e.touches.length < 2) {
                this.keys.aim = false;
            }
        });
        
        this.isTouchInJoystickArea = (touch) => {
            if (!joystickBaseRect) return false;
            
            return touch.clientX >= joystickBaseRect.left &&
                   touch.clientX <= joystickBaseRect.right &&
                   touch.clientY >= joystickBaseRect.top &&
                   touch.clientY <= joystickBaseRect.bottom;
        };
    }
    
    updateTouchControls() {
        // Deadzone para evitar movimento acidental
        const deadzone = 0.2;
        
        // Movimento vertical (frente/trás)
        if (this.touch.joystick.y > deadzone) {
            this.keys.forward = true;
            this.keys.backward = false;
        } else if (this.touch.joystick.y < -deadzone) {
            this.keys.forward = false;
            this.keys.backward = true;
        } else {
            this.keys.forward = false;
            this.keys.backward = false;
        }
        
        // Movimento horizontal (esquerda/direita)
        if (this.touch.joystick.x > deadzone) {
            this.keys.right = true;
            this.keys.left = false;
        } else if (this.touch.joystick.x < -deadzone) {
            this.keys.right = false;
            this.keys.left = true;
        } else {
            this.keys.right = false;
            this.keys.left = false;
        }
    }
    
    setupMobileButtons() {
        if (!this.isMobile) return;
        
        const shootBtn = document.getElementById('shoot-btn');
        const aimBtn = document.getElementById('aim-btn');
        const jumpBtn = document.getElementById('jump-btn');
        
        if (shootBtn) {
            shootBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touch.shootPressed = true;
                this.keys.shoot = true;
                
                if (this.game.player && this.game.gameStarted && !this.game.isPaused) {
                    this.game.player.shoot();
                    // Dispara continuamente enquanto pressionado
                    this.startShootInterval();
                }
            });
            
            shootBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touch.shootPressed = false;
                this.keys.shoot = false;
                this.stopShootInterval();
            });
        }
        
        if (aimBtn) {
            aimBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys.aim = true;
            });
            
            aimBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.aim = false;
            });
        }
        
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.keys.jump) {
                    this.keys.jump = true;
                    if (this.game.player && this.game.gameStarted && !this.game.isPaused) {
                        this.game.player.jump();
                    }
                }
            });
            
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys.jump = false;
            });
        }
    }
    
    startShootInterval() {
        this.stopShootInterval();
        
        this.shootInterval = setInterval(() => {
            if (this.touch.shootPressed && this.game.player && 
                this.game.gameStarted && !this.game.isPaused) {
                this.game.player.shoot();
            }
        }, 200); // Dispara a cada 200ms enquanto pressionado
    }
    
    stopShootInterval() {
        if (this.shootInterval) {
            clearInterval(this.shootInterval);
            this.shootInterval = null;
        }
    }
    
    updateCameraRotation(deltaX, deltaY) {
        if (!this.game.camera || !this.game.gameStarted || this.game.isPaused) return;
        
        // Atualiza rotação Y (horizontal)
        this.game.camera.rotation.y -= deltaX * this.mouse.sensitivity * 50;
        
        // Atualiza rotação X (vertical) com limites
        this.game.camera.rotation.x = Math.max(
            -Math.PI / 3, // Limite para cima
            Math.min(
                Math.PI / 3, // Limite para baixo
                this.game.camera.rotation.x - deltaY * this.mouse.sensitivity * 50
            )
        );
    }
    
    requestPointerLock() {
        const canvas = this.game.renderer.domElement;
        if (!canvas) return;
        
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        } else if (canvas.mozRequestPointerLock) {
            canvas.mozRequestPointerLock();
        } else if (canvas.webkitRequestPointerLock) {
            canvas.webkitRequestPointerLock();
        }
    }
    
    exitPointerLock() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        } else if (document.mozExitPointerLock) {
            document.mozExitPointerLock();
        } else if (document.webkitExitPointerLock) {
            document.webkitExitPointerLock();
        }
    }
    
    activate() {
        console.log('Controles ativados');
        
        // Em desktop, sugere pointer lock
        if (!this.isMobile && this.game.gameStarted) {
            const canvas = this.game.renderer.domElement;
            canvas.style.cursor = 'none';
        }
    }
    
    // Atualiza controles a cada frame (chamado do Game.js)
    update() {
        // Atualiza rotação da câmera baseada no mouse (se pointer locked)
        if (this.pointerLocked && !this.isMobile) {
            // Em um jogo real, usaria mouse movement events do pointer lock
            // Por enquanto, usamos uma implementação simplificada
        }
    }
    
    // Limpa recursos
    dispose() {
        this.stopShootInterval();
        
        // Remove event listeners se necessário
        const canvas = this.game.renderer.domElement;
        if (canvas) {
            canvas.style.cursor = '';
        }
        
        this.exitPointerLock();
    }
}

window.Controls = Controls;
