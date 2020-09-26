from django.contrib import admin
from .models import User, RelationshipTip


class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "first_name", "last_name")


class RelationshipTipAdmin(admin.ModelAdmin):
    list_display = ("pk", "category", "title")


admin.site.register(User, UserAdmin)
admin.site.register(RelationshipTip, RelationshipTipAdmin)
