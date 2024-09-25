import { useState, useRef, useEffect } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export default function Home() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();

  const { lastJsonMessage, readyState } = useWebSocket('ws://localhost:8000/ws/binance/', {
    onOpen: () => console.log('WebSocket connection opened.'),
    onClose: () => console.log('WebSocket connection closed.'),
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    chartRef.current = createChart(chartContainerRef.current, {
      width: 600,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: 'rgba(33, 56, 77, 1)',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 1)',
      },
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: 'rgb(38,166,154)',
      downColor: 'rgb(255,82,82)',
      borderVisible: false,
      wickUpColor: 'rgb(38,166,154)',
      wickDownColor: 'rgb(255,82,82)',
    });

    return () => {
      chartRef.current.remove();
    };
  }, []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <h1>SOL/USDT Tracker</h1>
      <div>WebSocket Status: {connectionStatus}</div>
      <div ref={chartContainerRef}></div>
    </div>
  );
}
