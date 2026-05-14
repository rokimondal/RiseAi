"use client"

import React, { useEffect, useState } from 'react'
import InstructionPage from './InstructionPage';
import AssessmentForm from './AssessmentForm';
import { generateAssessmentCenter } from '@/actions/assessment-center';
import useFetch from '@/hooks/use-fetch';
import AssessmentPage from './AssessmentPage';

const AssessmentSteps = ({data}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(data.formData);

    const { loading: generating, fn: generateAssesmentFn, data: generatedAssesment } = useFetch(generateAssessmentCenter);

    useEffect(() => {
        console.log(formData);
    }, [formData])

    useEffect(() => {
        if (generatedAssesment) {
            console.log(generatedAssesment);
            setStep(3);
        }
    }, [generatedAssesment])

    const handleStartAssesment = async (values) => {
        try {
            if (!formData) {
                await generateAssesmentFn(values)
            } else {
                await generateAssesmentFn(formData);
            }
        } catch (error) {
            toast.error(error.message || "Failed to Design Coding Assesment");
        }
    }

    const loading = false;
    const handleSubmit = async(value)=>{
        console.log(value);
    }

    const dummyGeneratedAssesmentData = {
        "success": true,
        "data": {
            "assessmentMetadata": {
                "mode": "ROLE_BASED",
                "companyName": "Google",
                "examOrRole": "Senior Software Engineer",
                "totalQuestions": 40,
                "totalDurationMinutes": 60
            },
            "questions": [
                { "id": 1, "questionType": "SINGLE_SELECT", "question": "Which data structure is typically used to implement a LRU Cache?", "options": ["Queue", "Stack", "Doubly Linked List + HashMap", "Binary Search Tree"] },
                { "id": 2, "questionType": "SINGLE_SELECT", "question": "What is the time complexity of building a heap from an array of size n?", "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"] },
                { "id": 3, "questionType": "MULTI_SELECT", "question": "Which of the following are ACID properties in DBMS?", "options": ["Atomicity", "Consistency", "Isolation", "Durability", "Availability"] },
                { "id": 4, "questionType": "SHORT_ANSWER", "question": "What does the 'S' in SOLID principles stand for?", "options": [] },
                { "id": 5, "questionType": "SINGLE_SELECT", "question": "Which sorting algorithm has the best worst-case time complexity?", "options": ["Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort"] },
                { "id": 6, "questionType": "LONG_ANSWER", "question": "Explain how a Load Balancer handles session persistence (sticky sessions).", "options": [] },
                { "id": 7, "questionType": "SINGLE_SELECT", "question": "In React, what hook is used to handle side effects?", "options": ["useState", "useMemo", "useEffect", "useCallback"] },
                { "id": 8, "questionType": "SINGLE_SELECT", "question": "Which of these is a NoSQL database?", "options": ["PostgreSQL", "MongoDB", "MySQL", "Oracle"] },
                { "id": 9, "questionType": "SHORT_ANSWER", "question": "Define 'Idempotency' in the context of REST APIs.", "options": [] },
                { "id": 10, "questionType": "MULTI_SELECT", "question": "Which protocols operate at the Application Layer of the OSI model?", "options": ["HTTP", "FTP", "TCP", "DNS", "IP"] },
                { "id": 11, "questionType": "SINGLE_SELECT", "question": "What is a 'deadlock' in operating systems?", "options": ["A process that finished early", "A situation where processes are stuck waiting for each other", "A fast-running thread", "A memory leak"] },
                { "id": 12, "questionType": "SINGLE_SELECT", "question": "In Git, which command is used to combine two branches?", "options": ["git push", "git commit", "git merge", "git pull"] },
                { "id": 13, "questionType": "SHORT_ANSWER", "question": "What is the purpose of a Dockerfile?", "options": [] },
                { "id": 14, "questionType": "SINGLE_SELECT", "question": "What is the result of 2 + '2' in JavaScript?", "options": ["4", "'22'", "NaN", "Error"] },
                { "id": 15, "questionType": "SINGLE_SELECT", "question": "Which keyword is used to inherit a class in Java?", "options": ["extends", "implements", "inherits", "super"] },
                { "id": 16, "questionType": "MULTI_SELECT", "question": "Which of these are cloud service providers?", "options": ["AWS", "Azure", "GCP", "Oracle Cloud", "DigitalOcean"] },
                { "id": 17, "questionType": "LONG_ANSWER", "question": "Discuss the trade-offs between Monolithic and Microservices architecture.", "options": [] },
                { "id": 18, "questionType": "SINGLE_SELECT", "question": "What is 'Sharding' in database design?", "options": ["Data backup", "Horizontal partitioning", "Vertical partitioning", "Data encryption"] },
                { "id": 19, "questionType": "SHORT_ANSWER", "question": "What does CSS stand for?", "options": [] },
                { "id": 20, "questionType": "SINGLE_SELECT", "question": "Which data structure uses LIFO?", "options": ["Queue", "Stack", "Array", "Heap"] },
                { "id": 21, "questionType": "SINGLE_SELECT", "question": "What is the default port for HTTP?", "options": ["443", "80", "21", "22"] },
                { "id": 22, "questionType": "SINGLE_SELECT", "question": "What is 'Hoisting' in JavaScript?", "options": ["Moving declarations to the top", "Deleting variables", "A type of loop", "Error handling"] },
                { "id": 23, "questionType": "MULTI_SELECT", "question": "Which are valid HTTP methods?", "options": ["GET", "POST", "FETCH", "DELETE", "PATCH"] },
                { "id": 24, "questionType": "SHORT_ANSWER", "question": "What is a 'Foreign Key' in SQL?", "options": [] },
                { "id": 25, "questionType": "SINGLE_SELECT", "question": "Which design pattern ensures only one instance of a class exists?", "options": ["Factory", "Observer", "Singleton", "Strategy"] },
                { "id": 26, "questionType": "LONG_ANSWER", "question": "Explain the concept of 'Eventual Consistency' in distributed databases.", "options": [] },
                { "id": 27, "questionType": "SINGLE_SELECT", "question": "What is the purpose of the 'finally' block in try-catch-finally?", "options": ["To catch errors", "To execute code regardless of result", "To skip errors", "To exit the program"] },
                { "id": 28, "questionType": "SINGLE_SELECT", "question": "In Python, how do you create a dictionary?", "options": ["[]", "()", "{}", "<>"] },
                { "id": 29, "questionType": "SHORT_ANSWER", "question": "What is 'JSON'?", "options": [] },
                { "id": 30, "questionType": "MULTI_SELECT", "question": "Which of these are Linux distributions?", "options": ["Ubuntu", "CentOS", "Debian", "Fedora", "Windows"] },
                { "id": 31, "questionType": "SINGLE_SELECT", "question": "What does API stand for?", "options": ["Application Programming Interface", "Apple Process Integration", "Applied Program Index", "Automated Path Interface"] },
                { "id": 32, "questionType": "SINGLE_SELECT", "question": "Which operator is used for strict equality in JS?", "options": ["=", "==", "===", "!="] },
                { "id": 33, "questionType": "SHORT_ANSWER", "question": "What is 'Kubernetes' used for?", "options": [] },
                { "id": 34, "questionType": "SINGLE_SELECT", "question": "Which of these is a CSS framework?", "options": ["React", "Tailwind", "Django", "Laravel"] },
                { "id": 35, "questionType": "SINGLE_SELECT", "question": "What is 'Big O Notation' used for?", "options": ["Measuring code lines", "Analyzing algorithm efficiency", "Debugging", "Variable naming"] },
                { "id": 36, "questionType": "MULTI_SELECT", "question": "Identify functional programming languages.", "options": ["Haskell", "Lisp", "Scala", "Java", "C"] },
                { "id": 37, "questionType": "LONG_ANSWER", "question": "Describe the difference between a Process and a Thread.", "options": [] },
                { "id": 38, "questionType": "SINGLE_SELECT", "question": "What is the primary use of 'TypeScript'?", "options": ["Database queries", "Adding static types to JS", "Backend styling", "Image processing"] },
                { "id": 39, "questionType": "SHORT_ANSWER", "question": "What is 'Responsive Design'?", "options": [] },
                { "id": 40, "questionType": "SINGLE_SELECT", "question": "Which SQL command is used to remove all records from a table?", "options": ["DELETE", "REMOVE", "TRUNCATE", "DROP"] }
            ],
            "userName": "Alex Smith"
        }
    }

    switch (step) {
        case 1:
            return (
                <InstructionPage setStep={setStep} data={data} />
            )

        case 2:
            return (
                <AssessmentForm setStep={setStep} setFormData={setFormData} handleStartAssesment={handleStartAssesment} generatingAssesment={generating} />
            )
        case 3:
            return (
                <AssessmentPage assessmentData={generatedAssesment.data} loading={loading} handleSubmit={handleSubmit}/>
            )
        default:
            return null;
    }
    return (
        <div>CodingPageSteps</div>
    )
}

export default AssessmentSteps