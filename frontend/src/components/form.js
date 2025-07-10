import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
    constructor(openNewRoute, page) {
        this.processElement = null;
        this.openNewRoute = openNewRoute;
        this.page = page;
        this.errorElement = null;

        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '/';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/,
                valid: false
            }
        ];

        if (this.page === 'sign-up') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]+(\s[А-ЯЁ][а-яё]+)?$/,
                    valid: false
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]+(\s[А-ЯЁ][а-яё]+)?$/,
                    valid: false
                },
                {
                    name: 'passwordRepeat',
                    id: 'passwordRepeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/,
                    valid: false
                }
            );
        }

        window.requestAnimationFrame(() => {
            this.initForm();
        });
    }

    initForm() {
        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            if (item.element) {
                item.element.oninput = function () {
                    that.validateField.call(that, item, this);
                };
            }
        });

        this.rememberMeElement = document.getElementById('rememberMe');
        this.processElement = document.getElementById('process');
        this.errorElement = document.getElementById('loginError');

        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            };
        }
    }

    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add('is-invalid');
            field.valid = false;
        } else {
            element.classList.remove('is-invalid');
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        let validForm = this.fields.every(item => item.valid);

        const password = this.fields.find(f => f.name === 'password')?.element.value;
        const passwordRepeatField = this.fields.find(f => f.name === 'passwordRepeat');

        if (this.page === 'sign-up' && passwordRepeatField) {
            const passwordRepeat = passwordRepeatField.element.value;

            if (password !== passwordRepeat) {
                validForm = false;
                passwordRepeatField.element.classList.add('is-invalid');
            } else {
                passwordRepeatField.element.classList.remove('is-invalid');
            }
        }

        if (validForm) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }

        return validForm;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(f => f.name === 'email').element.value;
            const password = this.fields.find(f => f.name === 'password').element.value;
            const passwordRepeatField = this.fields.find(f => f.name === 'passwordRepeat');
            const passwordRepeat = passwordRepeatField?.element?.value || null;

            this.errorElement.innerText = '';
            this.errorElement.style.display = 'none';

            if (this.page === 'sign-up') {
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(f => f.name === 'name').element.value,
                        lastName: this.fields.find(f => f.name === 'lastName').element.value,
                        email,
                        password,
                        passwordRepeat
                    });

                    if (result?.user) {
                        const loginResult = await CustomHttp.request(config.host + '/login', 'POST', {
                            email,
                            password,
                            rememberMe: this.rememberMeElement?.checked || false
                        });

                        if (loginResult?.tokens) {
                            Auth.setTokens(loginResult.tokens.accessToken, loginResult.tokens.refreshToken);
                            Auth.setUserInfo({
                                fullName: `${loginResult.user.name} ${loginResult.user.lastName}`,
                                userId: loginResult.user.id
                            });
                            this.openNewRoute('/');
                            return;
                        } else {
                            throw new Error(loginResult?.message || 'Ошибка входа после регистрации');
                        }
                    } else {
                        throw new Error(result.message || 'Ошибка регистрации');
                    }
                } catch (error) {
                    this.showErrorMessage(error.message);
                    return;
                }
            }

            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email,
                    password,
                    rememberMe: this.rememberMeElement?.checked || false
                });

                if (result?.tokens) {
                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        fullName: `${result.user.name} ${result.user.lastName}`,
                        userId: result.user.id
                    });
                    this.openNewRoute('/');
                } else {
                    throw new Error(result?.message || 'Неверный email или пароль');
                }
            } catch (error) {
                this.showErrorMessage(error.message);
            }
        }
    }

    showErrorMessage(message) {
        if (this.errorElement) {
            let localized = message;
            if (message.includes('already exist')) {
                localized = 'Пользователь с таким email уже зарегистрирован';
            } else if (message.includes('invalid password') || message.includes('not found')) {
                localized = 'Неверный email или пароль';
            }

            this.errorElement.innerText = localized;
            this.errorElement.style.display = 'block';
        }
    }
}
