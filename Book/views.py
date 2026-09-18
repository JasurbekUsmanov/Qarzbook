from decimal import Decimal, InvalidOperation

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Customer, Debt


def _parse_amount(raw):
    """Превращает '50 000' / '50000' / '' в Decimal или None, если некорректно."""
    if raw is None:
        return None

    cleaned = raw.replace(" ", "").replace("\xa0", "").replace(",", "")

    if not cleaned:
        return None

    try:
        amount = Decimal(cleaned)
    except InvalidOperation:
        return None

    if amount <= 0:
        return None

    return amount


def _format_amount(value):
    return f"{value:,.0f}".replace(",", " ")


@login_required(login_url="register")
def home(request):
    customers = Customer.objects.filter(
        user=request.user
    ).prefetch_related("debts")

    total_debt = sum((c.total_debt for c in customers), Decimal(0))

    return render(
        request,
        "home.html",
        {
            "customers": customers,
            "total_customers": customers.count(),
            "total_debt_display": _format_amount(total_debt),
        }
    )


@login_required
@require_POST
def add_customer(request):
    name = (request.POST.get("name") or "").strip()
    phone = (request.POST.get("phone") or "").strip()
    description = (request.POST.get("description") or "").strip()
    amount = _parse_amount(request.POST.get("amount", ""))

    if not name:
        return redirect("home")

    customer = Customer.objects.create(
        user=request.user,
        name=name,
        phone=phone
    )

    if amount:
        Debt.objects.create(
            customer=customer,
            type=Debt.DEBT,
            amount=amount,
            description=description
        )

    return redirect("home")


@login_required
@require_POST
def add_debt(request):
    customer_id = request.POST.get("id") or request.POST.get("customer_id")
    amount = _parse_amount(request.POST.get("amount"))
    description = (request.POST.get("description") or "").strip()

    if amount is None:
        return JsonResponse({"ok": False, "error": "Некорректная сумма"}, status=400)

    customer = get_object_or_404(Customer, id=customer_id, user=request.user)

    Debt.objects.create(
        customer=customer,
        type=Debt.DEBT,
        amount=amount,
        description=description
    )

    return JsonResponse({
        "ok": True,
        "customer_id": customer.id,
        "total_debt": str(customer.total_debt),
        "total_debt_display": customer.total_debt_display,
    })


@login_required
@require_POST
def make_payment(request):
    customer_id = request.POST.get("id") or request.POST.get("customer_id")
    amount = _parse_amount(request.POST.get("amount"))

    if amount is None:
        return JsonResponse({"ok": False, "error": "Некорректная сумма"}, status=400)

    customer = get_object_or_404(Customer, id=customer_id, user=request.user)

    if amount > customer.total_debt:
        return JsonResponse(
            {"ok": False, "error": "Сумма оплаты больше текущего долга"},
            status=400
        )

    Debt.objects.create(
        customer=customer,
        type=Debt.PAYMENT,
        amount=amount,
        description="Погашение долга"
    )

    return JsonResponse({
        "ok": True,
        "customer_id": customer.id,
        "total_debt": str(customer.total_debt),
        "total_debt_display": customer.total_debt_display,
    })


@login_required
@require_POST
def delete_customer(request):
    customer_id = request.POST.get("id")
    customer = get_object_or_404(Customer, id=customer_id, user=request.user)
    customer.delete()
    return JsonResponse({"ok": True})
