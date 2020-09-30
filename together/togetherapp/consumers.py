import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Message, User


class RoomConsumer(WebsocketConsumer):

    def fetch_messages(self, data):
        messages = Message.objects.order_by('-timestamp').all()[:5]
        content = {
            'command': 'messages',
            'messages': self.messages_to_json(messages)
        }
        self.send_messages(content)

    def new_message(self, data):
        author = data['from']
        author_user = User.objects.get(username='PeterBohai')
        message = Message.objects.create(
            author=author_user,
            content=data['message'])
        content = {
            'command': 'new_message',
            'message': self.message_to_json(message)
        }
        return self.send_one_message(content)

    def new_canvas_coords(self, data):
        return self.send_canvas_coords(data)

    def messages_to_json(self, messages):
        result = []
        for message in messages:
            result.append(self.message_to_json(message))
        return result

    def message_to_json(self, message):
        return {
            'id': message.id,
            'author': message.author.username,
            'content': message.content,
            'timestamp': str(message.timestamp)
        }

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message,
        'new_canvas_coords': new_canvas_coords
    }

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # ---------------------------------------------------------------
    # Receive from WebSocket and send to other servers in the same group
    # ----------------------------------------------------------------
    def receive(self, text_data):
        print('TEXT DATA', text_data)
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    def send_one_message(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'one_message',
                'message': message
            }
        )

    def send_canvas_coords(self, content):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'canvas_coords',
                'content': content
            }
        )

    # ---------------------------------------------
    # Receive from room group and send to WebSocket
    # ---------------------------------------------
    def send_messages(self, message):
        self.send(text_data=json.dumps(message))

    def one_message(self, event):
        message = event['message']
        self.send(text_data=json.dumps(message))

    def canvas_coords(self, event):
        content = event['content']
        self.send(text_data=json.dumps(content))
