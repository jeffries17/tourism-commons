import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Custom negative phrases that the sentiment library might miss
const CUSTOM_NEGATIVE_PHRASES: { [phrase: string]: number } = {
  'eaten up': -2,
  'eaten': -1.5,
  'minus': -1,
  'died down': -0.5,
  'dies down': -0.5,
  'get eaten': -2,
  'not good': -1.5,
  'not great': -1.5,
  'not nice': -1.5,
  'not worth': -2,
  'too expensive': -1.5,
  'overpriced': -1.5,
  'disappointed': -1.5,
  'disappointing': -1.5,
  'poor': -1.5,
  'terrible': -2,
  'awful': -2,
  'horrible': -2,
  'worst': -2,
  'waste': -1.5,
  'waste of': -2,
  'avoid': -1.5,
  'skip': -1,
  'don\'t recommend': -2,
  'wouldn\'t recommend': -2,
  'not recommend': -2,
};

// Custom positive phrases
const CUSTOM_POSITIVE_PHRASES: { [phrase: string]: number } = {
  'works like a champ': 2,
  'just perfect': 2,
  'highly recommend': 2,
  'strongly recommend': 2,
  'absolutely': 1.5,
  'amazing': 2,
  'wonderful': 2,
  'excellent': 2,
  'outstanding': 2,
  'fantastic': 2,
  'brilliant': 1.5,
  'perfect': 2,
  'love it': 2,
  'loved it': 2,
  'best': 2,
};

export interface SentimentResult {
  score: number; // -5 to 5 (more negative = more negative)
  comparative: number; // -1 to 1
  calculation: Array<{ [key: string]: number }>;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
  label: 'positive' | 'neutral' | 'negative';
  magnitude?: number; // Strength of sentiment (0 to 5)
  sentences?: Array<{
    text: string;
    score: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

/**
 * Analyze sentiment with custom phrase detection
 */
export function analyzeSentiment(text: string): SentimentResult {
  const textLower = text.toLowerCase();
  
  // First, get base sentiment analysis
  const result = sentiment.analyze(text);
  
  // Check for custom phrases
  let customScore = 0;
  const foundNegativePhrases: string[] = [];
  const foundPositivePhrases: string[] = [];
  
  // Check negative phrases
  for (const [phrase, score] of Object.entries(CUSTOM_NEGATIVE_PHRASES)) {
    if (textLower.includes(phrase)) {
      customScore += score;
      foundNegativePhrases.push(phrase);
    }
  }
  
  // Check positive phrases
  for (const [phrase, score] of Object.entries(CUSTOM_POSITIVE_PHRASES)) {
    if (textLower.includes(phrase)) {
      customScore += score;
      foundPositivePhrases.push(phrase);
    }
  }
  
  // Combine scores (normalize custom score to similar scale)
  const baseScore = result.score;
  const combinedScore = baseScore + customScore;
  
  // Calculate magnitude (strength of sentiment, 0-5)
  const magnitude = Math.min(5, Math.abs(combinedScore) / Math.max(1, text.split(/\s+/).length / 10));
  
  // Normalize to -1 to 1 scale
  const normalizedScore = Math.max(-1, Math.min(1, combinedScore / Math.max(1, text.split(/\s+/).length)));
  
  // Determine label
  let label: 'positive' | 'neutral' | 'negative';
  if (normalizedScore > 0.1) {
    label = 'positive';
  } else if (normalizedScore < -0.1) {
    label = 'negative';
  } else {
    label = 'neutral';
  }
  
  // Analyze sentences individually
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceAnalyses = sentences.map(sentence => {
    const sentResult = sentiment.analyze(sentence);
    let sentCustomScore = 0;
    
    const sentLower = sentence.toLowerCase();
    for (const [phrase, score] of Object.entries(CUSTOM_NEGATIVE_PHRASES)) {
      if (sentLower.includes(phrase)) {
        sentCustomScore += score;
      }
    }
    for (const [phrase, score] of Object.entries(CUSTOM_POSITIVE_PHRASES)) {
      if (sentLower.includes(phrase)) {
        sentCustomScore += score;
      }
    }
    
    const sentCombined = sentResult.score + sentCustomScore;
    const sentNormalized = Math.max(-1, Math.min(1, sentCombined / Math.max(1, sentence.split(/\s+/).length)));
    
    let sentLabel: 'positive' | 'neutral' | 'negative';
    if (sentNormalized > 0.1) {
      sentLabel = 'positive';
    } else if (sentNormalized < -0.1) {
      sentLabel = 'negative';
    } else {
      sentLabel = 'neutral';
    }
    
    return {
      text: sentence.trim(),
      score: sentNormalized,
      sentiment: sentLabel
    };
  });
  
  // Add custom phrases to negative/positive arrays
  const enhancedNegative = [...result.negative, ...foundNegativePhrases];
  const enhancedPositive = [...result.positive, ...foundPositivePhrases];
  
  return {
    ...result,
    score: combinedScore,
    comparative: normalizedScore,
    label,
    magnitude,
    sentences: sentenceAnalyses,
    negative: enhancedNegative,
    positive: enhancedPositive
  };
}

/**
 * Analyze sentiment for a specific theme/sentence
 */
export function analyzeThemeSentiment(text: string, themeKeywords: string[]): {
  score: number;
  magnitude: number;
  sentiment: 'positive' | 'neutral' | 'negative';
} {
  const textLower = text.toLowerCase();
  
  // Find sentences containing theme keywords
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const relevantSentences = sentences.filter(sentence => {
    const sentLower = sentence.toLowerCase();
    return themeKeywords.some(keyword => sentLower.includes(keyword.toLowerCase()));
  });
  
  if (relevantSentences.length === 0) {
    return { score: 0, magnitude: 0, sentiment: 'neutral' };
  }
  
  // Analyze relevant sentences
  const relevantText = relevantSentences.join('. ');
  const result = analyzeSentiment(relevantText);
  
  return {
    score: result.comparative,
    magnitude: result.magnitude || 0,
    sentiment: result.label
  };
}

