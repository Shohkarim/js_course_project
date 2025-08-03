import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class EditProfit {
    constructor() {
        this.form = document.querySelector('form');
        this.input = document.getElementById('category-name');
        this.categoryId = localStorage.getItem('editCategoryId');
        this.categoryType = localStorage.getItem('editCategoryType'); // на случай, если будут ещё расходы

        if (!this.form || !this.input || !this.categoryId || this.categoryType !== 'income') {
            window.location.href = '/category-profit';
            return;
        }

        this.loadCategory();
        this.form.addEventListener('submit', (e) => this.updateCategory(e));
    }

    async loadCategory() {
        try {
            const result = await CustomHttp.request(`${config.host}/categories/income/${this.categoryId}`, 'GET');

            if (result && result.title) {
                this.input.value = result.title;
            } else {
                throw new Error('Категория не найдена');
            }
        } catch (error) {
            console.error('Ошибка при загрузке категории:', error);
            this.showError('Не удалось загрузить категорию.');
        }
    }

    async updateCategory(event) {
        event.preventDefault();

        const title = this.input.value.trim();
        if (!title) {
            this.showError('Пожалуйста, введите новое название.');
            return;
        }

        try {
            const result = await CustomHttp.request(`${config.host}/categories/income/${this.categoryId}`, 'PUT', {
                title: title
            });

            if (result && !result.error) {
                localStorage.removeItem('editCategoryId');
                localStorage.removeItem('editCategoryType');
                window.location.href = '/category-profit';
            } else {
                this.showError(result?.message || 'Не удалось сохранить изменения.');
            }
        } catch (error) {
            console.error('Ошибка при обновлении категории:', error);
            this.showError('Произошла ошибка на сервере.');
        }
    }

    showError(message) {
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
