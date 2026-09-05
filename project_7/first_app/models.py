from django.db import models

# Create your models here.


class StudentModel(models.Model):
    roll = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    address = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.roll} - {self.name}"