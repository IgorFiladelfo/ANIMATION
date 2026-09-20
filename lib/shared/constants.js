"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_THEMES = exports.MONTHS = exports.DELTA_TIME = exports.GRID_HEIGHT = exports.GRID_WIDTH = exports.GAP_SIZE = exports.CELL_SIZE = void 0;
/* ───────────── Grid dimensions ───────────── */
exports.CELL_SIZE = 20;
exports.GAP_SIZE = 2;
exports.GRID_WIDTH = 53; // 52 weeks + current week
exports.GRID_HEIGHT = 7; // Sun … Sat
exports.DELTA_TIME = 200;
exports.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/* ───────────── Official GitHub / GitLab Palettes ─────────────
   5-color array: 0 = NONE … 4 = FOURTH_QUARTILE               */
const GITHUB_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const GITHUB_DARK = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const GITLAB_LIGHT = ['#ececef', '#d2dcff', '#7992f5', '#4e65cd', '#303470'];
const GITLAB_DARK = ['#2a2a3d', '#4a5bdc', '#2e3dbf', '#1b2e8a', '#0f1a4e'];
/* ───────────── Game Themes ───────────── */
exports.GAME_THEMES = {
    github: {
        textColor: '#9ec8ee',
        gridBackground: '#06111d',
        wallColor: '#9ec8ee',
        intensityColors: ['#0a1827', '#275d45', '#2e8b57', '#27c96f', '#59e889']
    },
    'github-dark': {
        textColor: '#9ec8ee',
        gridBackground: '#06111d',
        wallColor: '#9ec8ee',
        intensityColors: ['#0a1827', '#275d45', '#2e8b57', '#27c96f', '#59e889']
    },
    gitlab: {
        textColor: '#9ec8ee',
        gridBackground: '#06111d',
        wallColor: '#9ec8ee',
        intensityColors: ['#0a1827', '#275d45', '#2e8b57', '#27c96f', '#59e889']
    },
    'gitlab-dark': {
        textColor: '#9ec8ee',
        gridBackground: '#06111d',
        wallColor: '#9ec8ee',
        intensityColors: ['#0a1827', '#275d45', '#2e8b57', '#27c96f', '#59e889']
    }
};
