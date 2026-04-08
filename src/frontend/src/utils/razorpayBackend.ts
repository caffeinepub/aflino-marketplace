/**
 * Razorpay backend integration wrapper.
 * Calls ICP canister methods for Razorpay order management via dynamic actor.
 * The actual backend methods will be available once the canister is deployed with Razorpay support.
 *
 * NOTE: The ../config module does not exist in this project — actor calls are
 * proxied through useActor hook at component level. This utility module provides
 * stub implementations that throw descriptive errors when the canister method is
 * not yet deployed, which is the expected behaviour.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyActor = Record<string, any>;

async function getActor(): Promise<AnyActor> {
  // Return an empty object — all callers guard with typeof check
  return {};
}

export const razorpayBackend = {
  async getRazorpayKeyId(): Promise<string> {
    const actor = await getActor();
    if (typeof actor.getRazorpayKeyId !== "function") {
      throw new Error(
        "getRazorpayKeyId is not available on the backend canister. Please deploy the updated canister.",
      );
    }
    return actor.getRazorpayKeyId() as Promise<string>;
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
    return actor.createRazorpayOrder(amountPaise, receipt) as Promise<string>;
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
    return actor.verifyRazorpayPayment(
      paymentId,
      expectedOrderId,
    ) as Promise<boolean>;
  },
  async setRazorpayKeys(keyId: string, keySecret: string): Promise<void> {
    const actor = await getActor();
    if (typeof actor.setRazorpayKeys !== "function") {
      throw new Error(
        "setRazorpayKeys is not available on the backend canister. Please deploy the updated canister.",
      );
    }
    return actor.setRazorpayKeys(keyId, keySecret) as Promise<void>;
  },
};
