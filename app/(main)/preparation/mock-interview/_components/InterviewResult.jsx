import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import React from "react";
import { BarLoader } from "react-spinners";

const recommendationVariant = {
  "Strong Hire": "default",
  "Hire": "secondary",
  "Neutral": "outline",
  "Reject": "destructive",
};

const InterviewResult = ({
  result,
  evaluating,
}) => {

  if (evaluating) {
    return (
      <BarLoader
        className="mt-4"
        width={"100%"}
        color="gray"
      />
    );
  }

  const data = result?.data;

  if (!data) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-gray-500">
          No interview result found
        </div>
      </div>
    );
  }

  const session = data?.session;

  const evaluation =
    session?.result?.result ||
    session?.payload?.finalEvaluation;

  const totalSeconds =
    session?.durationSeconds || 0;

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  const formattedDuration =
    `${minutes}m ${seconds}s`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">

      {/* HEADER */}

      <Card className="border-0">

        <CardContent className="">

          <div className="space-y-2">

            <div className="flex justify-between items-center mb-5">

              <div className="space-y-2">

                <h1 className="text-3xl font-bold tracking-tight">
                  Interview Result
                </h1>

              </div>
                <Badge
                  variant={
                    recommendationVariant[
                    evaluation?.hiringRecommendation
                    ] || "outline"
                  }
                  className="w-fit px-4 py-1 text-sm"
                >
                  {evaluation?.hiringRecommendation}
                </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

              <InfoCard
                label="Company / Exam Authority"
                value={
                  session?.payload?.companyName
                }
              />

              <InfoCard
                label="Role / Exam Name"
                value={
                  session?.payload?.jobTitle
                }
              />

              <InfoCard
                label="Interview Type"
                value={
                  session?.payload?.interviewType
                }
              />

              <InfoCard
                label="Duration"
                value={formattedDuration}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SCORES */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        <ScoreCard
          title="Overall Score"
          score={evaluation?.overallScore}
        />

        <ScoreCard
          title="Communication"
          score={evaluation?.communicationScore}
        />

        <ScoreCard
          title="Technical"
          score={evaluation?.technicalScore}
        />

        <ScoreCard
          title="Problem Solving"
          score={evaluation?.problemSolvingScore}
        />

        <ScoreCard
          title="Behavioral"
          score={evaluation?.behavioralScore}
        />

        <ScoreCard
          title="Confidence"
          score={evaluation?.confidenceScore}
        />
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ListSection
          title="Strengths"
          items={evaluation?.strengths}
        />

        <ListSection
          title="Weaknesses"
          items={evaluation?.weaknesses}
        />
      </div>

      <ListSection
        title="Improvement Tips"
        items={evaluation?.improvementTips}
      />

      {/* FEEDBACK */}

      <Card className="border-0 shadow-sm">

        <CardHeader>
          <CardTitle>
            Final Feedback
          </CardTitle>
        </CardHeader>

        <CardContent>

          <p className="text-sm leading-7 text-muted-foreground">
            {evaluation?.finalFeedback}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ScoreCard = ({
  title,
  score,
}) => {

  const safeScore = score || 0;

  return (
    <Card className="border-0 shadow-sm bg-card/60 ">

      <CardContent className="p-6 space-y-2">

        <div className="flex items-center justify-between">

          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <div className="text-xs font-medium text-muted-foreground">
            /100
          </div>
        </div>

        <div className="space-y-3">

          <h2 className="text-3xl font-bold tracking-tight">
            {safeScore}
          </h2>

          <Progress
            value={safeScore}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ListSection = ({
  title,
  items = [],
}) => {

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>

        {
          items?.length > 0 ? (
            <div className="space-y-4">

              {
                items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-2.5 h-2 w-2 rounded-full bg-primary shrink-0" />

                    <p className="text-muted-foreground leading-7">
                      {item}
                    </p>
                  </div>
                ))
              }
            </div>
          ) : (
            <p className="text-muted-foreground">
              No data available
            </p>
          )
        }
      </CardContent>
    </Card>
  );
};

const InfoCard = ({
  label,
  value,
}) => {

  return (
    <Card className="p-0 border-0 shadow-none">

      <CardContent >

        <div className="space-y-1">

          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            {label}
          </p>

          <p className="text-lg font-semibold leading-relaxed">
            {value || "-"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewResult;