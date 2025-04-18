// // utils/createExecutionTimeline.js

// /**
//  * Creates a step-by-step execution timeline from algorithm results
//  * @param {Object} result - The algorithm execution result
//  * @param {string} algorithmType - The type of algorithm (FCFS, SJF, SRTF, RR, PS)
//  * @returns {Array} The execution timeline steps
//  */
// export function createExecutionTimeline(result, algorithmType) {
//   if (!result || !result.timeline) return [];

//   const timeline = [];
//   const processList = {};

//   // Sort timeline events by start time
//   const sortedEvents = [...result.timeline].sort(
//     (a, b) => a.startTime - b.startTime
//   );

//   // Initialize remaining times from the original processes
//   if (Array.isArray(result.schedule)) {
//     result.schedule.forEach((process) => {
//       const burstTime = process.turnaroundTime - process.waitingTime;
//       processList[process.processId] = {
//         id: process.processId,
//         arrivalTime: process.startTime - burstTime,
//         burstTime: burstTime,
//         remainingTime: burstTime,
//         priority: process.priority,
//         queuePriority: process.queuePriority,
//       };
//     });
//   }

//   let lastProcessId = null;

//   // Process arrival events
//   for (const process of Object.values(processList)) {
//     timeline.push({
//       time: process.arrivalTime,
//       event: `Process ${process.id} arrives`,
//       process: null,
//       remainingTimes: Object.fromEntries(
//         Object.values(processList)
//           .filter((p) => p.arrivalTime <= process.arrivalTime)
//           .map((p) => [p.id, p.remainingTime])
//       ),
//       isContextSwitch: false,
//     });
//   }

//   // Process execution events
//   for (const event of sortedEvents) {
//     const duration = event.endTime - event.startTime;
//     const processId = event.processId;

//     // If this is a context switch (only for preemptive algorithms)
//     if (
//       lastProcessId !== null &&
//       lastProcessId !== processId &&
//       ["SRTF", "RR"].includes(algorithmType)
//     ) {
//       timeline.push({
//         time: event.startTime,
//         event: `Switch from Process ${lastProcessId} to Process ${processId}`,
//         process: processId,
//         remainingTimes: Object.fromEntries(
//           Object.values(processList)
//             .filter((p) => p.arrivalTime <= event.startTime)
//             .map((p) => [p.id, p.remainingTime])
//         ),
//         isContextSwitch: true,
//       });
//     }

//     // If this is the first execution of the process or after context switch
//     if (lastProcessId !== processId) {
//       let eventText = "";

//       if (lastProcessId === null) {
//         eventText = `Process ${processId} starts execution`;
//       } else if (["SRTF", "RR"].includes(algorithmType)) {
//         eventText = `Process ${processId} ${
//           lastProcessId === processId ? "continues" : "starts"
//         } execution`;
//       } else {
//         eventText = `Process ${processId} executes`;
//       }

//       // Add algorithm-specific details
//       if (
//         algorithmType === "PS" &&
//         processList[processId]?.priority !== undefined
//       ) {
//         eventText += ` (Priority: ${processList[processId].priority})`;
//       } else if (
//         algorithmType === "MLQ" &&
//         processList[processId]?.queuePriority !== undefined
//       ) {
//         eventText += ` (Queue: ${processList[processId].queuePriority})`;
//       }

//       timeline.push({
//         time: event.startTime,
//         event: eventText,
//         process: processId,
//         remainingTimes: Object.fromEntries(
//           Object.values(processList)
//             .filter((p) => p.arrivalTime <= event.startTime)
//             .map((p) => [p.id, p.remainingTime])
//         ),
//         isContextSwitch: false,
//       });
//     }

//     // Update remaining time
//     if (processList[processId]) {
//       processList[processId].remainingTime -= duration;
//     }

//     // If process completes
//     if (processList[processId] && processList[processId].remainingTime === 0) {
//       timeline.push({
//         time: event.endTime,
//         event: `Process ${processId} completes`,
//         process: null,
//         remainingTimes: Object.fromEntries(
//           Object.values(processList)
//             .filter((p) => p.arrivalTime <= event.endTime && p.id !== processId)
//             .map((p) => [p.id, p.remainingTime])
//         ),
//         isContextSwitch: false,
//       });
//     }

//     lastProcessId = processId;
//   }

//   // Sort all events by time
//   timeline.sort((a, b) => {
//     // First sort by time
//     const timeComparison = a.time - b.time;
//     if (timeComparison !== 0) return timeComparison;

