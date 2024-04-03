from django.contrib import admin

from .models import News, Poll, Choice


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    pass


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    pass


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    pass