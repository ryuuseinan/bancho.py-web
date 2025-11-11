import axios from 'axios';
import { GameMode } from '../../GameModes';
export const BEATMAPS_PER_PAGE = 33;

export enum MapStatus {
  GRAVEYARD = -2,
  WIP = -1,
  PENDING = 0,
  RANKED = 1,
  APPROVED = 2,
  QUALIFIED = 3,
  LOVED = 4,
  ALL = 727,
}

export const ALL_GAME_MODES = -1 as const;

export interface SearchResult {
  results: BeatmapDetails[];
  usedUrls: string[];
  source: string;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Difficulty {
  id: number;
  name: string;
  stars: number;
  creator: string;
  bpm: number;
  cs: number;
  ar: number;
  od: number;
  hp: number;
  circleCount: number;
  sliderCount: number;
  spinnerCount: number;
  gameMode: GameMode;
  cs?: number;
  ar?: number;
  od?: number;
  hp?: number;
  total_length?: number;
  max_combo?: number;
}

export interface BeatmapDetails {
  id: number;
  server: string;
  status: number;
  setId: number;
  artist: string;
  title: string;
  creator: string;
  source: string;
  coverUrl: string;
  audioUrl: string;
  previewTime: number;
  length: number;
  playCount: number;
  favoriteCount: number;
  passCount: number;
  dateSubmitted: string;
  dateRanked: string;
  difficulties: Difficulty[];
}

export interface LeaderboardDetails {
  id: number;
  playerId: number;
  name: string;
  country: string;
  tScore: number;
  pp: number;
  acc: number;
  maxCombo: number;
  mods: number;
}

export interface GetBeatmapSetResponse {
  status: string;
  beatmap: BeatmapDetails[];
}

export interface GetBeatmapLeaderboardResponse {
  status: string;
  leaderboard: LeaderboardDetails[] | null;
}

const apiInstance = axios.create({
  baseURL: import.meta.env.PUBLIC_APP_BPY_API_BASE_URL,
  withCredentials: true,
});

export const mapToPrivateServerStatus = (
  status: MapStatus,
): number[] | number | undefined => {
  const mapping: { [key in MapStatus]?: number | number[] } = {
    [MapStatus.GRAVEYARD]: -1,
    [MapStatus.WIP]: -1,
    [MapStatus.PENDING]: 0,
    [MapStatus.RANKED]: 2,
    [MapStatus.APPROVED]: 3,
    [MapStatus.QUALIFIED]: 4,
    [MapStatus.LOVED]: 5,
    [MapStatus.ALL]: [-1, 0, 2, 3, 4, 5],
  };

  return mapping[status];
};

export const mapFromPrivateServerStatus = (status: number): MapStatus => {
  const mapping: { [key: string]: MapStatus } = {
    '-1': MapStatus.GRAVEYARD,
    '0': MapStatus.PENDING,
    '2': MapStatus.RANKED,
    '3': MapStatus.APPROVED,
    '4': MapStatus.QUALIFIED,
    '5': MapStatus.LOVED,
  };

  return mapping[status.toString()];
};
export const getStatusText = (status: MapStatus): string => {
  switch (status) {
    case MapStatus.GRAVEYARD:
      return 'Graveyard';
    case MapStatus.WIP:
      return 'WIP';
    case MapStatus.PENDING:
      return 'Pending';
    case MapStatus.RANKED:
      return 'Ranked';
    case MapStatus.APPROVED:
      return 'Approved';
    case MapStatus.QUALIFIED:
      return 'Qualified';
    case MapStatus.LOVED:
      return 'Loved';
    case MapStatus.ALL:
      return 'All Status';
    default:
      return 'Unknown';
  }
};

export const getGameModeText = (
  gameMode: GameMode | typeof ALL_GAME_MODES,
): string => {
  if (gameMode === ALL_GAME_MODES) return 'All Modes';
  switch (gameMode) {
    case GameMode.Standard:
      return 'osu!';
    case GameMode.Taiko:
      return 'Taiko';
    case GameMode.Catch:
      return 'Catch';
    case GameMode.Mania:
      return 'Mania';
    default:
      return 'Unknown';
  }
};

export const getBeatmapSet = async (
  id: number,
): Promise<GetBeatmapSetResponse> => {
  const beatmapResponse = await apiInstance.get('/v1/get_map_info', {
    params: {
      id: id,
    },
  });

  const beatmapSetResponse = await apiInstance.get('/v2/maps', {
    params: {
      set_id: beatmapResponse.data.map.set_id,
    },
  });

  return {
    status: beatmapSetResponse.data.status,
    beatmap: beatmapSetResponse.data.data?.map((beatmap: any) => ({
      id: beatmap.id,
      server: beatmap.server,
      status: beatmap.status,
      setId: beatmap.set_id,
      artist: beatmap.artist,
      title: beatmap.title,
      creator: beatmap.creator,
      source: '',
      coverUrl: `${import.meta.env.PUBLIC_APP_BPY_MAPS_BASE_URL}/cover/${beatmap.set_id}`,
      audioUrl: '',
      previewTime: 0,
      length: beatmap.total_length,
      playCount: beatmap.plays,
      favoriteCount: 0,
      passCount: beatmap.passes,
      dateSubmitted: '',
      dateRanked: beatmap.last_update.split('T')[0],
      difficulties: beatmapSetResponse.data.data.map((diff: any) => ({
        id: diff.id,
        name: diff.version,
        stars: diff.diff,
        creator: diff.creator,
        bpm: diff.bpm,
        cs: diff.cs,
        ar: diff.ar,
        od: diff.od,
        hp: diff.hp,
        circleCount: 0,
        sliderCount: 0,
        spinnerCount: 0,
        gameMode: diff.mode,
        total_length: diff.total_length,
        max_combo: diff.max_combo,
      })),
    })),
  };
};

export const getBeatmapLeaderboard = async (
  beatmapId: number,
  mode: number,
): Promise<GetBeatmapLeaderboardResponse> => {
  const response = await apiInstance.get('/v1/get_map_scores', {
    params: {
      scope: 'best',
      id: beatmapId,
      mode: mode,
    },
  });

  return {
    status: response.data.status,
    leaderboard:
      response.data.scores?.map((score: any) => ({
        id: score.id,
        playerId: score.userid,
        name: score.player_name,
        country: score.player_country,
        tScore: score.score,
        pp: score.pp,
        acc: score.acc,
        maxCombo: score.max_combo,
        mods: score.mods,
      })) ?? null,
  };
};

export const formatTime = (seconds: number | undefined): string => {
  if (seconds === undefined) {
    return '0:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const processSearchResponse = (
  response: any,
  page: number = 1,
  pageSize: number = 50,
): { results: BeatmapDetails[]; total: number } => {
  if (
    response.data.status !== 'success' ||
    !Array.isArray(response.data.data)
  ) {
    return { results: [], total: 0 };
  }

  const beatmapsBySetId: { [setId: number]: any[] } = {};

  response.data.data.forEach((map: any) => {
    if (!beatmapsBySetId[map.set_id]) {
      beatmapsBySetId[map.set_id] = [];
    }
    beatmapsBySetId[map.set_id].push(map);
  });

  const results = Object.values(beatmapsBySetId).map((maps: any[]) => {
    const firstMap = maps[0];

    return {
      id: firstMap.set_id,
      setId: firstMap.set_id,
      artist: firstMap.artist,
      title: firstMap.title,
      creator: firstMap.creator,
      source: 'private',
      coverUrl: `${import.meta.env.PUBLIC_APP_BPY_MAPS_BASE_URL}/cover/${firstMap.set_id}`,
      audioUrl: '',
      previewTime: 0,
      length: firstMap.total_length,
      bpm: firstMap.bpm,
      playCount: firstMap.plays,
      favoriteCount: 0,
      passCount: firstMap.passes,
      dateSubmitted: '',
      dateRanked: firstMap.last_update.split('T')[0],
      difficulties: maps.map((map: any) => ({
        id: map.id,
        name: map.version,
        stars: map.diff,
        creator: map.creator,
        bpm: map.bpm,
        circleCount: 0,
        sliderCount: 0,
        spinnerCount: 0,
        gameMode: map.mode,
        cs: map.cs,
        ar: map.ar,
        od: map.od,
        hp: map.hp,
        total_length: map.total_length,
        max_combo: map.max_combo,
      })),
    };
  });

  const hasMore = results.length === pageSize;
  const total = hasMore ? (page + 1) * pageSize : page * pageSize;

  return { results, total };
};

const searchPrivateServer = async (
  query: string,
  gameMode: GameMode | typeof ALL_GAME_MODES,
  status?: MapStatus,
  server: string = 'private',
  page: number = 1,
  pageSize: number = 50,
): Promise<{
  results: BeatmapDetails[];
  url: string;
  total: number;
  hasMore: boolean;
}> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
      server,
    };

