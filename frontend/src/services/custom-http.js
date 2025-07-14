import {Auth} from "./auth.js";

export class CustomHttp {
    static async request(url, method = "GET", body = null) {
        const params = {
            method: method,
            headers: {
                'Content-type': "application/json",
                'Accept': 'application/json'
            }
        };

        const token = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-access-token'] = token;
        }

        if (body && method !== 'GET' && method !== 'HEAD') {
            params.body = JSON.stringify(body);
        }

        const response = await fetch(url, params);

        let responseBody;
        try {
            responseBody = await response.json();
        } catch (e) {
            throw new Error('Некорректный ответ от сервера');
        }

        if (!response.ok) {
            if (response.status === 401) {
                const result = await Auth.processUnauthorizedResponse();
                if (result) {
                    return await this.request(url, method, body);
                } else {
                    return null;
                }
            }
            // ⚠️ Вместо выброса — верни объект с error = true
            return {
                error: true,
                message: responseBody?.message || 'Произошла ошибка',
            };
        }

        return responseBody;
    }
}
