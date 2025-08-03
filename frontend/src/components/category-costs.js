import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class CategoryCosts {
    constructor() {
        this.categoriesContainer = null;
        this.confirmModal = null;
        this.confirmDeleteBtn = null;
        this.cancelDeleteBtn = null;
        this.createConfirmModal();
        this.init();
    }

    createConfirmModal() {
        this.confirmModal = document.createElement('div');
        this.confirmModal.id = 'confirmModal';
        this.confirmModal.className = 'modal-overlay';
        this.confirmModal.style.display = 'none';

        this.confirmModal.innerHTML = `
            <div class="modal-content">
                <p>Вы действительно хотите удалить категорию?<br>
                Связанные расходы останутся без категории.</p>
                <div class="d-flex justify-content-center gap-3 mt-4">
                    <button class="btn btn-success" id="confirmDeleteBtn">Да, удалить</button>
                    <button class="btn btn-danger" id="cancelDeleteBtn">Не удалять</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.confirmModal);
        this.confirmDeleteBtn = this.confirmModal.querySelector('#confirmDeleteBtn');
        this.cancelDeleteBtn = this.confirmModal.querySelector('#cancelDeleteBtn');
    }

    async init() {
        this.categoriesContainer = document.querySelector('.d-flex.flex-wrap.gap-4');
        if (!this.categoriesContainer) return;

        try {
            const response = await CustomHttp.request(`${config.host}/categories/expense`, 'GET');
            if (response && Array.isArray(response)) {
                this.renderCategories(response);
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий расходов:', error);
        }
    }

    renderCategories(categories) {
        this.categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';

            const title = document.createElement('h5');
            title.textContent = category.title;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'mt-3 d-flex gap-2';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-primary btn-sm';
            editBtn.textContent = 'Редактировать';
            editBtn.onclick = () => {
                localStorage.setItem('editCategoryId', category.id);
                localStorage.setItem('editCategoryType', 'expense');
                window.location.href = '/edit-costs';
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.onclick = () => this.deleteCategory(category.id);

            buttonContainer.append(editBtn, deleteBtn);
            card.append(title, buttonContainer);
            this.categoriesContainer.appendChild(card);
        });

        // Кнопка "Добавить категорию"
        const addCard = document.createElement('div');
        addCard.className = 'category-card add-category';
        addCard.innerHTML = '<span>+</span>';
        addCard.onclick = () => {
            window.location.href = '/create-costs';
        };

        this.categoriesContainer.appendChild(addCard);
    }

    deleteCategory(categoryId) {
        this.confirmModal.style.display = 'flex';

        const closeModal = () => {
            this.confirmModal.style.display = 'none';
            this.confirmDeleteBtn.onclick = null;
            this.cancelDeleteBtn.onclick = null;
        };

        this.confirmDeleteBtn.onclick = async () => {
            closeModal();

            try {
                const result = await CustomHttp.request(`${config.host}/categories/expense/${categoryId}`, 'DELETE');
                if (result && !result.error) {
                    this.init(); // Обновление списка
                } else {
                    alert(result?.message || 'Не удалось удалить категорию.');
                }
            } catch (error) {
                console.error('Ошибка при удалении категории:', error);
            }
        };

        this.cancelDeleteBtn.onclick = () => {
            closeModal();
        };
    }
}
