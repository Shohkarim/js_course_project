import {Auth} from "./auth";

export class CustomHttp {
    static async request(url, method = "GET", body = null) {
        const params = {
            method: method,
            headers: {
                'Content-type': "application/json",
                'Accept': 'application/json',
            }
        };

        const token = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-auth-token'] = token;
        }

        if (body && method !== 'GET' && method !== 'HEAD') {
            params.body = JSON.stringify(body);
        }

        let response;
        try {
            response = await fetch(url, params);
        } catch (e) {
            return {error: true, message: 'Ошибка соединения с сервером'};
        }

        let responseBody;
        try {
            responseBody = await response.json();
        } catch (e) {
            return {error: true, message: 'Некорректный ответ от сервера'};
        }

        if (!response.ok) {
            if (response.status === 401) {
                const renewed = await Auth.processUnauthorizedResponse();
                if (renewed) {
                    return await this.request(url, method, body);
                } else {
                    return null;
                }
            }

            return {
                error: true,
                message: responseBody?.message || 'Произошла ошибка',
            };
        }

        return responseBody;
    }
}
