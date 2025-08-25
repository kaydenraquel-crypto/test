#!/usr/bin/env python3
"""
Debug the formatting issue
"""
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def debug_format():
    """Debug the formatting issue"""
    try:
        from llm.financial_advisor import AdvancedFinancialAdvisor
        
        # Create mock advisor (without LLM client for testing)
        advisor = AdvancedFinancialAdvisor(None)
        
        # Mock data - minimal to isolate the issue
        sample_indicators = {
            'summary': {
                'last_price': 42500.0,
                'price_change_pct': 2.8
            }
        }
        
        sample_signals = []
        sample_news = []
        
        print("Testing comprehensive analysis...")
        
        # Test comprehensive analysis
        result = await advisor.generate_comprehensive_analysis(
            symbol="BTC/USD",
            market="crypto",
            indicators=sample_indicators,
            signals=sample_signals,
            news=sample_news
        )
        
        print("SUCCESS: No formatting errors!")
        print(f"Result keys: {list(result.keys())}")
        
        if result.get("success"):
            analysis_data = result["analysis_data"]
            print(f"Analysis data keys: {list(analysis_data.keys())}")
            print(f"Market analysis: {analysis_data['market_analysis']}")
            print(f"Key indicators: {analysis_data['key_indicators']}")
            
            # Test the exact formatting that's failing
            key_indicators = analysis_data.get('key_indicators', {})
            print("Testing formatting...")
            print(f"RSI: {key_indicators.get('rsi', 'N/A')}")
            print(f"ADX: {key_indicators.get('adx', 'N/A')}")
            print(f"MACD: {key_indicators.get('macd', 'N/A')}")
            print(f"SuperTrend: {key_indicators.get('supertrend_signal', 'N/A')}")
            
            current_price = analysis_data.get('current_price', 0) or 0
            sentiment_score = analysis_data['market_analysis'].get('sentiment_score', 0) or 0
            print(f"Price: ${current_price:.2f}")
            print(f"Sentiment: {sentiment_score:.3f}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(debug_format())
    sys.exit(0 if success else 1)