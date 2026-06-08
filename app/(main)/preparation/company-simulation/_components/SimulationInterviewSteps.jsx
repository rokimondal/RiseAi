import React from 'react'

const SimulationInterviewSteps = ({ roundData }) => {
    return (
        <div>Interview{JSON.stringify(roundData, null, 2)}</div>
    )
}

export default SimulationInterviewSteps