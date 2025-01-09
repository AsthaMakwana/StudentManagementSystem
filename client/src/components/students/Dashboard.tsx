import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import studentStore from "../../mobx/studentStore";
import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/students/Dashboard.css';
import authStore from "../../mobx/authStore";
import { observer } from "mobx-react-lite";
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = observer(() => {
    const { students, loading, setStudents } = studentStore;
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [commonAgeGroup, setCommonAgeGroup] = useState<string>('');
    const [ageDistribution, setAgeDistribution] = useState<{ [key: string]: number }>({});

    const user = authStore.user;

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('authToken') || '';
        setStudents(1, 100, token, '', '');
        if (students) {
            setTotalStudents(students.length);
            calculateAgeGroup(students);
            calculateAgeDistribution(students);
        }
    }, [students, user]);

    const calculateAgeGroup = (students: any[]) => {
        const ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51+'];
        let ageGroupCount: { [key: string]: number } = {
            '0-10': 0,
            '11-20': 0,
            '21-30': 0,
            '31-40': 0,
            '41-50': 0,
            '51+': 0,
        };
        students.forEach(student => {
            const age = student.age;
            if (age <= 10) ageGroupCount['0-10'] += 1;
            else if (age <= 20) ageGroupCount['11-20'] += 1;
            else if (age <= 30) ageGroupCount['21-30'] += 1;
            else if (age <= 40) ageGroupCount['31-40'] += 1;
            else if (age <= 50) ageGroupCount['41-50'] += 1;
            else ageGroupCount['51+'] += 1;
        });
        const maxGroup = Object.keys(ageGroupCount).reduce((a, b) => ageGroupCount[a] > ageGroupCount[b] ? a : b);
        setCommonAgeGroup(maxGroup);
    };

    const calculateAgeDistribution = (students: any[]) => {
        const ageGroups = ['0-10', '11-20', '21-30', '31-40', '41-50', '51+'];
        let ageGroupCount: { [key: string]: number } = {
            '0-10': 0,
            '11-20': 0,
            '21-30': 0,
            '31-40': 0,
            '41-50': 0,
            '51+': 0,
        };
        students.forEach(student => {
            const age = student.age;
            if (age <= 10) ageGroupCount['0-10'] += 1;
            else if (age <= 20) ageGroupCount['11-20'] += 1;
            else if (age <= 30) ageGroupCount['21-30'] += 1;
            else if (age <= 40) ageGroupCount['31-40'] += 1;
            else if (age <= 50) ageGroupCount['41-50'] += 1;
            else ageGroupCount['51+'] += 1;
        });
        setAgeDistribution(ageGroupCount);
    };

    const ageDistributionData = {
        labels: Object.keys(ageDistribution),
        datasets: [
            {
                data: Object.values(ageDistribution),
                backgroundColor: ['#ffcc00', '#ff6666', '#ff3399', '#66ccff', '#66ff66', '#ff9900'],
            },
        ],
    };
    const chartOptions = {animation: false};

    return (
        <div className="dashboard-container">
            <ToastContainer />
            <div className="dashboard-header">
                <div className="stats-card">
                    <h2>Total Students</h2>
                    <p>{totalStudents}</p>
                </div>
                <div className="stats-card">
                    <h2>Most Common Age Group</h2>
                    <p>{commonAgeGroup}</p>
                </div>
            </div>
            <div className="dashboard-content">
                <div className="chart-card">
                    <h3>Age Distribution</h3>
                    <Pie data={ageDistributionData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
});

export default Dashboard;