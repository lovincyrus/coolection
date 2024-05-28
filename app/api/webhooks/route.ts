import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

import { saveOrUpdateUser } from "@/lib/save-or-update-user";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // See: https://clerk.com/docs/integrations/webhooks/sync-data
  // const { id: userId } = evt.data;
  // const eventType = evt.type;
  // console.log(`Webhook with and ID of ${userId} and type of ${eventType}`);
  // console.log("Webhook body:", body);

  if (evt.type === "user.created") {
    const userData = {
      userId: evt.data.id,
      email: evt.data.email_addresses[0].email_address,
      firstName: evt.data.first_name,
      lastName: evt.data.last_name,
      createdAt: evt.data.created_at,
      updatedAt: evt.data.updated_at,
    };

    await saveOrUpdateUser(userData);
  }

  return new Response("", { status: 200 });
}
