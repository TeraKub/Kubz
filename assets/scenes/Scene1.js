
class Scene1 extends Phaser.Scene {
	
	constructor() {
		super("Scene1");
	}
	
	_create() {
		this.enemies = [];
		
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
		
		this.enemies.push(this.fPlayer, this.fEnemy);
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

		const urlParams = new URLSearchParams(window.location.search);
	 	this.userId = urlParams.get('chat_id');
		this.inlineId = urlParams.get('inline');
		
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
		this.distanceForRed = 45;
		
		this.right = false;
		this.left = false;
		this.down = false;
		this.up = false;
	}
	
	update(time, delta) {
		if (!this.moove) {
			return;
		}
		
		this.playerMove(delta);
		this.chekEdgeOfField();
		//this.chekHardest();
	}
	
	checkOverlap(objectA, objectB) {
	    	return Phaser.Geom.Intersects.RectangleToRectangle(objectA.getBounds(), objectB.getBounds());
	}
	
	checkOverlapWithPrevious(newEnemy) {
		for (const enemy of this.enemies) {
			if (this.checkOverlap(newEnemy, enemy)) {
			        return true;
			}
		}
		return false;
	}
	
	boom() {
		this.muslo.stop();
		this.boomSound.play();
		this.moove = false;
		
		this.deadMess = 'ЛОШАРА!';
		if (this.score > 24) {
			this.deadMess = 'ЧУШПАН!';
		}
		if (this.score > 49) {
			this.deadMess = 'ПОМАЗОК!';
		}
		if (this.score > 74) {
			this.deadMess = 'СКОРЛУПА!';
		}
		if (this.score > 99) {
			this.deadMess = 'СТАРШАК!';
		}
		if (this.score > 124) {
			this.deadMess = 'МАСИК!!!';
		}
		if (this.score > 149) {
			this.deadMess = 'МОНСТР!!!';
		}
		if (this.score > 174) {
			this.deadMess = 'Я ХОЧУ ОТ ТЕБЯ ДЕТЕЙ';
		}
		if (this.score > 199) {
			this.deadMess = '😇 БОГ 😇';
		}
		var style = {font: "60px Arial", fill: "#fff", align: "center"};
		this.scoreText = this.add.text(360, 200, this.deadMess, style).setOrigin(0.5);

		this.sendScoreToFunction(); // Отправка результатов игры в облачную функцию
		
		this.createRestartButton();
    	        this.restartButton.visible = true;
		this.physics.pause();
	}

	sendScoreToFunction() {
		const functionUrl = "https://functions.yandexcloud.net/d4eiiom9l08770484vtj";
		const requestUrl = `${functionUrl}?id=${this.userId}&score=${this.score}&inline=${this.inlineId}`;
		
		fetch(requestUrl)
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				// Обработка ответа от сервера (data)
			})
			.catch((error) => {
				console.error("Error:", error);
				// Обработка ошибки
			});
	}
	
	nyam() {
		this.nyamSound.play();
		
		this.score += 1;
		this.scoreText.setText('очки: ' + this.score);
		
		if (this.score % 20 === 0 && this.isEnemy) {
			this.distanceForRed += 5;
			this.createEnemy();
			this.isEnemy = false;
		}

		const minDistance = 300;

		while (this.checkOverlapWithPrevious(this.fApple) ||
		Phaser.Math.Distance.Between(this.fApple.x, this.fApple.y, this.fPlayer.x, this.fPlayer.y) < minDistance
		) {
			this.fApple.x = Phaser.Math.Between(100, 620);
			this.fApple.y = Phaser.Math.Between(100, 1180);
		}
		
		this.tweens.add({
			targets: this.fPlayer,
			duration: 150,   // milliseconds
			scaleX: 2.3,
			scaleY: 2.3,
			yoyo: true
		});
		this.isEnemy = true;
		this.speed = (this.score * 5 + 500) / 100;
	}
	
	createScore() {
		this.score = 0;
		var style = {font: "40px Arial", fill: "#fff"};
		this.scoreText = this.add.text(20, 20, 'очки: ' + this.score, style);

		var versionStyle = {font: "20px Arial", fill: "#fff"};
		this.versionText = this.add.text(20, 1260, 'V 1.1.2', versionStyle);
	}
	
	// chekHardest() {
	// 	if (this.score % 20 === 0 && this.isEnemy) {
	// 		this.createEnemy();
	// 		this.isEnemy = false;
	// 	}
	// }
	
	createEnemy() {
		//console.log("createEnemy");
		this.addEnemySound.play();
		
	        const newEnemy = this.add.image(
	            Phaser.Math.Between(100, 620),
	            Phaser.Math.Between(100, 1180),
	            "textures",
	            "Enemy"
	        );
	        newEnemy.setScale(2, 2);
	        //this.physics.add.existing(this.newEnemy);
		
		while (this.checkOverlapWithPrevious(newEnemy) ||
		Phaser.Math.Distance.Between(newEnemy.x, newEnemy.y, this.fPlayer.x, this.fPlayer.y) < this.distanceForRed
		      ) {
	        newEnemy.x = Phaser.Math.Between(100, 620);
	        newEnemy.y = Phaser.Math.Between(100, 1180);
	    }

		this.physics.add.existing(newEnemy);
		this.physics.add.overlap(this.fPlayer, newEnemy, this.boom, null, this);

		this.enemies.push(newEnemy);
    	}
	
	chekEdgeOfField() {
		if (this.fPlayer.x < 0 || this.fPlayer.x > 720 || this.fPlayer.y < 0 || this.fPlayer.y > 1280) {
			this.boom();
		}
	}
	
	createRestartButton() {
	    var style = { font: "40px Arial", fill: "#fff", align: "center" };
	    this.restartButton = this.add.text(360, 360, '🎄ИГРАТЬ ЕЩЁ🎄 ', style).setOrigin(0.5)
	        .setInteractive()
	        .on('pointerdown', this.restartGame, this);
	    this.restartButton.visible = false;
	}
	
	restartGame() {
		this.scene.restart();
	}
	
	playerMove(delta) {
		const ratio = 16.6667;
		
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
			this.fPlayer.x += this.speed * delta / ratio;
		}
		if (this.left) {
			this.fPlayer.x -= this.speed * delta / ratio;
		}
		if (this.down) {
			this.fPlayer.y += this.speed * delta / ratio;
		}
		if (this.up) {
			this.fPlayer.y -= this.speed * delta / ratio;
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
