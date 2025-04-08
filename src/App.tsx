import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import axios from 'axios';
import 'reactflow/dist/style.css';

import EmailNode from './components/EmailNode';
import DelayNode from './components/DelayNode';
import LeadSourceNode from './components/LeadSourceNode';
import Sidebar from './components/Sidebar';
import NodeEditor from './components/NodeEditor';

const API_URL = 'https://backend-3yd6.onrender.com/api/emails';

const nodeTypes = {
  email: EmailNode,
  delay: DelayNode,
  leadSource: LeadSourceNode,
};


const loadSavedFlow = () => {
  const savedFlow = localStorage.getItem('emailFlow');
  if (savedFlow) {
    const flow = JSON.parse(savedFlow);
    return {
      nodes: flow.nodes || [],
      edges: flow.edges || [],
    };
  }
  return {
    nodes: [],
    edges: [],
  };
};

const { nodes: initialNodes, edges: initialEdges } = loadSavedFlow();

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: getInitialData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes],
  );

  const getInitialData = (type: string) => {
    switch (type) {
      case 'email':
        return {
          subject: 'New Email',
          body: 'Enter your email content here...',
        };
      case 'delay':
        return {
          delay: 1,
          unit: 'days',
        };
      case 'leadSource':
        return {
          source: 'New Lead Source',
          description: 'Enter source description...',
        };
      default:
        return {};
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              ...newData
            }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      });
    });
  }, []);

  const scheduleEmails = async (flow: any) => {
    try {
      const emailNodes = flow.nodes.filter((node: Node) => node.type === 'email');
      
      for (const emailNode of emailNodes) {
        const connectedEdge = flow.edges.find((edge: Edge) => edge.target === emailNode.id);
        const delayNode = connectedEdge 
          ? flow.nodes.find((node: Node) => node.id === connectedEdge.source && node.type === 'delay')
          : null;

        let delay = 3600000; 
        if (delayNode) {
          const { unit, delay: delayValue } = delayNode.data;
          switch (unit) {
            case 'minutes':
              delay = delayValue * 60 * 1000;
              break;
            case 'hours':
              delay = delayValue * 60 * 60 * 1000;
              break;
            case 'days':
              delay = delayValue * 24 * 60 * 60 * 1000;
              break;
          }
        }

        await axios.post(`${API_URL}/schedule`, {
          email: 'recipient@example.com', 
          subject: emailNode.data.subject,
          body: emailNode.data.body,
          delay
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
      }
    } catch (error) {
      console.error('Failed to schedule emails:', error);
      throw error;
    }
  };

  const onSave = useCallback(async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      
      try {
        localStorage.setItem('emailFlow', JSON.stringify(flow));
        
        await scheduleEmails(flow);
        
        setSaveStatus('Flow saved and emails scheduled successfully!');
        setError('');
      } catch (err) {
        console.error('Save failed:', err);
        setError('Failed to save flow and schedule emails');
        setSaveStatus('');
      }
      
      setTimeout(() => {
        setSaveStatus('');
        setError('');
      }, 3000);
    }
  }, [reactFlowInstance]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
            <div className="absolute bottom-4 right-4 flex flex-col items-end">
              {saveStatus && (
                <div className="mb-2 px-4 py-2 bg-green-500 text-white rounded-lg">
                  {saveStatus}
                </div>
              )}
              {error && (
                <div className="mb-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                  {error}
                </div>
              )}
              <button
                onClick={onSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Flow
              </button>
            </div>
          </ReactFlowProvider>
        </div>
        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;