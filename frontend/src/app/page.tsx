"use client";
import './globals.css'

import { useState, useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Maximize2, Search, Menu, Sun, Moon } from 'lucide-react';

export default function TradingDashboard() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [trades, setTrades] = useState([]);
  const [pair, setPair] = useState({ symbol: 'SOL/USDT', price: '155.51', change: '+5.43%' });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);

  const { lastJsonMessage, readyState } = useWebSocket('ws://localhost:8000/ws/binance/', {
    onOpen: () => console.log('WebSocket connection opened.'),
    onClose: () => console.log('WebSocket connection closed.'),
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: (closeEvent) => true,
  });


  
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.e === 'kline') {
        updateCandlestickChart(lastJsonMessage.k);
      } else if (lastJsonMessage.e === 'depthUpdate') {
        updateOrderBook(lastJsonMessage);
      } else if (lastJsonMessage.e === 'trade') {
        updateTrades(lastJsonMessage);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (chartContainerRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: 'solid', color: '#1a1a1a' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: '#2a2a2a',
          timeVisible: true, 
          tickMarkFormatter: (time) => {
            return new Date(time * 1000).toLocaleTimeString();
          },
        },
        rightPriceScale: {
          borderColor: '#2a2a2a',
        },
      });
  
      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
  
      fetchInitialData();
  
      return () => {
        chartRef.current.remove();
      };
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/candlestick');
      if (!response.ok) throw new Error('Failed to fetch candlestick data');
  
      const candlestickData = await response.json();
  
      candlestickSeriesRef.current?.setData(
        candlestickData.map(candle => ({
          time: candle.time / 1000,
          open: parseFloat(candle.open),
          high: parseFloat(candle.high),
          low: parseFloat(candle.low),
          close: parseFloat(candle.close),
        }))
      );
  
      chartRef.current.timeScale.fitContent();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const updateCandlestickChart = (klineData: any) => {
    const { t, o, h, l, c } = klineData;
    const candlestick = {
      time: t / 1000,
      open: parseFloat(o),
      high: parseFloat(h),
      low: parseFloat(l),
      close: parseFloat(c),
    };

    candlestickSeriesRef.current?.update(candlestick);
  };

  const updateOrderBook = (depthData: any) => {
    const { b: bids, a: asks } = depthData;

    setOrderBook(prevOrderBook => {
      const newBids = updatePriceLevel(prevOrderBook.bids, bids);
      const newAsks = updatePriceLevel(prevOrderBook.asks, asks);

      return {
        bids: newBids.slice(0, 10),
        asks: newAsks.slice(0, 10),
      };
    });
  };

  const updatePriceLevel = (currentLevels: any[], updates: any[]) => {
    const updatedLevels = [...currentLevels];

    updates.forEach(([price, quantity]) => {
      price = parseFloat(price);
      quantity = parseFloat(quantity);

      const existingIndex = updatedLevels.findIndex(level => level[0] === price);

      if (existingIndex !== -1) {
        if (quantity === 0) {
          updatedLevels.splice(existingIndex, 1);
        } else {
          updatedLevels[existingIndex] = [price, quantity];
        }
      } else if (quantity > 0) {
        updatedLevels.push([price, quantity]);
      }
    });

    return updatedLevels.sort((a, b) => b[0] - a[0]);
  };

  const updateTrades = (tradeData: any) => {
    setTrades(prevTrades => [
      {
        price: tradeData.p,
        amount: tradeData.q,
        time: new Date(tradeData.T).toLocaleTimeString(),
      },
      ...prevTrades.slice(0, 9), 
    ]);
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-300">
      <header className={`bg-gradient-to-r ${isDarkMode ? 'from-purple-900 to-indigo-800' : 'from-blue-400 to-teal-300'} py-4 px-6 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">
                <span className="animate-pulse">Crypto</span>
                <span className="text-yellow-400">Trade</span>
              </h1>
              <nav className="hidden md:flex space-x-1">
                {['Markets', 'Exchange', 'Wallet', 'Futures'].map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
                  >
                    {item}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search markets"
                  className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <Button variant="outline" className={`${isDarkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-300'} hover:bg-opacity-20 rounded-full transition-all duration-200`}>
                Connect Wallet
              </Button>
              <div className="flex items-center space-x-2">
                <Sun className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-yellow-500'}`} />
                {/* <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                  className={`${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                /> */}
                <Moon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} />
              </div>
              <Button variant="ghost" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto mt-6">
      <div className="flex justify-between items-center my-6 ">
          <h1 className="text-3xl font-bold text-gray-100">{pair.symbol} Trading Dashboard</h1>
          <div className="text-right">
            <div className="text-2xl font-semibold">{pair.price} USDT</div>
            <div className={`text-lg ${pair.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {pair.change}
            </div>
          </div>
        </div>
      <div className="grid grid-cols-12 gap-4 mt-6">
        {/* Order Book */}
        <Card className="col-span-3 bg-[#1e1e1e] border-[#2a2a2a]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-300">Order Book</h2>
              <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2 text-gray-300">
              <div>Price(USDT)</div>
              <div>Amount(SOL)</div>
              <div>Total</div>
            </div>
            <div className="space-y-1">
              {orderBook.asks.slice().reverse().map(([price, amount]) => (
                <div key={price} className="grid grid-cols-3 gap-2 text-xs text-red-400">
                  <div>{parseFloat(price).toFixed(2)}</div>
                  <div>{parseFloat(amount).toFixed(3)}</div>
                  <div>{(parseFloat(price) * parseFloat(amount)).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="my-2 text-center text-lg font-bold text-green-400">
              Pair Price: {pair.price}
            </div>
            <div className="space-y-1">
              {orderBook.bids.map(([price, amount]) => (
                <div key={price} className="grid grid-cols-3 gap-2 text-xs text-green-400">
                  <div>{parseFloat(price).toFixed(2)}</div>
                  <div>{parseFloat(amount).toFixed(3)}</div>
                  <div>{(parseFloat(price) * parseFloat(amount)).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Candlestick Chart */}
        <Card className="col-span-9 bg-[#1e1e1e] border-[#2a2a2a]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-300">SOL/USDT</h2>
              <Button variant="ghost" size="icon"><Maximize2 className="h-4 w-4" /></Button>
            </div>
            <div ref={chartContainerRef} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm">
          Connection to exchange: <span className={connectionStatus === 'Open' ? 'text-green-400' : 'text-red-400'}>{connectionStatus}</span>
        </div>
      </div>
      </div>
    </div>
  );
}
