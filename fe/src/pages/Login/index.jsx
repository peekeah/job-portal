import { useContext, useEffect, useState } from 'react';
import axios from 'axios';

import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/user';

function Login() {
    const navigate = useNavigate();

    const { handleLogin, auth } = useContext(UserContext);

    const [user, setUser] = useState({
        email: '',
        password: '',
        userType: 'student'
    });

    useEffect(() => {
        if (auth) {
            navigate('/dashboard');
        }

    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        let host = process.env.REACT_APP_BACKEND_URL;
        if (user.userType === 'student') {
            host += '/student/login'
        } else {
            host += '/company/login'
        }

        try {
            const response = await axios.post(host, user);
            const token = response.data.data.token;
            handleLogin(token, user.userType);
            navigate('/dashboard');

        } catch (err) {
            alert(err.response.data.error)
            console.log(err);
        }
    }

    const handleReset = () => {
        setUser({
            email: '',
            password: '',
            userType: 'student'
        })
    }

    return (
        <div className={styles.container}>
            <h1>Signup</h1>
            <table className={styles.table}>
                <tr className={styles.tableRow}>
                    <td>User Type</td>
                    <select name="userType" value={user.userType} onChange={handleChange}>
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                    </select>
                </tr>
                <tr className={styles.tableRow}>
                    <td>Email</td>
                    <input type="text" name="email" value={user.email} onChange={handleChange} />
                </tr>
                <tr className={styles.tableRow}>
                    <td>Password</td>
                    <input type="password" name="password" value={user.password} onChange={handleChange} />
                </tr>
                <tr>
                    <td>
                        <button className={styles.submitBtn} onClick={handleSubmit}>Submit</button>
                    </td>
                    <td>
                        <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
                    </td>
                </tr>
            </table>
        </div>
    )
}

export default Login