const latestVersion = '8';

export const checkIsVersionLatest = () => {
  const version = localStorage.getItem('version');

  return version === latestVersion;
};

export const setVersion = () => {
  localStorage.setItem('version', latestVersion);
};
