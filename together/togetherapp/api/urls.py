from django.urls import path
from . import views

urlpatterns = [
    path('newquizquestions/<str:username>', views.new_questions, name='new_questions'),
    path('user-info/<str:username>', views.user_info, name='user_info'),
    path('recordanswer/<str:username>', views.record_answer, name='record_answer'),
    path('', views.RelationshipTipListView.as_view(), name='all_relationship_tips'),
    path('daily-tip/', views.relationship_tip, name='relationship_tip')
]