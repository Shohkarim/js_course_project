import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class CreateProfitCosts {
    constructor() {
        this.form = document.getElementById('operation-form');
        this.typeSelect = document.getElementById('operation-type');
        this.categorySelect = document.getElementById('operation-category');
        this.amountInput = document.getElementById('operation-amount');
        this.dateInput = document.getElementById('operation-date');
        this.commentInput = document.getElementById('operation-comment');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.categories = [];

        this.errorCategory = document.getElementById('error-category');
        this.errorAmount = document.getElementById('error-amount');
        this.errorDate = document.getElementById('error-date');
        this.errorComment = document.getElementById('error-comment');

        this.formErrorMessage = document.getElementById('form-error-message');

        this.init();
    }

    async init() {
        const type = localStorage.getItem('operationType') || 'income';
        this.typeSelect.value = type;
        this.typeSelect.disabled = true;

        await this.loadCategories(type);

        this.cancelBtn.addEventListener('click', () => {
            window.location.href = '/profit-costs';
        });

        this.submitBtn.addEventListener("click", async () => {
            const selectedCategoryId = +this.categorySelect.value;
            const selectedCategory = this.categories.find(c => c.id === selectedCategoryId);

            if (!selectedCategory) {
                alert('Выберите категорию');
                return;
            }

            const data = {
                category_id: selectedCategory.id,
                type: type,
                amount: +this.amountInput.value,
                date: this.dateInput.value,
                comment: this.commentInput.value.trim(),
            };

            // Валидация
            let valid = true;

            if (!selectedCategory) {
                this.errorCategory.textContent = 'Выберите категорию';
                valid = false;
            }

            if (!data.amount || data.amount <= 0) {
                this.errorAmount.textContent = 'Введите сумму больше 0';
                valid = false;
            }

            if (!data.date) {
                this.errorDate.textContent = 'Укажите дату';
                valid = false;
            }

            if (!data.comment) {
                this.errorComment.textContent = 'Добавьте комментарий';
                valid = false;
            }

            if (!valid) return;


            try {
                const result = await CustomHttp.request(`${config.host}/operations`, 'POST', data);
                if (!result.error) {
                    window.location.href = '/profit-costs';
                } else {
                    this.formErrorMessage.textContent = result.message || 'Ошибка при создании операции';
                }
            } catch (e) {
                console.error('Ошибка при создании:', e);
                this.formErrorMessage.textContent = 'Ошибка при отправке запроса. Попробуйте позже.';
            }
        });
    }

    clearFormError() {
        this.formErrorMessage.textContent = '';
    }

    async loadCategories(type) {
        try {
            this.categories = await CustomHttp.request(`${config.host}/categories/${type}`);
            if (this.categories && Array.isArray(this.categories)) {
                this.categorySelect.innerHTML = this.categories.map(c =>
                    `<option value="${c.id}">${c.title}</option>`
                ).join('');
            } else {
                this.categorySelect.innerHTML = '<option disabled>Нет категорий</option>';
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    }
}

