"use client"

import { EvaluateCodingAssessment, runCode } from '@/actions/company-coding-round'
import { Button } from '@/components/ui/button'
import useFetch from '@/hooks/use-fetch'
import { Editor } from '@monaco-editor/react'
import { Code, Loader2, Maximize2, Minimize2, Play, RotateCcw, Send, SquareCheck, SquarePlus, SquareX, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const CodingPage = ({ assesmentData, setAssessmentResult }) => {

  const { resolvedTheme } = useTheme();

  const totalDuration = assesmentData?.assessmentMetadata?.totalDurationMinutes || 0;
  const [currentQuestion, setCurrentQuestion] = useState(assesmentData?.questions?.[0])

  const intervalRef = useRef(null)
  const [timeLeft, setTimeLeft] = useState(totalDuration * 60)

  const [isMaximize, setMaximize] = useState(false);
  const [editorTheme, setEditorTheme] = useState(resolvedTheme == "dark" ? "vs-dark" : "light"); //vs-dark light
  const [codeMap, setCodeMap] = useState({});

  const [activeTab, setActiveTab] = useState("output");
  const [allTestCases, setAllTestCases] = useState([]);
  const [testcasesResult, setTestcasesResult] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [executionError, setExecutionError] = useState(null);
  // const [lastExecutedQuestionId, setLastExecutedQuestionId] = useState(null);

  const hasExecuted = testcasesResult.length > 0;
  const selected = hasExecuted
    ? testcasesResult[currentIndex] ?? testcasesResult[0]
    : allTestCases[currentIndex] ?? allTestCases[0];

  const baseCount = currentQuestion?.testCases?.length || 0;
  const hasCustom = allTestCases.length > baseCount;

  const { loading: executing, fn: executionFn, data: executionResult } = useFetch(runCode);
  const { loading: submiting, fn: submitionFn, data: submitionResult } = useFetch(EvaluateCodingAssessment);


  useEffect(() => {
    if (!currentQuestion) return;

    const formatted = currentQuestion?.testCases?.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output,
      isHidden: tc.isHidden || false
    }));

    setAllTestCases(formatted);
    setTestcasesResult([]);
    setExecutionError(null);
    setCurrentIndex(0);
    setActiveTab("output");

  }, [currentQuestion]);


  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
  }

  useEffect(() => {
    if (assesmentData?.questions?.length) {
      const initialCodeMap = {};

      assesmentData.questions.forEach((q) => {
        initialCodeMap[q.id] = q.starterCode?.replace("{{USER_CODE}}", "") || "";
      });

      setCodeMap(initialCodeMap);
    }
  }, [assesmentData]);

  useEffect(() => {
    console.log(codeMap);
  }, [codeMap])

  useEffect(() => {
    if (!executionResult) return;
    if (executionResult.questionId !== currentQuestion.id) return;

    console.log(executionResult)
    if (!executionResult.success) {
      setTestcasesResult([]);
      setExecutionError({
        status: executionResult.status,
        compileError: executionResult.compileError,
        runtimeError: executionResult.runtimeError,
      });
      return;
    }

    setExecutionError(null);

    const raw = executionResult.output || "";
    const outputs = raw.split("###TESTCASE###");

    const formatted = allTestCases.map((tc, index) => {
      const actual = outputs[index]?.trim() ?? "";
      const expected = tc.expectedOutput?.trim();

      if (expected !== undefined) {
        return {
          input: tc.input,
          output: actual,
          expectedOutput: expected,
          status: actual === expected ? "success" : "failed"
        };
      }

      return {
        input: tc.input,
        output: actual,
        expectedOutput: undefined,
        status: "neutral"
      };
    });

    setTestcasesResult(formatted);

  }, [executionResult]);

  const handleRunCode = async () => {
    const userCode = codeMap[currentQuestion?.id];
    if (!userCode?.trim()) {
      toast.error("Please write some code first.")
      return;
    }

    const fullCode = combineWrapperAndUserCode(currentQuestion.systemWrapperCode, userCode);

    const fullInput = prepareTestCasesInput(allTestCases, true)
    try {
      await executionFn({
        code: fullCode,
        language: assesmentData?.assessmentMetadata?.programmingLanguage,
        input: fullInput,
        questionId: currentQuestion.id,
        sessionToken: assesmentData.sessionToken,
      });
      // setLastExecutedQuestionId(currentQuestion.id);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to Execute your code");
    }

  }

  useEffect(() => {

    if (submitionResult?.success) {
      console.log(submitionResult);
      setAssessmentResult(submitionResult);
    }

  }, [submitionResult]);

  const handleSubmitCode = async () => {
    try {
      const codes = assesmentData.questions.map(
          (question) => ({
            questionId: question.id,

            language:
              assesmentData
                ?.assessmentMetadata
                ?.programmingLanguage,

            code:
              codeMap[question.id] || "",
          })
        );

      const timeTaken =
        (totalDuration * 60) - timeLeft;

      await submitionFn({
        codes,
        sessionToken: assesmentData.sessionToken,
        timeTaken
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to Execute your code");
    }


  }

  const handleAddTestcases = () => {
    if (!customInput.trim()) return;

    const newTestcase = {
      input: customInput.trim(),
      expectedOutput: undefined,
      isHidden: false
    };

    setAllTestCases(prev => {
      const updated = [...prev, newTestcase];

      setCurrentIndex(updated.length - 1);

      return updated;
    });

    setTestcasesResult([]);
    setExecutionError(null);
    setActiveTab("output");
    setCustomInput("");
  };

  return (
    <>
      <div className="fixed inset-0 z-100 bg-muted flex flex-col m-0">
        <div className="h-16 border-b flex items-center justify-between px-6 bg-muted/40 backdrop-blur">

          <div className="flex flex-col items-start">
            <h1 className="font-semibold text-xl">
              {assesmentData?.assessmentMetadata?.companyName}
            </h1>
            <span className="text-muted-foreground text-sm">
              {assesmentData?.assessmentMetadata?.examOrRole}
            </span>
          </div>

          {/* Center - Question Navigation */}
          <div className="flex items-center gap-2">
            {assesmentData?.questions?.map((q, index) => (
              <Button
                key={q.id}
                variant="outline"
                size="sm"
                disabled={q.id == currentQuestion.id}
                onClick={() => setCurrentQuestion(assesmentData?.questions[index])}
              >
                Q{index + 1}
              </Button>
            ))}
          </div>

          {/* Right - Timer + Submit */}
          <div className="flex items-center gap-4 ">
            <p
              className={`text-lg font-semibold w-20 ${timeLeft < 300 ? "text-red-500" : "text-green-500"
                }`}
            >
              {formatTime(timeLeft)}
            </p>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleRunCode()}
              disabled={executing || submiting}
            >{executing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <><Play className="w-4 h-4" />
              Run</>}

            </Button>

            <Button
              className="flex items-center gap-2"
              onClick={() => handleSubmitCode()}
              disabled={submiting}
            >
              {submiting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <><Send className="w-4 h-4" />
                Submit</>}
            </Button>
          </div>
        </div>


        <div className="flex flex-1 overflow-hidden">

          {/* ================= LEFT PANEL ================= */}
          <div className={`w-1/2 min-h-0 border-r bg-muted overflow-y-auto p-6 space-y-6 ${isMaximize && "hidden"}`}>

            {/* Question Title */}
            <div>
              <h2 className="text-2xl font-bold">
                {currentQuestion?.title}
              </h2>

              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${currentQuestion?.difficulty === "Easy"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : currentQuestion?.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                >
                  {currentQuestion?.difficulty}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm">
              {currentQuestion?.description}
            </div>

            {/* Constraints */}
            <div className="p-2 whitespace-pre-wrap text-sm">
              <h3 className="font-semibold mb-2">Constraints:</h3>
              {currentQuestion?.constraints}
            </div>

            {/* Examples */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-2">Examples</h3>

              {currentQuestion?.testCases
                ?.filter((tc) => !tc.isHidden)
                ?.map((tc, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-muted/10 p-4 space-y-3"
                  >
                    <p className="font-bold text-sm text-muted-foreground">
                      Example {index + 1}
                    </p>

                    <div className='border-l-3 pl-3 rounded'>
                      {/* Input Block */}
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1 ">Input:</p>
                        <div className="bg-muted  rounded-md  text-muted-foreground min-h-10 font-mono text-sm whitespace-pre-wrap">
                          {tc.input !== "" ? tc.input : "\u00A0"}
                        </div>
                      </div>

                      {/* Output Block */}
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Output:</p>
                        <div className="bg-muted text-muted-foreground  rounded-md min-h-10 font-mono text-sm whitespace-pre-wrap">
                          {tc.output !== "" ? tc.output : "\u00A0"}
                        </div>
                      </div>

                      {/* Output Block */}
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Explanation:</p>
                        <div className="bg-muted text-muted-foreground  rounded-md min-h-10 font-mono text-sm whitespace-pre-wrap">
                          {tc.explanation !== "" ? tc.explanation : "\u00A0"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>

          {/* ================= RIGHT PANEL (placeholder) ================= */}
          <div className={`flex bg-muted overflow-y-auto p-1 ${isMaximize ? "w-full" : "w-1/2"}`}>
            <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-muted">
              <div className='bg-muted w-full flex items-center justify-between px-2'>
                <div className="text-xs font-medium flex gap-1 items-center">
                  <Code className='h-3' />
                  {assesmentData?.assessmentMetadata?.programmingLanguage}
                </div>

                <div className="text-xs text-muted-foreground flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 my-1"
                    onClick={() => setEditorTheme(editorTheme === "light" ? "vs-dark" : "light")}
                  >
                    <SunMoon className='h-2' />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 my-1"
                    onClick={() => {
                      if (!currentQuestion) return;

                      const originalStarter =
                        assesmentData?.questions?.find(
                          (q) => q.id === currentQuestion.id
                        )?.starterCode?.replace("{{USER_CODE}}", "") || "";

                      setCodeMap((prev) => ({
                        ...prev,
                        [currentQuestion.id]: originalStarter
                      }));
                    }}
                  >
                    <RotateCcw className='h-2' />
                  </Button>


                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 my-1"
                    onClick={() => { setMaximize(!isMaximize) }}
                  >
                    {isMaximize ? <Minimize2 className='h-4' /> : <Maximize2 className='h-2' />}
                  </Button>
                </div>

              </div>


              {/* Editor Section */}
              <div className="flex-1 min-h-0 w-full rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  language="java"
                  theme={editorTheme}
                  value={codeMap[currentQuestion?.id] || ""}
                  onChange={(value) => {
                    setCodeMap((prev) => ({
                      ...prev,
                      [currentQuestion.id]: value || ""
                    }));
                  }}
                  loading={
                    <div className="h-full flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    </div>
                  }
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              <div
                className={` border-t flex flex-col min-h-0 transition-all duration-300 ${hasExecuted ? "flex-[0.6]" : "flex-none h-56"}`}
              >

                {/* Tabs */}
                <div className="flex border-b bg-muted/30">
                  <button
                    onClick={() => setActiveTab("output")}
                    className={`px-4 py-2 text-sm ${activeTab === "output"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                      }`}
                  >
                    Output
                  </button>

                  <button
                    onClick={() => setActiveTab("custom")}
                    className={`px-4 py-2 text-sm ${activeTab === "custom"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                      }`}
                  >
                    Custom Input
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-3 overflow-auto text-sm font-mono bg-muted/20">

                  {activeTab === "output" && (
                    <>
                      {/* 🚨 ERROR PANEL */}
                      {executionError && (
                        <div className="p-3 rounded-md border border-red-500 bg-red-500/10 text-sm">
                          <p className="font-semibold text-red-500 mb-2">
                            {executionError.status.replaceAll("_", " ")}
                          </p>

                          {executionError.compileError && (
                            <pre className="whitespace-pre-wrap text-xs">
                              {executionError.compileError}
                            </pre>
                          )}

                          {executionError.runtimeError && (
                            <pre className="whitespace-pre-wrap text-xs">
                              {executionError.runtimeError}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* STATE 1: Fresh */}
                      {!executionError && !hasExecuted && !hasCustom && (
                        <div className="text-muted-foreground">
                          Run your code to see results...
                        </div>
                      )}

                      {/* STATE 2 & 3 */}
                      {!executionError && (hasExecuted || hasCustom) && (
                        <div className="space-y-3">

                          {/* Header */}
                          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {(hasExecuted ? testcasesResult : allTestCases).map((tc, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                className={`flex items-center gap-1 ${currentIndex === index
                                  ? "bg-muted-foreground/15 text-foreground hover:bg-muted-foreground/15"
                                  : "text-muted-foreground hover:bg-muted-foreground/10"
                                  }`}
                                onClick={() => setCurrentIndex(index)}
                              >
                                {hasExecuted && tc.status === "success" && (
                                  <SquareCheck className="h-3 w-3 text-green-500" />
                                )}

                                {hasExecuted && tc.status === "failed" && (
                                  <SquareX className="h-3 w-3 text-red-500" />
                                )}

                                {hasExecuted && tc.status === "neutral" && (
                                  <SquarePlus className="h-3 w-3 text-gray-500" />
                                )}
                                Case {index + 1}
                              </Button>
                            ))}
                          </div>

                          {/* Selected */}
                          {selected && (
                            <div
                              className={`p-3 rounded-md border ${hasExecuted
                                ? selected.status === "success"
                                  ? "border-green-500 bg-green-500/10"
                                  : selected.status === "failed"
                                    ? "border-red-500 bg-red-500/10"
                                    : "border-gray-500 bg-gray-500/10" // neutral
                                : "border-gray-500 bg-gray-500/10"
                                }`}
                            >
                              <div className="mb-3">
                                <p className="text-xs text-muted-foreground mb-1">Input:</p>
                                <div className="bg-muted-foreground/15 p-2 rounded-sm text-xs whitespace-pre-wrap">
                                  {selected.input}
                                </div>
                              </div>

                              {hasExecuted && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Output:</p>
                                  <div className="bg-muted-foreground/15 p-2 rounded-sm text-xs whitespace-pre-wrap">
                                    {selected.output}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "custom" && (
                    <div className="flex flex-col gap-2 h-full items-start">
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input here..."
                        className="w-full h-full bg-muted-foreground/5 rounded-md p-2 text-sm resize-none outline-none whitespace-pre-wrap max-h-20"
                      />
                      <Button onClick={handleAddTestcases}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="fixed inset-0 z-100 flex lg:hidden items-center justify-center bg-background/60 backdrop-blur-md">
        <div className="bg-background rounded-xl p-6 text-center shadow-lg max-w-sm mx-4">
          <h2 className="text-lg font-semibold mb-2">
            Desktop Required
          </h2>
          <p className="text-sm text-muted-foreground">
            Coding assessments are only available on large screens.
            Please use a laptop or desktop device.
          </p>
        </div>
      </div>
    </>
  )
}

function combineWrapperAndUserCode(systemWrapperCode, userCode) {
  if (!systemWrapperCode || typeof systemWrapperCode !== "string") {
    throw new Error("Invalid systemWrapperCode.");
  }

  if (!userCode || typeof userCode !== "string") {
    throw new Error("Invalid userCode.");
  }

  if (!systemWrapperCode.includes("{{USER_CODE}}")) {
    throw new Error("systemWrapperCode missing {{USER_CODE}} placeholder.");
  }


  return systemWrapperCode.replace("{{USER_CODE}}", userCode);
}

function prepareTestCasesInput(testCases, includeHidden = true) {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error("testCases must be a non-empty array.");
  }

  const filtered = includeHidden
    ? testCases
    : testCases.filter(tc => tc.isHidden === false);

  if (filtered.length === 0) {
    throw new Error("No test cases available after filtering.");
  }

  return filtered
    .map(tc => {
      if (!tc.input || typeof tc.input !== "string") {
        throw new Error("Each test case must contain valid input.");
      }
      let cleanedInput = tc.input.trim();

      if (
        cleanedInput.startsWith('\"') &&
        cleanedInput.endsWith('\"')
      ) {
        cleanedInput = cleanedInput.slice(1, -1);
      }

      return cleanedInput;
    })
    .join("\n###TESTCASE###\n");
}

export default CodingPage