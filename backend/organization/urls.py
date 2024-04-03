from django.contrib import admin
from django.urls import path, include
from .views import OrganizationListView

app_name = 'organization'

urlpatterns = [
    path("", OrganizationListView.as_view(), name="organization"),
]