//     // Then prioritize arrivals before executions before completions
//     const eventTypeOrder = {
//       arrives: 0,
//       starts: 1,
//       continues: 1,
//       executes: 1,
//       Switch: 2,
//       completes: 3,
//     };

//     const getEventType = (event) => {
//       for (const type of Object.keys(eventTypeOrder)) {
//         if (event.includes(type)) return type;
//       }
//       return event;
//     };

//     return (
//       eventTypeOrder[getEventType(a.event)] -
//       eventTypeOrder[getEventType(b.event)]
//     );
//   });

//   return timeline;
// }
// utils/createExecutionTimeline.js

/**
 * Creates a step-by-step execution timeline from algorithm results
 * @param {Object} result - The algorithm execution result
 * @param {string} algorithmType - The type of algorithm (FCFS, SJF, SRTF, RR, PS)
 * @returns {Array} The execution timeline steps
 */
export function createExecutionTimeline(result, algorithmType) {
  // Enhanced validation to ensure we have valid timeline data
  if (
    !result ||
    !result.timeline ||
    !Array.isArray(result.timeline) ||
    result.timeline.length === 0
  ) {
    console.warn("Invalid or missing timeline data");
    return [];
  }

  const timeline = [];
  const processList = {};

  // Ensure timeline entries have the right structure and sort by start time
  const sanitizedTimeline = result.timeline.map((entry) => ({
    processId: entry.processId,
    startTime: entry.startTime || 0,
    endTime: entry.endTime || 0,
    priority: entry.priority,
  }));

  // Sort timeline events by start time
  const sortedEvents = [...sanitizedTimeline].sort(
    (a, b) => a.startTime - b.startTime
  );

  // Initialize remaining times from the original processes
  if (Array.isArray(result.schedule)) {
    result.schedule.forEach((process) => {
      // Calculate burst time differently based on available data
      let burstTime;

      if (
        process.turnaroundTime !== undefined &&
        process.waitingTime !== undefined
      ) {
        burstTime = process.turnaroundTime - process.waitingTime;
      } else if (
        process.completionTime !== undefined &&
        process.startTime !== undefined
      ) {
        burstTime = process.completionTime - process.startTime;
      } else {
        // If we can't determine burstTime, use a default
        burstTime = 1;
        console.warn(
          `Could not determine burst time for process ${process.processId}`
        );
      }

      processList[process.processId] = {
        id: process.processId,
        arrivalTime:
          process.arrivalTime !== undefined
            ? process.arrivalTime
            : process.startTime || 0,
        burstTime: burstTime,
        remainingTime: burstTime,
        priority: process.priority,
        queuePriority: process.queuePriority,
      };
    });
  }

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

    // If this is a context switch (only for preemptive algorithms)
    if (
      lastProcessId !== null &&
      lastProcessId !== processId &&
      ["SRTF", "RR"].includes(algorithmType)
    ) {
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

    // If this is the first execution of the process or after context switch
    if (lastProcessId !== processId) {
      let eventText = "";

      if (lastProcessId === null) {
        eventText = `Process ${processId} starts execution`;
      } else if (["SRTF", "RR"].includes(algorithmType)) {
        eventText = `Process ${processId} ${
          lastProcessId === processId ? "continues" : "starts"
        } execution`;
      } else {
        eventText = `Process ${processId} executes`;
      }

      // Add algorithm-specific details
      if (
        algorithmType === "PS" &&
        processList[processId]?.priority !== undefined
      ) {
        eventText += ` (Priority: ${processList[processId].priority})`;
      } else if (
        algorithmType === "MLQ" &&
        processList[processId]?.queuePriority !== undefined
      ) {
        eventText += ` (Queue: ${processList[processId].queuePriority})`;
      }

      timeline.push({
        time: event.startTime,
        event: eventText,
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
    if (processList[processId] && processList[processId].remainingTime <= 0) {
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
  timeline.sort((a, b) => {
    // First sort by time
    const timeComparison = a.time - b.time;
    if (timeComparison !== 0) return timeComparison;

    // Then prioritize arrivals before executions before completions
    const eventTypeOrder = {
      arrives: 0,
      starts: 1,
      continues: 1,
      executes: 1,
      Switch: 2,
      completes: 3,
    };

    const getEventType = (event) => {
      for (const type of Object.keys(eventTypeOrder)) {
        if (event.includes(type)) return type;
      }
      return event;
    };

    return (
      eventTypeOrder[getEventType(a.event)] -
      eventTypeOrder[getEventType(b.event)]
    );
  });

  return timeline;
}
