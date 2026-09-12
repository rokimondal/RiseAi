import React from 'react'

export default async function reTakeCompanySimulation({ params }) {
    const { id } = await params;
    return (
        <div>{id}</div>
    )
}