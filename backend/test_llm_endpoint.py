#!/usr/bin/env python3
"""
Test script for the enhanced LLM financial advisor endpoint
"""
import asyncio
import json
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_llm_endpoint():
    """Test the LLM financial advisor functionality"""
    print("Testing Enhanced LLM Financial Advisor...")
    
    try:
        # Import after setting up path
        from llm.financial_advisor import AdvancedFinancialAdvisor
        
        # Create mock advisor (without LLM client for testing)
        advisor = AdvancedFinancialAdvisor(None)
        
        # Mock data
        sample_indicators = {
            'rsi': [60, 65, 70, 75, 72],
            'adx': [25, 28, 30, 32, 35], 
            'macd': [-0.5, -0.2, 0.1, 0.3, 0.2],
            'stoch_k': [75, 80, 85, 82, 78],
            'supertrend_signal': [1, 1, 1, -1, -1],
            'bb_width': [4.2, 3.8, 3.2, 2.9, 2.5],
            'vol_roc': [25, 45, 85, 120, 95],
            'cmf': [0.15, 0.12, 0.08, 0.05, -0.02],
            'squeeze': [0, 0, 1, 1, 0],
            'summary': {
                'last_price': 42500.0,
                'price_change_pct': 2.8,
                'data_points': 100,
                'total_indicators': 45
            }
        }
        
        sample_signals = [
            {'ts': 1640000000, 'type': 'buy', 'price': 42000, 'reason': 'RSI oversold'},
            {'ts': 1640003600, 'type': 'sell', 'price': 43000, 'reason': 'Take profit'}
        ]
        
        sample_news = [
            {
                'headline': 'Bitcoin surges on institutional adoption news',
                'sentiment': {'label': 'bullish', 'score': 0.8, 'confidence': 0.9},
                'source': 'CryptoNews'
            },
            {
                'headline': 'Market volatility expected ahead of Fed meeting',
                'sentiment': {'label': 'neutral', 'score': 0.1, 'confidence': 0.7},
                'source': 'Financial Times'
            }
        ]
        
        print("\nRunning comprehensive analysis...")
        
        # Test comprehensive analysis
        result = await advisor.generate_comprehensive_analysis(
            symbol="BTC/USD",
            market="crypto",
            indicators=sample_indicators,
            signals=sample_signals,
            news=sample_news
        )
        
        if result["success"]:
            print("SUCCESS: Comprehensive analysis successful!")
            
            # Display results
            analysis_data = result["analysis_data"]
            print(f"\nMarket Analysis:")
            print(f"   Symbol: {analysis_data['symbol']}")
            print(f"   Price: ${analysis_data['current_price']:,.2f}")
            print(f"   24h Change: {analysis_data['price_change_24h']}")
            print(f"   Outlook: {analysis_data['market_analysis']['outlook']}")
            print(f"   Confidence: {analysis_data['market_analysis']['confidence']}")
            
            print(f"\nTrading Recommendation:")
            rec = result['trading_recommendation']
            print(f"   Action: {rec['action'].upper()}")
            print(f"   Entry: ${rec['entry_price']:.2f}" if rec['entry_price'] else "   Entry: N/A")
            print(f"   Risk Level: {rec['risk_level']}")
            print(f"   Position Size: {rec['position_size']}")
            print(f"   Timeframe: {rec['timeframe']}")
            
            print(f"\nHot Moments Detected: {len(result['hot_moments'])}")
            for i, hm in enumerate(result['hot_moments'], 1):
                print(f"   {i}. {hm['alert_type'].upper()} ({hm['urgency']} priority)")
                print(f"      {hm['description']}")
                print(f"      Probability: {hm['probability']:.0%}")
            
            print(f"\nTechnical Summary:")
            tech = result['technical_analysis']
            print(f"   Overall Score: {tech.get('overall_score', 0):.1f}/100")
            print(f"   Confluences: {len(tech.get('confluences', []))}")
            print(f"   Warnings: {len(tech.get('warnings', []))}")
            
        else:
            print(f"FAILED: Analysis failed: {result.get('error', 'Unknown error')}")
            return False
            
        print("\nSUCCESS: All tests passed! Enhanced Financial Advisor is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_llm_endpoint())
    if success:
        print("\n✅ Ready to start backend server with: python -m uvicorn main:app --reload --port 8000")
    else:
        print("\n❌ Fix errors before starting the server")
    sys.exit(0 if success else 1)