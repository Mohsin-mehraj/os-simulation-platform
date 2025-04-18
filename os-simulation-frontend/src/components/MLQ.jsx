// MLQ.jsx
import React, { useState } from "react";
import axios from "axios";
import ProcessCharts from "./ProcessCharts";
import AIExplanation from "./AIExplanation";
import ExecutionTimeline from "./ExecutionTimeline";

const MLQ = () => {
  const [queues, setQueues] = useState([
    { priority: 1, algorithm: "fcfs", timeQuantum: 2, processes: [] },
    { priority: 2, algorithm: "rr", timeQuantum: 2, processes: [] },
  ]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [nextProcessId, setNextProcessId] = useState(1);

  const api = import.meta.env.VITE_API_URL;

  // Add a new queue
  const addNewQueue = () => {
    setQueues([
      ...queues,
      {
        priority: queues.length + 1,
        algorithm: "fcfs",
        timeQuantum: 2,
        processes: [],
      },
    ]);
  };

  // Remove a queue
  const removeQueue = (queueIndex) => {
    if (queues.length <= 1) {
      setError("At least one queue is required");
      return;
    }

    const updatedQueues = queues.filter((_, index) => index !== queueIndex);
    // Reassign priority values
    updatedQueues.forEach((queue, index) => {
      queue.priority = index + 1;
    });

    setQueues(updatedQueues);
  };

  // Change the algorithm for a queue
  const handleAlgorithmChange = (queueIndex, algorithm) => {
    const updatedQueues = [...queues];
    updatedQueues[queueIndex].algorithm = algorithm;
    setQueues(updatedQueues);
  };

  // Change the time quantum for Round Robin
  const handleTimeQuantumChange = (queueIndex, value) => {
    const updatedQueues = [...queues];
    updatedQueues[queueIndex].timeQuantum = value === "" ? "" : Number(value);
    setQueues(updatedQueues);
  };

  // Handle time quantum input blur
  const handleTimeQuantumBlur = (queueIndex) => {
    const updatedQueues = [...queues];
    if (updatedQueues[queueIndex].timeQuantum === "") {
      updatedQueues[queueIndex].timeQuantum = 1;
      setQueues(updatedQueues);
    }
  };

  // Add a process to a specific queue
  const addProcessToQueue = (queueIndex) => {
    const updatedQueues = [...queues];
    updatedQueues[queueIndex].processes.push({
      processId: nextProcessId,
      arrivalTime: "",
      burstTime: "",
    });
    setQueues(updatedQueues);
    setNextProcessId(nextProcessId + 1);
  };

  // Remove a process from a queue
  const removeProcessFromQueue = (queueIndex, processIndex) => {
    const updatedQueues = [...queues];
    updatedQueues[queueIndex].processes.splice(processIndex, 1);
    setQueues(updatedQueues);
  };

  // Handle process property change
  const handleProcessChange = (queueIndex, processIndex, field, value) => {
    const updatedQueues = [...queues];
    const processedValue = value === "" ? "" : Number(value);
    updatedQueues[queueIndex].processes[processIndex][field] = processedValue;
    setQueues(updatedQueues);
  };

  // Handle input blur for process properties
  const handleProcessBlur = (queueIndex, processIndex, field) => {
    const updatedQueues = [...queues];
    if (updatedQueues[queueIndex].processes[processIndex][field] === "") {
      updatedQueues[queueIndex].processes[processIndex][field] = 0;
      setQueues(updatedQueues);
    }
  };

  // Calculate MLQ scheduling
  const calculateMLQ = async () => {
    try {
      setError(null);

      // Check if all queues have at least one process
      const emptyQueues = queues.filter(
        (queue) => queue.processes.length === 0
      );
      if (emptyQueues.length > 0) {
        setError(
          `Queue ${emptyQueues[0].priority} has no processes. Add at least one process to each queue.`
        );
        return;
      }

      // Validate process data
      for (const queue of queues) {
        for (const process of queue.processes) {
          const arrivalTime =
            process.arrivalTime === "" ? 0 : process.arrivalTime;
          const burstTime = process.burstTime === "" ? 0 : process.burstTime;

          if (arrivalTime < 0 || burstTime <= 0) {
            setError("Invalid arrival or burst times");
            return;
          }
        }
      }

      // Prepare queues data for API
      const apiQueues = queues.map((queue) => ({
        priority: queue.priority,
        algorithm: queue.algorithm,
        timeQuantum:
          queue.algorithm === "rr" ? queue.timeQuantum || 1 : undefined,
        processes: queue.processes.map((process) => ({
          ...process,
          arrivalTime: process.arrivalTime === "" ? 0 : process.arrivalTime,
          burstTime: process.burstTime === "" ? 0 : process.burstTime,
        })),
      }));

      const response = await axios.post(`${api}/api/mlq`, {
        queues: apiQueues,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  // Flatten process list for visualization
  const getAllProcesses = () => {
    const allProcesses = [];
    queues.forEach((queue) => {
      queue.processes.forEach((process) => {
        allProcesses.push({
          ...process,
          queuePriority: queue.priority,
        });
      });
    });
    return allProcesses;
  };

  return (
    <div className="max-w-full space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Multi-Level Queue Scheduling
        </h1>
        <div className="flex w-full sm:w-auto gap-3">
          <button
            onClick={addNewQueue}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Queue
          </button>
          <button
            onClick={calculateMLQ}
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

      {/* Queue Management */}
      <div className="space-y-6">
        {queues.map((queue, queueIndex) => (
          <div
            key={queueIndex}
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                Queue {queue.priority} (Priority: {queue.priority})
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-700">Algorithm:</label>
                  <select
                    value={queue.algorithm}
                    onChange={(e) =>
                      handleAlgorithmChange(queueIndex, e.target.value)
                    }
                    className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fcfs">FCFS</option>
                    <option value="sjf">SJF</option>
                    <option value="rr">Round Robin</option>
                    <option value="ps">Priority</option>
                  </select>
                </div>

                {queue.algorithm === "rr" && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-700">
                      Time Quantum:
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={queue.timeQuantum}
                      onChange={(e) =>
                        handleTimeQuantumChange(queueIndex, e.target.value)
                      }
                      onBlur={() => handleTimeQuantumBlur(queueIndex)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addProcessToQueue(queueIndex)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm transition-colors"
                  >
                    Add Process
                  </button>
                  {queues.length > 1 && (
                    <button
                      onClick={() => removeQueue(queueIndex)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm transition-colors"
                    >
                      Remove Queue
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Process Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 border-b">
                      Process ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 border-b">
                      Arrival Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 border-b">
                      Burst Time
                    </th>
                    {queue.algorithm === "ps" && (
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 border-b">
                        Priority
                      </th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {queue.processes.map((process, processIndex) => (
                    <tr key={processIndex} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-sm text-slate-600">
                        {process.processId}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={process.arrivalTime}
                          onChange={(e) =>
                            handleProcessChange(
                              queueIndex,
                              processIndex,
                              "arrivalTime",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleProcessBlur(
                              queueIndex,
                              processIndex,
                              "arrivalTime"
                            )
                          }
                          placeholder="0"
                          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={process.burstTime}
                          onChange={(e) =>
                            handleProcessChange(
                              queueIndex,
                              processIndex,
                              "burstTime",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleProcessBlur(
                              queueIndex,
                              processIndex,
                              "burstTime"
                            )
                          }
                          placeholder="0"
                          className="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {queue.algorithm === "ps" && (
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={process.priority || 1}
                            onChange={(e) =>
                              handleProcessChange(
                                queueIndex,
                                processIndex,
                                "priority",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              handleProcessBlur(
                                queueIndex,
                                processIndex,
                                "priority"
                              )
                            }
                            placeholder="1"
                            className="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            removeProcessFromQueue(queueIndex, processIndex)
                          }
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {queue.processes.length === 0 && (
                    <tr>
                      <td
                        colSpan={queue.algorithm === "ps" ? 5 : 4}
                        className="px-4 py-4 text-center text-sm text-slate-500"
                      >
                        No processes added to this queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.schedule.map((item) => (
                <div
                  key={item.processId}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span className="font-medium text-slate-700">
                    Process {item.processId}
                  </span>
                  <div className="mt-2 text-sm text-slate-600 space-y-1">
                    <p>Queue Priority: {item.queuePriority}</p>
                    <p>Start Time: {item.startTime}</p>
                    <p>Completion Time: {item.completionTime}</p>
                    <p>Turnaround Time: {item.turnaroundTime}</p>
                    <p>Waiting Time: {item.waitingTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ExecutionTimeline result={result} algorithmType="MLQ" />
          <ProcessCharts
            processes={getAllProcesses()}
            result={result.schedule}
          />
          <AIExplanation
            processes={getAllProcesses()}
            result={result.schedule}
            algorithmType="MLQ"
          />
        </div>
      )}
    </div>
  );
};

export default MLQ;
