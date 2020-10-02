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


class User(AbstractUser):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants', null=True, blank=True)


class RelationshipTip(models.Model):
    INFORMATION = 'INF'
    COMMUNICATION = 'COM'
    SEX = 'SEX'
    EMOTIONAL = 'EMT'
    RECREATION = 'REC'
    RESPONSIBILITY = 'RES'

    CATEGORY_CHOICES = [
        (INFORMATION, 'Information'),
        (COMMUNICATION, 'Communication'),
        (SEX, 'Sex'),
        (EMOTIONAL, 'Emotional'),
        (RECREATION, 'Recreation'),
        (RESPONSIBILITY, 'Responsibility')
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    shown = models.BooleanField(default=False)
    category = models.CharField(
        max_length=3,
        choices=CATEGORY_CHOICES,
        default=INFORMATION,
    )

    def __str__(self):
        return f"{self.pk}: {self.category}: {self.title}"


class Message(models.Model):
    author = models.ForeignKey(User, related_name='author_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.author.username

    def last_10_messages(self):
        return Message.objects.order_by('-timestamp').all()[:10]