    if (query.trim()) {
      params.query = query.trim();
    }

    // CORRECCIÓN: Incluir mode siempre que no sea ALL_GAME_MODES
    if (gameMode !== ALL_GAME_MODES) {
      params.mode = gameMode;
    }

    const privateServerStatus =
      status !== undefined ? mapToPrivateServerStatus(status) : undefined;

    if (privateServerStatus !== undefined) {
      if (Array.isArray(privateServerStatus)) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('page_size', pageSize.toString());
        queryParams.append('server', server);

        if (query.trim()) {
          queryParams.append('query', query.trim());
        }

        // CORRECCIÓN: Incluir mode siempre que no sea ALL_GAME_MODES
        if (gameMode !== ALL_GAME_MODES) {
          queryParams.append('mode', gameMode.toString());
        }

        privateServerStatus.forEach((s) => {
          queryParams.append('status', s.toString());
        });

        const url = `${import.meta.env.PUBLIC_APP_BPY_API_BASE_URL}/v2/maps/search?${queryParams.toString()}`;

        const response = await apiInstance.get(
          `/v2/maps/search?${queryParams.toString()}`,
        );
        const processed = processSearchResponse(response, page, pageSize);
        return {
          results: processed.results,
          url,
          total: processed.total,
          hasMore: processed.results.length === pageSize,
        };
      } else {
        params.status = privateServerStatus;
      }
    }

    const url = `${import.meta.env.PUBLIC_APP_BPY_API_BASE_URL}/v2/maps/search?${new URLSearchParams(params).toString()}`;

    const response = await apiInstance.get('/v2/maps/search', { params });
    const processed = processSearchResponse(response, page, pageSize);
    return {
      results: processed.results,
      url,
      total: processed.total,
      hasMore: processed.results.length === pageSize,
    };
  } catch (error) {
    console.error('Error searching private server:', error);
    return { results: [], url: '', total: 0, hasMore: false };
  }
};

