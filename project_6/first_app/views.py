from django.shortcuts import render
from . import models



def home(request):
    students = models.Student.objects.all()

    return render(request, "home.html")


# Create your views here.

# def index(request):
#     return render(request, 'first_app/index.html')


# def about(request, id):
#     return render(request, 'first_app/about.html', {'id' : id})


# def contact(request):
#     print(request.GET)
#     return render(request, 'first_app/contact.html', {'id' : request.GET})