import type { Bitmap } from "message";

const parseBitmap = (buffer: Uint8Array, offset: number): Bitmap => {
  const fields = new Set<number>();
  let bytesRead = 8;

  for (let byteIndex = 0; byteIndex < 8; byteIndex++) {
    const byte = buffer[offset + byteIndex];

    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      const mask = 0x80 >> bitIndex; // 10000000, 01000000, etc.

      if (byte! & mask) {
        const fieldNumber = byteIndex * 8 + bitIndex + 1;
        fields.add(fieldNumber);
      }
    }
  }import type { Bitmap } from "message";

const parseBitmap = (buffer: Uint8Array, offset: number): Bitmap => {
  const fields = new Set<number>();
  let bytesRead = 8;

  for (let byteIndex = 0; byteIndex < 8; byteIndex++) {
    const byte = buffer[offset + byteIndex];

    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      const mask = 0x80 >> bitIndex; // 10000000, 01000000, etc.

      if (byte! & mask) {
        const fieldNumber = byteIndex * 8 + bitIndex + 1;
        fields.add(fieldNumber);
      }
    }
  }

  // If bit 1 is set, parse secondary bitmap (another 8 bytes)
  if (fields.has(1)) {
    fields.delete(1); // Bit 1 just indicates secondary bitmap presence
    bytesRead = 16;

    for (let byteIndex = 8; byteIndex < 16; byteIndex++) {
      const byte = buffer[offset + byteIndex];

      for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
        const mask = 0x80 >> bitIndex;

        if (byte! & mask) {
          const fieldNumber = byteIndex * 8 + bitIndex + 1;
          fields.add(fieldNumber);
        }
      }
    }
  }

  return { fields, bytesRead };
};

const parseMessage = (buffer: Uint8Array) => {
  if (!buffer || buffer.length === 0) {
    throw new Error(
      "Couldn't parse buffer message. Maybe buffer wasn't a `Uint8Array`?",
    );
  }

  let offset = 0;
  const mti = String.fromCharCode(
    buffer[0] as number,
    buffer[offset + 1] as number,
    buffer[offset + 2] as number,
    buffer[offset + 3] as number,
  );
  offset += 4;

  const { fields, bytesRead } = parseBitmap(buffer, offset);
  offset += bytesRead;

  const bitmapBytes = buffer.slice(offset - bytesRead, offset);
  const bitmap = Array.from(bitmapBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { mti, fields, bitmap };
};

export { parseMessage };


  // If bit 1 is set, parse secondary bitmap (another 8 bytes)
  if (fields.has(1)) {
    fields.delete(1); // Bit 1 just indicates secondary bitmap presence
    bytesRead = 16;

    for (let byteIndex = 8; byteIndex < 16; byteIndex++) {
      const byte = buffer[offset + byteIndex];

      for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
        const mask = 0x80 >> bitIndex;

        if (byte! & mask) {
          const fieldNumber = byteIndex * 8 + bitIndex + 1;
          fields.add(fieldNumber);
        }
      }
    }
  }

  return { fields, bytesRead };
};

const parseMessage = (buffer: Uint8Array) => {
  if (!buffer || buffer.length === 0) {
    throw new Error(
      "Couldn't parse buffer message. Maybe buffer wasn't a `Uint8Array`?",
    );
  }

  // Detect if this is hex-ascii data (like from curl --data)
  const firstFourBytes = buffer.slice(0, 4);
  const isHexAscii = firstFourBytes.every((b) => {
    // Check if bytes are ASCII characters for hex digits (0-9, A-F, a-f)
    return (
      (b >= 0x30 && b <= 0x39) || // 0-9
      (b >= 0x41 && b <= 0x46) || // A-F
      (b >= 0x61 && b <= 0x66)
    ); // a-f
  });

  if (isHexAscii) {
    throw new Error(
      "This parser only accepts binary data. " +
        "You sent hex-ascii data. " +
        "Use --data-binary with actual binary bytes instead of --data with hex string. " +
        "Example: printf '...' | curl -X POST --data-binary @- http://localhost:3000",
    );
  }

  let offset = 0;
  const mti = String.fromCharCode(
    buffer[0] as number,
    buffer[offset + 1] as number,
    buffer[offset + 2] as number,
    buffer[offset + 3] as number,
  );
  offset += 4;

  const { fields, bytesRead } = parseBitmap(buffer, offset);
  offset += bytesRead;

  const bitmapBytes = buffer.slice(offset - bytesRead, offset);
  const bitmap = Array.from(bitmapBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { mti, fields, bitmap };
};

export { parseMessage };
