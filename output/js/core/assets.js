import { AudioSample } from "./sample.js";
import { Tilemap } from "./tilemap.js";
import { KeyValuePair } from "./types.js";
export class AssetContainer {
    constructor() {
        this.assets = new Array();
    }
    getAsset(name) {
        for (let a of this.assets) {
            if (a.key == name)
                return a.value;
        }
        return null;
    }
    addAsset(name, data) {
        this.assets.push(new KeyValuePair(name, data));
    }
}
export class AssetManager {
    constructor(audio) {
        this.bitmaps = new AssetContainer();
        this.samples = new AssetContainer();
        this.tilemaps = new AssetContainer();
        this.total = 0;
        this.loaded = 0;
        this.audio = audio;
    }
    loadTextfile(path, type, cb) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);
        ++this.total;
        xobj.onreadystatechange = () => {
            if (xobj.readyState == 4) {
                if (String(xobj.status) == "200") {
                    if (cb != undefined)
                        cb(xobj.responseText);
                }
                ++this.loaded;
            }
        };
        xobj.send(null);
    }
    passCanvas(canvas) {
        this.canvas = canvas;
    }
    loadBitmap(name, url) {
        ++this.total;
        let image = new Image();
        image.onload = () => {
            ++this.loaded;
            this.bitmaps.addAsset(name, this.canvas.createBitmap(image));
        };
        image.src = url;
    }
    loadSample(name, path) {
        ++this.total;
        let xobj = new XMLHttpRequest();
        xobj.open("GET", path, true);
        xobj.responseType = "arraybuffer";
        xobj.onload = () => {
            this.audio.getContext().decodeAudioData(xobj.response, (data) => {
                ++this.loaded;
                this.samples.addAsset(name, new AudioSample(this.audio.getContext(), data));
            });
        };
        xobj.send(null);
    }
    loadTilemap(name, url) {
        ++this.total;
        this.loadTextfile(url, "xml", (str) => {
            this.tilemaps.addAsset(name, new Tilemap(str));
            ++this.loaded;
        });
    }
    parseAssetIndexFile(url) {
        this.loadTextfile(url, "json", (s) => {
            let data = JSON.parse(s);
            let path = data["bitmapPath"];
            for (let o of data["bitmaps"]) {
                this.loadBitmap(o["name"], path + o["path"]);
            }
            path = data["samplePath"];
            for (let o of data["samples"]) {
                this.loadSample(o["name"], path + o["path"]);
            }
            path = data["tilemapPath"];
            for (let o of data["tilemaps"]) {
                this.loadTilemap(o["name"], path + o["path"]);
            }
        });
    }
    hasLoaded() {
        return this.loaded >= this.total;
    }
    getBitmap(name) {
        return this.bitmaps.getAsset(name);
    }
    getSample(name) {
        return this.samples.getAsset(name);
    }
    getTilemap(name) {
        return this.tilemaps.getAsset(name);
    }
    dataLoadedUnit() {
        return this.total == 0 ? 1.0 : this.loaded / this.total;
    }
}
