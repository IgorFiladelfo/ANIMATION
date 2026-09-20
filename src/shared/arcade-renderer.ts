import { PacmanConfig, PacmanRenderer, PlayerStyle } from '../pacman/index';
import { BaseConfig } from './types';

export { PlayerStyle };

export type GameType = 'pacman';

export interface ArcadeConfig extends BaseConfig {
	game: GameType;
	playerStyle?: PlayerStyle;
}

interface GameRegistryEntry {
	label: string;
	factory: (conf: ArcadeConfig) => { start(): Promise<unknown>; stop(): void };
}

export const GAME_REGISTRY: Record<GameType, GameRegistryEntry> = {
	pacman: {
		label: '👻 Pac-Man',
		factory: (conf: ArcadeConfig) => new PacmanRenderer(conf as PacmanConfig)
	}
};

export const ARCADE_GAMES: readonly GameType[] = ['pacman'];

export class ArcadeRenderer {
	private renderer: { start(): Promise<unknown>; stop(): void };

	constructor(conf: ArcadeConfig) {
		const entry = GAME_REGISTRY[conf.game];
		if (!entry) throw new Error('This custom Action only supports the pacman game.');
		this.renderer = entry.factory(conf);
	}

	public async start() {
		return this.renderer.start();
	}

	public stop() {
		this.renderer.stop();
	}
}
