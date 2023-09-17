import { useContext, useEffect } from "react"
import { UserContext } from "../../contexts/user"
import { useNavigate } from "react-router-dom";

function AppliedJobs() {

    const { auth, userType } = useContext(UserContext);

    const navigate = useNavigate();

    useEffect(() => {

        if(!auth || userType !== 'student'){
            navigate('/dashboard');
        }

    }, [])


    return (
        <div>AppliedJobs</div>
    )
}

export default AppliedJobs