// ========================================
// CSRF
// ========================================

function getCsrfToken() {
    const input = document.querySelector('input[name=csrfmiddlewaretoken]');
    return input ? input.value : '';
}


// ========================================
// ЗАКРЫТИЕ МОДАЛОК
// ========================================

function closeModals() {
    document.querySelectorAll(".modal").forEach(function(modal) {
        modal.classList.remove("active");
    });
}


// Закрытие при клике вне окна
document.querySelectorAll(".modal").forEach(function(modal) {

    modal.addEventListener("click", function(event) {

        if (event.target === modal) {
            closeModals();
        }

    });

});


// Закрытие клавишей ESC
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeModals();
    }

});


// ========================================
// ДОБАВИТЬ КЛИЕНТА
// ========================================

function openAddClientModal() {

    const modal = document.getElementById("clientModal");

    if (!modal) {
        console.error("clientModal не найден");
        return;
    }

    modal.classList.add("active");
}


// ========================================
// ДОБАВИТЬ ДОЛГ
// ========================================

function openAddDebtModal(customerId, customerName) {

    const modal = document.getElementById("addDebtModal");

    if (!modal) {
        console.error("addDebtModal не найден");
        return;
    }

    // Запоминаем ID клиента
    const customerIdInput =
        document.getElementById("debtCustomerId");

    if (customerIdInput) {
        customerIdInput.value = customerId;
    }

    // Показываем имя клиента
    const customerElement =
        document.getElementById("addDebtCustomer");

    if (customerElement) {
        customerElement.textContent =
            "Клиент: " + customerName;
    }

    // Очищаем старые значения
    const amount =
        document.getElementById("addDebtAmount");

    const description =
        document.getElementById("addDebtDescription");

    if (amount) {
        amount.value = "";
    }

    if (description) {
        description.value = "";
    }

    modal.classList.add("active");
}


async function addDebt() {

    const customerId = document.getElementById("debtCustomerId").value;
    const rawAmount = document.getElementById("addDebtAmount").value;
    const description = document.getElementById("addDebtDescription").value;

    const amount = rawAmount.replace(/\s/g, "");

    if (!customerId) {
        alert("Клиент не выбран");
        return;
    }

    if (!amount) {
        alert("Введите сумму");
        return;
    }

    const formData = new FormData();
    formData.append("id", customerId);
    formData.append("amount", amount);
    formData.append("description", description);

    try {

        const response = await fetch("/add-debt/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken()
            },
            body: formData
        });

        const rawText = await response.text();
        let data;

        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("Сервер вернул не-JSON ответ (статус " + response.status + "):", rawText);
            alert("Сервер вернул ошибку " + response.status + ". Подробности в консоли (F12).");
            return;
        }

        if (data.ok) {
            location.reload();
        } else {
            alert(data.error || "Не удалось добавить долг");
        }

    } catch (err) {
        console.error(err);
        alert("Ошибка соединения с сервером");
    }
}


// ========================================
// ПОГАШЕНИЕ
// ========================================

function openPaymentModal(customerId, customerName, currentDebt) {

    const modal = document.getElementById("paymentModal");

    if (!modal) {
        console.error("paymentModal не найден");
        return;
    }

    // Запоминаем ID клиента
    const customerIdInput =
        document.getElementById("paymentCustomerId");

    if (customerIdInput) {
        customerIdInput.value = customerId;
    }

    // Показываем имя и текущий долг
    const customerElement =
        document.getElementById("paymentCustomer");

    if (customerElement) {
        let text = "Клиент: " + customerName;

        if (currentDebt !== undefined) {
            text += " (долг: " + currentDebt + " сум)";
        }

        customerElement.textContent = text;
    }

    // Очищаем старую сумму
    const amount =
        document.getElementById("paymentAmount");

    if (amount) {
        amount.value = "";
    }

    modal.classList.add("active");
}


