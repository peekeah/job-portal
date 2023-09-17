import { useContext, useEffect, useState } from 'react';
import styles from './index.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/user';
import AppliedStudentsTable from '../../components/appliedStudentTable';

function AppliedCandidates() {

    const [appliedStudents, setAppliedStudents] = useState([]);
    const [hiredStudents, setHiredStudents] = useState([]);
    const [shortlistedStudents, setShortlistedStudents] = useState([]);

    const navigate = useNavigate();

    const { id } = useParams();
    const { config } = useContext(UserContext);

    useEffect(() => {
        if (!id) {
            navigate('/posted-jobs');
        }
        getData();
    }, [])

    const getData = async () => {
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/job/applied-students/${id}`
            const response = await axios.get(url, config);
            const applicants = response.data.data;

            setAppliedStudents(applicants.applied.map(student => ({ ...student, updatedStatus: 'applied' })));
            setShortlistedStudents(applicants.shortlisted.map(student => ({ ...student, updatedStatus: 'shortlisted' })));
            setHiredStudents(applicants.hired.map(student => ({ ...student, updatedStatus: 'hired' })));

        } catch (err) {
            console.log(err);
        }
    }

    const handleChange = (e, previousStatus) => {
        const id = e.target.name;
        const updatedStatus = e.target.value;

        if (previousStatus === 'applied') {
            let appliedStudentsCopy = [...appliedStudents].map(student => {
                if (student._id === id) {
                    student.updatedStatus = updatedStatus;
                }
                return student;
            });

            setAppliedStudents(appliedStudentsCopy);
        }
        else if (previousStatus === 'shortlisted') {
            let shortlistedStudentsCopy = [...shortlistedStudents].map(student => {
                if (student._id === id) {
                    student.updatedStatus = updatedStatus;
                }
                return student;
            });

            setShortlistedStudents(shortlistedStudentsCopy);
        }
        else if (previousStatus === 'hired') {
            let hiredStudentsCopy = [...hiredStudents].map(student => {
                if (student._id === id) {
                    student.updatedStatus = updatedStatus;
                }
                return student;
            });

            setHiredStudents(hiredStudentsCopy);
        }
    }

    const handleSubmit = async (e, updatedStatus) => {
        try {
            const payload = {
                jobId: id,
                studentId: e.target.name,
                applicantStatus: updatedStatus
            }

            const url = `${process.env.REACT_APP_BACKEND_URL}/job/select-candidate`
            const response = await axios.post(url, payload, config);
            getData();
            alert(response.data.data);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className={styles.container}>
            <AppliedStudentsTable students={appliedStudents} filterType="Applied" handleChange={handleChange} handleSubmit={handleSubmit} />
            <AppliedStudentsTable students={shortlistedStudents} filterType="Shortlisted" handleChange={handleChange} handleSubmit={handleSubmit} />
            <AppliedStudentsTable students={hiredStudents} filterType="Hired" handleChange={handleChange} handleSubmit={handleSubmit} />
        </div>
    )
}

export default AppliedCandidates