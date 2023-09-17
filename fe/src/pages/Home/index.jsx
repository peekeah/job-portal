import { useNavigate } from 'react-router'
import styles from './index.module.css'

function Home() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}b>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Signup</button>
        </div>
    )
}

export default Home