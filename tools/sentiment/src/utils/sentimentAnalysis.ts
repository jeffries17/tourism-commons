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
  // Words missing from AFINN that are common in tour/hospitality complaints
  'unfortunately': -1.5,
  'regrettably': -1.5,
  'disappointingly': -1.5,
  'late': -1,
  'slow': -1,
  'crowded': -1,
  'overcrowded': -1.5,
  'overbooked': -1.5,
  'cramped': -1.5,
  'canceled': -1,
  'unfriendly': -2,
  'unhelpful': -2,
  'uncooperative': -2,
  'unreliable': -2,
  'unclean': -2,
  'disorganised': -2,
  'mediocre': -1.5,
  'bland': -1,
  'stale': -1.5,
  'cold': -0.5,
  'underwhelming': -1.5,
  'underwhelmed': -1.5,
  'overrated': -1.5,
  'expensive': -1,
  'pricey': -1,
  'ripoff': -2,
  'rip-off': -2,
  'rip off': -2,
  'smelly': -2,
  'shabby': -1.5,
  'rundown': -1.5,
  'run-down': -1.5,
  'run down': -1.5,
  'damp': -1,
  'mouldy': -2,
  'moldy': -2,
  'hassle': -1.5,
  'stressful': -1.5,
  'lacking': -1.5,
  'lacked': -1.5,
  'wasted': -1.5,
  'never again': -2,
  'never received': -1.5,
};

// Sentence-opening words that signal the rest of the sentence is bad news.
// They carry their own score above, but also amplify the negatives that follow.
const NEGATIVE_SENTENCE_MARKERS = [
  'unfortunately',
  'sadly',
  'regrettably',
  'disappointingly',
  'alas',
  'sad to say',
  'to my disappointment',
];
const MARKER_AMPLIFIER = 1.5;
const MARKER_SENTENCE_FLOOR = -0.15; // keeps a marker sentence from reading as neutral

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

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word match so short entries like 'late' don't fire inside 'chocolate'
function containsPhrase(textLower: string, phrase: string): boolean {
  return new RegExp(`(^|[^a-z])${escapeRegex(phrase)}($|[^a-z])`).test(textLower);
}

function findCustomPhrases(textLower: string) {
  let score = 0;
  const negative: string[] = [];
  const positive: string[] = [];
  for (const [phrase, value] of Object.entries(CUSTOM_NEGATIVE_PHRASES)) {
    if (containsPhrase(textLower, phrase)) {
      score += value;
      negative.push(phrase);
    }
  }
  for (const [phrase, value] of Object.entries(CUSTOM_POSITIVE_PHRASES)) {
    if (containsPhrase(textLower, phrase)) {
      score += value;
      positive.push(phrase);
    }
  }
  return { score, negative, positive };
}

function startsWithNegativeMarker(sentenceLower: string): boolean {
  const trimmed = sentenceLower.trim();
  return NEGATIVE_SENTENCE_MARKERS.some(
    m => trimmed.startsWith(m) && !/[a-z]/.test(trimmed[m.length] ?? '')
  );
}

// Extra negative weight for a marker sentence: amplifies the negatives in it
function markerBoost(sentence: string): number {
  if (!startsWithNegativeMarker(sentence.toLowerCase())) return 0;
  const base = sentiment.analyze(sentence);
  const custom = findCustomPhrases(sentence.toLowerCase());
  const baseNeg = (base.calculation as Array<{ [word: string]: number }>).reduce((sum: number, c) => {
    const v = Object.values(c)[0];
    return v < 0 ? sum + v : sum;
  }, 0);
  const customNeg = custom.negative.reduce((sum, p) => sum + CUSTOM_NEGATIVE_PHRASES[p], 0);
  return (baseNeg + customNeg) * (MARKER_AMPLIFIER - 1);
}

/**
 * Analyze sentiment with custom phrase detection
 */
export function analyzeSentiment(text: string): SentimentResult {
  const textLower = text.toLowerCase();

  // First, get base sentiment analysis
  const result = sentiment.analyze(text);

  // Check for custom phrases
  const custom = findCustomPhrases(textLower);
  const customScore = custom.score;
  const foundNegativePhrases = custom.negative;
  const foundPositivePhrases = custom.positive;

  // Marker sentences ("Unfortunately, ...") amplify the negatives that follow
  const sentenceTexts = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const boost = sentenceTexts.reduce((sum, s) => sum + markerBoost(s), 0);

  // Combine scores (normalize custom score to similar scale)
  const baseScore = result.score;
  const combinedScore = baseScore + customScore + boost;
  
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
  const sentenceAnalyses = sentenceTexts.map(sentence => {
    const sentResult = sentiment.analyze(sentence);
    const sentCustomScore = findCustomPhrases(sentence.toLowerCase()).score;

    const sentCombined = sentResult.score + sentCustomScore + markerBoost(sentence);
    let sentNormalized = Math.max(-1, Math.min(1, sentCombined / Math.max(1, sentence.split(/\s+/).length)));
    if (sentCombined <= 0 && startsWithNegativeMarker(sentence.toLowerCase())) {
      sentNormalized = Math.min(sentNormalized, MARKER_SENTENCE_FLOOR);
    }

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

