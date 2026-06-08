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
          className=" rounded-md border p-4 text-lg  h-40 max-h-[200px] overflow-y-auto resize-none "
        />
      </div>

    </div>
  )
}

export default LongAnswere