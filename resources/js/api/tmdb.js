import axios from 'axios';

const TVMAZE_BASE = 'https://api.tvmaze.com';
const OMDB_BASE = 'https://www.omdbapi.com';

export async function searchTVMaze(query) {
    const response = await axios.get(`${TVMAZE_BASE}/search/shows`, {
        params: { q: query },
        timeout: 8000,
    });
    return response.data;
}

export async function fetchTVMazeShowDetails(showId) {
    const [showRes, castRes, crewRes] = await Promise.allSettled([
        axios.get(`${TVMAZE_BASE}/shows/${showId}`, { timeout: 8000 }),
        axios.get(`${TVMAZE_BASE}/shows/${showId}/cast`, { timeout: 8000 }),
        axios.get(`${TVMAZE_BASE}/shows/${showId}/crew`, { timeout: 8000 }),
    ]);

    return {
        show: showRes.status === 'fulfilled' ? showRes.value.data : null,
        cast: castRes.status === 'fulfilled' ? castRes.value.data : [],
        crew: crewRes.status === 'fulfilled' ? crewRes.value.data : [],
    };
}

export async function searchOMDb(query, apiKey) {
    if (!apiKey) return null;
    const response = await axios.get(OMDB_BASE, {
        params: { s: query, apikey: apiKey, type: 'movie' },
        timeout: 8000,
    });
    return response.data;
}

export async function fetchOMDbDetails(imdbId, apiKey) {
    if (!apiKey) return null;
    const response = await axios.get(OMDB_BASE, {
        params: { i: imdbId, apikey: apiKey, plot: 'full' },
        timeout: 8000,
    });
    return response.data;
}

function sanitizeHTML(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function normalizeTVMazeResult(item) {
    const show = item.show;
    if (!show) return null;

    return {
        id: `tvmaze-${show.id}`,
        title: show.name,
        year: show.premiered ? new Date(show.premiered).getFullYear() : null,
        type: 'series',
        mediaType: 'series',
        genres: show.genres || [],
        rating: show.rating?.average || null,
        poster: show.image?.medium || show.image?.original || null,
        backdrop: show.image?.original || show.image?.medium || null,
        summary: sanitizeHTML(show.summary),
        runtime: show.runtime || null,
        contentRating: show.rating || show.type || null,
        source: 'tvmaze',
        tvmazeId: show.id,
        _raw: show,
    };
}

function normalizeTVMazeDetails(data) {
    const { show, cast, crew } = data;
    if (!show) return null;

    const directors = crew.filter(c => c.type === 'Director' || c.job === 'Director').map(c => c.person?.name).filter(Boolean);
    const writers = crew.filter(c => c.type === 'Writer' || c.job === 'Writer').map(c => c.person?.name).filter(Boolean);
    const castList = cast.slice(0, 12).map(c => ({
        name: c.person?.name,
        character: c.character?.name,
        image: c.person?.image?.medium,
    })).filter(c => c.name);

    return {
        id: `tvmaze-${show.id}`,
        title: show.name,
        year: show.premiered ? new Date(show.premiered).getFullYear() : null,
        type: 'series',
        mediaType: 'series',
        genres: show.genres || [],
        rating: show.rating?.average || null,
        poster: show.image?.medium || show.image?.original || null,
        backdrop: show.image?.original || show.image?.medium || null,
        summary: sanitizeHTML(show.summary),
        runtime: show.runtime || null,
        contentRating: show.type || show.rating || null,
        cast: castList,
        crew: [...directors.map(name => ({ name, job: 'Director' })), ...writers.map(name => ({ name, job: 'Writer' }))],
        source: 'tvmaze',
        tvmazeId: show.id,
        _raw: show,
    };
}

function normalizeOMDbResult(item, apiKey) {
    if (!item.imdbID || item.Type !== 'movie') return null;
    return {
        id: `omdb-${item.imdbID}`,
        title: item.Title,
        year: item.Year ? parseInt(item.Year) : null,
        type: 'movie',
        mediaType: 'movie',
        genres: [],
        rating: item.imdbRating ? parseFloat(item.imdbRating) : null,
        poster: item.Poster !== 'N/A' ? item.Poster : null,
        backdrop: null,
        summary: item.Plot !== 'N/A' ? item.Plot : '',
        runtime: null,
        contentRating: item.Rated !== 'N/A' ? item.Rated : null,
        source: 'omdb',
        imdbId: item.imdbID,
        _raw: item,
    };
}

function normalizeOMDbDetails(data, apiKey) {
    if (!data || data.Response === 'False') return null;
    return {
        id: `omdb-${data.imdbID}`,
        title: data.Title,
        year: data.Year ? parseInt(data.Year) : null,
        type: 'movie',
        mediaType: 'movie',
        genres: data.Genre ? data.Genre.split(', ').map(g => g.trim()) : [],
        rating: data.imdbRating ? parseFloat(data.imdbRating) : null,
        poster: data.Poster !== 'N/A' ? data.Poster : null,
        backdrop: null,
        summary: data.Plot !== 'N/A' ? data.Plot : '',
        runtime: data.Runtime !== 'N/A' ? parseInt(data.Runtime) : null,
        contentRating: data.Rated !== 'N/A' ? data.Rated : null,
        cast: data.Actors !== 'N/A' ? data.Actors.split(', ').map(name => ({ name: name.trim(), character: '' })) : [],
        crew: [
            ...(data.Director !== 'N/A' ? [{ name: data.Director, job: 'Director' }] : []),
            ...(data.Writer !== 'N/A' ? data.Writer.split(', ').map(name => ({ name: name.trim(), job: 'Writer' })) : []),
        ],
        ratings: {
            imdb: data.imdbRating ? parseFloat(data.imdbRating) : null,
            rottenTomatoes: data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value ? parseInt(data.Ratings.find(r => r.Source === 'Rotten Tomatoes').Value) : null,
            metascore: data.Metascore !== 'N/A' ? parseInt(data.Metascore) : null,
        },
        source: 'omdb',
        imdbId: data.imdbID,
        _raw: data,
    };
}

export async function searchMovies(query, omdbApiKey) {
    const results = [];

    // TVMaze search (always available)
    try {
        const tvmazeData = await searchTVMaze(query);
        tvmazeData.forEach(item => {
            const normalized = normalizeTVMazeResult(item);
            if (normalized) results.push(normalized);
        });
    } catch (error) {
        console.warn('TVMaze search failed:', error.message);
    }

    // OMDb search (optional)
    if (omdbApiKey) {
        try {
            const omdbData = await searchOMDb(query, omdbApiKey);
            if (omdbData?.Search) {
                omdbData.Search.forEach(item => {
                    const normalized = normalizeOMDbResult(item, omdbApiKey);
                    if (normalized) results.push(normalized);
                });
            }
        } catch (error) {
            console.warn('OMDb search failed:', error.message);
        }
    }

    return results;
}

export async function fetchMovieDetails(movie, omdbApiKey) {
    if (movie.source === 'tvmaze' && movie.tvmazeId) {
        try {
            const data = await fetchTVMazeShowDetails(movie.tvmazeId);
            return normalizeTVMazeDetails(data);
        } catch (error) {
            console.warn('TVMaze details fetch failed:', error.message);
            return movie;
        }
    }

    if (movie.source === 'omdb' && movie.imdbId && omdbApiKey) {
        try {
            const data = await fetchOMDbDetails(movie.imdbId, omdbApiKey);
            return normalizeOMDbDetails(data, omdbApiKey);
        } catch (error) {
            console.warn('OMDb details fetch failed:', error.message);
            return movie;
        }
    }

    if (movie.source === 'curated') {
        // Curated movies already have full details
        return movie;
    }

    return movie;
}