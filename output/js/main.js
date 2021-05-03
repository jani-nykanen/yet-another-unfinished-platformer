import { Core } from "./core/core.js";
import { GameScene } from "./game.js";
window.onload = () => (new Core(1024, 768))
    .addInputAction("fire1", "Space", 0)
    .addInputAction("start", "Enter", 9, 7)
    .addInputAction("back", "Escape", 8, 6)
    .loadAssets("assets/index.json")
    .run(GameScene, state => {
    state.setFilter("paperFilter", 0.1);
});
