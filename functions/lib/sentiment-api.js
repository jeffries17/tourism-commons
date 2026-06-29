import fs from 'fs';
import path from 'path';
// Load sentiment analysis data from JSON file
function loadSentimentData() {
    try {
        const dataPath = path.join(__dirname, '../../../sentiment/output/comprehensive_sentiment_analysis_results.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error loading sentiment data:', error);
        return null;
    }
}
// Get sentiment data for a specific stakeholder
export function getStakeholderSentiment(stakeholderName) {
    const data = loadSentimentData();
    if (!data)
        return null;
    return data.stakeholder_data.find(stakeholder => stakeholder.stakeholder_name.toLowerCase() === stakeholderName.toLowerCase()) || null;
}
// Get sentiment summary for all stakeholders
export function getSentimentSummary() {
    const data = loadSentimentData();
    return data?.summary || null;
}
// Get sentiment data for all stakeholders
export function getAllSentimentData() {
    const data = loadSentimentData();
    return data?.stakeholder_data || [];
}
// API endpoints
export function setupSentimentRoutes(app) {
    // Get sentiment data for a specific stakeholder
    app.get('/sentiment/stakeholder/:name', (req, res) => {
        try {
            const stakeholderName = decodeURIComponent(req.params.name);
            const sentimentData = getStakeholderSentiment(stakeholderName);
            if (!sentimentData) {
                return res.status(404).json({ error: 'Sentiment data not found for this stakeholder' });
            }
            res.json(sentimentData);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to load sentiment data' });
        }
    });
    // Get sentiment summary
    app.get('/sentiment/summary', (req, res) => {
        try {
            const summary = getSentimentSummary();
            if (!summary) {
                return res.status(404).json({ error: 'Sentiment summary not found' });
            }
            res.json(summary);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to load sentiment summary' });
        }
    });
    // Get all sentiment data
    app.get('/sentiment/all', (req, res) => {
        try {
            const allData = getAllSentimentData();
            res.json(allData);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to load sentiment data' });
        }
    });
    // Get sentiment data for stakeholders in a specific sector
    app.get('/sentiment/sector/:sector', (req, res) => {
        try {
            const sectorName = decodeURIComponent(req.params.sector);
            const allData = getAllSentimentData();
            // Filter by sector (this would need to be enhanced based on your sector mapping)
            const sectorData = allData.filter(stakeholder => {
                // This is a simple filter - you might need to enhance this based on your data structure
                return stakeholder.stakeholder_name.toLowerCase().includes(sectorName.toLowerCase());
            });
            res.json(sectorData);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to load sector sentiment data' });
        }
    });
}
