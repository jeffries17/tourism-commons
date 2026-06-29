import { useState } from 'react';
import themesData from '../utils/defaultThemes.json';
import { Theme } from '../utils/themeDetection';

export default function ThemesPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const universalThemes = themesData.universal as Record<string, Theme>;
  const themeEntries = Object.entries(universalThemes);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Analysis Themes</h3>
          <p className="text-sm text-gray-600 mt-1">
            These themes will be detected in your review. You can customize keywords after analysis.
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {isExpanded ? '▼ Hide' : '▶ Show'} Themes ({themeEntries.length})
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeEntries.map(([themeKey, theme]) => (
              <div
                key={themeKey}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {theme.display_name}
                </h4>
                {theme.description && (
                  <p className="text-xs text-gray-600 mb-2">{theme.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {theme.keywords.slice(0, 8).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {theme.keywords.length > 8 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{theme.keywords.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            💡 <strong>Tip:</strong> After analyzing your review, you can customize these themes by clicking "Show Keywords" on any detected theme. Add or remove keywords to match your specific analysis needs.
          </div>
        </div>
      )}
    </div>
  );
}

