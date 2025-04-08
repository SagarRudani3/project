import { Node } from 'reactflow';
import { X } from 'lucide-react';

interface NodeEditorProps {
  node: Node;
  onUpdate: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

export default function NodeEditor({ node, onUpdate, onClose }: NodeEditorProps) {
  const handleChange = (key: string, value: any) => {
    const updatedData = {
      ...node.data,
      [key]: value
    };
    onUpdate(node.id, updatedData);
  };

  const renderEmailEditor = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          value={node.data.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body
        </label>
        <textarea
          value={node.data.body}
          onChange={(e) => handleChange('body', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );

  const renderDelayEditor = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Delay Duration
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={node.data.delay}
          onChange={(e) => handleChange('delay', parseInt(e.target.value))}
          min={1}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={node.data.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
    </div>
  );

  const renderLeadSourceEditor = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source Name
        </label>
        <input
          type="text"
          value={node.data.source}
          onChange={(e) => handleChange('source', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={node.data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );

  const renderEditor = () => {
    switch (node.type) {
      case 'email':
        return renderEmailEditor();
      case 'delay':
        return renderDelayEditor();
      case 'leadSource':
        return renderLeadSourceEditor();
      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Node</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {renderEditor()}
    </div>
  );
}