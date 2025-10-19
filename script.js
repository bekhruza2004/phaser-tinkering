// script.js
// Phaser 3 side-scroller with shotgun, 10 levels, enemy AI, pickups, HUD.
// Uses generated placeholder graphics; swap in real spritesheets in preload() if you want.

// --- GAME CONFIG ---
const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  backgroundColor: '#88ccee',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1100 },
      debug: false
    }
  },
  scene: [BootScene, PlayScene]
};

const game = new Phaser.Game(config);

// ---------- BOOT SCENE: setup, preload minimal assets ----------
function BootScene() {
  Phaser.Scene.call(this, { key: 'BootScene' });
}
BootScene.prototype = Object.create(Phaser.Scene.prototype);
BootScene.prototype.constructor = BootScene;

BootScene.prototype.preload = function() {
  // If you want to use real art, load spritesheets here, e.g.:
  // this.load.spritesheet('player', 'assets/player_sheet.png', { frameWidth: 64, frameHeight: 64 });
  // this.load.image('tiles', 'assets/tiles.png');
  // this.load.audio('shot', 'assets/shot.wav');

  // But to run immediately without assets, we'll create simple placeholder textures:
  this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAlUB9+oT2QAAAABJRU5ErkJggg==');

  // load web-font or fallback
  this.load.bitmapFont('font', 'https://labs.phaser.io/assets/fonts/bitmap/joystix.png', 'https://labs.phaser.io/assets/fonts/bitmap/joystix.xml');
};

BootScene.prototype.create = function() {
  // Generate several textures (player/enemy/tiles) so the game is playable without art.
  const g = this.textures.get('pixel').getSourceImage();
  const gfx = this.textures.createCanvas('generated', 64, 64);
  const ctx = gfx.getContext();
  // player placeholder (rounded rectangle)
  ctx.fillStyle = '#1f8fff';
  roundRect(ctx, 6, 6, 52, 52, 8);
  ctx.fill();
  this.textures.addSpriteSheetFromAtlas('player_placeholder', { atlas: 'generated', frameWidth: 64, frameHeight: 64, frameHeightRepeat: false });

  // enemy placeholder
  const egfx = this.textures.createCanvas('enemy_png', 48, 48);
  const ectx = egfx.getContext();
  ectx.fillStyle = '#e84c3d';
  roundRect(ectx, 4, 4, 40, 40, 6);
  ectx.fill();
  this.textures.addSpriteSheetFromAtlas('enemy_placeholder', { atlas: 'enemy_png', frameWidth: 48, frameHeight: 48 });

  // shell pickup
  const pgfx = this.textures.createCanvas('shell_png', 22, 12);
  const pctx = pgfx.getContext();
  pctx.fillStyle = '#c7b93c';
  roundRect(pctx, 1, 1, 20, 10, 3);
  pctx.fill();
  this.textures.addImage('shell', pgfx.canvas);

  // tile
  const tgfx = this.textures.createCanvas('tile_png', 64, 64);
  const tctx = tgfx.getContext();
  tctx.fillStyle = '#555';
  tctx.fillRect(0,0,64,64);
  tctx.strokeStyle = '#777';
  tctx.strokeRect(0,0,64,64);
  this.textures.addImage('tile', tgfx.canvas);

  // simple HUD icons
  const slgfx = this.textures.createCanvas('bullet_small', 8, 8);
  const slctx = slgfx.getContext();
  slctx.fillStyle = '#000';
  slctx.fillRect(0,0,8,8);
  this.textures.addImage('bullet_small', slgfx.canvas);

  this.scene.start('PlayScene', { startLevel: 0 });
};

