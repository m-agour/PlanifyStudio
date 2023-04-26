import { NotificationManager } from "react-notifications";
import Cookies from "universal-cookie";


const cookies = new Cookies();

export function showError(error, time_ms = 4000) {
    NotificationManager.error(error, "Error", time_ms);
}

export function showSuccess(success, time_ms = 4000) {
    NotificationManager.success(success, "Success", time_ms);
}


export function setToken(token) {
    cookies.set("token", token, { path: "/" });
}

export function setData(data) {
    for (let k in data)
        cookies.set(k, data[k], { path: "/" });
}

export function setID(token) {
    cookies.set("id", token, { path: "/" });
}

export function getToken() {
    return cookies.get("token");
}

export function getID(token) {
    return cookies.get("id");
}


export function isLoggedIn() {
    return getToken() && getID();
}



export function logOut() {
    cookies.remove("id");
    cookies.remove("token");


}
