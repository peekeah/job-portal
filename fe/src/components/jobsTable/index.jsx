import styles from './index.module.css';

function JobsTable({ jobs, handleClick, userType }) {
    return (
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
                <th className={styles.table}>
                    {userType === 'student' ? 'Apply' : 'Applied Candidates'}
                </th>
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
                            <td className={styles.table}>
                                {
                                    userType === 'student' ?
                                        <button name={job._id} onClick={handleClick}>Apply</button> :
                                        <button onClick={handleClick}>Applied Candidates</button>
                                }
                            </td>
                        </tr>
                    </>
                ))
            }
        </table>
    )
}

export default JobsTable;