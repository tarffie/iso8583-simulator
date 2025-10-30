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
  }

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
