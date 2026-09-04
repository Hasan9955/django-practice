from django import forms
from first_app.models import StudentModel

class StudentForm(forms.ModelForm):
    class Meta:
        model = StudentModel

        fields = '__all__'
        # fields = ['roll', 'name']
        # exclude = ['address']

        labels = {
            "roll": "Roll Number",
            "name": "Student Name",
            "address": "Student Address",
        }

        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "roll": forms.NumberInput(attrs={"class": "form-control"}),
            "address": forms.Textarea(attrs={"class": "form-control"}),
        }