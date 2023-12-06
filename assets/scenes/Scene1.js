
// You can write more code here

/* START OF COMPILED CODE */

class Scene1 extends Phaser.Scene {
	
	constructor() {
	
		super("Scene1");
		
	}
	
	_create() {
	
		var Player = this.add.image(360.0, 640.0, "textures", "Player");
		Player.setScale(2.0, 2.0);
		
		var Apple = this.add.image(240.0, 300.0, "textures", "Apple");
		Apple.setScale(2.0, 2.0);
		
		var Enemy = this.add.image(480.0, 300.0, "textures", "Enemy");
		Enemy.setScale(2.0, 2.0);
		
		this.fPlayer = Player;
		this.fApple = Apple;
		this.fEnemy = Enemy;
		
	}
	
	
	
	
	/* START-USER-CODE */

	create() {
		this._create();
		this.cursors = this.input.keyboard.createCursorKeys();
		this.input.on('pointerup', this.handleSwipe, this);
		
		this.physics.add.existing(this.fPlayer);
		this.physics.add.existing(this.fEnemy);
		this.physics.add.existing(this.fApple);
		
		
		this.physics.add.overlap(this.fPlayer, this.fEnemy, this.boom, null, this);
		this.physics.add.overlap(this.fPlayer, this.fApple, this.nyam, null, this);
		
		this.createScore();
		this.moove = true;
		
		this.fApple.x = Phaser.Math.Between(100, 620);
		this.fApple.y = Phaser.Math.Between(100, 1180);
		
		this.fEnemy.x = Phaser.Math.Between(100, 620);
		this.fEnemy.y = Phaser.Math.Between(100, 1180);
		
		this.speed = 5;
		this.chekScore = 0;
		this.isEnemy = false;
		
		this.right = false;
		this.left = false;
		this.down = false;
		this.up = false;
		
	}

	update() {
		if (this.moove) {
			this.playerMoove();
		}
		
		this.chekEdgeOfField();
		this.chekHardest();
	}
	
	boom() {
		this.moove = false;
		
		this.deadMess = 'GAME OVER';
		var style = {font: "60px Arial", fill: "#fff"}
		this.scoreText = this.add.text(180, 150, this.deadMess, style);
	}
	
	nyam() {
		/*console.log("nyam")*/
		this.fApple.x = Phaser.Math.Between(100, 620);
		this.fApple.y = Phaser.Math.Between(100, 1180);
		
		this.score += 1;
		this.scoreText.setText('score: ' + this.score);
		
		this.tweens.add({
			targets: this.fPlayer,
			duration: 150,   // milliseconds
			scaleX: 2.3,
			scaleY: 2.3,
			yoyo: true
		});
		this.isEnemy = true;
	}
	
	createScore() {
		this.score = 0;
		var style = {font: "40px Arial", fill: "#fff"}
		this.scoreText = this.add.text(20, 20, 'score: ' + this.score, style);
	}
	
	chekHardest() {
		if (this.score % 20 === 0 && this.isEnemy) {
			this.createEnemy();
			this.isEnemy = false;
		}
		
		if (this.score == this.chekScore + 10) {
			this.speed += 1;
			this.chekScore = this.score;
			console.log(this.chekScore);
		}
	}
	
	createEnemy() {
		console.log("createEnemy");
        var newEnemy = this.add.image(
            Phaser.Math.Between(100, 620),
            Phaser.Math.Between(100, 1180),
            "textures",
            "Enemy"
        );
        newEnemy.setScale(2, 2);
        this.physics.add.existing(newEnemy);
		this.physics.add.overlap(this.fPlayer, newEnemy, this.boom, null, this);

        // Добавьте новый fEnemy в группу или массив, если вам нужно отслеживать несколько врагов
        // Например, this.enemies.push(newEnemy);
    }
	
	playerMoove() {
		if (this.cursors.right.isDown) {
			this.left = false;
			this.down = false;
			this.up = false;
			this.right = true;
		}
		if (this.cursors.left.isDown) {
			this.right = false;
			this.down = false;
			this.up = false;
			this.left = true;
		}
		if (this.cursors.down.isDown) {
			this.left = false;
			this.right = false;
			this.up = false;
			this.down = true;
		}
		if (this.cursors.up.isDown) {
			this.left = false;
			this.down = false;
			this.right = false;
			this.up = true;
		}
		
		if (this.right) {
			this.fPlayer.x += this.speed;
		}
		if (this.left) {
			this.fPlayer.x -= this.speed;
		}
		if (this.down) {
			this.fPlayer.y += this.speed;
		}
		if (this.up) {
			this.fPlayer.y -= this.speed;
		}
	}
	
	chekEdgeOfField() {
		if (this.fPlayer.x < 0 || this.fPlayer.x > 720 || this.fPlayer.y < 0 || this.fPlayer.y > 1280) {
			this.boom();
		}
	}
	
	handleSwipe(pointer) {
	    const swipeTime = pointer.upTime - pointer.downTime;
	    const swipe = new Phaser.Geom.Point(pointer.upX - pointer.downX, pointer.upY - pointer.downY);
	    const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
	
	    if (swipeTime < 1000 && swipeMagnitude > 20) {
	        Phaser.Geom.Point.SetMagnitude(swipe, 1);
	        if (Math.abs(swipe.x) > Math.abs(swipe.y)) {
	            // Горизонтальный свайп
	            if (swipe.x > 0) {
	                this.handleSwipeRight();
	            } else {
	                this.handleSwipeLeft();
	            }
	        } else {
	            // Вертикальный свайп
	            if (swipe.y > 0) {
	                this.handleSwipeDown();
	            } else {
	                this.handleSwipeUp();
	            }
	        }
	    }
	}
	
	handleSwipeUp() {
	    this.left = false;
	    this.down = false;
	    this.up = true;
	    this.right = false;
	}
	
	handleSwipeDown() {
	    this.left = false;
	    this.down = true;
	    this.up = false;
	    this.right = false;
	}
	
	handleSwipeLeft() {
	    this.left = true;
	    this.down = false;
	    this.up = false;
	    this.right = false;
	}
	
	handleSwipeRight() {
	    this.left = false;
	    this.down = false;
	    this.up = false;
	    this.right = true;
	}


	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
