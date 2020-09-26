from rest_framework import serializers
from togetherapp.models import RelationshipTip


class RelationshipTipSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='get_category_display')

    class Meta:
        model = RelationshipTip
        fields = ["title", "content", "shown", "category"]
