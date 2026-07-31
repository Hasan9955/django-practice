from django.shortcuts import render
import datetime
# Create your views here.

def home(request):
    data = {'author': 'django', 'age': 20, 'list': [1, 2, 3], 'courses': [
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
    # want to make it 04-04-2005
        'birthdate': datetime.datetime(2005, 4, 4),
        'val': "hasan bin ali",
        'profession': "It is Hasan's profession, he is a python learner.",
        'time': datetime.datetime.now(),
        'unorderedlist': ['States', ['Kansas', ['Lawrence', 'Topeka'], 'Illinois']]
    
        }
    return render(request, 'first_app/home.html', context=data)