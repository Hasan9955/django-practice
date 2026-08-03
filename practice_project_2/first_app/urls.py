from django.urls import path, include 
from . import views


urlpatterns = [  
    path("", views.index),
    path("sign_up/", views.submit_form, name="sign_up"),
    path("about/", views.about, name="about"),
    path("django_form/", views.djangoform, name = "django_form"),
]
