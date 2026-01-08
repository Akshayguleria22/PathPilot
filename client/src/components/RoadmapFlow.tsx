"use client";

import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function RoadmapFlow({ steps }: { steps: any[] }) {
  const nodes = steps.map((step, index) => ({
    id: `${index}`,
    position: { x: index * 260, y: 80 },
    data: {
      label: (
        <div className="p-3">
          <h3 className="font-bold">{step.title}</h3>
          <p className="text-xs text-gray-600">{step.description}</p>
          <p className="mt-1 text-xs">
            Status: <b>{step.status}</b>
          </p>
        </div>
      ),
    },
    style: {
      background:
        step.status === "completed"
          ? "#bbf7d0"
          : step.status === "in-progress"
          ? "#fde68a"
          : "#e5e7eb",
      borderRadius: 10,
      border: "1px solid #d1d5db",
      width: 220,
    },
  }));

  const edges = steps.slice(1).map((_, index) => ({
    id: `e${index}`,
    source: `${index}`,
    target: `${index + 1}`,
    animated: true,
  }));

  return (
    <div className="h-[420px] w-full bg-white rounded shadow">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
