import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
    constructor(openNewRoute, page) {
        this.processElement = null;
        this.openNewRoute = openNewRoute;
        this.page = page;

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
                regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/,
                valid: false,
            }
        ];

        if (this.page === 'sign-up') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                },
                {
                    name: 'passwordRepeat',
                    id: 'passwordRepeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/,
                    valid: false,
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

        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            };
        }
    }

    validateField(field, element) {
        const isValid = element.value && element.value.match(field.regex);
        const inputGroup = element.closest('.input-group');

        if (!isValid) {
            element.classList.add('is-invalid');
            element.classList.remove('is-valid');
            if (inputGroup) inputGroup.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.classList.remove('is-invalid');
            element.classList.add('is-valid');
            if (inputGroup) inputGroup.style.borderColor = '#E9ECEF';
            field.valid = true;
        }

        this.validateForm();
    }

    validateForm() {
        let validForm = this.fields.every(item => item.valid);

        // Дополнительная проверка совпадения паролей при регистрации
        if (this.page === 'sign-up') {
            const passwordField = this.fields.find(f => f.name === 'password');
            const repeatField = this.fields.find(f => f.name === 'passwordRepeat');

            const password = passwordField?.element?.value;
            const passwordRepeat = repeatField?.element?.value;

            if (password !== passwordRepeat) {
                repeatField.valid = false;
                repeatField.element.classList.add("is-invalid");
                validForm = false;
            } else {
                repeatField.valid = true;
                repeatField.element.classList.remove("is-invalid");
            }
        }


        if (validForm) {
            this.processElement.removeAttribute("disabled");
        } else {
            this.processElement.setAttribute("disabled", "disabled");
        }

        return validForm;
    }


    async processForm() {
        if (!this.validateForm()) return;

        const email = this.fields.find(f => f.name === 'email').element.value;
        const password = this.fields.find(f => f.name === 'password').element.value;
        const passwordRepeatField = this.fields.find(f => f.name === 'passwordRepeat');
        const passwordRepeat = passwordRepeatField ? passwordRepeatField.element.value : null;

        if (this.page === 'sign-up') {
            try {
                const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                    name: this.fields.find(f => f.name === 'name').element.value,
                    lastName: this.fields.find(f => f.name === 'lastName').element.value,
                    email: email,
                    password: password,
                    passwordRepeat: passwordRepeat,
                });

                if (result && (!result.error && result.user)) {
                    const loginResult = await CustomHttp.request(config.host + '/login', 'POST', {
                        email,
                        password,
                        rememberMe: this.rememberMeElement?.checked || false
                    });
                    console.log('Login result:', loginResult);

                    if (loginResult && loginResult.tokens) {
                        Auth.setTokens(loginResult.tokens.accessToken, loginResult.tokens.refreshToken);
                        Auth.setUserInfo({
                            fullName: `${loginResult.user.name} ${loginResult.user.lastName}`,
                            userId: loginResult.user.id
                        });
                        this.openNewRoute('/');
                        return;
                    }

                    throw new Error(loginResult?.message || 'Ошибка входа после регистрации');
                } else {
                    throw new Error(result.message || 'Ошибка регистрации');
                }

            } catch (error) {
                console.error(error);
                return;
            }
        }

        try {
            const result = await CustomHttp.request(config.host + '/login', 'POST', {
                email,
                password,
                rememberMe: this.rememberMeElement?.checked || false
            });

            if (result && result.tokens && result.user) {
                Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                Auth.setUserInfo({
                    fullName: `${result.user.name} ${result.user.lastName}`,
                    userId: result.user.id
                });
                this.openNewRoute('/');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
        }
    }
}
