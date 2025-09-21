// Game Configuration
let config = {
    renderer : Phaser.AUTO,
    width: 1800,
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
let hasLanded = false;
let hasBumped = false;
let messageToPlayer;
let cursors; 

// Create game
function create () {
    // Setup scene
    background = this.add.image(0, 0,'background').setOrigin(0, 0);
    const roads = this.physics.add.staticGroup();
    const topColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300}
    });

    const bottomColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300},
    })

    const road = roads.create(400, 568, 'road').setScale(2).refreshBody();

    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);

    // Intructions to player
    messageToPlayer = this.add.text(0, 0, `Intructions: Press space bar to start`, { 
        fontFamily: '"Comin Sans MS", Times, serif', 
        fontSize: "20px", color: "white", 
        backgroundColor: "black" 
    });
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);

    // Collision detection
    this.physics.add.overlap(bird, road, ()=>hasLanded=true, null, this)
    this.physics.add.collider(bird, road)

    this.physics.add.overlap(bird, topColumns, ()=>hasBumped=true, null, this);
    this.physics.add.overlap(bird, bottomColumns, ()=>hasBumped=true, null, this);
    this.physics.add.collider(bird, topColumns);
    this.physics.add.collider(bird, bottomColumns);

    // Read up, down, left, right keys
    cursors = this.input.keyboard.createCursorKeys();
}

let isGameStarted = false;
function update() {
    // Game not started
    if (!isGameStarted) {
        bird.setVelocityY(-160)
    }

    // Space pressed + Game not started
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Intructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
    }

    // Space pressed + Touched ground + Touched pipes
    if (cursors.up.isDown && !hasLanded && !hasBumped) {
        bird.setVelocityY(-160);
    }

    // Not touched ground or Not touched pipes
    if (!hasLanded || !hasBumped) {
        bird.body.velocity.x = 50;
    } 

    // Touched ground or Touched pipes or Game not started
    if (hasLanded || hasBumped || !isGameStarted) {
        bird.body.velocity.x = 0;
    }

    // Touched ground or Touched pipes
    if (hasLanded || hasBumped) {
        messageToPlayer.text = `Oh no! You crashed!`;
    }

    // Bird beyond 750px 
    if (bird.x > 750) {
        bird.setVelocityY(40);
        messageToPlayer.text = `Congrats! You won!`;
    }
}