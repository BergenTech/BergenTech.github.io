// lightning, strikes random target

import { isCollidingCircle } from "../collision.js";
import GenericObject from "../objects/generic.js";

export default class Upgrade {
    level = 0;
    max = false;

    sprites = [];

    data = [
        // [ radius add #, damage add #, num bolts add #, filler, name ]
        [
            10,
            100,
            1,
            0,
            "Strikes random target on screen"
        ],
        [
            5,
            50,
            0,
            0,
            "Greater Radius and Increased Damage"
        ],
        [
            5,
            50,
            1,
            0,
            "+1 Bolt"
        ],
        [
            5,
            25,
            1,
            0,
            "+1 Bolt, Increased Radius and Damage"
        ],
        [
            0,
            25,
            1,
            0,
            "+1 Bolt, Increased Radius and Damage"
        ]
    ]

    bolts = [];

    numBolts = 0;
    cooldown = 180; // 3s 180 frames
    radius = 5;
    damage = 10;

    frames = 0;

    constructor(game) {
        this.name = "Lightning";
        this.maxLevel = 5;
        this.description = this.data[0][4];
        this.image = game.assets.images.lightning;
        this.game = game;
        
        this.loadSprites(game.assets.images.lightning_sprites);
    }

    loadSprites(sheet) {
        var w = sheet.width / 5
        var h = sheet.height / 2;

        for (let i = 0; i < 2; i ++) {
            for (let j = 0; j < 5; j ++) {
                var x = j * h;
                var y = i * w;

                this.sprites.push(sheet.get(x, y, w, h));
            }
        }
    }

    upgrade() {
        if (this.max === true) {
            return false;
        }

        this.level ++;

        var level = this.level - 1;
        var data = this.data[level];

        this.radius += data[0];
        this.damage += data[1];
        this.numBolts += data[2];

        if (this.level + 1 <= this.maxLevel) {
            this.description = this.data[this.level][4];
        } else {
            this.max = true;
        }
    }

    render() {
        this.frames ++;

        this.bolts.forEach(bolt => bolt.draw());
    }

    update() {
        if (this.frames % this.cooldown === 0) {
            for (let i = 0; i < this.numBolts; i++) {
                setTimeout(() => {
                    this.bolts.push(
                        new LightningBolt(this)
                    );
                }, i * 300);
            }
        } else {
            this.bolts.forEach(bolt => bolt.update());
        }
    }
}

class LightningBolt {
    constructor(parent) {
        this.parent = parent;
        this.angle = Math.random() * 360;
        this.radius = this.parent.radius;
        this.damage = this.parent.damage;
        this.frames = 0;
        this.sprites = this.parent.sprites;
        this.currentSprite = 0;

        this.target = this.selectTarget();

        if (this.target === null) {
            return this.destroy();
        }

        this.x = this.target.x,
        this.y = this.target.y;

        if (this.radius < 5) {
            this.radius = 5;
        }

        if (this.damage < 1) {
            this.damage = 1;
        }
    }

    selectTarget() {
        var targets = window.game.getTargets().filter(enemy => {
            var { x, y } = enemy;

            return (
                x > 0 &&
                x < width &&
                y > 0 &&
                y < height
            );
        });

        if (targets.length === 0) {
            return null;
        }

        return targets[Math.floor(Math.random() * targets.length)];
    }

    draw() {   
        try {
            if (this.target === null) {
                return;
            }

            var { x, y } = this;

            if (this.frames <= 80) {
                graphic.push();
                graphic.translate(x, y);
                // graphic.rotate();
                graphic.fill(0, 0, 255, 50);
                graphic.circle(0, 0, this.radius * 2);
                graphic.pop();
            }

            graphic.push();
            graphic.imageMode(CENTER);

            var imageWidth = 40;
            var imageHeight = this.sprites[this.currentSprite].height * (imageWidth / this.sprites[this.currentSprite].width);

            graphic.image(this.sprites[this.currentSprite], x, y, imageWidth, imageHeight);
            graphic.pop();
        } catch(e) {
            console.error(e);
        }
    }

    update() {
        this.frames ++;

        if (this.frames % 60 === 0) {
            this.currentSprite ++;

            if (this.currentSprite >= this.sprites.length) {
                this.currentSprite = 0;
            }
        }

        if (this.frames > 2000) {
            this.destroy();
        }

        if (this.frames < 2) {
            this.checkCollisions(window.game.getTargets());
        }
    }

    checkCollisions(targets) {
        for (let i = 0; i < targets.length; i++) {
            var target = targets[i];

            if (isCollidingCircle(target, this)) {
                target.hurt(this.damage);
            }
        }
    }

    destroy() {
        var index = this.parent.bolts.indexOf(this);

        if (index > -1) {
            this.parent.bolts.splice(index, 1);
        }
    }
}