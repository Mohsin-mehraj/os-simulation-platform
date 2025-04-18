// components/memory/MemoryDocs.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const MemoryDocs = () => {
  const [expandedSections, setExpandedSections] = useState([
    "introduction",
    "paging",
  ]);

  const toggleSection = (section) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const isExpanded = (section) => expandedSections.includes(section);

  return (
    <div className="max-w-full prose prose-slate mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Memory Management Concepts
      </h1>

      <div className="space-y-8">
        {/* Introduction Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("introduction")}
            className="w-full flex justify-between items-center p-4 bg-slate-50 text-left"
          >
            <h2 className="text-lg font-semibold text-slate-800 m-0">
              Introduction to Memory Management
            </h2>
            {isExpanded("introduction") ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          {isExpanded("introduction") && (
            <div className="p-4 bg-white">
              <div className="space-y-4">
                <p>
                  Memory management is one of the core functions of an operating
                  system. It involves keeping track of each byte of memory:
                  whether it is allocated or free, how much memory is being used
                  by which process, and what to do when there isn't enough main
                  memory.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-base font-medium text-blue-800 mb-2">
                    Key Memory Management Challenges:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-blue-800">
                    <li>
                      <span className="font-medium">Relocation:</span> Moving
                      programs between disk and memory
                    </li>
                    <li>
                      <span className="font-medium">Protection:</span>{" "}
                      Preventing processes from accessing each other's memory
                    </li>
                    <li>
                      <span className="font-medium">Sharing:</span> Allowing
                      controlled access to shared memory
                    </li>
                    <li>
                      <span className="font-medium">Logical organization:</span>{" "}
                      How memory appears to the process
                    </li>
                    <li>
                      <span className="font-medium">
                        Physical organization:
                      </span>{" "}
                      How memory is actually stored
                    </li>
                  </ul>
                </div>

                <h3 className="text-md font-medium text-slate-800">
                  Evolution of Memory Management:
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-left">
                          Technique
                        </th>
                        <th className="border border-slate-300 p-2 text-left">
                          Description
                        </th>
                        <th className="border border-slate-300 p-2 text-left">
                          Drawbacks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">
                          Single Contiguous Allocation
                        </td>
                        <td className="border border-slate-300 p-2">
                          All memory (except OS) allocated to one process
                        </td>
                        <td className="border border-slate-300 p-2">
                          Memory wasted, single-tasking only
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">
                          Fixed Partitioning
                        </td>
                        <td className="border border-slate-300 p-2">
                          Memory divided into fixed-size partitions
                        </td>
                        <td className="border border-slate-300 p-2">
                          Internal fragmentation, inflexible
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">
                          Dynamic Partitioning
                        </td>
                        <td className="border border-slate-300 p-2">
                          Partitions created as needed, variable sizes
                        </td>
                        <td className="border border-slate-300 p-2">
                          External fragmentation, complex allocation
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">
                          Paging
                        </td>
                        <td className="border border-slate-300 p-2">
                          Fixed-size blocks (pages) with virtual-to-physical
                          mapping
                        </td>
                        <td className="border border-slate-300 p-2">
                          Internal fragmentation (within pages)
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-medium">
                          Segmentation
                        </td>
                        <td className="border border-slate-300 p-2">
                          Variable-size logical blocks (segments)
                        </td>
                        <td className="border border-slate-300 p-2">
                          External fragmentation
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Paging Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("paging")}
            className="w-full flex justify-between items-center p-4 bg-slate-50 text-left"
          >
            <h2 className="text-lg font-semibold text-slate-800 m-0">
              Paging Overview
            </h2>
            {isExpanded("paging") ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          {isExpanded("paging") && (
            <div className="p-4 bg-white">
              <div className="space-y-4">
                <p>
                  Paging is a memory management scheme that eliminates the need
                  for contiguous allocation of physical memory. It divides both
                  physical and logical memory into fixed-size blocks, enabling
                  more efficient use of memory.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-slate-800 mb-2">
                      Key Concepts in Paging:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Page:</span> Fixed-size
                        block of logical memory
                      </li>
                      <li>
                        <span className="font-medium">Frame:</span> Fixed-size
                        block of physical memory
                      </li>
                      <li>
                        <span className="font-medium">Page Table:</span> Maps
                        logical pages to physical frames
                      </li>
                      <li>
                        <span className="font-medium">
                          Memory Management Unit (MMU):
                        </span>{" "}
                        Hardware that translates addresses
                      </li>
                      <li>
                        <span className="font-medium">Page Fault:</span> Occurs
                        when a referenced page is not in memory
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-slate-800 mb-2">
                      Address Translation Process:
                    </h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        CPU generates a logical address (page number + offset)
                      </li>
                      <li>
                        Page number is used as an index into the page table
                      </li>
                      <li>
                        Page table provides the corresponding frame number
                      </li>
                      <li>
                        Frame number is combined with the offset to form the
                        physical address
                      </li>
                      <li>
                        Physical address is sent to memory to access the data
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-base font-medium text-blue-800 mb-2">
                    Advantages of Paging:
                  </h3>
                  <ul className="list-disc pl-5 text-blue-800">
                    <li>No external fragmentation</li>
                    <li>Simplifies memory allocation</li>
                    <li>Enables efficient implementation of virtual memory</li>
                    <li>Supports process sharing and protection</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-base font-medium text-amber-800 mb-2">
                    Limitations of Paging:
                  </h3>
                  <ul className="list-disc pl-5 text-amber-800">
                    <li>Internal fragmentation within pages</li>
                    <li>
                      Page tables can become large and consume significant
                      memory
                    </li>
                    <li>Address translation adds overhead to memory access</li>
                    <li>
                      Doesn't align with program's logical structure (code,
                      data, stack)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Segmentation Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("segmentation")}
            className="w-full flex justify-between items-center p-4 bg-slate-50 text-left"
          >
            <h2 className="text-lg font-semibold text-slate-800 m-0">
              Segmentation Overview
            </h2>
            {isExpanded("segmentation") ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          {isExpanded("segmentation") && (
            <div className="p-4 bg-white">
              <div className="space-y-4">
                <p>
                  Segmentation is a memory management technique that divides a
                  program into logical, variable-sized segments. Unlike paging,
                  segmentation corresponds to the way programmers view memory:
                  code, data, stack, etc.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-slate-800 mb-2">
                      Key Concepts in Segmentation:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Segment:</span>{" "}
                        Variable-sized block of logical memory representing a
                        program component
                      </li>
                      <li>
                        <span className="font-medium">Segment Table:</span> Maps
                        logical segments to physical memory locations
                      </li>
                      <li>
                        <span className="font-medium">Base Register:</span>{" "}
                        Starting physical address of the segment
                      </li>
                      <li>
                        <span className="font-medium">Limit Register:</span>{" "}
                        Length of the segment
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-slate-800 mb-2">
                      Address Translation Process:
                    </h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        CPU generates a logical address (segment number +
                        offset)
                      </li>
                      <li>
                        Segment number is used as an index into the segment
                        table
                      </li>
                      <li>System checks if offset is within segment limits</li>
                      <li>
                        If valid, base address is added to offset to form
                        physical address
                      </li>
                      <li>
                        If invalid, a segmentation fault/violation is generated
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-base font-medium text-blue-800 mb-2">
                    Advantages of Segmentation:
                  </h3>
                  <ul className="list-disc pl-5 text-blue-800">
                    <li>No internal fragmentation</li>
                    <li>
                      Fits the programmer's view of memory (natural divisions)
                    </li>
                    <li>
                      Simplifies code sharing and protection at segment level
                    </li>
                    <li>Segments can grow/shrink independently as needed</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-base font-medium text-amber-800 mb-2">
                    Limitations of Segmentation:
                  </h3>
                  <ul className="list-disc pl-5 text-amber-800">
                    <li>External fragmentation</li>
                    <li>
                      Complex allocation and deallocation of variable-sized
                      segments
                    </li>
                    <li>
                      Less efficient physical memory utilization than paging
                    </li>
                    <li>
                      Memory compaction may be needed to reclaim fragmented
                      space
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hybrid Approaches */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("hybrid")}
            className="w-full flex justify-between items-center p-4 bg-slate-50 text-left"
          >
            <h2 className="text-lg font-semibold text-slate-800 m-0">
              Hybrid Approaches: Segmentation with Paging
            </h2>
            {isExpanded("hybrid") ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
          {isExpanded("hybrid") && (
            <div className="p-4 bg-white">
              <div className="space-y-4">
                <p>
                  Modern operating systems often combine segmentation and paging
                  to leverage the advantages of both approaches while minimizing
                  their drawbacks.
                </p>

                <h3 className="text-md font-medium text-slate-800">
                  How Segmentation with Paging Works:
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Logical address space is divided into segments (as in
                    segmentation)
                  </li>
                  <li>
                    Each segment is further divided into pages (rather than
                    being directly mapped to physical memory)
                  </li>
                  <li>
                    Two-level address translation: segment table → page table →
                    physical address
                  </li>
                  <li>
                    Protection and sharing occur at segment level, while memory
                    allocation occurs at page level
                  </li>
                </ul>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-base font-medium text-blue-800 mb-2">
                      Advantages:
                    </h3>
                    <ul className="list-disc pl-5 text-blue-800">
                      <li>
                        Eliminates external fragmentation of pure segmentation
                      </li>
                      <li>
                        Preserves logical view of program for protection and
                        sharing
                      </li>
                      <li>
                        Allows segments to grow without relocating entire
                        segment
                      </li>
                      <li>
                        Only used pages need to be in memory (efficient virtual
                        memory)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="text-base font-medium text-amber-800 mb-2">
                      Limitations:
                    </h3>
                    <ul className="list-disc pl-5 text-amber-800">
                      <li>More complex address translation</li>
                      <li>
                        Higher memory overhead for maintaining multiple tables
                      </li>
                      <li>
                        Still has some internal fragmentation within pages
                      </li>
                      <li>Greater CPU overhead for address translation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base font-medium text-gray-800 mb-2">
                    Examples of Hybrid Implementations:
                  </h3>
                  <ul className="list-disc pl-5">
                    <li>
                      <span className="font-medium">Intel x86:</span> Uses
                      segmentation with paging (though modern OSes like Windows
                      and Linux use a flat memory model that minimizes
                      segmentation)
                    </li>
                    <li>
                      <span className="font-medium">Multics (historical):</span>{" "}
                      Pioneered the segmentation with paging approach
                    </li>
                    <li>
                      <span className="font-medium">
                        Some embedded systems:
                      </span>{" "}
                      Use hybrid approaches for specialized memory management
                      needs
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryDocs;
