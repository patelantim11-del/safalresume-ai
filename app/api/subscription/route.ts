import { getUserFromRequest } from "@/lib/auth";
import { SUBSCRIPTIONS_COLLECTION } from "@/models/subscription";
import { USERS_COLLECTION } from "@/models/user";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getMongoClient();
    const db = client.db();
    const subscriptionsCollection = db.collection(SUBSCRIPTIONS_COLLECTION);

    const subscription = await subscriptionsCollection.findOne({
      userId: user._id || user.email,
    });

    await client.close();

    return NextResponse.json({
      subscription: subscription || {
        plan: "free",
        status: "active",
      },
      user: {
        subscription: user.subscription,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const validPlans = ["free", "pro", "premium"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db();
    const subscriptionsCollection = db.collection(SUBSCRIPTIONS_COLLECTION);
    const usersCollection = db.collection(USERS_COLLECTION);

    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create or update subscription
    const subscriptionData = {
      userId: user._id || user.email,
      plan,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: oneMonthFromNow.toISOString(),
      updatedAt: now.toISOString(),
    };

    await subscriptionsCollection.updateOne(
      { userId: user._id || user.email },
      { $set: subscriptionData },
      { upsert: true },
    );

    // Update user plan
    const userFilter = user._id
      ? { _id: new ObjectId(user._id) }
      : { email: user.email };

    await usersCollection.updateOne(userFilter, {
      $set: {
        subscription: plan,
        subscriptionStatus: "active",
        updatedAt: now.toISOString(),
      },
    });

    await client.close();

    return NextResponse.json({
      message: "Subscription updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}
