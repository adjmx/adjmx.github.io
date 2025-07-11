
import React, { useState, useEffect } from 'react';
import { Bitcoin, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

interface CurrencyRate {
  symbol: string;
  name: string;
  rate: number;
  satoshisPerUnit: number;
  flag: string;
}

const BitcoinConverter = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currencies = [
    { symbol: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { symbol: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { symbol: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { symbol: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { symbol: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { symbol: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { symbol: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' }
  ];

  const fetchBitcoinRates = async () => {
    try {
      setError(null);
      console.log('Fetching Bitcoin rates...');
      
      // Using CoinGecko API (free, no API key required)
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp,jpy,cad,aud,chf,cny'
      );
      
      console.log('API Response:', response.data);
      
      const bitcoinPrices = response.data.bitcoin;
      const SATOSHIS_PER_BITCOIN = 100000000; // 100 million satoshis = 1 Bitcoin
      
      const newRates: CurrencyRate[] = currencies.map(currency => {
        const price = bitcoinPrices[currency.symbol.toLowerCase()];
        const satoshisPerUnit = price ? Math.round(SATOSHIS_PER_BITCOIN / price) : 0;
        
        return {
          symbol: currency.symbol,
          name: currency.name,
          rate: price || 0,
          satoshisPerUnit,
          flag: currency.flag
        };
      });
      
      setRates(newRates);
      setLastUpdated(new Date());
      console.log('Rates updated successfully');
    } catch (err) {
      console.error('Error fetching Bitcoin rates:', err);
      setError('Failed to fetch current rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinRates();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBitcoinRates, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Bitcoin className="h-12 w-12 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold text-white">Satoshi Converter</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Real-time Bitcoin conversion rates in satoshis per currency unit
          </p>
          {lastUpdated && (
            <p className="text-slate-500 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={fetchBitcoinRates}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh Rates'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Currency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rates.map((rate) => (
            <Card key={rate.symbol} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{rate.flag}</span>
                    <span className="font-mono font-bold">{rate.symbol}</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">{rate.name}</p>
                  <p className="text-white text-lg font-mono">
                    {rate.rate > 0 ? formatPrice(rate.rate, rate.symbol) : 'Loading...'}
                  </p>
                </div>
                
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">Satoshis per 1 {rate.symbol}</p>
                  <p className="text-orange-400 text-xl font-bold font-mono">
                    {rate.satoshisPerUnit > 0 ? formatNumber(rate.satoshisPerUnit) : 'Loading...'}
                    <span className="text-sm text-slate-400 ml-1">sats</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center">
          <Card className="bg-slate-800/30 border-slate-700 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-orange-500 mr-2" />
                <h3 className="text-xl font-semibold text-white">What are Satoshis?</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                A satoshi is the smallest unit of Bitcoin, named after its creator Satoshi Nakamoto. 
                One Bitcoin equals 100,000,000 satoshis. This converter shows how many satoshis 
                you can get for one unit of each major currency, making it easier to understand 
                Bitcoin's purchasing power in familiar terms.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm pb-8">
          <p>Data provided by CoinGecko API • Updates every 30 seconds</p>
        </footer>
      </div>
    </div>
  );
};

export default BitcoinConverter;