const searchOsuServer = async (
  query: string,
  gameMode: GameMode | typeof ALL_GAME_MODES,
  status?: MapStatus,
  page: number = 1,
  pageSize: number = 50,
): Promise<{
  results: BeatmapDetails[];
  url: string;
  total: number;
  hasMore: boolean;
}> => {
  try {
    const offset = (page - 1) * pageSize;
    const mirrorParams = new URLSearchParams();
    mirrorParams.append('amount', pageSize.toString());
    mirrorParams.append('offset', offset.toString());

    if (query.trim()) mirrorParams.append('query', query.trim());

    // CORRECCIÓN: Incluir mode siempre que no sea ALL_GAME_MODES
    if (gameMode !== ALL_GAME_MODES) {
      mirrorParams.append('mode', gameMode.toString());
    }

    if (status === MapStatus.ALL) {
      [-2, -1, 0, 1, 2, 3, 4].forEach((s) => {
        mirrorParams.append('status', s.toString());
      });
    } else if (status !== undefined) {
      mirrorParams.append('status', status.toString());
    } else {
      mirrorParams.append('status', '1');
    }

    const url = `${import.meta.env.PUBLIC_APP_MIRROR_URL}/api/search?${mirrorParams.toString()}`;

    const response = await axios.get(url, { timeout: 5000 });

    if (!response.data || !Array.isArray(response.data)) {
      return { results: [], url, total: 0, hasMore: false };
    }

    const results = response.data.map((bmapset: any) => ({
      id: bmapset.SetID,
      setId: bmapset.SetID,
      artist: bmapset.Artist,
      title: bmapset.Title,
      creator: bmapset.Creator,
      source: 'osu!',
      coverUrl: `${import.meta.env.PUBLIC_APP_BPY_MAPS_BASE_URL}/cover/${bmapset.SetID}`,
      audioUrl: '',
      previewTime: 0,
      length: bmapset.ChildrenBeatmaps[0]?.TotalLength || 0,
      bpm: bmapset.ChildrenBeatmaps[0]?.BPM || 0,
      playCount: bmapset.ChildrenBeatmaps.reduce(
        (sum: number, child: any) => sum + child.Playcount,
        0,
      ),
      favoriteCount: 0,
      passCount: bmapset.ChildrenBeatmaps.reduce(
        (sum: number, child: any) => sum + child.Passcount,
        0,
      ),
      dateSubmitted: '',
      dateRanked: bmapset.LastUpdate.split('T')[0],
      difficulties: bmapset.ChildrenBeatmaps.map((child: any) => ({
        id: child.BeatmapID,
        name: child.DiffName,
        stars: child.DifficultyRating,
        creator: bmapset.Creator,
        bpm: child.BPM,
        circleCount: 0,
        sliderCount: 0,
        spinnerCount: 0,
        gameMode: child.Mode,
      })),
    }));

    const hasMore = results.length === pageSize;
    const total = offset + results.length + (hasMore ? 1 : 0);

    return { results, url, total, hasMore };
  } catch (error) {
    console.error('Error searching osu! server:', error);
    return { results: [], url: '', total: 0, hasMore: false };
  }
};

