import React from 'react'

export default async function reTakeCodingAssessment({ params }) {
    const { id } = await params;
    return (
        <div>{id}</div>
    )
}