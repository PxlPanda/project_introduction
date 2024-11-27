import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("bookings", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("bookings", self.channel_name)

    async def booking_update(self, event):
        # Отправляем сообщение клиенту
        await self.send(text_data=json.dumps({
            'type': 'booking_update',
            'data': event['data']
        }))
