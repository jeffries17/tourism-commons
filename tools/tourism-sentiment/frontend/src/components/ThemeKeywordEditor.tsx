import { useState, useEffect } from 'react';
import { Theme } from '../utils/themeDetection';

interface ThemeKeywordEditorProps {
  theme: Theme;
  themeKey: string;
  onUpdate: (themeKey: string, updatedKeywords: string[]) => void;
}

export default function ThemeKeywordEditor({ theme, themeKey, onUpdate }: ThemeKeywordEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(theme.keywords);
  const [newKeyword, setNewKeyword] = useState('');
  
  // Sync keywords when theme changes (e.g., when custom keywords are applied)
  useEffect(() => {
    setKeywords(theme.keywords);
  }, [theme.keywords]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      const updated = [...keywords, newKeyword.trim().toLowerCase()];
      setKeywords(updated);
      onUpdate(themeKey, updated);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updated = keywords.filter(k => k !== keywordToRemove);
    setKeywords(updated);
    onUpdate(themeKey, updated);
  };

  const handleReset = () => {
    setKeywords(theme.keywords);
    onUpdate(themeKey, theme.keywords);
  };

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        {isOpen ? '▼' : '▶'} {isOpen ? 'Hide' : 'Show'} Keywords ({keywords.length})
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs text-gray-600 mb-2">
              Keywords that trigger this theme. Click to remove, or add new ones below.
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center gap-1 group cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                  onClick={() => handleRemoveKeyword(keyword)}
                  title="Click to remove"
                >
                  {keyword}
                  <span className="text-xs opacity-0 group-hover:opacity-100">×</span>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddKeyword}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
              title="Reset to default keywords"
            >
              Reset
            </button>
          </div>
          
          <p className="text-xs text-gray-500 italic">
            💡 Tip: Customize keywords to match your specific analysis needs. Changes apply immediately.
          </p>
        </div>
      )}
    </div>
  );
}

