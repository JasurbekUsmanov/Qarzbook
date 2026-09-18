from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth import login as auth_login

from .forms import RegisterForm


def register(request):

    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = form.save()
            auth_login(request, user)

            return redirect('home')

    else:
        form = RegisterForm()

    return render(request, 'register.html', {
        'form': form
    })


def login_view(request):

    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:

            auth_login(request, user)

            return redirect('home')

        return render(request, 'login.html', {
            'error': 'Неверное имя пользователя или пароль'
        })

    return render(request, 'login.html')