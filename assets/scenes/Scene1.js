
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
		
		this.nyamSound = this.sound.add("nyamSound");
		this.addEnemySound = this.sound.add("addEnemySound");
		this.boomSound = this.sound.add("boomSound");
		this.muslo = this.sound.add("muslo");
		
		this.fPlayer = Player;
		this.fApple = Apple;
		this.fEnemy = Enemy;
	}
	
	create() {
		this._create();
		this.cursors = this.input.keyboard.createCursorKeys();
		this.input.on('pointerup', this.handleSwipe, this);
		
		this.physics.add.existing(this.fPlayer);
		this.physics.add.existing(this.fEnemy);
		this.physics.add.existing(this.fApple);
		
		this.physics.add.overlap(this.fPlayer, this.fEnemy, this.boom, null, this);
		this.physics.add.overlap(this.fPlayer, this.fApple, this.nyam, null, this);
		
		this.newEnemy = null;
		this.createScore();
		this.moove = true;
		
		this.fApple.x = Phaser.Math.Between(100, 620);
		this.fApple.y = Phaser.Math.Between(100, 1180);
		this.fEnemy.x = Phaser.Math.Between(100, 620);
		this.fEnemy.y = Phaser.Math.Between(100, 1180);
		
		while (this.checkOverlap(this.fApple, this.fEnemy) ||
			 this.checkOverlap(this.fApple, this.fPlayer) ||
			 this.checkOverlap(this.fEnemy, this.fPlayer)
		) {
	        this.fApple.x = Phaser.Math.Between(100, 620);
	        this.fApple.y = Phaser.Math.Between(100, 1180);
	        this.fEnemy.x = Phaser.Math.Between(100, 620);
	        this.fEnemy.y = Phaser.Math.Between(100, 1180);
	    }
		
		this.speed = 5;
		this.chekScore = 0;
		this.isEnemy = false;
		
		this.right = false;
		this.left = false;
		this.down = false;
		this.up = false;
	}
	
	update() {
		if (!this.moove) {
			return;
		}
		
		this.playerMove();
		this.chekEdgeOfField();
		this.chekHardest();
	}
	
	checkOverlap(objectA, objectB) {
	    return Phaser.Geom.Intersects.RectangleToRectangle(objectA.getBounds(), objectB.getBounds());
	}
	
	boom() {
		this.muslo.stop();
		this.boomSound.play();
		this.moove = false;
		
		this.deadMess = 'ЛОШАРА!';
		if (this.score > 19) {
			this.deadMess = 'ЧУШПАН!';
		}
		if (this.score > 39) {
			this.deadMess = 'СКОРЛУПА!';
		}
		if (this.score > 59) {
			this.deadMess = 'ПОМАЗОК!';
		}
		if (this.score > 79) {
			this.deadMess = 'СТАРШАК!';
		}
		if (this.score > 99) {
			this.deadMess = 'МАСИК!!!';
		}
		var style = {font: "60px Arial", fill: "#fff", align: "center"};
		this.scoreText = this.add.text(360, 200, this.deadMess, style).setOrigin(0.5);

		//this.sendScoreToServer(this.score);
		this.sendScoreToServerGet();
		
		this.createRestartButton();
    		this.restartButton.visible = true;
		
		this.physics.pause();
	}
	
	sendScoreToServerGet() {
		var xhr = new XMLHttpRequest();
	    var url = 'http://94.26.225.132:5000/sendMessage?message=' + this.score;
	
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState == 4 && xhr.status == 200) {
	            // Обработка успешного ответа от сервера (если необходимо)
	            console.log(xhr.responseText);
	        }
	    };
	
	    xhr.open('GET', url, true);
	    xhr.send();
	}
	
	sendScoreToServer(score) {
		// const serverAddress = "http://94.26.225.132:5000";
	    	const xhr = new XMLHttpRequest();
		// xhr.open("POST", `${serverAddress}/game-over`, true);
		xhr.open("POST", `http://94.26.225.132:5000/game-over`, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify({ score: score }));
	}
	
	nyam() {
		this.nyamSound.play();

		while (this.checkOverlap(this.fApple, this.fEnemy) ||
			this.checkOverlap(this.fApple, this.fPlayer)  ||
	 		(this.newEnemy && this.checkOverlap(this.fApple, this.newEnemy))
		) {
	        this.fApple.x = Phaser.Math.Between(100, 620);
	        this.fApple.y = Phaser.Math.Between(100, 1180);
	    }
		
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
		var style = {font: "40px Arial", fill: "#fff"};
		this.scoreText = this.add.text(20, 20, 'score: ' + this.score, style);
	}
	
	chekHardest() {
		if (this.score % 20 === 0 && this.isEnemy) {
			this.createEnemy();
			this.isEnemy = false;
		}
		
		if (this.score == this.chekScore + 5) {
			this.speed += 0.350;
			this.speed = parseFloat(this.speed.toFixed(2));
			this.chekScore = this.score;
			//console.log(this.chekScore);
		}
	}
	
	createEnemy() {
		//console.log("createEnemy");
		this.addEnemySound.play();
        this.newEnemy = this.add.image(
            Phaser.Math.Between(100, 620),
            Phaser.Math.Between(100, 1180),
            "textures",
            "Enemy"
        );
        this.newEnemy.setScale(2, 2);
        this.physics.add.existing(this.newEnemy);
		
		while (this.checkOverlap(this.newEnemy, this.fPlayer) ||
			this.checkOverlap(this.newEnemy, this.fEnemy) ||
	 		this.checkOverlap(this.newEnemy, this.fApple)
		) {
	        this.newEnemy.x = Phaser.Math.Between(100, 620);
	        this.newEnemy.y = Phaser.Math.Between(100, 1180);
	    }
		this.physics.add.overlap(this.fPlayer, this.newEnemy, this.boom, null, this);

    }
	
	chekEdgeOfField() {
		if (this.fPlayer.x < 0 || this.fPlayer.x > 720 || this.fPlayer.y < 0 || this.fPlayer.y > 1280) {
			this.boom();
		}
	}
	
	createRestartButton() {
	    var style = { font: "40px Arial", fill: "#fff", align: "center" };
	    this.restartButton = this.add.text(360, 360, '-> ИГРАТЬ ЕЩЁ <-', style).setOrigin(0.5)
	        .setInteractive()
	        .on('pointerdown', this.restartGame, this);
	    this.restartButton.visible = false;
	}
	
	restartGame() {
		this.scene.restart();
	}
	
	playerMove() {
		if (this.cursors.right.isDown) {
			this.moveRight();
		}
		if (this.cursors.left.isDown) {
			this.moveLeft();
		}
		if (this.cursors.down.isDown) {
			this.moveDown();
		}
		if (this.cursors.up.isDown) {
			this.moveUp();
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
		
		if (this.right || this.left || this.down || this.up) {
	        if (!this.muslo.isPlaying) {
	            this.muslo.play();
	        }
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
	                this.moveRight();
	            } else {
	                this.moveLeft();
	            }
	        } else {
	            // Вертикальный свайп
	            if (swipe.y > 0) {
	                this.moveDown();
	            } else {
	                this.moveUp();
	            }
	        }
	    }
	}
	
	moveUp() {
	    this.left = false;
	    this.down = false;
	    this.up = true;
	    this.right = false;
	}
	
	moveDown() {
	    this.left = false;
	    this.down = true;
	    this.up = false;
	    this.right = false;
	}
	
	moveLeft() {
	    this.left = true;
	    this.down = false;
	    this.up = false;
	    this.right = false;
	}
	
	moveRight() {
	    this.left = false;
	    this.down = false;
	    this.up = false;
	    this.right = true;
	}
}
