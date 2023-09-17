import axios from 'axios';
import { useState } from 'react';

import styles from './index.module.css';
import DynamicInput from '../dynamicInput';

function StudentSignupForm() {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        profile_pic: '',
        college_name: '',
        college_branch: '',
        college_joining_year: '',
        interest: '',
        skills: '',
    });

    const [skills, setSkills] = useState(['']);
    const [interest, setInterest] = useState(['']);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {

        const college = {
            name: formData.college_name,
            branch: formData.college_branch,
            joining_year: formData.college_joining_year,
        }

        const payload = {
            ...formData, college, skills, interest
        }

        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/student/signup`;
            const response = await axios.post(url, payload);
            const token = response.data.data.token;
            localStorage.setItem('token', JSON.stringify(token));

        } catch (err) {
            alert(err.response.data.error)
            console.log(err);
        }
    }

    const handleReset = async () => {
        setFormData({
            name: '',
            mobile: '',
            email: '',
            password: '',
            profile_pic: '',
            college_name: '',
            college_branch: '',
            college_joining_year: '',
            interest: '',
            skills: '',
        })
    }

    const addSkill = () => {
        setSkills((prev) => [...prev, ''])
    }

    const removeSkill = (e) => {
        const name = Number(e.target.name);
        const filteredList = skills.filter((_, id) => id !== name);
        setSkills(filteredList);
    }

    const handleSkillChange = (e) => {
        const { name, value } = e.target;
        let skillsCopy = [...skills];
        skillsCopy[name] = value;
        setSkills(skillsCopy);
    }

    const addInterest = () => {
        setInterest((prev) => [...prev, ''])
    }

    const removeInterest = (e) => {
        const name = Number(e.target.name);
        const filteredList = interest.filter((_, id) => id !== name);
        setInterest(filteredList);
    }

    const handleInterestChange = (e) => {
        const { name, value } = e.target;
        let interestCopy = [...interest];
        interestCopy[name] = value;
        setInterest(interestCopy);
    } 


    return (
        <>
            <tr className={styles.tableRow}>
                <td>Name</td>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Mobile</td>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} />
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
                <td>College Name</td>
                <input type="text" name="college_name" value={formData.college_name} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>College Branch</td>
                <input type="text" name="college_branch" value={formData.college_branch} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>College Joining Year</td>
                <input type="number" name="college_joining_year" value={formData.college_joining_year} onChange={handleChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Interests</td>
                <DynamicInput inputArr={interest} addInput={addInterest} removeInput={removeInterest} handleChange={handleInterestChange} />
            </tr>
            <tr className={styles.tableRow}>
                <td>Skills</td>
                <DynamicInput inputArr={skills} addInput={addSkill} removeInput={removeSkill} handleChange={handleSkillChange} />
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

export default StudentSignupForm