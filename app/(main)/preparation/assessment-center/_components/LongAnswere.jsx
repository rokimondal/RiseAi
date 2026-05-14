import { Textarea } from '@/components/ui/textarea'
import React from 'react'

const LongAnswere = ({ index, question, handleChange, value }) => {
  return (
    <div className="w-full bg-transparent">

      {/* Question */}
      <div className="mb-3">
        <h2 className="text-lg md:text-xl font-semibold leading-relaxed">
          <span className="text-primary mr-2">
            Q{index + 1}.
          </span>

          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">

        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your answer..."
          rows={8}
          className="
            rounded-md border p-4 text-base
            transition-all duration-200
            focus-visible:ring-1 focus-visible:ring-primary
          "
        />
      </div>

    </div>
  )
}

export default LongAnswere