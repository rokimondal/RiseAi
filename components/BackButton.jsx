"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant="link"
      className="gpa-2 pl-0 w-fit "
      onClick={() => router.back()}
    >
      <ArrowLeft className='h-4 w-4' />
      Back
    </Button>
  )
}

export default BackButton