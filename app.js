// Game Configuration
let config = {
    renderer : Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

let game = new Phaser.Game(config)

// Preload Game
function preload () {
    this.load.image('background', 'assets/background.png');
    this.load.image('road', 'assets/road.png');
    this.load.image("column", "assets/column.png");
    this.load.spritesheet('bird', 'assets/bird.png', { frameWidth: 64, frameHeight: 96});
}

let bird;
let background;
let numPipes = 5;
let topPipes = new Array(numPipes);
let bottomPipes = new Array(numPipes);
let hasLanded = false;
let hasBumped = false;
let messageToPlayer;
let cursors; 

// Create game
function create () {
    // Setup scene
    background = this.add.tileSprite(0, 0, 900, 504, 'background').setOrigin(0, 0);

    pipeXGap = 200 // 200 px until next pipe
    pipeYGap = 600 // 650 px difference top vs bottom pipe
    currentPipeX = 0
 
    // Create multiple pipes
    for (let i = 0; i < numPipes; i++) {
        topPipesY = Phaser.Math.Between(50, 300) // Min 0 Max 500
        topPipes[i] = this.physics.add.sprite(pipeXGap+currentPipeX, topPipesY, 'column').setOrigin(0, 1)
        bottomPipes[i] = this.physics.add.sprite(pipeXGap+currentPipeX, topPipesY+pipeYGap, 'column').setOrigin(0, 1)

        topPipes[i].body.setAllowGravity(false);
        bottomPipes[i].body.setAllowGravity(false);

        topPipes[i].body.setImmovable(true);
        bottomPipes[i].body.setImmovable(true);
        currentPipeX += pipeXGap;
    }

    bird = this.physics.add.sprite(50, 300, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);
    
    const roads = this.physics.add.staticGroup();
    const road = roads.create(400, 568, 'road').setScale(2).refreshBody();

    // Collision detection
    this.physics.add.overlap(bird, road, ()=>hasLanded=true, null, this)
    this.physics.add.collider(bird, road)

    for (let i = 0; i < numPipes; i++) {
        this.physics.add.overlap(bird, topPipes[i], ()=>hasBumped=true, null, this);
        this.physics.add.overlap(bird, bottomPipes[i], ()=>hasBumped=true, null, this);
    }

    this.physics.add.collider(bird, topPipes);
    this.physics.add.collider(bird, bottomPipes);

    // Intructions to player
    messageToPlayer = this.add.text(0, 0, `Intructions: Press space bar to start`, { 
        fontFamily: '"Comin Sans MS", Times, serif', 
        fontSize: "20px", color: "white", 
        backgroundColor: "black" 
    });
    
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);

    // Read up, down, left, right keys
    cursors = this.input.keyboard.createCursorKeys();
}

let isGameStarted = false;
const background_speed = 1;
const column_speed = 60
function update() {
    // Game not started
    if (!isGameStarted) {
        // Cancel out gravity
        bird.setVelocityY(-5)
    }

    // Space pressed + Game not started
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Intructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
    }

    // Up arrow pressed + Not touched ground + Not touched pipes
    if (cursors.up.isDown && isGameStarted && !hasLanded && !hasBumped ) {
        // Bounce bird up
        bird.setVelocityY(-160);
    }

    // Game started + Not touched ground + Not touched pipes
    if (isGameStarted && !hasLanded && !hasBumped) {
        for (let i = 0; i < numPipes; i++) {
            topPipes[i].setVelocityX(-column_speed)
            bottomPipes[i].setVelocityX(-column_speed)
        }
        background.tilePositionX += background_speed;
    }

    // Touched ground or Touched pipes
    if (hasLanded || hasBumped) {
        for (let i = 0; i < numPipes; i++) {
            topPipes[i].setVelocityX(0)
            bottomPipes[i].setVelocityX(0)
        }
        messageToPlayer.text = `Oh no! You crashed!`;
    }
}
