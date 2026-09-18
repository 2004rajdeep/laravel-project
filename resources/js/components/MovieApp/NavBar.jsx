import { Link, Film, Tv, Image, Settings } from 'lucide-react';

export function NavBar() {
    const navItems = [
        { path: '/', label: 'URL Shortener', icon: Link },
        { path: '/react-app', label: 'Movie Search', icon: Film },
        { path: '/image-studio', label: 'Image Studio', icon: Image },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">⚡ ShortURL Suite</h1>
                    </div>
                    <div className="flex items-center space-x-1">
                        {navItems.map(({ path, label, icon: Icon }) => {
                            const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path));
                            return (
                                <button
                                    key={path}
                                    onClick={() => window.location.href = path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}