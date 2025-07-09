import Chart from 'chart.js/auto';

export class Dashboard {
    constructor() {
        this.renderCharts();
    }

    renderCharts() {
        const incomeCanvas = document.getElementById('incomeChart');
        const expenseCanvas = document.getElementById('expenseChart');

        // Удаляем старые графики, если они уже существуют
        const existingIncomeChart = Chart.getChart(incomeCanvas);
        if (existingIncomeChart) {
            existingIncomeChart.destroy();
        }

        const existingExpenseChart = Chart.getChart(expenseCanvas);
        if (existingExpenseChart) {
            existingExpenseChart.destroy();
        }

        const incomeCtx = incomeCanvas.getContext('2d');
        const expenseCtx = expenseCanvas.getContext('2d');

        new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
                datasets: [{
                    data: [30, 40, 15, 10, 5],
                    backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#007bff'],
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
                datasets: [{
                    data: [5, 15, 30, 35, 15],
                    backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#007bff'],
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}
