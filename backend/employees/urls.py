from django.urls import path, include
from .views import UserDetailView, UserUpdateView, me

app_name = 'employees'

urlpatterns = [
    path("me/", me, name='me'),
    path("<int:pk>/", UserDetailView.as_view(), name='employee'),
    path("<int:pk>/edit", UserUpdateView.as_view()),
]
