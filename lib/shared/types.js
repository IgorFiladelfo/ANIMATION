"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCENARIOS = exports.SCENARIO_REGISTRY = exports.PLATFORMS = exports.PLATFORM_REGISTRY = void 0;
exports.PLATFORM_REGISTRY = {
    github: {
        label: '🐙 GitHub'
    },
    gitlab: {
        label: '🦊 GitLab'
    },
    scenario: {
        label: '🏞️ Scenario'
    }
};
exports.PLATFORMS = Object.keys(exports.PLATFORM_REGISTRY);
exports.SCENARIO_REGISTRY = {
    random: {
        label: '🎲 Random'
    },
    full: {
        label: '🟩 Full'
    },
    empty: {
        label: '⬜ Empty'
    },
    checkerboard: {
        label: '🏁 Checkerboard'
    },
    gradient: {
        label: '🌈 Gradient'
    },
    streaks: {
        label: '📈 Streaks'
    }
};
exports.SCENARIOS = Object.keys(exports.SCENARIO_REGISTRY);
