"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = void 0;
const github_contributions_1 = require("./github-contributions");
const gitlab_contributions_1 = require("./gitlab-contributions");
const scenarios_1 = require("./scenarios");
const fetchScenarioContributions = async (store) => (0, scenarios_1.generateScenarioContributions)(store.config.scenario).contributions;
const fetchContributions = async (store) => {
    switch (store.config.platform) {
        case 'gitlab':
            return await (0, gitlab_contributions_1.fetchGitlabContributions)(store);
        case 'github':
            return await (0, github_contributions_1.fetchGithubContributions)(store);
        case 'scenario':
            return await fetchScenarioContributions(store);
        default:
            throw new Error(`Unsupported platform: ${store.config.platform}`);
    }
};
exports.Providers = {
    fetchContributions,
    fetchGithubContributions: github_contributions_1.fetchGithubContributions,
    fetchGitlabContributions: gitlab_contributions_1.fetchGitlabContributions,
    fetchScenarioContributions,
    generateScenarioContributions: scenarios_1.generateScenarioContributions
};