async function makePayment() {

    const customerId = document.getElementById("paymentCustomerId").value;
    const rawAmount = document.getElementById("paymentAmount").value;

    const amount = rawAmount.replace(/\s/g, "");

    if (!customerId) {
        alert("Клиент не выбран");
        return;
    }

    if (!amount) {
        alert("Введите сумму");
        return;
    }

    const formData = new FormData();
    formData.append("id", customerId);
    formData.append("amount", amount);

    try {

        const response = await fetch("/make-payment/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken()
            },
            body: formData
        });

        const rawText = await response.text();
        let data;

        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("Сервер вернул не-JSON ответ (статус " + response.status + "):", rawText);
            alert("Сервер вернул ошибку " + response.status + ". Подробности в консоли (F12).");
            return;
        }

        if (data.ok) {
            location.reload();
        } else {
            alert(data.error || "Не удалось провести оплату");
        }

    } catch (err) {
        console.error(err);
        alert("Ошибка соединения с сервером");
    }
}


// ========================================
// ФОРМАТ СУММЫ
// 50000 → 50 000
// ========================================

function setupMoneyInput(input) {

    if (!input) {
        return;
    }

    input.addEventListener("input", function() {

        // Оставляем только цифры
        let value = this.value.replace(/\D/g, "");

        // Добавляем пробелы
        value = value.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            " "
        );

        this.value = value;

    });

}


// Поле первого долга
setupMoneyInput(
    document.getElementById("clientDebt")
);


// Поле добавления долга
setupMoneyInput(
    document.getElementById("addDebtAmount")
);


// Поле оплаты
setupMoneyInput(
    document.getElementById("paymentAmount")
);


// ========================================
// ПОИСК КЛИЕНТОВ
// ========================================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function() {

        const searchText =
            this.value.toLowerCase().trim();

        const cards =
            document.querySelectorAll(".customer-card");

        cards.forEach(function(card) {

            const name =
                card.querySelector(".customer-name")
                ?.textContent
                .toLowerCase() || "";

            const phone =
                card.querySelector(".phone")
                ?.textContent
                .toLowerCase() || "";

            if (
                name.includes(searchText) ||
                phone.includes(searchText)
            ) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

}


// ========================================
// ГОЛОСОВОЙ ВВОД
// ========================================

function voiceInputDescription(inputId) {

    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Ваш браузер не поддерживает голосовой ввод."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {

        const text =
            event.results[0][0].transcript;

        input.value = text;

    };

}


// ========================================
// ГОЛОСОВОЙ ПОИСК
// ========================================

function voiceSearch() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Ваш браузер не поддерживает голосовой поиск."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {

        const text =
            event.results[0][0].transcript;

        const input =
            document.getElementById("searchInput");

        if (input) {

            input.value = text;

            input.dispatchEvent(
                new Event("input")
            );

        }

    };

}


async function deleteCustomer(customerId, customerName) {

    const confirmed = confirm(
        "Вы уверены, что хотите удалить клиента \"" + customerName + "\"? " +
        "Вместе с ним удалится вся история долгов и оплат."
    );

    if (!confirmed) {
        return;
    }

    const formData = new FormData();
    formData.append("id", customerId);

    try {

        const response = await fetch("/delete-customer/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken()
            },
            body: formData
        });

        const rawText = await response.text();
        let data;

        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("Сервер вернул не-JSON ответ (статус " + response.status + "):", rawText);
            alert("Сервер вернул ошибку " + response.status + ". Подробности в консоли (F12).");
            return;
        }

        if (data.ok) {
            location.reload();
        } else {
            alert(data.error || "Не удалось удалить клиента");
        }

    } catch (err) {
        console.error(err);
        alert("Ошибка соединения с сервером");
    }
}


// ========================================
// ВРЕМЕННО
// ========================================

function showDetails(customerId, customerName) {

    const modal = document.getElementById("detailsModal");
    const template = document.getElementById("history-" + customerId);
    const list = document.getElementById("detailsList");
    const nameEl = document.getElementById("detailsCustomerName");

    if (!modal || !list) {
        console.error("detailsModal не найден");
        return;
    }

    if (!template) {
        console.error("Шаблон истории для клиента " + customerId + " не найден");
        list.innerHTML = "<div class='info-row'><span class='info-value'>Нет данных</span></div>";
    } else {
        list.innerHTML = "";
        list.appendChild(template.content.cloneNode(true));
    }

    if (nameEl) {
        nameEl.textContent = customerName
            ? "Подробнее: " + customerName
            : "Подробнее";
    }

    modal.classList.add("active");
}
