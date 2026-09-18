import { MovieCard } from './MovieCard.jsx';
import { Film, Tv, Search } from 'lucide-react';

function SkeletonCard() {
    return (
        <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse flex flex-col h-full">
            <div className="aspect-[2/3] bg-gray-200" />
            <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="flex gap-2 mt-auto">
                    <div className="h-6 bg-gray-200 rounded-full px-3" />
                    <div className="h-6 bg-gray-200 rounded-full px-3" />
                    <div className="h-6 bg-gray-200 rounded-full px-3" />
                </div>
            </div>
        </article>
    );
}

function EmptyState({ query, mediaType, onClearQuery }) {
    if (query) {
        return (
            <div className="col-span-full text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any movies or shows matching "<span className="font-medium">{query}</span>"</p>
                <button
                    onClick={onClearQuery}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Search className="h-4 w-4" />
                    Clear search
                </button>
            </div>
        );
    }

    return (
        <div className="col-span-full text-center py-16">
            {mediaType === 'Movie' ? <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" /> : mediaType === 'Series' ? <Tv className="h-16 w-16 text-gray-300 mx-auto mb-4" /> : <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Start searching</h3>
            <p className="text-gray-500">Type a movie or TV show name above to discover new favorites</p>
        </div>
    );
}

export function MovieGrid({ movies, isLoading, query, mediaType, onMovieClick, onFavoriteToggle, favorites, onClearQuery }) {
    const displayMovies = query ? movies : movies;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (displayMovies.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <EmptyState query={query} mediaType={mediaType} onClearQuery={onClearQuery} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayMovies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={favorites.some(f => f.id === movie.id)}
                    onFavoriteToggle={onFavoriteToggle}
                    onClick={() => onMovieClick(movie)}
                />
            ))}
        </div>
    );
}