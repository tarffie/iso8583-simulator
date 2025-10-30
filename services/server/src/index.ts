import { parseMessage } from "parser";

const generateResponse = async (request: Request): Promise<Response> => {
  const buffer = await request.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const parsedMessage = parseMessage(bytes);

  // for debugging capabilities
  console.log("MTI:", parsedMessage.mti);
  console.log("Bitmap (hex):", parsedMessage.bitmap);
  console.log(
    "Present fields:",
    Array.from(parsedMessage.fields).sort((a, b) => a - b),
  );

  return new Response(
    JSON.stringify(parsedMessage, (key, value) =>
      value instanceof Set ? Array.from(value) : value,
    ) + "\n",
  );
};

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": (request) => generateResponse(request),
  },
});

console.log(`Listening on ${server.url}`);
