import { unlinkSync, readFileSync, appendFileSync, writeFileSync } from 'fs';
import * as crypto from 'crypto';
import { exit } from 'process';

// 1. Stream interface
interface Stream {
  write(data: Buffer | string): void;
  close(): void;
}

// 2. Concrete FileStream
class FileStream implements Stream {
  constructor(private filePath: string) {
    // ensure file is clean
    writeFileSync(filePath, '');
  }
  write(data: Buffer | string): void {
    appendFileSync(this.filePath, data);
  }
  close(): void {/* no-op for sync API */}
}

// 3. Base Decorator
abstract class StreamDecorator implements Stream {
  constructor(protected stream: Stream) {}
  write(data: Buffer | string): void {
    this.stream.write(data);
  }
  close(): void {
    this.stream.close();
  }
}

// 4. Encryption Decorator (AES-256-CTR)
class EncryptionStreamDecorator extends StreamDecorator {
  constructor(stream: Stream, private key: Buffer) {
    super(stream);
  }
  override write(data: Buffer | string): void {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', this.key, iv);
    const enc = Buffer.concat([cipher.update(data), cipher.final()]);
    // prepend IV so we can decrypt later
    super.write(Buffer.concat([iv, enc]));
  }
}

// 5. Demonstration
const DEMO = 'tmp_encrypt.bin';
const key = crypto.randomBytes(32);
const stream = new EncryptionStreamDecorator(new FileStream(DEMO), key);
stream.write('Sensitive design pattern secrets!');
stream.close();

// Verify decryption
const raw = readFileSync(DEMO);
const iv = raw.subarray(0, 16);
const enc = raw.subarray(16);
const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
console.log('Decrypted content:', dec.toString());

unlinkSync(DEMO);
exit(0); 