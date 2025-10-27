import { currentCountry } from '../config/index';

export default function Methodology() {
  const categories = [
    { 
      id: 'socialMedia', 
      name: 'Social Media', 
      icon: '📱',
      description: 'Social media presence, posting frequency, and engagement across platforms like Facebook, Instagram, and TikTok.'
    },
    { 
      id: 'website', 
      name: 'Website', 
      icon: '🌐',
      description: 'Website functionality, mobile-friendliness, content quality, and professional presentation.'
    },
    { 
      id: 'visualContent', 
      name: 'Visual Content', 
      icon: '📸',
      description: 'Quality and variety of photos, videos, and visual materials showcasing products or services.'
    },
    { 
      id: 'discoverability', 
      name: 'Discoverability', 
      icon: '🔍',
      description: 'Search engine visibility, directory listings, Google My Business presence, and online reviews.'
    },
    { 
      id: 'digitalSales', 
      name: 'Digital Sales', 
      icon: '💳',
      description: 'Online booking capabilities, contact forms, WhatsApp Business, and digital payment options.'
    },
    { 
      id: 'platformIntegration', 
      name: 'Platform Integration', 
      icon: '🔗',
      description: 'Presence and completeness of profiles on tourism platforms, review sites, and business directories.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
          Assessment Methodology
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          This digital assessment is designed to evaluate and support the digital transformation of 
          tourism and creative industry businesses in {currentCountry.name}. By measuring digital 
          capabilities across key categories and sectors, we aim to identify strengths, opportunities, 
          and provide actionable guidance for growth.
        </p>
        <p className="text-gray-700 leading-relaxed">
          The assessment recognizes that different types of businesses succeed through different digital 
          channels. A craft artist may thrive with strong social media presence alone, while a tour 
          operator needs robust search visibility and booking systems. Our sector-specific approach 
          ensures fair, relevant evaluation that reflects real-world business needs.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Project Goals
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">Industry-Wide Assessment</h3>
            <p className="text-gray-700 text-sm">
              Understand the overall digital maturity of the tourism and creative sectors, 
              identifying common challenges and opportunities for collective improvement.
            </p>
          </div>
          <div className="border-l-4 border-secondary pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">Sector-Specific Insights</h3>
            <p className="text-gray-700 text-sm">
              Analyze how different sectors (tour operators, artisans, musicians, etc.) perform 
              on digital capabilities most critical to their success.
            </p>
          </div>
          <div className="border-l-4 border-success pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">Individual Business Support</h3>
            <p className="text-gray-700 text-sm">
              Provide each participant with personalized insights and practical recommendations 
              for improving their digital presence.
            </p>
          </div>
          <div className="border-l-4 border-warning pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">Evidence for Policy & Investment</h3>
            <p className="text-gray-700 text-sm">
              Generate data-driven evidence to inform sector development programs, training 
              initiatives, and infrastructure investments.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Maturity Levels
        </h2>
        <p className="text-gray-700 mb-4">
          Based on their final percentage score, each business is classified into one of five 
          maturity levels that describe their digital development stage.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {currentCountry.maturityLevels.map((level) => (
            <div 
              key={level.label} 
              className="p-4 rounded-lg border flex flex-col"
              style={{ backgroundColor: level.color }}
            >
              <div className="text-center mb-2">
                <div className="text-lg font-mono font-bold text-gray-900 bg-white inline-block px-3 py-1 rounded mb-2">
                  {level.min}-{level.max}%
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 text-center mb-2">{level.label}</h4>
              <p className="text-xs text-gray-700 text-center leading-relaxed">{level.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          The Six Assessment Categories
        </h2>
        <p className="text-gray-700 mb-4">
          Each business is evaluated on six core categories of digital capability. Each category 
          is scored 0-10 points based on objective yes/no criteria.
        </p>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-2xl">{category.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{category.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                <p className="text-xs text-gray-500 mt-2">Base Score: 0-10 points</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Total Raw Score:</span> 60 points (6 categories × 10 points each)
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Sector-Specific Weighting
        </h2>
        <p className="text-gray-700 mb-4">
          After calculating raw scores (0-60), we apply <strong>sector-specific multipliers</strong> that 
          reflect each category's importance to that business type. This ensures businesses are evaluated 
          on what actually drives their success.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🎨 Creative Industries Example</h3>
            <p className="text-sm text-gray-600 mb-3">
              (Artists, Craftspeople, Musicians)
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>📱 Social Media</span>
                <span className="font-semibold text-primary">2.2× (22 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>📸 Visual Content</span>
                <span className="font-semibold text-primary">2.0× (20 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>🌐 Website</span>
                <span className="text-gray-600">1.0× (10 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>🔍 Discoverability</span>
                <span className="text-gray-600">0.8× (8 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>💳 Digital Sales</span>
                <span className="text-gray-600">0.5× (5 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>🔗 Platform Integration</span>
                <span className="text-gray-600">0.5× (5 pts)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Social media and visual content are primary sales channels for artisans
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🚌 Tour Operators Example</h3>
            <p className="text-sm text-gray-600 mb-3">
              (Travel Services, Tour Companies)
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>🔍 Discoverability</span>
                <span className="font-semibold text-primary">2.1× (21 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>🌐 Website</span>
                <span className="font-semibold text-primary">1.2× (12 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>📱 Social Media</span>
                <span className="text-gray-600">1.1× (11 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>💳 Digital Sales</span>
                <span className="text-gray-600">1.0× (10 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>📸 Visual Content</span>
                <span className="text-gray-600">0.8× (8 pts)</span>
              </div>
              <div className="flex justify-between">
                <span>🔗 Platform Integration</span>
                <span className="text-gray-600">0.8× (8 pts)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Tourists search on Google months before arriving; discoverability is critical
            </p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Weighted Total:</span> 70 points (multipliers always sum to 7.0×)
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Final scores are converted to percentages (0-100%) for easy comparison across sectors.
          </p>
        </div>
      </div>

      <div id="creative-tourism-score" className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Creative Tourism Score (0-100)
        </h2>
        <p className="text-gray-700 mb-4">
          In addition to the digital maturity assessment, we measure how international tour operators 
          position and market Gambian creative and cultural tourism. The <strong>Creative Tourism Score</strong> is 
          a separate metric that evaluates tour descriptions rather than digital capabilities.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">What Does It Measure?</h3>
          <p className="text-sm text-gray-700">
            The Creative Tourism Score measures how prominently tour operators feature creative and cultural 
            sectors (heritage sites, crafts, music, performing arts, festivals, audiovisual, fashion, publishing) 
            in their tour descriptions versus traditional beach/nature tourism.
          </p>
        </div>

        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-gray-900">Eight Creative Sectors Evaluated:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">🏛️</span>
              <div>
                <strong>Heritage Sites & Museums</strong>
                <p className="text-xs text-gray-600">Historical sites, cultural landmarks, museums</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">🎨</span>
              <div>
                <strong>Crafts & Artisan Products</strong>
                <p className="text-xs text-gray-600">Traditional crafts, artisan markets, workshops</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">🎵</span>
              <div>
                <strong>Music</strong>
                <p className="text-xs text-gray-600">Traditional music, live performances, music venues</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">🎭</span>
              <div>
                <strong>Performing & Visual Arts</strong>
                <p className="text-xs text-gray-600">Theatre, dance, galleries, art exhibitions</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">🎪</span>
              <div>
                <strong>Festivals & Cultural Events</strong>
                <p className="text-xs text-gray-600">Cultural festivals, celebrations, ceremonies</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">🎬</span>
              <div>
                <strong>Audiovisual</strong>
                <p className="text-xs text-gray-600">Film, photography, media productions</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">✨</span>
              <div>
                <strong>Fashion & Design</strong>
                <p className="text-xs text-gray-600">Local fashion, textile design, wearable art</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">📚</span>
              <div>
                <strong>Publishing & Marketing</strong>
                <p className="text-xs text-gray-600">Local literature, storytelling, cultural narratives</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <h3 className="font-semibold text-gray-900">Scoring Methodology:</h3>
          <p className="text-sm text-gray-700">
            Each of the eight creative sectors is scored 0-10 points for each tour description:
          </p>
          <div className="space-y-2 text-sm pl-4">
            <div className="flex gap-2">
              <span className="font-mono font-semibold text-gray-700 min-w-8">0:</span>
              <span>Not mentioned</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono font-semibold text-gray-700 min-w-8">1-3:</span>
              <span>Brief mention (single sentence)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono font-semibold text-gray-700 min-w-8">4-6:</span>
              <span>Described (paragraph with some detail)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono font-semibold text-gray-700 min-w-8">7-9:</span>
              <span>Featured (dedicated section, itinerary item)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono font-semibold text-gray-700 min-w-8">10:</span>
              <span>Highlighted (key selling point, extensive coverage)</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Total Score Calculation:</span> Sum of all 8 sector scores × 1.25 = 0-100 points
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Scores are averaged across all tours from an operator to get their overall Creative Tourism Score
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Interpretation:</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white rounded p-3 border-2 border-red-300">
              <div className="text-xs text-gray-600 mb-1">Low (0-30)</div>
              <div className="text-sm font-semibold text-red-700">Beach/Nature Focus</div>
              <p className="text-xs text-gray-600 mt-2">
                Tours primarily emphasize beaches, wildlife, and natural landscapes with minimal cultural content
              </p>
            </div>
            <div className="bg-white rounded p-3 border-2 border-amber-300">
              <div className="text-xs text-gray-600 mb-1">Moderate (30-60)</div>
              <div className="text-sm font-semibold text-amber-700">Some Cultural Elements</div>
              <p className="text-xs text-gray-600 mt-2">
                Tours blend beach/nature with cultural experiences, but culture isn't the main selling point
              </p>
            </div>
            <div className="bg-white rounded p-3 border-2 border-green-300">
              <div className="text-xs text-gray-600 mb-1">Strong (60-100)</div>
              <div className="text-sm font-semibold text-green-700">Culture-Led Tourism</div>
              <p className="text-xs text-gray-600 mt-2">
                Tours prominently feature creative/cultural experiences as primary attractions and selling points
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This score is separate from the digital maturity assessment. 
            It measures <em>how</em> destinations are marketed, not the digital capabilities of the businesses. 
            You can find Creative Tourism Score analysis in the "ITO Perception" section of the dashboard.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Data Collection & Analysis
        </h2>
        <p className="text-gray-700 mb-4">
          Our assessment combines two complementary approaches to build a comprehensive picture 
          of digital maturity:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">1. External Digital Presence Assessment</h3>
            <p className="text-sm text-gray-700">
              Objective evaluation of publicly visible digital assets including websites, social media 
              accounts, review platforms, and online directories. This provides an unbiased view of 
              how the business appears to potential customers.
            </p>
          </div>
          <div className="border-l-4 border-secondary pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">2. Self-Assessment Survey</h3>
            <p className="text-sm text-gray-700">
              Voluntary survey where businesses share information about their internal digital practices, 
              tools, and strategies that may not be publicly visible. This captures the "behind the scenes" 
              capabilities.
            </p>
          </div>
          <div className="border-l-4 border-success pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">3. Combined Scoring</h3>
            <p className="text-sm text-gray-700">
              External assessment (70% weight) and survey responses (30% weight) are combined to create 
              a comprehensive score that reflects both public presence and internal capabilities.
            </p>
          </div>
          <div className="border-l-4 border-warning pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">4. Validation & Review</h3>
            <p className="text-sm text-gray-700">
              All assessments undergo quality checks to ensure accuracy and consistency. Outliers are 
              manually reviewed and verified.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Personalized Recommendations
        </h2>
        <p className="text-gray-700 mb-4">
          Each participant receives tailored recommendations based on their assessment results. 
          These recommendations are:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span><strong>Sector-Specific:</strong> Reflect the unique priorities and constraints of the business type</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span><strong>Practical:</strong> Focus on achievable actions with clear next steps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span><strong>Prioritized:</strong> Ranked by potential impact and ease of implementation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span><strong>Context-Aware:</strong> Consider current maturity level and available resources</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span><strong>Evidence-Based:</strong> Grounded in successful practices from similar businesses</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600 mt-4 italic">
          Recommendations are generated using advanced language models trained on digital marketing 
          best practices, then reviewed for local relevance and feasibility.
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
        <h2 className="text-lg font-heading font-semibold mb-2 text-gray-900">
          Questions About Our Methodology?
        </h2>
        <p className="text-gray-700 text-sm">
          This assessment framework is continuously refined based on feedback from participants, 
          industry experts, and emerging best practices in digital transformation. For detailed 
          documentation on our sector weighting methodology and validation approach, please contact 
          the research team.
        </p>
      </div>
    </div>
  );
}

