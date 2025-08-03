import {Modal} from 'bootstrap';
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import '/dist/css/bootstrap.min.css';

export class ProfitCosts {
    constructor() {
        this.operationsTableBody = document.querySelector('tbody');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.dateLinks = document.querySelectorAll('.date-link');
        this.createProfitBtn = document.querySelector('.btn-success');
        this.createCostBtn = document.querySelector('.btn-danger');
        this.modal = null;
        this.currentFilter = 'today';

        this.startDate = null;
        this.endDate = null;

        this.init();
    }

    init() {
        this.setupFilterButtons();
        this.setupCreateButtons();
        this.renderConfirmModal();
        this.loadOperations(this.currentFilter);
        this.setupDateLinks();
    }

    setupFilterButtons() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const period = btn.dataset.period;
                this.currentFilter = period;

                if (period === 'interval') {
                    return;
                }

                await this.loadOperations(period);
            });
        });
    }

    setupCreateButtons() {
        this.createProfitBtn.addEventListener('click', () => {
            localStorage.setItem('operationType', 'income');
            window.location.href = '/create-profit-costs';
        });

        this.createCostBtn.addEventListener('click', () => {
            localStorage.setItem('operationType', 'expense');
            window.location.href = '/create-profit-costs';
        });
    }

    setupDateLinks() {
        const modalElement = document.getElementById('dateModal');
        const modal = new Modal(modalElement);

        const startDateInput = document.getElementById('startDateInput');
        const endDateInput = document.getElementById('endDateInput');
        const applyBtn = document.getElementById('applyDateBtn');

        const openModal = () => {
            startDateInput.value = this.startDate || '';
            endDateInput.value = this.endDate || '';
            modal.show();
            setTimeout(() => startDateInput.focus(), 200);
        };

        this.dateLinks[0].addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        this.dateLinks[1].addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        applyBtn.addEventListener('click', () => {
            const start = startDateInput.value;
            const end = endDateInput.value;

            if (start && end) {
                this.startDate = start;
                this.endDate = end;

                this.dateLinks[0].textContent = start;
                this.dateLinks[1].textContent = end;

                this.currentFilter = 'interval';
                this.activateIntervalButton();
                modal.hide();
                this.tryLoadIntervalOperations();
            } else {
                alert('Пожалуйста, выберите обе даты.');
            }
        });
    }

    activateIntervalButton() {
        this.filterButtons.forEach(btn => {
            if (btn.dataset.period === 'interval') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    async tryLoadIntervalOperations() {
        if (this.currentFilter === 'interval' && this.startDate && this.endDate) {
            await this.loadOperations('interval', this.startDate, this.endDate);
        }
    }

    async loadOperations(period, dateFrom = null, dateTo = null) {
        try {
            let url = `${config.host}/operations`;

            if (period === 'interval' && dateFrom && dateTo) {
                url += `?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`;
            } else {
                url += `?period=${period}`;
            }


            const operations = await CustomHttp.request(url, 'GET');

            if (!Array.isArray(operations)) {
                console.warn('Операции не в массиве:', operations);
                return;
            }

            this.operationsTableBody.innerHTML = '';

            operations.forEach((op, index) => {
                const row = document.createElement('tr');
                row.className = 'align-middle text-center';
                row.innerHTML = `
                <td>${index + 1}</td>
                <td><span class="${op.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${op.type === 'income' ? 'Доход' : 'Расход'}
                </span></td>
                <td>${op.category || 'Без категории'}</td>
                <td>${op.amount} $</td>
                <td>${op.date}</td>
                <td>${op.comment}</td>
                <td class="text-end">
                    <div class="action-buttons">
                        <button class="icon-btn" data-action="delete" data-id="${op.id}"><i class="bi bi-trash"></i></button>
                        <button class="icon-btn" data-action="edit" data-id="${op.id}" data-type="${op.type}"><i class="bi bi-pencil"></i></button>
                    </div>
                </td>
            `;
                this.operationsTableBody.appendChild(row);
            });

            this.setupActionButtons();

        } catch (e) {
            console.error('❌ Ошибка загрузки операций:', e);
        }
    }


    setupActionButtons() {
        this.operationsTableBody.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const action = e.currentTarget.dataset.action;
                const type = e.currentTarget.dataset.type;

                if (action === 'delete') {
                    this.showConfirmModal(id);
                } else if (action === 'edit') {
                    localStorage.setItem('editOperationId', id);
                    localStorage.setItem('editOperationType', type);
                    window.location.href = '/edit-profit-costs';
                }
            });
        });
    }

    renderConfirmModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.style.display = 'none';
        this.modal.innerHTML = `
            <div class="modal-content">
                <p>Вы действительно хотите удалить операцию?</p>
                <div class="d-flex justify-content-center gap-3 mt-4">
                    <button class="btn btn-success" id="confirmDeleteBtn">Да, удалить</button>
                    <button class="btn btn-danger" id="cancelDeleteBtn">Не удалять</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    showConfirmModal(id) {
        const confirmBtn = this.modal.querySelector('#confirmDeleteBtn');
        const cancelBtn = this.modal.querySelector('#cancelDeleteBtn');

        this.modal.style.display = 'flex';

        confirmBtn.onclick = async () => {
            try {
                const result = await CustomHttp.request(`${config.host}/operations/${id}`, 'DELETE');
                if (!result.error) {
                    this.loadOperations(this.currentFilter, this.startDate, this.endDate);
                }
            } catch (e) {
                console.error('Ошибка удаления:', e);
            } finally {
                this.modal.style.display = 'none';
            }
        };

        cancelBtn.onclick = () => {
            this.modal.style.display = 'none';
        };
    }
}
