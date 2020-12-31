import datetime
import random
import pprint
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser
from rest_framework import permissions
from rest_framework import status
from django.http.response import JsonResponse
from togetherapp.models import RelationshipTip, QuizQuestion, QuizAnswer, User, Room
from .serializers import RelationshipTipSerializer

from rest_framework.generics import RetrieveAPIView, ListAPIView


class RelationshipTipListView(ListAPIView):
    queryset = RelationshipTip.objects.all()
    serializer_class = RelationshipTipSerializer


class RelationshipTipRetrieveView(RetrieveAPIView):
    queryset = RelationshipTip.objects.all()
    serializer_class = RelationshipTipSerializer

@api_view()
@permission_classes((permissions.AllowAny,))
def relationship_tip(request):
    tip = random.choice(RelationshipTip.objects.all())
    serializer = RelationshipTipSerializer(tip)
    return JsonResponse(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes((permissions.AllowAny,))
def user_info(request, username):
    if request.method == 'GET':
        user = User.objects.get(username=username)
        return JsonResponse({
            'user_room_pk': user.room.pk
        })
    elif request.method == 'PUT':
        room_data = JSONParser().parse(request)
        user = User.objects.get(username=username)
        user.room = Room.objects.get(pk=room_data['user_room_pk'])
        user.save()
        return JsonResponse({'status': 'success'})


@api_view()
@permission_classes((permissions.AllowAny,))
def new_questions(request, username):
    user = User.objects.get(username=username)
    user_partner = user.room.participants.exclude(pk=user.pk).first()

    user_answered_questions = user.user_quiz_answers.all()
    partner_answered_questions = user_partner.user_quiz_answers.all()
    both_answered_questions = user_answered_questions.union(partner_answered_questions).values('question')

    # Select all rows that were not part of answered_questions
    unanswered_questions = QuizQuestion.objects.exclude(id__in=both_answered_questions)
    # Pull a number of questions from user's partner's answered questions
    partner_answered_user_not_question_ids = partner_answered_questions.exclude(id__in=user_answered_questions).values('question')
    partner_answered_user_not = QuizQuestion.objects.filter(id__in=partner_answered_user_not_question_ids)

    # Get a number of random questions
    random_unanswered_questions = []
    if len(unanswered_questions) >= 2:
        random_unanswered_questions = random.sample(list(unanswered_questions), 2)
    elif len(unanswered_questions) == 1:
        random_unanswered_questions = list(unanswered_questions)

    random_partner_answered_questions = []
    if len(partner_answered_user_not) >= 2:
        random_partner_answered_questions = random.sample(list(partner_answered_user_not), 2)
    elif len(partner_answered_user_not) == 1:
        random_partner_answered_questions = list(partner_answered_user_not)

    # Manually serialize into a list and mark each question as answered by partner or not
    new_questions_data = []

    for i, quiz_question in enumerate(random_unanswered_questions + random_partner_answered_questions):
        data = {
            'question_pk': quiz_question.pk,
            'question': quiz_question.question,
            'category': quiz_question.get_category_display(),
            'option1': quiz_question.option1,
            'option2': quiz_question.option2,
            'option3': quiz_question.option3,
            'option4': quiz_question.option4,
            'partner_answered': False,
            'guess_answer': False,
            'timestamp': datetime.datetime.now()
        }
        new_questions_data.append(data)

        if i >= len(random_unanswered_questions):
            data['partner_answered'] = True

            data_copy = data.copy()
            data_copy['guess_answer'] = True
            new_questions_data.append(data_copy)

    pprint.pprint(new_questions_data)
    return JsonResponse(new_questions_data, safe=False)


@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def record_answer(request, username):
    incoming_data = JSONParser().parse(request)

    user = User.objects.get(username=username)
    question = QuizQuestion.objects.get(pk=incoming_data['question_pk'])
    answer = incoming_data['answer_number']

    # Check what answer partner got
    partner_answer = -1
    print(incoming_data)
    if incoming_data['guess_answer']:
        user_partner = user.room.participants.exclude(pk=user.pk).first()
        partner_answer = user_partner.user_quiz_answers.filter(question=question).first().answer

    # Save answer for user
    try:
        quiz_answer = QuizAnswer(user=user, question=question, answer=answer)
        quiz_answer.save()
        return JsonResponse({'partner_answer': partner_answer}, status=status.HTTP_201_CREATED)
    except:
        return JsonResponse({'error': 'error'}, status=status.HTTP_400_BAD_REQUEST)
