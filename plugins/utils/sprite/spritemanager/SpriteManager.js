import SpriteData from './SpriteData.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class SpriteManager {
    constructor(scene, config) {
        this.scene = scene;

        this.setCreateCallback(GetValue(config, 'createCallback', 'sprite'));
        this.setSpriteFadeTime(GetValue(config, 'fade', 500));

        this.sprites = {};
    }

    destroy() {
        this.clear();
        this.createCallback = undefined;
        this.scene = undefined;
    }

    setCreateCallback(callback) {
        if (callback === 'sprite') {
            this.createCallback = function (scene, textureKey, frameName) {
                return scene.add.sprite(0, 0, textureKey, frameName)
            }
        } else if (callback === 'image') {
            this.createCallback = function (scene, textureKey, frameName) {
                return scene.add.image(0, 0, textureKey, frameName)
            }
        } else {
            this.createCallback = callback;
        }
        return this;
    }

    setSpriteFadeTime(time) {
        this.fadeTime = time;
        return this;
    }

    has(name) {
        return this.sprites.hasOwnProperty(name);
    }

    get(name) {
        return this.sprites[name];
    }

    clear() {
        for (var name in this.sprites) {
            this.sprites[name].destroy();
            delete this.sprites[name];
        }
        return this;
    }

    add(name, textureKey, frameName) {
        this.remove(name);
        var sprite = this.createCallback(this.scene, textureKey, frameName);

        var spriteData = new SpriteData(this, sprite);
        this.sprites[name] = spriteData;

        if (this.fadeTime > 0) {
            spriteData
                .setProperty('alpha', 0)
                .easeProperty('alpha', 1, this.fadeTime)
        }
        return this;
    }

    setProperty(name, property, value) {
        if (!this.has(name)) {
            return this;
        }
        this.get(name).setProperty(property, value);
        return this;
    }

    easeProperty(name, property, value, duration, ease, onComplete) {
        if (!this.has(name)) {
            return this;
        }

        if (duration === undefined) {
            duration = 1000;
        }
        if (ease === undefined) {
            ease = 'Linear';
        }

        this.get(name).easeProperty(property, value, duration, ease, onComplete);
        return this;
    }

    remove(name) {
        if (!this.has(name)) {
            return this;
        }

        var spriteData = this.get(name);
        if (this.fadeTime > 0) {
            this.easeProperty(name, 'alpha', 0, this.fadeTime, 'Linear', function () {
                spriteData.destroy();
            })
            delete this.sprites[name];
        } else {
            spriteData.destroy();
            delete this.sprites[name];
        }
        return this;
    }
}


export default SpriteManager;