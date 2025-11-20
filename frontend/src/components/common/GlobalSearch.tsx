import React, { useState, useCallback } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { useSearch } from '@/services/api/search.api';
import { useTranslation } from 'react-i18next';

interface GlobalSearchProps {
  onResultSelect?: (resultId: string, type: string) => void;
  className?: string;
}

/**
 * Global Search Component
 * Allows users to search across courses, lessons, users
 */
export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultSelect,
  className = ''
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: results = [], isLoading } = useSearch(query);

  const handleSelect = useCallback(
    (resultId: string, type: string) => {
      onResultSelect?.(resultId, type);
      setQuery('');
      setIsOpen(false);
    },
    [onResultSelect]
  );

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('common.search')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('common.search')}
          aria-expanded={isOpen && query.length > 0}
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 0 && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
          role="listbox"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y">
              {results.map((result) => (
                <li key={result.id} role="option">
                  <button
                    onClick={() => handleSelect(result.id, result.type)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {result.thumbnail && (
                        <img
                          src={result.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.title}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {result.description}
                        </div>
                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {t('common.error')} - No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
