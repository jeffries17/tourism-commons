import { useEffect, useRef } from 'react';

interface WordCloudProps {
  words: Array<{ text: string; value: number }>;
  sentimentFilter?: 'all' | 'positive' | 'negative';
  positiveWords?: string[];
  negativeWords?: string[];
}

export default function WordCloud({ 
  words, 
  sentimentFilter = 'all',
  positiveWords = [],
  negativeWords = []
}: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || words.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min and max values for scaling
    const values = words.map(w => w.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Function to get font size based on value
    const getFontSize = (value: number) => {
      const minSize = 12;
      const maxSize = 48;
      const ratio = (value - minValue) / (maxValue - minValue);
      return minSize + (maxSize - minSize) * ratio;
    };

    // Function to get color based on sentiment
    const getColor = (wordText: string) => {
      const wordLower = wordText.toLowerCase();
      
      if (sentimentFilter === 'positive' || positiveWords.includes(wordLower)) {
        // Green shades for positive
        const greenShades = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];
        return greenShades[Math.floor(Math.random() * greenShades.length)];
      } else if (sentimentFilter === 'negative' || negativeWords.includes(wordLower)) {
        // Red shades for negative
        const redShades = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
        return redShades[Math.floor(Math.random() * redShades.length)];
      } else {
        // Mixed colors for 'all'
        if (positiveWords.includes(wordLower)) {
          return '#10b981'; // green
        } else if (negativeWords.includes(wordLower)) {
          return '#ef4444'; // red
        } else {
          // Neutral colors
          const neutralColors = ['#6b7280', '#4b5563', '#374151', '#1f2937'];
          return neutralColors[Math.floor(Math.random() * neutralColors.length)];
        }
      }
    };

    // Filter words based on sentiment filter
    // When filtering by sentiment, use the words array directly (which should already be filtered)
    // The filtering happens in the parent component to ensure all sentiment words are included
    let filteredWords = words;
    
    if (filteredWords.length === 0) {
      return;
    }

    // Simple word cloud placement (improved version)
    const placed: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    // Sort words by value (descending) to place important words first
    const sortedWords = [...filteredWords].sort((a, b) => b.value - a.value);

    sortedWords.forEach((word, index) => {
      const fontSize = getFontSize(word.value);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = getColor(word.text);
      
      const metrics = ctx.measureText(word.text);
      const width = metrics.width;
      const height = fontSize;

      // Try to place word
      let placed_ = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed_ && attempts < maxAttempts) {
        const x = Math.random() * (canvas.width - width);
        const y = Math.random() * (canvas.height - height) + height;

        // Check collision with previously placed words
        const hasCollision = placed.some((p) => {
          return !(
            x + width < p.x ||
            x > p.x + p.width ||
            y + height < p.y ||
            y > p.y + p.height
          );
        });

        if (!hasCollision) {
          ctx.fillText(word.text, x, y);
          placed.push({ x, y, width, height: height + 5 });
          placed_ = true;
        }
        attempts++;
      }
    });
  }, [words, sentimentFilter, positiveWords, negativeWords]);

  if (words.length === 0) {
    return <p className="text-gray-500">No words to display</p>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg bg-white"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}

