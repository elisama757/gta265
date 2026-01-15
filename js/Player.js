// Classe do jogador/personagem

class Player {
    constructor(game) {
        this.game = game;
        this.mesh = null;
        this.gun = null;
        this.animations = {};
        this.mixer = null;
        this.currentAction = null;
        
        this.speed = 6;
        this.runSpeed = 10;
        this.jumpForce = 8;
        this.isJumping = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.rotation = 0;
        
        this.health = 100;
        this.ammo = 30;
        
        this.init();
    }
    
    init() {
        this.createCharacter();
    }
    
    createCharacter() {
        // Grupo principal do personagem
        const group = new THREE.Group();
        
        // Corpo (cilindro)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3498db,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);
        
        // Cabeça (esfera)
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf1c40f,
            flatShading: true
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);
        
        // Braços
        this.createArms(group);
        
        // Pernas
        this.createLegs(group);
        
        // Cria arma
        this.createGun(group);
        
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
        this.mesh.position.y = 0;
        
        this.game.scene.add(this.mesh);
        
        console.log('Personagem criado!');
    }
    
    createArms(group) {
        // Braço direito
        const rightArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 6);
        const armMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3498db,
            flatShading: true
        });
        
        const rightArm = new THREE.Mesh(rightArmGeometry, armMaterial);
        rightArm.position.set(0.4, 1.2, 0);
        rightArm.rotation.z = Math.PI / 6;
        rightArm.castShadow = true;
        group.add(rightArm);
        
        // Braço esquerdo
        const leftArm = new THREE.Mesh(rightArmGeometry.clone(), armMaterial);
        leftArm.position.set(-0.4, 1.2, 0);
        leftArm.rotation.z = -Math.PI / 6;
        leftArm.castShadow = true;
        group.add(leftArm);
    }
    
    createLegs(group) {
        // Perna direita
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.9, 6);
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2c3e50,
            flatShading: true
        });
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.45, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        
        // Perna esquerda
        const leftLeg = new THREE.Mesh(legGeometry.clone(), legMaterial);
        leftLeg.position.set(-0.2, 0.45, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
    }
    
    createGun(group) {
        // Corpo da arma
        const gunBodyGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.8);
        const gunMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2c3e50,
            flatShading: true
        });
        
        this.gun = new THREE.Mesh(gunBodyGeometry, gunMaterial);
        this.gun.position.set(0.3, 1.1, 0.3);
        this.gun.rotation.x = -Math.PI / 12;
        this.gun.castShadow = true;
        
        // Mira da arma
        const sightGeometry = new THREE.BoxGeometry(0.02, 0.05, 0.02);
        const sight = new THREE.Mesh(sightGeometry, gunMaterial);
        sight.position.set(0, 0.03, 0.3);
        this.gun.add(sight);
        
        // Cano da arma
        const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
        const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
        barrel.position.set(0, 0, 0.55);
        barrel.rotation.x = Math.PI / 2;
        this.gun.add(barrel);
        
        group.add(this.gun);
    }
    
    update(deltaTime) {
        if (!this.mesh) return;
        
        const controls = this.game.gameControls;
        if (!controls) return;
        
        // Reset direction
        this.direction.set(0, 0, 0);
        
        // Movimento baseado nos controles
        if (controls.keys.forward) this.direction.z -= 1;
        if (controls.keys.backward) this.direction.z += 1;
        if (controls.keys.left) this.direction.x -= 1;
        if (controls.keys.right) this.direction.x += 1;
        
        // Normaliza se está se movendo diagonalmente
        if (this.direction.lengthSq() > 0) {
            this.direction.normalize();
            
            // Aplica velocidade
            const currentSpeed = controls.keys.sprint ? this.runSpeed : this.speed;
            const moveX = this.direction.x * currentSpeed * deltaTime;
            const moveZ = this.direction.z * currentSpeed * deltaTime;
            
            // Atualiza posição
            this.mesh.position.x += moveX;
            this.mesh.position.z += moveZ;
            
            // Rotaciona personagem na direção do movimento
            if (Math.abs(moveX) > 0.001 || Math.abs(moveZ) > 0.001) {
                this.rotation = Math.atan2(-moveX, -moveZ);
                this.mesh.rotation.y = this.rotation;
            }
            
            // Animação de andar/correr (simulação visual)
            this.animateWalk(deltaTime, currentSpeed);
        }
        
        // Salto
        if (controls.keys.jump && !this.isJumping) {
            this.jump();
        }
        
        // Aplica gravidade
        this.applyGravity(deltaTime);
        
        // Atualiza posição da câmera (terceira pessoa)
        this.updateCamera();
    }
    
    animateWalk(deltaTime, speed) {
        // Simula animação de caminhada movendo as pernas
        const legs = this.mesh.children.filter(child => 
            child.position.y === 0.45
        );
        
        if (legs.length >= 2) {
            const time = Date.now() * 0.005 * speed;
            legs[0].position.y = 0.45 + Math.sin(time) * 0.1;
            legs[1].position.y = 0.45 + Math.cos(time) * 0.1;
            
            // Pequena rotação do corpo
            this.mesh.rotation.z = Math.sin(time * 2) * 0.05;
        }
    }
    
    applyGravity(deltaTime) {
        if (this.isJumping) {
            this.velocity.y -= 20 * deltaTime; // Gravidade
            this.mesh.position.y += this.velocity.y * deltaTime;
            
            // Verifica se chegou ao chão
            if (this.mesh.position.y <= 0) {
                this.mesh.position.y = 0;
                this.velocity.y = 0;
                this.isJumping = false;
            }
        }
    }
    
    jump() {
        this.isJumping = true;
        this.velocity.y = this.jumpForce;
        console.log('Pulou!');
    }
    
    updateCamera() {
        if (!this.game.camera || !this.mesh) return;
        
        // Câmera em terceira pessoa
        const cameraDistance = 8;
        const cameraHeight = 3;
        
        // Offset da câmera atrás do jogador
        const offset = new THREE.Vector3(0, cameraHeight, cameraDistance);
        
        // Aplica rotação do jogador ao offset
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        
        // Posição da câmera
        this.game.camera.position.x = this.mesh.position.x + offset.x;
        this.game.camera.position.y = this.mesh.position.y + offset.y;
        this.game.camera.position.z = this.mesh.position.z + offset.z;
        
        // Câmera olha para o jogador
        this.game.camera.lookAt(
            this.mesh.position.x,
            this.mesh.position.y + 1.5,
            this.mesh.position.z
        );
    }
    
    shoot() {
        if (this.ammo <= 0) {
            console.log('Sem munição!');
            return;
        }
        
        this.ammo--;
        console.log(`Atirou! Munição: ${this.ammo}`);
        
        // Efeito visual do tiro
        this.createMuzzleFlash();
        
        // Recuo da arma (animação simples)
        if (this.gun) {
            this.gun.position.z += 0.1;
            setTimeout(() => {
                if (this.gun) this.gun.position.z -= 0.1;
            }, 50);
        }
        
        // Raycasting para detecção de colisão
        this.performRaycast();
        
        // Som do tiro (simulado)
        this.playShootSound();
    }
    
    createMuzzleFlash() {
        // Flash de luz na ponta da arma
        const flashLight = new THREE.PointLight(0xff6600, 3, 1);
        
        if (this.gun) {
            // Calcula posição mundial da ponta da arma
            const worldPosition = new THREE.Vector3();
            const barrel = this.gun.children.find(child => child.position.z === 0.55);
            
            if (barrel) {
                barrel.getWorldPosition(worldPosition);
            } else {
                // Fallback: posição aproximada
                this.gun.getWorldPosition(worldPosition);
                worldPosition.z += 0.8;
            }
            
            flashLight.position.copy(worldPosition);
        } else {
            // Fallback: posição do jogador
            flashLight.position.copy(this.mesh.position).add(new THREE.Vector3(0, 1.5, 1));
        }
        
        this.game.scene.add(flashLight);
        
        // Remove a luz após breve momento
        setTimeout(() => {
            if (flashLight.parent) {
                this.game.scene.remove(flashLight);
            }
        }, 50);
        
        // Partículas de fumaça simples
        this.createSmokeParticle(flashLight.position);
    }
    
    createSmokeParticle(position) {
        const smokeGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6
        });
        
        const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
        smoke.position.copy(position);
        this.game.scene.add(smoke);
        
        // Animação da fumaça
        let opacity = 0.6;
        const animateSmoke = () => {
            opacity -= 0.02;
            smokeMaterial.opacity = opacity;
            smoke.position.y += 0.05;
            smoke.scale.multiplyScalar(1.05);
            
            if (opacity <= 0) {
                this.game.scene.remove(smoke);
            } else {
                requestAnimationFrame(animateSmoke);
            }
        };
        
        animateSmoke();
    }
    
    performRaycast() {
        const raycaster = new THREE.Raycaster();
        
        // Direção do tiro (para frente do jogador)
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.mesh.rotation);
        
        // Origem do raio (da arma)
        const origin = new THREE.Vector3();
        if (this.gun) {
            this.gun.getWorldPosition(origin);
        } else {
            origin.copy(this.mesh.position).add(new THREE.Vector3(0, 1.5, 0));
        }
        
        raycaster.set(origin, direction.normalize());
        
        // Verifica colisões com alvos
        const targets = this.game.targets
            .filter(target => target && target.mesh && target.isAlive)
            .map(target => target.mesh);
        
        const intersects = raycaster.intersectObjects(targets, true);
        
        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            const hitTarget = this.game.targets.find(
                target => target.mesh === hitObject || 
                         (target.mesh && target.mesh.children.includes(hitObject))
            );
            
            if (hitTarget) {
                hitTarget.hit();
                this.game.addScore(100);
            }
        }
        
        // Debug: desenhar linha do raycast
        this.drawRaycastLine(origin, direction);
    }
    
    drawRaycastLine(origin, direction) {
        const points = [];
        points.push(origin);
        points.push(origin.clone().add(direction.clone().multiplyScalar(50)));
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.5
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.game.scene.add(line);
        
        // Remove após breve momento
        setTimeout(() => {
            if (line.parent) {
                this.game.scene.remove(line);
            }
        }, 100);
    }
    
    playShootSound() {
        // Tenta tocar som se existir
        const audio = new Audio();
        audio.src = '/sounds/shoot.mp3';
        audio.volume = 0.3;
        
        audio.play().catch(error => {
            // Silencia erro se o som não existir
            console.log('Som de tiro não disponível');
        });
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        console.log(`Dano recebido! Vida: ${this.health}`);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        console.log('Jogador morreu!');
        // Aqui você pode adicionar lógica de game over
        if (this.game.ui) {
            this.game.ui.showGameOver();
        }
    }
}

window.Player = Player;
