// Game Configuration
let config = {
    renderer : Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
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

const pipeXGap = 180 // px until next pipe
const pipeYGap = 625 // px difference top vs bottom pipe
const numPipes = 5; 
let score = 0;
let highscore = 0;
let bird;
let background;
let topPipes = new Array(numPipes);
let bottomPipes = new Array(numPipes);
let hasLanded = false;
let hasBumped = false;
let scoreText;
let highscoreText;
let cursors; 

// Random num from 50px to 300px
function randomY() {
    return Phaser.Math.Between(50, 300) // Min 0 Max 500
}

// Create game
function create () {
    // Setup scene
    background = this.add.tileSprite(0, 0, 900, 504, 'background').setOrigin(0, 0);
 
    currentPipeX = 0;

    // Create multiple pipes
    for (let i = 0; i < numPipes; i++) {
        topPipesY = randomY()
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
    
    // Display Score
    scoreText = this.add.text(0, 0, `Score: 0`, { 
        fontFamily: '"Comin Sans MS", Times, serif', 
        fontSize: "30px", 
        color: "white", 
    });

    // Display High-Score
    highscoreText = this.add.text(0, 0, `High-Score: 0`, { 
        fontFamily: '"Comin Sans MS", Times, serif', 
        fontSize: "30px", 
        color: "white", 
    });
    
    Phaser.Display.Align.In.TopLeft(scoreText, background, -10, -50);
    Phaser.Display.Align.In.TopLeft(highscoreText, background, -10, -10);

    // Read up, down, left, right keys
    cursors = this.input.keyboard.createCursorKeys();
}

let isGameStarted = false;
let isRetry = false;
const background_speed = 0.3;
const column_speed = 75

// Update game
function update() {
    // Game not started
    if (!isGameStarted) {
        // Cancel out gravity
        bird.setVelocityY(-20) 
    }

    // Up pressed + Game not started
    if (cursors.up.isDown && !isGameStarted) {
        isGameStarted = true;
    }

    // Up arrow pressed + Not touched ground + Not touched pipes
    if (cursors.up.isDown && isGameStarted && !hasLanded && !hasBumped ) {
        // Bounce bird up
        bird.setVelocityY(-280);
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
    }

    // If pipe not visible or passed bird
    for (let i = 0; i < numPipes; i++) {
        if (topPipes[i].x < -32) { // 32 is column width
            topPipesY = randomY()
            topPipes[i].setPosition(numPipes*pipeXGap, topPipesY)
            bottomPipes[i].setPosition(numPipes*pipeXGap, topPipesY+pipeYGap)
        }
        if (33 < topPipes[i].x && topPipes[i].x < 34) { // 33 is bird start px - bird size px
            score ++;
            scoreText.text = `Score: ` + score
        }
    }

    // If game already started and touched ground or game already started and touched pipes
    if (isGameStarted && hasLanded || isGameStarted && hasBumped) {
        gameoverText = this.add.text(0, 0, `Game over! Press ^ to retry`, { 
            fontFamily: '"Comin Sans MS", Times, serif', 
            fontSize: "30px", 
            color: "white", 
        });
        Phaser.Display.Align.In.Center(gameoverText, background, 0, 0);

        isGameStarted = false;
        isRetry = true;
        hasLanded = false;
        hasBumped = false;

        if (score > highscore) {
            highscore = score;
        }

        score = 0;
        scoreText.text = `Score: 0`;
        highscoreText.text = `High-Score: ` + highscore

        bird.setVelocityY(-20)
        bird.setVelocityX(0)
        bird.setPosition(50, 300);

        currentPipeX = 0;

        for (let i = 0; i < numPipes; i++) {
            topPipesY = randomY()
            topPipes[i].setPosition(pipeXGap+currentPipeX, topPipesY)
            bottomPipes[i].setPosition(pipeXGap+currentPipeX, topPipesY+pipeYGap)

            topPipes[i].body.setAllowGravity(false);
            bottomPipes[i].body.setAllowGravity(false);

            topPipes[i].body.setImmovable(true);
            bottomPipes[i].body.setImmovable(true);
            currentPipeX += pipeXGap;

            topPipes[i].refreshBody
            bottomPipes[i].refreshBody
    }
    }

    // If game is in retry phase and up is pressed
    if (isRetry && cursors.up.isDown) {
        gameoverText.text = ``;
    }
}
