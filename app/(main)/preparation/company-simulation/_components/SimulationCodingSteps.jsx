import React from 'react'

const SimulationCodingSteps = ({ roundData }) => {
    return (
        <div>Coding{JSON.stringify(roundData, null, 2)}</div>
    )
}

export default SimulationCodingSteps