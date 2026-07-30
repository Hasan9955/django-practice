from django.shortcuts import render
import datetime


# Create your views here.
def home(request):
    d = {'author': 'Django', 'age': 20, 'list': [1, 2, 3], 'courses': [
        {
            'id': 1,
            'name': 'Python',
            'price': 100
        },
        {
            'id': 2,
            'name': 'Django',
            'price': 200
        },
        {
            'id': 3,
            'name': 'Flask',
            'price': 300
        }
    ], 

    'new_list': ["Python", "is", "best", "programming", "language"],

    'birthdate': datetime.datetime.now(),
    'val': "hasan bin ali"

    }

    return render(request, 'first_app/home.html', context=d)