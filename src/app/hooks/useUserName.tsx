import { STORAGE_KEY,ANIMALS } from '@/constants';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react'

const generateUserName = () => {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `anonymous-${word}-${nanoid(5)}`;
};
const useUserName = () => {
  const [username, setUsername] = useState("");
  useEffect(() => {
    const main = () => {
      const store = localStorage.getItem(STORAGE_KEY);
      if (store) {
        setUsername(store);
        return;
      }
      const generated = generateUserName();
      localStorage.setItem(STORAGE_KEY, generated);
      setUsername(generated);
    };
    main();
  }, []);

  return {username}
}

export default useUserName