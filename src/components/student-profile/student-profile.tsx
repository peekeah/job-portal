import { useContext } from 'react';
import styles from './index.module.css';
import { UserContext } from '../../contexts/user';

function StudentProfile() {
    const { userData } = useContext(UserContext);

    return (
        <>
            <h1>Student Profile</h1>
            <table className={styles.table} style={{ marginTop: '1.2rem' }}>
                <tr className={styles.table}>
                    <td className={styles.table} >Name</td>
                    <td className={styles.table} >{userData.name}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >Mobile</td>
                    <td className={styles.table} >{userData.mobile}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >Email</td>
                    <td className={styles.table} >{userData.email}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >College Name</td>
                    <td className={styles.table} >{userData.college.name}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >College Branch</td>
                    <td className={styles.table} >{userData?.college?.branch}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >College Joining Year</td>
                    <td className={styles.table} >{userData?.college?.joining_year}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >Interests</td>
                    <td className={styles.table} >{userData?.interest.join(', ')}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table} >Skills</td>
                    <td className={styles.table} >{userData?.skills.join(', ')}</td>
                </tr>
            </table>
        </>
    )
}

export default StudentProfile