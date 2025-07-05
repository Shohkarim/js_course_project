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
                    new Sidebar();
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
                }
            },
            {
                route: '/category-costs',
                title: "Расходы",
                filePathTemplate: '/templates/category-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CategoryCosts();
                }
            },
            {
                route: '/create-profit',
                title: "Создание категории доходов",
                filePathTemplate: '/templates/create-profit.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CreateProfit();
                }
            },
            {
                route: '/edit-profit',
                title: "Редактирование категории доходов",
                filePathTemplate: '/templates/edit-profit.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new EditProfit();
                }
            },
            {
                route: '/create-costs',
                title: "Создание категории расходов",
                filePathTemplate: '/templates/create-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CreateCosts();
                }
            },
            {
                route: '/edit-costs',
                title: "Редактирование категории расходов",
                filePathTemplate: '/templates/edit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new EditCosts();
                }
            },
            {
                route: '/profit-costs',
                title: "Доходы и расходы",
                filePathTemplate: '/templates/profit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new ProfitCosts();
                }
            },
            {
                route: '/create-profit-costs',
                title: "Создание дохода/расхода",
                filePathTemplate: '/templates/create-profit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new CreateProfitCosts();
                }
            },
            {
                route: '/edit-profit-costs',
                title: "Редактирование дохода/расхода",
                filePathTemplate: '/templates/edit-profit-costs.html',
                userLayout: '/templates/layout.html',
                load: () => {
                    new EditProfitCosts();
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
                    new Form();
                }
            },
            {
                route: '/sign-up',
                title: "Регистрация",
                filePathTemplate: '/templates/sign-up.html',
                userLayout: false,
                load: () => {
                    new Form();
                }
            },
        ]
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.openNewRoute.bind(this));
    }


    async openNewRoute(e) {
        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        if (element) {
            e.preventDefault();
            const url = element.href.replace(window.location.origin, '');

            if (!url || url === '#' || url.startsWith('javascript:void(0);')) {
                return;
            }
            const currentRoute = window.location.pathname;
            history.pushState({}, '', url);
            await this.activateRoute(null, currentRoute);
        }
    }


    async activateRoute(e, oldRoute = null) {
        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);
            if (currentRoute.styles && currentRoute.styles.length > 0) {
                currentRoute.styles.forEach(style => {
                    document.querySelector(`link[href='/css/${style}']`).remove();
                });
            }
            if (currentRoute.unload && typeof currentRoute.load) {
                currentRoute.unload();
            }
        }


        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/css/' + style;
                    document.head.insertBefore(link, this.adminLteStyleElement);
                })
            }
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title + 'Financial page';
            }

            if (newRoute.filePathTemplate) {
                document.body.className = '';
                let contentBlock = this.contentPageElement;
                if (newRoute.userLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.userLayout).then(response => response.text());
                    contentBlock = document.getElementById('content-layout');
                    // document.body.classList.add('sidebar-mini');
                    // document.body.classList.add('layout-fixed');

                } else {
                    // document.body.classList.remove('sidebar-mini');
                    // document.body.classList.remove('layout-fixed');
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }


            if (newRoute.load && typeof newRoute.load) {
                await newRoute.load();
            }

        } else {
            console.log('No route found');
            history.pushState({}, '', '/404');
            await this.activateRoute();
        }
    }
}