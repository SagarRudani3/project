import { Handle, Position } from 'reactflow';

interface DelayNodeProps {
  data: {
    delay: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

export default function DelayNode({ data }: DelayNodeProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] border-2 border-yellow-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Wait</h3>
        <p className="text-sm text-gray-600">
          {data.delay} {data.unit}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}