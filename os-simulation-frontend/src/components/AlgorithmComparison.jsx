// AlgorithmComparison.jsx with fixes
import React, { useState } from "react";
import axios from "axios";
import { Tabs, TabList, Tab, TabPanel } from "../components/tabs";
import { Check, Loader2 } from "lucide-react";
import ProcessCharts from "./ProcessCharts";

const AlgorithmComparison = () => {
  const [processes, setProcesses] = useState([]);
  const [timeQuantum, setTimeQuantum] = useState(1);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([
    "fcfs",
    "sjf",
    "priority", // Changed from "ps" to match backend endpoint
    "round-robin", // Changed from "rr" to match backend endpoint
    "srtf", // Added SRTF
  ]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("processes");

  const api = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Added fallback

  // Map of algorithm IDs to display names and backend endpoint paths
  const algorithms = [
    { id: "fcfs", name: "First Come First Serve (FCFS)", endpoint: "fcfs" },
    { id: "sjf", name: "Shortest Job First (SJF)", endpoint: "sjf" },
    {
      id: "srtf",
      name: "Shortest Remaining Time First (SRTF)",
      endpoint: "srtf",
    },
    { id: "round-robin", name: "Round Robin (RR)", endpoint: "round-robin" },
    { id: "priority", name: "Priority Scheduling (PS)", endpoint: "priority" },
  ];

  // Handler for adding a new process
  const handleAddProcess = () => {
    setProcesses([
      ...processes,
      {
        processId: processes.length + 1,
        arrivalTime: 0,
        burstTime: 1,
        priority: 1,
      },
    ]);
  };

  // Handler for changing process values
  const handleChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    const processedValue = value === "" ? "" : Number(value);
    updatedProcesses[index][field] = processedValue;
    setProcesses(updatedProcesses);
  };

  // Handler for input blur
  const handleBlur = (index, field) => {
    const updatedProcesses = [...processes];
    if (updatedProcesses[index][field] === "") {
      updatedProcesses[index][field] = field === "priority" ? 1 : 0;
      setProcesses(updatedProcesses);
    }
  };

  // Handler for deleting a process
  const handleDelete = (index) => {
    const updatedProcesses = processes.filter((_, i) => i !== index);
    updatedProcesses.forEach((p, i) => {
      p.processId = i + 1;
    });
    setProcesses(updatedProcesses);
  };

  // Handler for changing time quantum
  const handleTimeQuantumChange = (value) => {
    setTimeQuantum(value === "" ? "" : Number(value));
  };

  // Handler for selecting/deselecting algorithms
  const toggleAlgorithm = (algorithmId) => {
    if (selectedAlgorithms.includes(algorithmId)) {
      setSelectedAlgorithms(
        selectedAlgorithms.filter((id) => id !== algorithmId)
      );
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algorithmId]);
    }
  };

  // Handler for comparing algorithms
  const handleCompare = async () => {
    try {
      setError(null);
      setLoading(true);
      setResults({});

      if (processes.length === 0) {
        setError("Please add at least one process");
        setLoading(false);
        return;
      }

      if (selectedAlgorithms.length === 0) {
        setError("Please select at least one algorithm");
        setLoading(false);
        return;
      }

      // Validate processes
      const processedProcesses = processes.map((process) => ({
        ...process,
        arrivalTime: process.arrivalTime === "" ? 0 : process.arrivalTime,
        burstTime: process.burstTime === "" ? 1 : process.burstTime,
        priority: process.priority === "" ? 1 : process.priority,
      }));

      if (
        processedProcesses.some(
          (p) => p.arrivalTime < 0 || p.burstTime <= 0 || p.priority <= 0
        )
      ) {
        setError("Invalid arrival time, burst time, or priority");
        setLoading(false);
        return;
      }

      // Run each selected algorithm
      const resultsData = {};

      for (const algorithmId of selectedAlgorithms) {
        try {
          // Find the algorithm configuration
          const algorithm = algorithms.find((a) => a.id === algorithmId);
          if (!algorithm) {
            console.error(`Unknown algorithm: ${algorithmId}`);
            continue;
          }

          // Use the correct endpoint
          const endpoint = algorithm.endpoint;
          console.log(`Sending request to: ${api}/api/${endpoint}`);

          let response;
          if (endpoint === "round-robin") {
            // Round Robin needs timeQuantum
            response = await axios.post(`${api}/api/${endpoint}`, {
              processes: processedProcesses,
              timeQuantum: timeQuantum,
            });
          } else {
            // Other algorithms just need processes
            response = await axios.post(
              `${api}/api/${endpoint}`,
              processedProcesses
            );
          }

          if (response.data) {
            console.log(`${algorithmId} results:`, response.data);
            resultsData[algorithmId] = response.data;
          } else {
            resultsData[algorithmId] = { error: "Empty response" };
          }
        } catch (err) {
          console.error(`Error with ${algorithmId}:`, err);
          resultsData[algorithmId] = { error: err.message || "Request failed" };
        }
      }

      setResults(resultsData);
      setActiveTab("results");
    } catch (err) {
      setError("An error occurred while comparing algorithms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance metrics for each algorithm
  const calculateMetrics = () => {
    const metrics = {};

    Object.entries(results).forEach(([algorithmId, result]) => {
      if (result.error || !result.schedule) return;

      const schedule = result.schedule;
      const avgTurnaroundTime =
        schedule.reduce((sum, p) => sum + p.turnaroundTime, 0) /
        schedule.length;
      const avgWaitingTime =
        schedule.reduce((sum, p) => sum + p.waitingTime, 0) / schedule.length;
      const maxCompletionTime = Math.max(
        ...schedule.map((p) => p.completionTime)
      );

      metrics[algorithmId] = {
        avgTurnaroundTime: avgTurnaroundTime.toFixed(2),
        avgWaitingTime: avgWaitingTime.toFixed(2),
        throughput: (schedule.length / maxCompletionTime).toFixed(4),
        maxCompletionTime: maxCompletionTime,
      };
    });

    return metrics;
  };

  const metrics = Object.keys(results).length > 0 ? calculateMetrics() : {};

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Algorithm Comparison
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList className="flex border-b">
          <Tab
            value="processes"
            className="px-4 py-2 font-medium text-slate-700"
          >
            Process Setup
          </Tab>
          <Tab
            value="algorithms"
            className="px-4 py-2 font-medium text-slate-700"
          >
            Select Algorithms
          </Tab>
          <Tab
            value="results"
            className="px-4 py-2 font-medium text-slate-700"
            disabled={Object.keys(results).length === 0}
          >
            Comparison Results
          </Tab>
        </TabList>

        <TabPanel value="processes" className="py-4">
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleAddProcess}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Process
              </button>
            </div>

            {/* Process Table */}
            <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
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
                        Priority
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
                            placeholder="1"
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
                            value={process.priority}
                            onChange={(e) =>
                              handleChange(index, "priority", e.target.value)
                            }
                            onBlur={(e) => handleBlur(index, "priority")}
                            placeholder="1"
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
                          colSpan="5"
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

            <div className="flex justify-end">
              <button
                onClick={() => setActiveTab("algorithms")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={processes.length === 0}
              >
                Next: Select Algorithms
              </button>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="algorithms" className="py-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Algorithm Selection */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Select Algorithms to Compare
                </h2>
                <div className="space-y-3">
                  {algorithms.map((algorithm) => (
                    <div
                      key={algorithm.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleAlgorithm(algorithm.id)}
                    >
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded border ${
                          selectedAlgorithms.includes(algorithm.id)
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {selectedAlgorithms.includes(algorithm.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-slate-700">{algorithm.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Round Robin Time Quantum */}
              {selectedAlgorithms.includes("round-robin") && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Round Robin Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Time Quantum
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={timeQuantum}
                        onChange={(e) =>
                          handleTimeQuantumChange(e.target.value)
                        }
                        onBlur={() => {
                          if (timeQuantum === "") setTimeQuantum(1);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab("processes")}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                disabled={loading || selectedAlgorithms.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  "Compare Algorithms"
                )}
              </button>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="results" className="py-4">
          {Object.keys(results).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                Run a comparison to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Performance Metrics Comparison Table */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Performance Metrics Comparison
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Algorithm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Avg. Turnaround Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Avg. Waiting Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Throughput (processes/time)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Completion Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {Object.entries(results).map(([algorithmId, result]) => {
                        const algorithm = algorithms.find(
                          (a) => a.id === algorithmId
                        );

                        if (result.error) {
                          return (
                            <tr key={algorithmId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {algorithm?.name || algorithmId.toUpperCase()}
                              </td>
                              <td
                                colSpan={4}
                                className="px-6 py-4 whitespace-nowrap text-sm text-red-500"
                              >
                                Error: {result.error}
                              </td>
                            </tr>
                          );
                        }

                        const metric = metrics[algorithmId] || {};

                        return (
                          <tr key={algorithmId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {algorithm?.name || algorithmId.toUpperCase()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {metric.avgTurnaroundTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {metric.avgWaitingTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {metric.throughput}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {metric.maxCompletionTime}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Individual Algorithm Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(results).map(([algorithmId, result]) => {
                  if (result.error) return null;

                  const algorithm = algorithms.find(
                    (a) => a.id === algorithmId
                  );

                  return (
                    <div
                      key={algorithmId}
                      className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        {algorithm?.name || algorithmId.toUpperCase()}
                      </h3>

                      {/* Process Timeline */}
                      <ProcessCharts
                        processes={processes}
                        result={result.schedule}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab("algorithms")}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Run Comparison Again
                </button>
              </div>
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AlgorithmComparison;
