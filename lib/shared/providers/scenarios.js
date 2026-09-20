"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenarioContributions = exports.resolveScenarioName = exports.isScenarioName = exports.SCENARIO_DAYS = exports.SCENARIO_WEEKS = void 0;
const types_1 = require("../types");
exports.SCENARIO_WEEKS = 53;
exports.SCENARIO_DAYS = 7;
const isScenarioName = (value) => types_1.SCENARIOS.includes(value);
exports.isScenarioName = isScenarioName;
const resolveScenarioName = (scenarioArg) => {
    const scenarioName = scenarioArg === '' || scenarioArg === undefined ? types_1.SCENARIOS[0] : scenarioArg;
    if (!(0, exports.isScenarioName)(scenarioName)) {
        throw new Error(`Unknown scenario "${scenarioName}". Available scenarios: ${types_1.SCENARIOS.join(', ')}`);
    }
    return scenarioName;
};
exports.resolveScenarioName = resolveScenarioName;
const generateScenarioContributions = (scenarioArg) => {
    const name = (0, exports.resolveScenarioName)(scenarioArg);
    return {
        name,
        contributions: countsToContributions(createScenarioCounts(name))
    };
};
exports.generateScenarioContributions = generateScenarioContributions;
const createScenarioCounts = (name) => {
    switch (name) {
        case 'empty':
            return createEmptyCounts();
        case 'full':
            return createFullCounts(8);
        case 'checkerboard':
            return createCheckerboardCounts({ low: 0, high: 10 });
        case 'gradient':
            return createGradientCounts({ min: 0, max: 12 });
        case 'streaks':
            return createStreakCounts();
        case 'random':
        default:
            return createRandomCounts({ density: 0.5, min: 1, max: 8 });
    }
};
const createEmptyCounts = () => Array.from({ length: exports.SCENARIO_WEEKS }, () => Array(exports.SCENARIO_DAYS).fill(0));
const createFullCounts = (count) => Array.from({ length: exports.SCENARIO_WEEKS }, () => Array(exports.SCENARIO_DAYS).fill(toNonNegativeInteger(count)));
const createRandomCounts = ({ density, min, max }) => {
    const clampedDensity = clampNumber(density, 0, 1);
    const minimum = toNonNegativeInteger(min);
    const maximum = Math.max(minimum, toNonNegativeInteger(max));
    const contributionRange = maximum - minimum + 1;
    return Array.from({ length: exports.SCENARIO_WEEKS }, (_, week) => Array.from({ length: exports.SCENARIO_DAYS }, (_, day) => {
        const value = Math.random();
        if (value >= clampedDensity)
            return 0;
        return minimum + Math.floor(Math.random() * contributionRange);
    }));
};
const createCheckerboardCounts = ({ low, high }) => {
    const lowCount = toNonNegativeInteger(low);
    const highCount = toNonNegativeInteger(high);
    return Array.from({ length: exports.SCENARIO_WEEKS }, (_, week) => Array.from({ length: exports.SCENARIO_DAYS }, (_, day) => ((week + day) % 2 === 0 ? highCount : lowCount)));
};
const createGradientCounts = ({ min, max }) => {
    const minimum = toNonNegativeInteger(min);
    const maximum = Math.max(minimum, toNonNegativeInteger(max));
    return Array.from({ length: exports.SCENARIO_WEEKS }, (_, week) => Array.from({ length: exports.SCENARIO_DAYS }, (_, day) => {
        const weekRatio = week / (exports.SCENARIO_WEEKS - 1);
        const dayRatio = day / (exports.SCENARIO_DAYS - 1);
        return Math.round(minimum + (maximum - minimum) * (weekRatio * 0.75 + dayRatio * 0.25));
    }));
};
const createStreakCounts = () => {
    const counts = createEmptyCounts();
    addHorizontalStreak(counts, { day: 1, startWeek: 2, length: 10, count: 6 });
    addHorizontalStreak(counts, { day: 3, startWeek: 18, length: 12, count: 10 });
    addHorizontalStreak(counts, { day: 5, startWeek: 38, length: 10, count: 14 });
    addHorizontalStreak(counts, { day: 0, startWeek: 43, length: 6, count: 4 });
    addHorizontalStreak(counts, { day: 6, startWeek: 43, length: 6, count: 4 });
    addVerticalBlock(counts, { startWeek: 8, length: 2, startDay: 1, endDay: 5, count: 8 });
    addVerticalBlock(counts, { startWeek: 27, length: 1, startDay: 0, endDay: 6, count: 12 });
    addVerticalBlock(counts, { startWeek: 49, length: 1, startDay: 2, endDay: 6, count: 16 });
    addDiagonalStreak(counts, { startWeek: 5, startDay: 0, length: 9, count: 7 });
    addDiagonalStreak(counts, { startWeek: 30, startDay: 6, length: 8, count: 11, direction: -1 });
    return counts;
};
const addHorizontalStreak = (counts, { day, startWeek, length, count }) => {
    const normalizedDay = clampNumber(toNonNegativeInteger(day), 0, exports.SCENARIO_DAYS - 1);
    const normalizedStartWeek = clampNumber(toNonNegativeInteger(startWeek), 0, exports.SCENARIO_WEEKS - 1);
    const normalizedLength = toNonNegativeInteger(length);
    const normalizedCount = toNonNegativeInteger(count);
    for (let week = normalizedStartWeek; week < Math.min(exports.SCENARIO_WEEKS, normalizedStartWeek + normalizedLength); week++) {
        counts[week][normalizedDay] = Math.max(counts[week][normalizedDay], normalizedCount);
    }
};
const addVerticalBlock = (counts, { startWeek, length, startDay, endDay, count }) => {
    const normalizedStartWeek = clampNumber(toNonNegativeInteger(startWeek), 0, exports.SCENARIO_WEEKS - 1);
    const normalizedLength = toNonNegativeInteger(length);
    const normalizedStartDay = clampNumber(toNonNegativeInteger(startDay), 0, exports.SCENARIO_DAYS - 1);
    const normalizedEndDay = clampNumber(toNonNegativeInteger(endDay), normalizedStartDay, exports.SCENARIO_DAYS - 1);
    const normalizedCount = toNonNegativeInteger(count);
    for (let week = normalizedStartWeek; week < Math.min(exports.SCENARIO_WEEKS, normalizedStartWeek + normalizedLength); week++) {
        for (let day = normalizedStartDay; day <= normalizedEndDay; day++) {
            counts[week][day] = Math.max(counts[week][day], normalizedCount);
        }
    }
};
const addDiagonalStreak = (counts, { startWeek, startDay, length, count, direction = 1 }) => {
    const normalizedStartWeek = clampNumber(toNonNegativeInteger(startWeek), 0, exports.SCENARIO_WEEKS - 1);
    const normalizedStartDay = clampNumber(toNonNegativeInteger(startDay), 0, exports.SCENARIO_DAYS - 1);
    const normalizedLength = toNonNegativeInteger(length);
    const normalizedCount = toNonNegativeInteger(count);
    for (let offset = 0; offset < normalizedLength; offset++) {
        const week = normalizedStartWeek + offset;
        const day = normalizedStartDay + offset * direction;
        if (week >= exports.SCENARIO_WEEKS || day < 0 || day >= exports.SCENARIO_DAYS) {
            continue;
        }
        counts[week][day] = Math.max(counts[week][day], normalizedCount);
    }
};
const countsToContributions = (counts) => {
    const endDate = truncateToUTCDate(new Date());
    endDate.setUTCDate(endDate.getUTCDate() + (exports.SCENARIO_DAYS - 1 - endDate.getUTCDay()));
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 365);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
    const maxCount = Math.max(0, ...counts.flat());
    const contributions = [];
    for (let week = 0; week < exports.SCENARIO_WEEKS; week++) {
        for (let day = 0; day < exports.SCENARIO_DAYS; day++) {
            const date = new Date(startDate);
            date.setUTCDate(startDate.getUTCDate() + week * exports.SCENARIO_DAYS + day);
            const count = counts[week][day];
            contributions.push({
                date,
                count,
                color: '',
                level: countToLevel(count, maxCount)
            });
        }
    }
    return contributions;
};
const countToLevel = (count, maxCount) => {
    if (count === 0 || maxCount === 0)
        return 'NONE';
    const quartile = maxCount / 4;
    if (count < quartile)
        return 'FIRST_QUARTILE';
    if (count < quartile * 2)
        return 'SECOND_QUARTILE';
    if (count < quartile * 3)
        return 'THIRD_QUARTILE';
    return 'FOURTH_QUARTILE';
};
const truncateToUTCDate = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const toNonNegativeInteger = (value) => {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Scenario counts must be non-negative numbers. Received: ${value}`);
    }
    return Math.floor(value);
};
const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));
