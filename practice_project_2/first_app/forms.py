from django import forms

class contactForm(forms.Form):
    name = forms.CharField(label="Username")
    email = forms.EmailField(label="Email")
    age = forms.IntegerField(label="Age")
    # weight = forms.FloatField(label="Weight")
    # balance = forms.DecimalField(label="Balance")
    # check = forms.BooleanField(label="Check")
    # birthday = forms.DateField(label="Birthday")
    # appointment = forms.DateTimeField(label="Appointment")
    # CHOICES = [("S", "Small"), ("M", "Medium"), ("L", "Large")]
    # size = forms.ChoiceField(label="Size", choices=CHOICES)
    # meal = [("p", 'Pepperoni'), ('c', 'Cheese'), ('m', 'Mushroom')]
    # pizza = forms.MultipleChoiceField(label="Pizza", choices=meal, widget=forms.CheckboxSelectMultiple)
    file = forms.FileField(label="File")