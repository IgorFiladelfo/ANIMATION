"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RendererUnits = void 0;
const constants_1 = require("../core/constants");
const generatePacManColors = (pacman) => {
    if (pacman.deadRemainingDuration) {
        return constants_1.PACMAN_COLOR_DEAD;
    }
    else if (pacman.powerupRemainingDuration) {
        return constants_1.PACMAN_COLOR_POWERUP;
    }
    else {
        return constants_1.PACMAN_COLOR;
    }
};
exports.RendererUnits = {
    generatePacManColors
};
