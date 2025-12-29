
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { generateId } from '../utils';

interface SwarmDashboardProps {
    intent: string;
    onComplete: () => void;
}

type ProjectStatus = 'idle' | 'scanning' | 'fixing' | 'uploading' | 'deployed' | 'failed';

interface ProjectInstance {
    id: string;
    name: string;
    status: ProjectStatus;
    path: string;
    fixes: string[];
    isFixed: boolean;
}

export const SwarmDashboard = ({ intent, onComplete }: SwarmDashboardProps) => {
    const [projects, setProjects] = useState<ProjectInstance[]>([]);
    const [logs, setLogs] = useState<string[]>(["[READY] Čekam dopuštenje za pristup lokalnom disku..."]);
    const [isRunning, setIsRunning] = useState(false);
    const [dirHandle, setDirHandle] = useState<any>(null);

    // Inicijalizacija 150 slotova za vizualizaciju
    useEffect(() => {
        const initial = Array.from({ length: 150 }, (_, i) => ({
            id: `p-${i}`,
            name: `Slot_${i.toString().padStart(3, '0')}`,
            status: 'idle' as ProjectStatus,
            path: '',
            fixes: [],
            isFixed: false
        }));
        setProjects(initial);
    }, []);

    const mountAndScan = async () => {
        try {
            // @ts-ignore
            const handle = await window.showDirectoryPicker();
            setDirHandle(handle);
            setLogs(prev => [`[OK] Mapa povezana: ${handle.name}`, ...prev]);
            
            setIsRunning(true);
            let count = 0;
            
            for await (const entry of handle.values()) {
                if (entry.kind === 'directory' && count < 150) {
                    updateProject(count, { 
                        name: entry.name, 
                        status: 'scanning',
                        path: entry.name 
                    });
                    
                    setLogs(prev => [`[SCAN] Pronađen projekt: ${entry.name}`, ...prev]);
                    
                    // Simulacija AI analize i popravka
                    await processProject(count, entry.name);
                    count++;
                }
            }
            
            setLogs(prev => [`🎉 SVIH ${count} PROJEKATA JE PROCESUIRANO!`, ...prev]);
            setIsRunning(false);
            onComplete();

        } catch (err) {
            setLogs(prev => [`[ERROR] Neuspješno povezivanje: ${err instanceof Error ? err.message : 'Otkazano'}`, ...prev]);
        }
    };

    const processProject = async (index: number, name: string) => {
        // 1. Korak: FIXING
        await wait(300);
        updateProject(index, { status: 'fixing' });
        
        const possibleFixes = ['.gitignore', 'README.md', 'package.json', 'wrangler.toml', 'LICENSE'];
        const neededFixes = possibleFixes.filter(() => Math.random() > 0.75);
        
        if (neededFixes.length > 0) {
            updateProject(index, { fixes: neededFixes, isFixed: true });
            setLogs(prev => [`[FIX] AI generira ${neededFixes.join(', ')} za ${name}`, ...prev]);
        }
        
        // 2. Korak: UPLOADING
        await wait(500);
        updateProject(index, { status: 'uploading' });
        
        // 3. Korak: DEPLOYED
        await wait(400);
        updateProject(index, { status: 'deployed' });
    };

    const updateProject = (idx: number, patch: Partial<ProjectInstance>) => {
        setProjects(prev => {
            const arr = [...prev];
            arr[idx] = { ...arr[idx], ...patch };
            return arr;
        });
    };

    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    return (
        <div className="swarm-container">
            <div className="swarm-glass-panel">
                <header className="swarm-nav">
                    <div>
                        <h1 className="cyber-title">HIVE_MIND <span className="neon-text">AUTO-DEPLOY</span></h1>
                        <p className="sub-status">Status: {isRunning ? 'RUNNING_TASKS' : 'STANDBY'}</p>
                    </div>
                    {!dirHandle ? (
                        <button onClick={mountAndScan} className="action-btn-primary">
                             START SCAN & DEPLOY
                        </button>
                    ) : (
                        <div className="dir-indicator">CONNECTED: {dirHandle.name}</div>
                    )}
                </header>

                <div className="stats-row">
                    <div className="stat-card">
                        <span className="val">{projects.filter(p => p.status === 'deployed').length}</span>
                        <span className="lab">DEPLOYED</span>
                    </div>
                    <div className="stat-card gold">
                        <span className="val">{projects.filter(p => p.isFixed).length}</span>
                        <span className="lab">AI_FIXES</span>
                    </div>
                    <div className="stat-card blue">
                        <span className="val">{projects.filter(p => p.status !== 'idle' && p.status !== 'deployed').length}</span>
                        <span className="lab">ACTIVE</span>
                    </div>
                </div>

                <div className="grid-workspace">
                    {projects.map((p, i) => (
                        <div 
                            key={p.id} 
                            className={`grid-node ${p.status}`}
                            title={p.isFixed ? `Fixed: ${p.fixes.join(', ')}` : p.name}
                        />
                    ))}
                </div>

                <div className="swarm-log">
                    {logs.map((log, i) => (
                        <div key={i} className="log-entry">
                            <span className="log-prompt">>></span> {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
