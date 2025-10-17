"use client"
import axios from 'axios';
import { ChangeEvent, useContext, useState } from 'react';

import styles from './index.module.css';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

function StudentSignupForm() {


    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        profile_pic: '',
        college_name: '',
        college_branch: '',
        college_joining_year: '',
        interest: '',
        skills: '',
    });

    const [skills, setSkills] = useState(['']);
    const [interest, setInterest] = useState(['']);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {

        const college = {
            name: formData.college_name,
            branch: formData.college_branch,
            joining_year: formData.college_joining_year,
        }

        const payload = {
            ...formData, college, skills, interest
        }

        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/student/signup`;
            const response = await axios.post(url, payload);

            const token = response.data.data.token;

        } catch (err) {
            alert(err.response.data.error)
            console.log(err);
        }
    }

    const handleReset = async () => {
        setFormData({
            name: '',
            mobile: '',
            email: '',
            password: '',
            profile_pic: '',
            college_name: '',
            college_branch: '',
            college_joining_year: '',
            interest: '',
            skills: '',
        })
    }

    const addSkill = () => {
        setSkills((prev) => [...prev, ''])
    }

    const removeSkill = (e) => {
        const name = Number(e.target.name);
        const filteredList = skills.filter((_, id) => id !== name);
        setSkills(filteredList);
    }

    const handleSkillChange = (e) => {
        const { name, value } = e.target;
        let skillsCopy = [...skills];
        skillsCopy[name] = value;
        setSkills(skillsCopy);
    }

    const addInterest = () => {
        setInterest((prev) => [...prev, ''])
    }

    const removeInterest = (e) => {
        const name = Number(e.target.name);
        const filteredList = interest.filter((_, id) => id !== name);
        setInterest(filteredList);
    }

    const handleInterestChange = (e) => {
        const { name, value } = e.target;
        let interestCopy = [...interest];
        interestCopy[name] = value;
        setInterest(interestCopy);
    }


    return (
        <div className='space-y-8'>
            <div className='grid grid-cols-2 gap-4'>
                <Input
                    label="Name"
                    placeholder='Enter your full name'
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
                <Input
                    label="Mobile"
                    placeholder='Mobile Number'
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                />
                <Input
                    label="Email"
                    placeholder='Email Address'
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <Input
                    label="Password"
                    placeholder='Password'
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <Input
                    label="College Name"
                    placeholder='College Name'
                    type="text"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleChange}
                />
                <Input
                    label="College Branch"
                    placeholder='College Branch'
                    name="college_branch"
                    value={formData.college_branch}
                    onChange={handleChange}
                />
                <Input
                    label="College Joining Year"
                    placeholder='College Joining Year'
                    type="number"
                    name="college_joining_year"
                    value={formData.college_joining_year}
                    onChange={handleChange}
                />

            </div>
            <div className='flex gap-2'>
                <Button onClick={handleSubmit}>Submit</Button>
                <Button className='bg-red-300 hover:bg-red-500 transition-all' onClick={handleReset}>Reset</Button>
            </div>
        </div>

    )
}

export default StudentSignupForm