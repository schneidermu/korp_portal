from django.contrib import admin

from .models import (
    Answer,
    Attachment,
    Choice,
    Comment,
    Course,
    CourseVideo,
    Like,
    News,
    Poll,
    PollGroup,
    PollSubmission,
    Question,
    QuestionDependency,
    Video,
    VideoView,
)


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    """Admin interface for News model."""

    list_display = ("title", "pub_date", "is_published", "created_at")
    list_filter = ("is_published", "organization", "pub_date")
    search_fields = ("title", "text")
    inlines = (AttachmentInline,)
    filter_horizontal = ("organization",)


@admin.register(PollGroup)
class PollGroupAdmin(admin.ModelAdmin):
    """Admin interface for PollGroup model."""

    list_display = ("name", "description")
    search_fields = ("name",)


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3
    fields = ("choice_text", "order")
    ordering = ("order",)


class QuestionDependencyInline(admin.StackedInline):
    model = QuestionDependency
    fk_name = "dependent_question"
    extra = 0
    can_delete = True
    fields = ("trigger_question", "trigger_choice")

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        dependent_question_instance = None
        if request.resolver_match and "object_id" in request.resolver_match.kwargs:
            try:
                dependent_question_id = int(request.resolver_match.kwargs["object_id"])
                dependent_question_instance = Question.objects.get(
                    pk=dependent_question_id,
                )
            except (ValueError, Question.DoesNotExist):
                pass

        if db_field.name == "trigger_question":
            if dependent_question_instance and dependent_question_instance.poll:
                kwargs["queryset"] = Question.objects.filter(
                    poll=dependent_question_instance.poll,
                    order__lt=dependent_question_instance.order,
                ).exclude(pk=dependent_question_instance.pk)
            else:
                kwargs["queryset"] = Question.objects.none()

        if db_field.name == "trigger_choice":
            current_dependency_instance = kwargs.get("instance")

            if (
                current_dependency_instance
                and current_dependency_instance.trigger_question
            ):
                kwargs["queryset"] = Choice.objects.filter(
                    question=current_dependency_instance.trigger_question,
                )
            elif dependent_question_instance and dependent_question_instance.poll:
                possible_trigger_questions = Question.objects.filter(
                    poll=dependent_question_instance.poll,
                    order__lt=dependent_question_instance.order,
                ).exclude(pk=dependent_question_instance.pk)

                kwargs["queryset"] = Choice.objects.filter(
                    question__in=possible_trigger_questions,
                )
            else:
                kwargs["queryset"] = Choice.objects.none()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin interface for Question model."""

    list_display = ("text", "poll_link", "question_type", "order", "is_required")
    list_filter = ("poll__name", "question_type", "is_required")
    search_fields = ("text", "poll__name")
    list_editable = ("order", "is_required")
    ordering = (
        "poll__name",
        "order",
    )
    readonly_fields = ("poll_link",)

    fieldsets = (
        (
            None,
            {"fields": ("poll_link", "text", "question_type", "order", "is_required")},
        ),
        (
            "Настройки для вопросов с выбором",
            {
                "classes": ("collapse",),
                "fields": ("min_choices", "max_choices", "allow_custom_answer"),
            },
        ),
    )

    def poll_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html

        if obj.poll:
            link = reverse("admin:homepage_poll_change", args=[obj.poll.id])
            return format_html('<a href="{}">{}</a>', link, obj.poll.name)
        return "-"

    poll_link.short_description = "Опрос"
    poll_link.admin_order_field = "poll"

    def get_inlines(self, request, obj=None):
        """Динамически определяет инлайны в зависимости от типа вопроса."""
        inlines_to_show = []
        if obj:
            if obj.question_type in [
                Question.QuestionType.SINGLE_CHOICE,
                Question.QuestionType.MULTIPLE_CHOICE,
            ]:
                inlines_to_show.append(ChoiceInline)
            inlines_to_show.append(QuestionDependencyInline)
        else:
            inlines_to_show = [ChoiceInline, QuestionDependencyInline]

        return inlines_to_show

    def get_fieldsets(self, request, obj=None):
        """Динамически скрывает/показывает fieldset для min_choices/max_choices."""
        fieldsets = super().get_fieldsets(request, obj)
        if obj and obj.question_type != Question.QuestionType.MULTIPLE_CHOICE:
            new_fieldsets = [
                fs for fs in fieldsets if fs[0] != "Настройки для вопросов с выбором"
            ]
            return tuple(new_fieldsets)
        return fieldsets


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    show_change_link = True
    fields = (
        "text",
        "question_type",
        "order",
        "initial_value",
        "is_required",
        "min_choices",
        "max_choices",
        "allow_custom_answer",
    )
    ordering = ("order",)
    fk_name = "poll"


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    """Admin interface for Poll model."""

    list_display = (
        "name",
        "author_display",
        "status",
        "kind",
        "poll_group",
        "is_public",
        "pub_date",
        "completion_date",
        "created_at",
    )
    list_filter = (
        "status",
        "is_public",
        "is_anonymous",
        "kind",
        "author",
        "poll_group",
        "organization",
    )
    search_fields = ("name", "description", "author__username", "author__email")
    inlines = [QuestionInline]
    filter_horizontal = ("organization", "editors", "stats_viewers")
    readonly_fields = ("author_display_form",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "description",
                    "author_display_form",
                    "poll_group",
                    "status",
                    "kind",
                ),
            },
        ),
        (
            "Доступность и аудитория",
            {
                "classes": ("collapse",),
                "fields": ("organization", "is_public", "is_anonymous"),
            },
        ),
        (
            "Даты публикации и завершения",
            {
                "fields": ("pub_date", "completion_date"),
            },
        ),
        (
            "Дополнительные права",
            {
                "classes": ("collapse",),
                "fields": ("editors", "stats_viewers"),
            },
        ),
    )

    def author_display(self, obj):
        if obj.author:
            return f"{obj.author.get_full_name() or obj.author.username}"
        return "-"

    author_display.short_description = "Автор"
    author_display.admin_order_field = "author"

    def author_display_form(self, obj):
        if obj and obj.author:
            return f"{obj.author.get_full_name() or obj.author.username}"
        elif obj is None and hasattr(self.request, "user"):  # При создании
            return f"{self.request.user.get_full_name() or self.request.user.username} (будет установлен)"
        return "-"

    author_display_form.short_description = "Автор"

    def get_form(self, request, obj=None, **kwargs):
        self.request = request
        form = super().get_form(request, obj, **kwargs)
        if obj and obj.author and not request.user.is_superuser:
            pass
        return form

    def save_model(self, request, obj, form, change):
        if not change:
            obj.author = request.user
        super().save_model(request, obj, form, change)


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    can_delete = False
    readonly_fields = (
        "question",
        "selected_choices_display",
        "free_text_answer",
        "custom_choice_text",
    )
    fields = (
        "question",
        "selected_choices_display",
        "free_text_answer",
        "custom_choice_text",
    )

    def selected_choices_display(self, obj):
        return ", ".join([choice.choice_text for choice in obj.selected_choices.all()])

    selected_choices_display.short_description = "Выбранные варианты"

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(PollSubmission)
class PollSubmissionAdmin(admin.ModelAdmin):
    """Admin interface for PollSubmission model."""

    list_display = ("poll", "user_display", "submitted_at")
    list_filter = (
        "poll__name",
        "submitted_at",
        ("user", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = (
        "poll__name",
        "user__username",
        "user__email",
        "user__first_name",
        "user__last_name",
    )
    inlines = [AnswerInline]
    readonly_fields = ("poll", "user", "submitted_at")

    def user_display(self, obj):
        if obj.user:
            return f"{obj.user.get_full_name() or obj.user.username}"
        return "Аноним"

    user_display.short_description = "Пользователь"
    user_display.admin_order_field = "user"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    """Admin interface for Video model."""

    list_display = ("name", "author", "pub_date", "is_published")
    list_filter = ("is_published", "author", "pub_date")
    search_fields = ("name", "description", "author__username")
    autocomplete_fields = ("author",)


class CourseVideoInline(admin.TabularInline):
    """Inline for managing videos within a course."""

    model = CourseVideo
    extra = 1
    autocomplete_fields = ("video",)
    ordering = ("order",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin interface for Course model."""

    list_display = ("name", "author", "pub_date", "is_published")
    list_filter = ("is_published", "author", "pub_date")
    search_fields = ("name", "description", "author__username")
    inlines = (CourseVideoInline,)
    autocomplete_fields = ("author",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Admin interface for video comments. Read-only."""

    list_display = ("video", "user", "pub_date", "short_text")
    list_filter = (("video", admin.RelatedOnlyFieldListFilter), "pub_date")
    search_fields = ("text", "user__username", "video__name")
    readonly_fields = ("video", "user", "text", "pub_date")

    def short_text(self, obj):
        return obj.text[:75] + "..." if len(obj.text) > 75 else obj.text

    short_text.short_description = "Текст комментария"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    """Admin interface for video views. Read-only log."""

    list_display = ("video", "user", "viewed_at")
    list_filter = (("video", admin.RelatedOnlyFieldListFilter), "viewed_at")
    search_fields = ("user__username", "video__name")
    readonly_fields = ("video", "user", "viewed_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    """Admin interface for video likes. Read-only log."""

    list_display = ("video", "user", "created_at")
    list_filter = (("video", admin.RelatedOnlyFieldListFilter), "created_at")
    search_fields = ("user__username", "video__name")
    readonly_fields = ("video", "user", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
