from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


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