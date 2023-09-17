import { useContext } from 'react';
import CompanyProfile from '../../components/companyProfile';
import Sidebar from '../../components/sidebar';
import StudentProfile from '../../components/studentProfile';
import { UserContext } from '../../contexts/user';
import styles from './index.module.css';

function Profile() {

    const { userType } = useContext(UserContext);

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.rightContainer}>
                {
                    userType === 'student' ? <StudentProfile /> : <CompanyProfile />
                }
            </div>
        </div>
    )
}

export default Profile