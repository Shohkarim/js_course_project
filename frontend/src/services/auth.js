import config from "../../config/config.js";

export class Auth {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoKey = 'userInfo';

    static async processUnauthorizedResponse() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            try {
                const response = await fetch(config.host + '/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-type': "application/json",
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken})
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.tokens && !result.error) {
                        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        return true;
                    }
                }
            } catch (e) {
                console.error('Ошибка при обновлении токена:', e);
            }
        }

        this.removeTokens();
        localStorage.removeItem(this.userInfoKey);
        window.location.href = '/login';
        return false;
    }

    static async logout() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            try {
                const response = await fetch(config.host + '/logout', {
                    method: 'POST',
                    headers: {
                        'Content-type': "application/json",
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken})
                });

                if (response.ok) {
                    const result = await response.json();
                    if (!result.error) {
                        this.removeTokens();
                        localStorage.removeItem(this.userInfoKey);
                        localStorage.removeItem('userEmail');
                        return true;
                    }
                }
            } catch (e) {
                console.error('Ошибка при выходе:', e);
            }
        }
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    static removeTokens() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    static setUserInfo(info) {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    static getUserInfo() {
        const userInfo = localStorage.getItem(this.userInfoKey);
        return userInfo ? JSON.parse(userInfo) : null;
    }
}
