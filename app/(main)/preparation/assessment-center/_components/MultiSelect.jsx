"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const MultiSelect = ({
  index,
  question,
  handleChange,
  value = []
}) => {

  const handleCheckedChange = (checked, option) => {

    let updatedAnswers = [...value];

    if (checked) {
      updatedAnswers.push(option);
    } else {
      updatedAnswers = updatedAnswers.filter(
        (item) => item !== option
      );
    }

    handleChange(updatedAnswers);
  };

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

        {question.options.map((option, i) => (

          <Label
            key={i}
            htmlFor={`q${index}-option-${i}`}
            className="flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:border-primary"
            
          >

            <Checkbox
              id={`q${index}-option-${i}`}
              checked={value.includes(option)}
              onCheckedChange={(checked) =>
                handleCheckedChange(checked, option)
              }
            />

            {/* <span className="text-sm md:text-base font-medium"> */}
              {option}
            {/* </span> */}

          </Label>

        ))}

      </div>

    </div>
  )
}

export default MultiSelect