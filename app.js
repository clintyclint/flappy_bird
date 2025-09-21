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
let topColumns;
let bottomColumns;
let hasLanded = false;
let hasBumped = false;
let messageToPlayer;
let cursors; 

// Create game
function create () {
    // Setup scene
    background = this.add.tileSprite(0, 0, 900, 504, 'background').setOrigin(0, 0);
 
    topColumns = this.physics.add.sprite(200, -75, 'column') // X: 0, 1700 Y: -250, 750
    topColumns.body.setAllowGravity(false);
    topColumns.body.setImmovable(true);

    bottomColumns = this.physics.add.sprite(200, 575, 'column')
    bottomColumns.body.setAllowGravity(false);
    bottomColumns.body.setImmovable(true);

    const roads = this.physics.add.staticGroup();
    const road = roads.create(400, 568, 'road').setScale(2).refreshBody();

    bird = this.physics.add.sprite(50, 300, 'bird').setScale(2);
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
const background_speed = 1;
const column_speed = -60
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
    if (cursors.up.isDown && !hasLanded && !hasBumped) {
        // Bounce bird up
        bird.setVelocityY(-160);
    }

    // Game started + Not touched ground + Not touched pipes
    if (isGameStarted && !hasLanded && !hasBumped) {
        topColumns.setVelocityX(column_speed)
        bottomColumns.setVelocityX(column_speed)
        background.tilePositionX += background_speed;
    }

    // Touched ground or Touched pipes
    if (hasLanded || hasBumped) {
        topColumns.setVelocityX(0)
        bottomColumns.setVelocityX(0)
        messageToPlayer.text = `Oh no! You crashed!`;
    }
}
