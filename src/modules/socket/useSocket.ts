import { useEffect, useCallback, useRef } from 'react';

export const useSocket = (url: string, onMessage: (data: string) => void) => {
  const socket = useRef<WebSocket>(WebSocket.prototype);
  const msgHandler = useRef<Function>(() => {});

  msgHandler.current = onMessage;

  useEffect(() => {
    const createdSocket = new WebSocket(url);

    createdSocket.onmessage = event => {
      const data = JSON.parse(event.data);
      if (msgHandler) {
        msgHandler.current(data);
      }
    };

    socket.current = createdSocket;
    console.log('created socket to ' + url);

    return () => {
      console.log('socket disconnected');
      createdSocket.close();
    };
  }, [url]);

  return useCallback(data => {
    if (socket) {
      socket.current.send(JSON.stringify(data));
    }
  }, []);
};
