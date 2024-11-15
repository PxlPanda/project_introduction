from leads.models import Leads
from leads.serializers import LeadSerializer
from rest_framework import generics
from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

class LeadListCreate(generics.ListCreateAPIView):
    queryset = Leads.objects.all()
    serializer_class = LeadSerializer
