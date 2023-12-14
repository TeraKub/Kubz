
window.addEventListener('load', function() {

	var game = new Phaser.Game({
    "title": "KubZ",
    "width": 720,
    "height": 1280,
    "type": Phaser.AUTO,
    "backgroundColor": "#88F",
    "parent": "game-container",
	"physics": {default: "arcade", arcade: {debug: false}},
    "scale": {
        "mode": Phaser.Scale.FIT,
        "autoCenter": Phaser.Scale.CENTER_BOTH
    }
	});
	game.scene.add("Boot", Boot, true);
	
});

class Boot extends Phaser.Scene {

	preload() {
		this.load.pack("pack", "assets/pack.json");
		this.load.audio("nyamSound", "assets/sounds/BallsMoovie.mp3");
		this.load.audio("addEnemySound", "assets/sounds/addEnemy.mp3");
		this.load.audio("boomSound", "assets/sounds/boomSound.mp3");
	}

	create() {
		this.scene.start("Scene1");
	}

}
