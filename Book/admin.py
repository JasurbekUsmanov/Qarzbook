from django.contrib import admin

from .models import Customer, Debt


class DebtInline(admin.TabularInline):
    model = Debt
    extra = 0
    fields = ("type", "amount", "description", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "user", "total_debt_display", "created_at")
    list_filter = ("user",)
    search_fields = ("name", "phone", "user__username")
    inlines = [DebtInline]

    @admin.display(description="Текущий долг")
    def total_debt_display(self, obj):
        return f"{obj.total_debt_display} сум"


@admin.register(Debt)
class DebtAdmin(admin.ModelAdmin):
    list_display = ("customer", "get_user", "type", "amount", "created_at")
    list_filter = ("type", "customer__user")
    search_fields = ("customer__name", "description")

    @admin.display(description="Пользователь", ordering="customer__user")
    def get_user(self, obj):
        return obj.customer.user
