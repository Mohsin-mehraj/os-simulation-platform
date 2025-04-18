// import React, { useState } from "react";
// import axios from "axios";
// import { MessageCircle, Send, Loader } from "lucide-react";

// const MODEL_URL = "https://api-inference.huggingface.co/models/gpt2";
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000; // 2 seconds
// const INITIAL_TIMEOUT = 30000; // 30 seconds for first load
// const REGULAR_TIMEOUT = 15000; // 15 seconds for subsequent requests

// const AIExplanation = ({ processes, result, algorithmType }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Format the data for the prompt
//   const formatDataForPrompt = () => {
//     const processData = processes.map((p) => ({
//       id: p.processId,
//       arrival: p.arrivalTime,
//       burst: p.burstTime,
//       ...(p.priority && { priority: p.priority }),
//     }));

//     const resultData = result.map((r) => ({
//       id: r.processId,
//       start: r.startTime,
//       completion: r.completionTime,
//       waiting: r.waitingTime,
//       turnaround: r.turnaroundTime,
//     }));

//     return { processes: processData, schedule: resultData };
//   };

//   // Generate initial explanation
//   const generateExplanation = async (retryCount = 0) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const data = formatDataForPrompt();

//       // Log attempt and API key presence
//       console.log(
//         "Attempt:",
//         retryCount + 1,
//         "API Key exists:",
//         !!import.meta.env.VITE_HUGGINGFACE_API_KEY
//       );

//       const response = await axios.post(
//         MODEL_URL,
//         {
//           inputs: `Process scheduling analysis for ${algorithmType}:\nData: ${JSON.stringify(
//             data,
//             null,
//             2
//           )}\nAnalysis:`,
//           parameters: {
//             max_length: 200,
//             temperature: 0.7,
//             return_full_text: false,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           timeout: retryCount === 0 ? INITIAL_TIMEOUT : REGULAR_TIMEOUT, // Longer timeout for first attempt
//         }
//       );

//       console.log("Response:", response.data);

