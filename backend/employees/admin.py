from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.safestring import mark_safe

from .models import Employee, Organization, Rating, Characteristic, Course, Career, Competence, Training, Hobby, Reward, Conference, Victory, Performance, Sport, Volunteer


class EmployeeInline(admin.StackedInline):
    model = Employee
    can_delete = False

# Инлайны для характеристики сотрудника
class CourseInline(admin.TabularInline):
    model = Course
    extra = 1


class CareerInline(admin.TabularInline):
    model = Career
    extra = 1


class CompetenceInline(admin.TabularInline):
    model = Competence
    extra = 1


class TrainingInline(admin.TabularInline):
    model = Training
    extra = 1


class HobbyInline(admin.TabularInline):
    model = Hobby
    extra = 1


class RewardInline(admin.TabularInline):
    model = Reward
    extra = 1


class ConferenceInline(admin.TabularInline):
    model = Conference
    extra = 1


class VictoryInline(admin.TabularInline):
    model = Victory
    extra = 1


class PerformanceInline(admin.TabularInline):
    model = Performance
    extra = 1


class SportInline(admin.TabularInline):
    model = Sport
    extra = 1


class VolunteerInline(admin.TabularInline):
    model = Volunteer
    extra = 1


@admin.register(Characteristic)
class CharacteristicAdmin(admin.ModelAdmin):
    inlines = (
        CourseInline,
        CareerInline,
        CompetenceInline,
        TrainingInline,
        HobbyInline,
        RewardInline,
        ConferenceInline,
        PerformanceInline,
        SportInline,
        VolunteerInline,
    )

    list_display = ('fio', 'average_rating')

    def average_rating(self, obj):
        return obj.employee.average_rating

    def fio(self, obj):
        return obj.employee.fio

    def organization(self, obj):
        return obj.employee.organization

    fio.short_description = "ФИО"
    average_rating.short_description = "Рейтинг"


class CharacteristicLinkInline(admin.TabularInline):
    model = Characteristic
    show_change_link = True


class UserAdmin(BaseUserAdmin):
    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        new = []
        for name, fields_dict in fieldsets:
            if fields_dict['fields'] == ('first_name', 'last_name', 'email'):
                fields_dict['fields'] = ('email',)
            new.append((name, fields_dict))
        return new
    inlines = (
        EmployeeInline,
    )
    list_display = ('information', 'email', 'is_staff', 'status', 'characteristic_link')

    def characteristic_link(self, obj):
        if obj.information.characteristic:
            return mark_safe(
                '<a href="../../employees/characteristic/%s">Ссылка</a>' % obj.information.id
            )
    def status(self, obj):
        return obj.information.status

    characteristic_link.short_description = "Характеристика"
    status.short_description = "Статус"


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    pass


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    pass

