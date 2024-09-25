import json
import asyncio
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer

class BinanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        asyncio.create_task(self.fetch_binance_data())

    async def disconnect(self, close_code):
        pass

    async def fetch_binance_data(self):
        uri = "wss://stream.binance.com:9443/ws/solusdt@kline_1m/solusdt@depth"
        async with websockets.connect(uri) as websocket:
            while True:
                message = await websocket.recv()
                await self.send(text_data=message)
