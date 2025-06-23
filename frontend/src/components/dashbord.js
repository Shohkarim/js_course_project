import Chart from 'chart.js/auto';

export class Dashboard {
    constructor() {
        this.renderCharts();
    }

    renderCharts() {
        const incomeCtx = document.getElementById('incomeChart').getContext('2d');
        const expenseCtx = document.getElementById('expenseChart').getContext('2d');

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
