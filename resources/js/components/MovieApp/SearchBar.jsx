import { Search, X, Film, Tv, SlidersHorizontal } from 'lucide-react';

export function SearchBar({ query, onQueryChange, onClear, mediaType, onMediaTypeChange, isLoading }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Search movies and TV shows... (e.g., Batman, Breaking Bad)"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Search movies and TV shows"
                    autoComplete="off"
                />
                {query && (
                    <button
                        onClick={onClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Clear search"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                )}
                {isLoading && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-blue-500">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:inline">Filter:</span>
                <div className="flex items-center gap-2">
                    {['All', 'Movie', 'Series'].map((type) => (
                        <button
                            key={type}
                            onClick={() => onMediaTypeChange(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                mediaType === type
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-pressed={mediaType === type}
                        >
                            {type === 'Movie' && <Film className="inline h-4 w-4 mr-1" aria-hidden="true" />}
                            {type === 'Series' && <Tv className="inline h-4 w-4 mr-1" aria-hidden="true" />}
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}