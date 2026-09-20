"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacmanRenderer = exports.PlayerStyle = void 0;
const providers_1 = require("../shared/providers/providers");
const utils_1 = require("../shared/utils/utils");
const game_1 = require("./core/game");
const store_1 = require("./core/store");
const types_1 = require("./types");
const grid_1 = require("./utils/grid");
var types_2 = require("./types");
Object.defineProperty(exports, "PlayerStyle", { enumerable: true, get: function () { return types_2.PlayerStyle; } });
class PacmanRenderer {
    constructor(conf) {
        this.conf = { ...conf };
    }
    async start() {
        const defaultConfig = {
            platform: 'github',
            username: '',
            svgCallback: (_) => { },
            gameOverCallback: () => { },
            gameTheme: 'github',
            pointsIncreasedCallback: (_) => { },
            githubSettings: { accessToken: '' },
            playerStyle: types_1.PlayerStyle.OPPORTUNISTIC
        };
        this.store = JSON.parse(JSON.stringify(store_1.Store));
        this.store.config = { ...defaultConfig, ...this.conf };
        this.store.contributions = await providers_1.Providers.fetchContributions(this.store);
        grid_1.Grid.buildWalls();
        utils_1.Utils.buildGrid(this.store);
        utils_1.Utils.buildMonthLabels(this.store);
        await game_1.Game.startGame(this.store);
        return this.store;
    }
    stop() {
        game_1.Game.stopGame(this.store);
    }
}
exports.PacmanRenderer = PacmanRenderer;
