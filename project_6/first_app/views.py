from django.shortcuts import render, redirect
from . import models



def home(request):
    students = models.Student.objects.all()
    # print(students)
    return render(request, "home.html", {'data' : students})

def delete_student(request, roll):
    student = models.Student.objects.get(pk=roll)
    student.delete()
    # print("delete", student)
    # students = models.Student.objects.all()
    return redirect('home')
    


# Create your views here.

# def index(request):
#     return render(request, 'first_app/index.html')


# def about(request, id):
#     return render(request, 'first_app/about.html', {'id' : id})


# def contact(request):
#     print(request.GET)
#     return render(request, 'first_app/contact.html', {'id' : request.GET})