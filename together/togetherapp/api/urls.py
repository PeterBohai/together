from django.urls import path
from . import views

urlpatterns = [
    path('', views.RelationshipTipListView.as_view()),
    path('<pk>', views.RelationshipTipRetrieveView.as_view())
]