import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ALL_GAME_MODES,
  BEATMAPS_PER_PAGE,
  type BeatmapDetails,
  type Difficulty,
  getBeatmapSet,
  getLocalBeatmapsets,
  MapStatus,
  type SearchResult,
  searchBeatmapsets,
} from '../adapters/bpy-api/beatmaps';
import { BeatmapsetCard } from '../components/beatmap/BeatmapsetCard';
import LeaderboardBanner from '../components/images/banners/leaderboard_banner.svg';
import { BeatmapsetIcon } from '../components/images/logos/icons/BeatmapsetIcon';
import { PageTitle } from '../components/PageTitle';
import { useIdentityContext } from '../context/Identity';
import { GameMode, gameModeType, getGameModeString } from '../GameModes';

const SearchHeader = () => {
  const { t } = useTranslation();

  return (
    <Box
      height={211}
      pt={{ xs: 0, sm: 10 }}
      sx={{
        backgroundSize: 'cover',
        backgroundImage: `
          linear-gradient(0deg, rgba(21, 18, 34, 0) 0%, rgba(21, 18, 34, 0.9) 100%),
          url(${LeaderboardBanner})
        `,
      }}
    >
      <Container sx={{ height: '100%' }}>
        <Stack
          px={3}
          height="100%"
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent={{ xs: 'space-around', sm: 'space-between' }}
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" gap={3}>
            <Box width={70} height={70}>
              <BeatmapsetIcon />
            </Box>
            <Divider
              flexItem
              orientation="vertical"
              variant="middle"
              sx={{ bgcolor: '#ffffff', opacity: '20%' }}
            />
            <Typography variant="body1" fontSize={25} fontWeight={300}>
              {t('beatmapset.title')}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

const SearchFilters = ({
  searchQuery,
  selectedStatus,
  selectedServer,
  gameMode,
  onSearchChange,
  onStatusChange,
  onServerChange,
  onGameModeChange,
  onSearchClick,
  isLoading,
  hasPrivileges,
}: {
  searchQuery: string;
  selectedStatus: MapStatus;
  selectedServer: string;
  gameMode: GameMode | typeof ALL_GAME_MODES;
  onSearchChange: (value: string) => void;
  onStatusChange: (event: any) => void;
  onServerChange: (event: any) => void;
  onGameModeChange: (mode: GameMode | typeof ALL_GAME_MODES) => void;
  onSearchClick: (query: string) => void;
  isLoading: boolean;
  hasPrivileges: boolean;
}) => {
  const { t } = useTranslation();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && hasPrivileges) {
      onSearchChange(localSearchQuery);
      onSearchClick(localSearchQuery);
    }
  };

  const handleSearchClick = () => {
    onSearchChange(localSearchQuery);
    onSearchClick(localSearchQuery);
  };

  return (
    <Container sx={{ backgroundColor: '#191527', py: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="stretch"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={
              hasPrivileges
                ? t('beatmapset.search_placeholder')
                : 'Inicia sesión para buscar'
            }
            value={localSearchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !hasPrivileges}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#FFFFFF80' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#2A2438',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF40',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF60',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFBD3B',
                },
                '&.Mui-disabled': {
                  opacity: 0.7,
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearchClick}
            disabled={isLoading || !hasPrivileges}
            sx={{
              minWidth: '120px',
              height: '56px',
              backgroundColor: 'rgba(60, 53, 85, 1)',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              fontSize: '16px',
              fontWeight: 'bold',
              position: 'relative',
              '&:hover': {
                opacity: 0.9,
              },
              '&:disabled': {
                background: '#666666',
                color: '#999999',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              t('beatmapset.search_button') || 'Buscar'
            )}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl
            sx={{ minWidth: 120 }}
            size="small"
            disabled={isLoading || !hasPrivileges}
          >
            <InputLabel sx={{ color: '#FFFFFF80' }}>Game Mode</InputLabel>
            <Select
              value={gameMode}
              label="Game Mode"
              onChange={(e) => onGameModeChange(Number(e.target.value))}
              sx={{
                color: 'white',
                backgroundColor: '#2A2438',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF40',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF60',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFBD3B',
                },
                '& .MuiSvgIcon-root': {
                  color: '#FFFFFF80',
                },
                '&.Mui-disabled': {
                  opacity: 0.7,
                },
              }}
            >
              <MenuItem value={ALL_GAME_MODES}>All Modes</MenuItem>
              <MenuItem value={GameMode.Standard}>osu!</MenuItem>
              <MenuItem value={GameMode.Taiko}>Taiko</MenuItem>
              <MenuItem value={GameMode.Catch}>Catch</MenuItem>
              <MenuItem value={GameMode.Mania}>Mania</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            sx={{ minWidth: 120 }}
            size="small"
            disabled={isLoading || !hasPrivileges}
          >
            <InputLabel sx={{ color: '#FFFFFF80' }}>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={onStatusChange}
              sx={{
                color: 'white',
                backgroundColor: '#2A2438',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF40',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF60',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFBD3B',
                },
                '& .MuiSvgIcon-root': {
                  color: '#FFFFFF80',
                },
                '&.Mui-disabled': {
                  opacity: 0.7,
                },
              }}
            >
              <MenuItem value={MapStatus.ALL}>All Status</MenuItem>
              <MenuItem value={MapStatus.RANKED}>Ranked</MenuItem>
              <MenuItem value={MapStatus.QUALIFIED}>Qualified</MenuItem>
              <MenuItem value={MapStatus.LOVED}>Loved</MenuItem>
              <MenuItem value={MapStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={MapStatus.APPROVED}>Approved</MenuItem>
              <MenuItem value={MapStatus.WIP}>WIP</MenuItem>
              <MenuItem value={MapStatus.GRAVEYARD}>Graveyard</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            sx={{ minWidth: 120 }}
            size="small"
            disabled={isLoading || !hasPrivileges}
          >
            <InputLabel sx={{ color: '#FFFFFF80' }}>Server</InputLabel>
            <Select
              value={selectedServer}
              label="Server"
              onChange={onServerChange}
              sx={{
                color: 'white',
                backgroundColor: '#2A2438',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF40',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF60',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFBD3B',
                },
                '& .MuiSvgIcon-root': {
                  color: '#FFFFFF80',
                },
                '&.Mui-disabled': {
                  opacity: 0.7,
                },
              }}
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="osu!">osu!</MenuItem>
              <MenuItem value="all">All Servers</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Container>
  );
};

