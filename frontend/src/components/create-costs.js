import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class CreateCosts {
    constructor() {
        this.form = document.querySelector('form');
        this.input = document.getElementById('category-name');

        if (!this.form || !this.input) return;

        this.form.addEventListener('submit', async (event) => {
            event.preventDefault(); // предотвратить перезагрузку страницы

            const title = this.input.value.trim();

            if (!title) {
                this.showValidationError('Пожалуйста, введите название категории.');
                return;
            }

            try {
                const result = await CustomHttp.request(`${config.host}/categories/expense`, 'POST', {
                    title: title
                });

                if (result && !result.error) {
                    window.location.href = '/category-costs';
                } else {
                    this.showValidationError(result?.message || 'Не удалось создать категорию.');
                }
            } catch (e) {
                console.error('Ошибка при создании категории:', e);
                this.showValidationError('Произошла ошибка на сервере.');
            }
        });
    }

    showValidationError(message) {
        let errorEl = document.getElementById('form-error-message');

        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'form-error-message';
            errorEl.className = 'text-danger';
            errorEl.style.marginTop = '5px';
            this.form.insertBefore(errorEl, this.form.querySelector('div'));
        }

        errorEl.textContent = message;
    }
}
