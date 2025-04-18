import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  Clock,
  ArrowRight,
} from "lucide-react";

const ProcessControlBlocks = () => {
  // State for processes and simulation
  const [processes, setProcesses] = useState([]);
  const [nextProcessId, setNextProcessId] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [cpuProcess, setCpuProcess] = useState(null);
  const [readyQueue, setReadyQueue] = useState([]);
  const [blockedQueue, setBlockedQueue] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [showTheory, setShowTheory] = useState(true);
  const [error, setError] = useState(null);
  const [ioIntervalId, setIoIntervalId] = useState(null);

  // Process states
  const PROCESS_STATES = {
    NEW: "new",
    READY: "ready",
    RUNNING: "running",
    BLOCKED: "blocked",
    TERMINATED: "terminated",
  };

  // Animation timer reference
  const simulationTimer = useRef(null);

  // Run simulation based on timer
  useEffect(() => {
    if (simulationRunning) {
      simulationTimer.current = setTimeout(() => {
        setSimulationTime((prevTime) => prevTime + 1);
        progressSimulation();
      }, simulationSpeed);
    }

    return () => {
      if (simulationTimer.current) {
        clearTimeout(simulationTimer.current);
      }
    };
  }, [simulationRunning, simulationTime, simulationSpeed]);

  // Add a new process
  const addProcess = () => {
    if (processes.length >= 10) {
      setError("Maximum of 10 processes allowed");
      return;
    }

    const burstTime = Math.floor(Math.random() * 10) + 2; // 2-11
    const priority = Math.floor(Math.random() * 10) + 1; // 1-10
    const ioChance = Math.random() < 0.7; // 70% chance of I/O operations

    const newProcess = {
      id: nextProcessId,
      name: `Process ${nextProcessId}`,
      state: PROCESS_STATES.NEW,
      arrivalTime: simulationTime,
      burstTime,
      priority,
      remainingTime: burstTime,
      ioOperations: ioChance ? Math.floor(Math.random() * 3) + 1 : 0, // 0-3 I/O operations
      ioTiming: [], // Will be filled based on ioOperations
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: null,
      color: getProcessColor(nextProcessId),
      cpuUsed: 0,
      contextSwitches: 0,
    };

    // Generate random times for I/O operations
    if (newProcess.ioOperations > 0) {
      // Create array of times when I/O will happen
      const ioPoints = [];
      for (let i = 0; i < newProcess.ioOperations; i++) {
        // I/O occurs after processing between 10-90% of remaining time
        const ioPoint = Math.max(
          1,
          Math.floor(newProcess.burstTime * (0.1 + Math.random() * 0.8))
        );
        ioPoints.push(ioPoint);
      }

      // Sort and filter out duplicates
      newProcess.ioTiming = [...new Set(ioPoints)].sort((a, b) => a - b);

      // Make sure the last I/O doesn't happen at the very end
      if (
        newProcess.ioTiming.length > 0 &&
        newProcess.ioTiming[newProcess.ioTiming.length - 1] >=
          newProcess.burstTime
      ) {
        newProcess.ioTiming[newProcess.ioTiming.length - 1] = Math.max(
          1,
          newProcess.burstTime - 1
        );
      }
    }

    setProcesses([...processes, newProcess]);
    setReadyQueue([...readyQueue, newProcess.id]);

    // Add to event log
    addEvent(`Process ${newProcess.id} created and added to Ready queue`);

    setNextProcessId(nextProcessId + 1);
  };

  // Add a new event to the log
  const addEvent = (message) => {
    setEventLog((prev) => [...prev, { time: simulationTime, message }]);
  };

  // Select a process to view details
  const selectProcess = (id) => {
    const process = processes.find((p) => p.id === id);
    setSelectedProcess(process || null);
  };

  // Start or resume simulation
  const startSimulation = () => {
    if (readyQueue.length === 0 && !cpuProcess && blockedQueue.length === 0) {
      setError("Add at least one process before starting simulation");
      return;
    }

    setSimulationRunning(true);
    setError(null);

    // Set up random I/O interrupts (about every 5-15 seconds)
    if (!ioIntervalId) {
      const id = setInterval(() => {
        if (Math.random() < 0.3 && cpuProcess) {
          // 30% chance of an I/O interrupt
          handleIoInterrupt();
        }
      }, 5000 + Math.random() * 10000);

      setIoIntervalId(id);
    }
  };

  // Stop simulation
  const pauseSimulation = () => {
    setSimulationRunning(false);
  };

  // Reset the entire simulation
  const resetSimulation = () => {
    setSimulationRunning(false);
    setSimulationTime(0);
    setCpuProcess(null);
    setReadyQueue([]);
    setBlockedQueue([]);
    setCompletedProcesses([]);
    setEventLog([]);
    setProcesses([]);
    setNextProcessId(1);
    setSelectedProcess(null);

    // Clear I/O interrupt timer
    if (ioIntervalId) {
      clearInterval(ioIntervalId);
      setIoIntervalId(null);
    }
  };

  // Progress the simulation by one time unit
  const progressSimulation = () => {
    // Update all processes
    const updatedProcesses = [...processes];
    const updatedReady = [...readyQueue];
    const updatedBlocked = [...blockedQueue];
    let updatedCpuProcess = cpuProcess;
    const updatedCompleted = [...completedProcesses];

    // 1. Move processes from NEW to READY if arrival time is reached
    updatedProcesses.forEach((process) => {
      if (
        process.state === PROCESS_STATES.NEW &&
        process.arrivalTime <= simulationTime
      ) {
        process.state = PROCESS_STATES.READY;
        if (!updatedReady.includes(process.id)) {
          updatedReady.push(process.id);
          addEvent(`Process ${process.id} moved to Ready queue`);
        }
      }
    });

    // 2. Assign CPU to a process if it's free
    if (!updatedCpuProcess && updatedReady.length > 0) {
      // Choose the next process from ready queue (FCFS for simplicity)
      const nextProcessId = updatedReady.shift();
      const nextProcess = updatedProcesses.find((p) => p.id === nextProcessId);

      if (nextProcess) {
        nextProcess.state = PROCESS_STATES.RUNNING;
        nextProcess.contextSwitches++;
        updatedCpuProcess = nextProcessId;
        addEvent(`Process ${nextProcessId} started execution`);
      }
    }

    // 3. Execute the current process on CPU
    if (updatedCpuProcess) {
      const process = updatedProcesses.find((p) => p.id === updatedCpuProcess);

      // Process exists and is in RUNNING state
      if (process && process.state === PROCESS_STATES.RUNNING) {
        process.cpuUsed += 1;
        process.remainingTime -= 1;

        // Check if this is an I/O point
        if (process.ioTiming.includes(process.cpuUsed)) {
          process.state = PROCESS_STATES.BLOCKED;
          updatedBlocked.push(process.id);
          updatedCpuProcess = null;
          addEvent(`Process ${process.id} blocked for I/O operation`);

          // Remove this I/O point from the timing array
          process.ioTiming = process.ioTiming.filter(
            (t) => t !== process.cpuUsed
          );

          // Set random I/O duration (2-5 time units)
          process.ioRemainingTime = Math.floor(Math.random() * 4) + 2;
        }
        // Check if process is complete
        else if (process.remainingTime <= 0) {
          process.state = PROCESS_STATES.TERMINATED;
          process.completionTime = simulationTime;
          process.turnaroundTime = simulationTime - process.arrivalTime;
          updatedCpuProcess = null;
          updatedCompleted.push(process.id);
          addEvent(`Process ${process.id} completed execution`);
        }
      }
    }

    // 4. Handle blocked processes (I/O operations)
    for (let i = updatedBlocked.length - 1; i >= 0; i--) {
      const process = updatedProcesses.find((p) => p.id === updatedBlocked[i]);

      if (process && process.state === PROCESS_STATES.BLOCKED) {
        process.ioRemainingTime -= 1;

        // I/O operation completed
        if (process.ioRemainingTime <= 0) {
          process.state = PROCESS_STATES.READY;
          updatedReady.push(process.id);
          updatedBlocked.splice(i, 1);
          addEvent(`Process ${process.id} I/O completed, moved to Ready queue`);
        }
      }
    }

    // 5. Update waiting time for processes in ready queue
    updatedProcesses.forEach((process) => {
      if (process.state === PROCESS_STATES.READY) {
        process.waitingTime += 1;
      }
    });

    // Update state
    setProcesses(updatedProcesses);
    setReadyQueue(updatedReady);
    setBlockedQueue(updatedBlocked);
    setCpuProcess(updatedCpuProcess);
    setCompletedProcesses(updatedCompleted);

    // If simulation is complete (no active processes)
    if (
      updatedReady.length === 0 &&
      !updatedCpuProcess &&
      updatedBlocked.length === 0
    ) {
      const newProcesses = updatedProcesses.filter(
        (p) => p.state === PROCESS_STATES.NEW
      );
      if (newProcesses.length === 0) {
        // End simulation if no more processes to run
        setSimulationRunning(false);
        addEvent("Simulation complete");

        // Clear I/O interrupt timer
        if (ioIntervalId) {
          clearInterval(ioIntervalId);
          setIoIntervalId(null);
        }
      }
    }
  };

  // Get color for process visualization
  const getProcessColor = (id) => {
    const colors = [
      "#4299E1", // blue
      "#48BB78", // green
      "#ED8936", // orange
      "#9F7AEA", // purple
      "#F56565", // red
      "#38B2AC", // teal
      "#ED64A6", // pink
      "#ECC94B", // yellow
      "#667EEA", // indigo
      "#FC8181", // light red
    ];

    return colors[(id - 1) % colors.length];
  };

  // Handle I/O interrupt (manually triggered or random)
  const handleIoInterrupt = () => {
    if (!cpuProcess) return;

    const updatedProcesses = [...processes];
    const process = updatedProcesses.find((p) => p.id === cpuProcess);

    if (process && process.state === PROCESS_STATES.RUNNING) {
      // Move to blocked queue for I/O
      process.state = PROCESS_STATES.BLOCKED;
      setBlockedQueue([...blockedQueue, process.id]);
      setCpuProcess(null);

      // Set random I/O duration (1-4 time units)
      process.ioRemainingTime = Math.floor(Math.random() * 4) + 1;

      addEvent(`I/O Interrupt: Process ${process.id} moved to Blocked queue`);
      setProcesses(updatedProcesses);
    }
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Process Control Blocks & Process States
        </h1>

        <button
          onClick={() => setShowTheory(!showTheory)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <Info className="w-4 h-4" />
          {showTheory ? "Hide Theory" : "Show Theory"}
        </button>
      </div>

      {showTheory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Process Management Fundamentals
          </h2>
          <div className="space-y-2 text-blue-900">
            <p>
              An operating system manages multiple processes, each representing
              a program in execution. The Process Control Block (PCB) is a data
              structure that contains all the information about a process.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Process States</b>: Throughout its lifetime, a process moves
                through different states:
                <ul className="list-none pl-5 pt-1">
                  <li>
                    • <span className="font-medium">New</span>: Process is being
                    created
                  </li>
                  <li>
                    • <span className="font-medium">Ready</span>: Process is
                    waiting to be assigned to the CPU
                  </li>
                  <li>
                    • <span className="font-medium">Running</span>: Instructions
                    are being executed
                  </li>
                  <li>
                    • <span className="font-medium">Blocked/Waiting</span>:
                    Process is waiting for an event (e.g., I/O completion)
                  </li>
                  <li>
                    • <span className="font-medium">Terminated</span>: Process
                    has finished execution
                  </li>
                </ul>
              </li>
              <li>
                <b>Process Control Block</b>: Contains process ID, state,
                program counter, CPU registers, CPU scheduling information,
                memory management information, accounting information, and I/O
                status information.
              </li>
              <li>
                <b>Context Switch</b>: The process of saving the state of a
                running process and loading the state of another process. This
                occurs during CPU scheduling.
              </li>
            </ul>
            <p className="mt-2">
              This visualization demonstrates how processes move through
              different states, how the OS manages multiple processes, and how
              I/O operations and CPU scheduling affect process execution.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 flex gap-2">
            <button
              onClick={addProcess}
              disabled={simulationRunning}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Process
            </button>

            {simulationRunning ? (
              <button
                onClick={pauseSimulation}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
              >
                <Play className="w-4 h-4" /> Start
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-700">
              Time: {simulationTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Speed:</span>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="p-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="2000">Slow</option>
              <option value="1000">Normal</option>
              <option value="500">Fast</option>
              <option value="100">Very Fast</option>
            </select>
          </div>

          {simulationRunning && cpuProcess && (
            <button
              onClick={handleIoInterrupt}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
            >
              Trigger I/O Interrupt
            </button>
          )}
        </div>
      </div>

      {/* Process State Diagram and Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Process State Diagram */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Process State Diagram
          </h3>

          <div className="min-h-60 bg-slate-50 rounded-lg p-4 flex items-center justify-center">
            <div className="relative max-w-full mx-auto">
              {/* States */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* New */}
                <div
                  className={`p-2 rounded-lg bg-gray-100 border-2 ${
                    processes.some((p) => p.state === PROCESS_STATES.NEW)
                      ? "border-gray-500"
                      : "border-transparent"
                  }`}
                >
                  <div className="text-center font-medium">New</div>
                  <div className="text-xs text-center text-slate-500">
                    {
                      processes.filter((p) => p.state === PROCESS_STATES.NEW)
                        .length
                    }{" "}
                    processes
                  </div>
                </div>

                {/* Ready */}
                <div
                  className={`p-2 rounded-lg bg-blue-100 border-2 ${
                    processes.some((p) => p.state === PROCESS_STATES.READY)
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <div className="text-center font-medium">Ready</div>
                  <div className="text-xs text-center text-slate-500">
                    {
                      processes.filter((p) => p.state === PROCESS_STATES.READY)
                        .length
                    }{" "}
                    processes
                  </div>
                </div>

                {/* Running */}
                <div
                  className={`p-2 rounded-lg bg-green-100 border-2 ${
                    processes.some((p) => p.state === PROCESS_STATES.RUNNING)
                      ? "border-green-500"
                      : "border-transparent"
                  }`}
                >
                  <div className="text-center font-medium">Running</div>
                  <div className="text-xs text-center text-slate-500">
                    {
                      processes.filter(
                        (p) => p.state === PROCESS_STATES.RUNNING
                      ).length
                    }{" "}
                    processes
                  </div>
                </div>

                {/* Blocked */}
                <div
                  className={`p-2 rounded-lg bg-amber-100 border-2 ${
                    processes.some((p) => p.state === PROCESS_STATES.BLOCKED)
                      ? "border-amber-500"
                      : "border-transparent"
                  }`}
                >
                  <div className="text-center font-medium">Blocked</div>
                  <div className="text-xs text-center text-slate-500">
                    {
                      processes.filter(
                        (p) => p.state === PROCESS_STATES.BLOCKED
                      ).length
                    }{" "}
                    processes
                  </div>
                </div>

                {/* Terminated */}
                <div
                  className={`p-2 rounded-lg bg-red-100 border-2 ${
                    processes.some((p) => p.state === PROCESS_STATES.TERMINATED)
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                  style={{ minWidth: "120px" }}
                >
                  <div className="text-center font-medium">Terminated</div>
                  <div className="text-xs text-center text-slate-500">
                    {
                      processes.filter(
                        (p) => p.state === PROCESS_STATES.TERMINATED
                      ).length
                    }{" "}
                    processes
                  </div>
                </div>
              </div>

              {/* Transitions - only show with CSS and arrow marks in actual diagram */}
              <div className="text-center text-xs text-slate-500 mt-4">
                State transitions are visualized by processes moving between
                queues.
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-blue-100 rounded-full border border-blue-500"></div>
                    <span>Ready</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-green-100 rounded-full border border-green-500"></div>
                    <span>Running</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-amber-100 rounded-full border border-amber-500"></div>
                    <span>Blocked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queues and CPU */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Process Queues & CPU
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ready Queue */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
              <h4 className="font-medium text-blue-800 text-sm mb-2 flex items-center justify-between">
                <span>Ready Queue</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full">
                  {readyQueue.length}
                </span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {readyQueue.length === 0 ? (
                  <div className="text-center text-sm text-blue-400 py-2">
                    Queue Empty
                  </div>
                ) : (
                  readyQueue.map((processId, index) => {
                    const process = processes.find((p) => p.id === processId);
                    if (!process) return null;

                    return (
                      <div
                        key={process.id}
                        className="p-2 bg-white rounded border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => selectProcess(process.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: process.color }}
                            ></div>
                            <span className="font-medium text-sm">
                              {process.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Wait: {process.waitingTime}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-slate-500">
                          <span>CPU Needed: {process.remainingTime}</span>
                          <span>Priority: {process.priority}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CPU */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-3">
              <h4 className="font-medium text-green-800 text-sm mb-2">
                CPU (Running)
              </h4>
              <div className="space-y-2">
                {cpuProcess ? (
                  (() => {
                    const process = processes.find((p) => p.id === cpuProcess);
                    if (!process) return null;

                    return (
                      <div
                        className="p-2 bg-white rounded border-2 border-green-300 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => selectProcess(process.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: process.color }}
                            ></div>
                            <span className="font-medium text-sm">
                              {process.name}
                            </span>
                          </div>
                          <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full">
                            Running
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${
                                  (1 -
                                    process.remainingTime / process.burstTime) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>
                              Progress:{" "}
                              {Math.round(
                                (1 -
                                  process.remainingTime / process.burstTime) *
                                  100
                              )}
                              %
                            </span>
                            <span>Remaining: {process.remainingTime}</span>
                          </div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-slate-500">
                          <span>Time used: {process.cpuUsed}</span>
                          <span>Switches: {process.contextSwitches}</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center text-sm text-green-400 py-8">
                    CPU Idle
                  </div>
                )}
              </div>
            </div>

            {/* Blocked Queue */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
              <h4 className="font-medium text-amber-800 text-sm mb-2 flex items-center justify-between">
                <span>Blocked Queue (I/O)</span>
                <span className="text-xs px-2 py-0.5 bg-amber-100 rounded-full">
                  {blockedQueue.length}
                </span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {blockedQueue.length === 0 ? (
                  <div className="text-center text-sm text-amber-400 py-2">
                    Queue Empty
                  </div>
                ) : (
                  blockedQueue.map((processId) => {
                    const process = processes.find((p) => p.id === processId);
                    if (!process) return null;

                    return (
                      <div
                        key={process.id}
                        className="p-2 bg-white rounded border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => selectProcess(process.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: process.color }}
                            ></div>
                            <span className="font-medium text-sm">
                              {process.name}
                            </span>
                          </div>
                          <span className="text-xs bg-amber-100 px-2 py-0.5 rounded-full">
                            I/O
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${
                                  (1 -
                                    process.ioRemainingTime /
                                      (process.ioRemainingTime + 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>
                              I/O:{" "}
                              {Math.round(
                                (1 -
                                  process.ioRemainingTime /
                                    (process.ioRemainingTime + 1)) *
                                  100
                              )}
                              %
                            </span>
                            <span>Remaining: {process.ioRemainingTime}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Log and Completed Processes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Event Log */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center justify-between">
            <span>Event Log</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
              {eventLog.length} events
            </span>
          </h3>
          <div className="h-60 overflow-y-auto border rounded-lg">
            {eventLog.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-4">
                No events yet
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Event
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {eventLog
                    .slice()
                    .reverse()
                    .map((event, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
                          {event.time}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {event.message}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Completed Processes */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center justify-between">
            <span>Completed Processes</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
              {completedProcesses.length}/{processes.length} complete
            </span>
          </h3>
          <div className="h-60 overflow-y-auto border rounded-lg">
            {completedProcesses.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-4">
                No completed processes yet
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Process
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Turnaround
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Wait Time
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {completedProcesses.map((processId) => {
                    const process = processes.find((p) => p.id === processId);
                    if (!process) return null;

                    return (
                      <tr
                        key={process.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => selectProcess(process.id)}
                      >
                        <td className="px-3 py-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: process.color }}
                            ></div>
                            {process.name}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
                          {process.turnaroundTime}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
                          {process.waitingTime}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
                          {process.completionTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Selected Process Details - PCB */}
      {selectedProcess && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedProcess.color }}
              ></div>
              {selectedProcess.name} - Process Control Block
            </h3>
            <button
              onClick={() => setSelectedProcess(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Process ID</div>
                <div className="font-medium">{selectedProcess.id}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">State</div>
                <div className="font-medium">
                  {selectedProcess.state === PROCESS_STATES.NEW && (
                    <span className="text-gray-700">New</span>
                  )}
                  {selectedProcess.state === PROCESS_STATES.READY && (
                    <span className="text-blue-700">Ready</span>
                  )}
                  {selectedProcess.state === PROCESS_STATES.RUNNING && (
                    <span className="text-green-700">Running</span>
                  )}
                  {selectedProcess.state === PROCESS_STATES.BLOCKED && (
                    <span className="text-amber-700">Blocked</span>
                  )}
                  {selectedProcess.state === PROCESS_STATES.TERMINATED && (
                    <span className="text-red-700">Terminated</span>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Priority</div>
                <div className="font-medium">{selectedProcess.priority}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Arrival Time</div>
                <div className="font-medium">{selectedProcess.arrivalTime}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Burst Time</div>
                <div className="font-medium">{selectedProcess.burstTime}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Remaining Time</div>
                <div className="font-medium">
                  {selectedProcess.remainingTime}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">I/O Operations</div>
                <div className="font-medium">
                  {selectedProcess.ioOperations}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Waiting Time</div>
                <div className="font-medium">{selectedProcess.waitingTime}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Context Switches</div>
                <div className="font-medium">
                  {selectedProcess.contextSwitches}
                </div>
              </div>
            </div>
          </div>

          {selectedProcess.state === PROCESS_STATES.TERMINATED && (
            <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-2">
                Completion Statistics
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-green-600">Arrival Time</div>
                  <div className="font-medium">
                    {selectedProcess.arrivalTime}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600">Completion Time</div>
                  <div className="font-medium">
                    {selectedProcess.completionTime}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600">Turnaround Time</div>
                  <div className="font-medium">
                    {selectedProcess.turnaroundTime}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Summary */}
      {processes.length > 0 && completedProcesses.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Performance Statistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="text-sm text-blue-600">Avg. Turnaround Time</div>
              <div className="text-xl font-bold text-blue-800">
                {(
                  processes
                    .filter((p) => p.state === PROCESS_STATES.TERMINATED)
                    .reduce((sum, p) => sum + p.turnaroundTime, 0) /
                  processes.filter((p) => p.state === PROCESS_STATES.TERMINATED)
                    .length
                ).toFixed(2)}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="text-sm text-green-600">Avg. Waiting Time</div>
              <div className="text-xl font-bold text-green-800">
                {(
                  processes
                    .filter((p) => p.state === PROCESS_STATES.TERMINATED)
                    .reduce((sum, p) => sum + p.waitingTime, 0) /
                  processes.filter((p) => p.state === PROCESS_STATES.TERMINATED)
                    .length
                ).toFixed(2)}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="text-sm text-purple-600">Throughput</div>
              <div className="text-xl font-bold text-purple-800">
                {(completedProcesses.length / (simulationTime || 1)).toFixed(4)}
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="text-sm text-amber-600">CPU Utilization</div>
              <div className="text-xl font-bold text-amber-800">
                {(simulationTime === 0
                  ? 0
                  : (processes.reduce((sum, p) => sum + p.cpuUsed, 0) /
                      simulationTime) *
                    100
                ).toFixed(1)}
                %
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <div className="text-sm text-red-600">Avg. Context Switches</div>
              <div className="text-xl font-bold text-red-800">
                {(
                  processes
                    .filter((p) => p.contextSwitches > 0)
                    .reduce((sum, p) => sum + p.contextSwitches, 0) /
                  Math.max(
                    1,
                    processes.filter((p) => p.contextSwitches > 0).length
                  )
                ).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Timeline */}
      {processes.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Process Timeline
          </h3>

          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Time scale */}
              <div className="flex border-b mb-2">
                <div className="w-32 flex-shrink-0"></div>
                <div className="flex-1 flex">
                  {Array.from({ length: Math.max(30, simulationTime + 5) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-8 flex-shrink-0 text-xs text-center text-slate-500"
                      >
                        {i}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Process timelines */}
              {processes.map((process) => (
                <div
                  key={process.id}
                  className="flex items-center mb-2 hover:bg-slate-50 rounded-lg p-1 cursor-pointer"
                  onClick={() => selectProcess(process.id)}
                >
                  <div className="w-32 flex-shrink-0 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: process.color }}
                    ></div>
                    <div className="text-sm font-medium truncate">
                      {process.name}
                    </div>
                  </div>
                  <div className="flex-1 flex">
                    {Array.from({
                      length: Math.max(30, simulationTime + 5),
                    }).map((_, i) => {
                      // Determine state at time i
                      let stateColor = "bg-white";
                      let tooltip = "";

                      // New state - before arrival
                      if (i < process.arrivalTime) {
                        stateColor = "bg-gray-100";
                        tooltip = "New";
                      }
                      // Process completed
                      else if (
                        process.completionTime !== null &&
                        i >= process.completionTime
                      ) {
                        stateColor = "bg-red-100";
                        tooltip = "Terminated";
                      }
                      // Determine from event log if process was in a specific state at time i
                      else {
                        const relevantEvents = eventLog.filter(
                          (event) =>
                            event.time <= i &&
                            event.message.includes(`Process ${process.id}`)
                        );

                        if (relevantEvents.length > 0) {
                          const lastEvent =
                            relevantEvents[relevantEvents.length - 1];

                          if (lastEvent.message.includes("started execution")) {
                            stateColor = "bg-green-300";
                            tooltip = "Running";
                          } else if (
                            lastEvent.message.includes("blocked for I/O") ||
                            lastEvent.message.includes("moved to Blocked queue")
                          ) {
                            stateColor = "bg-amber-300";
                            tooltip = "Blocked for I/O";
                          } else if (
                            lastEvent.message.includes(
                              "moved to Ready queue"
                            ) ||
                            lastEvent.message.includes(
                              "created and added to Ready queue"
                            )
                          ) {
                            stateColor = "bg-blue-300";
                            tooltip = "Ready";
                          } else if (
                            lastEvent.message.includes("completed execution")
                          ) {
                            stateColor = "bg-red-100";
                            tooltip = "Terminated";
                          }
                        }
                      }

                      return (
                        <div
                          key={i}
                          className={`w-8 h-6 flex-shrink-0 border-r border-white ${stateColor}`}
                          title={`Time ${i}: ${process.name} - ${tooltip}`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200"></div>
                  <span>New</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-300 border border-blue-200"></div>
                  <span>Ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-300 border border-green-200"></div>
                  <span>Running</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-300 border border-amber-200"></div>
                  <span>Blocked (I/O)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-200"></div>
                  <span>Terminated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concepts and Theory */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-800 mb-3">
          Process Management Concepts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Process Control Block (PCB)
            </h4>
            <p className="text-sm text-slate-600">
              A Process Control Block (PCB) is a data structure maintained by
              the operating system for every process. It contains all
              information needed to keep track of a process, including:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-slate-600">
              <li>Process ID and state</li>
              <li>Program counter (next instruction)</li>
              <li>CPU registers</li>
              <li>CPU scheduling information (priority)</li>
              <li>Memory management information</li>
              <li>I/O status information</li>
              <li>Accounting information</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Process States
            </h4>
            <p className="text-sm text-slate-600">
              During its execution, a process changes state according to its
              circumstances:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-slate-600">
              <li>
                <strong>New:</strong> The process is being created
              </li>
              <li>
                <strong>Ready:</strong> The process is waiting to be assigned to
                a processor
              </li>
              <li>
                <strong>Running:</strong> Instructions are being executed
              </li>
              <li>
                <strong>Blocked/Waiting:</strong> Process is waiting for some
                event to occur (e.g., I/O completion)
              </li>
              <li>
                <strong>Terminated:</strong> The process has finished execution
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Context Switch
            </h4>
            <p className="text-sm text-slate-600">
              A context switch occurs when the CPU switches from executing one
              process to another. This involves:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-slate-600">
              <li>
                Saving the state of the old process (registers, program counter,
                etc.)
              </li>
              <li>Loading the saved state for the new process</li>
              <li>Switching memory contexts</li>
            </ul>
            <p className="mt-2 text-sm text-slate-600">
              Context switches have overhead and can significantly impact system
              performance if they occur too frequently.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              CPU Scheduling
            </h4>
            <p className="text-sm text-slate-600">
              CPU scheduling determines which process in the ready queue is
              assigned to the CPU. Common algorithms include:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-slate-600">
              <li>
                <strong>FCFS (First-Come, First-Served):</strong> Processes are
                executed in the order they arrive
              </li>
              <li>
                <strong>SJF (Shortest Job First):</strong> Process with the
                shortest burst time is selected first
              </li>
              <li>
                <strong>Priority Scheduling:</strong> Process with highest
                priority is executed first
              </li>
              <li>
                <strong>Round Robin:</strong> Each process gets a small unit of
                CPU time, then is sent to the back of the queue
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessControlBlocks;
