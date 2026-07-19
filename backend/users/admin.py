from django.contrib import admin

from .models import FrictionEvent, ProblemReport, UserAccount

admin.site.register(UserAccount)
admin.site.register(FrictionEvent)
admin.site.register(ProblemReport)
