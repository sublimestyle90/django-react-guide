from django.conf.urls import url
from django.contrib import admin
from django.urls import path
import views

urlpatterns = [
    path("admin/", admin.site.urls),
    # match the root
    url(r'^$', views.index),
    # match all other pages
    url(r'^(?:.*)/?$', views.index),
]
