import '../node_modules/bootstrap-icons/font/bootstrap-icons.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // Стили
import {Router} from "./router.js";
import "./styles/styles.scss";
import "./styles/sidebar.scss";

class App {
    constructor() {
        new Router();

    }
}

(new App());