import {Dashboard} from "./components/dashbord.js";
import {Form} from "./components/form.js";
import {CategoryProfit} from "./components/category-profit.js";
import {CreateProfit} from "./components/create-profit.js";
import {EditProfit} from "./components/edit-profit.js";
import {CategoryCosts} from "./components/category-costs.js";
import {CreateCosts} from "./components/create-costs.js";
import {EditCosts} from "./components/edit-costs.js";
import {ProfitCosts} from "./components/profit-costs.js";
import {CreateProfitCosts} from "./components/create-profit-costs.js";
import {EditProfitCosts} from "./components/edit-profit-costs.js";
import {Sidebar} from "./components/sidebar.js";


export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');

        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: "Дашборд",
                filePathTemplate: '/templates/dashboard.html',
                userLayout: '/templates/layout.html',
                load: async () => {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    new Dashboard();

                }
            },
            {
                route: '/category-profit',
                title: "Доходы",
                filePathTemplate: '/templates/category-profit.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CategoryProfit();
                    new Dashboard();
                }
            },
            {
                route: '/category-costs',
                title: "Расходы",
                filePathTemplate: '/templates/category-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CategoryCosts();
                    new Dashboard();
                }
            },
            {
                route: '/create-profit',
                title: "Создание категории доходов",
                filePathTemplate: '/templates/create-profit.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CreateProfit();
                    new Dashboard();
                }
            },
            {
                route: '/edit-profit',
                title: "Редактирование категории доходов",
                filePathTemplate: '/templates/edit-profit.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new EditProfit();
                    new Dashboard();
                }
            },
            {
                route: '/create-costs',
                title: "Создание категории расходов",
                filePathTemplate: '/templates/create-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CreateCosts();
                    new Dashboard();
                }
            },
            {
                route: '/edit-costs',
                title: "Редактирование категории расходов",
                filePathTemplate: '/templates/edit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new EditCosts();
                    new Dashboard();
                }
            },
            {
                route: '/profit-costs',
                title: "Доходы и расходы",
                filePathTemplate: '/templates/profit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new ProfitCosts();
                    new Dashboard();
                }
            },
            {
                route: '/create-profit-costs',
                title: "Создание дохода/расхода",
                filePathTemplate: '/templates/create-profit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CreateProfitCosts();
                    new Dashboard();
                }
            },
            {
                route: '/edit-profit-costs',
                title: "Редактирование дохода/расхода",
                filePathTemplate: '/templates/edit-profit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new EditProfitCosts();
                    new Dashboard();
                }
            },
            {
                route: '/404',
                title: "Страница не найдена",
                filePathTemplate: '/templates/404.html',
                userLayout: false,
            },
            {
                route: '/login',
                title: "Авторизация",
                filePathTemplate: '/templates/login.html',
                userLayout: false,
                load: () => {
                    new Form(this.openNewRoute.bind(this), 'login');
                }
            },
            {
                route: '/sign-up',
                title: "Регистрация",
                filePathTemplate: '/templates/sign-up.html',
                userLayout: false,
                load: () => {
                    new Form(this.openNewRoute.bind(this), 'sign-up');
                }
            },
        ]
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    async openNewRoute(url) {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(null, currentRoute);
    }

    async clickHandler(e) {
        let element = null;

        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.closest('a')) {
            element = e.target.closest('a');
        }

        if (element) {
            const href = element.getAttribute('href');

            // игнорируем якорные ссылки (например, #collapseCategories)
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
                return;
            }

            e.preventDefault();
            const url = href.replace(window.location.origin, '');
            await this.openNewRoute(url);
        }
    }


    async activateRoute(e, oldRoute = null) {
        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);
            if (currentRoute?.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);
        const accessToken = localStorage.getItem('accessToken');

        //  Защита: если нет токена и пытаемся попасть на закрытую страницу — редирект на /login
        if (!accessToken && newRoute && newRoute.userLayout) {
            history.replaceState({}, '', '/login');
            await this.activateRoute();
            return;
        }

        if (newRoute) {
            if (newRoute.title) {
                this.titlePageElement.innerText = `${newRoute.title} | Financial page`;
            }

            if (newRoute.filePathTemplate) {
                document.body.className = '';
                let contentBlock = this.contentPageElement;

                if (newRoute.userLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.userLayout).then(res => res.text());
                    contentBlock = document.getElementById('content-layout');
                    new Sidebar();
                }

                // Загружаем шаблон страницы
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(res => res.text());

                if (newRoute.load && typeof newRoute.load === 'function') {
                    requestAnimationFrame(() => {
                        newRoute.load();
                    });
                }
            }
        } else {
            console.warn('Route not found, redirecting to /404');
            history.pushState({}, '', '/404');
            await this.activateRoute();
        }
    }

}