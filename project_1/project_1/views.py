# project_1/project_1/views.py
from django.http import HttpResponse


def home(request):
    return HttpResponse("This is Home page!")

def contact(request):
    return HttpResponse("Contact page!")
