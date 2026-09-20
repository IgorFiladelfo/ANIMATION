'use strict';

const fs = require('fs');
const path = require('path');
const { ArcadeRenderer, ARCADE_GAMES } = require('../../lib/index.js');

const input = (name, fallback = '') => {
  const key = `INPUT_${name.replace(/ /g, '_').replace(/-/g, '_').toUpperCase()}`;
  const value = process.env[key];
  return value == null || value === '' ? fallback : value;
};

const booleanInput = (name, fallback = false) => {
  const value = input(name, fallback ? 'true' : 'false').trim().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(value);
};

const generateSvg = (userName, githubToken, theme, playerStyle, showMonthLabels) =>
  new Promise((resolve, reject) => {
    let generatedSvg = '';
    let gameStats = null;

    const renderer = new ArcadeRenderer({
      game: 'pacman',
      platform: 'github',
      username: userName,
      gameTheme: theme,
      playerStyle,
      showMonthLabels,
      githubSettings: { accessToken: githubToken },
      svgCallback: (svg) => { generatedSvg = svg; },
      gameStatsCallback: (stats) => { gameStats = stats; },
      gameOverCallback: () => resolve({ svg: generatedSvg, stats: gameStats }),
      pointsIncreasedCallback: () => {}
    });

    renderer.start().catch(reject);
  });

(async () => {
  try {
    const userName = input('github_user_name');
    const githubToken = input('github_token', process.env.GITHUB_TOKEN || '');
    const playerStyle = input('player_style', 'opportunistic');
    const showMonthLabels = !booleanInput('hide_month_labels', false);
    const requestedGames = input('games', 'pacman')
      .split(',')
      .map((game) => game.trim().toLowerCase())
      .filter(Boolean);

    if (!userName) throw new Error('github_user_name is required.');
    if (!requestedGames.includes('pacman')) {
      console.warn(`This custom Action only supports ${ARCADE_GAMES.join(', ')}. Generating pacman.`);
    }

    console.log('🕹️ Generating STP arcade Pac-Man contribution graph...');

    const lightResult = await generateSvg(userName, githubToken, 'github', playerStyle, showMonthLabels);
    const darkResult = await generateSvg(userName, githubToken, 'github-dark', playerStyle, showMonthLabels);

    fs.mkdirSync('dist', { recursive: true });
    const lightFile = path.join('dist', 'pacman-contribution-graph.svg');
    const darkFile = path.join('dist', 'pacman-contribution-graph-dark.svg');
    fs.writeFileSync(lightFile, lightResult.svg, 'utf8');
    fs.writeFileSync(darkFile, darkResult.svg, 'utf8');

    console.log(`✅ Wrote ${lightFile}`);
    console.log(`✅ Wrote ${darkFile}`);
    if (darkResult.stats) {
      console.log(`🎮 Score: ${darkResult.stats.totalScore} | Steps: ${darkResult.stats.steps} | Ghosts: ${darkResult.stats.ghostsEaten ?? 0}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Action failed: ${message}`);
    process.exitCode = 1;
  }
})();
