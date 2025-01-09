from django.contrib import admin

from .models import News, Poll, Choice, Attachment


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    inlines = (
        AttachmentInline,
    )


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 1


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    inlines = (
        ChoiceInline,
    )