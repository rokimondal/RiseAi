import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CoverLetterList from './_components/CoverLetterList'
import { getCoverLetters } from '@/actions/cover-leter'

const CoverLetterPage = async () => {
  const coverLetters = await getCoverLetters()

  /*const coverLetters = [
    {
      id: "cl_001a",
      userId: "user_123",
      content: `Dear Hiring Manager,
    
I am excited to apply for the Frontend Developer position at NovaTech. With strong skills in React, Tailwind CSS, and modern UI/UX design principles, I am confident that I can contribute to creating visually appealing and high-performing interfaces for your users.
    
Thank you for considering my application.
    
Best regards,  
Roki Mondal`,
      jobDescription: "Looking for a React developer with 2+ years of experience in building modern UIs using Tailwind CSS.",
      companyName: "NovaTech",
      jobTitle: "Frontend Developer",
      status: "completed",
      createdAt: new Date("2025-09-28T10:00:00Z"),
      updateAt: new Date("2025-09-30T12:00:00Z"),
    },
    {
      id: "cl_002b",
      userId: "user_123",
      content: `Dear Recruiter,
    
As a backend developer specializing in Node.js, Express.js, and MongoDB, I am eager to bring my expertise in scalable API design and clean code architecture to CloudCore Technologies.
    
Sincerely,  
Roki Mondal`,
      jobDescription: "Hiring a backend developer experienced in Node.js and MongoDB for scalable web applications.",
      companyName: "CloudCore Technologies",
      jobTitle: "Backend Developer",
      status: "draft",
      createdAt: new Date("2025-10-02T09:15:00Z"),
      updateAt: new Date("2025-10-03T10:30:00Z"),
    },
    {
      id: "cl_003c",
      userId: "user_123",
      content: `Dear HR Team,
    
I am passionate about UI/UX design and am excited to apply for the Product Designer position at Visionary Labs. My background in wireframing, prototyping, and design systems allows me to craft user experiences that balance aesthetics with usability.
    
Kind regards,  
Roki Mondal`,
      jobDescription: "Looking for a product designer skilled in Figma and design system creation.",
      companyName: "Visionary Labs",
      jobTitle: "Product Designer",
      status: "completed",
      createdAt: new Date("2025-09-18T11:00:00Z"),
      updateAt: new Date("2025-09-20T13:45:00Z"),
    },
    {
      id: "cl_004d",
      userId: "user_123",
      content: `Dear Hiring Manager,
    
I’m writing to express my interest in the Software Engineer Intern role at DevWorks. As a Computer Science student with a strong foundation in JavaScript and problem-solving, I’m eager to learn and contribute to your development team.
    
Best,  
Roki Mondal`,
      jobDescription: "Seeking a Software Engineering Intern with strong problem-solving and JavaScript fundamentals.",
      companyName: "DevWorks",
      jobTitle: "Software Engineer Intern",
      status: "draft",
      createdAt: new Date("2025-10-05T08:00:00Z"),
      updateAt: new Date("2025-10-06T09:30:00Z"),
    },
  ]*/
  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-center mb-5'>
        <h1 className='text-6xl font-bold gradient-title'>My Cover Letters</h1>
        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className='w-4 h-4' />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  )
}

export default CoverLetterPage