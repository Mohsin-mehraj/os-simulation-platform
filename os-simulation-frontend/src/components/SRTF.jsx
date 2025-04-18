// SRTF.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProcessCharts from "./ProcessCharts";
import AIExplanation from "./AIExplanation";
import { ChevronDown, ChevronUp } from "lucide-react";

const SRTF = () => {
  const [processes, setProcesses] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showExecutionDetails, setShowExecutionDetails] = useState(false);

  const api = import.meta.env.VITE_API_URL;

  const handleAddProcess = () => {
    setProcesses([
      ...processes,
      {
        processId: processes.length + 1,
        arrivalTime: "",
        burstTime: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    // Convert empty string to empty string, otherwise keep the number
    const processedValue = value === "" ? "" : Number(value);
    updatedProcesses[index][field] = processedValue;
    setProcesses(updatedProcesses);
  };

  const handleBlur = (index, field) => {
    const updatedProcesses = [...processes];
    // Convert empty string to 0 on blur
    if (updatedProcesses[index][field] === "") {
      updatedProcesses[index][field] = 0;
      setProcesses(updatedProcesses);
    }
  };

  const handleDelete = (index) => {
    const processIdToDelete = processes[index].processId;
    const updatedProcesses = processes.filter((_, i) => i !== index);
    updatedProcesses.forEach((p, i) => {
      p.processId = i + 1;
    });

    // Fix: Check if result exists and if result.schedule is an array
    if (result && result.schedule && Array.isArray(result.schedule)) {
      const updatedSchedule = result.schedule
        .filter((item) => item.processId !== processIdToDelete)
        .map((item) => ({
          ...item,
          processId:
            item.processId > processIdToDelete
              ? item.processId - 1
              : item.processId,
        }));

      // Create a new result object with the updated schedule
      setResult({
        ...result,
        schedule: updatedSchedule,
      });
    }

    setProcesses(updatedProcesses);
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      if (processes.length === 0) {
        setError("Please add at least one process");
        return;
      }

      // Convert any empty strings to 0 before validation
      const processedProcesses = processes.map((process) => ({
        ...process,
        arrivalTime: process.arrivalTime === "" ? 0 : process.arrivalTime,
        burstTime: process.burstTime === "" ? 0 : process.burstTime,
      }));

      if (
        processedProcesses.some((p) => p.arrivalTime < 0 || p.burstTime <= 0)
      ) {
        setError("Invalid arrival or burst times");
        return;
      }

      const response = await axios.post(`${api}/api/srtf`, processedProcesses);
      setResult(response.data);
      setShowExecutionDetails(true);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="max-w-full space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Shortest Remaining Time First (SRTF) Scheduling
        </h1>
        <div className="flex w-full sm:w-auto gap-3">
          <button
            onClick={handleAddProcess}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Process
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Process Table */}
      <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm -mx-4 sm:mx-0">
        <div className="min-w-max">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Process ID
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Arrival Time
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Burst Time
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processes.map((process, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-slate-600">
                    {process.processId}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) =>
                        handleChange(index, "arrivalTime", e.target.value)
                      }
                      onBlur={(e) => handleBlur(index, "arrivalTime")}
                      placeholder="0"
                      className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 appearance-textfield"
                      style={{
                        WebkitAppearance: "textfield",
                        MozAppearance: "textfield",
                        appearance: "textfield",
                      }}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) =>
                        handleChange(index, "burstTime", e.target.value)
                      }
                      onBlur={(e) => handleBlur(index, "burstTime")}
                      placeholder="0"
                      className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 appearance-textfield"
                      style={{
                        WebkitAppearance: "textfield",
                        MozAppearance: "textfield",
                        appearance: "textfield",
                      }}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-md 
                               transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {processes.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 sm:px-6 py-8 text-center text-sm text-slate-500"
                  >
                    No processes added yet. Click "Add Process" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Algorithm Description */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-800">About SRTF</h3>
            <p className="mt-1 text-sm text-slate-600">
              Shortest Remaining Time First (SRTF) is a preemptive version of
              SJF. In this algorithm, the process with the smallest remaining
              burst time is selected for execution. The running process can be
              preempted by a newly arrived process with a shorter burst time.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Key characteristics:
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>Preemptive scheduling</li>
                <li>Optimal for minimizing average waiting time</li>
                <li>May cause starvation for longer processes</li>
                <li>Involves context switching when processes are preempted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && result.schedule && result.schedule.length > 0 && (
        <div className="space-y-6">
          {/* Summary Results */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              Results Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.schedule.map((item) => (
                <div
                  key={item.processId}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors duration-200"
                >
                  <span className="font-medium text-slate-700">
                    Process {item.processId}
                  </span>
                  <div className="mt-2 text-sm text-slate-600 space-y-1">
                    <p>Start Time: {item.startTime}</p>
                    <p>Completion Time: {item.completionTime}</p>
                    <p>Turnaround Time: {item.turnaroundTime}</p>
                    <p>Waiting Time: {item.waitingTime}</p>
                    <p>Context Switches: {item.contextSwitches}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Execution Timeline Section */}
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
                      {createExecutionTimeline(result).map((step, index) => (
                        <tr
                          key={index}
                          className={`${
                            step.isContextSwitch ? "bg-yellow-50" : ""
                          }`}
                        >
                          <td className="px-4 py-2 text-sm text-slate-600">
                            {step.time}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-600">
                            {step.isContextSwitch ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Context Switch
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

          <ProcessCharts processes={processes} result={result.schedule} />
          <AIExplanation
            processes={processes}
            result={result.schedule}
            algorithmType="SRTF"
          />
        </div>
      )}
    </div>
  );
};

// Helper function to create execution timeline from the result
function createExecutionTimeline(result) {
  if (!result || !result.timeline) return [];

  const timeline = [];
  const processList = {};

  // Sort timeline events by start time
  const sortedEvents = [...result.timeline].sort(
    (a, b) => a.startTime - b.startTime
  );

  // Initialize remaining times from the original processes
  result.schedule.forEach((process) => {
    processList[process.processId] = {
      id: process.processId,
      arrivalTime:
        process.startTime - (process.turnaroundTime - process.waitingTime),
      burstTime: process.turnaroundTime - process.waitingTime,
      remainingTime: process.turnaroundTime - process.waitingTime,
    };
  });

  let lastProcessId = null;

  // Process arrival events
  for (const process of Object.values(processList)) {
    timeline.push({
      time: process.arrivalTime,
      event: `Process ${process.id} arrives`,
      process: null,
      remainingTimes: Object.fromEntries(
        Object.values(processList)
          .filter((p) => p.arrivalTime <= process.arrivalTime)
          .map((p) => [p.id, p.remainingTime])
      ),
      isContextSwitch: false,
    });
  }

  // Process execution events
  for (const event of sortedEvents) {
    const duration = event.endTime - event.startTime;
    const processId = event.processId;

    // If this is a context switch
    if (lastProcessId !== null && lastProcessId !== processId) {
      timeline.push({
        time: event.startTime,
        event: `Switch from Process ${lastProcessId} to Process ${processId}`,
        process: processId,
        remainingTimes: Object.fromEntries(
          Object.values(processList)
            .filter((p) => p.arrivalTime <= event.startTime)
            .map((p) => [p.id, p.remainingTime])
        ),
        isContextSwitch: true,
      });
    }

    // If this is the first execution of the process
    if (lastProcessId !== processId) {
      timeline.push({
        time: event.startTime,
        event:
          lastProcessId === null
            ? `Process ${processId} starts execution`
            : `Process ${processId} continues execution`,
        process: processId,
        remainingTimes: Object.fromEntries(
          Object.values(processList)
            .filter((p) => p.arrivalTime <= event.startTime)
            .map((p) => [p.id, p.remainingTime])
        ),
        isContextSwitch: false,
      });
    }

    // Update remaining time
    if (processList[processId]) {
      processList[processId].remainingTime -= duration;
    }

    // If process completes
    if (processList[processId] && processList[processId].remainingTime === 0) {
      timeline.push({
        time: event.endTime,
        event: `Process ${processId} completes`,
        process: null,
        remainingTimes: Object.fromEntries(
          Object.values(processList)
            .filter((p) => p.arrivalTime <= event.endTime && p.id !== processId)
            .map((p) => [p.id, p.remainingTime])
        ),
        isContextSwitch: false,
      });
    }

    lastProcessId = processId;
  }

  // Sort all events by time
  timeline.sort((a, b) => a.time - b.time);

  return timeline;
}

export default SRTF;
