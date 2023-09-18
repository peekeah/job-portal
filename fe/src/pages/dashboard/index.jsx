import { useContext, useEffect, useState } from 'react';
import axios from 'axios';

import { UserContext } from '../../contexts/user';
import styles from './index.module.css';
import Sidebar from '../../components/sidebar';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [jobs, setJobs] = useState([]);

    const { config, userType, auth } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {

        if(!auth){
            navigate('/');
        }
        const url = process.env.REACT_APP_BACKEND_URL;

        const getJobs = async () => {
            try {
                const response = await axios.get(`${url}/job`);
                setJobs(response.data.data);
            } catch (err) {
                console.log(err);
            }
        }

        getJobs();

    }, []);


    const applyJob = async (e) => {
        try {
            const jobId = e.target.name;
            const url = process.env.REACT_APP_BACKEND_URL;
            const response = await axios.post(`${url}/job/apply/${jobId}`, {}, config);
            alert(response.data.data);

        } catch (err) {
            alert(err.response.data.error)
            console.log(err);
        }
    }

    return (
        <>
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.rightContainer}>
                    <h1>Jobs</h1>
                    <table className={styles.table}>
                        <tr>
                            <th className={styles.table}>#</th>
                            <th className={styles.table}>Company Name</th>
                            <th className={styles.table}>Job Role</th>
                            <th className={styles.table}>Description</th>
                            <th className={styles.table}>CTC</th>
                            <th className={styles.table}>Stipend</th>
                            <th className={styles.table}>Location</th>
                            <th className={styles.table}>Required Skills</th>
                            {userType === 'student' ? <th className={styles.table}>Apply</th> : null}
                        </tr>
                        {
                            jobs.map((job, id) => (
                                <>
                                    <tr>
                                        <td className={styles.table}>{id + 1}</td>
                                        <td className={styles.table}>{job.company.name}</td>
                                        <td className={styles.table}>{job.job_role}</td>
                                        <td className={styles.table}>{job.description}</td>
                                        <td className={styles.table}>{job.ctc}</td>
                                        <td className={styles.table}>{job.stipend}</td>
                                        <td className={styles.table}>{job.location}</td>
                                        <td className={styles.table}>{job.skills_required.join(', ')}</td>
                                        {userType === 'student' ? <td className={styles.table}><button name={job._id} onClick={applyJob}>Apply</button></td> : null}
                                    </tr>
                                </>
                            ))
                        }
                    </table>
                </div>
            </div>
        </>
    )
}

export default Dashboard