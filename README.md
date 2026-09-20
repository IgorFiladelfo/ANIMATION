# ANIMATION — STP Arcade Pac-Man

Custom GitHub Action used by the `IGORFILADELFO` profile README to generate the animated Pac-Man contribution graph.

This repository keeps the original Pac-Man contribution/game logic and customizes the SVG renderer with the STP arcade visual: dark navy tiles, metallic maze walls, orange cabinet frame, golden pellets, green contribution blocks, pixel ghosts and animated Pac-Man.

## Use from the profile repository

```yaml
- name: generate pacman-contribution-graph.svg
  uses: IgorFiladelfo/ANIMATION@main
  with:
    github_user_name: ${{ github.repository_owner }}
```

The Action writes:

- `dist/pacman-contribution-graph.svg`
- `dist/pacman-contribution-graph-dark.svg`

The existing workflow can continue publishing those files to the `pacman-output` branch.

## Repository structure

```text
action.yml
├── github-action/
│   └── dist/index.js        # runtime entry point used by GitHub Actions
├── lib/                     # compiled Pac-Man generator used at runtime
└── src/                     # editable TypeScript source
    ├── pacman/
    └── shared/
```

## Rebuild after editing TypeScript

```bash
npm install
npm run build
```

The `lib/` directory is intentionally committed because the GitHub Action runs without installing dependencies first.

## Base project

Customized from the open-source project `abozanona/pacman-contribution-graph`; this repository contains a profile-specific visual/runtime adaptation.
