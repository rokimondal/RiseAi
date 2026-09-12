import React from 'react'
import ReTakeAssessment from '../_components/ReTakeAssessment'

const page = async({ params }) => {
    const { id } = await params
    return (
        <ReTakeAssessment id={id} />
    )
}

export default page