// helper for drawing rounded rect into canvas
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- PLAY SCENE (core game) ----------
function PlayScene() {
  Phaser.Scene.call(this, { key: 'PlayScene' });
  this.levelIndex = 0;
}
PlayScene.prototype = Object.create(Phaser.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.init = function(data) {
  this.levelIndex = data.startLevel || 0;
};

// Level definitions (10 levels). Each level config controls layout, enemy counts, gravity modifiers, background colors, and challenge types.
PlayScene.prototype.levels = [
  { name: "Industrial Outskirts", bg: 0x88ccee, length: 2000, platforms: [ {x:0,y:520,w:2000,h:80} ], enemyCount: 6, shellSpawns: 3, gravity:1100 },
  { name: "Ruined Overpass", bg: 0xddeeff, length: 2600, platforms:[{x:0,y:520,w:1200,h:80},{x:1400,y:440,w:600,h:80},{x:2100,y:360,w:400,h:80}], enemyCount: 8, shellSpawns:4, gravity:1000 },
  { name: "Neon Alley", bg: 0x2b2b50, length: 2400, platforms:[{x:0,y:520,w:2000,h:80},{x:600,y:420,w:200,h:40},{x:1200,y:360,w:200,h:40}], enemyCount: 10, shellSpawns:4, gravity:1000 },
  { name: "Factory Interior", bg: 0xbbd0e6, length: 2800, platforms:[{x:0,y:520,w:2800,h:80},{x:900,y:420,w:150,h:30},{x:1250,y:320,w:150,h:30}], enemyCount: 11, shellSpawns:5, gravity:1200 },
  { name: "Bridge Skirts", bg: 0xaedff7, length: 3000, platforms:[{x:0,y:520,w:3000,h:80},{x:1600,y:420,w:300,h:40}], enemyCount: 12, shellSpawns:5, gravity:1100 },
  { name: "Toxic Sewers", bg: 0x9fd29a, length: 2600, platforms:[{x:0,y:520,w:2400,h:80},{x:800,y:440,w:220,h:30},{x:1600,y:360,w:220,h:30}], enemyCount: 13, shellSpawns:6, gravity:1000 },
  { name: "Glass Plaza", bg: 0xf4f7fa, length: 3200, platforms:[{x:0,y:520,w:3200,h:80},{x:400,y:440,w:200,h:30},{x:900,y:360,w:200,h:30}], enemyCount: 14, shellSpawns:6, gravity:1000 },
  { name: "Hydro Plant", bg: 0x7fb1d7, length: 3000, platforms:[{x:0,y:520,w:3000,h:80},{x:1400,y:420,w:200,h:40}], enemyCount: 16, shellSpawns:7, gravity:1150 },
  { name: "Night Docks", bg: 0x223344, length: 3400, platforms:[{x:0,y:520,w:3400,h:80},{x:1800,y:420,w:300,h:40}], enemyCount: 18, shellSpawns:8, gravity:1000 },
  { name: "The Tower (Finale)", bg: 0x2a2a2a, length: 4000, platforms:[
      {x:0,y:520,w:4000,h:80},{x:700,y:440,w:220,h:30},{x:1100,y:360,w:200,h:30},{x:1500,y:280,w:180,h:30},{x:2000,y:200,w:160,h:30}
    ], enemyCount: 25, shellSpawns:10, gravity:1200, boss: true }
];

// preload assets (spritesheets, audio) - placeholder approach is used; feel free to load your own
PlayScene.prototype.preload = function() {
  // optional: load real art/sfx, smoke, particles, sounds.
  // this.load.audio('shot', 'assets/sfx/shot.wav');
  // this.load.atlas('player_atlas', 'assets/player.png', 'assets/player.json');
};

PlayScene.prototype.create = function() {
  this.cameras.main.setBackgroundColor(this.levels[this.levelIndex].bg);

  // world bounds based on level length
  this.levelData = this.levels[this.levelIndex];
  const worldWidth = this.levelData.length;
  this.physics.world.setBounds(0, 0, worldWidth, 600);
  this.cameras.main.setBounds(0, 0, worldWidth, 600);

  // platform group
  this.platforms = this.physics.add.staticGroup();
  this.createPlatformsFromConfig(this.levelData.platforms);

  // player
  this.player = this.physics.add.sprite(120, 420, 'player_placeholder').setSize(32,50).setOffset(16,8);
  this.player.setCollideWorldBounds(true);
  this.player.setBounce(0.05);
  this.player.speed = 260;
  this.player.jumpSpeed = -480;
  this.player.health = 100;
  this.player.facing = 'right';

  // shotgun state
  this.shotgun = {
    maxAmmo: 6,
    ammo: 6,
    reserve: 12,
    pellets: 7,
    spread: 22, // degrees
    fireRate: 350, // ms between shots
    lastFired: 0,
    reloadTime: 1000,
    reloading: false
  };

  // bullets group (pellets)
  this.pellets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: true });
  this.pelletSpeed = 1200;
  this.pelletDamage = 30;

  // enemies
  this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
  for (let i=0;i<this.levelData.enemyCount;i++){
    this.spawnEnemyAtRandom(i);
  }

  // pickups (shells)
  this.pickups = this.physics.add.group();
  for (let i=0;i<this.levelData.shellSpawns;i++){
    this.spawnShellAtRandom(i);
  }

  // collisions
  this.physics.add.collider(this.player, this.platforms);
  this.physics.add.collider(this.enemies, this.platforms);
  this.physics.add.collider(this.enemies, this.enemies);
  this.physics.add.collider(this.pickups, this.platforms);

  // pellet hits enemy
  this.physics.add.overlap(this.pellets, this.enemies, this.onPelletHitEnemy, null, this);
  // enemy touches player
  this.physics.add.overlap(this.player, this.enemies, this.onEnemyTouchPlayer, null, this);
  // pickup shells
  this.physics.add.overlap(this.player, this.pickups, this.onPickupShell, null, this);

  // camera follow
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

  // input
  this.keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up: Phaser.Input.Keyboard.KeyCodes.W,
    jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    reload: Phaser.Input.Keyboard.KeyCodes.R,
    fireKey: Phaser.Input.Keyboard.KeyCodes.K,
    interact: Phaser.Input.Keyboard.KeyCodes.E
  });

  // pointer to shoot
  this.input.on('pointerdown', (pointer) => {
    this.tryFire(pointer.worldX, pointer.worldY);
  });

  // HUD
  this.createHUD();

  // level label
  this.levelText = this.add.text(16, 8, `Level ${this.levelIndex+1}: ${this.levelData.name}`, { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff' }).setScrollFactor(0);

  // apply gravity level-specific
  this.physics.world.gravity.y = this.levelData.gravity || 1100;

  // spawn boss if any
  if (this.levelData.boss) {
    // spawn a boss with more health and unique behavior
    this.spawnBoss();
  }

  // small tutorial text
  this.tutorial = this.add.text(16, 36, 'Move: A/D  Jump: W/Up/Space  Shoot: LMB or K  Reload: R', { fontSize:'14px', color: '#fff' }).setScrollFactor(0);
};

// create platforms based on config entries (rectangles)
PlayScene.prototype.createPlatformsFromConfig = function(platforms) {
  platforms.forEach(p=>{
    // create tiled segments of 64px width
    const tileW = 64;
    const count = Math.ceil(p.w / tileW);
    for (let i=0;i<count;i++){
      const x = p.x + i*tileW + tileW/2;
      const y = p.y + p.h/2;
      const t = this.platforms.create(x,y,'tile');
      t.displayWidth = tileW;
      t.displayHeight = p.h;
      t.refreshBody();
    }
  });
};

PlayScene.prototype.spawnEnemyAtRandom = function(seed) {
  const offset = 400 + seed * 120;
  const x = Phaser.Math.Between(300, Math.max(600, this.levelData.length - 200));
  const y = Phaser.Math.Between(100, 400);
  const enemy = this.enemies.get();
  if (!enemy) return;
  enemy.spawn(this, x, y, { patrolRange: Phaser.Math.Between(100, 400), speed: Phaser.Math.Between(50, 110), health: Phaser.Math.Between(40, 80) });
};

PlayScene.prototype.spawnShellAtRandom = function(seed) {
  const x = Phaser.Math.Between(200, this.levelData.length - 200);
  const y = Phaser.Math.Between(100, 420);
  const shell = this.pickups.create(x, y, 'shell');
  shell.setBounce(0.2);
  shell.setCollideWorldBounds(true);
  shell.body.setSize(18,10);
};

PlayScene.prototype.spawnBoss = function() {
  const boss = this.enemies.get();
  if (!boss) return;
  const x = Math.max(2000, this.levelData.length - 500);
  boss.spawn(this, x, 360, { isBoss: true, health: 400, patrolRange: 600, speed: 60 });
};

// pellet hits enemy
PlayScene.prototype.onPelletHitEnemy = function(pellet, enemy) {
  if (!enemy.active || !pellet.active) return;
  // damage and knockback
  enemy.takeDamage(this.pelletDamage);
  const kx = pellet.body.velocity.x * 0.03;
  const ky = -100;
  enemy.body.velocity.x += kx;
  enemy.body.velocity.y += ky;
  pellet.destroy();
  if (!enemy.active && enemy.isBoss) {
    // boss defeated -> level complete
    this.onLevelComplete();
  }
};

// enemy touches player
PlayScene.prototype.onEnemyTouchPlayer = function(player, enemy) {
  if (!enemy.active || !player.active) return;
  // simple damage cooldown
  if (!player.lastHit || this.time.now - player.lastHit > 600) {
    player.lastHit = this.time.now;
    player.health -= enemy.touchDamage || 12;
    this.tweenFlash(player, 0xff0000);
    this.updateHUD();
    if (player.health <= 0) {
      this.onPlayerDeath();
    }
  }
};

// pickup
PlayScene.prototype.onPickupShell = function(player, shell) {
  shell.destroy();
  this.shotgun.reserve += 2;
  this.updateHUD();
  // small pop
  this.add.tween({ targets: this, alpha: { from: 1, to: 1 }, duration: 200 });
};

// try to fire shotgun (from pointer)
PlayScene.prototype.tryFire = function(worldX, worldY) {
  const now = this.time.now;
  if (this.shotgun.reloading) return;
  if (now - this.shotgun.lastFired < this.shotgun.fireRate) return;
  if (this.shotgun.ammo <= 0) {
    // play empty click
    this.tweenFlash(this.player, 0xffff00);
    return;
  }
  this.shotgun.lastFired = now;
  this.shotgun.ammo--;
  this.updateHUD();

  // compute angle
  const dx = worldX - this.player.x;
  const dy = worldY - this.player.y;
  const baseAngle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
  this.player.facing = dx >= 0 ? 'right' : 'left';

  // spawn pellets
  for (let i=0;i<this.shotgun.pellets;i++){
    const spread = Phaser.Math.Between(-this.shotgun.spread/2, this.shotgun.spread/2);
    const angleDeg = baseAngle + spread;
    const angle = Phaser.Math.DegToRad(angleDeg);
    const vx = Math.cos(angle) * this.pelletSpeed + Phaser.Math.Between(-60,60);
    const vy = Math.sin(angle) * this.pelletSpeed + Phaser.Math.Between(-40,40);
    const pellet = this.pellets.create(this.player.x, this.player.y - 10, 'pixel').setScale(0.6, 0.6);
    pellet.body.allowGravity = false;
    pellet.setVelocity(vx, vy);
    pellet.lifespan = 450;
    pellet.update = function() {
      this.lifespan -= 16;
      if (this.lifespan <= 0) this.destroy();
    };
  }

  // muzzle recoil
  this.player.setVelocityY(-60);
  // optional sound here
  // this.sound.play('shot');
};

// player reload
PlayScene.prototype.reloadShotgun = function() {
  if (this.shotgun.reloading) return;
  if (this.shotgun.ammo >= this.shotgun.maxAmmo) return;
  if (this.shotgun.reserve <= 0) return;
  this.shotgun.reloading = true;
  this.tweens.add({
    targets: this.player,
    angle: { from: 0, to: (this.player.facing === 'right') ? -6 : 6 },
    yoyo: true,
    duration: this.shotgun.reloadTime,
    onComplete: () => {
      const needed = this.shotgun.maxAmmo - this.shotgun.ammo;
      const taken = Math.min(needed, this.shotgun.reserve);
      this.shotgun.ammo += taken;
      this.shotgun.reserve -= taken;
      this.shotgun.reloading = false;
      this.updateHUD();
    }
  });
};

// HUD creation + update
PlayScene.prototype.createHUD = function() {
  // simple text HUD
  this.hud = this.add.container(12, 520).setScrollFactor(0);
  this.ammoText = this.add.text(0, 0, '', { fontSize: '18px', fontFamily: 'Arial', color: '#fff' });
  this.healthText = this.add.text(0, 22, '', { fontSize: '18px', fontFamily: 'Arial', color: '#fff' });
  this.levelProgressText = this.add.text(200, 0, '', { fontSize: '16px', color:'#fff' });
  this.hud.add([ this.ammoText, this.healthText, this.levelProgressText ]);
  this.updateHUD();
};

PlayScene.prototype.updateHUD = function() {
  this.ammoText.setText(`Ammo: ${this.shotgun.ammo} / ${this.shotgun.maxAmmo}   Reserve: ${this.shotgun.reserve}`);
  this.healthText.setText(`Health: ${Math.max(0, this.player.health)}`);
};

// player death
PlayScene.prototype.onPlayerDeath = function() {
  this.player.setTint(0x550000);
  this.physics.pause();
  this.add.text(this.cameras.main.midPoint.x - 120, this.cameras.main.midPoint.y - 20, 'YOU DIED', { fontSize: '48px', color: '#ff0000' }).setScrollFactor(0);
  this.time.delayedCall(2000, ()=> {
    // restart level
    this.scene.restart({ startLevel: this.levelIndex });
  });
};

// level complete handler
PlayScene.prototype.onLevelComplete = function() {
  // if last level -> win
  if (this.levelIndex >= this.levels.length - 1) {
    this.add.text(this.cameras.main.midPoint.x - 200, this.cameras.main.midPoint.y - 20, 'VICTORY! All levels cleared', { fontSize: '36px', color: '#fff' }).setScrollFactor(0);
    this.physics.pause();
    return;
  }
  // transition to next level
  this.add.text(this.cameras.main.midPoint.x - 140, this.cameras.main.midPoint.y - 20, `Level ${this.levelIndex+1} cleared!`, { fontSize:'28px', color:'#ffff00' }).setScrollFactor(0);
  this.time.delayedCall(1200, ()=> {
    this.levelIndex++;
    this.scene.restart({ startLevel: this.levelIndex });
  });
};

// helper flash tween for damage feedback
PlayScene.prototype.tweenFlash = function(target, color) {
  if (!target) return;
  const orig = target.tintTopLeft;
  target.setTint(color);
  this.time.delayedCall(140, ()=> target.clearTint());
};

// update loop
PlayScene.prototype.update = function(time, delta) {
  if (!this.player.active) return;
  // movement
  const leftPressed = this.keys.left.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('LEFT'), 0);
  const rightPressed = this.keys.right.isDown || this.input.keyboard.checkDown(this.input.keyboard.addKey('RIGHT'), 0);
  if (leftPressed) {
    this.player.setVelocityX(-this.player.speed);
    this.player.facing = 'left';
  } else if (rightPressed) {
    this.player.setVelocityX(this.player.speed);
    this.player.facing = 'right';
  } else {
    this.player.setVelocityX(0);
  }

  // jump: W or up or space
  if ((this.keys.up.isDown || this.keys.jump.isDown) && this.player.body.onFloor()) {
    this.player.setVelocityY(this.player.jumpSpeed);
  }

  // reload
  if (Phaser.Input.Keyboard.JustDown(this.keys.reload)) {
    this.reloadShotgun();
  }

  // alternative fire key
  if (Phaser.Input.Keyboard.JustDown(this.keys.fireKey)) {
    // shoot toward pointer
    const pointer = this.input.activePointer;
    this.tryFire(pointer.worldX, pointer.worldY);
  }

  // check level end: reach near end of world
  if (this.player.x >= this.levelData.length - 120) {
    this.onLevelComplete();
  }

  // update HUD position/values
  this.updateHUD();

  // enemies logic managed by their own update
};

