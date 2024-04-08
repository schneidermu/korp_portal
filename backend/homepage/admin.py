from django.contrib import admin

from .models import News, Poll, Choice


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    pass


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 1


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    inlines = (
        ChoiceInline,
    )