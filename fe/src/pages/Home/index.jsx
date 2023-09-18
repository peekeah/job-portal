import { useNavigate } from 'react-router'
import styles from './index.module.css'
import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/user';

function Home() {
    const navigate = useNavigate();

    const { auth } = useContext(UserContext);

    useEffect(() => {
        if (auth) {
            navigate('/dashboard');
        }

    }, [])

    return (
        <div className={styles.container}b>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Signup</button>
        </div>
    )
}

export default Home