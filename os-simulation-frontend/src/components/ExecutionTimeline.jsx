import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createExecutionTimeline } from "../utils/createExecutionTimeline";

const ExecutionTimeline = ({ result, algorithmType }) => {
  const [showExecutionDetails, setShowExecutionDetails] = useState(false);
  const [processedTimeline, setProcessedTimeline] = useState([]);

  useEffect(() => {
    if (
      result &&
      result.timeline &&
      Array.isArray(result.timeline) &&
      result.timeline.length > 0
    ) {
      try {
        const generatedTimeline = createExecutionTimeline(
          result,
          algorithmType
        );
        setProcessedTimeline(generatedTimeline || []);
      } catch (err) {
        console.error("Error processing timeline:", err);
        setProcessedTimeline([]);
      }
    } else {
      setProcessedTimeline([]);
    }
  }, [result, algorithmType]);

  // Don't render if no valid timeline data
  if (
    !result ||
    !result.timeline ||
    !Array.isArray(result.timeline) ||
    result.timeline.length === 0 ||
    processedTimeline.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">
          Step-by-Step Execution Timeline
        </h3>
        <button
          onClick={() => setShowExecutionDetails(!showExecutionDetails)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          {showExecutionDetails ? (
            <>
              Hide Details <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Details <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {showExecutionDetails && (
        <div className="p-4">
          <div className="relative overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                    Event
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                    Process
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                    Remaining Times
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {processedTimeline.map((step, index) => (
                  <tr
                    key={index}
                    className={`${step.isContextSwitch ? "bg-yellow-50" : ""}`}
                  >
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {step.time}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {step.isContextSwitch ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {step.event}
                        </span>
                      ) : (
                        step.event
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {step.process && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          P{step.process}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {step.remainingTimes &&
                        Object.entries(step.remainingTimes).map(
                          ([pid, time]) => (
                            <span key={pid} className="inline-block mr-2">
                              P{pid}: {time}
                            </span>
                          )
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionTimeline;
