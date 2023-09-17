import { useContext, useState } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/user';
import styles from './index.module.css';

function CompanySignupForm() {

    const navigate = useNavigate();
    const { handleLogin, getProfileData } = useContext(UserContext);

    const [formData, setFormData] = useState({
        name: '',
        founding_year: '',
        company_type: '',
        email: '',
        password: '',
        contact_no: '',
        website: '',
        state: '',
        size: '',
        bio: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {

        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/company/signup`;
            const response = await axios.post(url, formData);

            const token = response.data.data.token;
            handleLogin(token, 'company');
            getProfileData(token, 'company');
            navigate('/dashboard');

        } catch (err) {
            alert(err.response.data.error)
            console.log(err);
        }
    }

    const handleReset = async () => {
        setFormData({
            name: '',
            founding_year: '',
            company_type: '',
            email: '',
            password: '',
            contact_no: '',
            website: '',
            state: '',
            size: '',
            bio: ''
        })
    }

    return (
        <>
            <tr className={styles.tableRow}>
                <td>Company Name</td>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Year Founded</td>
                <input type="text" name="founding_year" value={formData.founding_year} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Company Type</td>
                <input type="text" name="company_type" value={formData.company_type} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Email</td>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Password</td>
                <input type="password" name="password" value={formData.password} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Phone No</td>
                <input type="text" name="contact_no" value={formData.contact_no} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Website</td>
                <input type="text" name="website" value={formData.website} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>State</td>
                <input type="text" name="state" value={formData.state} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Company Size</td>
                <select value={formData.size} onChange={handleChange} name='size'>
                    <option value='1-10'>1-10</option>
                    <option value='10-50'>10-50</option>
                    <option value='50-100'>50-100</option>
                    <option value='100+'>100+</option>
                </select>
            </tr>
            <tr className={styles.tableRow}>
                <td>Company Bio</td>
                <input type="textarea" name="bio" value={formData.bio} onChange={handleChange} />
            </tr>
            <tr>
                <td>
                    <button className={styles.submitBtn} onClick={handleSubmit}>Submit</button>
                </td>
                <td>
                    <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
                </td>
            </tr>
        </>
    )
}

export default CompanySignupForm