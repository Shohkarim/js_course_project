import Chart from 'chart.js/auto';
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Modal} from 'bootstrap';

export class Dashboard {
    constructor() {
        this.incomeChart = null;
        this.expenseChart = null;

        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.dateLinks = document.querySelectorAll('.date-link');
        this.startDate = null;
        this.endDate = null;
        this.currentFilter = 'today';

        this.setupFilterButtons();
        this.setupDateLinks();
        this.loadAndRenderCharts(this.currentFilter);

        // === Добавлено: управление бургер-меню ===
        this.setupBurgerMenu();
    }

    setupBurgerMenu() {
        const burgerBtn = document.getElementById('burgerBtn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (burgerBtn && sidebar && overlay) {
            const openSidebar = () => {
                sidebar.classList.add('show');
                overlay.classList.add('show');
            };

            const closeSidebar = () => {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            };

            burgerBtn.addEventListener('click', openSidebar);
            overlay.addEventListener('click', closeSidebar);

            // Автозакрытие при клике на ссылку в сайдбаре
            sidebar.querySelectorAll('a.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Если это ссылка, которая открывает подменю — не закрываем
                    const href = link.getAttribute('href');
                    const hasCollapseToggle = link.getAttribute('data-bs-toggle') === 'collapse';

                    if (hasCollapseToggle && href === '#collapseCategories') {
                        return;
                    }

                    closeSidebar();
                });
            });

        }
    }


    setupFilterButtons() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const period = btn.dataset.period;
                this.currentFilter = period;

                if (period === 'interval') return;

                await this.loadAndRenderCharts(period);
            });
        });
    }

    setupDateLinks() {
        const modalElement = document.getElementById('dateModal');
        if (!modalElement) return;

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
                this.loadAndRenderCharts('interval', start, end);
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

    async loadAndRenderCharts(period, dateFrom = null, dateTo = null) {
        try {
            let url = `${config.host}/operations`;

            if (period === 'interval' && dateFrom && dateTo) {
                url += `?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`;
            } else {
                url += `?period=${period}`;
            }

            const operations = await CustomHttp.request(url, 'GET');

            if (!Array.isArray(operations)) return;

            const incomeData = {};
            const expenseData = {};

            operations.forEach(op => {
                const category = op.category || 'Без категории';
                const target = op.type === 'income' ? incomeData : expenseData;
                target[category] = (target[category] || 0) + op.amount;
            });

            this.renderCharts(incomeData, expenseData);
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }

    renderCharts(incomeData, expenseData) {
        const incomeCanvas = document.getElementById('incomeChart');
        const expenseCanvas = document.getElementById('expenseChart');

        if (this.incomeChart) this.incomeChart.destroy();
        if (this.expenseChart) this.expenseChart.destroy();

        const incomeLabels = Object.keys(incomeData);
        const incomeAmounts = Object.values(incomeData);
        const incomeColors = this.getColors(incomeLabels.length);

        const expenseLabels = Object.keys(expenseData);
        const expenseAmounts = Object.values(expenseData);
        const expenseColors = this.getColors(expenseLabels.length);

        this.incomeChart = new Chart(incomeCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: incomeLabels,
                datasets: [{
                    data: incomeAmounts,
                    backgroundColor: incomeColors,
                }]
            },
            options: {
                plugins: {
                    legend: {display: false}
                }
            }
        });

        this.expenseChart = new Chart(expenseCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseAmounts,
                    backgroundColor: expenseColors,
                }]
            },
            options: {
                plugins: {
                    legend: {display: false}
                }
            }
        });

        this.renderCustomLegend('incomeLegend', incomeLabels, incomeColors);
        this.renderCustomLegend('expenseLegend', expenseLabels, expenseColors);
    }

    renderCustomLegend(containerId, labels, colors) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        labels.forEach((label, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item d-flex align-items-center gap-2';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = colors[index];

            const labelText = document.createElement('span');
            labelText.textContent = label;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(labelText);
            container.appendChild(legendItem);
        });
    }

    getColors(count) {
        const palette = [
            '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#007bff',
            '#6f42c1', '#17a2b8', '#20c997', '#6610f2', '#e83e8c'
        ];
        return Array.from({length: count}, (_, i) => palette[i % palette.length]);
    }
}
