const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5173", "YOUR_FRONTEND_URL"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Add basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// FCFS Endpoint
// FCFS Endpoint
app.post("/api/fcfs", (req, res) => {
  const processes = req.body;

  // Validate input
  if (!Array.isArray(processes)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  for (const process of processes) {
    if (
      !process.processId ||
      process.arrivalTime === undefined ||
      process.burstTime === undefined
    ) {
      return res.status(400).json({ error: "Missing required process data" });
    }
  }

  // Sort processes by arrival time for FCFS
  const sortedProcesses = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime
  );

  // FCFS Algorithm
  let currentTime = 0;
  const schedule = [];
  const timeline = []; // Add this for tracking execution timeline

  for (const process of sortedProcesses) {
    const startTime = Math.max(currentTime, process.arrivalTime);
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = startTime - process.arrivalTime;

    // Add to schedule
    schedule.push({
      processId: process.processId,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    // Add to timeline
    timeline.push({
      processId: process.processId,
      startTime,
      endTime: completionTime,
    });

    currentTime = completionTime;
  }

  // Return both schedule and timeline data
  res.json({
    schedule,
    timeline,
  });
});

// SJF Endpoint
app.post("/api/sjf", (req, res) => {
  const processes = req.body;

  if (!Array.isArray(processes)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  for (const process of processes) {
    if (
      !process.processId ||
      process.arrivalTime === undefined ||
      process.burstTime === undefined
    ) {
      return res.status(400).json({ error: "Missing required process data" });
    }
  }

  // SJF Algorithm
  let currentTime = 0;
  const schedule = [];
  const timeline = []; // Add this for tracking execution timeline
  const waitingQueue = [...processes].map((p) => ({ ...p }));

  while (waitingQueue.length > 0) {
    // Filter processes that have arrived by the current time
    const availableProcesses = waitingQueue.filter(
      (p) => p.arrivalTime <= currentTime
    );

    if (availableProcesses.length === 0) {
      // If no process has arrived, jump to the next arrival time
      const nextArrival = Math.min(...waitingQueue.map((p) => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }

    // Select the process with the shortest burst time
    const shortestProcess = availableProcesses.reduce((prev, curr) =>
      curr.burstTime < prev.burstTime ? curr : prev
    );

    const startTime = currentTime;
    const completionTime = startTime + shortestProcess.burstTime;
    const turnaroundTime = completionTime - shortestProcess.arrivalTime;
    const waitingTime = startTime - shortestProcess.arrivalTime;

    schedule.push({
      processId: shortestProcess.processId,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    // Add to timeline
    timeline.push({
      processId: shortestProcess.processId,
      startTime,
      endTime: completionTime,
    });

    currentTime = completionTime;

    // Remove the completed process from the queue
    const index = waitingQueue.findIndex(
      (p) => p.processId === shortestProcess.processId
    );
    waitingQueue.splice(index, 1);
  }

  // Return both schedule and timeline data
  res.json({
    schedule,
    timeline,
  });
});

// Priority Scheduling Endpoint
app.post("/api/priority", (req, res) => {
  const processes = req.body;

  if (!Array.isArray(processes)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  for (const process of processes) {
    if (
      !process.processId ||
      process.arrivalTime === undefined ||
      process.burstTime === undefined ||
      process.priority === undefined
    ) {
      return res.status(400).json({
        error: "Missing required process data (priority is mandatory).",
      });
    }
  }

  // Priority Scheduling Algorithm
  let currentTime = 0;
  const schedule = [];
  const timeline = []; // Add this for tracking execution timeline
  const waitingQueue = [...processes].map((p) => ({ ...p }));

  while (waitingQueue.length > 0) {
    const availableProcesses = waitingQueue.filter(
      (p) => p.arrivalTime <= currentTime
    );

    if (availableProcesses.length === 0) {
      // Jump to next arrival time instead of incrementing by 1
      const nextArrival = Math.min(...waitingQueue.map((p) => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }

    // Select process with highest priority (lowest priority number)
    const highestPriorityProcess = availableProcesses.reduce((prev, curr) =>
      curr.priority < prev.priority ? curr : prev
    );

    const startTime = currentTime;
    const completionTime = startTime + highestPriorityProcess.burstTime;
    const turnaroundTime = completionTime - highestPriorityProcess.arrivalTime;
    const waitingTime = startTime - highestPriorityProcess.arrivalTime;

    schedule.push({
      processId: highestPriorityProcess.processId,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      priority: highestPriorityProcess.priority, // Include priority in results
    });

    // Add to timeline
    timeline.push({
      processId: highestPriorityProcess.processId,
      startTime,
      endTime: completionTime,
      priority: highestPriorityProcess.priority, // Include priority for additional context
    });

    currentTime = completionTime;

    const index = waitingQueue.findIndex(
      (p) => p.processId === highestPriorityProcess.processId
    );
    waitingQueue.splice(index, 1);
  }

  // Return both schedule and timeline data
  res.json({
    schedule,
    timeline,
  });
});

// Round Robin Endpoint
app.post("/api/round-robin", (req, res) => {
  const { processes, timeQuantum } = req.body;

  if (
    !Array.isArray(processes) ||
    typeof timeQuantum !== "number" ||
    timeQuantum <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid data format or time quantum" });
  }

  for (const process of processes) {
    if (
      !process.processId ||
      process.arrivalTime === undefined ||
      process.burstTime === undefined
    ) {
      return res.status(400).json({ error: "Missing required process data" });
    }
  }

  // Round Robin Algorithm
  let currentTime = 0;
  const executionSegments = []; // To track all execution segments
  const timeline = []; // For the final timeline
  const processTracking = {}; // To track completion status and stats

  // Initialize process tracking
  for (const process of processes) {
    processTracking[process.processId] = {
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      remainingTime: process.burstTime,
      firstExecution: null,
      lastExecution: null,
      completionTime: null,
      waitingTime: 0,
      turnaroundTime: 0,
      contextSwitches: 0,
    };
  }

  const waitingQueue = [...processes]
    .sort((a, b) => a.arrivalTime - b.arrivalTime)
    .map((p) => ({ ...p, remainingTime: p.burstTime }));

  let readyQueue = [];
  let previousProcess = null;

  while (waitingQueue.length > 0 || readyQueue.length > 0) {
    // Move arrived processes to ready queue
    while (
      waitingQueue.length > 0 &&
      waitingQueue[0].arrivalTime <= currentTime
    ) {
      readyQueue.push(waitingQueue.shift());
    }

    if (readyQueue.length === 0) {
      // Jump to next arrival time
      currentTime = waitingQueue[0].arrivalTime;
      continue;
    }

    const process = readyQueue.shift();
    const startTime = currentTime;
    const executionTime = Math.min(process.remainingTime, timeQuantum);
    const completionTime = startTime + executionTime;

    // Check for context switch
    if (previousProcess !== null && previousProcess !== process.processId) {
      processTracking[process.processId].contextSwitches++;
    }

    // Update process tracking
    if (processTracking[process.processId].firstExecution === null) {
      processTracking[process.processId].firstExecution = startTime;
    }

    // Add to execution segments
    executionSegments.push({
      processId: process.processId,
      startTime,
      completionTime,
    });

    // Add to timeline
    timeline.push({
      processId: process.processId,
      startTime,
      endTime: completionTime,
    });

    process.remainingTime -= executionTime;
    currentTime = completionTime;
    processTracking[process.processId].lastExecution = completionTime;

    // Track completion
    if (process.remainingTime === 0) {
      processTracking[process.processId].completionTime = completionTime;
      processTracking[process.processId].turnaroundTime =
        completionTime - processTracking[process.processId].arrivalTime;
      processTracking[process.processId].waitingTime =
        processTracking[process.processId].turnaroundTime -
        processTracking[process.processId].burstTime;
    }

    previousProcess = process.processId;

    // Move newly arrived processes to ready queue
    while (
      waitingQueue.length > 0 &&
      waitingQueue[0].arrivalTime <= currentTime
    ) {
      readyQueue.push(waitingQueue.shift());
    }

    // If process isn't finished, add it back to ready queue
    if (process.remainingTime > 0) {
      readyQueue.push(process);
    }
  }

  // Build final schedule with complete process information
  const schedule = Object.values(processTracking).map((p) => ({
    processId: parseInt(
      Object.keys(processTracking).find((key) => processTracking[key] === p)
    ),
    startTime: p.firstExecution,
    completionTime: p.completionTime,
    turnaroundTime: p.turnaroundTime,
    waitingTime: p.waitingTime,
    contextSwitches: p.contextSwitches,
  }));

  res.json({
    schedule,
    timeline,
    timeQuantum,
  });
});

// Preemptive SJF (Shortest Remaining Time First) endpoint and execution

// SRTF (Shortest Remaining Time First) endpoint
app.post("/api/srtf", (req, res) => {
  try {
    const processes = req.body;

    // Validate input
    if (!Array.isArray(processes)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    // Validate process data
    for (const process of processes) {
      if (
        !process.processId ||
        process.arrivalTime === undefined ||
        process.burstTime === undefined
      ) {
        return res.status(400).json({ error: "Missing required process data" });
      }
    }

    // Make a deep copy and add remaining time
    const processQueue = processes.map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      firstTimeInCPU: null,
      lastTimeInCPU: null,
      completionTime: null,
      contextSwitches: 0,
      timelineSegments: [],
    }));

    // Sort by arrival time
    processQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    let completedProcesses = 0;
    let currentProcess = null;

    // Timeline to track execution
    const timeline = [];

    while (completedProcesses < processQueue.length) {
      // Find ready processes at current time
      const readyProcesses = processQueue.filter(
        (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
      );

      // If no processes are ready, jump to next arrival
      if (readyProcesses.length === 0) {
        const nextArrival = processQueue
          .filter((p) => p.arrivalTime > currentTime && p.remainingTime > 0)
          .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

        currentTime = nextArrival;
        continue;
      }

      // Find process with shortest remaining time
      const shortestProcess = readyProcesses.reduce(
        (shortest, current) =>
          current.remainingTime < shortest.remainingTime ? current : shortest,
        readyProcesses[0]
      );

      // If this is a context switch from a different process
      if (
        currentProcess !== null &&
        currentProcess.processId !== shortestProcess.processId
      ) {
        // Update the previous process
        const prevIdx = processQueue.findIndex(
          (p) => p.processId === currentProcess.processId
        );
        if (prevIdx !== -1 && processQueue[prevIdx].remainingTime > 0) {
          processQueue[prevIdx].contextSwitches++;
        }

        // Update the new process
        const newIdx = processQueue.findIndex(
          (p) => p.processId === shortestProcess.processId
        );
        if (newIdx !== -1) {
          if (processQueue[newIdx].firstTimeInCPU === null) {
            processQueue[newIdx].firstTimeInCPU = currentTime;
          } else {
            processQueue[newIdx].contextSwitches++;
          }
        }
      } else if (currentProcess === null) {
        // First process to enter CPU
        const idx = processQueue.findIndex(
          (p) => p.processId === shortestProcess.processId
        );
        if (idx !== -1) {
          processQueue[idx].firstTimeInCPU = currentTime;
        }
      }

      currentProcess = shortestProcess;

      // Calculate next event time (either process completion or new arrival)
      const nextArrival = processQueue
        .filter((p) => p.arrivalTime > currentTime && p.remainingTime > 0)
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

      const timeToCompletion = shortestProcess.remainingTime;
      const runTime =
        nextArrival !== Infinity
          ? Math.min(timeToCompletion, nextArrival - currentTime)
          : timeToCompletion;

      // Add to timeline
      timeline.push({
        processId: shortestProcess.processId,
        startTime: currentTime,
        endTime: currentTime + runTime,
      });

      // Update process state
      const idx = processQueue.findIndex(
        (p) => p.processId === shortestProcess.processId
      );
      processQueue[idx].remainingTime -= runTime;
      processQueue[idx].lastTimeInCPU = currentTime + runTime;

      // Record timeline segment
      processQueue[idx].timelineSegments.push({
        startTime: currentTime,
        endTime: currentTime + runTime,
      });

      // Check if process is completed
      if (processQueue[idx].remainingTime === 0) {
        processQueue[idx].completionTime = currentTime + runTime;
        completedProcesses++;
      }

      // Advance time
      currentTime += runTime;
    }

    // Calculate turnaround time and waiting time
    const result = processQueue.map((p) => {
      // Consolidate timeline segments
      let consolidatedSegments = [];
      if (p.timelineSegments.length > 0) {
        p.timelineSegments.sort((a, b) => a.startTime - b.startTime);

        let currentSegment = { ...p.timelineSegments[0] };

        for (let i = 1; i < p.timelineSegments.length; i++) {
          const segment = p.timelineSegments[i];

          // If segments are continuous, merge them
          if (segment.startTime === currentSegment.endTime) {
            currentSegment.endTime = segment.endTime;
          } else {
            // Add completed segment and start a new one
            consolidatedSegments.push(currentSegment);
            currentSegment = { ...segment };
          }
        }

        // Add the last segment
        consolidatedSegments.push(currentSegment);
      }

      return {
        processId: p.processId,
        startTime: p.firstTimeInCPU,
        completionTime: p.completionTime,
        turnaroundTime: p.completionTime - p.arrivalTime,
        waitingTime: p.completionTime - p.arrivalTime - p.burstTime,
        contextSwitches: p.contextSwitches,
        timeline: consolidatedSegments,
      };
    });

    res.json({
      schedule: result,
      timeline: timeline,
    });
  } catch (err) {
    console.error("SRTF Error:", err);
    res.status(500).json({ error: "An error occurred processing the request" });
  }
});
//MULTIQUE SCHEDULING
// MLQ endpoint in index.js
app.post("/api/mlq", (req, res) => {
  try {
    const { queues } = req.body;

    if (!Array.isArray(queues) || queues.length === 0) {
      return res.status(400).json({ error: "Invalid queues data" });
    }

    // Validate queue data
    for (const queue of queues) {
      if (
        !queue.priority ||
        !queue.algorithm ||
        !Array.isArray(queue.processes)
      ) {
        return res.status(400).json({ error: "Invalid queue format" });
      }

      if (
        queue.algorithm === "rr" &&
        (!queue.timeQuantum || queue.timeQuantum <= 0)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid time quantum for Round Robin" });
      }

      for (const process of queue.processes) {
        if (
          !process.processId ||
          process.arrivalTime === undefined ||
          process.burstTime === undefined
        ) {
          return res
            .status(400)
            .json({ error: "Missing required process data" });
        }

        if (queue.algorithm === "ps" && process.priority === undefined) {
          return res
            .status(400)
            .json({ error: "Priority is required for Priority Scheduling" });
        }
      }
    }

    // Sort queues by priority (ascending)
    const sortedQueues = [...queues].sort((a, b) => a.priority - b.priority);

    // Prepare all processes with their queue information
    const processesWithQueue = [];
    for (const queue of sortedQueues) {
      for (const process of queue.processes) {
        processesWithQueue.push({
          ...process,
          queuePriority: queue.priority,
          algorithm: queue.algorithm,
          timeQuantum: queue.timeQuantum,
          remainingTime: process.burstTime,
          executed: false,
        });
      }
    }

    // Initialize timeline and current time
    let currentTime = 0;
    const timeline = [];
    const completedProcesses = [];

    // Process each queue in order of priority until all processes are completed
    while (processesWithQueue.some((p) => !p.executed)) {
      // Find the next queue with processes to execute
      const nextQueuePriority = sortedQueues.find((q) =>
        processesWithQueue.some(
          (p) => p.queuePriority === q.priority && !p.executed
        )
      )?.priority;

      if (nextQueuePriority === undefined) {
        // No more processes to execute (should not happen, but just in case)
        break;
      }

      // Get processes for current queue
      const queueProcesses = processesWithQueue.filter(
        (p) => p.queuePriority === nextQueuePriority && !p.executed
      );

      // Skip if no processes are ready at current time
      const readyProcesses = queueProcesses.filter(
        (p) => p.arrivalTime <= currentTime
      );
      if (readyProcesses.length === 0) {
        // Jump to the next arrival time
        const nextArrival = Math.min(
          ...queueProcesses.map((p) => p.arrivalTime)
        );
        currentTime = nextArrival;
        continue;
      }

      // Get the queue configuration
      const queueConfig = sortedQueues.find(
        (q) => q.priority === nextQueuePriority
      );

      // Execute processes based on the algorithm for this queue
      switch (queueConfig.algorithm) {
        case "fcfs": {
          // First Come First Serve
          const processesToExecute = [...readyProcesses].sort(
            (a, b) => a.arrivalTime - b.arrivalTime
          );
          const process = processesToExecute[0];

          const startTime = currentTime;
          const completionTime = startTime + process.remainingTime;

          timeline.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime,
          });

          currentTime = completionTime;

          // Mark process as executed
          const processIndex = processesWithQueue.findIndex(
            (p) => p.processId === process.processId
          );
          processesWithQueue[processIndex].executed = true;

          // Add to completed processes with metrics
          completedProcesses.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime,
            turnaroundTime: completionTime - process.arrivalTime,
            waitingTime: startTime - process.arrivalTime,
          });
          break;
        }

        case "sjf": {
          // Shortest Job First
          const processesToExecute = [...readyProcesses].sort((a, b) => {
            if (a.remainingTime === b.remainingTime) {
              return a.arrivalTime - b.arrivalTime;
            }
            return a.remainingTime - b.remainingTime;
          });

          const process = processesToExecute[0];

          const startTime = currentTime;
          const completionTime = startTime + process.remainingTime;

          timeline.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime,
          });

          currentTime = completionTime;

          // Mark process as executed
          const processIndex = processesWithQueue.findIndex(
            (p) => p.processId === process.processId
          );
          processesWithQueue[processIndex].executed = true;

          // Add to completed processes with metrics
          completedProcesses.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime,
            turnaroundTime: completionTime - process.arrivalTime,
            waitingTime: startTime - process.arrivalTime,
          });
          break;
        }

        case "rr": {
          // Round Robin
          const processesToExecute = [...readyProcesses].sort(
            (a, b) => a.arrivalTime - b.arrivalTime
          );
          const process = processesToExecute[0];

          const timeQuantum = queueConfig.timeQuantum;
          const executionTime = Math.min(process.remainingTime, timeQuantum);

          const startTime = currentTime;
          const endTime = startTime + executionTime;

          timeline.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime: endTime,
          });

          currentTime = endTime;

          // Update remaining time
          const processIndex = processesWithQueue.findIndex(
            (p) => p.processId === process.processId
          );
          processesWithQueue[processIndex].remainingTime -= executionTime;

          // Check if process is completed
          if (processesWithQueue[processIndex].remainingTime <= 0) {
            processesWithQueue[processIndex].executed = true;

            // Add to completed processes with metrics
            completedProcesses.push({
              processId: process.processId,
              queuePriority: process.queuePriority,
              startTime: timeline
                .filter((t) => t.processId === process.processId)
                .map((t) => t.startTime)[0],
              completionTime: endTime,
              turnaroundTime: endTime - process.arrivalTime,
              waitingTime: endTime - process.arrivalTime - process.burstTime,
            });
          }
          break;
        }

        case "ps": {
          // Priority Scheduling
          const processesToExecute = [...readyProcesses].sort((a, b) => {
            if (a.priority === b.priority) {
              return a.arrivalTime - b.arrivalTime;
            }
            return a.priority - b.priority;
          });

          const process = processesToExecute[0];

          const startTime = currentTime;
          const completionTime = startTime + process.remainingTime;

          timeline.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime,
          });

          currentTime = completionTime;

          // Mark process as executed
          const processIndex = processesWithQueue.findIndex(
            (p) => p.processId === process.processId
          );
          processesWithQueue[processIndex].executed = true;

          // Add to completed processes with metrics
          completedProcesses.push({
            processId: process.processId,
            queuePriority: process.queuePriority,
            startTime,
            completionTime,
            turnaroundTime: completionTime - process.arrivalTime,
            waitingTime: startTime - process.arrivalTime,
          });
          break;
        }

        default:
          return res
            .status(400)
            .json({ error: `Unsupported algorithm: ${queueConfig.algorithm}` });
      }
    }

    // Consolidate timeline for continuous process execution
    const consolidatedTimeline = [];
    for (const process of completedProcesses) {
      const processSegments = timeline.filter(
        (t) => t.processId === process.processId
      );

      // Get the actual first start and last completion time
      const startTime = Math.min(...processSegments.map((s) => s.startTime));
      const completionTime = Math.max(
        ...processSegments.map((s) => s.completionTime)
      );

      consolidatedTimeline.push({
        ...process,
        startTime,
        completionTime,
      });
    }

    // Calculate performance metrics
    const totalTurnaroundTime = completedProcesses.reduce(
      (sum, p) => sum + p.turnaroundTime,
      0
    );
    const totalWaitingTime = completedProcesses.reduce(
      (sum, p) => sum + p.waitingTime,
      0
    );
    const avgTurnaroundTime = totalTurnaroundTime / completedProcesses.length;
    const avgWaitingTime = totalWaitingTime / completedProcesses.length;

    res.json({
      schedule: completedProcesses,
      timeline: timeline,
      metrics: {
        avgTurnaroundTime,
        avgWaitingTime,
      },
    });
  } catch (err) {
    console.error("MLQ Error:", err);
    res.status(500).json({ error: "An error occurred processing the request" });
  }
});

// Start Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// Update port configuration for production
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
