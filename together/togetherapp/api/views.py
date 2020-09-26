from togetherapp.models import RelationshipTip
from .serializers import RelationshipTipSerializer

from rest_framework.generics import RetrieveAPIView, ListAPIView


class RelationshipTipListView(ListAPIView):
    queryset = RelationshipTip.objects.all()
    serializer_class = RelationshipTipSerializer


class RelationshipTipRetrieveView(RetrieveAPIView):
    queryset = RelationshipTip.objects.all()
    serializer_class = RelationshipTipSerializer

