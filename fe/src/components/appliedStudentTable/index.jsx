import { useState } from 'react';
import styles from './index.module.css';

function AppliedStudentsTable({ students, filterType, handleChange, handleSubmit }) {

    return <>
        <h1>{filterType} Candidates</h1>
        {
            students && students.length > 0 ?
                <table className={styles.table}>
                    <tr>
                        <th className={styles.table}>#</th>
                        <th className={styles.table}>Name</th>
                        <th className={styles.table}>Email</th>
                        <th className={styles.table}>College</th>
                        <th className={styles.table}>Skills</th>
                        <th className={styles.table}>Bio</th>
                        <th className={styles.table}>Status</th>
                        <th className={styles.table}>Update</th>
                    </tr>
                    {
                        students.map((student, id) => (
                            <>
                                <tr>
                                    <td className={styles.table}>{id + 1}</td>
                                    <td className={styles.table}>{student.name}</td>
                                    <td className={styles.table}>{student.email}</td>
                                    <td className={styles.table}>{student?.college?.name}</td>
                                    <td className={styles.table}>{student.skills.join(', ')}</td>
                                    <td className={styles.table}>{student.bio}</td>
                                    <td className={styles.table}>
                                        <select name={student._id} value={student.updatedStatus} onChange={(e) => handleChange(e, filterType.toLowerCase())} >
                                            <option value="applied">Apply</option>
                                            <option value="shortlisted">Shortlist</option>
                                            <option value="hired">Hire</option>
                                        </select>
                                    </td>
                                    <td className={styles.table}>
                                        <button className={styles.updateBtn} name={student._id} onClick={(e) => handleSubmit(e, student.updatedStatus)}>Update</button>
                                    </td>
                                </tr>
                            </>
                        ))
                    }
                </table> : null
        }

    </>
}

export default AppliedStudentsTable;