const ResultsGrid = ({
  results,
  isLoading,
  onSelect,
  hasMore,
  onLoadMore,
  loadingMore,
  hasPrivileges,
}: {
  results: BeatmapDetails[];
  isLoading: boolean;
  onSelect: (beatmapset: BeatmapDetails) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  hasPrivileges: boolean;
}) => {
  const { t } = useTranslation();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadingMore || !hasMore || !hasPrivileges) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadingMore, hasMore, onLoadMore, hasPrivileges]);

  if (!hasPrivileges) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="#FFFFFF80" variant="h6">
          Debes iniciar sesión para ver los beatmaps
        </Typography>
      </Box>
    );
  }

  if (isLoading && results.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#FFBD3B' }} />
        <Typography color="#FFFFFF80" sx={{ mt: 1 }}>
          {t('beatmapset.loading_beatmaps')}
        </Typography>
      </Box>
    );
  }

  if (results.length === 0 && !isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="#FFFFFF80">
          {t('beatmapset.no_beatmapsets_found')}
        </Typography>
        <Typography variant="body2" color="#FFFFFF60" sx={{ mt: 1 }}>
          {t('beatmapset.try_adjusting_search')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2,
          p: 2,
        }}
      >
        {results.map((beatmapset) => (
          <BeatmapsetCard
            key={`${beatmapset.source}-${beatmapset.setId}-${beatmapset.id}`}
            beatmapset={beatmapset}
            onSelect={onSelect}
          />
        ))}
      </Box>

      {hasMore && (
        <Box
          ref={loadMoreRef}
          sx={{
            p: 2,
            textAlign: 'center',
            minHeight: '60px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loadingMore && (
            <CircularProgress size={24} sx={{ color: '#FFBD3B' }} />
          )}
        </Box>
      )}
    </>
  );
};

const ResultsSection = ({
  showResults,
  results,
  isLoading,
  onSelect,
  hasMore,
  onLoadMore,
  loadingMore,
  hasPrivileges,
}: {
  showResults: boolean;
  results: BeatmapDetails[];
  isLoading: boolean;
  onSelect: (beatmapset: BeatmapDetails) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  hasPrivileges: boolean;
}) => {
  if (!showResults) return null;

  return (
    <Container sx={{ backgroundColor: '#191527', mt: 1, mb: 3 }}>
      <Paper
        sx={{
          overflow: 'auto',
          backgroundColor: 'transparent',
          color: 'white',
          boxShadow: 'none',
        }}
      >
        <ResultsGrid
          results={results}
          isLoading={isLoading}
          onSelect={onSelect}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          loadingMore={loadingMore}
          hasPrivileges={hasPrivileges}
        />
      </Paper>
    </Container>
  );
};

