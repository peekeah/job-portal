import { useContext } from 'react';
import styles from './index.module.css';
import { UserContext } from '../../contexts/user';

function CompanyProfile() {
    const { userData } = useContext(UserContext);

    return (
        <>
            <h1>Company Profile</h1>

            <table className={styles.table} style={{ marginTop: '1.2rem'}}>
                <tr className={styles.table}>
                    <td className={styles.table}>Company Name</td>
                    <td className={styles.table}>{userData.name}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Year Founded</td>
                    <td className={styles.table}>{userData.founding_year}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Company Type</td>
                    <td className={styles.table}>{userData.company_type}</td>

                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Email</td>
                    <td className={styles.table}>{userData.email}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Phone No</td>
                    <td className={styles.table}>{userData.contact_no}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Website</td>
                    <td className={styles.table}>{userData.website}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>State</td>
                    <td className={styles.table}>{userData.state}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Company Size</td>
                    <td className={styles.table}>{userData.size}</td>
                </tr>
                <tr className={styles.table}>
                    <td className={styles.table}>Company Bio</td>
                    <td className={styles.table}>{userData.bio}</td>
                </tr>
            </table>

        </>
    )
}

export default CompanyProfile