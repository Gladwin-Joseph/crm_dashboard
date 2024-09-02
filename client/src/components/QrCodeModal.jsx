import React from 'react';
import "./Table.css";
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeModal = ({ isOpen, onClose, qrCodeValue }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <QRCodeCanvas value={qrCodeValue} size={200} />
                <button className="close-button" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default QRCodeModal;