"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacmanMovement = void 0;
const constants_1 = require("../core/constants");
const types_1 = require("../types");
const utils_1 = require("../../shared/utils/utils");
const movement_utils_1 = require("./movement-utils");
const RECENT_POSITIONS_LIMIT = 5;
const movePacman = (store) => {
    if (store.pacman.deadRemainingDuration)
        return;
    const hasPowerup = !!store.pacman.powerupRemainingDuration;
    const scaredGhosts = store.ghosts.filter((ghost) => ghost.scared);
    let targetPosition;
    // Find a target position, ensuring it's never undefined
    try {
        if (hasPowerup && scaredGhosts.length > 0) {
            const ghostPosition = findClosestScaredGhost(store);
            targetPosition = ghostPosition ?? findOptimalTarget(store);
        }
        else if (store.pacman.target) {
            if (store.pacman.x === store.pacman.target.x && store.pacman.y === store.pacman.target.y) {
                targetPosition = findOptimalTarget(store);
                store.pacman.target = targetPosition;
            }
            else {
                targetPosition = store.pacman.target;
            }
        }
        else {
            targetPosition = findOptimalTarget(store);
            store.pacman.target = targetPosition;
        }
        // Safety check to ensure targetPosition is never undefined
        if (!targetPosition) {
            targetPosition = { x: store.pacman.x, y: store.pacman.y };
        }
        const nextPosition = calculateOptimalPath(store, targetPosition);
        nextPosition ? updatePacmanPosition(store, nextPosition) : makeDesperationMove(store);
        checkAndEatPoint(store);
    }
    catch (error) {
        console.error('Error in movePacman:', error);
        // If all else fails, don't move
    }
};
const findClosestScaredGhost = (store) => {
    const scaredGhosts = store.ghosts.filter((g) => g.scared);
    if (scaredGhosts.length === 0)
        return null;
    return scaredGhosts.reduce((closest, ghost) => {
        const distance = movement_utils_1.MovementUtils.calculateDistance(ghost.x, ghost.y, store.pacman.x, store.pacman.y);
        return distance < closest.distance ? { x: ghost.x, y: ghost.y, distance } : closest;
    }, { x: store.pacman.x, y: store.pacman.y, distance: Infinity });
};
const findOptimalTarget = (store) => {
    const pointCells = [];
    for (let x = 0; x < constants_1.GRID_WIDTH; x++) {
        for (let y = 0; y < constants_1.GRID_HEIGHT; y++) {
            const cell = store.grid[x][y];
            if (cell.level !== 'NONE') {
                const distance = movement_utils_1.MovementUtils.calculateDistance(x, y, store.pacman.x, store.pacman.y);
                const value = cell.commitsCount / (distance + 1);
                pointCells.push({ x, y, value });
            }
        }
    }
    pointCells.sort((a, b) => b.value - a.value);
    // Check if there are any cells with points left
    if (pointCells.length === 0) {
        // Return Pac-Man's current position as fallback
        return { x: store.pacman.x, y: store.pacman.y, value: 0 };
    }
    return pointCells[0];
};
const REVISIT_PENALTY = 100;
const GHOST_ADJACENT_DANGER = 14;
const GHOST_ADJACENT_PENALTY = 1000000;
const resolveSafetyWeight = (store) => {
    let safetyWeight = 0.5;
    switch (store.config.playerStyle) {
        case types_1.PlayerStyle.CONSERVATIVE:
            safetyWeight = 3.0;
            break;
        case types_1.PlayerStyle.AGGRESSIVE:
            safetyWeight = 0.3;
            break;
        case types_1.PlayerStyle.OPPORTUNISTIC:
        default:
            safetyWeight = 0.8;
            break;
    }
    let closestGhostDistance = Infinity;
    store.ghosts.forEach((ghost) => {
        if (!ghost.scared) {
            const dist = movement_utils_1.MovementUtils.calculateDistance(store.pacman.x, store.pacman.y, ghost.x, ghost.y);
            closestGhostDistance = Math.min(closestGhostDistance, dist);
        }
    });
    const proximityThreshold = store.config.playerStyle === types_1.PlayerStyle.CONSERVATIVE ? 5 : 7;
    const dangerNearby = closestGhostDistance < proximityThreshold;
    if (store.config.playerStyle === types_1.PlayerStyle.CONSERVATIVE && dangerNearby) {
        safetyWeight *= 5;
    }
    return safetyWeight;
};
const stepCost = (store, dangerMap, safetyWeight, x, y) => {
    const key = `${x},${y}`;
    const danger = dangerMap.get(key) ?? 0;
    const revisit = store.pacman.recentPositions?.includes(key) ? REVISIT_PENALTY : 0;
    const ghostAdjacentPenalty = danger >= GHOST_ADJACENT_DANGER ? GHOST_ADJACENT_PENALTY : 0;
    return 1 + danger * safetyWeight + revisit + ghostAdjacentPenalty;
};
const heuristic = (from, target) => {
    return Math.abs(from.x - target.x) + Math.abs(from.y - target.y);
};
const reconstructFirstStep = (cameFrom, targetKey, startKey) => {
    let cursor = targetKey;
    let parent = cameFrom.get(cursor);
    while (parent !== undefined && parent !== startKey) {
        cursor = parent;
        parent = cameFrom.get(cursor);
    }
    if (parent === undefined)
        return null;
    const [x, y] = cursor.split(',').map(Number);
    return { x, y };
};
const calculateOptimalPath = (store, target) => {
    const start = { x: store.pacman.x, y: store.pacman.y };
    if (start.x === target.x && start.y === target.y)
        return null;
    const dangerMap = createDangerMap(store);
    const safetyWeight = resolveSafetyWeight(store);
    const startKey = `${start.x},${start.y}`;
    const targetKey = `${target.x},${target.y}`;
    const open = [{ x: start.x, y: start.y, g: 0, f: heuristic(start, target) }];
    const gScore = new Map([[startKey, 0]]);
    const cameFrom = new Map();
    while (open.length > 0) {
        let bestIdx = 0;
        for (let i = 1; i < open.length; i++) {
            if (open[i].f < open[bestIdx].f)
                bestIdx = i;
        }
        const current = open.splice(bestIdx, 1)[0];
        const currentKey = `${current.x},${current.y}`;
        if (current.g > (gScore.get(currentKey) ?? Infinity))
            continue;
        if (currentKey === targetKey) {
            return reconstructFirstStep(cameFrom, targetKey, startKey);
        }
        for (const [dx, dy] of movement_utils_1.MovementUtils.getValidMoves(current.x, current.y)) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const neighborKey = `${nx},${ny}`;
            const tentativeG = current.g + stepCost(store, dangerMap, safetyWeight, nx, ny);
            if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
                gScore.set(neighborKey, tentativeG);
                cameFrom.set(neighborKey, currentKey);
                open.push({
                    x: nx,
                    y: ny,
                    g: tentativeG,
                    f: tentativeG + heuristic({ x: nx, y: ny }, target)
                });
            }
        }
    }
    return null;
};
const createDangerMap = (store) => {
    const map = new Map();
    const hasPowerup = !!store.pacman.powerupRemainingDuration;
    store.ghosts.forEach((ghost) => {
        if (ghost.scared)
            return;
        for (let dx = -5; dx <= 5; dx++) {
            for (let dy = -5; dy <= 5; dy++) {
                const x = ghost.x + dx;
                const y = ghost.y + dy;
                if (x >= 0 && x < constants_1.GRID_WIDTH && y >= 0 && y < constants_1.GRID_HEIGHT) {
                    const key = `${x},${y}`;
                    const distance = Math.abs(dx) + Math.abs(dy);
                    const value = 15 - distance;
                    if (value > 0) {
                        const current = map.get(key) || 0;
                        map.set(key, Math.max(current, value));
                    }
                }
            }
        }
    });
    if (hasPowerup) {
        for (const [key, value] of map.entries()) {
            map.set(key, value / 5);
        }
    }
    return map;
};
const makeDesperationMove = (store) => {
    const validMoves = movement_utils_1.MovementUtils.getValidMoves(store.pacman.x, store.pacman.y);
    if (validMoves.length === 0)
        return;
    const safest = validMoves.reduce((best, [dx, dy]) => {
        const newX = store.pacman.x + dx;
        const newY = store.pacman.y + dy;
        let minDist = Infinity;
        store.ghosts.forEach((ghost) => {
            if (!ghost.scared) {
                const dist = movement_utils_1.MovementUtils.calculateDistance(ghost.x, ghost.y, newX, newY);
                minDist = Math.min(minDist, dist);
            }
        });
        return minDist > best.distance ? { dx, dy, distance: minDist } : best;
    }, { dx: 0, dy: 0, distance: -Infinity });
    updatePacmanPosition(store, {
        x: store.pacman.x + safest.dx,
        y: store.pacman.y + safest.dy
    });
};
const updatePacmanPosition = (store, position) => {
    var _a;
    (_a = store.pacman).recentPositions || (_a.recentPositions = []);
    store.pacman.recentPositions.push(`${position.x},${position.y}`);
    if (store.pacman.recentPositions.length > RECENT_POSITIONS_LIMIT) {
        store.pacman.recentPositions.shift();
    }
    const dx = position.x - store.pacman.x;
    const dy = position.y - store.pacman.y;
    store.pacman.direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : store.pacman.direction;
    store.pacman.x = position.x;
    store.pacman.y = position.y;
};
const checkAndEatPoint = (store) => {
    const cell = store.grid[store.pacman.x][store.pacman.y];
    if (cell.level !== 'NONE') {
        store.pacman.totalPoints += cell.commitsCount;
        store.pacman.points++;
        const theme = utils_1.Utils.getCurrentTheme(store);
        if (cell.level === 'FOURTH_QUARTILE') {
            activatePowerUp(store);
        }
        cell.level = 'NONE';
        cell.color = theme.intensityColors[0];
        cell.commitsCount = 0;
        // Record the color change, keyed to the frame that pushSnapshot will write next.
        store.cellEvents.push({
            frameIndex: store.gameHistory.length,
            x: store.pacman.x,
            y: store.pacman.y,
            color: cell.color
        });
        store.config.pointsIncreasedCallback(store.pacman.totalPoints);
    }
};
const activatePowerUp = (store) => {
    store.pacman.powerupRemainingDuration = constants_1.PACMAN_POWERUP_DURATION;
    store.ghosts.forEach((g) => {
        if (g.name !== 'eyes')
            g.scared = true;
    });
};
exports.PacmanMovement = {
    movePacman
};
