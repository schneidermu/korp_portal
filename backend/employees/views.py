from django.shortcuts import render
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from .models import Employee


def me(request):
    context = {
        'employee': Employee.objects.get(id=request.user.id)
    }
    return render(request, "employees/employee_detail.html", context)


class UserDetailView(DetailView):
    model = Employee


class UserUpdateView(UpdateView):
    pass