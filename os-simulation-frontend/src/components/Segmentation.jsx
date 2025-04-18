// components/memory/Segmentation.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const Segmentation = () => {
  // State for the simulation
  const [memory, setMemory] = useState({
    size: 64, // in KB
    segments: [],
  });
  const [processes, setProcesses] = useState([]);
  const [nextProcessId, setNextProcessId] = useState(1);
  const [nextSegmentId, setNextSegmentId] = useState(1);
  const [error, setError] = useState(null);
  const [showTheory, setShowTheory] = useState(true);
  const [activeTab, setActiveTab] = useState("setup");
  const [memoryAccesses, setMemoryAccesses] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per step
  const [allocationAlgorithm, setAllocationAlgorithm] = useState("firstFit");

  // Additional state for tracking simulation metrics
  const [memoryUtilization, setMemoryUtilization] = useState(0);
  const [externalFragmentation, setExternalFragmentation] = useState(0);
  const [segmentFaults, setSegmentFaults] = useState(0);
  const [successfulAllocations, setSuccessfulAllocations] = useState(0);
  const [failedAllocations, setFailedAllocations] = useState(0);

  // Timer reference for simulation
  const simulationTimer = useRef(null);

  // Common segment types with default sizes
  const segmentTypes = [
    { name: "Code", defaultSize: 4 },
    { name: "Data", defaultSize: 8 },
    { name: "Stack", defaultSize: 2 },
    { name: "Heap", defaultSize: 6 },
  ];

  // Effect for controlling simulation
  useEffect(() => {
    if (simulationRunning && simulationStep < memoryAccesses.length) {
      simulationTimer.current = setTimeout(() => {
        setSimulationStep((prevStep) => prevStep + 1);
        processMemoryAccessEvent(memoryAccesses[simulationStep]);
      }, simulationSpeed);
    } else if (simulationStep >= memoryAccesses.length) {
      setSimulationRunning(false);
    }

    return () => {
      if (simulationTimer.current) {
        clearTimeout(simulationTimer.current);
      }
    };
  }, [
    simulationRunning,
    simulationStep,
    memoryAccesses.length,
    simulationSpeed,
  ]);

  // Handle adding a new process
  const handleAddProcess = () => {
    if (processes.length >= 6) {
      setError("Maximum of 6 processes allowed for visualization");
      return;
    }

    // Create segments for this process
    const processSegments = segmentTypes.map((type, index) => ({
      id: nextSegmentId + index,
      name: type.name,
      size: type.defaultSize,
      type: type.name.toLowerCase(),
    }));

    const newProcess = {
      id: nextProcessId,
      name: `Process ${nextProcessId}`,
      color: getProcessColor(nextProcessId),
      segments: processSegments,
      accessPattern: "sequential", // Default pattern
    };

    setProcesses([...processes, newProcess]);
    setNextProcessId(nextProcessId + 1);
    setNextSegmentId(nextSegmentId + processSegments.length);
    setError(null);
  };

  // Handle removing a process
  const handleRemoveProcess = (processId) => {
    // First, remove any segments of this process from memory
    const updatedMemory = { ...memory };
    updatedMemory.segments = updatedMemory.segments.filter((segment) => {
      return !processes.find(
        (p) =>
          p.id === processId &&
          p.segments.some((s) => s.id === segment.segmentId)
      );
    });

    // Then remove the process
    setProcesses(processes.filter((p) => p.id !== processId));
    setMemory(updatedMemory);
    setError(null);
  };

  // Handle changing process properties
  const handleProcessChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    updatedProcesses[index][field] = value;
    setProcesses(updatedProcesses);
    setError(null);
  };

  // Handle changing segment properties
  const handleSegmentChange = (processIndex, segmentIndex, field, value) => {
    const updatedProcesses = [...processes];

    if (field === "size") {
      // Validate size
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue <= 0) {
        setError("Segment size must be a positive number");
        return;
      }

      if (numValue > memory.size) {
        setError(`Segment size cannot exceed memory size (${memory.size} KB)`);
        return;
      }

      updatedProcesses[processIndex].segments[segmentIndex][field] = numValue;
    } else {
      updatedProcesses[processIndex].segments[segmentIndex][field] = value;
    }

    setProcesses(updatedProcesses);
    setError(null);
  };

  // Allocate memory for all segments
  const allocateMemory = () => {
    // Clear memory first
    const updatedMemory = { ...memory, segments: [] };

    // Track allocation metrics
    let successCount = 0;
    let failureCount = 0;

    // Try to allocate each process's segments
    for (const process of processes) {
      for (const segment of process.segments) {
        const allocation = findMemoryAllocation(
          updatedMemory,
          segment.size,
          allocationAlgorithm
        );

        if (allocation !== null) {
          // Successful allocation
          updatedMemory.segments.push({
            start: allocation,
            end: allocation + segment.size,
            size: segment.size,
            processId: process.id,
            segmentId: segment.id,
            name: segment.name,
            type: segment.type,
            color: process.color,
          });
          successCount++;
        } else {
          // Failed allocation
          failureCount++;
          setError(
            `Not enough contiguous memory to allocate segment "${segment.name}" of Process ${process.id}`
          );
        }
      }
    }

    // Calculate memory utilization and fragmentation
    const usedMemory = updatedMemory.segments.reduce(
      (total, segment) => total + segment.size,
      0
    );
    const utilization = (usedMemory / updatedMemory.size) * 100;

    // Calculate external fragmentation (free memory that's fragmented)
    const freeBlocks = findFreeMemoryBlocks(updatedMemory);
    const totalFreeMemory = freeBlocks.reduce(
      (total, block) => total + block.size,
      0
    );
    const largestFreeBlock =
      freeBlocks.length > 0
        ? Math.max(...freeBlocks.map((block) => block.size))
        : 0;
    const fragmentation =
      totalFreeMemory > 0
        ? ((totalFreeMemory - largestFreeBlock) / totalFreeMemory) * 100
        : 0;

    // Update state
    setMemory(updatedMemory);
    setMemoryUtilization(utilization);
    setExternalFragmentation(fragmentation);
    setSuccessfulAllocations(successCount);
    setFailedAllocations(failureCount);
  };

  // Clear all memory allocations
  const clearMemory = () => {
    setMemory({ ...memory, segments: [] });
    setError(null);
  };

  // Find memory allocation based on algorithm
  const findMemoryAllocation = (memory, size, algorithm) => {
    // Find all free memory blocks
    const freeBlocks = findFreeMemoryBlocks(memory);

    if (freeBlocks.length === 0) {
      return null; // No free memory
    }

    let selectedBlock = null;

    switch (algorithm) {
      case "firstFit":
        // Return the first block that fits
        selectedBlock = freeBlocks.find((block) => block.size >= size);
        break;

      case "bestFit":
        // Return the smallest block that fits
        freeBlocks.sort((a, b) => a.size - b.size);
        selectedBlock = freeBlocks.find((block) => block.size >= size);
        break;

      case "worstFit":
        // Return the largest block
        freeBlocks.sort((a, b) => b.size - a.size);
        selectedBlock = freeBlocks.find((block) => block.size >= size);
        break;

      default:
        // Default to first fit
        selectedBlock = freeBlocks.find((block) => block.size >= size);
    }

    return selectedBlock ? selectedBlock.start : null;
  };

  // Find all free memory blocks
  const findFreeMemoryBlocks = (memory) => {
    const freeBlocks = [];
    const sortedSegments = [...memory.segments].sort(
      (a, b) => a.start - b.start
    );

    // Check if there's space at the beginning
    if (sortedSegments.length === 0 || sortedSegments[0].start > 0) {
      const startPos = 0;
      const endPos =
        sortedSegments.length > 0 ? sortedSegments[0].start : memory.size;
      freeBlocks.push({
        start: startPos,
        end: endPos,
        size: endPos - startPos,
      });
    }

    // Check spaces between segments
    for (let i = 0; i < sortedSegments.length - 1; i++) {
      const currentEnd = sortedSegments[i].end;
      const nextStart = sortedSegments[i + 1].start;

      if (nextStart > currentEnd) {
        freeBlocks.push({
          start: currentEnd,
          end: nextStart,
          size: nextStart - currentEnd,
        });
      }
    }

    // Check if there's space at the end
    if (
      sortedSegments.length > 0 &&
      sortedSegments[sortedSegments.length - 1].end < memory.size
    ) {
      const startPos = sortedSegments[sortedSegments.length - 1].end;
      const endPos = memory.size;
      freeBlocks.push({
        start: startPos,
        end: endPos,
        size: endPos - startPos,
      });
    }

    return freeBlocks;
  };

  // Start simulation
  const startSimulation = () => {
    if (memory.segments.length === 0) {
      setError("Allocate memory first before starting the simulation");
      return;
    }

    // Generate memory access patterns
    const accesses = generateMemoryAccesses();
    if (accesses.length === 0) {
      setError("Failed to generate memory accesses");
      return;
    }

    setMemoryAccesses(accesses);
    resetSimulation();
    setActiveTab("simulation");
    setSimulationRunning(true);
  };

  // Reset simulation
  const resetSimulation = () => {
    setSimulationRunning(false);
    setSimulationStep(0);
    setSegmentFaults(0);
    setError(null);
  };

  // Toggle simulation pause/play
  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };

  // Go to specific simulation step
  const goToStep = (step) => {
    if (step < 0) step = 0;
    if (step > memoryAccesses.length) step = memoryAccesses.length;

    setSimulationStep(step);

    // Recalculate state up to this step
    let faultCount = 0;

    for (let i = 0; i < step; i++) {
      const access = memoryAccesses[i];
      const segment = memory.segments.find(
        (s) => s.segmentId === access.segmentId
      );

      if (!segment) {
        faultCount++;
      }
    }

    setSegmentFaults(faultCount);
  };

  // Generate memory access events
  const generateMemoryAccesses = () => {
    const accesses = [];

    processes.forEach((process) => {
      // Get all segments for this process that are allocated in memory
      const allocatedSegments = memory.segments.filter(
        (seg) => seg.processId === process.id
      );

      if (allocatedSegments.length === 0) {
        return; // Skip if no segments allocated
      }

      // Generate different access patterns
      switch (process.accessPattern) {
        case "sequential":
          // Sequential access through all segments
          for (const segment of allocatedSegments) {
            const processSegment = process.segments.find(
              (s) => s.id === segment.segmentId
            );
            const segmentName = processSegment
              ? processSegment.name
              : "Unknown";

            accesses.push({
              processId: process.id,
              segmentId: segment.segmentId,
              offset: 0, // Start of segment
              description: `${process.name} accesses ${segmentName} segment (start)`,
            });

            accesses.push({
              processId: process.id,
              segmentId: segment.segmentId,
              offset: Math.floor(segment.size / 2), // Middle of segment
              description: `${process.name} accesses ${segmentName} segment (middle)`,
            });

            accesses.push({
              processId: process.id,
              segmentId: segment.segmentId,
              offset: segment.size - 1, // End of segment
              description: `${process.name} accesses ${segmentName} segment (end)`,
            });
          }
          break;

        case "random":
          // Random access to segments
          for (let i = 0; i < Math.min(allocatedSegments.length * 3, 15); i++) {
            const randomSegment =
              allocatedSegments[
                Math.floor(Math.random() * allocatedSegments.length)
              ];
            const randomOffset = Math.floor(Math.random() * randomSegment.size);
            const processSegment = process.segments.find(
              (s) => s.id === randomSegment.segmentId
            );
            const segmentName = processSegment
              ? processSegment.name
              : "Unknown";

            accesses.push({
              processId: process.id,
              segmentId: randomSegment.segmentId,
              offset: randomOffset,
              description: `${process.name} randomly accesses ${segmentName} segment at offset ${randomOffset}`,
            });
          }
          break;

        case "focused":
          // Focused access to specific segments (e.g., mostly code and stack)
          const codeSegment = allocatedSegments.find((s) => {
            const processSegment = process.segments.find(
              (ps) => ps.id === s.segmentId
            );
            return processSegment && processSegment.type === "code";
          });

          const stackSegment = allocatedSegments.find((s) => {
            const processSegment = process.segments.find(
              (ps) => ps.id === s.segmentId
            );
            return processSegment && processSegment.type === "stack";
          });

          // Access code segment frequently
          if (codeSegment) {
            for (let i = 0; i < 5; i++) {
              const offset = Math.floor(Math.random() * codeSegment.size);
              accesses.push({
                processId: process.id,
                segmentId: codeSegment.segmentId,
                offset,
                description: `${process.name} accesses Code segment at offset ${offset}`,
              });
            }
          }

          // Access stack segment frequently
          if (stackSegment) {
            for (let i = 0; i < 5; i++) {
              const offset = Math.floor(Math.random() * stackSegment.size);
              accesses.push({
                processId: process.id,
                segmentId: stackSegment.segmentId,
                offset,
                description: `${process.name} accesses Stack segment at offset ${offset}`,
              });
            }
          }

          // Occasionally access other segments
          for (const segment of allocatedSegments) {
            if (segment !== codeSegment && segment !== stackSegment) {
              const processSegment = process.segments.find(
                (s) => s.id === segment.segmentId
              );
              const segmentName = processSegment
                ? processSegment.name
                : "Unknown";

              accesses.push({
                processId: process.id,
                segmentId: segment.segmentId,
                offset: Math.floor(Math.random() * segment.size),
                description: `${process.name} occasionally accesses ${segmentName} segment`,
              });
            }
          }
          break;

        default:
          // Default to sequential
          for (const segment of allocatedSegments) {
            const processSegment = process.segments.find(
              (s) => s.id === segment.segmentId
            );
            const segmentName = processSegment
              ? processSegment.name
              : "Unknown";

            accesses.push({
              processId: process.id,
              segmentId: segment.segmentId,
              offset: Math.floor(segment.size / 2),
              description: `${process.name} accesses ${segmentName} segment`,
            });
          }
      }
    });

    // Shuffle accesses to interleave between processes
    for (let i = accesses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [accesses[i], accesses[j]] = [accesses[j], accesses[i]];
    }

    return accesses;
  };

  // Process a memory access event
  const processMemoryAccessEvent = (access) => {
    if (!access) return;

    // Check if segment is in memory
    const segment = memory.segments.find(
      (s) => s.segmentId === access.segmentId
    );

    if (!segment) {
      // Segment fault
      setSegmentFaults((prev) => prev + 1);
    }

    // No need to update memory state in this simulation
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
    ];

    return colors[(id - 1) % colors.length];
  };

  // Render memory visualization
  const renderMemoryVisualization = () => {
    // Calculate memory blocks (allocated and free)
    const allBlocks = [];

    // Add allocated segments
    memory.segments.forEach((segment) => {
      allBlocks.push({
        start: segment.start,
        end: segment.end,
        size: segment.size,
        type: "allocated",
        data: segment,
      });
    });

    // Add free blocks
    findFreeMemoryBlocks(memory).forEach((freeBlock) => {
      allBlocks.push({
        start: freeBlock.start,
        end: freeBlock.end,
        size: freeBlock.size,
        type: "free",
      });
    });

    // Sort blocks by start position
    allBlocks.sort((a, b) => a.start - b.start);

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Memory Map (Total: {memory.size} KB)
        </div>
        <div className="p-3">
          <div className="relative h-20 bg-slate-100 rounded-lg overflow-hidden">
            {allBlocks.map((block, index) => {
              const widthPercent = (block.size / memory.size) * 100;
              const startPercent = (block.start / memory.size) * 100;

              return (
                <div
                  key={index}
                  className={`absolute top-0 h-full ${
                    block.type === "free" ? "bg-slate-200" : ""
                  }`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor:
                      block.type === "allocated" ? `${block.data.color}` : "",
                    opacity: block.type === "allocated" ? 0.7 : 0.3,
                    borderLeft: index > 0 ? "1px dashed #CBD5E0" : "none",
                  }}
                >
                  {block.type === "allocated" && widthPercent > 5 && (
                    <div className="text-xs font-medium text-center text-slate-800 truncate p-1">
                      {block.data.name}
                    </div>
                  )}
                  {block.type === "free" && widthPercent > 5 && (
                    <div className="text-xs font-medium text-center text-slate-500 truncate p-1">
                      Free ({block.size} KB)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Memory scale */}
          <div className="relative h-6 mt-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const position = (i * 25) / 100;

              return (
                <div
                  key={i}
                  className="absolute top-0 h-full"
                  style={{ left: `${i * 25}%` }}
                >
                  <div className="h-2 border-l border-slate-400"></div>
                  <div className="text-xs text-slate-500">
                    {Math.round(position * memory.size)} KB
                  </div>
                </div>
              );
            })}

            {/* End marker */}
            <div className="absolute top-0 h-full" style={{ left: "100%" }}>
              <div className="h-2 border-l border-slate-400"></div>
              <div className="text-xs text-slate-500 transform -translate-x-6">
                {memory.size} KB
              </div>
            </div>
          </div>

          {/* Memory statistics */}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-blue-600">Memory Utilization</div>
              <div className="font-medium text-blue-900">
                {memoryUtilization.toFixed(1)}%
              </div>
            </div>

            <div className="bg-amber-50 p-2 rounded">
              <div className="text-xs text-amber-600">
                External Fragmentation
              </div>
              <div className="font-medium text-amber-900">
                {externalFragmentation.toFixed(1)}%
              </div>
            </div>

            <div className="bg-green-50 p-2 rounded">
              <div className="text-xs text-green-600">
                Successful Allocations
              </div>
              <div className="font-medium text-green-900">
                {successfulAllocations}
              </div>
            </div>

            <div className="bg-red-50 p-2 rounded">
              <div className="text-xs text-red-600">Failed Allocations</div>
              <div className="font-medium text-red-900">
                {failedAllocations}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render segment table
  const renderSegmentTable = () => {
    // Group segments by process
    const segmentsByProcess = {};

    memory.segments.forEach((segment) => {
      if (!segmentsByProcess[segment.processId]) {
        segmentsByProcess[segment.processId] = [];
      }

      segmentsByProcess[segment.processId].push(segment);
    });

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Segment Table
        </div>
        <div className="p-3">
          {Object.keys(segmentsByProcess).length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              No segments allocated yet.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(segmentsByProcess).map(
                ([processId, segments]) => {
                  const process = processes.find(
                    (p) => p.id === parseInt(processId)
                  );

                  return (
                    <div
                      key={processId}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-2 font-medium text-white flex items-center gap-2"
                        style={{
                          backgroundColor: process ? process.color : "#888888",
                        }}
                      >
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        {process ? process.name : `Process ${processId}`}
                      </div>
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                              Segment
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                              Base
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                              Limit
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                              Size (KB)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {segments.map((segment) => (
                            <tr
                              key={segment.segmentId}
                              className="hover:bg-slate-50"
                            >
                              <td className="px-3 py-2 text-sm text-slate-800">
                                {segment.name}
                              </td>
                              <td className="px-3 py-2 text-sm font-mono text-slate-600">
                                {segment.start}
                              </td>
                              <td className="px-3 py-2 text-sm font-mono text-slate-600">
                                {segment.size}
                              </td>
                              <td className="px-3 py-2 text-sm text-slate-600">
                                {segment.size}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render memory access animation
  const renderMemoryAccessAnimation = () => {
    if (simulationStep === 0 || simulationStep > memoryAccesses.length) {
      return null;
    }

    const currentAccess = memoryAccesses[simulationStep - 1];
    const process = processes.find((p) => p.id === currentAccess.processId);
    const processSegment = process
      ? process.segments.find((s) => s.id === currentAccess.segmentId)
      : null;
    const segmentName = processSegment ? processSegment.name : "Unknown";
    const memorySegment = memory.segments.find(
      (s) => s.segmentId === currentAccess.segmentId
    );

    return (
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Current Memory Access (Step {simulationStep} of{" "}
          {memoryAccesses.length})
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: process ? process.color : "#888888" }}
            ></span>
            <span className="font-medium">{currentAccess.description}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Logical Address
              </div>
              <div className="flex items-center justify-center gap-1 text-center">
                <div className="bg-blue-100 p-2 rounded text-blue-800 font-mono">
                  Segment: {segmentName}
                </div>
                <div className="p-2">+</div>
                <div className="bg-green-100 p-2 rounded text-green-800 font-mono">
                  Offset: {currentAccess.offset}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Memory Access Result
              </div>
              <div className="text-center">
                {memorySegment ? (
                  <div className="text-green-600 font-medium">Valid Access</div>
                ) : (
                  <div className="text-red-600 font-medium">Segment Fault</div>
                )}
              </div>
              {memorySegment && currentAccess.offset >= memorySegment.size && (
                <div className="text-center text-red-600 mt-1 text-sm">
                  Offset exceeds segment limit!
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Physical Address
              </div>
              {memorySegment && currentAccess.offset < memorySegment.size ? (
                <div className="flex items-center justify-center gap-1 text-center">
                  <div className="bg-purple-100 p-2 rounded text-purple-800 font-mono">
                    Base: {memorySegment.start}
                  </div>
                  <div className="p-2">+</div>
                  <div className="bg-green-100 p-2 rounded text-green-800 font-mono">
                    Offset: {currentAccess.offset}
                  </div>
                  <div className="p-2">=</div>
                  <div className="bg-indigo-100 p-2 rounded text-indigo-800 font-mono">
                    {memorySegment.start + currentAccess.offset}
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-600">
                  Invalid access - segment fault
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render simulation statistics
  const renderStatistics = () => {
    if (simulationStep === 0) return null;

    const totalAccesses = simulationStep;
    const validAccesses = totalAccesses - segmentFaults;
    const successRate = (validAccesses / totalAccesses) * 100;

    return (
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-100 p-3 font-medium text-slate-800 border-b">
          Simulation Statistics
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-700 mb-1">Total Accesses</div>
              <div className="text-xl font-bold text-blue-900">
                {totalAccesses}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-sm text-green-700 mb-1">Valid Accesses</div>
              <div className="text-xl font-bold text-green-900">
                {validAccesses}
              </div>
              <div className="text-xs text-green-600">
                {successRate.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-sm text-red-700 mb-1">Segment Faults</div>
              <div className="text-xl font-bold text-red-900">
                {segmentFaults}
              </div>
              <div className="text-xs text-red-600">
                {(100 - successRate).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-sm text-purple-700 mb-1">
                Memory Utilization
              </div>
              <div className="text-xl font-bold text-purple-900">
                {memoryUtilization.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Segmentation - Memory Management Visualization
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
            How Segmentation Works
          </h2>
          <div className="space-y-2 text-blue-900">
            <p>
              Segmentation is a memory management scheme that supports the
              user's view of memory. Instead of having one single linear address
              space, a program is divided into segments, where each segment
              represents a logical grouping of information such as code, data,
              stack, etc.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Each segment has a <b>name</b> and a <b>length</b>.
              </li>
              <li>
                Logical addresses consist of a <b>segment name/number</b> and an{" "}
                <b>offset</b> within that segment.
              </li>
              <li>
                A <b>segment table</b> maps segments to physical memory
                locations using <b>base</b> (starting address) and <b>limit</b>{" "}
                (length) registers.
              </li>
              <li>
                Segments can have different sizes and may grow or shrink during
                execution.
              </li>
              <li>
                A <b>segment fault</b> occurs when a program references an
                undefined segment or exceeds a segment's boundaries.
              </li>
              <li>
                Segmentation suffers from <b>external fragmentation</b> when
                free memory is divided into small pieces that can't be used
                efficiently.
              </li>
            </ul>
            <p className="mt-2">
              In this visualization, you can create processes with different
              segments, allocate them in memory using various strategies, and
              observe how segmentation handles logical-to-physical address
              translation.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-4 py-2 ${
              activeTab === "setup"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-slate-600"
            }`}
          >
            Memory Setup
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-4 py-2 ${
              activeTab === "simulation"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-slate-600"
            }`}
            disabled={memory.segments.length === 0}
          >
            Simulation
          </button>
        </div>
      </div>

      {activeTab === "setup" ? (
        <div className="space-y-6">
          {/* Memory Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Memory Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Memory Size (KB)
                </label>
                <select
                  value={memory.size}
                  onChange={(e) =>
                    setMemory({ ...memory, size: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="32">32 KB</option>
                  <option value="64">64 KB</option>
                  <option value="128">128 KB</option>
                  <option value="256">256 KB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Allocation Algorithm
                </label>
                <select
                  value={allocationAlgorithm}
                  onChange={(e) => setAllocationAlgorithm(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="firstFit">First Fit</option>
                  <option value="bestFit">Best Fit</option>
                  <option value="worstFit">Worst Fit</option>
                </select>
                <div className="text-xs text-slate-500 mt-1">
                  {allocationAlgorithm === "firstFit" &&
                    "Allocates in the first block that fits the segment"}
                  {allocationAlgorithm === "bestFit" &&
                    "Allocates in the smallest block that fits the segment"}
                  {allocationAlgorithm === "worstFit" &&
                    "Allocates in the largest block available"}
                </div>
              </div>
            </div>
          </div>

          {/* Process Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Processes & Segments
              </h2>
              <button
                onClick={handleAddProcess}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Add Process
              </button>
            </div>

            {processes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                No processes added yet. Click "Add Process" to begin.
              </div>
            ) : (
              <div className="space-y-6">
                {processes.map((process, processIndex) => (
                  <div
                    key={process.id}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: process.color }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: process.color }}
                        ></div>
                        <h3 className="font-medium text-slate-800">
                          {process.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleRemoveProcess(process.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Process Name
                        </label>
                        <input
                          type="text"
                          value={process.name}
                          onChange={(e) =>
                            handleProcessChange(
                              processIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Access Pattern
                        </label>
                        <select
                          value={process.accessPattern}
                          onChange={(e) =>
                            handleProcessChange(
                              processIndex,
                              "accessPattern",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="sequential">Sequential</option>
                          <option value="random">Random</option>
                          <option value="focused">
                            Focused (Code & Stack)
                          </option>
                        </select>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Segments
                    </h4>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {process.segments.map((segment, segmentIndex) => (
                          <div
                            key={segment.id}
                            className="border border-slate-200 rounded bg-white p-3"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-slate-700">
                                {segment.name}
                              </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">
                                  Size (KB)
                                </label>
                                <input
                                  type="number"
                                  value={segment.size}
                                  onChange={(e) =>
                                    handleSegmentChange(
                                      processIndex,
                                      segmentIndex,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs text-slate-500 mb-1">
                                  Type
                                </label>
                                <input
                                  type="text"
                                  value={segment.type}
                                  disabled
                                  className="w-full p-1 text-sm border border-slate-200 rounded-md bg-slate-50"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Memory Actions */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Memory Actions
            </h2>

            <div className="flex gap-4">
              <button
                onClick={allocateMemory}
                disabled={processes.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Allocate Memory
              </button>

              <button
                onClick={clearMemory}
                disabled={memory.segments.length === 0}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Clear Memory
              </button>
            </div>
          </div>

          {/* Memory Visualization */}
          {renderMemoryVisualization()}

          {/* Segment Table */}
          {memory.segments.length > 0 && (
            <div className="mt-6">{renderSegmentTable()}</div>
          )}

          {memory.segments.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={startSimulation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Start Simulation
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Simulation Controls */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-lg text-white ${
                  simulationRunning
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {simulationRunning ? (
                  <div className="flex items-center gap-1">
                    <Pause className="w-4 h-4" /> Pause
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" /> Play
                  </div>
                )}
              </button>

              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>

              <div className="flex items-center gap-2 ml-auto">
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
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Step 0</span>
                <span>Step {memoryAccesses.length}</span>
              </div>
              <input
                type="range"
                min="0"
                max={memoryAccesses.length}
                value={simulationStep}
                onChange={(e) => goToStep(Number(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-center text-sm text-slate-700 mt-1">
                Current Step: {simulationStep} / {memoryAccesses.length}
              </div>
            </div>
          </div>

          {/* Current Memory Access */}
          {renderMemoryAccessAnimation()}

          {/* Statistics */}
          {renderStatistics()}

          {/* Memory Visualization */}
          {renderMemoryVisualization()}

          {/* Segment Table */}
          <div className="mt-6">{renderSegmentTable()}</div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab("setup")}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Back to Setup
            </button>
          </div>
        </div>
      )}

      {/* AI Explanation Panel */}
      <div className="mt-8 bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-700" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Explanation</h2>
        </div>

        {activeTab === "setup" ? (
          <div className="prose prose-slate max-w-none">
            {memory.segments.length === 0 ? (
              <>
                <p>
                  Welcome to the Segmentation Memory Management visualization!
                  This interactive tool helps you understand how segmentation
                  works in operating systems.
                </p>
                <p>
                  <strong>To get started:</strong>
                </p>
                <ol>
                  <li>Configure your memory size and allocation algorithm</li>
                  <li>
                    Add processes with different segments using the "Add
                    Process" button
                  </li>
                  <li>
                    Each process automatically gets segments for code, data,
                    stack, and heap
                  </li>
                  <li>
                    Adjust the size of each segment according to your needs
                  </li>
                  <li>
                    Click "Allocate Memory" to see how segments are placed in
                    memory
                  </li>
                </ol>
                <p>
                  Watch how different allocation algorithms (First Fit, Best
                  Fit, Worst Fit) affect memory utilization and external
                  fragmentation. Once you've allocated memory, you can start the
                  simulation to observe memory accesses and address translation.
                </p>
              </>
            ) : (
              <>
                <p>
                  Your memory has been allocated using the{" "}
                  <strong>
                    {allocationAlgorithm === "firstFit"
                      ? "First Fit"
                      : allocationAlgorithm === "bestFit"
                      ? "Best Fit"
                      : "Worst Fit"}
                  </strong>{" "}
                  algorithm.
                </p>
                <p>The visualization above shows:</p>
                <ul>
                  <li>
                    <strong>Memory Map:</strong> Colored blocks represent
                    allocated segments, while gray areas show free memory
                  </li>
                  <li>
                    <strong>Memory Utilization:</strong>{" "}
                    {memoryUtilization.toFixed(1)}% of total memory is currently
                    in use
                  </li>
                  <li>
                    <strong>External Fragmentation:</strong>{" "}
                    {externalFragmentation.toFixed(1)}% of memory is wasted due
                    to fragmentation
                  </li>
                  <li>
                    <strong>Segment Table:</strong> Shows base address and limit
                    for each process segment
                  </li>
                </ul>
                <p>
                  In segmentation, logical addresses consist of a{" "}
                  <em>segment number</em> and an <em>offset</em>. The segment
                  table is used to translate these logical addresses to physical
                  addresses by adding the segment's base address to the offset.
                </p>
                <p>
                  When you switch to the Simulation tab, you can observe memory
                  accesses and see how logical-to-physical address translation
                  works in real-time.
                </p>
                <h3 className="text-lg font-medium mt-4 mb-2">
                  Key Features of Segmentation
                </h3>
                <ul>
                  <li>
                    <strong>Supports User View:</strong> Memory is organized by
                    logical purpose (code, data, stack) rather than fixed-size
                    blocks
                  </li>
                  <li>
                    <strong>Variable Size:</strong> Segments can be different
                    sizes based on their purpose
                  </li>
                  <li>
                    <strong>Dynamic Growth:</strong> Segments like stack and
                    heap can grow as needed (not shown in this simulation)
                  </li>
                  <li>
                    <strong>Protection:</strong> Each segment has access
                    permissions (read, write, execute)
                  </li>
                  <li>
                    <strong>Sharing:</strong> Segments like code can be shared
                    between processes
                  </li>
                </ul>
                <p>
                  The main disadvantage of segmentation is{" "}
                  <strong>external fragmentation</strong>, which occurs when
                  free memory is divided into small pieces that can't be used
                  efficiently. This is why memory compaction or more
                  sophisticated memory management techniques like paging are
                  often used in modern systems.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            {simulationStep <= memoryAccesses.length ? (
              <>
                <p>
                  <strong>Current Situation:</strong>{" "}
                  {memoryAccesses[simulationStep - 1]?.description}
                </p>
                <p>
                  When a process accesses a memory location, the system needs to
                  translate the logical address (segment + offset) to a physical
                  address. This is done using the segment table entries.
                </p>
                {simulationStep > 0 &&
                  memoryAccesses[simulationStep - 1] &&
                  (() => {
                    const currentAccess = memoryAccesses[simulationStep - 1];
                    const process = processes.find(
                      (p) => p.id === currentAccess.processId
                    );
                    const processSegment = process
                      ? process.segments.find(
                          (s) => s.id === currentAccess.segmentId
                        )
                      : null;
                    const segmentName = processSegment
                      ? processSegment.name
                      : "Unknown";
                    const memorySegment = memory.segments.find(
                      (s) => s.segmentId === currentAccess.segmentId
                    );

                    if (!memorySegment) {
                      return (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <p>
                            <strong>Segment Fault Detected:</strong> The
                            requested segment is not currently in memory. This
                            is a severe error in segmentation.
                          </p>
                          <p>
                            Unlike paging, where page faults are a normal part
                            of virtual memory operation, a segment fault in
                            segmentation typically represents a program error or
                            an attempt to access memory that doesn't belong to
                            the process.
                          </p>
                        </div>
                      );
                    } else if (currentAccess.offset >= memorySegment.size) {
                      return (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <p>
                            <strong>Segment Fault Detected:</strong> The offset
                            ({currentAccess.offset}) exceeds the segment limit (
                            {memorySegment.size}).
                          </p>
                          <p>
                            This is a protection feature of segmentation. When a
                            process tries to access memory beyond the end of a
                            segment, the hardware generates a segment fault,
                            which typically results in the process being
                            terminated.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p>
                            <strong>Valid Memory Access:</strong> The system
                            successfully translates the logical address to
                            physical address.
                          </p>
                          <p>
                            <strong>Translation process:</strong>
                          </p>
                          <ol>
                            <li>
                              Logical address: Segment{" "}
                              <strong>{segmentName}</strong>, Offset{" "}
                              <strong>{currentAccess.offset}</strong>
                            </li>
                            <li>
                              Look up segment in segment table: Base ={" "}
                              <strong>{memorySegment.start}</strong>, Limit ={" "}
                              <strong>{memorySegment.size}</strong>
                            </li>
                            <li>
                              Check if offset is valid:{" "}
                              <strong>{currentAccess.offset}</strong> &lt;{" "}
                              <strong>{memorySegment.size}</strong> ✓
                            </li>
                            <li>
                              Calculate physical address:{" "}
                              <strong>{memorySegment.start}</strong> +{" "}
                              <strong>{currentAccess.offset}</strong> ={" "}
                              <strong>
                                {memorySegment.start + currentAccess.offset}
                              </strong>
                            </li>
                          </ol>
                        </div>
                      );
                    }
                  })()}

                <h3>Memory Management Analysis</h3>
                <p>
                  After {simulationStep} memory accesses, we've seen{" "}
                  {segmentFaults} segment faults.
                  {segmentFaults > 0
                    ? " These faults indicate either programming errors or allocation issues where the process is trying to access memory that wasn't properly allocated."
                    : " The absence of segment faults suggests the program is correctly accessing only allocated memory within segment boundaries."}
                </p>

                <p>
                  The current memory utilization is{" "}
                  {memoryUtilization.toFixed(1)}% with{" "}
                  {externalFragmentation.toFixed(1)}% external fragmentation.
                  {externalFragmentation > 20
                    ? " This relatively high fragmentation demonstrates one of the key challenges with segmentation-based memory management."
                    : " The fragmentation is currently at a reasonable level, but could increase as segments are allocated and deallocated over time."}
                </p>
              </>
            ) : (
              <div>
                <p>
                  <strong>Simulation Complete!</strong>
                </p>
                <p>
                  This simulation has demonstrated how segmentation allows
                  operating systems to:
                </p>
                <ul>
                  <li>
                    Allocate memory in variable-sized segments based on logical
                    function
                  </li>
                  <li>Protect memory through bounds checking on each access</li>
                  <li>Translate logical addresses to physical addresses</li>
                  <li>Handle segment faults when invalid accesses occur</li>
                </ul>

                <h3>Final Performance Statistics</h3>
                <p>
                  Total Accesses: {memoryAccesses.length}
                  <br />
                  Valid Accesses: {memoryAccesses.length - segmentFaults} (
                  {(
                    ((memoryAccesses.length - segmentFaults) /
                      memoryAccesses.length) *
                    100
                  ).toFixed(1)}
                  %)
                  <br />
                  Segment Faults: {segmentFaults} (
                  {((segmentFaults / memoryAccesses.length) * 100).toFixed(1)}%)
                </p>

                <p>
                  <strong>Memory Utilization:</strong>{" "}
                  {memoryUtilization.toFixed(1)}%
                  <br />
                  <strong>External Fragmentation:</strong>{" "}
                  {externalFragmentation.toFixed(1)}%
                </p>

                <h3>Segmentation vs. Paging</h3>
                <p>
                  Segmentation organizes memory according to the logical
                  structure of programs, while paging divides memory into
                  fixed-size pages. Modern systems often use a hybrid approach
                  called paged segmentation, combining the logical organization
                  of segmentation with the efficient memory management of
                  paging.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="font-medium">Segmentation Advantages:</p>
                    <ul className="text-sm">
                      <li>Supports programmer's view of memory</li>
                      <li>Variable-sized segments match program needs</li>
                      <li>Easy sharing of code segments</li>
                      <li>Strong protection between segments</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="font-medium">Paging Advantages:</p>
                    <ul className="text-sm">
                      <li>No external fragmentation</li>
                      <li>Simpler allocation algorithms</li>
                      <li>Efficient virtual memory implementation</li>
                      <li>Better memory utilization</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Segmentation;
