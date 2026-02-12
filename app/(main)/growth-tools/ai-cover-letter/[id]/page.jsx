import { getCoverLetter } from '@/actions/cover-leter';
import React from 'react'
import CoverLetterPreview from '../_components/CoverLetterPreview';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const page = async ({ params }) => {
    const { id } = await params;
    const coverLetter = await getCoverLetter(id);

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col space-y-2">
                <Link href="/ai-cover-letter">
                    <Button variant="link" className="gap-2 pl-0">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cover Letters
                    </Button>
                </Link>

                <h1 className="text-6xl font-bold gradient-title mb-6">
                    {coverLetter?.jobTitle} at {coverLetter?.companyName}
                </h1>
            </div>

            <CoverLetterPreview content={coverLetter?.content} id={id} />
        </div>
    );
}

export default page