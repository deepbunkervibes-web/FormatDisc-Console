
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { generateId } from '../utils';

interface Node {
  id: string;
  type: 'agent' | 'policy' | 'gate';
  label: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

interface SlavkoFusionCanvasProps {
  onDeploy: (manifest: string) => void;
  isLoading: boolean;
}

interface Primitive {
  type: Node['type'];
  label: string;
  icon: string;
}

const PRIMITIVES: Primitive[] = [
  { type: 'agent', label: 'Guardian', icon: '🛡️' },
  { type: 'agent', label: 'Sentinel', icon: '🤖' },
  { type: 'agent', label: 'Inspector', icon: '🔍' },
  { type: 'policy', label: 'SOC2', icon: '📜' },
  { type: 'policy', label: 'GDPR', icon: '🇪🇺' },
  { type: 'gate', label: 'CISO', icon: '🔑' },
  { type: 'gate', label: 'DevOps', icon: '👥' },
];

const GRID_SIZE = 16;

export const SlavkoFusionCanvas = ({ onDeploy, isLoading }: SlavkoFusionCanvasProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConn, setActiveConn] = useState<{ fromId: string; x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const addNode = (p: Primitive) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newNode: Node = {
      id: generateId(),
      type: p.type,
      label: p.label,
      x: snapToGrid(rect.width / 2 + (Math.random() * 40 - 20)),
      y: snapToGrid(rect.height / 2 + (Math.random() * 40 - 20))
    };
    setNodes(prev => [...prev, newNode]);
  };

  const startConnection = (fromId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    setActiveConn({
      fromId,
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const endConnection = (toId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (activeConn && activeConn.fromId !== toId) {
      const exists = connections.find(c => c.fromId === activeConn.fromId && c.toId === toId);
      if (!exists) {
        setConnections(prev => [...prev, { id: generateId(), fromId: activeConn.fromId, toId }]);
      }
    }
    setActiveConn(null);
  };

  const onCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeConn && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = e.clientX;
          clientY = e.clientY;
      }

      setActiveConn({
        ...activeConn,
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleDeploy = () => {
    if (nodes.length === 0) return;
    
    // Canonical JSON Manifest structure
    const manifestObj = {
        protocol: "FUSION_V1",
        timestamp: Date.now(),
        metadata: {
            node_count: nodes.length,
            edge_count: connections.length
        },
        topology: {
            nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.label })),
            edges: connections.map(c => ({ from: c.fromId, to: c.toId }))
        }
    };

    onDeploy(JSON.stringify(manifestObj, null, 2));
  };

  const getNode = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="fusion-workspace" style={{ border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden', background: '#050507' }}>
      <div className="fusion-canvas-area" 
           ref={canvasRef}
           onMouseMove={onCanvasMouseMove}
           onTouchMove={onCanvasMouseMove}
           onMouseUp={() => setActiveConn(null)}
           onTouchEnd={() => setActiveConn(null)}
           style={{ position: 'relative', height: '400px', cursor: 'crosshair', backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px` }}>
        
        {nodes.length === 0 && (
          <div className="canvas-placeholder" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', padding: '40px', letterSpacing: '2px' }}>
            [AWAITING_PRIMITIVE_INJECTION]
          </div>
        )}

        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
            {connections.map((conn) => {
                const from = getNode(conn.fromId);
                const to = getNode(conn.toId);
                if (!from || !to) return null;
                return <line key={conn.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.4" />;
            })}
            {activeConn && (
                <line x1={getNode(activeConn.fromId)!.x} y1={getNode(activeConn.fromId)!.y} x2={activeConn.x} y2={activeConn.y} stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="4" />
            )}
        </svg>

        {nodes.map(node => (
          <div key={node.id} 
               className={`canvas-node node-${node.type}`} 
               style={{ 
                   position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)', 
                   background: '#0a0a0c', border: `1px solid ${node.type === 'policy' ? 'var(--color-success)' : 'var(--color-border-strong)'}`, 
                   padding: '12px', borderRadius: '2px', minWidth: '90px', textAlign: 'center', zIndex: 10,
                   boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s'
               }}
               onMouseDown={(e) => startConnection(node.id, e)}
               onTouchStart={(e) => startConnection(node.id, e)}
               onMouseUp={(e) => endConnection(node.id, e)}
               onTouchEnd={(e) => endConnection(node.id, e)}>
            <div style={{ fontSize: '0.5rem', opacity: 0.5, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{node.type.toUpperCase()}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{node.label}</div>
            <div className="node-port" style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: 'var(--color-accent)', borderRadius: '50%', opacity: 0.5 }}></div>
          </div>
        ))}

        <div className="fusion-controls" style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10, zIndex: 50 }}>
           <button onClick={handleDeploy} disabled={nodes.length === 0 || isLoading} 
                   style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '2px', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'transform 0.1s' }}>
               {isLoading ? 'EXECUTING...' : 'INIT_DEPLOY'}
           </button>
           <button onClick={() => {setNodes([]); setConnections([]);}} 
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '2px', color: '#fff', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
               CLR
           </button>
        </div>
      </div>

      <div className="primitive-drawer" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', borderTop: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
        {PRIMITIVES.map((p, i) => (
          <button key={i} className="primitive-item" onClick={() => addNode(p)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-strong)', padding: '8px 12px', borderRadius: '2px', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1rem' }}>{p.icon}</span>
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
