from django.contrib.auth.models import AbstractUser
from django.db import models


class Room(models.Model):
    name = models.CharField(max_length=100)
    canvasDataURL = models.TextField(default=' ', blank=True)

    def __str__(self):
        return f"{self.pk}: {self.name}"


class List(models.Model):
    title = models.CharField(max_length=100)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='lists')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.pk}: {self.title} [Room: {self.room.name}]"


class ListItem(models.Model):
    HIGH = 1
    MEDIUM = 2
    LOW = 3
    NONE = 0

    RED = '#eb0000'
    PINK = '#ff94f8'
    BLUE = '#369aff'
    GREEN = '#1dcf0c'
    BLACK = '#000000'

    PRIORITY_CHOICES = [
        (HIGH, 'High'),
        (MEDIUM, 'Medium'),
        (LOW, 'Low'),
        (NONE, 'None')
    ]

    COLOR_CHOICES = [
        (RED, 'Red'),
        (PINK, 'Pink'),
        (BLUE, 'Blue'),
        (GREEN, 'Green'),
        (BLACK, 'Black')
    ]

    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='items')
    content = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    checked = models.BooleanField(default=False)

    # Optional fields
    colors = models.CharField(choices=COLOR_CHOICES, blank=True, max_length=7)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, blank=True, default=NONE)
    due_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.pk}: {self.content[:12] + ('...' if len(self.content) > 12 else '')} [{self.list.title}]"


def get_default_room_pk():
    return Room.objects.create(name='room').pk


class User(AbstractUser):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants', default=get_default_room_pk)


class Category:
    INFORMATION = 'INF'
    COMMUNICATION = 'COM'
    SEX = 'SEX'
    EMOTIONAL = 'EMT'
    RECREATION = 'REC'
    RESPONSIBILITY = 'RES'


class RelationshipTip(models.Model):

    CATEGORY_CHOICES = [
        (Category.INFORMATION, 'Information'),
        (Category.COMMUNICATION, 'Communication'),
        (Category.SEX, 'Sex'),
        (Category.EMOTIONAL, 'Emotional'),
        (Category.RECREATION, 'Recreation'),
        (Category.RESPONSIBILITY, 'Responsibility')
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    shown = models.BooleanField(default=False)
    category = models.CharField(
        max_length=3,
        choices=CATEGORY_CHOICES,
        default=Category.INFORMATION,
    )

    def __str__(self):
        return f"{self.pk}: {self.category}: {self.title}"


class QuizQuestion(models.Model):

    CATEGORY_CHOICES = [
        (Category.INFORMATION, 'Information'),
        (Category.COMMUNICATION, 'Communication'),
        (Category.SEX, 'Sex'),
        (Category.EMOTIONAL, 'Emotional'),
        (Category.RECREATION, 'Recreation'),
        (Category.RESPONSIBILITY, 'Responsibility')
    ]

    category = models.CharField(
        max_length=3,
        choices=CATEGORY_CHOICES,
        default=Category.INFORMATION,
    )
    question = models.CharField(max_length=200)
    option1 = models.CharField(max_length=100)
    option2 = models.CharField(max_length=100)
    option3 = models.CharField(max_length=100)
    option4 = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.pk}: {self.question}"


class QuizAnswer(models.Model):
    OPTION_1 = 1
    OPTION_2 = 2
    OPTION_3 = 3
    OPTION_4 = 4
    ANSWER_CHOICES = [
        (OPTION_1, 'Option 1'),
        (OPTION_2, 'Option 2'),
        (OPTION_3, 'Option 3'),
        (OPTION_4, 'Option 4'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_quiz_answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='question_answers')
    answer = models.IntegerField(choices=ANSWER_CHOICES, blank=False)
    partner_answered = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[pk: {self.pk}] [user:{self.user.username}] [question fk: {self.question.pk}]"


class Message(models.Model):
    author = models.ForeignKey(User, related_name='author_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.author.username

    def last_10_messages(self):
        return Message.objects.order_by('-timestamp').all()[:10]
