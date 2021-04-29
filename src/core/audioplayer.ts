import { clamp } from "./mathext.js";
import { AudioSample } from "./sample.js";

 
export class AudioPlayer {


    private ctx : AudioContext;
    private musicTrack : AudioSample;

    private globalSampleVol : number;
    private globalMusicVol : number;
    private enabled : boolean;


    constructor() {

        this.ctx = new AudioContext();

        this.musicTrack = null;

        this.globalSampleVol = 1.0;
        this.globalMusicVol = 1.0;

        this.enabled = false;
    }


    public playSample(sample : AudioSample, vol = 1.0) {

        if (!this.enabled) return;

        sample.play(this.ctx, 
            this.globalSampleVol*vol, false, 0);
    }


    public playMusic(sample : AudioSample, vol = 1.0) {

        this.fadeInMusic(sample, vol, null);
    }


    public fadeInMusic(sample : AudioSample, vol = 1.0, fadeTime = 0.0) {

        if (!this.enabled) return;

        if (this.musicTrack != null) {

            this.musicTrack.stop();
            this.musicTrack = null;
        }

        let v = this.globalMusicVol*vol;
        sample.fadeIn(this.ctx, fadeTime == null ? v : 0.01, v, true, 0, fadeTime);
        this.musicTrack = sample;
    }


    public toggle(state : boolean) {

        this.enabled = state;
    }


    public setGlobalSampleVolume(vol = 1.0) {

        this.globalSampleVol = clamp(vol, 0, 1);
    }


    public setGlobalMusicVolume(vol = 1.0) {

        this.globalMusicVol = clamp(vol, 0, 1);
    }


    public pauseMusic() {

        if (!this.enabled || this.musicTrack == null)
            return;

        this.musicTrack.pause(this.ctx);
    }


    public resumeMusic() {

        if (!this.enabled || this.musicTrack == null)
            return;

        this.musicTrack.resume(this.ctx);
    }


    public stopMusic() {

        if (!this.enabled || this.musicTrack == null)
            return;

        this.musicTrack.stop();
        this.musicTrack = null;
    }


    public getContext = () : AudioContext => this.ctx;
}