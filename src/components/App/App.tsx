import React, { memo, useCallback, useReducer, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getInitialState,
  getBookDetails,
  giftsReducer,
  patchGeneratingGiftsReducer,
} from '../../modules/gifts/gifts';
import { User, Gift, ActionApplyPatches } from '../../modules/gifts/types';
import { useSocket } from '../../modules/socket/useSocket';
import { Patch } from 'immer';

interface GiftProps {
  gift: Gift;
  users: User[];
  currentUser: User;
  onReserve: (id: string) => void;
}

const GiftComponent = memo<GiftProps>(
  ({ gift, users, currentUser, onReserve }) => (
    <div className={`gift ${gift.reservedBy ? 'reserved' : ''}`}>
      <img src={gift.image} alt="gift" />
      <div className="description">
        <h2>{gift.description}</h2>
      </div>
      <div className="reservation">
        {!gift.reservedBy || gift.reservedBy === currentUser.id ? (
          <button onClick={() => onReserve(gift.id)}>
            {gift.reservedBy ? 'Unreserve' : 'Reserve'}
          </button>
        ) : (
          <span>{users[gift.reservedBy].name}</span>
        )}
      </div>
    </div>
  )
);

function GiftList() {
  const [state, setState] = useState(() => getInitialState());
  const { users, currentUser, gifts } = state;

  const send = useSocket('ws://localhost:5001', function onMessage(
    patches: Patch[]
  ) {
    console.dir(patches);
    const action: ActionApplyPatches = {
      type: 'APPLY_PATCHES',
      patches: patches,
    };
    setState(giftsReducer(state, action));
  });

  const dispatch = useCallback(
    action => {
      setState(currentState => {
        const [nextState, patches] = patchGeneratingGiftsReducer(
          currentState,
          action
        );
        send(patches);

        return nextState;
      });
    },
    [send]
  );

  const handleAdd = () => {
    const description = prompt('Gift to add');

    if (description) {
      dispatch({
        type: 'ADD_GIFT',
        id: uuidv4(),
        description,
        image: `https://picsum.photos/id/${Math.round(
          Math.random() * 1000
        )}/200/200`,
      });
    }
  };

  const handleReserve = useCallback(
    (id: string) => {
      dispatch({
        type: 'TOGGLE_RESERVATION',
        id,
      });
    },
    [dispatch]
  );

  const handleReset = () => {
    dispatch({
      type: 'RESET',
    });
  };

  const handleAddBook = async () => {
    const isbn = prompt('Enter ISNB number', '0201558025');

    if (isbn) {
      const book = await getBookDetails(isbn);

      if (book) {
        dispatch({
          type: 'ADD_BOOK',
          book,
        });
      }
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Hi, {currentUser.name}</h1>
      </div>
      <div className="actions">
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleAddBook}>Add Book</button>
        <button onClick={handleReset}>Reset</button>
        <button>Undo</button>
        <button>Redo</button>
      </div>
      <div className="gifts">
        {Object.keys(gifts).map(giftId => (
          <GiftComponent
            key={gifts[giftId].id}
            gift={gifts[giftId]}
            users={users}
            currentUser={currentUser}
            onReserve={handleReserve}
          />
        ))}
      </div>
    </div>
  );
}

export default GiftList;
