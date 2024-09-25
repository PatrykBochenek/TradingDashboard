import { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export default function Home() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const { lastJsonMessage, readyState } = useWebSocket('ws://localhost:8000/ws/binance/', {
    onOpen: () => console.log('WebSocket connection opened.'),
    onClose: () => console.log('WebSocket connection closed.'),
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: (closeEvent) => true,
  });

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
    </div>
  );
}
