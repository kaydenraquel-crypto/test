import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface SentimentData {
  score: number;
  label: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

interface NewsArticle {
  source: string;
  headline: string;
  summary: string;
  url?: string;
  datetime: string;
  sentiment: SentimentData;
  category: string;
}

interface NewsFeedProps {
  symbol: string;
  market: string;
  news?: NewsArticle[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ symbol, market, news = [] }) => {
  const [articles, setArticles] = useState<NewsArticle[]>(news);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Update articles when news prop changes
  useEffect(() => {
    console.log('📰 NewsFeed: Received news prop:', news?.length, 'items');
    if (news && news.length > 0) {
      setArticles(news);
      setLastUpdate(new Date());
      setError(null);
      console.log('📰 NewsFeed: Updated articles:', news.length, 'items');
    } else if (news && news.length === 0) {
      console.log('📰 NewsFeed: Received empty news array');
      setArticles([]);
    }
  }, [news]);

  const fetchNews = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/news?symbol=${encodeURIComponent(symbol)}&market=${market}&limit=12`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArticles(data.news || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: SentimentData) => {
    switch (sentiment.label) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: SentimentData) => {
    switch (sentiment.label) {
      case 'bullish':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours < 1) {
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Recently';
    }
  };

  const getSentimentScore = (sentiment: SentimentData) => {
    const score = sentiment.score;
    if (score > 0) {
      return `+${(score * 100).toFixed(0)}%`;
    } else if (score < 0) {
      return `${(score * 100).toFixed(0)}%`;
    }
    return '0%';
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">News Feed</h2>
          <button
            onClick={fetchNews}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh news"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Failed to load news</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel news-panel-light">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📰 News Feed
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {symbol} • {articles.length} articles
            {lastUpdate && (
              <span className="ml-2">• Updated {formatDateTime(lastUpdate.toISOString())}</span>
            )}
          </p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 rounded-md hover:bg-gray-700"
          title="Refresh news"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="py-8 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
          <div className="text-gray-400 text-sm">Loading latest news...</div>
        </div>
      )}

      {/* News Articles */}
      <div className="news-feed max-h-80 overflow-y-auto pr-2">
        {articles.map((article, index) => (
          <div
            key={index}
            className="news-item p-3 border-b border-gray-700 hover:bg-gray-800 transition-colors rounded-md mb-2 last:mb-0 last:border-b-0"
          >
            {/* Article Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm font-medium text-blue-400">
                  {article.source}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateTime(article.datetime)}</span>
                </div>
              </div>
              
              {/* Sentiment Badge */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                article.sentiment.label === 'bullish' ? 'bg-green-600/20 text-green-400' :
                article.sentiment.label === 'bearish' ? 'bg-red-600/20 text-red-400' :
                'bg-gray-600/20 text-gray-400'
              }`}>
                {getSentimentIcon(article.sentiment)}
                <span className="font-medium">{article.sentiment.label}</span>
                <span className="text-xs opacity-80">
                  {getSentimentScore(article.sentiment)}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h4 className="news-title font-medium text-white mb-2 leading-snug text-sm">
              {article.headline}
            </h4>

            {/* Summary */}
            {article.summary && (
              <p className="news-summary text-xs text-gray-300 mb-3 line-clamp-2 leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* Article Footer */}
            <div className="flex items-center justify-between mt-3">
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                article.category === 'financial' ? 'bg-blue-600/20 text-blue-400' :
                article.category === 'company' ? 'bg-purple-600/20 text-purple-400' :
                article.category === 'analysis' ? 'bg-yellow-600/20 text-yellow-400' :
                'bg-gray-600/20 text-gray-400'
              }`}>
                {article.category}
              </span>
              
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Read more</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Sentiment Details */}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Confidence: {(article.sentiment.confidence * 100).toFixed(0)}%</span>
                <div className={`w-12 h-1 rounded-full ${
                  article.sentiment.label === 'bullish' ? 'bg-green-800' :
                  article.sentiment.label === 'bearish' ? 'bg-red-800' :
                  'bg-gray-600'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      article.sentiment.label === 'bullish' ? 'bg-green-400' :
                      article.sentiment.label === 'bearish' ? 'bg-red-400' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${article.sentiment.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-2">No news available</div>
          <div className="text-sm text-gray-500">
            Try refreshing or check back later for {symbol} news
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Debug: Received {news?.length || 0} news items from props
          </div>
          <button
            onClick={fetchNews}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Fetch News
          </button>
        </div>
      )}

      {/* Sentiment Summary */}
      {articles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <div className="text-sm text-gray-300 mb-3 font-medium">Overall Sentiment</div>
          <div className="flex items-center justify-between">
            {(() => {
              const bullishCount = articles.filter(a => a.sentiment.label === 'bullish').length;
              const bearishCount = articles.filter(a => a.sentiment.label === 'bearish').length;
              const neutralCount = articles.filter(a => a.sentiment.label === 'neutral').length;
              
              return (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">{bullishCount}</span>
                    <span className="text-gray-400">Bullish</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-semibold">{bearishCount}</span>
                    <span className="text-gray-400">Bearish</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Minus className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 font-semibold">{neutralCount}</span>
                    <span className="text-gray-400">Neutral</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
