from django.shortcuts import render, get_object_or_404
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView

from datetime import datetime

from .models import News, Poll
from .constants import NEWS_PAGINATION_NUMBER


class HomePageView(ListView):
    """View класс для главной страницы с новостями и опросами"""

    template_name = "homepage/index.html"

    model = News
    paginate_by = NEWS_PAGINATION_NUMBER

    def get_queryset(self):
        return News.objects.filter(
            is_published=True,
            pub_date__date__lte=datetime.now(),
        ).order_by('-pub_date')

    def get_context_data(self, **kwargs):
        context = super(HomePageView, self).get_context_data(**kwargs)
        context['poll'] = get_object_or_404(Poll)
        return context


class NewsDetailView(DetailView):
    """View класс для новости."""
    template_name = "homepage/news_detail.html"
    model = News

    def get_object(self):
        news = get_object_or_404(
            News,
            pk=self.kwargs['pk']
        )
        return news


class PollDetailView(DetailView):
    pass