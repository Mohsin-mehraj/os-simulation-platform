// import React, { useState } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react";

// const Documentation = () => {
//   // State to track which sections are expanded
//   const [expandedSections, setExpandedSections] = useState({
//     fcfs: false,
//     sjf: false,
//     rr: false,
//     priority: false,
//   });

//   // Toggle section expansion
//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   return (
//     <div className="max-w-full space-y-4 sm:space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4">
//         <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
//           CPU Scheduling Algorithms Documentation
//         </h1>
//         <p className="text-sm sm:text-base text-slate-600">
//           Welcome to the CPU Scheduling Simulator. This tool helps you
//           understand and visualize different CPU scheduling algorithms commonly
//           used in operating systems.
//         </p>
//       </div>

//       {/* Getting Started Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
//         <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
//           Getting Started
//         </h2>
//         <div className="space-y-3 text-sm sm:text-base text-slate-600">
//           <p>To use any scheduling algorithm simulation:</p>
//           <ol className="list-decimal ml-5 space-y-2">
//             <li>Select the desired algorithm from the sidebar</li>
//             <li>Click "Add Process" to add processes to the queue</li>
//             <li>
//               For each process, specify:
//               <ul className="list-disc ml-5 mt-2 space-y-1">
//                 <li>Arrival Time: When the process enters the system</li>
//                 <li>Burst Time: How long the process needs to execute</li>
//                 <li>
//                   Priority (if applicable): Lower number means higher priority
//                 </li>
//               </ul>
//             </li>
//             <li>Click "Calculate" to see the scheduling results</li>
//             <li>Review the visualizations and analysis provided</li>
//           </ol>
//         </div>
//       </div>

