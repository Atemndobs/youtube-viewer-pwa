import React, { useState, useEffect } from 'react';
import { Badge, Space } from 'antd';
import useWebSocket from 'react-use-websocket';

const WebSocketStatus = () => {
    // const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws';
    const socketUrl = process.env.WEBSOCKET_URL|| 'ws://localhost:8681';
    const { readyState } = useWebSocket(socketUrl, {
        shouldReconnect: () => true, // Reconnect on errors
    });

    const getWebSocketStatus = () => {
        switch (readyState) {
            case WebSocket.CONNECTING:
                return { color: 'yellow', text: 'Connecting...' };
            case WebSocket.OPEN:
                return { color: 'green', text: 'Connected' };
            case WebSocket.CLOSING:
                return { color: 'orange', text: 'Closing...' };
            case WebSocket.CLOSED:
                return { color: 'red', text: 'Disconnected' };
            default:
                return { color: 'gray', text: 'Unknown' };
        }
    };

    const { color, text } = getWebSocketStatus();

    return (
        <Space>
            <Badge 
                color={color} 
                text={<span style={{ color: 'grey' }}>{`ws status: ${text}`}</span>} 
            />
        </Space>
    );
};

export default WebSocketStatus;
