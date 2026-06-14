import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls, Background, MiniMap,
  useNodesState, useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { skillAPI } from '../services/api';
import { Search, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const skillColors = {
  'Programming': '#6366F1',
  'Web Development': '#10B981',
  'Data Science': '#F59E0B',
  'Machine Learning': '#EF4444',
  'Mobile Development': '#8B5CF6',
  'Cloud Computing': '#06B6D4',
  'DevOps': '#EC4899',
  'default': '#6B7280',
};

function SkillNode({ data }) {
  const color = skillColors[data.category] || skillColors.default;
  return (
    <div
      className="px-4 py-3 rounded-xl shadow-lg border-2 bg-white dark:bg-gray-800 min-w-[140px]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-semibold text-sm text-gray-900 dark:text-white">{data.label}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {data.userCount} user{data.userCount !== 1 ? 's' : ''}
      </p>
      {data.users && data.users.length > 0 && (
        <div className="flex -space-x-2 mt-2">
          {data.users.slice(0, 5).map((user, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 border-2 border-white dark:border-gray-800 flex items-center justify-center"
              title={user.name}
            >
              <span className="text-[8px] font-medium text-primary-600">
                {user.name?.charAt(0)}
              </span>
            </div>
          ))}
          {data.users.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-[8px] font-medium">+{data.users.length - 5}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { skillNode: SkillNode };

export default function SkillTreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const res = await skillAPI.getSkillGraph();
      setNodes(res.data.nodes);
      setEdges(res.data.edges.map((e) => ({
        ...e,
        markerEnd: { type: MarkerType.ArrowClosed },
      })));
      setSkills(res.data.skills || []);
    } catch (error) {
      toast.error('Failed to load skill graph');
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const filteredNodes = useMemo(() => {
    if (!search) return nodes;
    return nodes.filter((n) =>
      n.data?.label?.toLowerCase().includes(search.toLowerCase())
    );
  }, [nodes, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Skill Graph</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Explore campus knowledge connections
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills..."
                className="input-field pl-10 w-60 text-sm"
              />
            </div>
            <button onClick={loadGraph} className="btn-ghost text-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          {Object.entries(skillColors).filter(([k]) => k !== 'default').map(([category, color]) => (
            <div key={category} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {category}
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-950">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
        >
          <Controls />
          <Background gap={20} />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>
    </div>
  );
}
