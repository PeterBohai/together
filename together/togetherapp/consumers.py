import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import User, List, ListItem


class RoomConsumer(WebsocketConsumer):

    def fetch_lists(self, data):
        user = User.objects.get(username=data['username'])
        lists = List.objects.filter(room=user.room).order_by('-timestamp')
        content = {
            'command': 'fetched_lists',
            'lists': self.lists_to_json(lists)
        }
        self.send_lists(content)

    def get_list_items(self, data):
        target_list = List.objects.get(pk=data['list_id'])
        items = target_list.items.order_by('-timestamp')
        content = {
            'command': 'fetched_list_items',
            'items': self.lists_to_json(items, single_to_json=self.list_item_to_json)
        }
        self.send_lists(content)

    def new_list(self, data):
        user = User.objects.get(username=data['username'])
        created_list = List.objects.create(
            title=data['title'],
            room=user.room
        )
        content = {
            'command': 'new_list',
            'list': self.list_to_json(created_list),
            'username': data['username']
        }
        return self.send_one_list(content)

    def remove_list(self, data):
        list_id = data['list_id']
        List.objects.filter(pk=list_id).delete()
        content = {
            'command': 'removed_list',
            'list_id': list_id
        }
        return self.send_delete_list(content)

    def remove_list_item(self, data):
        item_id = data['item_id']
        item = ListItem.objects.get(pk=item_id)
        content = {
            'command': 'removed_list_item',
            'item_id': item_id,
            'list_id': item.list.id
        }

        item.delete()
        return self.send_delete_list_item(content)

    def new_list_item(self, data):
        target_list = List.objects.get(pk=data['list_id'])
        created_item = ListItem.objects.create(
            list=target_list,
            content=data['content']
        )
        content = {
            'command': 'new_list_item_added',
            'item': self.list_item_to_json(created_item)
        }
        return self.send_one_list(content)

    def update_item_checked(self, data):
        item = ListItem.objects.get(pk=data['item_id'])
        item.checked = not item.checked
        item.save()
        content = {
            'command': 'updated_item_checked',
            'item': self.list_item_to_json(item),
            'username': data['username']
        }
        print('item checked', item.checked)
        return self.send_one_list(content)

    def update_item_content(self, data):
        item = ListItem.objects.get(pk=data['item_id'])
        item.content = data['item_content']
        item.save()
        content = {
            'command': 'updated_item_content',
            'item': self.list_item_to_json(item),
            'list_id': item.list.id,
            'username': data['username']
        }
        return self.send_one_list(content)

    def new_canvas_coords(self, data):
        return self.send_canvas_coords(data)

    # -------------
    # Serializers
    # ------------
    def lists_to_json(self, lists, single_to_json=None):
        if not single_to_json:
            single_to_json = self.list_to_json
        return [single_to_json(one_list) for one_list in lists]

    def list_to_json(self, one_list):
        return {
            'id': one_list.id,
            'title': one_list.title,
            'room': self.room_to_json(one_list.room),
            'timestamp': str(one_list.timestamp)
        }

    def list_item_to_json(self, list_item):
        return {
            'id': list_item.id,
            'list_id': list_item.list.id,
            'content': list_item.content,
            'timestamp': str(list_item.timestamp),
            'checked': list_item.checked,
            'colors': list_item.colors,
            'priority': list_item.priority,
            'due_date': str(list_item.due_date)
        }

    def room_to_json(self, room):
        return {
            'id': room.id,
            'title': room.name,
            'canvasURL': room.canvasDataURL
        }

    # ---------------------
    # Websocket connection
    # ---------------------

    commands = {
        'fetch_lists': fetch_lists,
        'get_list_items': get_list_items,
        'new_list': new_list,
        'remove_list': remove_list,
        'remove_list_item': remove_list_item,
        'new_list_item': new_list_item,
        'update_item_checked': update_item_checked,
        'update_item_content': update_item_content,
        'new_canvas_coords': new_canvas_coords,
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

        data = json.loads(text_data)
        print('TEXT DATA', data['command'])
        self.commands[data['command']](self, data)

    def send_one_list(self, content):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                'type': 'one_list',
                'content': content
            }
        )

    def send_delete_list(self, content):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                'type': 'remove_list',
                'content': content
            }
        )

    def send_delete_list_item(self, content):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                'type': 'remove_list',
                'content': content
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

    def send_lists(self, content):
        """Send content back to only the client that requested (and not broadcast)"""
        self.send(text_data=json.dumps(content))

    # ----------------------------------------------------
    # Receive from room group and send to client WebSocket
    # ---------------------------------------------------

    def one_list(self, event):
        content = event['content']
        self.send(text_data=json.dumps(content))

    def remove_list(self, event):
        content = event['content']
        self.send(text_data=json.dumps(content))

    def canvas_coords(self, event):
        content = event['content']
        self.send(text_data=json.dumps(content))
