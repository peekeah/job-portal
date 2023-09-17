import { useState } from 'react';
import StudentSignupForm from '../../components/studentSignupForm';
import styles from './index.module.css';
import CompanySignupForm from '../../components/companySignupForm';

function Signup() {

    const [formData, setFormData] = useState({
        userType: 'student'
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className={styles.container}>
            <h1>Signup</h1>
            <table className={styles.table}>
                <tr className={styles.tableRow}>
                    <td>User Type</td>
                    <select name="userType" value={formData.userType} onChange={handleChange}>
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                    </select>
                </tr>
                {formData.userType === 'student' ? <StudentSignupForm /> : <CompanySignupForm />}
            </table>
        </div>
    )
}

export default Signup