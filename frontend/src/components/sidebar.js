export class Sidebar {
    constructor() {
        this.initUserMenu();
        this.initCollapseArrow();
        // this.initBalance(); // Загружаем баланс
    }

    initUserMenu() {
        const userToggle = document.querySelector('.bi-person'); // Иконка пользователя
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userToggle && userDropdown && logoutBtn) {
            userToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            });

            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target)) {
                    userDropdown.style.display = 'none';
                }
            });

            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await Auth.logout(); // Позовём logout метод
                window.location.href = '/login';
            });
        }
    }

    initCollapseArrow() {
        const toggleLink = document.querySelector('[href="#collapseCategories"]');
        const arrowIcon = document.getElementById('category-chevron');
        const collapseEl = document.getElementById('collapseCategories');

        if (toggleLink && arrowIcon && collapseEl) {
            collapseEl.addEventListener('show.bs.collapse', () => {
                arrowIcon.classList.remove('bi-chevron-right');
                arrowIcon.classList.add('bi-chevron-down');
            });

            collapseEl.addEventListener('hide.bs.collapse', () => {
                arrowIcon.classList.remove('bi-chevron-down');
                arrowIcon.classList.add('bi-chevron-right');
            });
        }
    }

    // async initBalance() {
    //     const balanceElement = document.querySelector('.salary a');
    //
    //     try {
    //         const response = await CustomHttp.request(`${config.host}/balance`, 'GET');
    //         if (response && typeof response.balance === 'number') {
    //             balanceElement.textContent = `${response.balance}$`;
    //         }
    //     } catch (error) {
    //         console.error('Ошибка при получении баланса:', error);
    //     }
    // }
}


