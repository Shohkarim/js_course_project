import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Sidebar {
    constructor() {
        this.initUserMenu();
        this.initCollapseArrow();
        this.initBalance();
    }

    initUserMenu() {
        const userToggle = document.getElementById('user');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        // 👇 вставка имени
        const userInfoRaw = localStorage.getItem('userInfo');
        if (userToggle && userInfoRaw) {
            try {
                const userInfo = JSON.parse(userInfoRaw);
                if (userInfo.fullName) {
                    userToggle.innerHTML = `<i class="bi bi-person fs-5"></i> ${userInfo.fullName}`;
                }
            } catch (e) {
                console.error('Ошибка чтения userinfo:', e);
            }
        }

        // 👇 логика открытия/закрытия меню и logout
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
                await Auth.logout();
                window.location.href = '/login';
            });
        }
    }


    initCollapseArrow() {
        const arrowIcon = document.getElementById('category-chevron');
        const collapseEl = document.getElementById('collapseCategories');

        if (arrowIcon && collapseEl) {
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

    async initBalance() {
        const balanceElement = document.getElementById('salary');
        try {
            const response = await CustomHttp.request(config.host + '/balance', 'GET');

            if (response && typeof response.balance === 'number') {
                balanceElement.textContent = `${response.balance}$`;
            }
        } catch (error) {
            console.error('Ошибка при получении баланса:', error);
        }
    }

}
