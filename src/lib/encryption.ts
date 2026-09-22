import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// We get the key inside the function to ensure it loads at runtime on the server
function getKey() {
  const keyString = process.env.MASTER_ENCRYPTION_KEY || '';
  const key = Buffer.from(keyString, 'utf-8');
  if (key.length !== 32) {
    throw new Error(`MASTER_ENCRYPTION_KEY must be exactly 32 bytes. Currently it is ${key.length} bytes. Value: "${keyString}"`);
  }
  return key;
}

export function encryptData(text: string) {
  const KEY = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedContent: encrypted,
    iv: iv.toString('hex') + ':' + authTag 
  };
}

export function decryptData(encryptedContent: string, ivWithTag: string) {
  const KEY = getKey();
  const [ivHex, authTagHex] = ivWithTag.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
