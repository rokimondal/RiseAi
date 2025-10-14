"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react'
import React, { useState } from 'react'

const QuestionAnswereCard = ({ q }) => {
    const [showExplanation, setShowExplanation] = useState(!q.isCorrect);
    return (
        <motion.div
            layout
            className="border rounded-lg p-4 space-y-2 cursor-pointer hover:shadow-md transition-all duration-300"
            onClick={() => setShowExplanation(!showExplanation)}
        >
            <div className=' flex justify-between items-start gap-2'>
                <p className='font-medium'>{q.question}</p>
                {q.isCorrect ? <CheckCircle2 className='h-5 w-5 text-green-500 flex-shrink-0' /> : <XCircle className='h-5 w-5 text-red-500 flex-shrink-0' />}
            </div>

            <div className='text-sm text-muted-foreground space-y-1'>
                <p>
                    <span className='font-bold'>Your answere: </span>{q.userAnswere}
                </p>
                {!q.isCorrect && <p><span className='font-bold'>Correct answere: </span>{q.userAnswere}</p>}
            </div>

            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        key="explanation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                            duration: 0.35,
                            ease: [0.25, 0.8, 0.25, 1],
                        }}
                        className="text-sm bg-muted p-3 rounded-lg overflow-hidden"
                    >
                        <p className="font-medium mb-1">Explanation:</p>
                        <p>{q.explanation}</p>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    )
}

export default QuestionAnswereCard