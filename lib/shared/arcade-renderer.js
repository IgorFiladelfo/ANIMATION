"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArcadeRenderer = exports.ARCADE_GAMES = exports.GAME_REGISTRY = exports.PlayerStyle = void 0;
const index_1 = require("../pacman/index");
Object.defineProperty(exports, "PlayerStyle", { enumerable: true, get: function () { return index_1.PlayerStyle; } });
exports.GAME_REGISTRY = {
    pacman: {
        label: '👻 Pac-Man',
        factory: (conf) => new index_1.PacmanRenderer(conf)
    }
};
exports.ARCADE_GAMES = ['pacman'];
class ArcadeRenderer {
    constructor(conf) {
        const entry = exports.GAME_REGISTRY[conf.game];
        if (!entry)
            throw new Error('This custom Action only supports the pacman game.');
        this.renderer = entry.factory(conf);
    }
    async start() {
        return this.renderer.start();
    }
    stop() {
        this.renderer.stop();
    }
}
exports.ArcadeRenderer = ArcadeRenderer;
