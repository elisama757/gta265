// Classe dos alvos/mancquins

class Target {
    constructor(game) {
        this.game = game;
        this.mesh = null;
        this.health = 100;
        this.isAlive = true;
        this.hitTimer = 0;
        this.wobbleTime = 0;
        
        this.init();
    }
    
    init() {
        this.createTarget();
    }
    
    createTarget() {
        const group = new THREE.Group();
        
        // Corpo principal (cilindro)
        const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.35, 2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x7f8c8d,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Cabeça (esfera)
        const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xd35400,
            flatShading: true
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.4;
        head.castShadow = true;
        group.add(head);
        
        // Braços (barras horizontais)
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
        const armMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x7f8c8d,
            flatShading: true
        });
        
        // Braço direito
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.8, 1.5, 0);
        rightArm.rotation.z = Math.PI / 2;
        rightArm.castShadow = true;
        group.add(rightArm);
        
        // Braço esquerdo
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.8, 1.5, 0);
        leftArm.rotation.z = -Math.PI / 2;
        leftArm.castShadow = true;
        group.add(leftArm);
        
        // Base (para estabilidade)
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.2, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x34495e,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Área de hitbox (maior e invisível)
        const hitboxGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 8);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
            wireframe: false
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.y = 1.25;
        group.add(hitbox);
        
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
        
        // Rotação inicial aleatória
        this.mesh.rotation.y = Math.random() * Math.PI * 2;
        
        // Adiciona movimento de oscilação leve
        this.wobbleTime = Math.random() * Math.PI * 2;
        
        console.log('Alvo criado!');
    }
    
    update(deltaTime) {
        if (!this.isAlive || !this.mesh) return;
        
        // Atualiza timer de hit
        if (this.hitTimer > 0) {
            this.hitTimer -= deltaTime;
            if (this.hitTimer <= 0) {
                this.resetColor();
            }
        }
        
        // Movimento de oscilação suave
        this.wobbleTime += deltaTime;
        this.mesh.rotation.y += Math.sin(this.wobbleTime * 0.5) * 0.01;
        
        // Pequena flutuação vertical
        this.mesh.position.y = Math.sin(this.wobbleTime) * 0.05;
    }
    
    hit() {
        if (!this.isAlive) return;
        
        this.health -= 50;
        this.hitTimer = 0.3; // 300ms de efeito visual
        
        // Efeito visual ao ser atingido
        this.showHitEffect();
        
        // Som de hit (se disponível)
        this.playHitSound();
        
        if (this.health <= 0) {
            this.die();
        } else {
            console.log(`Alvo atingido! Vida: ${this.health}`);
        }
    }
    
    showHitEffect() {
        // Muda cor temporariamente para vermelho
        const head = this.mesh.children.find(child => 
            child.position.y === 2.4
        );
        
        if (head && head.material) {
            this.originalColor = head.material.color.clone();
            head.material.color.set(0xff0000);
            
            // Efeito de partículas simples
            this.createHitParticles();
        }
    }
    
    resetColor() {
        const head = this.mesh.children.find(child => 
            child.position.y === 2.4
        );
        
        if (head && head.material && this.originalColor) {
            head.material.color.copy(this.originalColor);
        }
    }
    
    createHitParticles() {
        // Cria algumas partículas simples para o efeito de hit
        for (let i = 0; i < 3; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 3, 3);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Posição aleatória ao redor do alvo
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5;
            particle.position.set(
                Math.cos(angle) * radius,
                1.5 + Math.random(),
                Math.sin(angle) * radius
            );
            
            // Adiciona ao alvo (não à cena global)
            this.mesh.add(particle);
            
            // Anima e remove a partícula
            this.animateParticle(particle);
        }
    }
    
    animateParticle(particle) {
        const startTime = Date.now();
        const duration = 500; // 0.5 segundos
        const startPosition = particle.position.clone();
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.02,
            (Math.random() - 0.5) * 0.02
        );
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1 || !particle.parent) {
                if (particle.parent) {
                    particle.parent.remove(particle);
                }
                return;
            }
            
            // Atualiza posição
            particle.position.x = startPosition.x + velocity.x * elapsed;
            particle.position.y = startPosition.y + velocity.y * elapsed;
            particle.position.z = startPosition.z + velocity.z * elapsed;
            
            // Diminui opacidade
            if (particle.material) {
                particle.material.opacity = 0.8 * (1 - progress);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    playHitSound() {
        // Tenta tocar som se existir
        const audio = new Audio();
        audio.src = '/sounds/hit.mp3';
        audio.volume = 0.4;
        
        audio.play().catch(error => {
            // Silencia erro se o som não existir
            console.log('Som de hit não disponível');
        });
    }
    
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        console.log('Alvo destruído!');
        
        // Anima a queda do alvo
        this.animateFall();
        
        // Som de destruição
        this.playDeathSound();
    }
    
    animateFall() {
        if (!this.mesh) return;
        
        const startRotation = this.mesh.rotation.x;
        const startPositionY = this.mesh.position.y;
        const fallSpeed = 2; // radianos por segundo
        const fallDuration = 0.8; // segundos
        
        let elapsed = 0;
        
        const animate = () => {
            if (!this.mesh || elapsed >= fallDuration) {
                // Espera e respawna
                setTimeout(() => {
                    this.respawn();
                }, 2000);
                return;
            }
            
            elapsed += 0.016; // ~60 FPS
            
            const progress = elapsed / fallDuration;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Easing out
            
            // Rotação de queda (para frente)
            this.mesh.rotation.x = startRotation + easedProgress * Math.PI / 2;
            
            // Queda para baixo
            this.mesh.position.y = startPositionY - easedProgress * 2;
            
            // Pequeno movimento para frente durante a queda
            this.mesh.position.z += Math.sin(this.mesh.rotation.x) * 0.05;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    playDeathSound() {
        // Som diferente para destruição
        const audio = new Audio();
        audio.src = '/sounds/break.mp3';
        audio.volume = 0.5;
        
        audio.play().catch(error => {
            console.log('Som de destruição não disponível');
        });
    }
    
    respawn() {
        if (this.isAlive) return;
        
        this.health = 100;
        this.isAlive = true;
        this.hitTimer = 0;
        
        // Reseta transformações
        if (this.mesh) {
            this.mesh.rotation.x = 0;
            this.mesh.position.y = 0;
            
            // Remove partículas antigas
            this.mesh.children.forEach((child, index) => {
                if (child.position.y > 2) { // Partículas
                    this.mesh.remove(child);
                }
            });
            
            // Nova posição aleatória
            let newPosition;
            let attempts = 0;
            const maxAttempts = 10;
            
            do {
                const angle = Math.random() * Math.PI * 2;
                const radius = 15 + Math.random() * 15;
                newPosition = new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                
                attempts++;
                
                // Verifica se está muito perto do jogador
                const player = this.game.player;
                let tooCloseToPlayer = false;
                if (player && player.mesh) {
                    const dx = newPosition.x - player.mesh.position.x;
                    const dz = newPosition.z - player.mesh.position.z;
                    const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
                    tooCloseToPlayer = distanceToPlayer < 10;
                }
                
                // Verifica se está muito perto de outros alvos
                let tooCloseToOthers = false;
                for (const target of this.game.targets) {
                    if (target === this || !target.isAlive || !target.mesh) continue;
                    
                    const dx = newPosition.x - target.mesh.position.x;
                    const dz = newPosition.z - target.mesh.position.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance < 5) {
                        tooCloseToOthers = true;
                        break;
                    }
                }
                
                if (!tooCloseToPlayer && !tooCloseToOthers) {
                    this.mesh.position.copy(newPosition);
                    break;
                }
                
            } while (attempts < maxAttempts);
            
            // Se não encontrou boa posição, usa posição aleatória simples
            if (attempts >= maxAttempts) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 20 + Math.random() * 10;
                this.mesh.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
            }
            
            // Nova rotação aleatória
            this.mesh.rotation.y = Math.random() * Math.PI * 2;
            
            // Reseta cor
            this.resetColor();
            
            console.log('Alvo respawnado!');
        }
    }
}

window.Target = Target;
