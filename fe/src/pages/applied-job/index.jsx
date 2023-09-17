import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../contexts/user"
import { useNavigate } from "react-router-dom";

import styles from "./index.module.css";
import axios from "axios";

function AppliedJobs() {

    const [appliedJobs, setAppliedJobs] = useState([]);

    const { auth, userType, config } = useContext(UserContext);

    const navigate = useNavigate();

    useEffect(() => {
        if (!auth || userType !== 'student') {
            navigate('/dashboard');
        }

        getData();

    }, []);

    const getData = async () => {
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/student/applied-jobs`;
            const res = await axios.get(url, config);
            setAppliedJobs(res.data.data);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className={styles.container}>
            <h1>Applied Jobs</h1>

            {
                appliedJobs.length > 0 ?
                    <table className={styles.table}>
                        <tr>
                            <th className={styles.table}>#</th>
                            <th className={styles.table}>Company Name</th>
                            <th className={styles.table}>Job Role</th>
                            <th className={styles.table}>Description</th>
                            <th className={styles.table}>CTC</th>
                            <th className={styles.table}>Location</th>
                            <th className={styles.table}>Status</th>
                        </tr>
                        {
                            appliedJobs.map((job, id) => (
                                <>
                                    <tr>
                                        <td className={styles.table}>{id + 1}</td>
                                        <td className={styles.table}>{job.job_id.company.name}</td>
                                        <td className={styles.table}>{job.job_id.job_role}</td>
                                        <td className={styles.table}>{job.job_id.description}</td>
                                        <td className={styles.table}>{job.job_id.ctc}</td>
                                        <td className={styles.table}>{job.job_id.location}</td>
                                        <td className={styles.table}>{job.status}</td>
                                    </tr>
                                </>
                            ))
                        }
                    </table> : null
            }

        </div>
    )
}

export default AppliedJobs