"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGithubContributions = void 0;
const utils_1 = require("../utils/utils");
const fetchGithubContributions = async (store) => {
    if (store.config.githubSettings?.accessToken) {
        return await fetchGithubContributionsGraphQL(store);
    }
    else {
        return await fetchGithubContributionsRest(store);
    }
};
exports.fetchGithubContributions = fetchGithubContributions;
const fetchGithubContributionsRest = async (store) => {
    const commits = [];
    let isComplete = false;
    let page = 1;
    do {
        try {
            const headers = {};
            if (store.config.githubSettings?.accessToken) {
                headers['Authorization'] = 'Bearer ' + store.config.githubSettings.accessToken;
            }
            const response = await fetch(`https://api.github.com/search/commits?q=author:${store.config.username}&sort=author-date&order=desc&page=${page}&per_page=100`, { headers });
            const data = await response.json();
            isComplete = !data.items || data.items.length === 0;
            commits.push(...(data.items ?? []));
            page++;
        }
        catch {
            isComplete = true;
        }
    } while (!isComplete);
    const contributions = Array.from(commits
        .reduce((map, item) => {
        const authorDateStr = item.commit.author?.date?.split('T')[0];
        const committerDateStr = item.commit.committer?.date?.split('T')[0];
        const keyDate = committerDateStr || authorDateStr;
        const count = (map.get(keyDate) || { count: 0 }).count + 1;
        return map.set(keyDate, {
            date: new Date(keyDate),
            count,
            color: '',
            level: 'NONE'
        });
    }, new Map())
        .values());
    const maxCount = Math.max(...contributions.map((el) => el.count).filter((c) => c > 0));
    return contributions.map((c) => {
        const level = (0, utils_1.calculateContributionLevel)(c.count, maxCount);
        const theme = (0, utils_1.getCurrentTheme)(store);
        return {
            date: new Date(c.date),
            count: c.count,
            color: theme.intensityColors[(0, utils_1.levelToIndex)(level)],
            level
        };
    });
};
const fetchGithubContributionsGraphQL = async (store) => {
    const query = /* GraphQL */ `
		query ($login: String!) {
			user(login: $login) {
				contributionsCollection {
					contributionCalendar {
						weeks {
							contributionDays {
								date
								contributionCount
								color
								contributionLevel
							}
						}
					}
				}
			}
		}
	`;
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${store.config.githubSettings?.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables: { login: store.config.username } })
    });
    if (!response.ok) {
        throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json());
    if (json.errors?.length) {
        const details = json.errors
            .map((error) => error.message)
            .filter(Boolean)
            .join('; ');
        throw new Error(`GitHub GraphQL request failed${details ? `: ${details}` : ''}`);
    }
    const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!Array.isArray(weeks)) {
        throw new Error(`GitHub GraphQL response did not include contribution data for "${store.config.username}"`);
    }
    return weeks
        .map((week) => week.contributionDays)
        .reduce((acc, days) => acc.concat(days), [])
        .map((d) => {
        const level = d.contributionLevel;
        const theme = (0, utils_1.getCurrentTheme)(store);
        return {
            date: new Date(d.date),
            count: d.contributionCount,
            color: theme.intensityColors[(0, utils_1.levelToIndex)(level)],
            level
        };
    });
};
