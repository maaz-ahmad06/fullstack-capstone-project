// sentiment/index.js
// Task 8 requirement: line that imports the natural npm package
const natural = require('natural');

/**
 * Express router / utility function for sentiment analysis on user comments
 */
const express = require('express');
const router = express.Router();

const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");

/**
 * Route to analyze sentiment of a given sentence/review
 * POST /api/sentiment/analyze
 */
router.post('/analyze', (req, res) => {
    try {
        const { sentence } = req.body;
        if (!sentence) {
            return res.status(400).json({ error: "Sentence text is required for sentiment analysis." });
        }

        const tokenizer = new natural.WordTokenizer();
        const tokenizedWords = tokenizer.tokenize(sentence);
        const sentimentScore = analyzer.getSentiment(tokenizedWords);

        let sentimentLabel = "Neutral";
        if (sentimentScore > 0.3) {
            sentimentLabel = "Positive";
        } else if (sentimentScore < -0.3) {
            sentimentLabel = "Negative";
        }

        return res.status(200).json({
            sentence,
            score: sentimentScore,
            sentiment: sentimentLabel
        });
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        return res.status(500).json({ error: "Failed to perform sentiment analysis." });
    }
});

module.exports = router;