const useBeatmapSearch = (
  beatmapId: number,
  gameMode: GameMode | typeof ALL_GAME_MODES,
  hasPrivileges: boolean,
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BeatmapDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentUrls, setCurrentUrls] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<MapStatus>(
    MapStatus.ALL,
  );
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const loadBeatmaps = useCallback(
    async (page: number = 1, append: boolean = false, query?: string) => {
      if (!hasPrivileges) {
        if (!append) {
          setSearchResults([]);
          setShowResults(false);
        }
        return;
      }

      if (beatmapId === 0) {
        const loading = page > 1 ? setLoadingMore : setIsSearching;
        loading(true);

        try {
          const searchTerm = query !== undefined ? query : searchQuery;
          const hasQuery = searchTerm.trim().length > 0;
          const hasStatusFilter = selectedStatus !== MapStatus.ALL;
          const hasServerFilter = selectedServer !== 'private';

          const shouldSearch = hasQuery || hasStatusFilter || hasServerFilter;

          let result: SearchResult;

          if (shouldSearch) {
            result = await searchBeatmapsets(
              searchTerm,
              gameMode,
              selectedStatus === MapStatus.ALL ? undefined : selectedStatus,
              selectedServer,
              page,
              BEATMAPS_PER_PAGE,
            );
          } else {
            result = await getLocalBeatmapsets(
              gameMode,
              page,
              BEATMAPS_PER_PAGE,
              undefined,
              'private',
            );
          }

          if (append) {
            setSearchResults((prev) => [...prev, ...result.results]);
          } else {
            setSearchResults(result.results);
          }

          setCurrentUrls(result.usedUrls);
          setShowResults(true);
          setHasMore(result.hasMore);
          setTotalResults(result.total);
          setCurrentPage(page);
        } catch (error) {
          console.error('Error loading beatmaps:', error);
          if (!append) {
            setSearchResults([]);
            setCurrentUrls([]);
          }
        } finally {
          loading(false);
        }
      }
    },
    [
      hasPrivileges,
      beatmapId,
      gameMode,
      selectedStatus,
      selectedServer,
      searchQuery,
    ],
  );

  const loadMore = useCallback(() => {
    if (hasMore && !isSearching && !loadingMore && hasPrivileges) {
      loadBeatmaps(currentPage + 1, true, searchQuery);
    }
  }, [
    hasMore,
    isSearching,
    loadingMore,
    currentPage,
    hasPrivileges,
    searchQuery,
    loadBeatmaps,
  ]);

  const resetSearch = useCallback(() => {
    if (!hasPrivileges) return;

    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(false);
    setTotalResults(0);
    setLoadingMore(false);
    setShowResults(false);
  }, [hasPrivileges]);

  const clearResults = () => {
    setSearchResults([]);
    setShowResults(false);
    setCurrentPage(1);
    setHasMore(false);
    setTotalResults(0);
  };

  const performSearch = useCallback(
    (query?: string) => {
      if (!hasPrivileges) return;

      setSearchResults([]);
      setCurrentPage(1);
      setHasMore(false);
      setTotalResults(0);
      setLoadingMore(false);
      setShowResults(false);

      loadBeatmaps(1, false, query);
    },
    [hasPrivileges, loadBeatmaps],
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    loadingMore,
    setShowResults,
    showResults,
    currentUrls,
    selectedStatus,
    setSelectedStatus,
    selectedServer,
    setSelectedServer,
    hasMore,
    totalResults,
    currentPage,
    loadBeatmaps,
    loadMore,
    resetSearch,
    clearResults,
    performSearch,
  };
};

const useBeatmapData = (
  beatmapId: number,
  gameMode: GameMode,
  hasPrivileges: boolean,
) => {
  const [beatmap, setBeatmap] = useState<BeatmapDetails | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [filteredDifficulties, setFilteredDifficulties] = useState<
    Difficulty[]
  >([]);

  const filterDifficultiesByGameMode = useCallback(
    (difficulties: Difficulty[], mode: GameMode): Difficulty[] => {
      if (mode === GameMode.Standard) {
        return difficulties.filter(
          (diff) => diff.gameMode === GameMode.Standard,
        );
      }

      const nativeDifficulties = difficulties.filter(
        (diff) => diff.gameMode === mode,
      );
      const convertedDifficulties = difficulties.filter(
        (diff) => diff.gameMode === GameMode.Standard,
      );

      return [...nativeDifficulties, ...convertedDifficulties];
    },
    [],
  );

  useEffect(() => {
    const fetchBeatmap = async () => {
      if (!hasPrivileges) {
        setBeatmap(null);
        setSelectedDifficulty(null);
        return;
      }

      if (beatmapId > 0) {
        try {
          const response = await getBeatmapSet(beatmapId);
          if (response.status === 'success' && response.beatmap.length > 0) {
            const beatmapData = response.beatmap[0];
            setBeatmap(beatmapData);

            const filtered = filterDifficultiesByGameMode(
              beatmapData.difficulties,
              gameMode,
            );
            setFilteredDifficulties(filtered);

            if (filtered.length > 0) {
              setSelectedDifficulty(filtered[0]);
            }
          }
        } catch (error) {
          console.error('Error fetching beatmap:', error);
        }
      } else {
        setBeatmap(null);
        setSelectedDifficulty(null);
      }
    };

    fetchBeatmap();
  }, [beatmapId, gameMode, hasPrivileges, filterDifficultiesByGameMode]);

  return {
    beatmap,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredDifficulties,
  };
};

