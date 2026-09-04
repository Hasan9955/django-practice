from django.shortcuts import render
from first_app.forms import StudentForm



# Create your views here.

def home(request):
    if request.method == "POST":
        form = StudentForm(request.POST)
        if form.is_valid():
            # form.save()
            form.save(commit=False)  # Save the form data without committing to the database
            print("Form is valid. Data saved to the database.", form.cleaned_data)
    else: 
        form = StudentForm()
 


    return render(request, 'home.html', {"form": form})