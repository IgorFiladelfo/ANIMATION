"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVG = void 0;
const utils_1 = require("../../shared/utils/utils");
const constants_1 = require("../core/constants");
const renderer_units_1 = require("./renderer-units");
const SVG_KEY_TIMES_PRECISION = 4;
const GRID_OFFSET_X = 8;
const GRID_OFFSET_Y = 38;
const GRID_STEP = constants_1.CELL_SIZE + constants_1.GAP_SIZE;
const generateAnimatedSVG = (store) => {
    const gridPixelWidth = constants_1.GRID_WIDTH * GRID_STEP;
    const gridPixelHeight = constants_1.GRID_HEIGHT * GRID_STEP;
    const svgWidth = gridPixelWidth + GRID_OFFSET_X * 2;
    const svgHeight = GRID_OFFSET_Y + gridPixelHeight + 14;
    const totalDurationMs = store.gameHistory.length * constants_1.DELTA_TIME;
    const animationDurationMs = Math.max(totalDurationMs, constants_1.DELTA_TIME);
    const theme = utils_1.Utils.getCurrentTheme(store);
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated Pac-Man contribution graph">`;
    svg += `<defs>
		<linearGradient id="arcadeBg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#071421"/><stop offset="0.55" stop-color="#06111d"/><stop offset="1" stop-color="#040c15"/>
		</linearGradient>
		<linearGradient id="arcadeWall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#f5fbff"/><stop offset="0.20" stop-color="#c8e4f2"/><stop offset="0.52" stop-color="#6d94ad"/><stop offset="0.78" stop-color="#365c77"/><stop offset="1" stop-color="#d7edf8"/>
		</linearGradient>
		<linearGradient id="arcadeFrame" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#ff7a00"/><stop offset="0.25" stop-color="#ffc437"/><stop offset="0.50" stop-color="#ff8a00"/><stop offset="0.75" stop-color="#ffd24a"/><stop offset="1" stop-color="#ff7a00"/>
		</linearGradient>
		<radialGradient id="cellGlow" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#142d45"/><stop offset="1" stop-color="#0a1827"/></radialGradient>
		<filter id="pacGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="1.8" result="b"/><feFlood flood-color="#ffd93d" flood-opacity="0.45" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="pelletGlow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="1.2" result="b"/><feFlood flood-color="#ffc83d" flood-opacity="0.75" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="blockGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.5" result="b"/><feFlood flood-color="#39e77a" flood-opacity="0.45" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="ghostGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="0.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="wallShadow" x="-30%" y="-80%" width="160%" height="260%"><feDropShadow dx="0" dy="1.2" stdDeviation="0.8" flood-color="#00020a" flood-opacity="0.95"/></filter>
		<pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#ffffff" opacity="0.016"/></pattern>
	</defs>`;
    svg += `<desc>STP arcade-styled Pac-Man contribution animation. Generated ${new Date().toISOString()}.</desc>`;
    svg += `<metadata><info><frames>${store.gameHistory.length}</frames><frameRate>${1000 / constants_1.DELTA_TIME}</frameRate><durationMs>${totalDurationMs}</durationMs><generatedOn>${new Date().toISOString()}</generatedOn></info></metadata>`;
    // Cabinet / frame
    svg += `<rect x="1.5" y="1.5" width="${svgWidth - 3}" height="${svgHeight - 3}" rx="9" fill="url(#arcadeBg)" stroke="#321b08" stroke-width="3"/>`;
    svg += `<rect x="3.5" y="3.5" width="${svgWidth - 7}" height="${svgHeight - 7}" rx="8" fill="none" stroke="url(#arcadeFrame)" stroke-width="1.6"/>`;
    svg += `<path d="M 12 5 H ${svgWidth - 12}" stroke="#ff9b12" stroke-width="1.2" opacity="0.65"/>`;
    svg += `<path d="M 12 ${svgHeight - 5} H ${svgWidth - 12}" stroke="#ff9b12" stroke-width="1.2" opacity="0.65"/>`;
    svg += `<rect x="5" y="5" width="${svgWidth - 10}" height="${svgHeight - 10}" rx="7" fill="url(#scanlines)" pointer-events="none"/>`;
    if (store.ghosts.length > 0)
        svg += generateGhostsPredefinition();
    // Month rail + labels
    const railY = 29;
    svg += `<line x1="${GRID_OFFSET_X}" y1="${railY}" x2="${svgWidth - GRID_OFFSET_X}" y2="${railY}" stroke="#173754" stroke-width="1.2"/>`;
    let lastMonth = '';
    if (store.config.showMonthLabels !== false) {
        for (let x = 0; x < constants_1.GRID_WIDTH; x++) {
            if (store.monthLabels[x] && store.monthLabels[x] !== lastMonth) {
                const xPos = GRID_OFFSET_X + x * GRID_STEP + constants_1.CELL_SIZE / 2;
                svg += `<text x="${xPos}" y="18" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="800" letter-spacing="0.25" font-size="9.5" fill="#9ec8ee">${store.monthLabels[x]}</text>`;
                svg += `<circle cx="${xPos}" cy="${railY}" r="2.2" fill="#ff9b12" filter="url(#pelletGlow)"/>`;
                lastMonth = store.monthLabels[x];
            }
        }
    }
    // Dark arcade tiles + animated contribution items.
    for (let x = 0; x < constants_1.GRID_WIDTH; x++) {
        for (let y = 0; y < constants_1.GRID_HEIGHT; y++) {
            const cellX = GRID_OFFSET_X + x * GRID_STEP;
            const cellY = GRID_OFFSET_Y + y * GRID_STEP;
            const cellColorAnimation = getCellAnimationData(store, x, y);
            const visual = getContributionVisualAnimationData(cellColorAnimation, theme.intensityColors);
            svg += `<rect id="c-${x}-${y}" x="${cellX}" y="${cellY}" width="${constants_1.CELL_SIZE}" height="${constants_1.CELL_SIZE}" rx="3.2" fill="url(#cellGlow)" stroke="#15304a" stroke-width="0.75"/>`;
            if (visual.hasPellet) {
                const cx = cellX + constants_1.CELL_SIZE / 2;
                const cy = cellY + constants_1.CELL_SIZE / 2;
                svg += `<circle cx="${cx}" cy="${cy}" r="2.25" fill="#ffc83d" opacity="${visual.pelletOpacity[0]}" filter="url(#pelletGlow)">`;
                if (visual.animated)
                    svg += `<animate attributeName="opacity" dur="${animationDurationMs}ms" repeatCount="indefinite" calcMode="discrete" values="${visual.pelletOpacity.join(';')}" keyTimes="${cellColorAnimation.keyTimes}"/>`;
                svg += `</circle>`;
            }
            if (visual.hasBlock) {
                svg += `<rect x="${cellX + 2}" y="${cellY + 2}" width="${constants_1.CELL_SIZE - 4}" height="${constants_1.CELL_SIZE - 4}" rx="3" fill="${visual.blockFill[0]}" stroke="#8affb1" stroke-width="0.65" opacity="${visual.blockOpacity[0]}" filter="url(#blockGlow)">`;
                if (visual.animated) {
                    svg += `<animate attributeName="opacity" dur="${animationDurationMs}ms" repeatCount="indefinite" calcMode="discrete" values="${visual.blockOpacity.join(';')}" keyTimes="${cellColorAnimation.keyTimes}"/>`;
                    svg += `<animate attributeName="fill" dur="${animationDurationMs}ms" repeatCount="indefinite" calcMode="discrete" values="${visual.blockFill.join(';')}" keyTimes="${cellColorAnimation.keyTimes}"/>`;
                }
                svg += `</rect>`;
            }
        }
    }
    // Metallic maze walls generated by the original game logic.
    for (let y = 0; y < constants_1.GRID_HEIGHT; y++) {
        let runStart = null;
        for (let x = 0; x <= constants_1.GRID_WIDTH; x++) {
            const active = x < constants_1.GRID_WIDTH && constants_1.WALLS.horizontal[x][y].active;
            if (active && runStart === null)
                runStart = x;
            if ((!active || x === constants_1.GRID_WIDTH) && runStart !== null) {
                const length = x - runStart;
                const wx = GRID_OFFSET_X + runStart * GRID_STEP - constants_1.GAP_SIZE;
                const wy = GRID_OFFSET_Y + y * GRID_STEP - constants_1.GAP_SIZE;
                const ww = length * GRID_STEP;
                svg += `<rect id="wh-${runStart}-${y}" x="${wx}" y="${wy}" width="${ww}" height="3.4" rx="1.7" fill="#06101a" opacity="0.9"/>`;
                svg += `<rect x="${wx}" y="${wy + 0.35}" width="${ww}" height="2.5" rx="1.25" fill="url(#arcadeWall)"/>`;
                runStart = null;
            }
        }
    }
    for (let x = 0; x < constants_1.GRID_WIDTH; x++) {
        let runStart = null;
        for (let y = 0; y <= constants_1.GRID_HEIGHT; y++) {
            const active = y < constants_1.GRID_HEIGHT && constants_1.WALLS.vertical[x][y].active;
            if (active && runStart === null)
                runStart = y;
            if ((!active || y === constants_1.GRID_HEIGHT) && runStart !== null) {
                const length = y - runStart;
                const wx = GRID_OFFSET_X + x * GRID_STEP - constants_1.GAP_SIZE;
                const wy = GRID_OFFSET_Y + runStart * GRID_STEP - constants_1.GAP_SIZE;
                const wh = length * GRID_STEP;
                svg += `<rect id="wv-${x}-${runStart}" x="${wx}" y="${wy}" width="3.4" height="${wh}" rx="1.7" fill="#06101a" opacity="0.9"/>`;
                svg += `<rect x="${wx + 0.35}" y="${wy}" width="2.5" height="${wh}" rx="1.25" fill="url(#arcadeWall)"/>`;
                runStart = null;
            }
        }
    }
    // Pac-Man keeps the original pathfinding/movement; only its rendering changes.
    const pacmanColorAnimation = generateChangingValuesAnimation(store, store.gameHistory.map((el) => renderer_units_1.RendererUnits.generatePacManColors(el.pacman)), renderer_units_1.RendererUnits.generatePacManColors(store.pacman));
    const pacmanPositionAnimation = generateChangingValuesAnimation(store, generatePacManPositions(store), generatePacManPosition(store.pacman));
    const pacmanRotationAnimation = generateChangingValuesAnimation(store, generatePacManRotations(store), generatePacManRotation(store.pacman.direction));
    svg += `<path id="pacman" d="${generatePacManPath(0.58)}" fill="${constants_1.PACMAN_COLOR}" stroke="#ffe56c" stroke-width="0.7" filter="url(#pacGlow)">
		<animate attributeName="fill" dur="${animationDurationMs}ms" repeatCount="indefinite" keyTimes="${pacmanColorAnimation.keyTimes}" values="${pacmanColorAnimation.values}"/>
		<animateTransform attributeName="transform" type="translate" dur="${animationDurationMs}ms" repeatCount="indefinite" keyTimes="${pacmanPositionAnimation.keyTimes}" values="${pacmanPositionAnimation.values}" additive="sum"/>
		<animateTransform attributeName="transform" type="rotate" dur="${animationDurationMs}ms" repeatCount="indefinite" keyTimes="${pacmanRotationAnimation.keyTimes}" values="${pacmanRotationAnimation.values}" calcMode="discrete" additive="sum"/>
		<animate attributeName="d" dur="0.34s" repeatCount="indefinite" values="${generatePacManPath(0.60)};${generatePacManPath(0.10)};${generatePacManPath(0.60)}"/>
	</path>`;
    store.ghosts.forEach((ghost, index) => {
        const ghostPositionAnimation = generateChangingValuesAnimation(store, generateGhostPositions(store, index), generateGhostPosition(ghost));
        svg += `<g id="ghost${index}" transform="translate(0,0)" filter="url(#ghostGlow)">
			<animateTransform attributeName="transform" type="translate" dur="${animationDurationMs}ms" repeatCount="indefinite" keyTimes="${ghostPositionAnimation.keyTimes}" values="${ghostPositionAnimation.values}" additive="replace"/>`;
        const stateChanges = mapGhostStateChanges(store, index);
        for (const [state, keyframes] of Object.entries(stateChanges)) {
            if (keyframes.length === 0 || !keyframes.some((keyframe) => keyframe.visible))
                continue;
            const keyTimes = keyframes.map((kf) => kf.time.toFixed(SVG_KEY_TIMES_PRECISION)).join(';');
            const values = keyframes.map((kf) => (kf.visible ? 'visible' : 'hidden')).join(';');
            const initialVisibility = keyframes[0].visible ? 'visible' : 'hidden';
            svg += `<use href="#ghost-${state}" width="${constants_1.CELL_SIZE}" height="${constants_1.CELL_SIZE}" visibility="${initialVisibility}"><animate attributeName="visibility" dur="${animationDurationMs}ms" repeatCount="indefinite" keyTimes="${keyTimes}" values="${values}"/></use>`;
        }
        svg += `</g>`;
    });
    svg += '</svg>';
    return svg;
};
const getContributionVisualAnimationData = (animation, palette) => {
    const colors = animation.values.split(';');
    const normalizedPalette = palette.map((color) => color.toLowerCase());
    const levels = colors.map((color) => {
        const level = normalizedPalette.indexOf(color.toLowerCase());
        return level < 0 ? 0 : level;
    });
    const pelletOpacity = levels.map((level) => (level === 1 ? '0.72' : level === 2 ? '1' : '0'));
    const blockOpacity = levels.map((level) => (level >= 3 ? '1' : '0'));
    const blockFill = levels.map((level) => (level >= 4 ? '#59e889' : '#27c96f'));
    return {
        animated: colors.some((color) => color !== colors[0]),
        hasPellet: pelletOpacity.some((value) => value !== '0'),
        hasBlock: blockOpacity.some((value) => value !== '0'),
        pelletOpacity,
        blockOpacity,
        blockFill
    };
};
function mapGhostStateChanges(store, ghostIndex) {
    // Maps each "name-direction" / "scared" / "eyes-direction" state to an array
    // of visibility keyframes, so each state can be shown/hidden independently.
    const stateChanges = {};
    const allPossibleStates = [
        'blinky-up',
        'blinky-down',
        'blinky-left',
        'blinky-right',
        'inky-up',
        'inky-down',
        'inky-left',
        'inky-right',
        'pinky-up',
        'pinky-down',
        'pinky-left',
        'pinky-right',
        'clyde-up',
        'clyde-down',
        'clyde-left',
        'clyde-right',
        'eyes-up',
        'eyes-down',
        'eyes-left',
        'eyes-right',
        'scared'
    ];
    allPossibleStates.forEach((state) => {
        stateChanges[state] = [{ time: 0, visible: false }];
    });
    const initialGhost = store.ghosts[ghostIndex];
    if (!initialGhost)
        return stateChanges;
    const initialState = initialGhost.scared
        ? 'scared'
        : initialGhost.name === 'eyes'
            ? `eyes-${initialGhost.direction || 'right'}`
            : `${initialGhost.name}-${initialGhost.direction || 'right'}`;
    stateChanges[initialState] = [{ time: 0, visible: true }];
    let lastState = initialState;
    store.gameHistory.forEach((state, frameIndex) => {
        if (ghostIndex >= state.ghosts.length)
            return;
        const ghost = state.ghosts[ghostIndex];
        const currentTime = frameIndex / Math.max(store.gameHistory.length - 1, 1);
        const currentState = ghost.scared
            ? 'scared'
            : ghost.name === 'eyes'
                ? `eyes-${ghost.direction || 'right'}`
                : `${ghost.name}-${ghost.direction || 'right'}`;
        if (currentState !== lastState) {
            stateChanges[lastState].push({ time: currentTime, visible: false });
            if (!stateChanges[currentState]) {
                stateChanges[currentState] = [{ time: 0, visible: false }];
            }
            stateChanges[currentState].push({ time: currentTime, visible: true });
            lastState = currentState;
        }
    });
    stateChanges[lastState].push({ time: 1, visible: true });
    Object.keys(stateChanges).forEach((state) => {
        if (state !== lastState && stateChanges[state].length > 0) {
            const lastKeyframe = stateChanges[state][stateChanges[state].length - 1];
            if (lastKeyframe.time < 1) {
                stateChanges[state].push({ time: 1, visible: false });
            }
        }
    });
    return stateChanges;
}
const generatePacManPath = (mouthAngle) => {
    const radius = constants_1.CELL_SIZE / 2;
    const startAngle = mouthAngle;
    const endAngle = 2 * Math.PI - mouthAngle;
    return `M ${radius},${radius}
            L ${radius + radius * Math.cos(startAngle)},${radius + radius * Math.sin(startAngle)}
            A ${radius},${radius} 0 1,1 ${radius + radius * Math.cos(endAngle)},${radius + radius * Math.sin(endAngle)}
            Z`;
};
const generatePacManPosition = (pacman) => {
    const x = GRID_OFFSET_X + pacman.x * (constants_1.CELL_SIZE + constants_1.GAP_SIZE);
    const y = GRID_OFFSET_Y + pacman.y * (constants_1.CELL_SIZE + constants_1.GAP_SIZE);
    return `${x},${y}`;
};
const generatePacManPositions = (store) => store.gameHistory.map((state) => generatePacManPosition(state.pacman));
const generatePacManRotation = (direction) => {
    const pivot = constants_1.CELL_SIZE / 2;
    switch (direction) {
        case 'right':
            return `0 ${pivot} ${pivot}`;
        case 'left':
            return `180 ${pivot} ${pivot}`;
        case 'up':
            return `270 ${pivot} ${pivot}`;
        case 'down':
            return `90 ${pivot} ${pivot}`;
    }
};
const generatePacManRotations = (store) => {
    // The direction stored in snapshot[i+1] is the direction taken during the slide
    // that begins at keyframe i, so shift one frame forward to keep it in sync.
    return store.gameHistory.map((_, i) => {
        const lookaheadIndex = Math.min(i + 1, store.gameHistory.length - 1);
        return generatePacManRotation(store.gameHistory[lookaheadIndex].pacman.direction);
    });
};
/** Build cell color animation data from the sparse cellEvents list. */
const getCellAnimationData = (store, x, y) => {
    const totalFrames = store.gameHistory.length;
    const initialColor = store.initialColors[x]?.[y] ?? utils_1.Utils.getCurrentTheme(store).intensityColors[0];
    const events = store.cellEvents.filter((e) => e.x === x && e.y === y);
    if (events.length === 0) {
        return { keyTimes: '0;1', values: `${initialColor};${initialColor}` };
    }
    const kTimes = [0];
    const kValues = [initialColor];
    for (const ev of events) {
        const t = Number((ev.frameIndex / Math.max(totalFrames - 1, 1)).toFixed(SVG_KEY_TIMES_PRECISION));
        if (t !== kTimes[kTimes.length - 1]) {
            kTimes.push(t);
            kValues.push(ev.color);
        }
        else {
            kValues[kValues.length - 1] = ev.color;
        }
    }
    if (kTimes[kTimes.length - 1] !== 1) {
        kTimes.push(1);
        kValues.push(kValues[kValues.length - 1]);
    }
    return { keyTimes: kTimes.join(';'), values: kValues.join(';') };
};
const generateGhostPosition = (ghost) => {
    const fx = ghost.x + (ghost.subX ?? 0);
    const fy = ghost.y + (ghost.subY ?? 0);
    const x = GRID_OFFSET_X + fx * (constants_1.CELL_SIZE + constants_1.GAP_SIZE);
    const y = GRID_OFFSET_Y + fy * (constants_1.CELL_SIZE + constants_1.GAP_SIZE);
    return `${x},${y}`;
};
const generateGhostPositions = (store, ghostIndex) => store.gameHistory.map((state) => (ghostIndex < state.ghosts.length ? generateGhostPosition(state.ghosts[ghostIndex]) : '0,0'));
const generateGhostsPredefinition = () => {
    let defs = `<defs>`;
    // For every regular ghost
    ['blinky', 'inky', 'pinky', 'clyde'].forEach((ghostName) => {
        // For each direction
        ['up', 'down', 'left', 'right'].forEach((direction) => {
            const ghostObj = constants_1.GHOSTS[ghostName];
            if (direction in ghostObj) {
                defs += `
                <symbol id="ghost-${ghostName}-${direction}" viewBox="0 0 ${constants_1.CELL_SIZE} ${constants_1.CELL_SIZE}">
                    <image href="${ghostObj[direction]}" width="${constants_1.CELL_SIZE}" height="${constants_1.CELL_SIZE}" style="image-rendering:pixelated"/>
                </symbol>
                `;
            }
        });
    });
    // Add the scared ghost
    defs += `
    <symbol id="ghost-scared" viewBox="0 0 ${constants_1.CELL_SIZE} ${constants_1.CELL_SIZE}">
        <image href="${constants_1.GHOSTS['scared'].imgDate}" width="${constants_1.CELL_SIZE}" height="${constants_1.CELL_SIZE}" style="image-rendering:pixelated"/>
    </symbol>`;
    // Add ghost eyes (for each direction)
    ['up', 'down', 'left', 'right'].forEach((direction) => {
        if (constants_1.GHOSTS['eyes'] && direction in constants_1.GHOSTS['eyes']) {
            const eyesObj = constants_1.GHOSTS['eyes'];
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 ${constants_1.CELL_SIZE} ${constants_1.CELL_SIZE}">
                <image href="${eyesObj[direction]}" width="${constants_1.CELL_SIZE}" height="${constants_1.CELL_SIZE}" style="image-rendering:pixelated"/>
            </symbol>
            `;
        }
        else {
            // Fallback if direction is not set
            console.warn(`Imagem para eyes-${direction} não encontrada, usando placeholder`);
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 ${constants_1.CELL_SIZE} ${constants_1.CELL_SIZE}">
                <circle cx="${constants_1.CELL_SIZE / 2}" cy="${constants_1.CELL_SIZE / 2}" r="${constants_1.CELL_SIZE / 3}" fill="white"/>
            </symbol>
            `;
        }
    });
    defs += `</defs>`;
    return defs;
};
const generateChangingValuesAnimation = (store, changingValues, fallbackValue) => {
    if (store.gameHistory.length !== changingValues.length) {
        throw new Error(`The amount of values (${changingValues.length}) does not match the size of the game history (${store.gameHistory.length})`);
    }
    const totalFrames = store.gameHistory.length;
    if (totalFrames <= 1) {
        const value = changingValues[0] ?? fallbackValue;
        return { keyTimes: '0;1', values: `${value};${value}` };
    }
    let keyTimes = [];
    let values = [];
    let lastValue = null;
    let lastIndex = null;
    changingValues.forEach((currentValue, index) => {
        if (currentValue !== lastValue) {
            if (lastValue !== null && lastIndex !== null && index - 1 !== lastIndex) {
                // Add a keyframe right before the value change
                keyTimes.push(Number(((index - 1 / (10 * SVG_KEY_TIMES_PRECISION)) / (totalFrames - 1)).toFixed(SVG_KEY_TIMES_PRECISION)));
                values.push(lastValue);
            }
            // Add the new value keyframe
            keyTimes.push(Number((index / (totalFrames - 1)).toFixed(SVG_KEY_TIMES_PRECISION)));
            values.push(currentValue);
            lastValue = currentValue;
            lastIndex = index;
        }
    });
    // Ensure the last frame is always included
    if (keyTimes.length === 0 || keyTimes[keyTimes.length - 1] !== 1) {
        // If there are no keyframes, add start and end frames
        if (keyTimes.length === 0) {
            keyTimes.push(0, 1);
            values.push(changingValues[0] || '#000', changingValues[changingValues.length - 1] || '#000');
        }
        else {
            keyTimes.push(1);
            values.push(lastValue || changingValues[changingValues.length - 1] || '#000');
        }
    }
    return {
        keyTimes: keyTimes.join(';'),
        values: values.join(';')
    };
};
exports.SVG = {
    generateAnimatedSVG
};
