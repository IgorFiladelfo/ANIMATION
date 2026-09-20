"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.createGridFromData = exports.buildMonthLabels = exports.buildGrid = exports.calculateContributionLevel = exports.levelToIndex = exports.getCurrentTheme = void 0;
const constants_1 = require("../constants");
/* ─────────────────────────── Helpers ─────────────────────────── */
const weeksBetween = (start, end) => Math.floor((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
const truncateToUTCDate = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const getLatestContributionDate = (store) => store.contributions.reduce((latestDate, contribution) => {
    const contributionDate = truncateToUTCDate(new Date(contribution.date));
    return latestDate === undefined || contributionDate > latestDate ? contributionDate : latestDate;
}, undefined);
const getGridEndDate = (store) => {
    const endDate = truncateToUTCDate(new Date());
    const latestContributionDate = getLatestContributionDate(store);
    if (latestContributionDate && latestContributionDate > endDate) {
        return latestContributionDate;
    }
    return endDate;
};
const getGridStartDate = (endDate) => {
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - (constants_1.GRID_WIDTH - 1) * 7 - endDate.getUTCDay());
    return startDate;
};
/* ───────────────────────── Theme helpers ────────────────────── */
const getCurrentTheme = (store) => constants_1.GAME_THEMES[store.config.gameTheme] ?? constants_1.GAME_THEMES['github'];
exports.getCurrentTheme = getCurrentTheme;
const levelToIndex = (level) => {
    switch (level) {
        case 'NONE':
            return 0;
        case 'FIRST_QUARTILE':
            return 1;
        case 'SECOND_QUARTILE':
            return 2;
        case 'THIRD_QUARTILE':
            return 3;
        case 'FOURTH_QUARTILE':
            return 4;
        default:
            return 0;
    }
};
exports.levelToIndex = levelToIndex;
const calculateContributionLevel = (contribution, maxContribution) => {
    const q = maxContribution / 4;
    if (contribution === 0)
        return 'NONE';
    if (contribution < q)
        return 'FIRST_QUARTILE';
    if (contribution < 2 * q)
        return 'SECOND_QUARTILE';
    if (contribution < 3 * q)
        return 'THIRD_QUARTILE';
    return 'FOURTH_QUARTILE';
};
exports.calculateContributionLevel = calculateContributionLevel;
const buildGrid = (store) => {
    const endDate = getGridEndDate(store);
    const startDate = getGridStartDate(endDate);
    const grid = Array.from({ length: constants_1.GRID_WIDTH }, () => Array.from({ length: constants_1.GRID_HEIGHT }, () => ({
        commitsCount: 0,
        color: (0, exports.getCurrentTheme)(store).intensityColors[0],
        level: 'NONE'
    })));
    store.contributions.forEach((c) => {
        const date = truncateToUTCDate(new Date(c.date));
        if (date < startDate || date > endDate)
            return;
        const day = date.getUTCDay();
        const week = weeksBetween(startDate, date);
        if (week >= 0 && week < constants_1.GRID_WIDTH) {
            const theme = (0, exports.getCurrentTheme)(store);
            grid[week][day] = {
                commitsCount: c.count,
                color: theme.intensityColors[(0, exports.levelToIndex)(c.level)],
                level: c.level
            };
        }
    });
    store.grid = grid;
};
exports.buildGrid = buildGrid;
const buildMonthLabels = (store) => {
    const endDate = getGridEndDate(store);
    const startDate = getGridStartDate(endDate);
    const realWidth = weeksBetween(startDate, endDate) + 1;
    const labels = Array(realWidth).fill('');
    let lastMonth = '';
    for (let week = 0; week < realWidth; week++) {
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + week * 7);
        const currentMonth = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
        if (currentMonth !== lastMonth) {
            labels[week] = currentMonth;
            lastMonth = currentMonth;
        }
    }
    store.monthLabels = realWidth > constants_1.GRID_WIDTH ? labels.slice(realWidth - constants_1.GRID_WIDTH) : labels;
};
exports.buildMonthLabels = buildMonthLabels;
const createGridFromData = (store) => {
    (0, exports.buildGrid)(store);
    return store.grid;
};
exports.createGridFromData = createGridFromData;
exports.Utils = {
    getCurrentTheme: exports.getCurrentTheme,
    buildGrid: exports.buildGrid,
    buildMonthLabels: exports.buildMonthLabels,
    createGridFromData: exports.createGridFromData,
    levelToIndex: exports.levelToIndex
};
