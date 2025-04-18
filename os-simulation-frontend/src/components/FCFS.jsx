// import React, { useState } from "react";
// import axios from "axios";
// import ProcessCharts from "./ProcessCharts";
// import AIExplanation from "./AIExplanation"; // Adjust the path based on your file structure

// const FCFS = () => {
//   const [processes, setProcesses] = useState([]);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   const handleAddProcess = () => {
//     setProcesses([
//       ...processes,
//       {
//         processId: processes.length + 1,
//         arrivalTime: 0,
//         burstTime: 0,
//       },
//     ]);
//   };

//   const handleChange = (index, field, value) => {
//     const updatedProcesses = [...processes];
//     updatedProcesses[index][field] = Number(value) || 0;
//     setProcesses(updatedProcesses);
//   };
//   // handle change function is used for anything that the user changes like for example in this case the user is changing the arrival and burst time as input

//   // const handleDelete = (index) => {
//   //   const updatedProcesses = processes.filter((_, i) => i !== index);
//   //   updatedProcesses.forEach((p, i) => {
//   //     p.processId = i + 1;
//   //   });
//   //   setProcesses(updatedProcesses);
//   // };
//   const handleDelete = (index) => {
//     // Get the processId that's being deleted
//     const processIdToDelete = processes[index].processId;

//     // Update processes array
//     const updatedProcesses = processes.filter((_, i) => i !== index);
//     // Update processIds to maintain sequence
//     updatedProcesses.forEach((p, i) => {
//       p.processId = i + 1;
//     });

//     // If there are results, filter out the deleted process's result
//     // and update the processIds in the results to match the new sequence
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

//       if (processes.some((p) => p.arrivalTime < 0 || p.burstTime <= 0)) {
//         setError("Invalid arrival or burst times");
//         return;
//       }

//       const response = await axios.post("/api/fcfs", processes);
//       setResult(response.data.schedule);
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-slate-800">
//           FCFS Scheduling
//         </h1>
//         <div className="space-x-3">
//           <button
//             onClick={handleAddProcess}
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Add Process
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//           >
//             Calculate
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//           {error}
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
//           <thead className="bg-slate-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 border-b">
//                 Process ID
//               </th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 border-b">
//                 Arrival Time
//               </th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 border-b">
//                 Burst Time
//               </th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 border-b">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-200">
//             {processes.map((process, index) => (
//               <tr key={index} className="hover:bg-slate-50">
//                 <td className="px-6 py-4 text-sm text-slate-600">
//                   {process.processId}
//                 </td>
//                 <td className="px-6 py-4">
//                   <input
//                     type="number"
//                     min="0"
//                     value={process.arrivalTime}
//                     onChange={(e) =>
//                       handleChange(index, "arrivalTime", e.target.value)
//                     }
//                     className="w-24 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
//                 <td className="px-6 py-4">
//                   <input
//                     type="number"
//                     min="1"
//                     value={process.burstTime}
//                     onChange={(e) =>
//                       handleChange(index, "burstTime", e.target.value)
//                     }
//                     className="w-24 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
//                 <td className="px-6 py-4">
//                   <button
//                     onClick={() => handleDelete(index)}
//                     className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {result && result.length > 0 && (
//         <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//           <h2 className="text-xl font-semibold text-slate-800">Results:</h2>
//           <div className="grid gap-3">
//             {result.map((item) => (
//               <div
//                 key={item.processId}
//                 className="p-4 bg-slate-50 rounded-lg border border-slate-200"
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
//       <ProcessCharts processes={processes} result={result} />
//       <AIExplanation
//         processes={processes}
//         result={result}
//         algorithmType="FCFS" // Change based on component
//       />
//     </div>
//   );
// };

// export default FCFS;

///LATEST
import React, { useState } from "react";
import axios from "axios";
import ProcessCharts from "./ProcessCharts";
import AIExplanation from "./AIExplanation";
import ExecutionTimeline from "./ExecutionTimeline";

const FCFS = () => {
  const [processes, setProcesses] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

      const response = await axios.post(`${api}/api/fcfs`, processedProcesses);
      console.log("API Response:", response.data); // Debug log
      setResult(response.data); // Store the whole response object
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          FCFS Scheduling
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
      <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-slate-200">
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
            <tbody className="divide-y divide-slate-200 bg-white">
              {processes.map((process, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="whitespace-nowrap px-4 sm:px-6 py-3 text-xs sm:text-sm text-slate-600">
                    {process.processId}
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-6 py-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) =>
                        handleChange(index, "arrivalTime", e.target.value)
                      }
                      onBlur={(e) => handleBlur(index, "arrivalTime")}
                      className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 appearance-textfield"
                      style={{
                        WebkitAppearance: "textfield",
                        MozAppearance: "textfield",
                        appearance: "textfield",
                      }}
                      placeholder="0"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-6 py-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) =>
                        handleChange(index, "burstTime", e.target.value)
                      }
                      onBlur={(e) => handleBlur(index, "burstTime")}
                      className="w-20 sm:w-24 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-200 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 appearance-textfield"
                      style={{
                        WebkitAppearance: "textfield",
                        MozAppearance: "textfield",
                        appearance: "textfield",
                      }}
                      placeholder="0"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-6 py-3">
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

      {/* Results Section */}
      {result && result.schedule && result.schedule.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
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
      {result && (
        <>
          {result.timeline && (
            <ExecutionTimeline result={result} algorithmType="FCFS" />
          )}
          <ProcessCharts processes={processes} result={result.schedule} />
          <AIExplanation
            processes={processes}
            result={result.schedule}
            algorithmType="FCFS"
          />
        </>
      )}
    </div>
  );
};

export default FCFS;
