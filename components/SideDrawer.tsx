
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
}

const SideDrawer = ({ isOpen, onClose, title, children }: SideDrawerProps) => {
    if (!isOpen) return null;

    return (
        <div className="drawer-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                    <h2 className="drawer-title">{title}</h2>
                    <button onClick={onClose} className="drawer-close-button" aria-label="Close drawer">&times;</button>
                </div>
                <div className="drawer-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SideDrawer;
