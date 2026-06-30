import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, ZoomIn, ZoomOut, Maximize2, AlertTriangle, RefreshCw, Eye } from 'lucide-react';

interface ConceptNode {
  id: number;
  label: string;
  description: string;
  connections: number[];
  isRoot: boolean;
}

interface ParsedData {
  rootTopic: string;
  nodes: ConceptNode[];
}

interface NodeWithCoords extends ConceptNode {
  x: number;
  y: number;
}

interface Props {
  dataString: string;
}

export default function StudyModeConceptMap({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<NodeWithCoords[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeWithCoords | null>(null);

  // Pan and Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid format: Missing nodes list.');
      }
      
      setData(parsed);
      setError(null);
      
      // Compute Coordinates (root in center, others in circle)
      const rootNode = parsed.nodes.find(n => n.isRoot) || parsed.nodes[0];
      const otherNodes = parsed.nodes.filter(n => n.id !== rootNode?.id);
      
      const width = 600;
      const height = 400;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 150;

      const mappedNodes: NodeWithCoords[] = parsed.nodes.map((node) => {
        if (node.id === rootNode?.id) {
          return { ...node, x: centerX, y: centerY };
        } else {
          const index = otherNodes.findIndex(n => n.id === node.id);
          const angle = (index * 2 * Math.PI) / (otherNodes.length || 1);
          return {
            ...node,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        }
      });

      setNodes(mappedNodes);
      
      // Auto-select root node
      const rootWithCoord = mappedNodes.find(n => n.isRoot) || mappedNodes[0];
      setSelectedNode(rootWithCoord || null);

      // Reset Pan & Zoom
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to parse concept map data.');
    }
  }, [dataString]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.min(Math.max(zoom + direction * zoomFactor, 0.5), 2.0);
    setZoom(newZoom);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const resetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Concept Map Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || nodes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Loading concept map...
      </div>
    );
  }

  return (
    <div className="space-y-6" id="concept-map-container">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-5 py-4 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] font-semibold uppercase tracking-wider">
            SVG Graphic
          </span>
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
            <Network size={14} className="text-cyan-400" />
            <span>Interactive Concept Map</span>
          </h3>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetZoomPan}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Reset Position"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Board */}
      <div 
        className="w-full h-[400px] rounded-2xl bg-slate-950/90 border border-slate-900 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg 
          className="w-full h-full"
          viewBox="0 0 600 400"
        >
          {/* Group for pan & zoom transform */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Draw connections first (so they are in background) */}
            {nodes.map((node) => {
              return node.connections.map((connId) => {
                const target = nodes.find(n => n.id === connId);
                if (!target) return null;
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                );
              });
            })}

            {/* Draw nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              
              // Node styling details
              let r = 18;
              let fillClass = "fill-slate-800 stroke-slate-700";
              let textClass = "fill-slate-300 text-[8px]";

              if (node.isRoot) {
                r = 28;
                fillClass = isSelected ? "fill-indigo-500 stroke-indigo-400 stroke-[2.5]" : "fill-indigo-600/90 stroke-indigo-500/40";
                textClass = "fill-white text-[9px] font-bold";
              } else if (node.connections.length >= 3) {
                r = 22;
                fillClass = isSelected ? "fill-violet-500 stroke-violet-400 stroke-[2.5]" : "fill-violet-600/80 stroke-violet-500/30";
                textClass = "fill-slate-100 text-[8px] font-semibold";
              } else {
                fillClass = isSelected ? "fill-cyan-500/90 stroke-cyan-400 stroke-[2.5]" : "fill-slate-800/90 stroke-slate-700/60";
              }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                >
                  <circle
                    r={r}
                    className={`transition-all duration-300 ${fillClass} filter drop-shadow-md`}
                  />
                  {/* Truncated labels for nodes */}
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    className={`${textClass} font-display pointer-events-none select-none`}
                  >
                    {node.label.length > 12 ? `${node.label.substring(0, 10)}..` : node.label}
                  </text>
                  <title>{node.label}</title>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Small Canvas Info Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-mono text-slate-500 flex items-center gap-1.5 pointer-events-none">
          <span>Scroll to Zoom</span>
          <span>•</span>
          <span>Drag to Pan</span>
        </div>
      </div>

      {/* Tooltip Card (Shown below map) */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-5 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                {selectedNode.isRoot ? 'ROOT CONCEPT' : `CONCEPT NODE #${selectedNode.id}`}
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {selectedNode.connections.length} Connections
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-display">
              {selectedNode.label}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedNode.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility / Text-based layout of connections */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
          <Eye size={12} className="text-slate-400" />
          <h4 className="text-[11px] font-bold font-display uppercase text-slate-300 tracking-wider">
            All Concepts List (Accessibility View)
          </h4>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 max-h-56 overflow-y-auto pr-1">
          {nodes.map((node) => (
            <div 
              key={node.id} 
              onClick={() => setSelectedNode(node)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                selectedNode?.id === node.id 
                  ? 'bg-slate-900 border-cyan-500/40' 
                  : 'bg-slate-950/60 border-slate-900 hover:bg-slate-900/30'
              }`}
            >
              <h5 className="text-xs font-bold text-slate-200 font-display flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${node.isRoot ? 'bg-indigo-400' : 'bg-cyan-400'}`} />
                <span>{node.label}</span>
              </h5>
              <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">
                {node.description}
              </p>
              <div className="flex gap-1 flex-wrap mt-2">
                <span className="text-[8px] font-mono text-slate-500 bg-slate-900 px-1 py-0.5 rounded">
                  Connections:
                </span>
                {node.connections.map(cId => {
                  const target = nodes.find(n => n.id === cId);
                  return (
                    <span key={cId} className="text-[8px] font-mono text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 px-1 py-0.5 rounded">
                      {target?.label || `#${cId}`}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
