from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    Career,
    Characteristic,
    Competence,
    Conference,
    Course,
    Diploma,
    Employee,
    Hobby,
    Organization,
    Performance,
    Rating,
    Reward,
    Sport,
    StructuralSubdivision,
    Training,
    University,
    Victory,
    Volunteer,
)


@admin.register(Employee)
class EmployeeAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            "Общая информация",
            {
                "fields": (
                    "name",
                    "surname",
                    "patronym",
                    "chief",
                    "structural_division",
                    "birth_date",
                    "telephone_number",
                    "job_title",
                    "class_rank",
                    "status",
                    "avatar",
                    "agreed_with_data_processing",
                )
            },
        ),
    )


# Инлайны для характеристики сотрудника
class CourseInline(admin.TabularInline):
    model = Course
    extra = 1


class DiplomaInline(admin.TabularInline):
    model = Diploma
    extra = 1


class UniversityInline(admin.TabularInline):
    model = University
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
        DiplomaInline,
        UniversityInline,
    )


class CharacteristicLinkInline(admin.TabularInline):
    model = Characteristic
    show_change_link = True


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    pass


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    pass


@admin.register(StructuralSubdivision)
class StructuralSubdivisionAdmin(admin.ModelAdmin):
    pass


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    pass
