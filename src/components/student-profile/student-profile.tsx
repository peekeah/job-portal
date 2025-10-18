const userData = {
  name: "Pranay Sharma",
  mobile: "+91 9876543210",
  email: "pranay.sharma@example.com",
  college: {
    name: "Indian Institute of Technology, Bombay",
    branch: "Computer Science and Engineering",
    joining_year: 2021,
  },
  interest: ["Artificial Intelligence", "Web3", "Chess", "Music Production"],
  skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "Prisma", "PostgreSQL"],
};

function StudentProfile() {

  return (
    <div className='p-5'>
      <h1 className='py-1 text-2xl font-semibold'>Student Profile</h1>

      <div className='grid grid-cols-2 w-1/2 mx-auto pt-42'>
        <div >Name</div>
        <div >{userData?.name}</div>
        <div >Mobile</div>
        <div >{userData?.mobile}</div>
        <div >Email</div>
        <div >{userData?.email}</div>
        <div >College Name</div>
        <div >{userData?.college.name}</div>
        <div >College Branch</div>
        <div >{userData?.college?.branch}</div>
        <div >College Joining Year</div>
        <div >{userData?.college?.joining_year}</div>
        {/* <div >Interests</div> */}
        {/* <div >{userData?.interest?.join(', ')}</div> */}
      </div >
    </div>
  )
}

export default StudentProfile
