from django.contrib import admin
from .models import Entry

@admin.register(Entry)
class PersonAdmin(admin.ModelAdmin):
   pass