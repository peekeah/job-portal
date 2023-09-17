import axios from 'axios';
import { useContext, useEffect, useState } from 'react';

import styles from './index.module.css';
import DynamicInput from '../../components/dynamicInput';
import { UserContext } from '../../contexts/user';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar';

function PostJob() {

    const [skills, setSkills] = useState(['']);

    const [formData, setFormData] = useState({
        job_role: '',
        description: '',
        ctc: '',
        stipend: '',
        location: '',
    })

    const { config, auth, userType } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth || userType !== 'company') {
            navigate('/dashboard');
        }
    }, [])

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        try {
            const payload = { ...formData, skills_required: skills }
            const url = `${process.env.REACT_APP_BACKEND_URL}/job`
            const response = await axios.post(url, payload, config)
            alert(response.data.data);
            navigate('/posted-jobs');
        } catch (err) {
            console.log(err)
            alert(err.response.data.error);
        }
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.rightContainer}>
                <h1>Post Job </h1>
                <table className={styles.table}>
                    <tr className={styles.tableRow}>
                        <td>Job Role</td>
                        <td>
                            <input type="text" value={formData.job_role} name='job_role' onChange={handleChange} />
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        <td>Description</td>
                        <td>
                            <textarea type="text" value={formData.description} name='description' onChange={handleChange} />
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        <td>CTC</td>
                        <td>
                            <input type="number" value={formData.ctc} name='ctc' onChange={handleChange} />
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        <td>Stipend</td>
                        <td>
                            <input type="number" value={formData.stipend} name='stipend' onChange={handleChange} />
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        <td>Location</td>
                        <td>
                            <input type="text" value={formData.location} name='location' onChange={handleChange} />
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        <td>Skills Required</td>
                        <td>
                            <DynamicInput inputArr={skills} addInput={addSkill} removeInput={removeSkill} handleChange={handleSkillChange} />
                        </td>
                    </tr>
                </table>
                <button className={styles.submitBtn} onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    )

}

export default PostJob