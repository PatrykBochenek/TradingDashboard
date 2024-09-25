import json
import asyncio
import websockets
import ssl
from channels.generic.websocket import AsyncWebsocketConsumer

class BinanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.binance_task = asyncio.create_task(self.fetch_binance_data())

    async def disconnect(self, close_code):
        self.binance_task.cancel()

    async def fetch_binance_data(self):
        uri = "wss://stream.binance.com:9443/ws/solusdt@kline_1m/solusdt@depth"
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False # ONLY FOR DEVELOPMENT
        ssl_context.verify_mode = ssl.CERT_NONE  # ONLY FOR DEVELOPMENT

        while True:
            try:
                async with websockets.connect(uri, ssl=ssl_context) as websocket:
                    while True:
                        message = await websocket.recv()
                        await self.send(text_data=message)
            except Exception as e:
                print(f"Error in Binance connection: {e}")
                await asyncio.sleep(5) 