"use client";
import '../app/globals.css'


import { useState, useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Maximize2 } from 'lucide-react';

export default function TradingDashboard() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [trades, setTrades] = useState([]);
  const [pair, setPair] = useState({ symbol: 'SOL/USDT', price: '155.51', change: '+5.43%' });
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
      return () => {
        chartRef.current.remove();
      };
    }
  }, []);

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
    <div className="min-h-screen bg-[#1a1a1a] text-gray-300 p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Order Book */}
        <Card className="col-span-3 bg-[#1e1e1e] border-[#2a2a2a]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Book</h2>
              <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
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
              {pair.price}
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

        {/* Chart */}
        <Card className="col-span-6 bg-[#1e1e1e] border-[#2a2a2a]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Candlestick Chart</h2>
              <Button variant="ghost" size="icon"><Maximize2 className="h-4 w-4" /></Button>
            </div>
            <div ref={chartContainerRef} className="w-full h-[400px]"></div>
          </CardContent>
        </Card>

        {/* Trades */}
        <Card className="col-span-3 bg-[#1e1e1e] border-[#2a2a2a]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Trades</h2>
              <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2 text-xs">
              {trades.map((trade, index) => (
                <div key={index} className="flex justify-between">
                  <div>{parseFloat(trade.price).toFixed(2)}</div>
                  <div>{parseFloat(trade.amount).toFixed(4)}</div>
                  <div>{trade.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
