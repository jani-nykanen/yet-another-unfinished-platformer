import { AssetManager } from "./assets.js";
import { AudioPlayer } from "./audioplayer.js";
import { Canvas } from "./canvas.js";
import { InputManager } from "./input.js";
import { AudioSample } from "./sample.js";
import { Tilemap } from "./tilemap.js";
import { TransitionEffectManager } from "./transition.js";
import { State } from "./types.js";
import { Vector2 } from "./vector.js";


export class FrameState {


    public readonly step : number;
    public readonly transition : TransitionEffectManager;
    public readonly audio : AudioPlayer;

    private readonly input : InputManager;
    private readonly assets : AssetManager;
    private readonly core : Core;


    constructor(step : number, core : Core,
        input : InputManager, assets : AssetManager,
        transition : TransitionEffectManager,
        audio : AudioPlayer) {

        this.core = core;
        this.step = step;
        this.input = input;
        this.assets = assets;
        this.transition = transition;
        this.audio = audio;
    }


    public getStick() : Vector2 {

        return this.input.getStick();
    }


    public getAction(name : string) : State {

        return this.input.getAction(name);
    }


    public leftPress = () : boolean => this.input.leftPress();
    public rightPress = () : boolean => this.input.rightPress();
    public upPress = () : boolean => this.input.upPress();
    public downPress = () : boolean => this.input.downPress();


    public changeScene(newScene : Function) {

        this.core.changeScene(newScene);
    }

    
    public getSample = (name : string) : AudioSample => this.assets.getSample(name);
    public getTilemap = (name : string) : Tilemap => this.assets.getTilemap(name);
}


export interface Scene {

    update(state : FrameState) : void;
    redraw(canvas : Canvas) : void;

    // TODO: Replace any with... something 
    dispose() : any;
}


export class Core {

    private canvas : Canvas;
    private assets : AssetManager;
    private input : InputManager;
    private transition : TransitionEffectManager;
    private state : FrameState;
    private audio : AudioPlayer;

    private activeScene : Scene;
    private activeSceneType : Function;

    private timeSum : number;
    private oldTime : number;

    private initialized : boolean;


    constructor(canvasWidth : number, canvasHeight : number, frameSkip = 0) {

        this.audio = new AudioPlayer();
        this.assets = new AssetManager(this.audio,);
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);
        this.assets.passCanvas(this.canvas);

        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),

        this.transition = new TransitionEffectManager();
        
        this.state = new FrameState(frameSkip+1, this,
            this.input, this.assets, this.transition, this.audio);

        this.timeSum = 0.0;
        this.oldTime = 0.0;

        this.initialized = false;

        this.activeScene = null;
        this.activeSceneType = null;
    }


    private drawLoadingScreen(canvas : Canvas) {

        const BAR_BORDER_WIDTH = 1;

        let barWidth = canvas.width / 4;
        let barHeight = barWidth / 8;

        canvas.clear(0, 0, 0);
        canvas.toggleTexturing(false);

        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();
    
        let t = this.assets.dataLoadedUnit();
        let x = canvas.width/2 - barWidth/2;
        let y = canvas.height/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Outlines
        canvas.setDrawColor();
        canvas.drawRectangle(x-BAR_BORDER_WIDTH*2, y-BAR_BORDER_WIDTH*2, 
            barWidth+BAR_BORDER_WIDTH*4, barHeight+BAR_BORDER_WIDTH*4);
        canvas.setDrawColor(0, 0, 0);
        canvas.drawRectangle(x-BAR_BORDER_WIDTH, y-BAR_BORDER_WIDTH, 
            barWidth+BAR_BORDER_WIDTH*2, barHeight+BAR_BORDER_WIDTH*2);
    
        // Bar
        let w = (barWidth*t) | 0;
        canvas.setDrawColor(255);
        canvas.drawRectangle(x, y, w, barHeight);
        
    }


    private loop(ts : number) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.state.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            if (!this.initialized && this.assets.hasLoaded()) {
                
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

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public addInputAction(name : string, key : string, 
        button1 : number, button2 = -1) : Core {

        this.input.addAction(name, key, button1, button2);

        return this;
    }


    public loadAssets(indexFilePath : string) : Core {

        this.assets.parseAssetIndexFile(indexFilePath);

        return this;
    }


    public run(initialScene : Function) {

        this.activeSceneType = initialScene;

        this.loop(0);
    }


    public changeScene(newScene : Function) {

        let param = this.activeScene.dispose();
        this.activeScene = new newScene.prototype.constructor(param, this.state);
    }
    
}
