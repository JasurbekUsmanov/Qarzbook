from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum


class Customer(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='customers'
    )

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def total_debt(self):
        """Текущий долг клиента = сумма всех долгов минус сумма всех оплат."""
        debts = self.debts.filter(type=Debt.DEBT).aggregate(
            s=Sum('amount')
        )['s'] or 0

        payments = self.debts.filter(type=Debt.PAYMENT).aggregate(
            s=Sum('amount')
        )['s'] or 0

        return debts - payments

    @property
    def total_debt_display(self):
        return f"{self.total_debt:,.0f}".replace(",", " ")


class Debt(models.Model):

    DEBT = 'debt'
    PAYMENT = 'payment'

    TYPE_CHOICES = [
        (DEBT, 'Долг'),
        (PAYMENT, 'Оплата'),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="debts"
    )

    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        default=DEBT
    )

    amount = models.DecimalField(max_digits=25, decimal_places=0)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.name} : {self.get_type_display()} {self.amount}"
