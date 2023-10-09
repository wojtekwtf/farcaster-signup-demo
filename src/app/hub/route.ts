import { getInsecureHubRpcClient, Message } from "@farcaster/hub-nodejs";

const HUB_URL = "3.137.157.154:2283"; // URL + Port of the Hub

const client = getInsecureHubRpcClient(HUB_URL);

export async function POST(req: Request) {
    const data = await req.json();
    const message = Message.fromJSON(data.message)
    const result = await client.submitMessage(message)

    if (result.isErr()) {
        return new Response(result.error.message, { status: 400 });
    }

    return new Response("success");
}