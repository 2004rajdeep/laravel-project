import { useState, useEffect, useCallback, useMemo } from 'react';
import { Heart, Star } from 'lucide-react';
import { SearchBar } from './SearchBar.jsx';
import { MovieGrid } from './MovieGrid.jsx';
import { MovieModal } from './MovieModal.jsx';
import { ToastNotification, useToast } from './ToastNotification.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { searchMovies, fetchMovieDetails } from '../../api/tmdb.js';
import { getStarterMovies } from '../../data/starterMovies.js';

function MovieApp() {
    const [query, setQuery] = useState('');
    const [mediaType, setMediaType] = useState('All');
    const [activeTab, setActiveTab] = useState('search');
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [movieDetails, setMovieDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const defaultApiKey = import.meta.env.VITE_OMDB_API_KEY;
    const [customApiKey, setCustomApiKey] = useLocalStorage('omdbApiKey', '');
    const omdbApiKey = (customApiKey && customApiKey.trim()) ? customApiKey.trim() : defaultApiKey;
    const [showSettings, setShowSettings] = useState(false);

    const { toasts, dismiss, success, error: showError, info } = useToast();
    const debouncedQuery = useDebounce(query, 400);
    const [favorites, setFavorites] = useLocalStorage('movieFavorites', []);

    const filteredMovies = useMemo(() => {
        if (mediaType === 'All') return movies;
        return movies.filter(m => m.mediaType === mediaType.toLowerCase());
    }, [movies, mediaType]);

    useEffect(() => {
        let cancelled = false;
        let mounted = true;

        async function loadMovies() {
            if (!debouncedQuery.trim()) {
                if (mounted) {
                    setMovies(getStarterMovies());
                    setError(null);
                }
                return;
            }

            if (mounted) {
                setIsLoading(true);
                setError(null);
            }

            try {
                const results = await searchMovies(debouncedQuery.trim(), omdbApiKey || null);
                if (!cancelled && mounted) {
                    setMovies(results);
                    if (results.length === 0) {
                        setError(`No results found for "${debouncedQuery}"`);
                    }
                }
            } catch (err) {
                if (!cancelled && mounted) {
                    setError('Failed to search. Please check your connection and try again.');
                    console.error('Search error:', err);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadMovies();

        return () => {
            cancelled = true;
            mounted = false;
        };
    }, [debouncedQuery, omdbApiKey]);

    const handleFavoriteToggle = useCallback((movie) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.id === movie.id);
            if (exists) {
                const updated = prev.filter(f => f.id !== movie.id);
                success(`Removed "${movie.title}" from favorites`);
                return updated;
            } else {
                const updated = [...prev, movie];
                success(`Added "${movie.title}" to favorites`);
                return updated;
            }
        });
    }, [setFavorites, success]);

    const handleMovieClick = useCallback(async (movie) => {
        setSelectedMovie(movie);
        setDetailsLoading(true);
        try {
            const details = await fetchMovieDetails(movie, omdbApiKey || null);
            setMovieDetails(details);
        } catch (err) {
            console.error('Details fetch error:', err);
            setMovieDetails(movie);
        } finally {
            setDetailsLoading(false);
        }
    }, [omdbApiKey]);

    const handleCloseModal = useCallback(() => {
        setSelectedMovie(null);
        setMovieDetails(null);
    }, []);

    const handleClearQuery = useCallback(() => {
        setQuery('');
        setError(null);
    }, []);

    const favoriteCount = favorites.length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Movie Search & Favorites</h1>
                            <p className="text-gray-500 mt-1">Discover movies and TV shows, build your watchlist</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden sm:inline">
                                {activeTab === 'favorites' ? `${favoriteCount} favorite${favoriteCount !== 1 ? 's' : ''}` : `${movies.length} result${movies.length !== 1 ? 's' : ''}`}
                            </span>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                aria-label="Settings"
                                aria-expanded={showSettings}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>
                    </div>

                    {showSettings && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-slide-down">
                            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                API Settings
                            </h4>
                            <p className="text-sm text-blue-700 mb-3">OMDb API key is active. All movies (e.g. Captain America, Inception, Avatar) and TV shows are fetched live in real time.</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customApiKey}
                                    onChange={(e) => setCustomApiKey(e.target.value)}
                                    placeholder={`Active key: ${omdbApiKey}`}
                                    className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => { setCustomApiKey(''); info('Reset to default API key'); }}
                                    className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                    <SearchBar
                        query={query}
                        onQueryChange={setQuery}
                        onClear={handleClearQuery}
                        mediaType={mediaType}
                        onMediaTypeChange={setMediaType}
                        isLoading={isLoading}
                    />

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2" role="alert">
                            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex gap-1" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'search'
                                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            aria-selected={activeTab === 'search'}
                        >
                            Search Results
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'favorites'
                                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            aria-selected={activeTab === 'favorites'}
                        >
                            <Heart className="h-4 w-4" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} strokeWidth={activeTab === 'favorites' ? 0 : 2} />
                            Favorites
                            {favoriteCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{favoriteCount}</span>}
                        </button>
                    </nav>
                </div>

                <MovieGrid
                    movies={activeTab === 'favorites' ? favorites : filteredMovies}
                    isLoading={isLoading && activeTab === 'search'}
                    query={query}
                    mediaType={mediaType}
                    onMovieClick={handleMovieClick}
                    onFavoriteToggle={handleFavoriteToggle}
                    favorites={favorites}
                    onClearQuery={handleClearQuery}
                />
            </main>

            <MovieModal
                movie={movieDetails}
                isOpen={!!selectedMovie}
                onClose={handleCloseModal}
                isFavorite={favorites.some(f => f.id === movieDetails?.id)}
                onFavoriteToggle={handleFavoriteToggle}
                omdbApiKey={omdbApiKey}
            />

            <ToastNotification toasts={toasts} onDismiss={dismiss} />
        </div>
    );
}

export default MovieApp;