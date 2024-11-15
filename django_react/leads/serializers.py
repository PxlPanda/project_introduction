from rest_framework import serializers
from .models import Leads

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leads
        fields = ('id', 'name', 'email', 'group', 'created_at')