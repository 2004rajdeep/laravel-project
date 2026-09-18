import { useEffect, useRef } from 'react';
import { X, Heart, Star, Film, Tv, Calendar, Clock, Users, User, Award, CheckCircle, ExternalLink } from 'lucide-react';

export function MovieModal({ movie, isOpen, onClose, isFavorite, onFavoriteToggle, omdbApiKey }) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = '';
            previousActiveElement.current?.focus();
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !movie) return null;

    const posterUrl = movie.poster || `https://via.placeholder.com/300x450/1f2937/9ca3af?text=${encodeURIComponent(movie.title)}`;
    const backdropUrl = movie.backdrop || movie.poster;
    const year = movie.year || '—';
    const rating = movie.rating ? movie.rating.toFixed(1) : '—';
    const genres = movie.genres || [];
    const runtime = movie.runtime ? `${movie.runtime} min` : '—';
    const contentRating = movie.contentRating || '—';
    const summary = movie.summary || 'No summary available.';
    const cast = movie.cast || [];
    const crew = movie.crew || [];
    const ratings = movie.ratings || {};

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div
                    ref={modalRef}
                    tabIndex={-1}
                    className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="relative">
                        <img
                            src={backdropUrl}
                            alt=""
                            className="w-full h-48 sm:h-64 object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                            <img
                                src={posterUrl}
                                alt={`${movie.title} poster`}
                                className="w-32 h-48 object-cover rounded-lg shadow-2xl flex-shrink-0 border-2 border-white/20"
                                onError={(e) => { e.target.src = `https://via.placeholder.com/200x300/1f2937/9ca3af?text=${encodeURIComponent(movie.title)}`; }}
                            />
                            <div className="flex-1 min-w-0 text-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold mb-2">{movie.title}</h2>
                                        <div className="flex flex-wrap items-center gap-3 text-sm opacity-90">
                                            <span className="flex items-center gap-1">
                                                {movie.mediaType === 'movie' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                                                {movie.mediaType === 'movie' ? 'Movie' : 'Series'}
                                            </span>
                                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{year}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{runtime}</span>
                                            {contentRating !== '—' && <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{contentRating}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onFavoriteToggle(movie)}
                                            className={`p-3 rounded-full transition-all ${
                                                isFavorite
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Heart
                                                className="h-6 w-6"
                                                fill={isFavorite ? 'currentColor' : 'none'}
                                                strokeWidth={isFavorite ? 0 : 2}
                                            />
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                            aria-label="Close modal"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {genres.map((genre) => (
                                        <span key={genre} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Synopsis</h3>
                                <p className="text-gray-600 leading-relaxed">{summary}</p>

                                {Object.keys(ratings).length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ratings</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {ratings.imdb !== null && ratings.imdb !== undefined && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                                                    <Award className="h-5 w-5 text-yellow-500" />
                                                    <span className="font-medium">IMDb: {ratings.imdb}/10</span>
                                                </div>
                                            )}
                                            {ratings.rottenTomatoes !== null && ratings.rottenTomatoes !== undefined && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                                                    <CheckCircle className="h-5 w-5 text-red-500" />
                                                    <span className="font-medium">Rotten Tomatoes: {ratings.rottenTomatoes}%</span>
                                                </div>
                                            )}
                                            {ratings.metascore !== null && ratings.metascore !== undefined && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                                                    <Star className="h-5 w-5 fill-green-500 text-green-500" />
                                                    <span className="font-medium">Metascore: {ratings.metascore}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                {cast.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Cast
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {cast.slice(0, 12).map((member, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    {member.image ? (
                                                        <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{member.name}</p>
                                                        {member.character && <p className="text-sm text-gray-500 truncate">{member.character}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {crew.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Crew
                                        </h3>
                                        <div className="space-y-2">
                                            {crew.map((member, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.job}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}