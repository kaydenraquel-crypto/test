"""
Test script for Alpha Vantage API integration
"""
import asyncio
import os
import sys
from dotenv import load_dotenv
from connectors.stocks_alpha_vantage import AlphaVantageConnector

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

load_dotenv()

async def test_alpha_vantage():
    """Test Alpha Vantage API connection and basic functionality"""
    
    print("🔧 Testing Alpha Vantage Integration...")
    print("=" * 50)
    
    # Check API key
    api_key = os.getenv('ALPHA_VANTAGE_KEY') or os.getenv('ALPHA_VANTAGE_API_KEY')
    if not api_key:
        print("❌ ERROR: Alpha Vantage API key not found in environment variables")
        print("Please set ALPHA_VANTAGE_KEY in your .env file")
        return
    
    print(f"✅ API Key found: {api_key[:8]}...")
    
    connector = AlphaVantageConnector()
    
    # Test 1: Get Quote
    print("\n📊 Test 1: Getting quote for AAPL...")
    try:
        quote = await connector.get_quote('AAPL')
        if quote:
            print(f"✅ Quote retrieved successfully:")
            print(f"   Symbol: {quote.get('symbol')}")
            print(f"   Price: ${quote.get('price')}")
            print(f"   Change: {quote.get('change')} ({quote.get('change_percent')}%)")
            print(f"   Volume: {quote.get('volume'):,}")
        else:
            print("⚠️ No quote data returned")
    except Exception as e:
        print(f"❌ Error getting quote: {str(e)}")
    
    # Wait to respect rate limits
    print("\n⏳ Waiting 12 seconds for rate limit...")
    await asyncio.sleep(12)
    
    # Test 2: Get Daily Data
    print("\n📈 Test 2: Getting daily data for MSFT...")
    try:
        daily = await connector.get_daily('MSFT', 'compact')
        if daily and daily.get('data'):
            print(f"✅ Daily data retrieved successfully:")
            print(f"   Symbol: {daily.get('symbol')}")
            print(f"   Data points: {len(daily.get('data', []))}")
            if daily['data']:
                latest = daily['data'][0]
                print(f"   Latest date: {latest.get('date')}")
                print(f"   Close: ${latest.get('close')}")
        else:
            print("⚠️ No daily data returned")
    except Exception as e:
        print(f"❌ Error getting daily data: {str(e)}")
    
    # Wait to respect rate limits
    print("\n⏳ Waiting 12 seconds for rate limit...")
    await asyncio.sleep(12)
    
    # Test 3: Get RSI Indicator
    print("\n📊 Test 3: Getting RSI for GOOGL...")
    try:
        rsi = await connector.get_rsi('GOOGL', 'daily', 14)
        if rsi and rsi.get('data'):
            print(f"✅ RSI data retrieved successfully:")
            print(f"   Symbol: {rsi.get('symbol')}")
            print(f"   Indicator: {rsi.get('indicator')}")
            print(f"   Data points: {len(rsi.get('data', []))}")
            if rsi['data']:
                latest = rsi['data'][0]
                print(f"   Latest RSI: {latest.get('RSI', 'N/A')}")
        else:
            print("⚠️ No RSI data returned")
    except Exception as e:
        print(f"❌ Error getting RSI: {str(e)}")
    
    # Wait to respect rate limits
    print("\n⏳ Waiting 12 seconds for rate limit...")
    await asyncio.sleep(12)
    
    # Test 4: Symbol Search
    print("\n🔍 Test 4: Searching for 'Tesla'...")
    try:
        results = await connector.search_symbols('Tesla')
        if results:
            print(f"✅ Search results found: {len(results)} matches")
            for i, result in enumerate(results[:3], 1):
                print(f"   {i}. {result.get('symbol')} - {result.get('name')}")
                print(f"      Type: {result.get('type')}, Region: {result.get('region')}")
        else:
            print("⚠️ No search results found")
    except Exception as e:
        print(f"❌ Error searching symbols: {str(e)}")
    
    # Wait to respect rate limits
    print("\n⏳ Waiting 12 seconds for rate limit...")
    await asyncio.sleep(12)
    
    # Test 5: Company Overview
    print("\n🏢 Test 5: Getting company overview for AAPL...")
    try:
        overview = await connector.get_company_overview('AAPL')
        if overview:
            print(f"✅ Company overview retrieved successfully:")
            print(f"   Company: {overview.get('name')}")
            print(f"   Sector: {overview.get('sector')}")
            print(f"   Industry: {overview.get('industry')}")
            print(f"   Market Cap: {overview.get('market_cap')}")
            print(f"   P/E Ratio: {overview.get('pe_ratio')}")
        else:
            print("⚠️ No company overview data returned")
    except Exception as e:
        print(f"❌ Error getting company overview: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Alpha Vantage integration tests completed!")
    print("\nNOTE: If you see rate limit errors, wait 1 minute and try again.")
    print("The free tier allows 5 API calls per minute and 500 per day.")

async def main():
    """Main function with proper cleanup"""
    connector = AlphaVantageConnector()
    async with connector:
        await test_alpha_vantage()

if __name__ == "__main__":
    asyncio.run(main())