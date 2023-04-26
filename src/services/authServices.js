import axios from "axios";
import {setToken, setID, showError, setData} from "./helpers";
import jwt_decode from "jwt-decode";


const endPoint = process.env.REACT_APP_BACKEND_URL
const signUpEndPoint = endPoint + '/signup/'
const logInEndPoint = endPoint + '/signin/'


export async function signup(userData) {
    try {
        const response = await axios.post(signUpEndPoint, userData);
        const token = response.data.jwt;

        try{
            setToken(token);
            const decoded = jwt_decode(token);
            setID(decoded.userId)
            if (response.status === 200) return true;
            return false
        }
        catch (err) {
            showError(err);
            return false;
        }

    } catch (err) {
        if (err.response) {
            showError(err.response.data.error);
            return false;
        } else {
            showError("Server is down!");
            return false;
        }
    }
}

export async function login(userData) {
    try {
        const response = await axios.post(logInEndPoint, userData);
        const token = response.data.jwt;

        setToken(token);
        const decoded = jwt_decode(token);
        setID(decoded.userId)
        setData(response.data.user)
        if (response.status === 200) return true;
        return false

    } catch (err) {
        if (err.response) {
            showError(err.response.data.error);
            return false;
        } else {
            showError("Server is down!");
            return false;
        }
    }
}