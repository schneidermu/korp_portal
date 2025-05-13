from django.db.models import Q
from django_filters.rest_framework import FilterSet, NumberFilter
from employees.models import Competence


class CompetenceFilter(FilterSet):
    min_characteristic_count = NumberFilter(method="filter_by_min_count_or_important")

    class Meta:
        model = Competence
        fields = []

    def filter_by_min_count_or_important(self, queryset, name, value):
        """
        Filters competences based on min_characteristic_count or if they are important.
        Logic: (skill for skill in skills if min_count is None or is_important or count >= min_count)
        """
        try:
            min_count = int(value)
        except (ValueError, TypeError):
            return queryset

        return queryset.filter(
            Q(is_important=True) | Q(characteristic_count__gte=min_count)
        )
