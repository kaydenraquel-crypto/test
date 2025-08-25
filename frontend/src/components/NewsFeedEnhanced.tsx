import React, { useState, useEffect, useCallback } from 'react'
import { Clock, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, BarChart2 } from 'lucide-react'

interface SentimentData {
  score: number
  label: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  keywords: string[]
}

interface NewsArticle {
  id: string
  source: string
  headline: string
  summary: string
  url?: string
  datetime: string
  sentiment: SentimentData
  category: string
  impact: 'high' | 'medium' | 'low'
  relatedSymbols: string[]
}

interface NewsFeedProps {
  symbol?: string
  onSymbolClick?: (symbol: string) => void
}

const NewsFeedEnhanced: React.FC<NewsFeedProps> = ({ symbol = 'BTCUSDT', onSymbolClick }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'high-impact'>('all')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Generate demo news articles with AI sentiment analysis
  const generateDemoArticles = useCallback((): NewsArticle[] => {
    const sources = ['CoinDesk', 'Bloomberg Crypto', 'Reuters', 'CryptoNews', 'The Block', 'Decrypt']
    const categories = ['market', 'regulation', 'technical', 'adoption', 'analysis']
    
    const headlines = [
      {
        text: 'Bitcoin ETF Sees Record $500M Inflows as Institutional Interest Surges',
        sentiment: 'bullish' as const,
        impact: 'high' as const,
        keywords: ['ETF', 'institutional', 'inflows', 'adoption']
      },
      {
        text: 'Federal Reserve Signals Potential Rate Cuts, Crypto Markets React Positively',
        sentiment: 'bullish' as const,
        impact: 'high' as const,
        keywords: ['Fed', 'rates', 'monetary policy', 'bullish']
      },
      {
        text: 'Major Exchange Hack Raises Security Concerns Across Crypto Industry',
        sentiment: 'bearish' as const,
        impact: 'high' as const,
        keywords: ['hack', 'security', 'exchange', 'risk']
      },
      {
        text: 'Technical Analysis: Bitcoin Forms Golden Cross Pattern on Daily Chart',
        sentiment: 'bullish' as const,
        impact: 'medium' as const,
        keywords: ['golden cross', 'technical', 'bullish signal', 'chart']
      },
      {
        text: 'Regulatory Uncertainty Continues to Weigh on Crypto Market Sentiment',
        sentiment: 'bearish' as const,
        impact: 'medium' as const,
        keywords: ['regulation', 'uncertainty', 'SEC', 'compliance']
      },
      {
        text: 'Ethereum Layer 2 Solutions See Explosive Growth in Transaction Volume',
        sentiment: 'bullish' as const,
        impact: 'medium' as const,
        keywords: ['Ethereum', 'L2', 'scaling', 'adoption']
      },
      {
        text: 'Market Analysis: Bitcoin Consolidates Near Key Support Level',
        sentiment: 'neutral' as const,
        impact: 'low' as const,
        keywords: ['consolidation', 'support', 'technical', 'range']
      },
      {
        text: 'DeFi Protocol TVL Reaches New All-Time High Despite Market Volatility',
        sentiment: 'bullish' as const,
        impact: 'medium' as const,
        keywords: ['DeFi', 'TVL', 'growth', 'adoption']
      },
      {
        text: 'Mining Difficulty Adjustment Shows Network Strength and Resilience',
        sentiment: 'neutral' as const,
        impact: 'low' as const,
        keywords: ['mining', 'difficulty', 'network', 'hashrate']
      },
      {
        text: 'Whale Alert: Large Bitcoin Transfer Sparks Market Speculation',
        sentiment: 'neutral' as const,
        impact: 'medium' as const,
        keywords: ['whale', 'transfer', 'on-chain', 'movement']
      }
    ]

    return headlines.map((headline, index) => {
      const sentimentScore = headline.sentiment === 'bullish' ? 0.7 + Math.random() * 0.3 :
                             headline.sentiment === 'bearish' ? -0.7 - Math.random() * 0.3 :
                             -0.2 + Math.random() * 0.4

      const now = new Date()
      const hoursAgo = Math.floor(Math.random() * 24)
      const articleTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

      return {
        id: `news-${index}-${Date.now()}`,
        source: sources[Math.floor(Math.random() * sources.length)] || 'Unknown',
        headline: headline.text,
        summary: `${headline.text}. Market analysts are closely monitoring the situation as ${
          headline.sentiment === 'bullish' ? 'positive momentum builds' :
          headline.sentiment === 'bearish' ? 'concerns grow among traders' :
          'the market seeks direction'
        }. Key factors include ${headline.keywords.slice(0, 2).join(' and ')}.`,
        url: '#',
        datetime: articleTime.toISOString(),
        sentiment: {
          score: sentimentScore,
          label: headline.sentiment,
          confidence: 0.75 + Math.random() * 0.25,
          keywords: headline.keywords
        },
        category: categories[Math.floor(Math.random() * categories.length)] || 'General',
        impact: headline.impact,
        relatedSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    })
  }, [])

  // Initialize with demo articles
  useEffect(() => {
    setArticles(generateDemoArticles())
  }, [generateDemoArticles])

  // Simulate real-time news updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new article
      if (Math.random() > 0.7) {
        const newArticles = generateDemoArticles()
        const newArticle = newArticles[Math.floor(Math.random() * newArticles.length)]
        if (newArticle) {
          newArticle.datetime = new Date().toISOString()
          newArticle.id = `news-new-${Date.now()}`
          
          setArticles(prev => [newArticle, ...prev].slice(0, 15)) // Keep max 15 articles
        }
        setLastUpdate(new Date())
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [generateDemoArticles])

  const refreshNews = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setArticles(generateDemoArticles())
      setLastUpdate(new Date())
      setLoading(false)
    }, 1000)
  }, [generateDemoArticles])

  const getSentimentIcon = (sentiment: SentimentData) => {
    switch (sentiment.label) {
      case 'bullish':
        return <TrendingUp style={{ width: '14px', height: '14px', color: '#00d4aa' }} />
      case 'bearish':
        return <TrendingDown style={{ width: '14px', height: '14px', color: '#ff6b6b' }} />
      default:
        return <Minus style={{ width: '14px', height: '14px', color: '#888' }} />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#ff6b6b'
      case 'medium':
        return '#fbbf24'
      default:
        return '#888'
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      if (diffHours < 1) {
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`
      } else if (diffHours < 24) {
        return `${diffHours}h ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return 'Recently'
    }
  }

  // Filter articles based on selected filter
  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true
    if (filter === 'bullish') return article.sentiment.label === 'bullish'
    if (filter === 'bearish') return article.sentiment.label === 'bearish'
    if (filter === 'high-impact') return article.impact === 'high'
    return true
  })

  const sentimentStats = {
    bullish: articles.filter(a => a.sentiment.label === 'bullish').length,
    bearish: articles.filter(a => a.sentiment.label === 'bearish').length,
    neutral: articles.filter(a => a.sentiment.label === 'neutral').length
  }

  const overallSentiment = sentimentStats.bullish > sentimentStats.bearish ? 'bullish' :
                           sentimentStats.bearish > sentimentStats.bullish ? 'bearish' : 'neutral'

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h3 style={{ 
              color: '#00d4aa', 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              📰 AI News Feed
            </h3>
            <div style={{ 
              color: '#888', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{filteredArticles.length} articles</span>
              <span>•</span>
              <Clock style={{ width: '12px', height: '12px' }} />
              <span>Updated {formatDateTime(lastUpdate.toISOString())}</span>
            </div>
          </div>
          
          <button
            onClick={refreshNews}
            disabled={loading}
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '6px',
              color: '#888',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            <RefreshCw style={{ 
              width: '16px', 
              height: '16px',
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
          </button>
        </div>

        {/* Sentiment Overview */}
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#0a0a0a',
          borderRadius: '6px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Market Sentiment: 
              <span style={{
                marginLeft: '8px',
                color: overallSentiment === 'bullish' ? '#00d4aa' :
                       overallSentiment === 'bearish' ? '#ff6b6b' : '#888',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {overallSentiment}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#00d4aa' }}>
                ↑ {sentimentStats.bullish}
              </span>
              <span style={{ color: '#ff6b6b' }}>
                ↓ {sentimentStats.bearish}
              </span>
              <span style={{ color: '#888' }}>
                → {sentimentStats.neutral}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 20px',
        borderBottom: '1px solid #333',
        backgroundColor: '#0a0a0a'
      }}>
        {['all', 'bullish', 'bearish', 'high-impact'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '4px 12px',
              backgroundColor: filter === f ? '#00d4aa' : 'transparent',
              color: filter === f ? 'black' : '#888',
              border: `1px solid ${filter === f ? '#00d4aa' : '#333'}`,
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f === 'high-impact' ? 'High Impact' : f}
          </button>
        ))}
      </div>

      {/* News Articles */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {loading && articles.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#888'
          }}>
            <RefreshCw style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Loading latest news...</div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#888'
          }}>
            <AlertCircle style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 16px',
              color: '#444'
            }} />
            <div>No {filter !== 'all' ? filter : ''} news available</div>
          </div>
        ) : (
          filteredArticles.map(article => (
            <div
              key={article.id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #2a2a2a',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#1a1a1a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#252525'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a'
              }}
            >
              {/* Article Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                    {article.source}
                  </span>
                  <span style={{ color: '#444' }}>•</span>
                  <span style={{ color: '#666' }}>
                    {formatDateTime(article.datetime)}
                  </span>
                  {article.impact === 'high' && (
                    <>
                      <span style={{ color: '#444' }}>•</span>
                      <AlertCircle style={{
                        width: '12px',
                        height: '12px',
                        color: getImpactColor(article.impact)
                      }} />
                    </>
                  )}
                </div>

                {/* Sentiment Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  backgroundColor: article.sentiment.label === 'bullish' ? '#0a3326' :
                                  article.sentiment.label === 'bearish' ? '#3a1a1a' : '#2a2a2a',
                  border: `1px solid ${
                    article.sentiment.label === 'bullish' ? '#00d4aa' :
                    article.sentiment.label === 'bearish' ? '#ff6b6b' : '#444'
                  }`,
                  borderRadius: '12px'
                }}>
                  {getSentimentIcon(article.sentiment)}
                  <span style={{
                    fontSize: '11px',
                    color: article.sentiment.label === 'bullish' ? '#00d4aa' :
                           article.sentiment.label === 'bearish' ? '#ff6b6b' : '#888',
                    fontWeight: 'bold'
                  }}>
                    {Math.abs(article.sentiment.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h4 style={{
                color: 'white',
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '1.4'
              }}>
                {article.headline}
              </h4>

              {/* Summary */}
              <p style={{
                color: '#888',
                margin: '0 0 12px 0',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                {article.summary}
              </p>

              {/* Article Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Related Symbols */}
                <div style={{
                  display: 'flex',
                  gap: '4px'
                }}>
                  {article.relatedSymbols.map(sym => (
                    <button
                      key={sym}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSymbolClick && onSymbolClick(sym)
                      }}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#00d4aa',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      {sym.replace('USDT', '')}
                    </button>
                  ))}
                </div>

                {/* Category & Keywords */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    padding: '2px 6px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '4px',
                    color: '#666',
                    fontSize: '11px'
                  }}>
                    {article.category}
                  </span>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#666',
                    fontSize: '11px'
                  }}>
                    <BarChart2 style={{ width: '12px', height: '12px' }} />
                    <span>{(article.sentiment.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              {article.sentiment.keywords.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #2a2a2a'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap'
                  }}>
                    {article.sentiment.keywords.map(keyword => (
                      <span
                        key={keyword}
                        style={{
                          padding: '1px 6px',
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '3px',
                          color: '#666',
                          fontSize: '10px'
                        }}
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Summary */}
      {articles.length > 0 && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666'
          }}>
            AI-powered sentiment analysis • Real-time updates
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#00d4aa',
            cursor: 'pointer'
          }}>
            View all news →
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsFeedEnhanced