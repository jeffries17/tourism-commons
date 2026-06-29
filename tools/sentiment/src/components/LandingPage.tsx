import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: 1,
      title: "Enter Your Text",
      description: "Paste a tourism review, blog post, article, or any tourism-related text. Our system analyzes the text for sentiment and themes.",
      icon: "📝"
    },
    {
      number: 2,
      title: "View Analysis",
      description: "See sentiment scores, detected themes, word clouds, and highlighted text showing positive and negative words.",
      icon: "📊"
    },
    {
      number: 3,
      title: "Customize & Explore",
      description: "Adjust theme keywords, filter word clouds, view per-theme sentiment, and explore detailed sentence analysis.",
      icon: "⚙️"
    },
    {
      number: 4,
      title: "Save & Compare",
      description: "Save multiple review sets, compare different reviews, or analyze all reviews together for aggregate insights.",
      icon: "💾"
    }
  ];

  const useCases = [
    {
      title: "Tourism Operators",
      description: "Analyze customer reviews to identify strengths and areas for improvement",
      examples: ["Hotel reviews", "Tour operator feedback", "Restaurant ratings"]
    },
    {
      title: "Destination Management",
      description: "Understand visitor sentiment across different attractions and experiences",
      examples: ["Attraction reviews", "Activity feedback", "Cultural site experiences"]
    },
    {
      title: "Research & Analysis",
      description: "Study tourism sentiment patterns and theme detection for academic or market research",
      examples: ["Sentiment trends", "Theme frequency analysis", "Comparative studies"]
    },
    {
      title: "Quality Improvement",
      description: "Identify specific themes (service, facilities, value) that need attention",
      examples: ["Service quality", "Infrastructure issues", "Value perception"]
    }
  ];

  const tourismFeatures = [
    {
      title: "Tourism-Specific Themes",
      description: "Pre-configured themes like Cultural Heritage, Service Quality, Facilities, Accessibility, Value for Money, Safety, Educational Value, Artistic Quality, and Atmosphere",
      icon: "🎯"
    },
    {
      title: "Custom Phrase Detection",
      description: "Recognizes tourism-specific language like 'eaten up by midges', 'minus points', and context-aware sentiment",
      icon: "🔍"
    },
    {
      title: "Theme Customization",
      description: "Add or remove keywords for any theme to match your specific analysis needs",
      icon: "✏️"
    },
    {
      title: "Per-Theme Sentiment",
      description: "See sentiment scores for each detected theme, not just overall sentiment",
      icon: "📈"
    }
  ];

  const systemFeatures = [
    {
      title: "Multiple Reviews",
      description: "Add multiple reviews to analyze. Switch between individual reviews or view all combined.",
      icon: "➕"
    },
    {
      title: "Save Sessions",
      description: "Name and save your review sets. Access them anytime from the dropdown menu.",
      icon: "💾"
    },
    {
      title: "Word Cloud Filtering",
      description: "Filter word clouds to show all words, only positive, or only negative sentiment words.",
      icon: "☁️"
    },
    {
      title: "Highlighted Text",
      description: "See your review with positive words highlighted in green and negative words in red.",
      icon: "🎨"
    },
    {
      title: "Theme Detection",
      description: "Automatically detect which themes are discussed in your reviews, with mention counts and sentiment scores.",
      icon: "🏷️"
    },
    {
      title: "Educational Insights",
      description: "Learn how sentiment analysis works with tips on improving your analysis and understanding the results.",
      icon: "📚"
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-b from-blue-50 to-white rounded-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Tourism Sentiment Analysis
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          Analyze tourism reviews, blog posts, articles, and tour operator websites with sentiment analysis designed specifically for the tourism industry
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-2xl mx-auto">
          Understand visitor sentiment, detect themes, and gain insights from any tourism-related text
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Get Started →
        </button>
      </div>

      {/* How It Works - Step by Step */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                activeStep === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="text-sm font-semibold text-blue-600 mb-2">Step {step.number}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Analysis Process */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Sentiment Analysis</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            Sentiment analysis is a natural language processing technique that identifies and extracts emotional tone from text. 
            Our system analyzes tourism reviews, blog posts, articles, website content, and other tourism-related texts to determine whether the sentiment is <strong className="text-green-600">positive</strong>, 
            <strong className="text-red-600"> negative</strong>, or <strong className="text-yellow-600">neutral</strong>.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Calculate Sentiment</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Word-Level Analysis:</strong> Each word is scored for its emotional weight (positive, negative, or neutral)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Phrase Detection:</strong> Custom phrases like "eaten up" or "minus points" are recognized for tourism-specific context</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Sentence Analysis:</strong> Individual sentences are analyzed to understand nuanced sentiment within the review</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Magnitude Calculation:</strong> Measures the strength of sentiment, not just whether it's positive or negative</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Theme Detection:</strong> Identifies specific themes (service, facilities, value) and calculates sentiment for each</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700 mb-1">+0.1 to +1.0</div>
              <div className="text-sm text-green-800 font-semibold">Positive Sentiment</div>
              <div className="text-xs text-green-700 mt-1">Higher scores = more positive</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700 mb-1">-0.1 to +0.1</div>
              <div className="text-sm text-yellow-800 font-semibold">Neutral Sentiment</div>
              <div className="text-xs text-yellow-700 mt-1">Balanced or mixed feelings</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700 mb-1">-1.0 to -0.1</div>
              <div className="text-sm text-red-800 font-semibold">Negative Sentiment</div>
              <div className="text-xs text-red-700 mt-1">Lower scores = more negative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Designed for Tourism */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Designed Specifically for Tourism</h2>
        <p className="text-gray-700 mb-6">
          Unlike generic sentiment analysis tools, our system is built with tourism reviews in mind. We understand the unique language 
          and context of travel experiences, accommodations, attractions, and services.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tourismFeatures.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
              <p className="text-gray-700 mb-3">{useCase.description}</p>
              <ul className="space-y-1">
                {useCase.examples.map((example, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-600 mr-2">→</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* System Features */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemFeatures.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Analyze Your Content?</h2>
        <p className="text-xl mb-6 opacity-90">
          {isAuthenticated 
            ? "Start analyzing your tourism reviews, articles, and content now"
            : "Login to save your sessions and analyze multiple texts"}
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}

