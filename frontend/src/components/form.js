import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {
        this.processElement = null;
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
            },
        ];
        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'name',
                    id: "name",
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
                });
        }


        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });
        this.processElement = document.getElementById("process");
        this.processElement.onclick = function () {
            that.processForm();
        }
    }


    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.parentNode.style.borderColor = "red";
            field.valid = false;
        } else {
            element.parentNode.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        if (validForm) {
            this.processElement.removeAttribute("disabled");
        } else {
            this.processElement.setAttribute("disabled", 'disabled');
        }
        return validForm;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name').element.value,
                        lastName: this.fields.find(item => item.name === 'lastName').element.value,
                        email: email,
                        password: password,
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }
            }


            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                });

                if (result) {
                    if (result.error || !result.accessToken || !result.refreshToken
                        || !result.fullName || !result.userId) {
                        throw new Error(result.message);
                    }

                    Auth.setTokens(result.accessToken, result.refreshToken);
                    Auth.setUserInfo({
                        fullName: result.fullName,
                        userId: result.userId
                    });
                    localStorage.setItem('userEmail', email);
                    location.href = "/";
                }
            } catch (error) {
                console.log(error);
            }

        }
    }
}