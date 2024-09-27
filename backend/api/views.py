from binance.client import Client
from django.http import JsonResponse
import os

client = Client(api_key=os.getenv('BINANCE_API_KEY'), api_secret=os.getenv('BINANCE_API_SECRET'))

def get_candlestick_data(request):
    symbol = request.GET.get('symbol', 'SOLUSDT')  
    interval = request.GET.get('interval', '1m') 

    klines = client.get_klines(symbol=symbol, interval=interval)

    response_data = []
    for kline in klines:
        kline_data = {
            'open_time': kline[0],
            'open': kline[1],
            'high': kline[2],
            'low': kline[3],
            'close': kline[4],
            'volume': kline[5],
            'close_time': kline[6]
        }
        response_data.append(kline_data)

    return JsonResponse(response_data, safe=False)
