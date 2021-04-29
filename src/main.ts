import { Core } from "./core/core.js"
import { GameScene } from "./game.js";


window.onload = () : void => (new Core(1024, 768))
    .addInputAction("fire1", "ArrowUp", 0)
    .addInputAction("start", "Enter", 9, 7)
    .addInputAction("back", "Escape", 8, 6)
    .addInputAction("select", "ShiftLeft", 4, 5)
    .loadAssets("assets/index.json")
    .run(GameScene);

