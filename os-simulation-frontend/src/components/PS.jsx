// //LATEST
// import React, { useState } from "react";
// import axios from "axios";
// import ProcessCharts from "./ProcessCharts";
// import AIExplanation from "./AIExplanation";
// import ExecutionTimeline from "./ExecutionTimeline";

// const PriorityScheduling = () => {
//   const [processes, setProcesses] = useState([]);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   const handleAddProcess = () => {
//     setProcesses([
//       ...processes,
//       {
//         processId: processes.length + 1,
//         arrivalTime: "",
//         burstTime: "",
//         priority: "",
//       },
//     ]);
//   };

//   const handleChange = (index, field, value) => {
//     const updatedProcesses = [...processes];
//     const processedValue = value === "" ? "" : Number(value);
//     updatedProcesses[index][field] = processedValue;
//     setProcesses(updatedProcesses);
//   };

//   const handleBlur = (index, field) => {
//     const updatedProcesses = [...processes];
//     if (updatedProcesses[index][field] === "") {
//       updatedProcesses[index][field] = field === "priority" ? 1 : 0;
//       setProcesses(updatedProcesses);
//     }
//   };

//   const handleDelete = (index) => {
//     const processIdToDelete = processes[index].processId;
//     const updatedProcesses = processes.filter((_, i) => i !== index);
//     updatedProcesses.forEach((p, i) => {
//       p.processId = i + 1;
//     });

//     if (result) {
//       const updatedResults = result
//         .filter((item) => item.processId !== processIdToDelete)
//         .map((item) => ({
//           ...item,
//           processId:
//             item.processId > processIdToDelete
//               ? item.processId - 1
//               : item.processId,
//         }));
//       setResult(updatedResults);
//     }

//     setProcesses(updatedProcesses);
//   };

//   const handleSubmit = async () => {
//     try {
//       setError(null);

//       if (processes.length === 0) {
//         setError("Please add at least one process");
//         return;
//       }

//       const processedProcesses = processes.map((process) => ({
//         ...process,
//         arrivalTime: process.arrivalTime === "" ? 0 : process.arrivalTime,
//         burstTime: process.burstTime === "" ? 0 : process.burstTime,
//         priority: process.priority === "" ? 1 : process.priority,
//       }));

//       if (
//         processedProcesses.some(
//           (p) => p.arrivalTime < 0 || p.burstTime <= 0 || p.priority <= 0
//         )
//       ) {
//         setError("Invalid arrival time, burst time, or priority");
//         return;
//       }

//       const response = await axios.post("/api/priority", processedProcesses);
//       console.log("API Response:", response.data);
//       console.log("Has timeline?", Boolean(response.data.timeline));
//       console.log(
//         "Timeline length:",
//         response.data.timeline ? response.data.timeline.length : 0
//       );
//       setResult(response.data);
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred");
//     }
//   };

//   return (
//     <div className="max-w-full space-y-4 sm:space-y-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
//           Priority Scheduling
//         </h1>
//         <div className="flex w-full sm:w-auto gap-3">
//           <button
//             onClick={handleAddProcess}
//             className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             Add Process
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           >
//             Calculate
//           </button>
//         </div>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//           {error}
//         </div>
//       )}

