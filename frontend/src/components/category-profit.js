import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class CategoryProfit {
    constructor() {
        this.categoriesContainer = null;
        this.confirmModal = null;
        this.confirmDeleteBtn = null;
        this.cancelDeleteBtn = null;
        this.createConfirmModal(); // Создаём модалку
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
                Связанные доходы останутся без категории.</p>
                <div class="d-flex justify-content-center gap-3 mt-4">
                    <button class="btn btn-success" id="confirmDeleteBtn">Да, удалить</button>
                    <button class="btn btn-danger" id="cancelDeleteBtn">Не удалять</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.confirmModal);

        // Получаем ссылки на кнопки
        this.confirmDeleteBtn = this.confirmModal.querySelector('#confirmDeleteBtn');
        this.cancelDeleteBtn = this.confirmModal.querySelector('#cancelDeleteBtn');
    }

    async init() {
        this.categoriesContainer = document.getElementById('categories-income');
        if (!this.categoriesContainer) return;

        try {
            const response = await CustomHttp.request(`${config.host}/categories/income`, 'GET');
            if (response && Array.isArray(response)) {
                this.renderCategories(response);
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }

        this.handleAddCategory();
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
                localStorage.setItem('editCategoryType', 'income');
                window.location.href = '/edit-profit';
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
            window.location.href = '/create-profit';
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
                const result = await CustomHttp.request(`${config.host}/categories/income/${categoryId}`, 'DELETE');
                if (result && !result.error) {
                    this.init(); // Перезагрузка списка
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

    handleAddCategory() {
        const addButton = document.querySelector('.add-category');
        if (addButton) {
            addButton.onclick = () => {
                window.location.href = '/create-profit';
            };
        }
    }
}
