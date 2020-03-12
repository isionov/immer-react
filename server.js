import { Server as WebsocketServer } from 'ws';
import gifts from './src/modules/gifts/gifts.json';
import { produceWithPatches, applyPatches, enablePatches } from 'immer';
enablePatches();

const initialState = { gifts };
const wss = new WebsocketServer({ port: 5001 });

let connections = [];
let history = [];

wss.on('connection', ws => {
  console.log('New connection');
  connections.push(ws);

  ws.on('message', message => {
    console.log(message);
    history.push(...JSON.parse(message));
    connections
      .filter(client => client !== ws)
      .forEach(client => {
        client.send(message);
      });
  });

  ws.on('close', () => {
    const idx = connections.indexOf(ws);
    if (idx !== -1) connections.splice(idx, 1);
  });

  ws.send(JSON.stringify(history));
});

function compressHistory(currentPatches) {
  const [, patches] = produceWithPatches(initialState, draft => {
    return applyPatches(draft, currentPatches);
  });
  console.log(`compress history from ${currentPatches} to ${patches}`);

  return patches;
}

setInterval(() => {
  history = compressHistory(history);
}, 5000);