// ---------- ENEMY CLASS ----------
function Enemy(scene, x, y) {
  Phaser.Physics.Arcade.Sprite.call(this, scene, x, y, 'enemy_placeholder');
  this.scene = scene;
  this.setSize(28,36).setOffset(8,8);
  this.health = 50;
  this.touchDamage = 12;
  this.patrolRange = 150;
  this.startX = x;
  this.speed = 60;
  this.isBoss = false;
}
Enemy.prototype = Object.create(Phaser.Physics.Arcade.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.spawn = function(scene, x, y, opts={}) {
  this.scene = scene;
  this.health = opts.health || 60;
  this.isBoss = !!opts.isBoss;
  this.touchDamage = opts.touchDamage || (this.isBoss ? 30 : 12);
  this.patrolRange = opts.patrolRange || 180;
  this.speed = opts.speed || 80;
  this.startX = x;
  this.setActive(true);
  this.setVisible(true);
  this.enableBody(true, x, y, true, true);
  this.setPosition(x, y);
  this.body.setCollideWorldBounds(true);
  this.setBounce(0.1);
  this.target = null;
  this.lastAttack = 0;
  this.attackRate = this.isBoss ? 900 : 1500;
  this.fleeing = false;
  this.searchRange = 350;
  // add to physics world if not already
  if (!this.scene.physics.world.bodies.entries.includes(this.body)) {
    this.scene.physics.add.existing(this);
  }
  // ensure an overlap with world bounds
};

// enemy update: simple patrol, chase if player close, jump if needed
Enemy.prototype.update = function(time, delta) {
  if (!this.active) return;
  const player = this.scene.player;
  if (!player || !player.active) return;

  // if boss special behavior: occasionally lunge or shoot (we'll implement lunge)
  if (this.isBoss) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 300 && time - this.lastAttack > this.attackRate) {
      this.lastAttack = time;
      // lunge
      const dir = (player.x > this.x) ? 1 : -1;
      this.setVelocityX(500 * dir);
      this.setVelocityY(-150);
    }
    // slow down over time
    this.setVelocityX(Phaser.Math.Clamp(this.body.velocity.x * 0.98, -this.speed*3, this.speed*3));
    return;
  }

  const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
  if (dist < this.searchRange) {
    // chase
    const dir = (player.x > this.x) ? 1 : -1;
    this.setVelocityX(this.speed * dir * 1.2);
    // attempt small jumps to follow
    if (this.body.onFloor() && Math.abs(player.y - this.y) < -60) {
      this.setVelocityY(-360);
    }
  } else {
    // patrol
    const leftBound = this.startX - this.patrolRange/2;
    const rightBound = this.startX + this.patrolRange/2;
    if (!this._patrolDir) this._patrolDir = 1;
    this.setVelocityX(this.speed * this._patrolDir);
    if (this.x < leftBound) this._patrolDir = 1;
    if (this.x > rightBound) this._patrolDir = -1;
  }
};

// enemy damage
Enemy.prototype.takeDamage = function(amount) {
  this.health -= amount;
  // flash
  this.setTint(0xffcccc);
  this.scene.time.delayedCall(90, ()=> this.clearTint());
  if (this.health <= 0) {
    this.die();
  }
};

Enemy.prototype.die = function() {
  this.disableBody(true, true);
  this.setActive(false);
  this.setVisible(false);
  // spawn shell drop sometimes
  if (Phaser.Math.Between(0, 100) < 40) {
    const shell = this.scene.pickups.create(this.x, this.y, 'shell');
    shell.setBounce(0.2);
  }
  // small XP / points effect could go here
};

// attach Enemy class to scene group factory:
PlayScene.prototype.enemiesClass = Enemy;

// --- End of game code ---