export const BeatmapsetsPage = () => {
  const navigate = useNavigate();
  const queryParams = useParams();
  const beatmapId = Number.parseInt(queryParams.beatmapId || '0', 10);
  const mode = queryParams.mode || 'osu';
  const { t } = useTranslation();
  const { identity } = useIdentityContext();

  const hasPrivileges = Boolean(identity?.privileges);

  const [gameMode, setGameMode] = useState<GameMode | typeof ALL_GAME_MODES>(
    () => {
      switch (mode) {
        case 'taiko':
          return GameMode.Taiko;
        case 'catch':
          return GameMode.Catch;
        case 'mania':
          return GameMode.Mania;
        default:
          return GameMode.Standard;
      }
    },
  );

  const search = useBeatmapSearch(beatmapId, gameMode, hasPrivileges);
  const beatmapData = useBeatmapData(
    beatmapId,
    gameMode as GameMode,
    hasPrivileges,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <Not needed>
  useEffect(() => {
    if (hasPrivileges) {
      search.performSearch();
    }
  }, [hasPrivileges]);

  const handleSearchClick = (query: string) => {
    search.performSearch(query);
  };

  const handleBeatmapsetSelect = (beatmapset: BeatmapDetails) => {
    if (!hasPrivileges) return;

    if (beatmapset.difficulties.length > 0) {
      const firstDifficulty = beatmapset.difficulties[0];
      search.setShowResults(false);
      search.setSearchQuery('');

      if (gameMode !== ALL_GAME_MODES) {
        navigate(
          `/b/${firstDifficulty.id}/${getGameModeString(gameMode as GameMode)}/${gameModeType(gameMode as GameMode)}`,
        );
      } else {
        navigate(`/b/${firstDifficulty.id}/osu/vanilla`);
      }
    }
  };

  const handleGameModeChange = (newMode: GameMode | typeof ALL_GAME_MODES) => {
    if (!hasPrivileges) return;
    setGameMode(newMode);
  };

  const handleStatusChange = (newStatus: MapStatus) => {
    if (!hasPrivileges) return;
    search.setSelectedStatus(newStatus);
  };

  const handleServerChange = (newServer: string) => {
    if (!hasPrivileges) return;
    search.setSelectedServer(newServer);
  };

  const handleSearchChange = (value: string) => {
    if (!hasPrivileges) return;
    search.setSearchQuery(value);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#151223' }}>
      <PageTitle
        title={`osu!Peru - ${beatmapData.beatmap?.artist || 'Search'} - ${beatmapData.beatmap?.title || 'Beatmaps'}`}
      />

      <SearchHeader />

      <SearchFilters
        searchQuery={search.searchQuery}
        selectedStatus={search.selectedStatus}
        selectedServer={search.selectedServer}
        gameMode={gameMode}
        onSearchChange={handleSearchChange}
        onStatusChange={(e) => handleStatusChange(Number(e.target.value))}
        onServerChange={(e) => handleServerChange(e.target.value)}
        onGameModeChange={handleGameModeChange}
        onSearchClick={handleSearchClick}
        isLoading={search.isSearching}
        hasPrivileges={hasPrivileges}
      />
      {!hasPrivileges ? (
        <Container
          sx={{
            pt: 10,
            textAlign: 'center',
            color: 'white',
            backgroundColor: '#191527',
          }}
        >
          <Typography variant="h6">{t('beatmapset.login_required')}</Typography>
        </Container>
      ) : (
        <ResultsSection
          showResults={search.showResults}
          results={search.searchResults}
          isLoading={search.isSearching}
          onSelect={handleBeatmapsetSelect}
          hasMore={search.hasMore}
          onLoadMore={search.loadMore}
          loadingMore={search.loadingMore}
          hasPrivileges={hasPrivileges}
        />
      )}
    </Box>
  );
};
