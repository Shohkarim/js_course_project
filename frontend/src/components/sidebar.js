export class Sidebar {
    constructor() {
        this.initUserMenu();
    }

    initUserMenu() {
        const userToggle = document.getElementById('userToggle');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userToggle && userDropdown && logoutBtn) {
            userToggle.addEventListener('click', () => {
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            });

            document.addEventListener('click', (e) => {
                if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.style.display = 'none';
                }
            });

            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                sessionStorage.clear();
                window.location.href = '/#/login';
            });
        }
    }
}


