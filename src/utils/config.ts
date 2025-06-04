// project/src/utils/config.ts
// (unchanged)
export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  return null;
};

const adjectives = ['Happy', 'Curious', 'Brave', 'Clever', 'Swift', 'Calm', 'Bold', 'Bright'];
const animals = ['Dolphin', 'Panda', 'Tiger', 'Eagle', 'Fox', 'Wolf', 'Hawk', 'Otter'];

export const generateUsername = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${animal}${number}`;
};
