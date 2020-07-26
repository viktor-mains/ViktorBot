import { format as sprintf } from "util";
import { Request, default as fetch } from "node-fetch";

export class RiotClient {
  #token: string;

  constructor(token: string) {
    this.#token = token;
  }

  async fetch<T = unknown>(
    platform: string,
    path: string,
    ...params: any[]
  ): Promise<Response<T>> {
    const pathWithParams = sprintf(path, params.map(encodeURIComponent));
    const uri = new URL(pathWithParams, platform);
    const request = new Request(uri.href, {
      method: "GET",
      headers: [
        ["X-Riot-API-Token", this.#token],
        ["Accept", "application/json"],
      ],
    });

    const response = await fetch(request);

    if (!response.ok) {
      // TODO: we need better error handling than this
      throw new Error("unknown API error");
    }

    return {
      data: (await response.json()) as T,
      etag: response.headers.get("etag"),
    };
  }
}

interface Response<T> {
  data: T;
  etag: string | null;
}

export async function fetchVersions(client: RiotClient) {
  return client.fetch<string[]>("ddragon.leagueoflegends.com", "/api/versions.json");
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
export async function fetchChampions(client: RiotClient, version: string) {
  return client.fetch<ChampionList>(
    "ddragon.leagueoflegends.com",
    "/cdn/%s/data/en_US/championFull.json",
    version
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
  platform: string,
  playerID: string
) {
  return client.fetch<MatchList>(
    platform,
    "/lol/match/v4/matchlists/by-account/%s",
    playerID
  );
}

interface Match {
  queueId: string;
  gameDuration: string;
  teams: {
    teamId: number;
    win: "Win" | "Lose";
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
  platform: string,
  matchID: string
) {
  return client.fetch<Match>(platform, "/lol/match/v4/matches/%s", matchID);
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
  platform: string,
  matchID: string
) {
  return client.fetch<Timeline>(
    platform,
    "/lol/match/v4/timelines/by-match/%s",
    matchID
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
  platform: string,
  summoner: Summoner
) {
  return client.fetch<MasteryLevel[]>(
    platform,
    "/lol/champion-mastery/v4/champion-masteries/by-summoner/%s",
    summoner.id
  );
}

export interface Summoner {
  id: string;
  name: string;
  accountId: string;
}

export function getSummonerByName(
  client: RiotClient,
  platform: string,
  name: string
) {
  return client.fetch<Summoner>(
    platform,
    "/lol/summoner/v4/summoners/by-name/%s",
    name
  );
}

export function getSummonerByAccountId(
  client: RiotClient,
  platform: string,
  accountId: string
) {
  return client.fetch<Summoner>(
    platform,
    "/lol/summoner/v4/summoners/by-account/%s",
    accountId
  );
}
