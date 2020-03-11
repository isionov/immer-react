import React, { memo, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import produce, { original } from 'immer';
import { useImmer } from 'use-immer';
import {
  getInitialState,
  addGift,
  toggleReservation,
  getBookDetails,
} from '../../modules/gifts/gifts';
import { User, Gift, State } from '../../modules/gifts/types';

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
  const [state, updateState] = useImmer(() => getInitialState());
  const { users, currentUser, gifts } = state;

  const handleAdd = () => {
    const description = prompt('Gift to add');

    if (description) {
      updateState((draft: State) => {
        draft.gifts.push({
          id: uuidv4(),
          description,
          image: `https://picsum.photos/id/${Math.round(
            Math.random() * 1000
          )}/200/200`,
          reservedBy: undefined,
        });
      });
    }
  };

  // const handleAdd = () => {
  //   const description = prompt('Gift to add');

  //   if (description) {
  //     updateState(state =>
  //       addGift(
  //         state,
  //         uuidv4(),
  //         description,
  //         `https://picsum.photos/id/${Math.round(Math.random() * 1000)}/200/200`
  //       )
  //     );
  //   }
  // };

  const handleReserve = useCallback(
    (id: string) => {
      updateState((draft: State) => {
        const gift = draft.gifts.find(gift => gift.id === id);
        if (gift) {
          gift.reservedBy =
            gift.reservedBy === undefined
              ? draft.currentUser.id
              : gift.reservedBy === original(draft.currentUser)?.id
              ? undefined
              : gift.reservedBy;
        }
      });
    },
    [updateState]
  );

  // const handleReserve = useCallback((id: string) => {
  //   updateState(state => toggleReservation(state, id));
  // }, []);

  const handleReset = () => {
    updateState(draft => {
      return getInitialState();
    });
  };

  const handleAddBook = async () => {
    const isbn = prompt('Enter ISNB number', '0201558025');

    if (isbn) {
      const book = await getBookDetails(isbn);

      updateState(draft => {
        if (book) {
          draft.gifts.push({
            id: isbn,
            description: book.title,
            image: book.cover?.medium,
            reservedBy: undefined,
          });
        }
      });
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
        {gifts.map(gift => (
          <GiftComponent
            key={gift.id}
            gift={gift}
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
