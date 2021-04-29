import { clamp } from "./mathext.js";
export class AudioPlayer {
    constructor() {
        this.getContext = () => this.ctx;
        this.ctx = new AudioContext();
        this.musicTrack = null;
        this.globalSampleVol = 1.0;
        this.globalMusicVol = 1.0;
        this.enabled = false;
    }
    playSample(sample, vol = 1.0) {
        if (!this.enabled)
            return;
        sample.play(this.ctx, this.globalSampleVol * vol, false, 0);
    }
    playMusic(sample, vol = 1.0) {
        this.fadeInMusic(sample, vol, null);
    }
    fadeInMusic(sample, vol = 1.0, fadeTime = 0.0) {
        if (!this.enabled)
            return;
        if (this.musicTrack != null) {
            this.musicTrack.stop();
            this.musicTrack = null;
        }
        let v = this.globalMusicVol * vol;
        sample.fadeIn(this.ctx, fadeTime == null ? v : 0.01, v, true, 0, fadeTime);
        this.musicTrack = sample;
    }
    toggle(state) {
        this.enabled = state;
    }
    setGlobalSampleVolume(vol = 1.0) {
        this.globalSampleVol = clamp(vol, 0, 1);
    }
    setGlobalMusicVolume(vol = 1.0) {
        this.globalMusicVol = clamp(vol, 0, 1);
    }
    pauseMusic() {
        if (!this.enabled || this.musicTrack == null)
            return;
        this.musicTrack.pause(this.ctx);
    }
    resumeMusic() {
        if (!this.enabled || this.musicTrack == null)
            return;
        this.musicTrack.resume(this.ctx);
    }
    stopMusic() {
        if (!this.enabled || this.musicTrack == null)
            return;
        this.musicTrack.stop();
        this.musicTrack = null;
    }
}
