import { useContext, useEffect, useState } from 'react';
import axios from 'axios';

import { UserContext } from '../../contexts/user';
import styles from './index.module.css';

function Dashboard() {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
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


    const applyJob = async(e) => {

        console.log(e.target.name)
    }

    return (
        <div className={styles.container}>
            {/* <div className={styles.sidebar}>
                <button>Dashboard</button>
                <button>Dashboard</button>
                <button>Dashboard</button>
            </div> */}
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
                        <th className={styles.table}>Apply</th>
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
                                    <td className={styles.table}><button name={job._id} onClick={applyJob}>Apply</button></td>
                                </tr>
                            </>
                        ))
                    }
                </table>
            </div>
        </div>
    )
}

export default Dashboard