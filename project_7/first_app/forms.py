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
            "email": "Student Email",
        }

        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "roll": forms.NumberInput(attrs={"class": "form-control"}),
            "address": forms.Textarea(attrs={"class": "form-control"}),
            "email": forms.EmailInput(attrs={"class": "form-control"}),
        }

        help_texts = {
            "roll": "Enter your roll number",
            "name": "Enter your name",
            "address": "Enter your address",
            "email": "Enter your email",
        }

        error_messages = {
            "roll": {
                "required": "Roll number is required",
                "invalid": "Enter a valid roll number",
            },
            "name": {
                "required": "Name is required",
                "invalid": "Enter a valid name",
            },
            "address": {
                "required": "Address is required",
                "invalid": "Enter a valid address",
            },
            "email": {
                "required": "Email is required",
                "invalid": "Enter a valid email",
            },
        }