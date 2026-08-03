from django.urls import path, include 
from . import views


urlpatterns = [  
    path("", views.index),
    path("sign_up/", views.submit_form),
    path("about/", views.about),
]