//       {/* Process Table */}
//       <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm -mx-4 sm:mx-0">
//         <div className="min-w-max">
//           <table className="w-full divide-y divide-slate-200">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th
//                   scope="col"
//                   className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
//                 >
//                   Process ID
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
//                 >
//                   Arrival Time
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
//                 >
//                   Burst Time
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
//                 >
//                   Priority
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700"
//                 >
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {processes.map((process, index) => (
//                 <tr
//                   key={index}
//                   className="hover:bg-slate-50 transition-colors duration-150"
//                 >
//                   <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-slate-600">
//                     {process.processId}
//                   </td>
//                   <td className="px-4 sm:px-6 py-3">
//                     <input
//                       type="number"
//                       inputMode="numeric"
//                       min="0"
//                       value={process.arrivalTime}
//                       onChange={(e) =>
//                         handleChange(index, "arrivalTime", e.target.value)
//                       }
//                       onBlur={(e) => handleBlur(index, "arrivalTime")}
//                       placeholder="0"
//                       className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md
//                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
//                                transition-all duration-200 appearance-textfield"
//                       style={{
//                         WebkitAppearance: "textfield",
//                         MozAppearance: "textfield",
//                         appearance: "textfield",
//                       }}
//                     />
//                   </td>
//                   <td className="px-4 sm:px-6 py-3">
//                     <input
//                       type="number"
//                       inputMode="numeric"
//                       min="1"
//                       value={process.burstTime}
//                       onChange={(e) =>
//                         handleChange(index, "burstTime", e.target.value)
//                       }
//                       onBlur={(e) => handleBlur(index, "burstTime")}
//                       placeholder="0"
//                       className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md
//                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
//                                transition-all duration-200 appearance-textfield"
//                       style={{
//                         WebkitAppearance: "textfield",
//                         MozAppearance: "textfield",
//                         appearance: "textfield",
//                       }}
//                     />
//                   </td>
//                   <td className="px-4 sm:px-6 py-3">
//                     <input
//                       type="number"
//                       inputMode="numeric"
//                       min="1"
//                       value={process.priority}
//                       onChange={(e) =>
//                         handleChange(index, "priority", e.target.value)
//                       }
//                       onBlur={(e) => handleBlur(index, "priority")}
//                       placeholder="1"
//                       className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md
//                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
//                                transition-all duration-200 appearance-textfield"
//                       style={{
//                         WebkitAppearance: "textfield",
//                         MozAppearance: "textfield",
//                         appearance: "textfield",
//                       }}
//                     />
//                   </td>
//                   <td className="px-4 sm:px-6 py-3">
//                     <button
//                       onClick={() => handleDelete(index)}
//                       className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-md
//                                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {processes.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     className="px-4 sm:px-6 py-8 text-center text-sm text-slate-500"
//                   >
//                     No processes added yet. Click "Add Process" to begin.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Results Section */}
//       {result && result.schedule && result.schedule.length > 0 && (
//         <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
//           <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
//             Results
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {result.schedule.map((item) => (
//               <div
//                 key={item.processId}
//                 className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors duration-200"
//               >
//                 <span className="font-medium text-slate-700">
//                   Process {item.processId}
//                 </span>
//                 <div className="mt-2 text-sm text-slate-600 space-y-1">
//                   <p>Start Time: {item.startTime}</p>
//                   <p>Completion Time: {item.completionTime}</p>
//                   {item.turnaroundTime !== undefined && (
//                     <>
//                       <p>Turnaround Time: {item.turnaroundTime}</p>
//                       <p>Waiting Time: {item.waitingTime}</p>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {result && (
//         <>
//           {result.timeline && (
//             <ExecutionTimeline result={result} algorithmType="PS" />
//           )}
//           <ProcessCharts processes={processes} result={result.schedule} />
//           <AIExplanation
//             processes={processes}
//             result={result.schedule}
//             algorithmType="PS"
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default PriorityScheduling;

// Fixed PriorityScheduling.jsx
import React, { useState } from "react";
import axios from "axios";
import ProcessCharts from "./ProcessCharts";
import AIExplanation from "./AIExplanation";
import ExecutionTimeline from "./ExecutionTimeline";

const PriorityScheduling = () => {
  const [processes, setProcesses] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const api = import.meta.env.VITE_API_URL;

  // All your existing functions and handlers remain the same
  const handleAddProcess = () => {
    setProcesses([
      ...processes,
      {
        processId: processes.length + 1,
        arrivalTime: "",
        burstTime: "",
        priority: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    const processedValue = value === "" ? "" : Number(value);
    updatedProcesses[index][field] = processedValue;
    setProcesses(updatedProcesses);
  };

  const handleBlur = (index, field) => {
    const updatedProcesses = [...processes];
    if (updatedProcesses[index][field] === "") {
      updatedProcesses[index][field] = field === "priority" ? 1 : 0;
      setProcesses(updatedProcesses);
    }
  };

  const handleDelete = (index) => {
    const processIdToDelete = processes[index].processId;
    const updatedProcesses = processes.filter((_, i) => i !== index);
    updatedProcesses.forEach((p, i) => {
      p.processId = i + 1;
    });

    if (result && result.schedule) {
      const updatedSchedule = result.schedule
        .filter((item) => item.processId !== processIdToDelete)
        .map((item) => ({
          ...item,
          processId:
            item.processId > processIdToDelete
              ? item.processId - 1
              : item.processId,
        }));

      // Update the result with the new schedule
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

      const processedProcesses = processes.map((process) => ({
        ...process,
        arrivalTime: process.arrivalTime === "" ? 0 : process.arrivalTime,
        burstTime: process.burstTime === "" ? 0 : process.burstTime,
        priority: process.priority === "" ? 1 : process.priority,
      }));

      if (
        processedProcesses.some(
          (p) => p.arrivalTime < 0 || p.burstTime <= 0 || p.priority <= 0
        )
      ) {
        setError("Invalid arrival time, burst time, or priority");
        return;
      }
      setResult(null);
      const response = await axios.post(
        `${api}/api/priority`,
        processedProcesses
      );
      // Store the complete response object
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="max-w-full space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Priority Scheduling
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

      {/* Results Section */}
      {result && result.schedule && result.schedule.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
            Results
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
                  {item.turnaroundTime !== undefined && (
                    <>
                      <p>Turnaround Time: {item.turnaroundTime}</p>
                      <p>Waiting Time: {item.waitingTime}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && result.schedule && (
        <>
          {result.timeline &&
            Array.isArray(result.timeline) &&
            result.timeline.length > 0 && (
              <ExecutionTimeline result={result} algorithmType="PS" />
            )}
          <ProcessCharts processes={processes} result={result.schedule} />
          <AIExplanation
            processes={processes}
            result={result.schedule}
            algorithmType="PS"
          />
        </>
      )}
    </div>
  );
};

export default PriorityScheduling;
