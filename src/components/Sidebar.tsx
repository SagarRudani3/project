import { PlusCircle, Clock, Users, Mail } from 'lucide-react';
import React from 'react';

interface SavedFlow {
  id: string;
  name: string;
  createdAt: string;
}

interface SidebarProps {
  savedFlows?: SavedFlow[];
  onLoadFlow: (flow: SavedFlow) => void;
  onClearFlow: () => void;
}

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

const Sidebar: React.FC<SidebarProps> = ({ savedFlows = [], onLoadFlow, onClearFlow }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleFlowClick = (flow: SavedFlow) => {
    onLoadFlow(flow);
    onClearFlow();
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

      {savedFlows.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Saved Flows</h2>
          <div className="space-y-2">
            {savedFlows.map((flow) => (
              <div
                key={flow.id}
                className="bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200"
                onClick={() => handleFlowClick(flow)}
              >
                <div className="font-medium">{flow.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(flow.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;