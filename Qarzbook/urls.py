from django.contrib import admin
from django.urls import path, include
from Book import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView
urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path('accounts/', include('accounts.urls')),
    path('logout/', LogoutView.as_view(next_page='register'), name='logout'),
    path('add-customer/', views.add_customer, name='add_customer'),
    path('add-debt/', views.add_debt, name='add_debt'),
    path('make-payment/', views.make_payment, name='make_payment'),
    path('delete-customer/', views.delete_customer, name='delete_customer'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
