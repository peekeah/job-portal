import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/user';
import { useNavigate } from 'react-router-dom';

import styles from './index.module.css';

function PostedJobs() {

    const { auth, userType, config } = useContext(UserContext);

    const navigate = useNavigate();

    const [postedJobs, setPostedJobs] = useState([]);

    useEffect(() => {
        if (!auth || userType !== 'company') {
            navigate('/dashboard');
        }

        const getData = async () => {
            try {
                const url = `${process.env.REACT_APP_BACKEND_URL}/company/posted-jobs`;
                const res = await axios.get(url, config);
                setPostedJobs(res.data.data);
            } catch (err) {
                console.log(err);
            }
        }

        getData();

    }, [])

    const handleClick = (e) => navigate(`/applied-students/${e.target.name.toString()}`)

    return (
        <div className={styles.container}>
        <h1>Posted Jobs</h1>
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
                    <th className={styles.table}>Applied Candidates</th>
                </tr>
                {
                    postedJobs.map((job, id) => (
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
                                <td className={styles.table}>
                                    <button name={job._id} onClick={handleClick}>Applied Candidates</button>
                                </td>
                            </tr>
                        </>
                    ))
                }
            </table>
        </div>
    )
}

export default PostedJobs