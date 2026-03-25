/**
 * Razorpay backend integration wrapper.
 * Calls ICP canister methods for Razorpay order management via dynamic actor.
 * The actual backend methods will be available once the canister is deployed with Razorpay support.
 */
import { createActorWithConfig } from "../config";

async function getActor() {
  // Create an anonymous actor for these calls (they require admin auth for setRazorpayKeys)
  const actor = await createActorWithConfig({});
  return actor as any;
}

export const razorpayBackend = {
  async getRazorpayKeyId(): Promise<string> {
    const actor = await getActor();
    if (typeof actor.getRazorpayKeyId !== "function") {
      throw new Error(
        "getRazorpayKeyId is not available on the backend canister. Please deploy the updated canister.",
      );
    }
    return actor.getRazorpayKeyId();
  },
  async createRazorpayOrder(
    amountPaise: bigint,
    receipt: string,
  ): Promise<string> {
    const actor = await getActor();
    if (typeof actor.createRazorpayOrder !== "function") {
      throw new Error(
        "createRazorpayOrder is not available on the backend canister. Please deploy the updated canister.",
      );
    }
    return actor.createRazorpayOrder(amountPaise, receipt);
  },
  async verifyRazorpayPayment(
    paymentId: string,
    expectedOrderId: string,
  ): Promise<boolean> {
    const actor = await getActor();
    if (typeof actor.verifyRazorpayPayment !== "function") {
      throw new Error(
        "verifyRazorpayPayment is not available on the backend canister.",
      );
    }
    return actor.verifyRazorpayPayment(paymentId, expectedOrderId);
  },
  async setRazorpayKeys(keyId: string, keySecret: string): Promise<void> {
    const actor = await getActor();
    if (typeof actor.setRazorpayKeys !== "function") {
      throw new Error(
        "setRazorpayKeys is not available on the backend canister. Please deploy the updated canister.",
      );
    }
    return actor.setRazorpayKeys(keyId, keySecret);
  },
};
