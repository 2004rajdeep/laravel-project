import { Heart, Star, Film, Tv, Calendar } from 'lucide-react';

export function MovieCard({ movie, isFavorite, onFavoriteToggle, onClick }) {
    const posterUrl = movie.poster || `https://via.placeholder.com/300x450/1f2937/9ca3af?text=${encodeURIComponent(movie.title)}`;
    const year = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '—');
    const rating = movie.rating ? movie.rating.toFixed(1) : '—';
    const genres = (movie.genres || []).slice(0, 3);

    return (
        <article
            onClick={onClick}
            className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col h-full"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
            aria-label={`View details for ${movie.title}`}
        >
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/300x450/1f2937/9ca3af?text=${encodeURIComponent(movie.title)}`; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <button
                    onClick={(e) => { e.stopPropagation(); onFavoriteToggle(movie); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white z-10"
                    aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                    aria-pressed={isFavorite}
                >
                    <Heart
                        className={`h-5 w-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                        fill={isFavorite ? 'currentColor' : 'none'}
                        strokeWidth={isFavorite ? 0 : 2}
                        aria-hidden="true"
                    />
                </button>

                <span className="absolute bottom-3 left-3 px-2 py-1 text-xs font-medium text-white bg-black/70 backdrop-blur-sm rounded">
                    {movie.mediaType === 'movie' ? (
                        <>
                            <Film className="inline h-3 w-3 mr-1" aria-hidden="true" />
                            Movie
                        </>
                    ) : (
                        <>
                            <Tv className="inline h-3 w-3 mr-1" aria-hidden="true" />
                            Series
                        </>
                    )}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                    {movie.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {year}
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        {rating}
                    </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {genres.map((genre) => (
                        <span
                            key={genre}
                            className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                        >
                            {genre}
                        </span>
                    ))}
                    {genres.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                            +{movie.genres.length - 3}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}