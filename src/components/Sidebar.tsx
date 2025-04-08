import { PlusCircle, Clock, Users, Mail } from 'lucide-react';

const nodeTypes = [
  {
    type: 'email',
    label: 'Cold Email',
    icon: Mail,
  },
  {
    type: 'delay',
    label: 'Wait/Delay',
    icon: Clock,
  },
  {
    type: 'leadSource',
    label: 'Lead Source',
    icon: Users,
  },
];

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5" />
        Add Nodes
      </h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
            onDragStart={(e) => onDragStart(e, node.type)}
            draggable
          >
            <node.icon className="w-5 h-5" />
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}