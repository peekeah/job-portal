import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/user';

export default function Sidebar() {

  const navigate = useNavigate();
  const { handleLogout, userType } = useContext(UserContext);

  const [navlinks, setNavlinks] = useState([]);

  useEffect(() => {
    let navlinks;
    if (userType === 'student') {
      navlinks = [
        { name: 'Applied Jobs', path: '/applied-jobs' },
      ]
    } else {
      navlinks = [
        { name: 'Post Job', path: '/post-job' },
        { name: 'Posted Jobs', path: '/posted-jobs' },
      ]
    }
    setNavlinks(navlinks)
  }, [])

  const logout = () => {
    handleLogout();
    navigate('/');
  }

  return (
    <div>
      <div className={styles.sidebar}>
        <div className={styles.sidebarBtn} onClick={() => navigate('/dashboard')}>Dashboard</div>
        {
          navlinks.map(link => (
            <>
              <div className={styles.sidebarBtn} onClick={() => navigate(`${link.path}`)}>{link.name}</div>
            </>
          ))
        }
        {/* <div className={styles.sidebarBtn} onClick={() => navigate('/applied-jobs')}>Applied Jobs</div> */}
        <div className={styles.sidebarBtn} onClick={logout}>Logout</div>
      </div>
    </div>

  )
}
