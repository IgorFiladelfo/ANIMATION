"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementUtils = void 0;
const constants_1 = require("../core/constants");
const getValidMoves = (x, y) => {
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    return directions.filter(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX < 0 || newX >= constants_1.GRID_WIDTH || newY < 0 || newY >= constants_1.GRID_HEIGHT) {
            return false;
        }
        if (dx === -1) {
            return !constants_1.WALLS.vertical[x][y].active;
        }
        else if (dx === 1) {
            return !constants_1.WALLS.vertical[x + 1][y].active;
        }
        else if (dy === -1) {
            return !constants_1.WALLS.horizontal[x][y].active;
        }
        else if (dy === 1) {
            return !constants_1.WALLS.horizontal[x][y + 1].active;
        }
        return true;
    });
};
const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};
exports.MovementUtils = {
    getValidMoves,
    calculateDistance,
    findNextStepDijkstra(start, target) {
        if (start.x === target.x && start.y === target.y)
            return null;
        const pq = [{ ...start, cost: 0, path: [] }];
        const visited = new Set([`${start.x},${start.y}`]);
        while (pq.length) {
            pq.sort((a, b) => a.cost - b.cost);
            const { x, y, cost, path } = pq.shift();
            for (const [dx, dy] of getValidMoves(x, y)) {
                const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
                if (visited.has(key))
                    continue;
                visited.add(key);
                const newPath = [...path, { x: nx, y: ny }];
                if (nx === target.x && ny === target.y) {
                    return newPath.length > 0 ? newPath[0] : null;
                }
                pq.push({ x: nx, y: ny, cost: cost + 1, path: newPath });
            }
        }
        return null;
    }
};
