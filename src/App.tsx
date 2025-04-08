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
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

const API_URL = 'https://backend-3yd6.onrender.comapi/emails';
const AUTH_API_URL = 'https://backend-3yd6.onrender.com/api/auth';

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

interface SavedFlow {
  id: string;
  name: string;
  createdAt: string;
  data: string;
}

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  console.log("%c Line:62 🥪 nodes", "color:#2eafb0", nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setShowLoginModal(true);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthError('');
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setShowLoginModal(false);
    } catch (err: any) {
      console.error('Login failed:', err);
      setAuthError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      setAuthError('');
      const response = await axios.post(`${AUTH_API_URL}/register`, {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setShowRegisterModal(false);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setAuthError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    setIsAuthenticated(false);
    setShowLoginModal(true);
  };

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
          email: '',  
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
        // const leadSourceEdge = flow.edges.find((edge: Edge) => 
        //   edge.target === emailNode.id && 
        //   flow.nodes.find((n:any) => n.id === edge.source && n.type === 'leadSource')
        // );
        
        // const leadSourceNode = leadSourceEdge 
        //   ? flow.nodes.find((node: Node) => node.id === leadSourceEdge.source)
        //   : null;

        const delayEdge = flow.edges.find((edge: Edge) => 
          edge.target === emailNode.id && 
          flow.nodes.find((n:any) => n.id === edge.source && n.type === 'delay')
        );
        
        const delayNode = delayEdge 
          ? flow.nodes.find((node: Node) => node.id === delayEdge.source)
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

        const payload: any = {
          subject: emailNode.data.subject,
          body: emailNode.data.body,
          delay,
          additionalData: nodes,
          to: ""
        };

        const connectedLeadSources = flow.edges
          .filter((edge: Edge) => 
            edge.target === emailNode.id && 
            flow.nodes.find((n:any) => n.id === edge.source && n.type === 'leadSource')
          )
          .map((edge: Edge) => 
            flow.nodes.find((node: Node) => node.id === edge.source)
          )
          .filter(Boolean);

          console.log("%c Line:265 🍅 connectedLeadSources", "color:#42b983", connectedLeadSources);
        if (connectedLeadSources.length > 0) {
          payload.to = connectedLeadSources[0]?.data?.email;
        } else {
          setError('Email node must be connected to at least one lead source');
          throw new Error('Email node must be connected to at least one lead source');
        }

        if (delayNode) {
          payload.delayValue = delay;
          payload.delayNodeId = delayNode.id;
        }

        if (flow.id) {
          payload.flowId = flow.id;
        }

        await axios.post(`${API_URL}/schedule`, payload, {
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
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      
      const emailNodes = flow.nodes.filter((node: Node) => node.type === 'email');
      const delayNodes = flow.nodes.filter((node: Node) => node.type === 'delay');
      const leadSourceNodes = flow.nodes.filter((node: Node) => node.type === 'leadSource');
      
      if (emailNodes.length === 0 || delayNodes.length === 0 || leadSourceNodes.length === 0) {
        setError('Your flow must contain at least one Email, one Delay, and one Lead Source node');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      for (const emailNode of emailNodes) {
        if (!emailNode.data.subject || emailNode.data.subject.trim() === '') {
          setError('Email nodes must have a subject');
          setTimeout(() => setError(''), 3000);
          return;
        }
        
        if (!emailNode.data.body || emailNode.data.body.trim() === '') {
          setError('Email nodes must have a body');
          setTimeout(() => setError(''), 3000);
          return;
        }
      }
      
      for (const delayNode of delayNodes) {
        if (!delayNode.data.delay || delayNode.data.delay <= 0) {
          setError('Delay nodes must have a positive delay value');
          setTimeout(() => setError(''), 3000);
          return;
        }
      }
      
      for (const leadSourceNode of leadSourceNodes) {
        if (!leadSourceNode.data.email || !isValidEmail(leadSourceNode.data.email)) {
          setError('Lead Source must have a valid email address');
          setTimeout(() => setError(''), 3000);
          return;
        }
      }
      
      try {
        // localStorage.setItem('emailFlow', JSON.stringify(flow));
        
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
  }, [reactFlowInstance, isAuthenticated]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isAuthenticated) {
    return (
      <>
        {showLoginModal && (
          <LoginModal
            onLogin={handleLogin}
            onClose={() => setShowLoginModal(false)}
            onRegisterClick={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
            error={authError}
          />
        )}
        {showRegisterModal && (
          <RegisterModal
            onRegister={handleRegister}
            onClose={() => setShowRegisterModal(false)}
            onLoginClick={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true);
            }}
            error={authError}
          />
        )}
        <div className="flex h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Email Flow Builder</h1>
            <p className="mb-4">Please log in to access the application</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </>
    );
  }

  useEffect(() => {
    const fetchSavedFlows = async () => {
      try {
        const response = await axios.get(`${API_URL}/scheduled`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSavedFlows(response.data);
      } catch (error) {
        console.error('Failed to fetch saved flows:', error);
      }
    };

    if (isAuthenticated) {
      fetchSavedFlows();
    }
  }, [isAuthenticated]);

  const handleLoadFlow = useCallback((flow: any) => {
    if (reactFlowInstance) {
      try {
        console.log('Raw flow data:', flow);
        
        const nodeData = Array.isArray(flow) ? flow : flow?.additionalData;
        
        if (!nodeData) {
          throw new Error('No valid node data found');
        }

        const flowNodes = nodeData.map((node: Node) => ({
          ...node,
          position: {
            x: node.position?.x || 100,
            y: node.position?.y || 100
          },
          id: node.id || `node-${Date.now()}`,
          type: node.type,
          data: {
            ...node.data,
            ...(node.type === 'email' && {
              subject: node.data?.subject || 'New Email',
              body: node.data?.body || 'Enter your email content here...'
            }),
            ...(node.type === 'delay' && {
              delay: node.data?.delay || 1,
              unit: node.data?.unit || 'days'
            }),
            ...(node.type === 'leadSource' && {
              email: node.data?.email || ''
            })
          }
        }));

        console.log('Processed nodes:', flowNodes);
        
        if (Array.isArray(flowNodes) && flowNodes.length > 0) {
          setNodes(flowNodes);
          setEdges(flow.edges || []);
          
          setTimeout(() => {
            reactFlowInstance.fitView();
          }, 100);
        }
      } catch (error) {
        console.error('Failed to load flow:', error);
        setError('Failed to load flow: Invalid data structure');
      }
    }
  }, [reactFlowInstance, setNodes, setEdges]);

  const handleClearFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('emailFlow');
  }, [setNodes, setEdges]);

  return (
  <>  <div className="flex h-screen">
      <Sidebar 
        savedFlows={savedFlows} 
        onLoadFlow={handleLoadFlow}
        onClearFlow={handleClearFlow}
      />
        <div className="flex-1 flex flex-col">
          <div className="bg-white p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold">Email Flow Builder</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
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
      </div>
      
      {showLoginModal && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          error={authError}
        />
      )}
      {showRegisterModal && (
        <RegisterModal
          onRegister={handleRegister}
          onClose={() => setShowRegisterModal(false)}
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
          error={authError}
        />
      )}
   </>
  );
}

export default App;