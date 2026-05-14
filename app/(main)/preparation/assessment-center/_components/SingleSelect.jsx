"use client"

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useState } from 'react'

const SingleSelect = ({ index, question, handleChange, value }) => {

  return (
    <div className="w-full bg-transparent">
      <div className="mb-3">
        <h2 className="text-lg md:text-xl font-semibold leading-relaxed">
          <span className="text-primary mr-2">
            Q{index + 1}.
          </span>

          {question.question}
        </h2>
      </div>
      <RadioGroup
        onValueChange={(val) => handleChange(val)}
        value={value}
      >
        {question.options.map((option, i) => (
          <Label
            htmlFor={`q${index}-option-${i}`}
            key={i}
            className="flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:border-primary"
          >
            <RadioGroupItem
              value={option}
              id={`q${index}-option-${i}`}
              className="h-4 w-4 border-gray-500"
            />
            {option}
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

export default SingleSelect