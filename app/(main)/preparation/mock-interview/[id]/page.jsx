import React from 'react'

export default async function reTakeMockInterview({ params }) {
    const { id } = await params;
    return (
        <div>{id}</div>
    )
}