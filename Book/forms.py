from .models import Customer,Debt
from django.forms import ModelForm

class CustomerForm(ModelForm):
    class Meta:
        model=Customer
        fields=['phone','name','description'] 