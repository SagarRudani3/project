import { Handle, Position } from 'reactflow';

interface LeadSourceNodeProps {
  data: {
    email: string;
    source: string;
    description: string;
  };
}

export default function LeadSourceNode({ data }: LeadSourceNodeProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] border-2 border-green-500">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Lead Source</h3>
        <p className="text-sm text-gray-600">{data.email}</p>
      </div>
      <p className="text-sm text-gray-700">{data.description}</p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}