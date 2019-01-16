const generateRandomString = (len: number = 16): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0, pl = possible.length; i < len; ++i) {
    text += possible.charAt(Math.floor(Math.random() * pl));
  }
  return text;
}

export { generateRandomString };
