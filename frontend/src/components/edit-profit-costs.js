import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class EditProfitCosts {
    constructor() {
        this.form = document.getElementById('operation-form');
        this.typeSelect = document.getElementById('operation-type');
        this.categorySelect = document.getElementById('operation-category');
        this.amountInput = document.getElementById('operation-amount');
        this.dateInput = document.getElementById('operation-date');
        this.commentInput = document.getElementById('operation-comment');

        this.submitBtn = document.getElementById('submit-btn');
        this.cancelBtn = document.getElementById('cancel-btn');

        this.errorCategory = document.getElementById('error-category');
        this.errorAmount = document.getElementById('error-amount');
        this.errorDate = document.getElementById('error-date');
        this.errorComment = document.getElementById('error-comment');
        this.formErrorMessage = document.getElementById('form-error-message');

        this.categories = [];

        this.operationId = localStorage.getItem('editOperationId');
        this.operationType = localStorage.getItem('editOperationType');

        if (!this.operationId || !this.operationType) {
            alert('Операция не найдена');
            window.location.href = '/profit-costs';
            return;
        }

        this.init();
    }

    async init() {
        try {
            const operation = await CustomHttp.request(`${config.host}/operations/${this.operationId}`, 'GET');

            if (!operation || operation.error) {
                this.formErrorMessage.textContent = operation?.message || 'Ошибка загрузки операции';
                return;
            }

            this.typeSelect.value = operation.type;
            this.typeSelect.disabled = true;
            this.amountInput.value = operation.amount;
            this.dateInput.value = operation.date;
            this.commentInput.value = operation.comment;

            await this.loadCategories(operation.type, operation.category_id);

            this.cancelBtn.addEventListener('click', () => {
                window.location.href = '/profit-costs';
            });

            this.submitBtn.addEventListener('click', () => this.handleSubmit());

        } catch (error) {
            console.error('Ошибка загрузки операции:', error);
            this.formErrorMessage.textContent = 'Ошибка при загрузке данных';
        }
    }

    async loadCategories(type, selectedCategoryId) {
        try {
            this.categories = await CustomHttp.request(`${config.host}/categories/${type}`, 'GET');

            if (this.categories && Array.isArray(this.categories)) {
                this.categorySelect.innerHTML = '';

                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.title;
                    if (category.id === selectedCategoryId) {
                        option.selected = true;
                    }
                    this.categorySelect.appendChild(option);
                });
            } else {
                this.categorySelect.innerHTML = '<option disabled>Нет доступных категорий</option>';
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
            this.formErrorMessage.textContent = 'Ошибка загрузки категорий';
        }
    }

    async handleSubmit() {
        this.clearErrors();

        const selectedCategoryId = +this.categorySelect.value;
        const selectedCategory = this.categories.find(c => c.id === selectedCategoryId);
        const amount = +this.amountInput.value;
        const date = this.dateInput.value;
        const comment = this.commentInput.value.trim();

        let valid = true;

        if (!selectedCategory) {
            this.errorCategory.textContent = 'Выберите категорию';
            valid = false;
        }

        if (!amount || amount <= 0) {
            this.errorAmount.textContent = 'Введите сумму больше 0';
            valid = false;
        }

        if (!date) {
            this.errorDate.textContent = 'Укажите дату';
            valid = false;
        }

        if (!comment) {
            this.errorComment.textContent = 'Добавьте комментарий';
            valid = false;
        }

        if (!valid) return;

        const body = {
            category_id: selectedCategory.id,
            type: this.operationType,
            amount,
            date,
            comment
        };


        try {
            const result = await CustomHttp.request(`${config.host}/operations/${this.operationId}`, 'PUT', body);

            if (!result.error) {
                window.location.href = '/profit-costs';
            } else {
                // Общая ошибка
                if (result.message) {
                    this.formErrorMessage.textContent = result.message;
                }

                // Ошибки по полям (если будут)
                if (Array.isArray(result.errors)) {
                    result.errors.forEach(err => {
                        switch (err.field) {
                            case 'category_id':
                                this.errorCategory.textContent = err.message;
                                break;
                            case 'amount':
                                this.errorAmount.textContent = err.message;
                                break;
                            case 'date':
                                this.errorDate.textContent = err.message;
                                break;
                            case 'comment':
                                this.errorComment.textContent = err.message;
                                break;
                        }
                    });
                }
            }

        } catch (error) {
            console.error('Ошибка при обновлении операции:', error);
            this.formErrorMessage.textContent = 'Ошибка при отправке запроса. Попробуйте позже.';
        }
    }

    clearErrors() {
        this.errorCategory.textContent = '';
        this.errorAmount.textContent = '';
        this.errorDate.textContent = '';
        this.errorComment.textContent = '';
        this.formErrorMessage.textContent = '';
    }
}
