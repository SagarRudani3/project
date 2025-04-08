import { Handle, Position } from 'reactflow';

interface EmailNodeProps {
  data: {
    subject: string;
    body: string;
  };
}

export default function EmailNode({ data }: EmailNodeProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] border-2 border-blue-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Cold Email</h3>
        <p className="text-sm text-gray-600">Subject: {data.subject}</p>
      </div>
      <p className="text-sm text-gray-700 line-clamp-3">{data.body}</p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}