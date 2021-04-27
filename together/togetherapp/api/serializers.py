from rest_framework import serializers
from togetherapp.models import User
from togetherapp.models import RelationshipTip


class RelationshipTipSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='get_category_display')

    class Meta:
        model = RelationshipTip
        fields = ["title", "content", "shown", "category"]


# Custom serializer for rest-auth/user endpoint
class UserDetailsSerializer(serializers.ModelSerializer):

    # Give the "room" field of User the alias of "room_id"
    room_id = serializers.IntegerField(source='room.pk')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'room_id')
        read_only_fields = ('email', )
