import { AudioPlayer } from "./audioplayer.js";
import { Bitmap } from "./bitmap.js";
import { Canvas } from "./canvas.js";
import { AudioSample } from "./sample.js";
import { Tilemap } from "./tilemap.js";
import { KeyValuePair } from "./types.js";


export class AssetContainer<T> {


    private assets : Array<KeyValuePair<T>>;


    constructor() {

        this.assets = new Array<KeyValuePair<T>> ();
    }


    public getAsset(name : string) : T {

        for (let a of this.assets) {

            if (a.key == name)
                return a.value;
        }

        return null;
    }


    public addAsset(name : string, data : T) {

        this.assets.push(new KeyValuePair<T>(name, data));
    }

}


export class AssetManager {


    private bitmaps : AssetContainer<Bitmap>;
    private samples : AssetContainer<AudioSample>;
    private tilemaps : AssetContainer<Tilemap>;
    private loaded : number;
    private total : number;
    

    private readonly audio : AudioPlayer;
    // We would want this to be readonly, but since
    // canvas has a reference to asset manager, asset 
    // manager cannot have a readonly reference to canvas...
    private canvas : Canvas;


    constructor(audio : AudioPlayer) {

        this.bitmaps = new AssetContainer<Bitmap> ();
        this.samples = new AssetContainer<AudioSample> ();
        this.tilemaps = new AssetContainer<Tilemap> ();

        this.total = 0;
        this.loaded = 0;

        this.audio = audio;
    }


    private loadTextfile(path : string, type : string, cb : (s : string) => void) {
        
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);

        ++ this.total;

        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    if (cb != undefined)
                        cb(xobj.responseText);
                }
                ++ this.loaded;
            }
                
        };
        xobj.send(null);  
    }


    public passCanvas(canvas : Canvas) {

        this.canvas = canvas;
    }


    public loadBitmap(name : string, url : string) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            ++ this.loaded;
            this.bitmaps.addAsset(name, this.canvas.createBitmap(image));
        }
        image.src = url;
    }


    public loadSample(name : string, path : string) {

        ++ this.total;

        let xobj = new XMLHttpRequest();
        xobj.open("GET", path, true);
        xobj.responseType = "arraybuffer";

        xobj.onload = () => {

            this.audio.getContext().decodeAudioData(xobj.response, (data) => {
                
                ++ this.loaded;
                this.samples.addAsset(name, new AudioSample(this.audio.getContext(), data));

            });
        }
        xobj.send(null);
    }


    public loadTilemap(name : string, url : string) {

        ++ this.total;
        
        this.loadTextfile(url, "xml", (str : string) => {

            this.tilemaps.addAsset(name, new Tilemap(str));
            ++ this.loaded;
        });
    }


    public parseAssetIndexFile(url : string) {

        this.loadTextfile(url, "json", (s : string) => {

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


    public hasLoaded() : boolean {

        return this.loaded >= this.total;
    }
    

    public getBitmap(name : string) : Bitmap {

        return this.bitmaps.getAsset(name);
    }


    public getSample(name : string) : AudioSample {

        return this.samples.getAsset(name);
    }


    public getTilemap(name : string) : Tilemap {

        return this.tilemaps.getAsset(name);
    }


    public dataLoadedUnit() : number {

        return this.total == 0 ? 1.0 : this.loaded / this.total;
    }
}
