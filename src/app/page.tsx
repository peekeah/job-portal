import Link from "next/link";
import styles from "./index.module.css"

export default function Home() {
  return (
    <div className={styles.container} >
      <Link href="/login" className={styles.loginBtn}>Login</Link>
      <Link href="/signup" className={styles.signupBtn}>Signup</Link>
    </div>
  );
}
