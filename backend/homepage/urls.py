from django.contrib import admin
from django.urls import path, include
from . import views

app_name = 'homepage'

urlpatterns = [
    path(
        "news/<int:pk>/",
        views.NewsDetailView.as_view(),
        name="news_detail"
    ),
    path("", views.HomePageView.as_view(), name="homepage"),
]