//       {/* Algorithms Section */}
//       <div className="space-y-4">
//         {/* FCFS */}
//         <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection("fcfs")}
//             className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
//           >
//             <h3 className="text-base sm:text-lg font-semibold text-slate-800">
//               First Come First Serve (FCFS)
//             </h3>
//             {expandedSections.fcfs ? (
//               <ChevronUp className="w-5 h-5 text-slate-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-slate-400" />
//             )}
//           </button>
//           {expandedSections.fcfs && (
//             <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
//               <p>
//                 The simplest scheduling algorithm that processes tasks in the
//                 order they arrive.
//               </p>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">
//                   Key Characteristics:
//                 </p>
//                 <ul className="list-disc ml-5 space-y-1">
//                   <li>Non-preemptive scheduling</li>
//                   <li>Easy to understand and implement</li>
//                   <li>Fair in a first-come-first-served manner</li>
//                   <li>Poor for processes with varying burst times</li>
//                 </ul>
//               </div>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">Example Scenario:</p>
//                 <div className="bg-slate-50 p-4 rounded-lg">
//                   <p className="font-medium text-slate-700 mb-2">
//                     Try these values:
//                   </p>
//                   <ul className="space-y-2">
//                     <li>Process 1: Arrival = 0, Burst = 5</li>
//                     <li>Process 2: Arrival = 1, Burst = 3</li>
//                     <li>Process 3: Arrival = 2, Burst = 1</li>
//                   </ul>
//                   <p className="mt-2 text-slate-600">
//                     Notice how shorter processes must wait for longer ones that
//                     arrived earlier.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* SJF */}
//         <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection("sjf")}
//             className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
//           >
//             <h3 className="text-base sm:text-lg font-semibold text-slate-800">
//               Shortest Job First (SJF)
//             </h3>
//             {expandedSections.sjf ? (
//               <ChevronUp className="w-5 h-5 text-slate-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-slate-400" />
//             )}
//           </button>
//           {expandedSections.sjf && (
//             <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
//               <p>
//                 Selects the process with the shortest burst time next,
//                 optimizing average waiting time.
//               </p>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">
//                   Key Characteristics:
//                 </p>
//                 <ul className="list-disc ml-5 space-y-1">
//                   <li>Non-preemptive scheduling</li>
//                   <li>Optimal average waiting time</li>
//                   <li>May cause starvation of longer processes</li>
//                   <li>Requires knowing burst times in advance</li>
//                 </ul>
//               </div>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">Example Scenario:</p>
//                 <div className="bg-slate-50 p-4 rounded-lg">
//                   <p className="font-medium text-slate-700 mb-2">
//                     Try these values:
//                   </p>
//                   <ul className="space-y-2">
//                     <li>Process 1: Arrival = 0, Burst = 6</li>
//                     <li>Process 2: Arrival = 1, Burst = 2</li>
//                     <li>Process 3: Arrival = 2, Burst = 4</li>
//                   </ul>
//                   <p className="mt-2 text-slate-600">
//                     Notice how shorter jobs get prioritized over longer ones.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Round Robin */}
//         <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection("rr")}
//             className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
//           >
//             <h3 className="text-base sm:text-lg font-semibold text-slate-800">
//               Round Robin (RR)
//             </h3>
//             {expandedSections.rr ? (
//               <ChevronUp className="w-5 h-5 text-slate-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-slate-400" />
//             )}
//           </button>
//           {expandedSections.rr && (
//             <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
//               <p>
//                 Assigns a fixed time slice to each process in a cyclic manner.
//               </p>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">
//                   Key Characteristics:
//                 </p>
//                 <ul className="list-disc ml-5 space-y-1">
//                   <li>Preemptive scheduling</li>
//                   <li>Fair distribution of CPU time</li>
//                   <li>Good for time-sharing systems</li>
//                   <li>Performance depends on time quantum selection</li>
//                 </ul>
//               </div>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">Example Scenario:</p>
//                 <div className="bg-slate-50 p-4 rounded-lg">
//                   <p className="font-medium text-slate-700 mb-2">
//                     Try these values:
//                   </p>
//                   <ul className="space-y-2">
//                     <li>Time Quantum = 2</li>
//                     <li>Process 1: Arrival = 0, Burst = 5</li>
//                     <li>Process 2: Arrival = 0, Burst = 4</li>
//                     <li>Process 3: Arrival = 0, Burst = 3</li>
//                   </ul>
//                   <p className="mt-2 text-slate-600">
//                     Observe how processes take turns executing for the time
//                     quantum.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Priority */}
//         <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
//           <button
//             onClick={() => toggleSection("priority")}
//             className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
//           >
//             <h3 className="text-base sm:text-lg font-semibold text-slate-800">
//               Priority Scheduling (PS)
//             </h3>
//             {expandedSections.priority ? (
//               <ChevronUp className="w-5 h-5 text-slate-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-slate-400" />
//             )}
//           </button>
//           {expandedSections.priority && (
//             <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
//               <p>
//                 Executes processes based on their priority values, where lower
//                 numbers indicate higher priority.
//               </p>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">
//                   Key Characteristics:
//                 </p>
//                 <ul className="list-disc ml-5 space-y-1">
//                   <li>Non-preemptive scheduling</li>
//                   <li>Priority-based selection</li>
//                   <li>May cause starvation of low-priority processes</li>
//                   <li>Good for systems with varying process importance</li>
//                 </ul>
//               </div>
//               <div className="space-y-2">
//                 <p className="font-medium text-slate-700">Example Scenario:</p>
//                 <div className="bg-slate-50 p-4 rounded-lg">
//                   <p className="font-medium text-slate-700 mb-2">
//                     Try these values:
//                   </p>
//                   <ul className="space-y-2">
//                     <li>Process 1: Arrival = 0, Burst = 4, Priority = 3</li>
//                     <li>Process 2: Arrival = 1, Burst = 3, Priority = 1</li>
//                     <li>Process 3: Arrival = 2, Burst = 2, Priority = 2</li>
//                   </ul>
//                   <p className="mt-2 text-slate-600">
//                     Notice how processes with higher priority (lower numbers)
//                     get executed first.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Documentation;
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const Documentation = () => {
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    fcfs: false,
    sjf: false,
    strf: false, // Added STRF
    rr: false,
    priority: false,
    mlq: false, // Added MLQ
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="max-w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          CPU Scheduling Algorithms Documentation
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Welcome to the CPU Scheduling Simulator. This comprehensive tool helps
          you understand and visualize different CPU scheduling algorithms
          commonly used in operating systems. Each algorithm is explained with
          its principles, mathematical formulas, advantages, disadvantages, and
          practical examples.
        </p>
      </div>

      {/* Getting Started Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
          Getting Started
        </h2>
        <div className="space-y-3 text-sm sm:text-base text-slate-600">
          <p>To use any scheduling algorithm simulation:</p>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Select the desired algorithm from the sidebar</li>
            <li>Click "Add Process" to add processes to the queue</li>
            <li>
              For each process, specify:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>
                  <strong>Process ID:</strong> A unique identifier for the
                  process
                </li>
                <li>
                  <strong>Arrival Time (AT):</strong> When the process enters
                  the system (in time units)
                </li>
                <li>
                  <strong>Burst Time (BT):</strong> How long the process needs
                  to execute (in time units)
                </li>
                <li>
                  <strong>Priority</strong> (if applicable): Lower number means
                  higher priority
                </li>
                <li>
                  <strong>Queue Level</strong> (for MLQ): The queue priority
                  level (if applicable)
                </li>
              </ul>
            </li>
            <li>
              Configure algorithm-specific parameters (e.g., time quantum for
              Round Robin)
            </li>
            <li>Click "Calculate" to see the scheduling results</li>
            <li>Review the visualizations and performance metrics provided</li>
          </ol>
        </div>

        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-slate-800 mb-2">
            Key Performance Metrics
          </h3>
          <div className="space-y-2">
            <p>
              <strong>Waiting Time (WT):</strong> Time a process waits in the
              ready queue
            </p>
            <p className="ml-4 font-mono text-sm">
              WT = Turnaround Time - Burst Time
            </p>

            <p>
              <strong>Turnaround Time (TAT):</strong> Total time from submission
              to completion
            </p>
            <p className="ml-4 font-mono text-sm">
              TAT = Completion Time - Arrival Time
            </p>

            <p>
              <strong>Response Time (RT):</strong> Time from submission until
              first CPU response
            </p>
            <p className="ml-4 font-mono text-sm">
              RT = First CPU Time - Arrival Time
            </p>

            <p>
              <strong>Throughput:</strong> Number of processes completed per
              unit time
            </p>
            <p className="ml-4 font-mono text-sm">
              Throughput = Number of Processes / Total Time
            </p>

            <p>
              <strong>CPU Utilization:</strong> Percentage of time CPU is busy
            </p>
            <p className="ml-4 font-mono text-sm">
              CPU Utilization = (Total Burst Time / Completion Time) × 100%
            </p>
          </div>
        </div>
      </div>

      {/* Algorithms Section */}
      <div className="space-y-4">
        {/* FCFS */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("fcfs")}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              First Come First Serve (FCFS)
            </h3>
            {expandedSections.fcfs ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSections.fcfs && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
              <p>
                The simplest scheduling algorithm that processes tasks in the
                exact order they arrive in the ready queue, following the FIFO
                (First-In-First-Out) principle.
              </p>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Algorithm Explanation:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>
                    Processes are executed in the order they arrive in the ready
                    queue
                  </li>
                  <li>
                    Once a process gets the CPU, it keeps it until termination
                    or I/O block
                  </li>
                  <li>The ready queue is managed as a FIFO queue</li>
                  <li>
                    No preemption occurs - each process runs to completion once
                    started
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Mathematical Formulation:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <p>For n processes P₁, P₂, ..., Pₙ sorted by arrival time:</p>

                  <p>
                    <strong>Completion Time (CT):</strong>
                  </p>
                  <p className="ml-4 font-mono">CT₁ = AT₁ + BT₁</p>
                  <p className="ml-4 font-mono">
                    CTᵢ = max(ATᵢ, CT_ i - 1) + BTᵢ for i 1
                  </p>

                  <p>
                    <strong>Turnaround Time (TAT):</strong>
                  </p>
                  <p className="ml-4 font-mono">TATᵢ = CTᵢ - ATᵢ</p>

                  <p>
                    <strong>Waiting Time (WT):</strong>
                  </p>
                  <p className="ml-4 font-mono">WTᵢ = TATᵢ - BTᵢ</p>

                  <p>
                    <strong>Average Waiting Time:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Avg WT = (WT₁ + WT₂ + ... + WTₙ) / n
                  </p>

                  <p>
                    <strong>Average Turnaround Time:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Avg TAT = (TAT₁ + TAT₂ + ... + TATₙ) / n
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Key Characteristics:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Type:</strong> Non-preemptive scheduling
                  </li>
                  <li>
                    <strong>Selection Function:</strong> min(arrival_time)
                  </li>
                  <li>
                    <strong>Implementation:</strong> Easy to understand and
                    implement using a simple queue
                  </li>
                  <li>
                    <strong>Fairness:</strong> Fair in a first-come-first-served
                    manner
                  </li>
                  <li>
                    <strong>Convoy Effect:</strong> Short processes may wait
                    behind long processes, leading to poor average waiting time
                  </li>
                  <li>
                    <strong>Predictability:</strong> Process execution order is
                    predictable
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Advantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Simple to implement and understand</li>
                    <li>
                      No starvation as every process gets a chance to execute
                    </li>
                    <li>No overhead of context switching</li>
                    <li>Fair for processes that arrived first</li>
                    <li>Minimal bookkeeping required</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Disadvantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      Poor for processes with varying burst times (convoy
                      effect)
                    </li>
                    <li>Not suitable for interactive systems</li>
                    <li>High average waiting time for short processes</li>
                    <li>Low overall throughput</li>
                    <li>No priority consideration</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Detailed Example Scenario:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">
                    Consider these processes:
                  </p>
                  <table className="min-w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Process</th>
                        <th className="border border-slate-300 p-2">
                          Arrival Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Burst Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          5
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-3 font-medium">
                    Execution Order: P1 → P2 → P3
                  </p>

                  <p className="mt-3 font-medium">Timeline:</p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <div className="flex">
                      <div className="w-12 text-center border-r border-slate-300">
                        Time
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-10 text-center">0</div>
                        <div className="w-10 text-center">1</div>
                        <div className="w-10 text-center">2</div>
                        <div className="w-10 text-center">3</div>
                        <div className="w-10 text-center">4</div>
                        <div className="w-10 text-center">5</div>
                        <div className="w-10 text-center">6</div>
                        <div className="w-10 text-center">7</div>
                        <div className="w-10 text-center">8</div>
                        <div className="w-10 text-center">9</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 text-center border-r border-slate-300">
                        CPU
                      </div>
                      <div className="flex-1 flex h-8">
                        <div className="bg-blue-200 text-center py-1 flex-none w-50 border border-blue-300">
                          P1 (5 units)
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-30 border border-green-300">
                          P2 (3 units)
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-10 border border-red-300">
                          P3 (1)
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 font-medium">Calculations:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>P1: CT = 5, TAT = 5-0 = 5, WT = 5-5 = 0</li>
                    <li>P2: CT = 8, TAT = 8-1 = 7, WT = 7-3 = 4</li>
                    <li>P3: CT = 9, TAT = 9-2 = 7, WT = 7-1 = 6</li>
                  </ul>

                  <p className="mt-2 font-medium">Performance Metrics:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Average Waiting Time = (0+4+6)/3 = 3.33 units</li>
                    <li>Average Turnaround Time = (5+7+7)/3 = 6.33 units</li>
                    <li>Throughput = 3/9 = 0.33 processes per time unit</li>
                  </ul>

                  <p className="mt-3 text-slate-600 italic">
                    Notice how the short process P3 must wait for the longer
                    processes P1 and P2 to complete, even though it requires
                    only 1 time unit to execute. This illustrates the convoy
                    effect, a significant disadvantage of FCFS.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Real-world Applications:
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-2">
                  <li>
                    Batch processing systems where execution order is less
                    important than completion guarantee
                  </li>
                  <li>Print job queuing systems</li>
                  <li>
                    Simple embedded systems with predictable task patterns
                  </li>
                  <li>
                    Background task processing where fairness is more important
                    than response time
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* SJF */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("sjf")}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Shortest Job First (SJF)
            </h3>
            {expandedSections.sjf ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSections.sjf && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
              <p>
                SJF is a scheduling policy that selects the waiting process with
                the smallest execution time to execute next. SJF is optimal in
                that it gives the minimum average waiting time for a given set
                of processes.
              </p>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Algorithm Explanation:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>
                    When CPU becomes available, select the process with the
                    smallest burst time
                  </li>
                  <li>
                    If multiple processes have the same burst time, break tie
                    with FCFS
                  </li>
                  <li>
                    Once a process gets CPU, it runs to completion
                    (non-preemptive)
                  </li>
                  <li>
                    New arriving processes with shorter burst times must wait
                    until current process completes
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Mathematical Formulation:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <p>
                    For n processes P₁, P₂, ..., Pₙ with burst times BT₁, BT₂,
                    ..., BTₙ:
                  </p>

                  <p>
                    <strong>Selection Function:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Select Pᵢ where BTᵢ = min(BT₁, BT₂, ..., BTₙ) among
                    available processes
                  </p>

                  <p>
                    <strong>Completion Time (CT):</strong>
                  </p>
                  <p className="ml-4 font-mono">CT for 1st process = AT + BT</p>
                  <p className="ml-4 font-mono">
                    CT for subsequent processes = max(current_time, AT) + BT
                  </p>

                  <p>
                    <strong>Turnaround Time (TAT):</strong>
                  </p>
                  <p className="ml-4 font-mono">TATᵢ = CTᵢ - ATᵢ</p>

                  <p>
                    <strong>Waiting Time (WT):</strong>
                  </p>
                  <p className="ml-4 font-mono">WTᵢ = TATᵢ - BTᵢ</p>

                  <p>
                    <strong>Average Waiting Time:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Avg WT = (WT₁ + WT₂ + ... + WTₙ) / n
                  </p>

                  <p>
                    <strong>Average Turnaround Time:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Avg TAT = (TAT₁ + TAT₂ + ... + TATₙ) / n
                  </p>

                  <p>
                    <strong>Optimality Proof:</strong>
                  </p>
                  <p className="ml-4">
                    SJF minimizes average waiting time. If jobs with shorter
                    burst times are executed first, they will have shorter
                    waiting times, reducing the overall average.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Key Characteristics:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Type:</strong> Non-preemptive scheduling
                  </li>
                  <li>
                    <strong>Selection Function:</strong> min(burst_time) among
                    available processes
                  </li>
                  <li>
                    <strong>Implementation:</strong> Requires priority queue
                    based on burst time
                  </li>
                  <li>
                    <strong>Optimality:</strong> Gives minimum average waiting
                    time for a given set of processes
                  </li>
                  <li>
                    <strong>Predictability:</strong> Requires knowing burst
                    times in advance, which is often difficult in practice
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Advantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Optimal average waiting time</li>
                    <li>
                      Maximizes throughput by completing more processes in less
                      time
                    </li>
                    <li>Reduces average turnaround time</li>
                    <li>Better response time for short processes</li>
                    <li>Improves system efficiency</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Disadvantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      May cause starvation of longer processes if short
                      processes keep arriving
                    </li>
                    <li>
                      Requires knowing burst times in advance, which is often
                      impossible
                    </li>
                    <li>
                      Cannot be implemented practically in interactive systems
                    </li>
                    <li>No consideration of process priority or importance</li>
                    <li>Long processes might never execute in busy systems</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Detailed Example Scenario:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">
                    Consider these processes:
                  </p>
                  <table className="min-w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Process</th>
                        <th className="border border-slate-300 p-2">
                          Arrival Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Burst Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          6
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P4
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-3 font-medium">Analysis Steps:</p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>
                      At t=0: Only P1 is available, so P1 starts execution.
                    </li>
                    <li>
                      At t=6: P1 completes. P2, P3, and P4 are available. P4 has
                      the shortest burst time (1), so P4 executes next.
                    </li>
                    <li>
                      At t=7: P4 completes. P2 and P3 are available. P2 has the
                      shorter burst time (2), so P2 executes next.
                    </li>
                    <li>
                      At t=9: P2 completes. Only P3 remains, so P3 executes.
                    </li>
                    <li>At t=13: P3 completes and all processes are done.</li>
                  </ol>

                  <p className="mt-3 font-medium">
                    Execution Order: P1 → P4 → P2 → P3
                  </p>

                  <p className="mt-3 font-medium">Timeline:</p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <div className="flex">
                      <div className="w-12 text-center border-r border-slate-300">
                        Time
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-10 text-center">0</div>
                        <div className="w-10 text-center">2</div>
                        <div className="w-10 text-center">4</div>
                        <div className="w-10 text-center">6</div>
                        <div className="w-10 text-center">7</div>
                        <div className="w-10 text-center">9</div>
                        <div className="w-10 text-center">11</div>
                        <div className="w-10 text-center">13</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 text-center border-r border-slate-300">
                        CPU
                      </div>
                      <div className="flex-1 flex h-8">
                        <div className="bg-blue-200 text-center py-1 flex-none w-60 border border-blue-300">
                          P1 (6 units)
                        </div>
                        <div className="bg-yellow-200 text-center py-1 flex-none w-10 border border-yellow-300">
                          P4 (1)
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-20 border border-green-300">
                          P2 (2)
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-40 border border-red-300">
                          P3 (4 units)
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 font-medium">Calculations:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>P1: CT = 6, TAT = 6-0 = 6, WT = 6-6 = 0</li>
                    <li>P2: CT = 9, TAT = 9-1 = 8, WT = 8-2 = 6</li>
                    <li>P3: CT = 13, TAT = 13-2 = 11, WT = 11-4 = 7</li>
                    <li>P4: CT = 7, TAT = 7-3 = 4, WT = 4-1 = 3</li>
                  </ul>

                  <p className="mt-2 font-medium">Performance Metrics:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Average Waiting Time = (0+6+7+3)/4 = 4 units</li>
                    <li>Average Turnaround Time = (6+8+11+4)/4 = 7.25 units</li>
                    <li>Throughput = 4/13 ≈ 0.31 processes per time unit</li>
                  </ul>

                  <p className="mt-3 text-slate-600 italic">
                    Notice how the shortest processes (P4 and P2) are executed
                    as soon as possible after they arrive, even though process
                    P3 arrived earlier than P4. This prioritization of shorter
                    processes leads to better overall average waiting time
                    compared to FCFS.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Real-world Applications:
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-2">
                  <li>
                    Batch processing systems where job burst times are known in
                    advance
                  </li>
                  <li>
                    Web servers processing small requests first to improve
                    responsiveness
                  </li>
                  <li>
                    Database query optimization where transaction times can be
                    estimated
                  </li>
                  <li>
                    Background task scheduling when task durations are
                    predictable
                  </li>
                </ul>

                <p className="mt-3 text-slate-700">
                  <strong>Prediction Techniques:</strong> Since exact burst
                  times are often unknown, various prediction methods are used
                  in practice:
                </p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>
                    Exponential averaging: τₙ₊₁ = α × tₙ + (1-α) × τₙ, where τ
                    is predicted time and t is actual time
                  </li>
                  <li>
                    History-based prediction using previous execution patterns
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* STRF */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("strf")}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Shortest Time Remaining First (STRF)
            </h3>
            {expandedSections.strf ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSections.strf && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
              <p>
                Also known as Shortest Remaining Time First (SRTF) or Preemptive
                Shortest Job First (PSJF), this algorithm is the preemptive
                version of SJF. It preempts the currently running process
                whenever a new process arrives with a shorter remaining burst
                time.
              </p>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Algorithm Explanation:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>
                    At any time, the process with the shortest remaining time is
                    executed
                  </li>
                  <li>
                    When a new process arrives, compare its burst time with the
                    remaining time of the current process
                  </li>
                  <li>
                    If the new process has a shorter burst time, preempt the
                    current process and schedule the new one
                  </li>
                  <li>
                    The preempted process is placed back in the ready queue
                    based on its remaining time
                  </li>
                  <li>This continues until all processes complete</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Mathematical Formulation:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <p>For n processes P₁, P₂, ..., Pₙ :</p>

                  <p>
                    <strong>Selection Function at time t:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Select Pᵢ where remaining time of Pᵢ = min(RT₁, RT₂, ...,
                    RTₙ) among available processes
                  </p>

                  <p>
                    <strong>Preemption Condition:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Preempt current process if a new process arrives with burst
                    time remaining time of current process
                  </p>

                  <p>
                    <strong>Remaining Time (RT):</strong>
                  </p>
                  <p className="ml-4 font-mono">RTᵢ at t=0 = BTᵢ</p>
                  <p className="ml-4 font-mono">
                    RTᵢ after t time units of execution = BTᵢ - t
                  </p>

                  <p>
                    <strong>Response Time:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Response Time = First CPU time - Arrival Time
                  </p>

                  <p>
                    <strong>Waiting Time (WT):</strong>
                  </p>
                  <p className="ml-4 font-mono">WTᵢ = TATᵢ - BTᵢ</p>

                  <p>
                    <strong>Turnaround Time (TAT):</strong>
                  </p>
                  <p className="ml-4 font-mono">TATᵢ = CTᵢ - ATᵢ</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Key Characteristics:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Type:</strong> Preemptive scheduling
                  </li>
                  <li>
                    <strong>Selection Function:</strong> min(remaining_time)
                    among available processes
                  </li>
                  <li>
                    <strong>Implementation:</strong> Requires a priority queue
                    based on remaining time
                  </li>
                  <li>
                    <strong>Optimality:</strong> Gives minimum average waiting
                    time among all scheduling algorithms
                  </li>
                  <li>
                    <strong>Context Switching:</strong> May cause multiple
                    context switches, adding overhead
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Advantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Optimal average waiting time (theoretically proven)</li>
                    <li>Better response time for short processes</li>
                    <li>More responsive in interactive environments</li>
                    <li>Adapts to new arrivals dynamically</li>
                    <li>
                      More efficient for systems with varied process lengths
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Disadvantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Higher overhead due to frequent context switching</li>
                    <li>Requires runtime estimation and monitoring</li>
                    <li>Potential starvation of longer processes</li>
                    <li>Increased complexity in implementation</li>
                    <li>Unpredictable process execution patterns</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Detailed Example Scenario:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">
                    Consider these processes:
                  </p>
                  <table className="min-w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Process</th>
                        <th className="border border-slate-300 p-2">
                          Arrival Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Burst Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          8
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          9
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P4
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          5
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-3 font-medium">Step-by-step Execution:</p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>
                      At t=0: Only P1 is available with RT=8, so P1 starts
                      execution.
                    </li>
                    <li>
                      At t=1: P2 arrives with BT=4, which is less than P1's
                      RT=7. Preempt P1 and start P2.
                    </li>
                    <li>
                      At t=2: P3 arrives with BT=9, but P2's RT=3 is less.
                      Continue with P2.
                    </li>
                    <li>
                      At t=3: P4 arrives with BT=5, but P2's RT=2 is less.
                      Continue with P2.
                    </li>
                    <li>
                      At t=5: P2 completes. Among P1(RT=7), P3(RT=9), P4(RT=5),
                      P4 has shortest RT. Execute P4.
                    </li>
                    <li>
                      At t=10: P4 completes. Between P1(RT=7) and P3(RT=9), P1
                      has shorter RT. Execute P1.
                    </li>
                    <li>
                      At t=17: P1 completes. Only P3 remains with RT=9. Execute
                      P3.
                    </li>
                    <li>At t=26: P3 completes and all processes are done.</li>
                  </ol>

                  <p className="mt-3 font-medium">Timeline with Preemptions:</p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <div className="flex">
                      <div className="w-12 text-center border-r border-slate-300">
                        Time
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-10 text-center">0</div>
                        <div className="w-10 text-center">1</div>
                        <div className="w-10 text-center">5</div>
                        <div className="w-10 text-center">10</div>
                        <div className="w-10 text-center">17</div>
                        <div className="w-10 text-center">26</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 text-center border-r border-slate-300">
                        CPU
                      </div>
                      <div className="flex-1 flex h-8">
                        <div className="bg-blue-200 text-center py-1 flex-none w-10 border border-blue-300">
                          P1
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-40 border border-green-300">
                          P2 (4 units)
                        </div>
                        <div className="bg-yellow-200 text-center py-1 flex-none w-50 border border-yellow-300">
                          P4 (5 units)
                        </div>
                        <div className="bg-blue-200 text-center py-1 flex-none w-70 border border-blue-300">
                          P1 (7 units)
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-90 border border-red-300">
                          P3 (9 units)
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 font-medium">Calculations:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>
                      P1: CT = 17, TAT = 17-0 = 17, WT = 17-8 = 9 (P1 waited
                      during t=1-5 and t=5-10)
                    </li>
                    <li>
                      P2: CT = 5, TAT = 5-1 = 4, WT = 4-4 = 0 (P2 didn't wait
                      once it arrived)
                    </li>
                    <li>
                      P3: CT = 26, TAT = 26-2 = 24, WT = 24-9 = 15 (P3 waited
                      from t=2 to t=17)
                    </li>
                    <li>
                      P4: CT = 10, TAT = 10-3 = 7, WT = 7-5 = 2 (P4 waited from
                      t=3 to t=5)
                    </li>
                  </ul>

                  <p className="mt-2 font-medium">Performance Metrics:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Average Waiting Time = (9+0+15+2)/4 = 6.5 units</li>
                    <li>Average Turnaround Time = (17+4+24+7)/4 = 13 units</li>
                    <li>Throughput = 4/26 ≈ 0.15 processes per time unit</li>
                  </ul>

                  <p className="mt-3 text-slate-600 italic">
                    Notice how P1 was preempted when P2 arrived since P2 had a
                    shorter burst time. This preemption allows short processes
                    like P2 and P4 to complete much earlier, reducing their
                    waiting time and improving overall system responsiveness.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Real-world Applications:
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-2">
                  <li>Interactive systems where responsiveness is critical</li>
                  <li>
                    Real-time operating systems that need to accommodate urgent
                    short tasks
                  </li>
                  <li>
                    Web servers handling concurrent requests with varying
                    processing times
                  </li>
                  <li>
                    Mobile operating systems that need to keep UI responsive
                    while background tasks run
                  </li>
                </ul>

                <p className="mt-3 text-slate-700">
                  <strong>Implementation Note:</strong> Since exact remaining
                  time is difficult to predict, practical implementations often
                  use heuristics or history-based approaches to estimate
                  remaining time dynamically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Round Robin */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("rr")}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Round Robin (RR)
            </h3>
            {expandedSections.rr ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSections.rr && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
              <p>
                Round Robin is a preemptive scheduling algorithm specifically
                designed for time-sharing systems. It assigns a fixed time unit
                (called time quantum or time slice) to each process in a cyclic
                manner, ensuring fair CPU distribution.
              </p>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Algorithm Explanation:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>A fixed time quantum (q) is defined for the system</li>
                  <li>Processes are stored in a FIFO queue</li>
                  <li>
                    Each process gets CPU time for at most one time quantum
                  </li>
                  <li>
                    If a process's remaining burst time exceeds the time
                    quantum, it's preempted and added to the end of the ready
                    queue
                  </li>
                  <li>
                    If a process completes within the time quantum, the CPU is
                    assigned to the next process in the queue
                  </li>
                  <li>This cycle continues until all processes complete</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Mathematical Formulation:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <p>
                    For n processes P₁, P₂, ..., Pₙ with burst times BT₁, BT₂,
                    ..., BTₙ and time quantum q:
                  </p>

                  <p>
                    <strong>Number of Context Switches:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Total CS = Σ(⌈BTᵢ/q⌉) - n (where ⌈x⌉ is the ceiling
                    function)
                  </p>

                  <p>
                    <strong>
                      Cycle Time (time until a process gets CPU again):
                    </strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Cycle Time ≈ n × q (for n ready processes)
                  </p>

                  <p>
                    <strong>Waiting Time (WT):</strong>
                  </p>
                  <p className="ml-4 font-mono">WTᵢ = TATᵢ - BTᵢ</p>

                  <p>
                    <strong>Turnaround Time (TAT):</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Calculated based on when each process completes in the RR
                    cycle
                  </p>

                  <p>
                    <strong>Optimal Time Quantum:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    q_opt ≈ 1.25 × Avg Service Time (empirical)
                  </p>

                  <p>
                    <strong>Response Time:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    RTᵢ = First CPU time - ATᵢ (typically ≤ n × q)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Key Characteristics:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Type:</strong> Preemptive scheduling
                  </li>
                  <li>
                    <strong>Selection Function:</strong> FIFO with time slicing
                  </li>
                  <li>
                    <strong>Fairness:</strong> Equal CPU time distribution when
                    processes have equal priority
                  </li>
                  <li>
                    <strong>Time Quantum Impact:</strong> Performance heavily
                    depends on time quantum selection
                  </li>
                  <li>
                    <strong>Context Switching:</strong> Higher overhead due to
                    frequent context switches
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Advantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Fair CPU allocation among all processes</li>
                    <li>Lower response time for interactive processes</li>
                    <li>No starvation as each process gets its turn</li>
                    <li>Good for time-sharing environments</li>
                    <li>Predictable scheduling patterns</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Disadvantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Higher overhead from frequent context switching</li>
                    <li>
                      Performance highly dependent on time quantum selection
                    </li>
                    <li>Low average turnaround time for CPU-bound processes</li>
                    <li>Doesn't consider process priority or urgency</li>
                    <li>Suboptimal for processes with varying burst times</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Time Quantum Selection Considerations:
                </p>
                <div className="mt-2 space-y-2">
                  <p>
                    <strong>Small Time Quantum:</strong>
                  </p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Improves response time</li>
                    <li>Increases context switching overhead</li>
                    <li>Approaches processor sharing as q approaches 0</li>
                  </ul>

                  <p>
                    <strong>Large Time Quantum:</strong>
                  </p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Reduces context switching overhead</li>
                    <li>May increase response time</li>
                    <li>Approaches FCFS as q approaches ∞</li>
                  </ul>

                  <p className="mt-2 text-slate-600">
                    <strong>Rule of Thumb:</strong> A time quantum should be
                    slightly larger than the time required for a typical
                    interaction (e.g., 80% of processes should complete within
                    the time quantum).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Detailed Example Scenario:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">
                    Consider these processes with time quantum q = 2:
                  </p>
                  <table className="min-w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Process</th>
                        <th className="border border-slate-300 p-2">
                          Arrival Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Burst Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          5
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-3 font-medium">
                    Step-by-step Execution (q = 2):
                  </p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>At t=0: P1 executes for 2 time units (RT = 5-2 = 3)</li>
                    <li>At t=2: P2 executes for 2 time units (RT = 4-2 = 2)</li>
                    <li>At t=4: P3 executes for 2 time units (RT = 3-2 = 1)</li>
                    <li>At t=6: P1 executes for 2 time units (RT = 3-2 = 1)</li>
                    <li>
                      At t=8: P2 executes for 2 time units (RT = 2-2 = 0, P2
                      completes)
                    </li>
                    <li>
                      At t=10: P3 executes for 1 time unit (RT = 1-1 = 0, P3
                      completes)
                    </li>
                    <li>
                      At t=11: P1 executes for 1 time unit (RT = 1-1 = 0, P1
                      completes)
                    </li>
                  </ol>

                  <p className="mt-3 font-medium">Timeline with Time Quanta:</p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <div className="flex">
                      <div className="w-12 text-center border-r border-slate-300">
                        Time
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-10 text-center">0</div>
                        <div className="w-10 text-center">2</div>
                        <div className="w-10 text-center">4</div>
                        <div className="w-10 text-center">6</div>
                        <div className="w-10 text-center">8</div>
                        <div className="w-10 text-center">10</div>
                        <div className="w-10 text-center">11</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 text-center border-r border-slate-300">
                        CPU
                      </div>
                      <div className="flex-1 flex h-8">
                        <div className="bg-blue-200 text-center py-1 flex-none w-20 border border-blue-300">
                          P1
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-20 border border-green-300">
                          P2
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-20 border border-red-300">
                          P3
                        </div>
                        <div className="bg-blue-200 text-center py-1 flex-none w-20 border border-blue-300">
                          P1
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-20 border border-green-300">
                          P2
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-10 border border-red-300">
                          P3
                        </div>
                        <div className="bg-blue-200 text-center py-1 flex-none w-10 border border-blue-300">
                          P1
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 font-medium">Calculations:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>P1: CT = 11, TAT = 11-0 = 11, WT = 11-5 = 6</li>
                    <li>P2: CT = 8, TAT = 8-0 = 8, WT = 8-4 = 4</li>
                    <li>P3: CT = 10, TAT = 10-0 = 10, WT = 10-3 = 7</li>
                  </ul>

                  <p className="mt-2 font-medium">Performance Metrics:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Average Waiting Time = (6+4+7)/3 = 5.67 units</li>
                    <li>Average Turnaround Time = (11+8+10)/3 = 9.67 units</li>
                    <li>Throughput = 3/11 ≈ 0.27 processes per time unit</li>
                    <li>
                      Context Switches = 6 (count of transitions between
                      processes)
                    </li>
                  </ul>

                  <p className="mt-3 text-slate-600 italic">
                    Notice how each process gets a fair share of CPU time in a
                    cyclic manner. The time quantum of 2 ensures that no process
                    monopolizes the CPU for too long, providing good
                    responsiveness but requiring multiple context switches.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Real-world Applications:
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-2">
                  <li>Interactive operating systems (Unix, Linux, Windows)</li>
                  <li>Multitasking environments where fairness is important</li>
                  <li>
                    Client-server systems handling multiple client requests
                  </li>
                  <li>Shared computing environments (cloud computing)</li>
                </ul>

                <p className="mt-3 text-slate-700">
                  <strong>Variants of Round Robin:</strong>
                </p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>
                    <strong>Weighted Round Robin:</strong> Different time quanta
                    for different processes based on priority
                  </li>
                  <li>
                    <strong>Selfish Round Robin:</strong> Processes with less
                    remaining time get higher priority
                  </li>
                  <li>
                    <strong>Virtual Round Robin:</strong> Special handling for
                    I/O-bound processes
                  </li>
                  <li>
                    <strong>Dynamic Quantum Round Robin:</strong> Time quantum
                    adjusts based on system load
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Priority Scheduling */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("priority")}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Priority Scheduling (PS)
            </h3>
            {expandedSections.priority ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSections.priority && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
              <p>
                Priority Scheduling assigns processes to the CPU based on their
                priority values. Each process is assigned a priority, and the
                CPU is allocated to the process with the highest priority
                (usually indicated by the lowest priority number).
              </p>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Algorithm Explanation:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>
                    Each process is assigned a priority value (external or
                    internal)
                  </li>
                  <li>Ready queue is organized based on process priorities</li>
                  <li>
                    CPU is allocated to the highest-priority process from the
                    ready queue
                  </li>
                  <li>Equal-priority processes are scheduled in FCFS order</li>
                  <li>Both preemptive and non-preemptive variants exist</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Mathematical Formulation:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <p>
                    For n processes P₁, P₂, ..., Pₙ with priorities PR₁, PR₂,
                    ..., PRₙ:
                  </p>

                  <p>
                    <strong>Selection Function:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Select Pᵢ where PRᵢ = max(PR₁, PR₂, ..., PRₙ) among
                    available processes
                  </p>
                  <p className="ml-4 font-mono">
                    (Assuming lower numbers indicate higher priority)
                  </p>

                  <p>
                    <strong>Non-preemptive Priority Scheduling:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    Once selected, a process runs to completion
                  </p>

                  <p>
                    <strong>Preemptive Priority Scheduling:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    If a new process arrives with higher priority, current
                    process is preempted
                  </p>

                  <p>
                    <strong>Dynamic Priority Adjustment:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    PR(t+1) = PR(t) + aging_factor
                  </p>
                  <p className="ml-4 font-mono">
                    or PR(t+1) = PR(t) × aging_coefficient
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Priority Assignment Methods:
                </p>
                <div className="bg-slate-100 p-4 rounded-lg">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Static Priorities:</strong> Fixed at process
                      creation time
                    </li>
                    <li>
                      <strong>Dynamic Priorities:</strong> Change during
                      execution
                    </li>
                    <li>
                      <strong>Internal Priorities:</strong> Based on measurable
                      quantities like memory requirements, number of open files,
                      or ratio of I/O to CPU time
                    </li>
                    <li>
                      <strong>External Priorities:</strong> Based on external
                      criteria like process importance, type of service,
                      department, payment, etc.
                    </li>
                    <li>
                      <strong>Calculated Priorities:</strong> PR = 1 +
                      (waiting_time / estimated_execution_time)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Key Characteristics:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Type:</strong> Can be either preemptive or
                    non-preemptive
                  </li>
                  <li>
                    <strong>Selection Function:</strong> min(priority_number) or
                    max(priority_value)
                  </li>
                  <li>
                    <strong>Starvation:</strong> Low-priority processes may face
                    indefinite blocking
                  </li>
                  <li>
                    <strong>Aging:</strong> Technique to gradually increase the
                    priority of waiting processes
                  </li>
                  <li>
                    <strong>Implementation:</strong> Requires a priority queue
                    data structure
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Advantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      Accommodates different importance levels of processes
                    </li>
                    <li>Enables system responsiveness to critical tasks</li>
                    <li>
                      Flexible scheduling based on process characteristics
                    </li>
                    <li>Can be tailored to specific system requirements</li>
                    <li>Allows for deadline-sensitive scheduling</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Disadvantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Potential starvation of low-priority processes</li>
                    <li>Aging mechanisms add implementation complexity</li>
                    <li>
                      Determining appropriate priorities can be challenging
                    </li>
                    <li>Priority inversion issues in resource allocation</li>
                    <li>May not optimize overall system throughput</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Priority Inversion Problem:
                </p>
                <p className="mt-1">
                  A situation where a high-priority process indirectly waits for
                  a low-priority process to release a resource, because a
                  medium-priority process is running instead of the low-priority
                  process.
                </p>

                <p className="mt-2 font-medium">Solutions:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>
                    <strong>Priority Inheritance:</strong> Low-priority process
                    temporarily inherits the priority of the high-priority
                    process waiting for it
                  </li>
                  <li>
                    <strong>Priority Ceiling Protocol:</strong> Raises the
                    priority of a resource-holding process to the highest
                    priority of any process that may need that resource
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Detailed Example Scenario:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">
                    Consider these processes with non-preemptive priority
                    scheduling (lower number = higher priority):
                  </p>
                  <table className="min-w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Process</th>
                        <th className="border border-slate-300 p-2">
                          Arrival Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Burst Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P4
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          5
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-3 font-medium">
                    Step-by-step Execution (Non-preemptive):
                  </p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>
                      At t=0: Only P1 is available, so P1 starts execution.
                    </li>
                    <li>
                      At t=1: P2 arrives with higher priority (1), but P1
                      continues as this is non-preemptive.
                    </li>
                    <li>At t=2: P3 arrives but doesn't preempt P1.</li>
                    <li>At t=3: P4 arrives but doesn't preempt P1.</li>
                    <li>
                      At t=4: P1 completes. Among P2(PR=1), P3(PR=2), P4(PR=4),
                      P2 has highest priority. Execute P2.
                    </li>
                    <li>
                      At t=7: P2 completes. Between P3(PR=2) and P4(PR=4), P3
                      has higher priority. Execute P3.
                    </li>
                    <li>
                      At t=9: P3 completes. Only P4 remains, so execute P4.
                    </li>
                    <li>At t=14: P4 completes and all processes are done.</li>
                  </ol>

                  <p className="mt-3 font-medium">
                    Execution Order: P1 → P2 → P3 → P4
                  </p>

                  <p className="mt-3 font-medium">Timeline:</p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <div className="flex">
                      <div className="w-12 text-center border-r border-slate-300">
                        Time
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-10 text-center">0</div>
                        <div className="w-10 text-center">4</div>
                        <div className="w-10 text-center">7</div>
                        <div className="w-10 text-center">9</div>
                        <div className="w-10 text-center">14</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 text-center border-r border-slate-300">
                        CPU
                      </div>
                      <div className="flex-1 flex h-8">
                        <div className="bg-blue-200 text-center py-1 flex-none w-40 border border-blue-300">
                          P1 (PR=3)
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-30 border border-green-300">
                          P2 (PR=1)
                        </div>
                        <div className="bg-yellow-200 text-center py-1 flex-none w-20 border border-yellow-300">
                          P3 (PR=2)
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-50 border border-red-300">
                          P4 (PR=4)
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 font-medium">Calculations:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>P1: CT = 4, TAT = 4-0 = 4, WT = 4-4 = 0</li>
                    <li>P2: CT = 7, TAT = 7-1 = 6, WT = 6-3 = 3</li>
                    <li>P3: CT = 9, TAT = 9-2 = 7, WT = 7-2 = 5</li>
                    <li>P4: CT = 14, TAT = 14-3 = 11, WT = 11-5 = 6</li>
                  </ul>

                  <p className="mt-2 font-medium">Performance Metrics:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Average Waiting Time = (0+3+5+6)/4 = 3.5 units</li>
                    <li>Average Turnaround Time = (4+6+7+11)/4 = 7 units</li>
                    <li>Throughput = 4/14 ≈ 0.29 processes per time unit</li>
                  </ul>

                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium">Preemptive Priority Example:</p>
                    <p className="mt-1">
                      If this were preemptive priority scheduling:
                    </p>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      <li>At t=1: P2(PR=1) would preempt P1(PR=3)</li>
                      <li>Execution order would be: P1 → P2 → P3 → P1 → P4</li>
                      <li>Average waiting time would decrease to 3.25 units</li>
                    </ul>
                  </div>

                  <p className="mt-3 text-slate-600 italic">
                    Notice how processes are executed based on their priority
                    rather than arrival time or burst time. In the
                    non-preemptive variant, P1 isn't interrupted even when
                    higher priority processes arrive, while in the preemptive
                    variant, higher priority processes would immediately take
                    over the CPU.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Real-world Applications:
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-2">
                  <li>
                    Real-time systems where some processes have strict deadlines
                  </li>
                  <li>
                    Operating systems that need to prioritize system tasks over
                    user tasks
                  </li>
                  <li>
                    Multi-user systems with different user privilege levels
                  </li>
                  <li>
                    Military and defense systems with mission-critical
                    operations
                  </li>
                  <li>
                    Industrial control systems with safety-critical components
                  </li>
                </ul>

                <p className="mt-3 text-slate-700">
                  <strong>Variants of Priority Scheduling:</strong>
                </p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>
                    <strong>Static Priority:</strong> Priorities are fixed
                    throughout execution
                  </li>
                  <li>
                    <strong>Dynamic Priority:</strong> Priorities change during
                    execution based on behavior
                  </li>
                  <li>
                    <strong>Priority + Round Robin:</strong> Equal-priority
                    processes are scheduled using RR
                  </li>
                  <li>
                    <strong>Hybrid Priority:</strong> Combines priority with
                    other scheduling criteria
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* MLQ */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleSection("mlq")}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Multi-Level Queue (MLQ)
            </h3>
            {expandedSections.mlq ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {expandedSections.mlq && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 text-sm sm:text-base text-slate-600 border-t border-slate-200">
              <p>
                Multi-Level Queue (MLQ) scheduling partitions the ready queue
                into several separate queues, each with its own scheduling
                algorithm. Processes are permanently assigned to one queue based
                on properties like process type, priority, memory size, etc.
                Each queue has absolute priority over lower-priority queues.
              </p>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Algorithm Explanation:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>
                    Ready queue is divided into multiple separate queues based
                    on process characteristics
                  </li>
                  <li>
                    Each queue has its own scheduling algorithm (e.g., FCFS,
                    SJF, RR)
                  </li>
                  <li>
                    Processes are permanently assigned to a specific queue
                  </li>
                  <li>Scheduling between queues is typically priority-based</li>
                  <li>
                    CPU is first allocated to the process at the head of the
                    highest-priority queue
                  </li>
                  <li>
                    Lower-priority queues are serviced only when higher-priority
                    queues are empty
                  </li>
                </ol>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg mt-2">
                <p className="font-medium text-slate-700">
                  Common Queue Structure:
                </p>
                <div className="flex flex-col space-y-2 mt-2">
                  <div className="border border-slate-300 p-2 bg-red-100">
                    <p className="font-medium">Foreground (Real-time) Queue</p>
                    <p className="text-sm mt-1">
                      Highest Priority | Round Robin (small time quantum)
                    </p>
                  </div>
                  <div className="border border-slate-300 p-2 bg-yellow-100">
                    <p className="font-medium">Interactive Processes Queue</p>
                    <p className="text-sm mt-1">
                      Medium Priority | Round Robin (medium time quantum)
                    </p>
                  </div>
                  <div className="border border-slate-300 p-2 bg-green-100">
                    <p className="font-medium">Batch Processes Queue</p>
                    <p className="text-sm mt-1">
                      Low Priority | First Come First Serve
                    </p>
                  </div>
                  <div className="border border-slate-300 p-2 bg-blue-100">
                    <p className="font-medium">
                      Student/Background Processes Queue
                    </p>
                    <p className="text-sm mt-1">
                      Lowest Priority | First Come First Serve
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Queue Scheduling Approaches:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <p>
                    <strong>Fixed Priority Scheduling:</strong>
                  </p>
                  <p className="ml-4">
                    Lower queues only served when all higher queues are empty
                  </p>
                  <p className="ml-4 font-mono">
                    if (queue[i] != empty) select process from queue[i]
                  </p>
                  <p className="ml-4 font-mono">
                    else select process from queue[i+1]
                  </p>

                  <p>
                    <strong>Time Slice Allocation:</strong>
                  </p>
                  <p className="ml-4">
                    Each queue gets a certain portion of CPU time
                  </p>
                  <p className="ml-4 font-mono">80% - System Processes</p>
                  <p className="ml-4 font-mono">15% - Interactive Processes</p>
                  <p className="ml-4 font-mono">5% - Batch Processes</p>

                  <p>
                    <strong>Mathematical Model for Time Allocation:</strong>
                  </p>
                  <p className="ml-4 font-mono">
                    T_i = (P_i / ∑P) × Total_Time
                  </p>
                  <p className="ml-4 font-mono">
                    Where P_i is the priority weight of queue i
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Key Characteristics:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Structure:</strong> Multiple independent queues with
                    different scheduling algorithms
                  </li>
                  <li>
                    <strong>Assignment:</strong> Processes permanently assigned
                    to one queue
                  </li>
                  <li>
                    <strong>Inter-queue Scheduling:</strong> Usually fixed
                    priority-based
                  </li>
                  <li>
                    <strong>Intra-queue Scheduling:</strong> Different
                    algorithms for different queues
                  </li>
                  <li>
                    <strong>Queue Transitions:</strong> Processes do not move
                    between queues
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Advantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      Tailored scheduling for different types of processes
                    </li>
                    <li>Reduced scheduling overhead (simpler decisions)</li>
                    <li>Prioritization of critical system processes</li>
                    <li>Better response time for high-priority applications</li>
                    <li>Predictable behavior for different process classes</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Disadvantages:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Potential starvation of low-priority queues</li>
                    <li>Inflexible once processes are assigned to a queue</li>
                    <li>No adaptation to changing process behavior</li>
                    <li>Complex parameter tuning for optimal performance</li>
                    <li>Scheduling overhead between queues</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">
                  Detailed Example Scenario:
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">
                    Consider a system with 3 queues:
                  </p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>
                      <strong>System Queue (Q1):</strong> Highest priority,
                      Round Robin with quantum = 2
                    </li>
                    <li>
                      <strong>Interactive Queue (Q2):</strong> Medium priority,
                      Round Robin with quantum = 4
                    </li>
                    <li>
                      <strong>Batch Queue (Q3):</strong> Lowest priority, FCFS
                    </li>
                  </ol>

                  <p className="mt-3 font-medium">Process Assignment:</p>
                  <table className="min-w-full border-collapse border border-slate-300 mt-2">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2">Process</th>
                        <th className="border border-slate-300 p-2">Queue</th>
                        <th className="border border-slate-300 p-2">
                          Arrival Time
                        </th>
                        <th className="border border-slate-300 p-2">
                          Burst Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          Q1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          0
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          Q3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          6
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          Q2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          5
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P4
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          Q1
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          2
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">
                          P5
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          Q2
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          4
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          3
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-3 font-medium">Step-by-step Execution:</p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>At t=0: P1 (Q1) starts execution for quantum = 2</li>
                    <li>
                      At t=2: P1 has 2 units remaining, placed back in Q1. No
                      other process in Q1, so continue with P1 for 2 more units.
                    </li>
                    <li>
                      At t=4: P1 completes. P4 (Q1) is now in Q1, execute for 2
                      units.
                    </li>
                    <li>
                      At t=6: P4 completes. No process in Q1, move to Q2. P3
                      (Q2) executes for 4 units.
                    </li>
                    <li>
                      At t=10: P3 has 1 unit remaining, placed back in Q2. P5
                      (Q2) executes for 3 units.
                    </li>
                    <li>
                      At t=13: P5 completes. P3 executes for remaining 1 unit.
                    </li>
                    <li>
                      At t=14: P3 completes. No process in Q1 or Q2, move to Q3.
                      P2 (Q3) executes to completion (6 units).
                    </li>
                    <li>At t=20: All processes complete.</li>
                  </ol>

                  <p className="mt-3 font-medium">Timeline:</p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <div className="flex">
                      <div className="w-12 text-center border-r border-slate-300">
                        Time
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-10 text-center">0</div>
                        <div className="w-10 text-center">2</div>
                        <div className="w-10 text-center">4</div>
                        <div className="w-10 text-center">6</div>
                        <div className="w-10 text-center">10</div>
                        <div className="w-10 text-center">13</div>
                        <div className="w-10 text-center">14</div>
                        <div className="w-10 text-center">20</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 text-center border-r border-slate-300">
                        CPU
                      </div>
                      <div className="flex-1 flex h-8">
                        <div className="bg-red-200 text-center py-1 flex-none w-20 border border-red-300">
                          P1 (Q1)
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-20 border border-red-300">
                          P1 (Q1)
                        </div>
                        <div className="bg-red-200 text-center py-1 flex-none w-20 border border-red-300">
                          P4 (Q1)
                        </div>
                        <div className="bg-yellow-200 text-center py-1 flex-none w-40 border border-yellow-300">
                          P3 (Q2)
                        </div>
                        <div className="bg-yellow-200 text-center py-1 flex-none w-30 border border-yellow-300">
                          P5 (Q2)
                        </div>
                        <div className="bg-yellow-200 text-center py-1 flex-none w-10 border border-yellow-300">
                          P3
                        </div>
                        <div className="bg-green-200 text-center py-1 flex-none w-60 border border-green-300">
                          P2 (Q3)
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 font-medium">Calculations:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>P1: CT = 4, TAT = 4-0 = 4, WT = 4-4 = 0</li>
                    <li>P2: CT = 20, TAT = 20-1 = 19, WT = 19-6 = 13</li>
                    <li>P3: CT = 14, TAT = 14-2 = 12, WT = 12-5 = 7</li>
                    <li>P4: CT = 6, TAT = 6-3 = 3, WT = 3-2 = 1</li>
                    <li>P5: CT = 13, TAT = 13-4 = 9, WT = 9-3 = 6</li>
                  </ul>

                  <p className="mt-2 font-medium">
                    Performance Metrics by Queue:
                  </p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Q1 (System): Avg WT = (0+1)/2 = 0.5 units</li>
                    <li>Q2 (Interactive): Avg WT = (7+6)/2 = 6.5 units</li>
                    <li>Q3 (Batch): Avg WT = 13 units</li>
                    <li>
                      Overall Average Waiting Time = (0+13+7+1+6)/5 = 5.4 units
                    </li>
                  </ul>

                  <p className="mt-3 text-slate-600 italic">
                    Notice how processes in higher-priority queues (Q1) get
                    serviced immediately and have minimal waiting times, while
                    lower-priority processes (especially P2 in Q3) must wait for
                    all higher-priority queues to empty before getting CPU time,
                    resulting in higher waiting times.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Time Sharing Between Queues:
                </p>
                <p className="mt-1">
                  An alternative to fixed priority is time sharing between
                  queues:
                </p>

                <table className="min-w-full border-collapse border border-slate-300 mt-3">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2">Queue</th>
                      <th className="border border-slate-300 p-2">
                        Time Allocation
                      </th>
                      <th className="border border-slate-300 p-2">
                        Internal Algorithm
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2">
                        System Processes
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        70%
                      </td>
                      <td className="border border-slate-300 p-2">
                        Round Robin (q=1)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">
                        Interactive Processes
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        20%
                      </td>
                      <td className="border border-slate-300 p-2">
                        Round Robin (q=2)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">
                        Batch Processes
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        10%
                      </td>
                      <td className="border border-slate-300 p-2">FCFS</td>
                    </tr>
                  </tbody>
                </table>

                <p className="mt-3 text-slate-600">
                  This approach prevents starvation of lower-priority queues by
                  guaranteeing them a portion of CPU time, while still giving
                  preference to higher-priority queues.
                </p>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Real-world Applications:
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-2">
                  <li>
                    Traditional UNIX/Linux systems (kernel processes vs. user
                    processes)
                  </li>
                  <li>
                    Real-time systems with mixed critical and non-critical tasks
                  </li>
                  <li>
                    Mainframe systems with batch and interactive workloads
                  </li>
                  <li>
                    Systems with foreground and background processing
                    requirements
                  </li>
                </ul>

                <p className="mt-3 text-slate-700">
                  <strong>Variants of MLQ:</strong>
                </p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>
                    <strong>Feedback Multi-Level Queue:</strong> Same as MLQ but
                    with feedback between queues (MLFQ)
                  </li>
                  <li>
                    <strong>Dynamic MLQ:</strong> Queue assignments change
                    during runtime based on behavior
                  </li>
                  <li>
                    <strong>Priority-based MLQ:</strong> Higher priority
                    processes within each queue get preference
                  </li>
                </ul>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-slate-700">
                  Multilevel Feedback Queue (MLFQ):
                </p>
                <p className="mt-1">
                  An extension of MLQ where processes can move between queues
                  based on their behavior:
                </p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>
                    Processes enter the system at the highest priority queue
                  </li>
                  <li>
                    If they don't complete within their time quantum, they are
                    moved to a lower-priority queue
                  </li>
                  <li>
                    This allows the system to adapt to each process's behavior
                    (CPU-bound vs. I/O-bound)
                  </li>
                  <li>
                    I/O-bound processes that release the CPU frequently tend to
                    stay in higher-priority queues
                  </li>
                  <li>
                    CPU-bound processes that use their full time quantum tend to
                    drop to lower-priority queues
                  </li>
                  <li>
                    Optional aging mechanism to prevent starvation by
                    periodically promoting processes to higher-priority queues
                  </li>
                </ul>
                <p className="mt-2 text-slate-600">
                  MLFQ combines the advantages of MLQ with the ability to adapt
                  to process behavior, making it one of the most sophisticated
                  and widely used scheduling algorithms in modern operating
                  systems.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
          Comparative Analysis of CPU Scheduling Algorithms
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2">Criteria</th>
                <th className="border border-slate-300 p-2">FCFS</th>
                <th className="border border-slate-300 p-2">SJF</th>
                <th className="border border-slate-300 p-2">STRF</th>
                <th className="border border-slate-300 p-2">Round Robin</th>
                <th className="border border-slate-300 p-2">Priority</th>
                <th className="border border-slate-300 p-2">MLQ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Type
                </td>
                <td className="border border-slate-300 p-2">Non-preemptive</td>
                <td className="border border-slate-300 p-2">Non-preemptive</td>
                <td className="border border-slate-300 p-2">Preemptive</td>
                <td className="border border-slate-300 p-2">Preemptive</td>
                <td className="border border-slate-300 p-2">Both variants</td>
                <td className="border border-slate-300 p-2">Varies by queue</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Selection Criteria
                </td>
                <td className="border border-slate-300 p-2">Arrival time</td>
                <td className="border border-slate-300 p-2">Burst time</td>
                <td className="border border-slate-300 p-2">Remaining time</td>
                <td className="border border-slate-300 p-2">
                  Equal time slices
                </td>
                <td className="border border-slate-300 p-2">Priority value</td>
                <td className="border border-slate-300 p-2">Queue priority</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Avg. Waiting Time
                </td>
                <td className="border border-slate-300 p-2">High</td>
                <td className="border border-slate-300 p-2">Minimum</td>
                <td className="border border-slate-300 p-2">Minimum</td>
                <td className="border border-slate-300 p-2">Medium</td>
                <td className="border border-slate-300 p-2">Varies</td>
                <td className="border border-slate-300 p-2">Varies by queue</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Response Time
                </td>
                <td className="border border-slate-300 p-2">Poor</td>
                <td className="border border-slate-300 p-2">Good for short</td>
                <td className="border border-slate-300 p-2">Very good</td>
                <td className="border border-slate-300 p-2">Excellent</td>
                <td className="border border-slate-300 p-2">
                  Good for high priority
                </td>
                <td className="border border-slate-300 p-2">
                  Good for high priority
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Starvation
                </td>
                <td className="border border-slate-300 p-2">No</td>
                <td className="border border-slate-300 p-2">Possible</td>
                <td className="border border-slate-300 p-2">Possible</td>
                <td className="border border-slate-300 p-2">No</td>
                <td className="border border-slate-300 p-2">Possible</td>
                <td className="border border-slate-300 p-2">Possible</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Context Switches
                </td>
                <td className="border border-slate-300 p-2">Minimum</td>
                <td className="border border-slate-300 p-2">Minimum</td>
                <td className="border border-slate-300 p-2">Maximum</td>
                <td className="border border-slate-300 p-2">High</td>
                <td className="border border-slate-300 p-2">Medium</td>
                <td className="border border-slate-300 p-2">Varies</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Predictability
                </td>
                <td className="border border-slate-300 p-2">High</td>
                <td className="border border-slate-300 p-2">Medium</td>
                <td className="border border-slate-300 p-2">Low</td>
                <td className="border border-slate-300 p-2">Medium</td>
                <td className="border border-slate-300 p-2">Medium</td>
                <td className="border border-slate-300 p-2">
                  High within queue
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Convoy Effect
                </td>
                <td className="border border-slate-300 p-2">Yes</td>
                <td className="border border-slate-300 p-2">No</td>
                <td className="border border-slate-300 p-2">No</td>
                <td className="border border-slate-300 p-2">No</td>
                <td className="border border-slate-300 p-2">Possible</td>
                <td className="border border-slate-300 p-2">Possible</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Best For
                </td>
                <td className="border border-slate-300 p-2">Batch systems</td>
                <td className="border border-slate-300 p-2">
                  Production systems
                </td>
                <td className="border border-slate-300 p-2">
                  Interactive systems
                </td>
                <td className="border border-slate-300 p-2">Time-sharing</td>
                <td className="border border-slate-300 p-2">
                  Real-time systems
                </td>
                <td className="border border-slate-300 p-2">Mixed workload</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">
                  Implementation
                </td>
                <td className="border border-slate-300 p-2">Simple</td>
                <td className="border border-slate-300 p-2">Complex</td>
                <td className="border border-slate-300 p-2">Most complex</td>
                <td className="border border-slate-300 p-2">Simple</td>
                <td className="border border-slate-300 p-2">Medium</td>
                <td className="border border-slate-300 p-2">Complex</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Optimization Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
          CPU Scheduling Performance Optimization
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-slate-700 mb-2">
              Key Metrics for Evaluation
            </h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li>
                <strong>CPU Utilization:</strong> Keep the CPU as busy as
                possible (ideally 40-90%)
              </li>
              <li>
                <strong>Throughput:</strong> Maximize the number of processes
                completed per unit time
              </li>
              <li>
                <strong>Turnaround Time:</strong> Minimize the time from
                submission to completion
              </li>
              <li>
                <strong>Waiting Time:</strong> Minimize the time processes spend
                waiting in ready queue
              </li>
              <li>
                <strong>Response Time:</strong> Minimize time from submission
                until first response
              </li>
              <li>
                <strong>Fairness:</strong> Equal CPU time for equal-priority
                processes
              </li>
              <li>
                <strong>Predictability:</strong> Consistent and predictable
                response patterns
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-medium text-slate-700 mb-2">
              Optimization Strategies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium mb-1">For Batch Systems:</p>
                <ul className="list-disc ml-5 space-y-1 text-slate-600">
                  <li>Prioritize throughput and CPU utilization</li>
                  <li>SJF is often optimal for known workloads</li>
                  <li>Minimize unnecessary context switches</li>
                  <li>Group similar processes for execution</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium mb-1">For Interactive Systems:</p>
                <ul className="list-disc ml-5 space-y-1 text-slate-600">
                  <li>Prioritize response time and fairness</li>
                  <li>Use Round Robin with appropriate time quantum</li>
                  <li>Consider MLFQ for adapting to process behavior</li>
                  <li>Implement aging to prevent starvation</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium mb-1">For Real-time Systems:</p>
                <ul className="list-disc ml-5 space-y-1 text-slate-600">
                  <li>
                    Meet all deadlines (hard real-time) or most deadlines (soft
                    real-time)
                  </li>
                  <li>Use priority-based preemptive scheduling</li>
                  <li>
                    Implement Earliest Deadline First (EDF) when appropriate
                  </li>
                  <li>Reserve capacity for critical tasks</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium mb-1">For General Systems:</p>
                <ul className="list-disc ml-5 space-y-1 text-slate-600">
                  <li>Balance between throughput and response time</li>
                  <li>Implement multi-level feedback queues</li>
                  <li>
                    Adjust scheduling parameters dynamically based on load
                  </li>
                  <li>Monitor and tune scheduling parameters</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-base font-medium text-slate-700 mb-2">
              Advanced Considerations
            </h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li>
                <strong>Processor Affinity:</strong> Keep processes on the same
                CPU when possible in multiprocessor systems
              </li>
              <li>
                <strong>Load Balancing:</strong> Distribute processes evenly
                across available processors
              </li>
              <li>
                <strong>Priority Inversion Handling:</strong> Implement priority
                inheritance or priority ceiling protocols
              </li>
              <li>
                <strong>Time Quantum Selection:</strong> Analyze workload
                patterns to determine optimal time quantum values
              </li>
              <li>
                <strong>I/O and CPU Co-scheduling:</strong> Consider both I/O
                and CPU requirements in scheduling decisions
              </li>
              <li>
                <strong>Energy Efficiency:</strong> Balance performance with
                power consumption in mobile and embedded systems
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
