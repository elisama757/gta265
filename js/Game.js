// Classe principal do jogo - VERSÃO SIMPLIFICADA PARA VERCEL

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.player = null;
        this.targets = [];
        this.clock = new THREE.Clock();
        this.mixers = [];
        this.score = 0;
        this.gameStarted = false;
        this.isPaused = false;
        this.ui = null;
        this.gameControls = null;
        
        this.init();
    }
    
    init() {
        console.log('Inicializando jogo...');
        
        try {
            // Verifica se THREE está disponível
            if (typeof THREE === 'undefined') {
                throw new Error('THREE.js não está disponível');
            }
            
            // Configuração básica da cena
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x87CEEB, 10, 150);
            
            // Configuração da câmera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 5, 10);
            
            // Renderizador WebGL
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                throw new Error('Canvas não encontrado!');
            }
            
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            
            // Sistema de controles
            this.gameControls = new Controls(this);
            
            // Inicializa UI
            this.ui = new UI();
            
            // Configura iluminação
            this.setupLighting();
            
            // Cria cenário
            this.createEnvironment();
            
            // Cria jogador
            this.player = new Player(this);
            
            // Cria alvos
            this.createTargets();
            
            // Event listeners
            window.addEventListener('resize', () => this.onWindowResize());
            document.addEventListener('visibilitychange', () => this.onVisibilityChange());
            
            // Inicia loop do jogo
            this.animate();
            
            console.log('Jogo inicializado!');
            
        } catch (error) {
            console.error('Erro na inicialização do jogo:', error);
            throw error;
        }
    }
    
    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direcional principal (com sombra)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(30, 50, 30);
        directionalLight.castShadow = true;
        
        // Otimização de sombras
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        
        this.scene.add(directionalLight);
        
        // Luz de preenchimento
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-30, 20, -30);
        this.scene.add(fillLight);
    }
    
    createEnvironment() {
        // Chão
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2d5a27,
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.position.y = -0.1;
        this.scene.add(ground);
        
        // Linhas no chão (estilo GTA)
        this.createRoadMarkings();
        
        // Algumas construções simples
        this.createSimpleBuildings();
        
        // Céu
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Nuvens simples
        this.createClouds();
    }
    
    createRoadMarkings() {
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        // Linhas principais
        for (let i = -80; i <= 80; i += 20) {
            const points = [];
            points.push(new THREE.Vector3(i, 0.1, -100));
            points.push(new THREE.Vector3(i, 0.1, 100));
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        }
        
        for (let i = -80; i <= 80; i += 20) {
            const points = [];
            points.push(new THREE.Vector3(-100, 0.1, i));
            points.push(new THREE.Vector3(100, 0.1, i));
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        }
    }
    
    createSimpleBuildings() {
        const buildingColors = [0x808080, 0x666666, 0x999999, 0x777777];
        
        // Cria alguns prédios em posições aleatórias
        for (let i = 0; i < 8; i++) {
            const width = 8 + Math.random() * 8;
            const height = 10 + Math.random() * 15;
            const depth = 8 + Math.random() * 8;
            
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
            });
            
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            // Posição aleatória, mas não muito perto do centro
            let x, z;
            do {
                x = (Math.random() - 0.5) * 150;
                z = (Math.random() - 0.5) * 150;
            } while (Math.abs(x) < 20 && Math.abs(z) < 20);
            
            building.position.set(x, height / 2, z);
            building.castShadow = true;
            building.receiveShadow = true;
            
            this.scene.add(building);
        }
    }
    
    createClouds() {
        const cloudMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 5; i++) {
            const cloudGeometry = new THREE.SphereGeometry(3 + Math.random() * 2, 8, 8);
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            cloud.position.set(
                (Math.random() - 0.5) * 200,
                30 + Math.random() * 10,
                (Math.random() - 0.5) * 200
            );
            
            this.scene.add(cloud);
        }
    }
    
    createTargets() {
        // Cria 6 manequins em posições aleatórias
        for (let i = 0; i < 6; i++) {
            const target = new Target(this);
            
            // Posição em círculo, mas não muito perto
            const angle = (i / 6) * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Verifica se está muito perto de outros alvos
            let tooClose = false;
            for (const existingTarget of this.targets) {
                const dx = x - existingTarget.mesh.position.x;
                const dz = z - existingTarget.mesh.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < 5) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                target.mesh.position.set(x, 0, z);
                this.targets.push(target);
                this.scene.add(target.mesh);
            }
        }
    }
    
    start() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.isPaused = false;
        this.gameControls.activate();
        this.ui.showGameUI();
        
        console.log('Jogo iniciado!');
    }
    
    pause() {
        if (!this.gameStarted || this.isPaused) return;
        
        this.isPaused = true;
        this.ui.showPauseMenu();
    }
    
    resume() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.ui.hidePauseMenu();
    }
    
    togglePause() {
        if (!this.gameStarted) return;
        
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    update(deltaTime) {
        if (!this.gameStarted || this.isPaused) return;
        
        // Atualiza jogador
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Atualiza alvos
        this.targets.forEach(target => {
            if (target && target.update) {
                target.update(deltaTime);
            }
        });
        
        // Atualiza animações
        this.mixers.forEach(mixer => {
            if (mixer && mixer.update) {
                mixer.update(deltaTime);
            }
        });
        
        // Atualiza controles
        if (this.gameControls && this.gameControls.update) {
            this.gameControls.update();
        }
        
        // Atualiza UI
        if (this.ui) {
            const fps = deltaTime > 0 ? Math.round(1 / deltaTime) : 0;
            this.ui.updateFPS(fps);
            this.ui.updateScore(this.score);
            
            // Atualiza vida do jogador (simulado)
            if (this.player) {
                this.ui.updateHealth(this.player.health || 100);
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        try {
            const deltaTime = this.clock.getDelta();
            
            // Limita deltaTime para evitar problemas
            const safeDeltaTime = Math.min(deltaTime, 0.1);
            
            // Atualiza lógica do jogo
            this.update(safeDeltaTime);
            
            // Renderiza cena
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.error('Erro no loop de animação:', error);
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onVisibilityChange() {
        if (document.hidden && this.gameStarted && !this.isPaused) {
            this.pause();
        }
    }
    
    addScore(points) {
        if (!this.gameStarted || this.isPaused) return;
        
        this.score += points;
        if (this.ui) {
            this.ui.showHitMarker();
        }
        
        // Feedback de score
        console.log(`Score: +${points} (Total: ${this.score})`);
        
        // Mostra mensagem para grandes pontuações
        if (points >= 100) {
            this.ui.showMessage(`+${points} pontos!`, 1500);
        }
    }
    
    // Método para debug (opcional)
    enableDebugMode() {
        console.warn('Modo debug não disponível (OrbitControls removido)');
        console.log('Para debug, use:');
        console.log('- game.camera.position:', this.camera.position);
        console.log('- game.player.position:', this.player?.mesh?.position);
        console.log('- Targets:', this.targets.length);
    }
}

// Torna a classe disponível globalmente
if (typeof window !== 'undefined') {
    window.Game = Game;
}
