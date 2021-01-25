/* eslint-disable @typescript-eslint/no-explicit-any */
import { format as sprintf } from 'util';
import { Request, default as fetch } from 'node-fetch';
import * as Config from './config';

export class RiotClient {
	#token: string;

	constructor(token: string) {
		this.#token = token;
	}

	async fetch<T = unknown>(
		host: string,
		path: string,
		...params: string[]
	): Promise<Response<T>> {
		const pathWithParams = sprintf(path, ...params.map(encodeURIComponent));
    const uri = new URL(pathWithParams, host);
		const request = new Request(uri.href, {
			method: 'GET',
			headers: [
				['X-Riot-Token', this.#token],
				['Accept', 'application/json'],
			],
		});

    const response = await fetch(request);

		if (!response.ok) {
			// TODO: we need better error handling than this
			throw new Error(`API error: ${response.status} - ${uri.href}`);
		}

		return {
			data: (await response.json()) as T,
			etag: response.headers.get('etag'),
		};
	}
}

export const client = new RiotClient(Config.get('RIOT_API_TOKEN'));

interface Response<T> {
	data: T;
	etag: string | null;
}

export async function fetchVersions(client: RiotClient): Promise<any> {
	return client.fetch<string[]>(
		'http://ddragon.leagueoflegends.com',
		'/api/versions.json',
	);
}

interface ChampionList {
	data: {
		[name: string]: {
			key: string;
			name: string;
			title: string;
			image: {
				full: string;
			};
		};
	};
}
export async function fetchChampions(
	client: RiotClient,
	version: string,
): Promise<any> {
	return client.fetch<ChampionList>(
		'http://ddragon.leagueoflegends.com',
		'/cdn/%s/data/en_US/championFull.json',
		version,
	);
}

interface MatchList {
	matches: MatchReference[];
}

interface MatchReference {
	gameId: string;
	timestamp: number;
}

export async function fetchRecentGames(
	client: RiotClient,
	host: string,
	playerID: string,
): Promise<any> {
	return client.fetch<MatchList>(
		host,
		'/lol/match/v4/matchlists/by-account/%s',
		playerID,
	);
}

interface Match {
	queueId: string;
	gameDuration: string;
	teams: {
		teamId: number;
		win: 'Win' | 'Lose';
	}[];
	participants: {
		participantId: number;
		teamId: number;
		championId: number;
		spell1Id: number;
		spell2Id: number;
		stats: {
			firstBloodKill: boolean;
			firstBloodAssist: boolean;
		};
		timeline: {
			role: string;
			lane: string;
		};
	}[];
	participantIdentities: {
		participantId: number;
		player: {
			accountId: string;
			summonerName: string;
		};
	}[];
}

export async function fetchMatchInfo(
	client: RiotClient,
	host: string,
	matchID: string,
): Promise<any> {
	return client.fetch<Match>(host, '/lol/match/v4/matches/%s', matchID);
}

interface Timeline {
	frames: {
		[minute: number]: {
			participantFrames: {
				participantId: number;
				minionsKilled: number;
				jungleMinionsKilled: number;
				totalGold: number;
				level: number;
			}[];
		};
	};
}

export async function fetchMatchTimeline(
	client: RiotClient,
	host: string,
	matchID: string,
): Promise<any> {
	return client.fetch<Timeline>(
		host,
		'/lol/match/v4/timelines/by-match/%s',
		matchID,
	);
}

interface MasteryLevel {
	championId: number;
	championPoints: number;
	championLevel: number;
	chestGranted: boolean;
	lastPlayTime: number;
}

export function fetchSummonerMasteries(
	client: RiotClient,
	host: string,
	summoner: Summoner,
): Promise<Response<MasteryLevel[]>> {
	return client.fetch<MasteryLevel[]>(
		host,
		'/lol/champion-mastery/v4/champion-masteries/by-summoner/%s',
		summoner.id,
	);
}

export function fetchMasteryByChampion(
	client: RiotClient,
	host: string,
	playerId: string,
	id: number,
): Promise<Response<MasteryLevel>> {
	return client.fetch<MasteryLevel>(
		host,
		'/lol/champion-mastery/v4/champion-masteries/by-summoner/%s/by-champion/%s',
		playerId,
		id.toString(),
	);
}

export interface Summoner {
	id: string;
	name: string;
	accountId: string;
}

export function getSummonerByName(
	client: RiotClient,
	host: string,
	name: string,
): Promise<Response<Summoner>> {
	return client.fetch<Summoner>(
		host,
		'/lol/summoner/v4/summoners/by-name/%s',
		name,
	);
}

export function getSummonerByAccountId(
	client: RiotClient,
	host: string,
	accountId: string,
): Promise<Response<Summoner>> {
	return client.fetch<Summoner>(
		host,
		'/lol/summoner/v4/summoners/by-account/%s',
		accountId,
	);
}

export function getSummonerBySummonerId(
	client: RiotClient,
	host: string,
	name: string,
): Promise<Response<Summoner>> {
	return client.fetch<Summoner>(host, '/lol/summoner/v4/summoners/%s', name);
}

interface League {
	queueType: string;
	tier: string;
	rank: string;
}

export function getLeagues(
	client: RiotClient,
	host: string,
	playerId: string,
): Promise<Response<League[]>> {
	return client.fetch<League[]>(
		host,
		'/lol/league/v4/entries/by-summoner/%s',
		playerId,
	);
}

function fetchVerificationCode(
	client: RiotClient,
	host: string,
	playerId: string,
): Promise<Response<string>> {
	return client.fetch<string>(
		host,
		'/lol/platform/v4/third-party-code/by-summoner/%s',
		playerId,
  );
}

export async function compareVerificationCode(
	client: RiotClient,
	host: string,
	playerId: string,
	desiredCode: string,
): Promise<boolean> {
  const { data } = await fetchVerificationCode(client, host, playerId);
  console.log(data);
  console.log(desiredCode);
	return data === desiredCode;
}