export const searchBeatmapsets = async (
  query: string,
  gameMode: GameMode | typeof ALL_GAME_MODES,
  status?: MapStatus,
  server?: string,
  page: number = 1,
  pageSize: number = 50,
): Promise<SearchResult> => {
  const usedUrls: string[] = [];

  try {
    if (server === 'all') {
      const [privateResult, osuResult] = await Promise.all([
        searchPrivateServer(query, gameMode, status, 'private', page, pageSize),
        searchOsuServer(query, gameMode, status, page, pageSize),
      ]);

      usedUrls.push(privateResult.url, osuResult.url);

      const combinedResults = [...privateResult.results];
      const existingSetIds = new Set(
        privateResult.results.map((map) => map.setId),
      );
      const uniqueOsuResults = osuResult.results.filter(
        (osuMap) => !existingSetIds.has(osuMap.setId),
      );
      combinedResults.push(...uniqueOsuResults);

      const hasMore = privateResult.hasMore || osuResult.hasMore;
      const total = Math.max(privateResult.total, osuResult.total);

      return {
        results: combinedResults,
        usedUrls: usedUrls.filter((url) => url),
        source: 'all',
        total,
        page,
        pageSize,
        hasMore,
      };
    } else if (server === 'osu!') {
      const osuResult = await searchOsuServer(
        query,
        gameMode,
        status,
        page,
        pageSize,
      );
      usedUrls.push(osuResult.url);

      return {
        results: osuResult.results,
        usedUrls: usedUrls.filter((url) => url),
        source: 'osu!',
        total: osuResult.total,
        page,
        pageSize,
        hasMore: osuResult.hasMore,
      };
    } else {
      const privateResult = await searchPrivateServer(
        query,
        gameMode,
        status,
        'private',
        page,
        pageSize,
      );
      usedUrls.push(privateResult.url);

      return {
        results: privateResult.results,
        usedUrls: usedUrls.filter((url) => url),
        source: 'private',
        total: privateResult.total,
        page,
        pageSize,
        hasMore: privateResult.hasMore,
      };
    }
  } catch (error) {
    console.error('Error in searchBeatmapsets:', error);
    return {
      results: [],
      usedUrls: usedUrls.filter((url) => url),
      source: 'error',
      total: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }
};

export const getLocalBeatmapsets = async (
  gameMode: GameMode | typeof ALL_GAME_MODES,
  page: number = 1,
  pageSize: number = 50,
  status?: MapStatus,
  server?: string,
): Promise<SearchResult> => {
  try {
    const result = await searchPrivateServer(
      '',
      gameMode,
      status,
      server || 'private',
      page,
      pageSize,
    );
    return {
      results: result.results,
      usedUrls: [result.url],
      source: 'local',
      total: result.total,
      page,
      pageSize,
      hasMore: result.hasMore,
    };
  } catch (error) {
    console.error('Error getting local beatmapsets:', error);
    return {
      results: [],
      usedUrls: [],
      source: 'error',
      total: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }
};

export const getPopularBeatmapsets = async (
  gameMode: GameMode | typeof ALL_GAME_MODES,
): Promise<SearchResult> => {
  try {
    return await getLocalBeatmapsets(gameMode, 1, 30);
  } catch (error) {
    console.error('Error getting popular beatmapsets:', error);
    return {
      results: [],
      usedUrls: [],
      source: 'error',
      total: 0,
      page: 1,
      pageSize: 30,
      hasMore: false,
    };
  }
};
