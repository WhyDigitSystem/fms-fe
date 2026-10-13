import CryptoJS from 'crypto-js';

// Encrypt the URL using AES
export const encryptUrl = (url, secretKey) => {
  return CryptoJS.AES.encrypt(url, secretKey).toString();
};

// Decrypt the URL using AES
export const decryptUrl = (encryptedUrl, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedUrl, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
