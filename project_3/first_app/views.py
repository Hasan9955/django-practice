from django.shortcuts import render

# Create your views here.
def home(request):
    d = {'author': 'Django', 'age': 20, 'list': [1, 2, 3]}
    return render(request, 'first_app/home.html', context=d)