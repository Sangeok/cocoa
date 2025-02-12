import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
  nickname: string;
  setNickname: (nickname: string) => void;
  validateNickname: (nickname: string) => boolean;
  generateRandomNickname: () => string;
}

const generateRandomNickname = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 10000-99999 사이의 랜덤 숫자
  return `코코아${randomNum}`;
};

const validateNickname = (nickname: string) => {
  if (!nickname) return false;
  const length = nickname.trim().length;
  return length >= 2 && length <= 10;
};

const useChat = create<ChatStore>()(
  persist(
    (set) => ({
      nickname: generateRandomNickname(),
      setNickname: (newNickname: string) => {
        if (validateNickname(newNickname)) {
          set({ nickname: newNickname });
        }
      },
      validateNickname,
      generateRandomNickname,
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ nickname: state.nickname }),
    }
  )
);

export default useChat; 