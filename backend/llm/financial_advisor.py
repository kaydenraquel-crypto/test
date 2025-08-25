import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import statistics

logger = logging.getLogger(__name__)

@dataclass
class MarketAnalysis:
    symbol: str
    market_outlook: str  # bullish/bearish/neutral
    confidence: float
    key_levels: Dict[str, float]
    sentiment_score: float
    volatility_rating: str
    volume_analysis: str
    trend_strength: str

@dataclass
class TradingRecommendation:
    action: str  # buy/sell/hold/watch
    entry_price: Optional[float]
    stop_loss: Optional[float]
    take_profit: Optional[float]
    position_size: str
    timeframe: str
    risk_level: str
    reasoning: str

@dataclass
class HotMoment:
    symbol: str
    alert_type: str  # breakout/squeeze/reversal/momentum
    urgency: str  # high/medium/low
    description: str
    probability: float
    expected_move: str

class AdvancedFinancialAdvisor:
    def __init__(self, llm_client):
        self.llm_client = llm_client
    
    def analyze_technical_strength(self, indicators: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze technical indicator strength and confluence"""
        try:
            analysis = {
                "momentum_score": 0,
                "trend_score": 0,
                "volatility_score": 0,
                "volume_score": 0,
                "overall_score": 0,
                "confluences": [],
                "warnings": []
            }
            
            # Get latest values
            def get_latest(key):
                if key in indicators and indicators[key]:
                    values = [v for v in indicators[key] if v is not None]
                    return values[-1] if values else None
                return None
            
            # Momentum Analysis
            rsi = get_latest('rsi')
            stoch_k = get_latest('stoch_k')
            williams_r = get_latest('williams_r')
            mfi = get_latest('mfi')
            
            momentum_signals = 0
            momentum_count = 0
            
            if rsi is not None:
                if rsi > 70:
                    momentum_signals -= 2  # Overbought
                    analysis["warnings"].append("RSI overbought (>70)")
                elif rsi < 30:
                    momentum_signals += 2  # Oversold
                    analysis["confluences"].append("RSI oversold (<30)")
                elif 40 <= rsi <= 60:
                    momentum_signals += 1  # Neutral zone
                momentum_count += 1
            
            if stoch_k is not None:
                if stoch_k > 80:
                    momentum_signals -= 1
                elif stoch_k < 20:
                    momentum_signals += 1
                momentum_count += 1
            
            if mfi is not None:
                if mfi > 80:
                    momentum_signals -= 1
                elif mfi < 20:
                    momentum_signals += 1
                momentum_count += 1
            
            analysis["momentum_score"] = momentum_signals / max(momentum_count, 1) * 20
            
            # Trend Analysis
            adx = get_latest('adx')
            ema_8 = get_latest('ema_8')
            ema_21 = get_latest('ema_21')
            ema_50 = get_latest('ema_50')
            supertrend_signal = get_latest('supertrend_signal')
            
            trend_signals = 0
            trend_count = 0
            
            if adx is not None:
                if adx > 25:
                    trend_signals += 2  # Strong trend
                    analysis["confluences"].append(f"Strong trend (ADX: {adx:.1f})")
                elif adx < 20:
                    analysis["warnings"].append("Weak trend environment")
                trend_count += 1
            
            # EMA alignment
            if all(x is not None for x in [ema_8, ema_21, ema_50]):
                if ema_8 > ema_21 > ema_50:
                    trend_signals += 2  # Bullish alignment
                    analysis["confluences"].append("Bullish EMA alignment")
                elif ema_8 < ema_21 < ema_50:
                    trend_signals -= 2  # Bearish alignment
                    analysis["warnings"].append("Bearish EMA alignment")
                trend_count += 1
            
            if supertrend_signal is not None:
                if supertrend_signal > 0:
                    trend_signals += 1
                else:
                    trend_signals -= 1
                trend_count += 1
            
            analysis["trend_score"] = trend_signals / max(trend_count, 1) * 20
            
            # Volatility Analysis
            atr = get_latest('atr')
            bb_width = get_latest('bb_width')
            squeeze = get_latest('squeeze')
            
            volatility_signals = 0
            volatility_count = 0
            
            if squeeze is not None:
                if squeeze == 1:
                    analysis["confluences"].append("Bollinger-Keltner squeeze active")
                    volatility_signals += 2  # Squeeze indicates potential breakout
                volatility_count += 1
            
            if bb_width is not None:
                if bb_width < 5:
                    analysis["confluences"].append("Low volatility environment")
                    volatility_signals += 1
                elif bb_width > 15:
                    analysis["warnings"].append("High volatility environment")
                volatility_count += 1
            
            analysis["volatility_score"] = volatility_signals / max(volatility_count, 1) * 20
            
            # Volume Analysis
            obv = get_latest('obv')
            cmf = get_latest('cmf')
            vol_roc = get_latest('vol_roc')
            
            volume_signals = 0
            volume_count = 0
            
            if cmf is not None:
                if cmf > 0.1:
                    volume_signals += 1
                    analysis["confluences"].append("Positive money flow")
                elif cmf < -0.1:
                    volume_signals -= 1
                    analysis["warnings"].append("Negative money flow")
                volume_count += 1
            
            if vol_roc is not None:
                if vol_roc > 50:
                    volume_signals += 1
                    analysis["confluences"].append("Volume surge detected")
                volume_count += 1
            
            analysis["volume_score"] = volume_signals / max(volume_count, 1) * 20
            
            # Overall Score
            scores = [analysis["momentum_score"], analysis["trend_score"], 
                     analysis["volatility_score"], analysis["volume_score"]]
            analysis["overall_score"] = statistics.mean(scores)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Technical analysis error: {e}")
            return {"error": str(e)}
    
    def detect_hot_moments(self, symbol: str, indicators: Dict[str, Any], 
                          news: List[Dict], price_data: List[Dict]) -> List[HotMoment]:
        """Detect potential high-probability trading opportunities"""
        hot_moments = []
        
        try:
            def get_latest(key):
                if key in indicators and indicators[key]:
                    values = [v for v in indicators[key] if v is not None]
                    return values[-1] if values else None
                return None
            
            # Squeeze Breakout Detection
            squeeze = get_latest('squeeze')
            bb_width = get_latest('bb_width')
            adx = get_latest('adx')
            
            if squeeze == 1 and bb_width is not None and bb_width < 5:
                hot_moments.append(HotMoment(
                    symbol=symbol,
                    alert_type="squeeze",
                    urgency="high",
                    description="Bollinger-Keltner squeeze with low volatility - potential explosive breakout",
                    probability=0.75,
                    expected_move="5-15% directional move expected"
                ))
            
            # Momentum Divergence
            rsi = get_latest('rsi')
            if rsi is not None:
                if rsi < 25:
                    hot_moments.append(HotMoment(
                        symbol=symbol,
                        alert_type="reversal",
                        urgency="medium",
                        description="Extreme oversold conditions - potential reversal opportunity",
                        probability=0.65,
                        expected_move="Bounce expected from oversold levels"
                    ))
                elif rsi > 75:
                    hot_moments.append(HotMoment(
                        symbol=symbol,
                        alert_type="reversal",
                        urgency="medium", 
                        description="Extreme overbought conditions - potential correction",
                        probability=0.65,
                        expected_move="Pullback expected from overbought levels"
                    ))
            
            # Volume Surge with Breakout
            vol_roc = get_latest('vol_roc')
            if vol_roc is not None and vol_roc > 100:
                hot_moments.append(HotMoment(
                    symbol=symbol,
                    alert_type="momentum",
                    urgency="high",
                    description="Volume surge detected - institutional activity likely",
                    probability=0.70,
                    expected_move="Continued momentum in current direction"
                ))
            
            # News Sentiment Extremes
            if news:
                bullish_count = sum(1 for n in news if n.get('sentiment', {}).get('label') == 'bullish')
                bearish_count = sum(1 for n in news if n.get('sentiment', {}).get('label') == 'bearish')
                total_news = len(news)
                
                if total_news > 0:
                    if bullish_count / total_news > 0.8:
                        hot_moments.append(HotMoment(
                            symbol=symbol,
                            alert_type="sentiment",
                            urgency="medium",
                            description="Extremely bullish news sentiment - potential FOMO rally",
                            probability=0.60,
                            expected_move="Short-term bullish momentum"
                        ))
                    elif bearish_count / total_news > 0.8:
                        hot_moments.append(HotMoment(
                            symbol=symbol,
                            alert_type="sentiment",
                            urgency="medium",
                            description="Extremely bearish news sentiment - potential panic selling",
                            probability=0.60,
                            expected_move="Short-term bearish pressure"
                        ))
            
            # SuperTrend Signal Change
            supertrend_signal = get_latest('supertrend_signal')
            if supertrend_signal is not None:
                # Get previous values to detect signal change
                supertrend_values = [v for v in indicators.get('supertrend_signal', []) if v is not None]
                if len(supertrend_values) >= 2:
                    prev_signal = supertrend_values[-2]
                    curr_signal = supertrend_values[-1]
                    
                    if prev_signal != curr_signal:
                        direction = "bullish" if curr_signal > 0 else "bearish"
                        hot_moments.append(HotMoment(
                            symbol=symbol,
                            alert_type="breakout",
                            urgency="high",
                            description=f"SuperTrend signal flip to {direction} - trend change confirmed",
                            probability=0.80,
                            expected_move=f"Strong {direction} momentum expected"
                        ))
            
            return hot_moments
            
        except Exception as e:
            logger.error(f"Hot moment detection error: {e}")
            return []
    
    def generate_trading_strategy(self, symbol: str, market_analysis: MarketAnalysis,
                                indicators: Dict[str, Any], hot_moments: List[HotMoment]) -> TradingRecommendation:
        """Generate specific trading recommendations"""
        try:
            def get_latest(key):
                if key in indicators and indicators[key]:
                    values = [v for v in indicators[key] if v is not None]
                    return values[-1] if values else None
                return None
            
            current_price = indicators.get('summary', {}).get('last_price')
            if not current_price:
                return TradingRecommendation(
                    action="hold",
                    entry_price=None,
                    stop_loss=None,
                    take_profit=None,
                    position_size="0%",
                    timeframe="N/A",
                    risk_level="N/A",
                    reasoning="Insufficient price data"
                )
            
            # Determine action based on analysis
            action = "hold"
            reasoning_parts = []
            
            if market_analysis.market_outlook == "bullish" and market_analysis.confidence > 0.6:
                action = "buy"
                reasoning_parts.append(f"Bullish outlook with {market_analysis.confidence:.0%} confidence")
            elif market_analysis.market_outlook == "bearish" and market_analysis.confidence > 0.6:
                action = "sell"
                reasoning_parts.append(f"Bearish outlook with {market_analysis.confidence:.0%} confidence")
            
            # High-probability hot moments override
            high_urgency_moments = [hm for hm in hot_moments if hm.urgency == "high"]
            if high_urgency_moments:
                moment = high_urgency_moments[0]
                if moment.alert_type in ["breakout", "squeeze"] and moment.probability > 0.7:
                    action = "watch"
                    reasoning_parts.append(f"High-probability {moment.alert_type} setup detected")
            
            # Calculate position sizing based on risk
            volatility_score = market_analysis.volatility_rating
            if volatility_score == "high":
                position_size = "1-2%"
                risk_level = "high"
            elif volatility_score == "medium":
                position_size = "2-5%"
                risk_level = "medium"
            else:
                position_size = "3-7%"
                risk_level = "low"
            
            # Calculate technical levels
            atr = get_latest('atr')
            stop_loss = None
            take_profit = None
            
            if action in ["buy", "sell"] and atr:
                if action == "buy":
                    stop_loss = current_price - (atr * 2)
                    take_profit = current_price + (atr * 3)
                else:
                    stop_loss = current_price + (atr * 2)
                    take_profit = current_price - (atr * 3)
            
            # Determine timeframe
            adx = get_latest('adx')
            if adx and adx > 30:
                timeframe = "medium-term (1-4 weeks)"
            elif hot_moments:
                timeframe = "short-term (1-7 days)"
            else:
                timeframe = "long-term (1-3 months)"
            
            reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Neutral market conditions"
            
            return TradingRecommendation(
                action=action,
                entry_price=current_price if action in ["buy", "sell"] else None,
                stop_loss=stop_loss,
                take_profit=take_profit,
                position_size=position_size,
                timeframe=timeframe,
                risk_level=risk_level,
                reasoning=reasoning
            )
            
        except Exception as e:
            logger.error(f"Strategy generation error: {e}")
            return TradingRecommendation(
                action="hold",
                entry_price=None,
                stop_loss=None,
                take_profit=None,
                position_size="0%",
                timeframe="N/A",
                risk_level="N/A",
                reasoning=f"Error in analysis: {str(e)}"
            )
    
    async def generate_comprehensive_analysis(self, symbol: str, market: str, 
                                            indicators: Dict[str, Any], 
                                            signals: List[Dict], 
                                            news: List[Dict],
                                            price_data: List[Dict] = None) -> Dict[str, Any]:
        """Generate comprehensive financial advisory analysis"""
        try:
            # Technical Analysis
            technical_analysis = self.analyze_technical_strength(indicators)
            
            # Hot Moment Detection
            hot_moments = self.detect_hot_moments(symbol, indicators, news, price_data or [])
            
            # Market Analysis
            current_price = indicators.get('summary', {}).get('last_price', 0)
            price_change = indicators.get('summary', {}).get('price_change_pct', 0)
            
            # Sentiment Analysis
            sentiment_score = 0
            if news:
                sentiment_scores = [n.get('sentiment', {}).get('score', 0) for n in news 
                                 if n.get('sentiment', {}).get('score') is not None]
                sentiment_score = statistics.mean(sentiment_scores) if sentiment_scores else 0
            
            # Determine market outlook
            overall_score = technical_analysis.get('overall_score', 0)
            if overall_score > 10:
                market_outlook = "bullish"
                confidence = min(0.9, (overall_score + 20) / 40)
            elif overall_score < -10:
                market_outlook = "bearish"
                confidence = min(0.9, abs(overall_score + 20) / 40)
            else:
                market_outlook = "neutral"
                confidence = 0.5
            
            # Volatility rating
            bb_width = indicators.get('bb_width', [None])[-1] if indicators.get('bb_width') else None
            if bb_width:
                if bb_width > 15:
                    volatility_rating = "high"
                elif bb_width > 8:
                    volatility_rating = "medium"
                else:
                    volatility_rating = "low"
            else:
                volatility_rating = "unknown"
            
            market_analysis = MarketAnalysis(
                symbol=symbol,
                market_outlook=market_outlook,
                confidence=confidence,
                key_levels={
                    "support": indicators.get('bb_low', [None])[-1] if indicators.get('bb_low') else None,
                    "resistance": indicators.get('bb_high', [None])[-1] if indicators.get('bb_high') else None,
                    "pivot": current_price
                },
                sentiment_score=sentiment_score,
                volatility_rating=volatility_rating,
                volume_analysis="normal",  # Could be enhanced
                trend_strength="medium"    # Could be enhanced
            )
            
            # Generate Trading Strategy
            trading_recommendation = self.generate_trading_strategy(
                symbol, market_analysis, indicators, hot_moments
            )
            
            # Create comprehensive prompt for LLM
            analysis_data = {
                "symbol": symbol,
                "market": market,
                "current_price": current_price,
                "price_change_24h": f"{price_change:.2f}%",
                "technical_analysis": technical_analysis,
                "market_analysis": {
                    "outlook": market_analysis.market_outlook if market_analysis.market_outlook else "neutral",
                    "confidence": f"{market_analysis.confidence:.0%}" if market_analysis.confidence is not None else "50%",
                    "sentiment_score": sentiment_score if sentiment_score is not None else 0,
                    "volatility": volatility_rating if volatility_rating else "unknown"
                },
                "hot_moments": [
                    {
                        "type": hm.alert_type if hm.alert_type else "signal",
                        "urgency": hm.urgency if hm.urgency else "medium",
                        "description": hm.description if hm.description else "Market signal detected",
                        "probability": f"{hm.probability:.0%}" if hm.probability is not None else "50%"
                    } for hm in hot_moments
                ],
                "trading_recommendation": {
                    "action": trading_recommendation.action,
                    "entry_price": trading_recommendation.entry_price,
                    "stop_loss": trading_recommendation.stop_loss,
                    "take_profit": trading_recommendation.take_profit,
                    "position_size": trading_recommendation.position_size,
                    "timeframe": trading_recommendation.timeframe,
                    "risk_level": trading_recommendation.risk_level,
                    "reasoning": trading_recommendation.reasoning
                },
                "key_indicators": {
                    "rsi": indicators.get('rsi', [None])[-1] if indicators.get('rsi') else None,
                    "adx": indicators.get('adx', [None])[-1] if indicators.get('adx') else None,
                    "macd": indicators.get('macd', [None])[-1] if indicators.get('macd') else None,
                    "supertrend_signal": indicators.get('supertrend_signal', [None])[-1] if indicators.get('supertrend_signal') else None
                },
                "recent_signals": signals[-5:] if signals else [],
                "news_summary": {
                    "total_articles": len(news),
                    "bullish_articles": sum(1 for n in news if n.get('sentiment', {}).get('label') == 'bullish'),
                    "bearish_articles": sum(1 for n in news if n.get('sentiment', {}).get('label') == 'bearish'),
                    "key_headlines": [n.get('headline', '')[:100] + "..." for n in news[:3]]
                }
            }
            
            return {
                "success": True,
                "analysis_data": analysis_data,
                "technical_analysis": technical_analysis,
                "hot_moments": [vars(hm) for hm in hot_moments],
                "trading_recommendation": vars(trading_recommendation),
                "market_analysis": vars(market_analysis)
            }
            
        except Exception as e:
            logger.error(f"Comprehensive analysis error: {e}")
            return {
                "success": False,
                "error": str(e),
                "analysis_data": {},
                "technical_analysis": {},
                "hot_moments": [],
                "trading_recommendation": {},
                "market_analysis": {}
            }