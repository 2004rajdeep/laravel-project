import { createRoot } from 'react-dom/client';
import MovieApp from './components/MovieApp/MovieApp.jsx';

const rootEl = document.getElementById('react-root');

if (!rootEl) {
    document.body.innerHTML = '<div style="padding:2rem;text-align:center;color:#dc2626;font-family:sans-serif"><h1 style="font-size:1.5rem;margin-bottom:0.5rem">Error</h1><p>Application root element not found.</p></div>';
} else {
    createRoot(rootEl).render(<MovieApp />);
}