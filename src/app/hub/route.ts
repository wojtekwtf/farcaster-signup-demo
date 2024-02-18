import { getInsecureHubRpcClient, Message } from "@farcaster/hub-nodejs";
import { FARCASTER_GRPC_URL } from "@/constants";

const client = getInsecureHubRpcClient(FARCASTER_GRPC_URL);

export async function POST(req: Request) {
    const data = await req.json();
    const message = Message.fromJSON(data.message)
    const result = await client.submitMessage(message)

    console.log(result)

    if (result.isErr()) {
        return new Response(result.error.message, { status: 400 });
    }

    return new Response(JSON.stringify(result));
}