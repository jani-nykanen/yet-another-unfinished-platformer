import { AssetManager } from "./assets.js";
import { AudioPlayer } from "./audioplayer.js";
import { Canvas } from "./canvas.js";
import { InputManager } from "./input.js";
import { TransitionEffectManager } from "./transition.js";
export class FrameState {
    constructor(step, core, input, assets, canvas, transition, audio) {
        this.leftPress = () => this.input.leftPress();
        this.rightPress = () => this.input.rightPress();
        this.upPress = () => this.input.upPress();
        this.downPress = () => this.input.downPress();
        this.getSample = (name) => this.assets.getSample(name);
        this.getTilemap = (name) => this.assets.getTilemap(name);
        this.getDocument = (name) => this.assets.getDocument(name);
        this.core = core;
        this.step = step;
        this.input = input;
        this.assets = assets;
        this.transition = transition;
        this.audio = audio;
        this.canvas = canvas;
    }
    getStick() {
        return this.input.getStick();
    }
    getAction(name) {
        return this.input.getAction(name);
    }
    changeScene(newScene) {
        this.core.changeScene(newScene);
    }
    setFilter(name, contrast = 0) {
        this.canvas.setFilterTexture(this.assets.getBitmap(name));
        this.canvas.setContrast(contrast);
    }
}
export class Core {
    constructor(canvasWidth, canvasHeight, frameSkip = 0) {
        this.audio = new AudioPlayer();
        this.assets = new AssetManager(this.audio);
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);
        this.assets.passCanvas(this.canvas);
        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),
            this.transition = new TransitionEffectManager();
        this.state = new FrameState(frameSkip + 1, this, this.input, this.assets, this.canvas, this.transition, this.audio);
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.initialized = false;
        this.activeScene = null;
        this.activeSceneType = null;
    }
    drawLoadingScreen(canvas) {
        const BAR_BORDER_WIDTH = 1;
        let barWidth = canvas.width / 4;
        let barHeight = barWidth / 8;
        canvas.clear(0, 0, 0);
        canvas.toggleTexturing(false);
        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();
        let t = this.assets.dataLoadedUnit();
        let x = canvas.width / 2 - barWidth / 2;
        let y = canvas.height / 2 - barHeight / 2;
        x |= 0;
        y |= 0;
        // Outlines
        canvas.setDrawColor();
        canvas.drawRectangle(x - BAR_BORDER_WIDTH * 2, y - BAR_BORDER_WIDTH * 2, barWidth + BAR_BORDER_WIDTH * 4, barHeight + BAR_BORDER_WIDTH * 4);
        canvas.setDrawColor(0, 0, 0);
        canvas.drawRectangle(x - BAR_BORDER_WIDTH, y - BAR_BORDER_WIDTH, barWidth + BAR_BORDER_WIDTH * 2, barHeight + BAR_BORDER_WIDTH * 2);
        // Bar
        let w = (barWidth * t) | 0;
        canvas.setDrawColor(255);
        canvas.drawRectangle(x, y, w, barHeight);
    }
    loop(ts, onLoad) {
        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.state.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            if (!this.initialized && this.assets.hasLoaded()) {
                onLoad(this.state);
                if (this.activeSceneType != null)
                    this.activeScene = new this.activeSceneType.prototype.constructor(null, this.state);
                this.initialized = true;
            }
            this.input.preUpdate();
            if (this.initialized && this.activeScene != null) {
                this.activeScene.update(this.state);
            }
            this.transition.update(this.state);
            this.input.postUpdate();
            this.timeSum -= FRAME_WAIT;
        }
        if (this.initialized) {
            if (this.activeScene != null)
                this.activeScene.redraw(this.canvas);
            this.transition.draw(this.canvas);
        }
        else {
            this.drawLoadingScreen(this.canvas);
        }
        window.requestAnimationFrame(ts => this.loop(ts, onLoad));
    }
    addInputAction(name, key, button1, button2 = -1) {
        this.input.addAction(name, key, button1, button2);
        return this;
    }
    loadAssets(indexFilePath) {
        this.assets.parseAssetIndexFile(indexFilePath);
        return this;
    }
    run(initialScene, onLoad) {
        this.activeSceneType = initialScene;
        this.loop(0, onLoad);
    }
    changeScene(newScene) {
        let param = this.activeScene.dispose();
        this.activeScene = new newScene.prototype.constructor(param, this.state);
    }
}