//       if (response.data) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content:
//               response.data[0]?.generated_text ||
//               "Analysis complete (no detailed response available)",
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error("Error details:", {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data,
//         headers: err.response?.headers,
//       });

//       // Handle 503 (Service Unavailable) with retries
//       if (err.response?.status === 503 && retryCount < MAX_RETRIES) {
//         setError(`Loading model (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
//         await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//         return generateExplanation(retryCount + 1);
//       }

//       // Handle 401 (Unauthorized)
//       if (err.response?.status === 401) {
//         setError("API Key error. Please check your configuration.");
//         return;
//       }

//       // Handle other errors
//       setError(
//         retryCount >= MAX_RETRIES
//           ? "Service unavailable after multiple attempts. Please try again later."
//           : `Error: ${err.message}`
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle user questions
//   const handleQuestionSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userQuestion = input;
//     setInput("");
//     setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
//     setIsLoading(true);
//     setError(null);

//     try {
//       const data = formatDataForPrompt();
//       const context = messages
//         .map(
//           (m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`
//         )
//         .join("\n");

//       const response = await axios.post(
//         MODEL_URL,
//         {
//           inputs: `Context: ${algorithmType} scheduling results: ${JSON.stringify(
//             data,
//             null,
//             2
//           )}
//                 Previous chat: ${context}
//                 Question: ${userQuestion}
//                 Answer:`,
//           parameters: {
//             max_length: 200,
//             temperature: 0.7,
//             return_full_text: false,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           timeout: REGULAR_TIMEOUT,
//         }
//       );

//       if (response.data) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content:
//               response.data[0]?.generated_text ||
//               "Response generated (no detailed answer available)",
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error("Error details:", err);
//       setError("Failed to get response. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//       {/* Header */}
//       <div className="p-4 border-b border-slate-200 flex justify-between items-center">
//         <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//           <MessageCircle className="w-5 h-5" />
//           AI Analysis
//         </h3>
//         <button
//           onClick={() => {
//             setIsOpen(!isOpen);
//             if (!isOpen && messages.length === 0) {
//               generateExplanation();
//             }
//           }}
//           className="text-sm font-medium text-blue-600 hover:text-blue-700"
//         >
//           {isOpen ? "Hide" : "Show"} Analysis
//         </button>
//       </div>

//       {/* AI Chat Interface */}
//       {isOpen && (
//         <div className="divide-y divide-slate-200">
//           {/* Messages Area */}
//           <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-3xl rounded-lg px-4 py-2 ${
//                     message.role === "user"
//                       ? "bg-blue-600 text-white"
//                       : "bg-slate-100 text-slate-800"
//                   }`}
//                 >
//                   {message.content}
//                 </div>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex items-center justify-center py-4">
//                 <Loader className="w-6 h-6 animate-spin text-blue-600" />
//               </div>
//             )}
//             {error && (
//               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//                 {error}
//               </div>
//             )}
//           </div>

//           {/* Input Area */}
//           <form onSubmit={handleQuestionSubmit} className="p-4">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask about the scheduling results..."
//                 className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={isLoading}
//               />
//               <button
//                 type="submit"
//                 disabled={isLoading || !input.trim()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 <Send className="w-4 h-4" />
//                 Send
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIExplanation;

// import React, { useState } from "react";
// import axios from "axios";
// import { MessageCircle, Send, Loader } from "lucide-react";

// const MODEL_URL =
//   "https://api-inference.huggingface.co/models/google/flan-t5-base";
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000;
// const INITIAL_TIMEOUT = 10000;
// const REGULAR_TIMEOUT = 8000;

// const createAnalysisPrompt = (algorithmType, processes, results) => {
//   // Calculate averages only if the data exists
//   const avgWaitingTime =
//     results.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / results.length;
//   const avgTurnaround =
//     results.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) /
//     results.length;

//   return `Analyze this ${algorithmType} CPU scheduling scenario:

// Process Details:
// ${processes
//   .map(
//     (p) =>
//       `Process ${p.processId}: Arrival=${p.arrivalTime}, Burst=${p.burstTime}${
//         p.priority ? `, Priority=${p.priority}` : ""
//       }`
//   )
//   .join("\n")}

// Execution Results:
// ${results
//   .map(
//     (p) =>
//       `Process ${p.processId}: Start=${p.startTime}, Completion=${
//         p.completionTime
//       }, Wait=${p.waitingTime || 0}`
//   )
//   .join("\n")}

// Performance Summary:
// - Average Waiting Time: ${avgWaitingTime.toFixed(2)}
// - Average Turnaround Time: ${avgTurnaround.toFixed(2)}

// Please analyze:
// 1. Why were processes executed in this order?
// 2. How efficient is this scheduling based on the metrics?
// 3. What patterns can be observed in the Gantt chart?
// 4. Are these results typical for ${algorithmType}?`;
// };

// const AIExplanation = ({ processes, result, algorithmType }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const generateExplanation = async (retryCount = 0) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const prompt = createAnalysisPrompt(algorithmType, processes, result);
//       console.log("Sending prompt:", prompt);

//       const response = await axios.post(
//         MODEL_URL,
//         {
//           inputs: prompt,
//           parameters: {
//             max_length: 500,
//             temperature: 0.3,
//             top_p: 0.9,
//             do_sample: true,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           timeout: retryCount === 0 ? INITIAL_TIMEOUT : REGULAR_TIMEOUT,
//         }
//       );

//       if (response.data && response.data[0]) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content: response.data[0].generated_text,
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error("Error details:", {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data,
//       });

//       if (err.response?.status === 503 && retryCount < MAX_RETRIES) {
//         setError(`Loading model (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
//         await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//         return generateExplanation(retryCount + 1);
//       }

//       if (err.response?.status === 401) {
//         setError("API Key error. Please check your configuration.");
//         return;
//       }

//       setError(
//         retryCount >= MAX_RETRIES
//           ? "Service unavailable after multiple attempts. Please try again later."
//           : `Error: ${err.message}`
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleQuestionSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userQuestion = input;
//     setInput("");
//     setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
//     setIsLoading(true);
//     setError(null);

//     try {
//       const context = messages
//         .map((m) => `${m.role === "user" ? "Q" : "A"}: ${m.content}`)
//         .join("\n");

//       const response = await axios.post(
//         MODEL_URL,
//         {
//           inputs: `Given this ${algorithmType} scheduling scenario:
// ${processes
//   .map((p) => `P${p.processId}: Arrival=${p.arrivalTime}, Burst=${p.burstTime}`)
//   .join(", ")}

// Results shown in charts:
// - Gantt chart shows process execution timeline
// - Performance metrics chart shows waiting and turnaround times
// - Time distribution chart shows CPU utilization

// Previous discussion:
// ${context}

// Question: ${userQuestion}
// Provide a detailed answer focusing on the scheduling data and charts:`,
//           parameters: {
//             max_length: 300,
//             temperature: 0.3,
//             top_p: 0.9,
//             do_sample: true,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           timeout: REGULAR_TIMEOUT,
//         }
//       );

//       if (response.data && response.data[0]) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content: response.data[0].generated_text,
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error("Error details:", err);
//       setError("Failed to get response. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//       <div className="p-4 border-b border-slate-200 flex justify-between items-center">
//         <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//           <MessageCircle className="w-5 h-5" />
//           AI Analysis
//         </h3>
//         <button
//           onClick={() => {
//             setIsOpen(!isOpen);
//             if (!isOpen && messages.length === 0) {
//               generateExplanation();
//             }
//           }}
//           className="text-sm font-medium text-blue-600 hover:text-blue-700"
//         >
//           {isOpen ? "Hide" : "Show"} Analysis
//         </button>
//       </div>

//       {isOpen && (
//         <div className="divide-y divide-slate-200">
//           <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-3xl rounded-lg px-4 py-2 ${
//                     message.role === "user"
//                       ? "bg-blue-600 text-white"
//                       : "bg-slate-100 text-slate-800"
//                   }`}
//                 >
//                   {message.content}
//                 </div>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex items-center justify-center py-4">
//                 <Loader className="w-6 h-6 animate-spin text-blue-600" />
//               </div>
//             )}
//             {error && (
//               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//                 {error}
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleQuestionSubmit} className="p-4">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask about the scheduling results..."
//                 className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={isLoading}
//               />
//               <button
//                 type="submit"
//                 disabled={isLoading || !input.trim()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 <Send className="w-4 h-4" />
//                 Send
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIExplanation;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   MessageCircle,
//   Send,
//   Loader,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";

// // Keep original generateAnalysisText function
// const generateAnalysisText = (data) => {
//   const orderedProcesses = [...data.processes].sort(
//     (a, b) => a.start - b.start
//   );
//   const timeGaps = [];

//   for (let i = 0; i < orderedProcesses.length - 1; i++) {
//     const current = orderedProcesses[i];
//     const next = orderedProcesses[i + 1];
//     const gap = next.start - current.completion;
//     if (gap > 0) {
//       timeGaps.push({ start: current.completion, end: next.start });
//     }
//   }

//   return `${data.algorithmType} Scheduling Analysis:

// 1. Process Execution Order and Decisions:
// ${orderedProcesses
//   .map((p, index) => {
//     let explanation = `• Process ${p.id}:
//    - Arrived at t=${p.arrival}
//    - Started at t=${p.start}
//    - ${p.waiting === 0 ? "No waiting time" : `Waited ${p.waiting} units`}
//    - Completed at t=${p.completion}`;

//     if (index < orderedProcesses.length - 1) {
//       const nextP = orderedProcesses[index + 1];
//       explanation += `\n   - Next process (P${nextP.id}) ${
//         nextP.start - p.completion === 0
//           ? "started immediately"
//           : `started after ${nextP.start - p.completion} units`
//       }`;
//     }
//     return explanation;
//   })
//   .join("\n\n")}

// 2. Performance Analysis:
// • CPU Utilization: ${data.metrics.cpuUtilization}%
// ${
//   timeGaps.length > 0
//     ? `  - Found ${timeGaps.length} gap(s) in execution
//   - Total idle time: ${timeGaps.reduce(
//     (sum, gap) => sum + (gap.end - gap.start),
//     0
//   )} units`
//     : "  - No gaps in execution - optimal CPU usage"
// }
// • Average Waiting Time: ${data.metrics.avgWaiting.toFixed(2)} units
//   - Shows typical process delay before execution
// • Average Turnaround Time: ${data.metrics.avgTurnaround.toFixed(2)} units
//   - Indicates overall responsiveness

// 3. Gantt Chart Pattern Analysis:
// ${orderedProcesses
//   .map((p) => {
//     const executionTime = p.completion - p.start;
//     return `• P${p.id}: ${p.start} → ${p.completion} (${executionTime} units)`;
//   })
//   .join("\n")}

// 4. Efficiency and Optimization:
// • Process Timing:
//   - Shortest execution: ${Math.min(
//     ...orderedProcesses.map((p) => p.completion - p.start)
//   )} units
//   - Longest execution: ${Math.max(
//     ...orderedProcesses.map((p) => p.completion - p.start)
//   )} units
// • Waiting Time Distribution:
//   - Best case: ${Math.min(...orderedProcesses.map((p) => p.waiting))} units
//   - Worst case: ${Math.max(...orderedProcesses.map((p) => p.waiting))} units

// 5. Potential Improvements:
// ${
//   data.algorithmType === "FCFS"
//     ? "• Consider SJF if shorter processes are arriving early\n• Look for opportunities to reorder based on burst time"
//     : data.algorithmType === "SJF"
//     ? "• Monitor for potential starvation of longer processes\n• Consider aging mechanism for waiting processes"
//     : data.algorithmType === "RR"
//     ? "• Analyze if time quantum is optimal\n• Look for balance between response time and context switches"
//     : "• Evaluate priority assignments\n• Consider dynamic priority adjustments"
// }
// • Current scheduling achieves ${data.metrics.cpuUtilization}% CPU utilization
// ${
//   data.metrics.cpuUtilization < 90
//     ? "  - Could be improved by reducing gaps between processes"
//     : "  - Shows efficient CPU usage"
// }`;
// };

// const formatAnalysisContent = (content) => {
//   if (!content) return null;

//   const sections = content.split(/(?=\d\. )/);

//   return sections.map((section, index) => {
//     if (index === 0) {
//       return (
//         <div key="title" className="text-lg font-medium text-slate-800 mb-6">
//           {section}
//         </div>
//       );
//     }

//     const [heading, ...contentLines] = section.split("\n");
//     return (
//       <div key={index} className="mb-6 last:mb-0">
//         <h3 className="text-lg font-semibold text-slate-800 mb-3">{heading}</h3>
//         <div className="space-y-1">
//           {contentLines.map((line, i) => {
//             const indentLevel = (line.match(/^\s*/) || [""])[0].length;
//             const isBulletPoint = line.trim().startsWith("•");

//             return (
//               <div
//                 key={i}
//                 className={`${indentLevel > 0 ? "ml-6" : ""} ${
//                   isBulletPoint
//                     ? "text-slate-800 font-medium my-2"
//                     : "text-slate-600 my-1"
//                 }`}
//               >
//                 {line.trim()}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   });
// };

// const AIExplanation = ({ processes, result, algorithmType }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [analysisContext, setAnalysisContext] = useState(null);
//   const [lastAnalyzedData, setLastAnalyzedData] = useState(null);

//   useEffect(() => {
//     const currentData = JSON.stringify({ processes, result });
//     if (isOpen && (!lastAnalyzedData || lastAnalyzedData !== currentData)) {
//       setLastAnalyzedData(currentData);
//       generateAnalysis();
//     }
//   }, [processes, result, isOpen]);

//   const generateAnalysis = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       // Calculate key metrics
//       const totalTime = Math.max(...result.map((p) => p.completionTime));
//       const avgWaiting =
//         result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length;
//       const avgTurnaround =
//         result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length;
//       const cpuUtilization = (
//         (result.reduce((sum, p) => sum + (p.completionTime - p.startTime), 0) /
//           totalTime) *
//         100
//       ).toFixed(2);

//       // Create analysis context
//       const analysisData = {
//         algorithmType,
//         processes: processes.map((p) => {
//           const resultData = result.find((r) => r.processId === p.processId);
//           return {
//             id: p.processId,
//             arrival: p.arrivalTime,
//             burst: p.burstTime,
//             priority: p.priority,
//             start: resultData?.startTime,
//             completion: resultData?.completionTime,
//             waiting: resultData?.waitingTime,
//             turnaround: resultData?.turnaroundTime,
//           };
//         }),
//         metrics: {
//           totalTime,
//           avgWaiting,
//           avgTurnaround,
//           cpuUtilization,
//         },
//       };

//       setAnalysisContext(analysisData);

//       // Generate analysis text
//       const analysisText = generateAnalysisText(analysisData);

//       // Set a single message with the complete analysis
//       setMessages([
//         {
//           role: "assistant",
//           content: analysisText.replace(/\n{3,}/g, "\n\n"), // Remove multiple consecutive newlines
//         },
//       ]);
//     } catch (err) {
//       console.error("Analysis Error:", err);
//       setError("Failed to generate analysis. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleQuestion = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userQuestion = input;
//     setInput("");
//     setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!analysisContext) {
//         throw new Error("Analysis context not available");
//       }

//       // Create specific context for the question
//       const context = `Based on the ${algorithmType} scheduling results:

// Process Data:
// ${analysisContext.processes
//   .map(
//     (p) =>
//       `P${p.id}:
// - Arrived: t=${p.arrival}
// - Burst Time: ${p.burst}
// - Started: t=${p.start}
// - Completed: t=${p.completion}
// - Waited: ${p.waiting}
// - Turnaround: ${p.turnaround}`
//   )
//   .join("\n\n")}

// Performance Metrics:
// - Total Time: ${analysisContext.metrics.totalTime} units
// - Average Wait: ${analysisContext.metrics.avgWaiting.toFixed(2)} units
// - Average Turnaround: ${analysisContext.metrics.avgTurnaround.toFixed(2)} units
// - CPU Usage: ${analysisContext.metrics.cpuUtilization}%

// Question: ${userQuestion}

// Provide a detailed answer using the actual scheduling data and metrics.`;

//       const response = await axios.post(
//         "https://api-inference.huggingface.co/models/google/flan-t5-large",
//         {
//           inputs: context,
//           parameters: {
//             max_length: 500,
//             temperature: 0.3,
//             top_p: 0.95,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data && response.data[0]) {
//         const cleanedResponse = response.data[0].generated_text
//           .replace(/\n{3,}/g, "\n\n") // Remove multiple consecutive newlines
//           .replace(/(.+?)(?:\1)+/g, "$1"); // Remove repeated phrases

//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content: cleanedResponse,
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error("Question Error:", err);
//       setError(
//         err.message === "Analysis context not available"
//           ? "Please wait for the initial analysis to complete."
//           : "Failed to get response. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
//       <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <MessageCircle className="w-5 h-5 text-blue-600" />
//           <h3 className="text-lg font-semibold text-slate-800">
//             Process Analysis
//           </h3>
//         </div>
//         <button
//           onClick={() => {
//             const newIsOpen = !isOpen;
//             setIsOpen(newIsOpen);
//             if (newIsOpen) {
//               setMessages([]);
//               generateAnalysis();
//             }
//           }}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//         >
//           {isOpen ? (
//             <>
//               Hide Analysis <ChevronUp className="w-4 h-4" />
//             </>
//           ) : (
//             <>
//               Show Analysis <ChevronDown className="w-4 h-4" />
//             </>
//           )}
//         </button>
//       </div>

//       {isOpen && (
//         <div className="divide-y divide-slate-200">
//           <div className="p-6 space-y-6 max-h-[32rem] overflow-y-auto">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-3xl rounded-lg px-6 py-4 ${
//                     message.role === "user"
//                       ? "bg-blue-600 text-white shadow-sm"
//                       : "bg-slate-50 text-slate-800 shadow-sm border border-slate-200"
//                   }`}
//                 >
//                   {message.role === "assistant"
//                     ? formatAnalysisContent(message.content)
//                     : message.content}
//                 </div>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="flex items-center justify-center py-4">
//                 <Loader className="w-6 h-6 animate-spin text-blue-600" />
//               </div>
//             )}

//             {error && (
//               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//                 {error}
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleQuestion} className="p-4 bg-slate-50">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask questions about the process analysis..."
//                 className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
//                 disabled={isLoading}
//               />
//               <button
//                 type="submit"
//                 disabled={isLoading || !input.trim()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
//               >
//                 <Send className="w-4 h-4" />
//                 Send
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIExplanation;

//latest

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   MessageCircle,
//   Send,
//   Loader,
//   ChevronDown,
//   ChevronUp,
//   Trash2,
// } from "lucide-react";

// // Keep original generateAnalysisText function
// const generateAnalysisText = (data) => {
//   const orderedProcesses = [...data.processes].sort(
//     (a, b) => a.start - b.start
//   );
//   const timeGaps = [];

//   for (let i = 0; i < orderedProcesses.length - 1; i++) {
//     const current = orderedProcesses[i];
//     const next = orderedProcesses[i + 1];
//     const gap = next.start - current.completion;
//     if (gap > 0) {
//       timeGaps.push({ start: current.completion, end: next.start });
//     }
//   }

//   return `${data.algorithmType} Scheduling Analysis:

// 1. Process Execution Order and Decisions:
// ${orderedProcesses
//   .map((p, index) => {
//     let explanation = `• Process ${p.id}:
//    - Arrived at t=${p.arrival}
//    - Started at t=${p.start}
//    - ${p.waiting === 0 ? "No waiting time" : `Waited ${p.waiting} units`}
//    - Completed at t=${p.completion}`;

//     if (index < orderedProcesses.length - 1) {
//       const nextP = orderedProcesses[index + 1];
//       explanation += `\n   - Next process (P${nextP.id}) ${
//         nextP.start - p.completion === 0
//           ? "started immediately"
//           : `started after ${nextP.start - p.completion} units`
//       }`;
//     }
//     return explanation;
//   })
//   .join("\n\n")}

// 2. Performance Analysis:
// • CPU Utilization: ${data.metrics.cpuUtilization}%
// ${
//   timeGaps.length > 0
//     ? `  - Found ${timeGaps.length} gap(s) in execution
//   - Total idle time: ${timeGaps.reduce(
//     (sum, gap) => sum + (gap.end - gap.start),
//     0
//   )} units`
//     : "  - No gaps in execution - optimal CPU usage"
// }
// • Average Waiting Time: ${data.metrics.avgWaiting.toFixed(2)} units
//   - Shows typical process delay before execution
// • Average Turnaround Time: ${data.metrics.avgTurnaround.toFixed(2)} units
//   - Indicates overall responsiveness

// 3. Gantt Chart Pattern Analysis:
// ${orderedProcesses
//   .map((p) => {
//     const executionTime = p.completion - p.start;
//     return `• P${p.id}: ${p.start} → ${p.completion} (${executionTime} units)`;
//   })
//   .join("\n")}

// 4. Efficiency and Optimization:
// • Process Timing:
//   - Shortest execution: ${Math.min(
//     ...orderedProcesses.map((p) => p.completion - p.start)
//   )} units
//   - Longest execution: ${Math.max(
//     ...orderedProcesses.map((p) => p.completion - p.start)
//   )} units
// • Waiting Time Distribution:
//   - Best case: ${Math.min(...orderedProcesses.map((p) => p.waiting))} units
//   - Worst case: ${Math.max(...orderedProcesses.map((p) => p.waiting))} units

// 5. Potential Improvements:
// ${
//   data.algorithmType === "FCFS"
//     ? "• Consider SJF if shorter processes are arriving early\n• Look for opportunities to reorder based on burst time"
//     : data.algorithmType === "SJF"
//     ? "• Monitor for potential starvation of longer processes\n• Consider aging mechanism for waiting processes"
//     : data.algorithmType === "RR"
//     ? "• Analyze if time quantum is optimal\n• Look for balance between response time and context switches"
//     : "• Evaluate priority assignments\n• Consider dynamic priority adjustments"
// }
// • Current scheduling achieves ${data.metrics.cpuUtilization}% CPU utilization
// ${
//   data.metrics.cpuUtilization < 90
//     ? "  - Could be improved by reducing gaps between processes"
//     : "  - Shows efficient CPU usage"
// }`;
// };

// const formatAnalysisContent = (content) => {
//   if (!content) return null;

//   const sections = content.split(/(?=\d\. )/);

//   return sections.map((section, index) => {
//     if (index === 0) {
//       return (
//         <div key="title" className="text-lg font-medium text-slate-800 mb-6">
//           {section}
//         </div>
//       );
//     }

//     const [heading, ...contentLines] = section.split("\n");
//     return (
//       <div key={index} className="mb-6 last:mb-0">
//         <h3 className="text-lg font-semibold text-slate-800 mb-3">{heading}</h3>
//         <div className="space-y-1">
//           {contentLines.map((line, i) => {
//             const indentLevel = (line.match(/^\s*/) || [""])[0].length;
//             const isBulletPoint = line.trim().startsWith("•");

//             return (
//               <div
//                 key={i}
//                 className={`${indentLevel > 0 ? "ml-6" : ""} ${
//                   isBulletPoint
//                     ? "text-slate-800 font-medium my-2"
//                     : "text-slate-600 my-1"
//                 }`}
//               >
//                 {line.trim()}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   });
// };

// const AIExplanation = ({ processes, result, algorithmType }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [analysisContext, setAnalysisContext] = useState(null);
//   const [lastAnalyzedData, setLastAnalyzedData] = useState(null);

//   useEffect(() => {
//     const currentData = JSON.stringify({ processes, result });
//     if (isOpen && (!lastAnalyzedData || lastAnalyzedData !== currentData)) {
//       setLastAnalyzedData(currentData);
//       generateAnalysis();
//     }
//   }, [processes, result, isOpen]);

//   const generateAnalysis = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       // Calculate key metrics
//       const totalTime = Math.max(...result.map((p) => p.completionTime));
//       const avgWaiting =
//         result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length;
//       const avgTurnaround =
//         result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length;
//       const cpuUtilization = (
//         (result.reduce((sum, p) => sum + (p.completionTime - p.startTime), 0) /
//           totalTime) *
//         100
//       ).toFixed(2);

//       // Create analysis context
//       const analysisData = {
//         algorithmType,
//         processes: processes.map((p) => {
//           const resultData = result.find((r) => r.processId === p.processId);
//           return {
//             id: p.processId,
//             arrival: p.arrivalTime,
//             burst: p.burstTime,
//             priority: p.priority,
//             start: resultData?.startTime,
//             completion: resultData?.completionTime,
//             waiting: resultData?.waitingTime,
//             turnaround: resultData?.turnaroundTime,
//           };
//         }),
//         metrics: {
//           totalTime,
//           avgWaiting,
//           avgTurnaround,
//           cpuUtilization,
//         },
//       };

//       setAnalysisContext(analysisData);

//       // Generate analysis text
//       const analysisText = generateAnalysisText(analysisData);

//       // Set a single message with the complete analysis
//       setMessages([
//         {
//           role: "assistant",
//           content: analysisText.replace(/\n{3,}/g, "\n\n"), // Remove multiple consecutive newlines
//         },
//       ]);
//     } catch (err) {
//       console.error("Analysis Error:", err);
//       setError("Failed to generate analysis. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleQuestion = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userQuestion = input;
//     setInput("");
//     setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!analysisContext) {
//         throw new Error("Analysis context not available");
//       }

//       // Create specific context for the question
//       const context = `Based on the ${algorithmType} scheduling results:

// Process Data:
// ${analysisContext.processes
//   .map(
//     (p) =>
//       `P${p.id}:
// - Arrived: t=${p.arrival}
// - Burst Time: ${p.burst}
// - Started: t=${p.start}
// - Completed: t=${p.completion}
// - Waited: ${p.waiting}
// - Turnaround: ${p.turnaround}`
//   )
//   .join("\n\n")}

// Performance Metrics:
// - Total Time: ${analysisContext.metrics.totalTime} units
// - Average Wait: ${analysisContext.metrics.avgWaiting.toFixed(2)} units
// - Average Turnaround: ${analysisContext.metrics.avgTurnaround.toFixed(2)} units
// - CPU Usage: ${analysisContext.metrics.cpuUtilization}%

// Question: ${userQuestion}

// Provide a detailed answer using the actual scheduling data and metrics.`;

//       const response = await axios.post(
//         "https://api-inference.huggingface.co/models/google/flan-t5-large",
//         {
//           inputs: context,
//           parameters: {
//             max_length: 500,
//             temperature: 0.3,
//             top_p: 0.95,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data && response.data[0]) {
//         const cleanedResponse = response.data[0].generated_text
//           .replace(/\n{3,}/g, "\n\n") // Remove multiple consecutive newlines
//           .replace(/(.+?)(?:\1)+/g, "$1"); // Remove repeated phrases

//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "assistant",
//             content: cleanedResponse,
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error("Question Error:", err);
//       setError(
//         err.message === "Analysis context not available"
//           ? "Please wait for the initial analysis to complete."
//           : "Failed to get response. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
//       <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <MessageCircle className="w-5 h-5 text-blue-600" />
//           <h3 className="text-lg font-semibold text-slate-800">
//             Process Analysis
//           </h3>
//         </div>
//         <button
//           onClick={() => {
//             const newIsOpen = !isOpen;
//             setIsOpen(newIsOpen);
//             if (newIsOpen) {
//               setMessages([]);
//               generateAnalysis();
//             }
//           }}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//         >
//           {isOpen ? (
//             <>
//               Hide Analysis <ChevronUp className="w-4 h-4" />
//             </>
//           ) : (
//             <>
//               Show Analysis <ChevronDown className="w-4 h-4" />
//             </>
//           )}
//         </button>
//       </div>

//       {isOpen && (
//         <div className="divide-y divide-slate-200">
//           <div className="p-6 space-y-6 max-h-[32rem] overflow-y-auto">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-3xl rounded-lg px-6 py-4 ${
//                     message.role === "user"
//                       ? "bg-blue-600 text-white shadow-sm"
//                       : "bg-slate-50 text-slate-800 shadow-sm border border-slate-200"
//                   }`}
//                 >
//                   {message.role === "assistant"
//                     ? formatAnalysisContent(message.content)
//                     : message.content}
//                 </div>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="flex items-center justify-center py-4">
//                 <Loader className="w-6 h-6 animate-spin text-blue-600" />
//               </div>
//             )}

//             {error && (
//               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//                 {error}
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleQuestion} className="p-4 bg-slate-50">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask questions about the process analysis..."
//                 className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
//                 disabled={isLoading}
//               />
//               <button
//                 type="submit"
//                 disabled={isLoading || !input.trim()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
//               >
//                 <Send className="w-4 h-4" />
//                 Send
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setMessages([]);
//                   setInput("");
//                   setError(null);
//                   generateAnalysis();
//                 }}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
//               >
//                 <Trash2 className="w-4 h-4" />
//                 Clear
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIExplanation;

//LATEST

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MessageCircle,
  Send,
  Loader,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

// Keep original generateAnalysisText function
const generateAnalysisText = (data) => {
  const orderedProcesses = [...data.processes].sort(
    (a, b) => a.start - b.start
  );
  const timeGaps = [];

  for (let i = 0; i < orderedProcesses.length - 1; i++) {
    const current = orderedProcesses[i];
    const next = orderedProcesses[i + 1];
    const gap = next.start - current.completion;
    if (gap > 0) {
      timeGaps.push({ start: current.completion, end: next.start });
    }
  }

  return `${data.algorithmType} Scheduling Analysis:

1. Process Execution Order and Decisions:
${orderedProcesses
  .map((p, index) => {
    let explanation = `• Process ${p.id}:
   - Arrived at t=${p.arrival}
   - Started at t=${p.start}
   - ${p.waiting === 0 ? "No waiting time" : `Waited ${p.waiting} units`}
   - Completed at t=${p.completion}`;

    if (index < orderedProcesses.length - 1) {
      const nextP = orderedProcesses[index + 1];
      explanation += `\n   - Next process (P${nextP.id}) ${
        nextP.start - p.completion === 0
          ? "started immediately"
          : `started after ${nextP.start - p.completion} units`
      }`;
    }
    return explanation;
  })
  .join("\n\n")}

2. Performance Analysis:
• CPU Utilization: ${data.metrics.cpuUtilization}%
${
  timeGaps.length > 0
    ? `  - Found ${timeGaps.length} gap(s) in execution
  - Total idle time: ${timeGaps.reduce(
    (sum, gap) => sum + (gap.end - gap.start),
    0
  )} units`
    : "  - No gaps in execution - optimal CPU usage"
}
• Average Waiting Time: ${data.metrics.avgWaiting.toFixed(2)} units
  - Shows typical process delay before execution
• Average Turnaround Time: ${data.metrics.avgTurnaround.toFixed(2)} units
  - Indicates overall responsiveness

3. Gantt Chart Pattern Analysis:
${orderedProcesses
  .map((p) => {
    const executionTime = p.completion - p.start;
    return `• P${p.id}: ${p.start} → ${p.completion} (${executionTime} units)`;
  })
  .join("\n")}

4. Efficiency and Optimization:
• Process Timing:
  - Shortest execution: ${Math.min(
    ...orderedProcesses.map((p) => p.completion - p.start)
  )} units
  - Longest execution: ${Math.max(
    ...orderedProcesses.map((p) => p.completion - p.start)
  )} units
• Waiting Time Distribution:
  - Best case: ${Math.min(...orderedProcesses.map((p) => p.waiting))} units
  - Worst case: ${Math.max(...orderedProcesses.map((p) => p.waiting))} units

5. Potential Improvements:
${
  data.algorithmType === "FCFS"
    ? "• Consider SJF if shorter processes are arriving early\n• Look for opportunities to reorder based on burst time"
    : data.algorithmType === "SJF"
    ? "• Monitor for potential starvation of longer processes\n• Consider aging mechanism for waiting processes"
    : data.algorithmType === "RR"
    ? "• Analyze if time quantum is optimal\n• Look for balance between response time and context switches"
    : "• Evaluate priority assignments\n• Consider dynamic priority adjustments"
}
• Current scheduling achieves ${data.metrics.cpuUtilization}% CPU utilization
${
  data.metrics.cpuUtilization < 90
    ? "  - Could be improved by reducing gaps between processes"
    : "  - Shows efficient CPU usage"
}`;
};

const formatAnalysisContent = (content) => {
  if (!content) return null;

  const sections = content.split(/(?=\d\. )/);

  return sections.map((section, index) => {
    if (index === 0) {
      return (
        <div
          key="title"
          className="text-base sm:text-lg font-medium text-slate-800 mb-4 sm:mb-6"
        >
          {section}
        </div>
      );
    }

    const [heading, ...contentLines] = section.split("\n");
    return (
      <div key={index} className="mb-4 sm:mb-6 last:mb-0">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3">
          {heading}
        </h3>
        <div className="space-y-1">
          {contentLines.map((line, i) => {
            const indentLevel = (line.match(/^\s*/) || [""])[0].length;
            const isBulletPoint = line.trim().startsWith("•");

            return (
              <div
                key={i}
                className={`${indentLevel > 0 ? "ml-4 sm:ml-6" : ""} ${
                  isBulletPoint
                    ? "text-slate-800 font-medium my-1.5 sm:my-2 text-sm sm:text-base"
                    : "text-slate-600 my-1 text-sm sm:text-base"
                }`}
              >
                {line.trim()}
              </div>
            );
          })}
        </div>
      </div>
    );
  });
};

const AIExplanation = ({ processes, result, algorithmType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisContext, setAnalysisContext] = useState(null);
  const [lastAnalyzedData, setLastAnalyzedData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const currentData = JSON.stringify({ processes, result });
    if (isOpen && (!lastAnalyzedData || lastAnalyzedData !== currentData)) {
      setLastAnalyzedData(currentData);
      generateAnalysis();
    }
  }, [processes, result, isOpen]);

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate key metrics
      const totalTime = Math.max(...result.map((p) => p.completionTime));
      const avgWaiting =
        result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length;
      const avgTurnaround =
        result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length;
      const cpuUtilization = (
        (result.reduce((sum, p) => sum + (p.completionTime - p.startTime), 0) /
          totalTime) *
        100
      ).toFixed(2);

      // Create analysis context
      const analysisData = {
        algorithmType,
        processes: processes.map((p) => {
          const resultData = result.find((r) => r.processId === p.processId);
          return {
            id: p.processId,
            arrival: p.arrivalTime,
            burst: p.burstTime,
            priority: p.priority,
            start: resultData?.startTime,
            completion: resultData?.completionTime,
            waiting: resultData?.waitingTime,
            turnaround: resultData?.turnaroundTime,
          };
        }),
        metrics: {
          totalTime,
          avgWaiting,
          avgTurnaround,
          cpuUtilization,
        },
      };

      setAnalysisContext(analysisData);

      // Generate analysis text
      const analysisText = generateAnalysisText(analysisData);

      // Set a single message with the complete analysis
      setMessages([
        {
          role: "assistant",
          content: analysisText.replace(/\n{3,}/g, "\n\n"), // Remove multiple consecutive newlines
        },
      ]);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestion = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
    setIsLoading(true);
    setError(null);

    try {
      if (!analysisContext) {
        throw new Error("Analysis context not available");
      }

      // Create specific context for the question
      const context = `Based on the ${algorithmType} scheduling results:

Process Data:
${analysisContext.processes
  .map(
    (p) =>
      `P${p.id}:
- Arrived: t=${p.arrival}
- Burst Time: ${p.burst}
- Started: t=${p.start}
- Completed: t=${p.completion}
- Waited: ${p.waiting}
- Turnaround: ${p.turnaround}`
  )
  .join("\n\n")}

Performance Metrics:
- Total Time: ${analysisContext.metrics.totalTime} units
- Average Wait: ${analysisContext.metrics.avgWaiting.toFixed(2)} units
- Average Turnaround: ${analysisContext.metrics.avgTurnaround.toFixed(2)} units
- CPU Usage: ${analysisContext.metrics.cpuUtilization}%

Question: ${userQuestion}

Provide a detailed answer using the actual scheduling data and metrics.`;

      const response = await axios.post(
        "https://api-inference.huggingface.co/models/google/flan-t5-large",
        {
          inputs: context,
          parameters: {
            max_length: 500,
            temperature: 0.3,
            top_p: 0.95,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data[0]) {
        const cleanedResponse = response.data[0].generated_text
          .replace(/\n{3,}/g, "\n\n") // Remove multiple consecutive newlines
          .replace(/(.+?)(?:\1)+/g, "$1"); // Remove repeated phrases

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: cleanedResponse,
          },
        ]);
      }
    } catch (err) {
      console.error("Question Error:", err);
      setError(
        err.message === "Analysis context not available"
          ? "Please wait for the initial analysis to complete."
          : "Failed to get response. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex justify-between items-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Process Analysis
          </h3>
        </div>
        <button
          onClick={() => {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            if (newIsOpen) {
              setMessages([]);
              generateAnalysis();
            }
          }}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {isOpen ? (
            <>
              Hide <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="divide-y divide-slate-200">
          {/* Messages Container */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-h-[24rem] sm:max-h-[32rem] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-full sm:max-w-3xl rounded-lg px-4 sm:px-6 py-3 sm:py-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white shadow-sm mr-2 sm:mr-0"
                      : "bg-slate-50 text-slate-800 shadow-sm border border-slate-200 ml-2 sm:ml-0"
                  }`}
                >
                  {message.role === "assistant"
                    ? formatAnalysisContent(message.content)
                    : message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
              </div>
            )}

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleQuestion} className="p-3 sm:p-4 bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the analysis..."
                className="flex-1 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span className="sm:inline">Send</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setInput("");
                    setError(null);
                    generateAnalysis();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sm:inline">Clear</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIExplanation;
