import { KeyValuePair } from "./types.js";
export class Tilemap {
    constructor(xmlString) {
        let doc = (new DOMParser()).parseFromString(xmlString, "text/xml");
        let root = doc.getElementsByTagName("map")[0];
        this.width = Number(root.getAttribute("width"));
        this.height = Number(root.getAttribute("height"));
        // TODO: Get rid of <any>
        let data = root.getElementsByTagName("layer");
        this.layers = new Array();
        // Find the minimal id
        let min = 9999; // "Big number"
        for (let d of data) {
            if (d.id < min) {
                min = d.id;
            }
        }
        let str;
        let content;
        let id;
        for (let i = 0; i < data.length; ++i) {
            id = Number(data[i].id) - min;
            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0]
                .childNodes[0]
                .nodeValue
                .replace(/(\r\n|\n|\r)/gm, "");
            content = str.split(",");
            this.layers[id] = new Array();
            for (let j = 0; j < content.length; ++j) {
                this.layers[id][j] = parseInt(content[j]);
            }
        }
        // Read (optional) properties
        this.properties = new Array();
        let prop = root.getElementsByTagName("properties")[0];
        if (prop != undefined) {
            // TODO: Get rid of <any>
            for (let p of prop.getElementsByTagName("property")) {
                if (p.getAttribute("name") != undefined) {
                    this.properties.push(new KeyValuePair(p.getAttribute("name"), p.getAttribute("value")));
                }
            }
        }
    }
    getTile(l, x, y) {
        if (l < 0 || l >= this.layers.length || x < 0 || y < 0 ||
            x >= this.width || y >= this.height)
            return -1;
        return this.layers[l][y * this.width + x];
    }
    getIndexedTile(l, i) {
        if (l < 0 || l >= this.layers.length ||
            i < 0 || i >= this.width * this.height)
            return -1;
        return this.layers[l][i];
    }
    cloneLayer(l) {
        if (l < 0 || l >= this.layers.length)
            return null;
        return Array.from(this.layers[l]);
    }
    cloneLayers(end = this.layers.length) {
        return (new Array(end))
            .fill(null)
            .map((a, i) => this.cloneLayer(i));
    }
}
