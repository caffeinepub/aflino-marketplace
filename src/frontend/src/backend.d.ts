import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WhatsAppLog {
    id: bigint;
    status: string;
    recipient: string;
    orderId: string;
    messageType: string;
    timestamp: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SmtpConfig {
    username: string;
    fromEmail: string;
    host: string;
    password: string;
    port: string;
    enabled: boolean;
    fromName: string;
}
export interface EmailLog {
    id: bigint;
    status: string;
    subject: string;
    recipient: string;
    orderId: string;
    timestamp: bigint;
    emailType: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface WhatsAppConfig {
    enabled: boolean;
    accessToken: string;
    phoneNumberId: string;
    wabaId: string;
}
export interface CoinTransaction {
    userId: string;
    createdAt: bigint;
    txId: string;
    amount: bigint;
    reason: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ProductReview {
    status: ReviewStatus;
    userName: string;
    photoUrls: Array<string>;
    userId: string;
    createdAt: bigint;
    reviewText: string;
    productId: string;
    isVerifiedPurchase: boolean;
    rating: bigint;
    reviewId: string;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Product {
    name: string;
    description: string;
    seller: Principal;
    category: string;
    price: bigint;
}
export enum ReviewStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardCoins(userId: string, amount: bigint, reason: string): Promise<void>;
    createProduct(name: string, price: bigint, description: string, category: string): Promise<bigint>;
    createRazorpayOrder(amountPaise: bigint, receipt: string): Promise<string>;
    deleteProduct(productId: bigint): Promise<void>;
    generateGatepassToken(orderId: string): Promise<string>;
    getAesKey(): Promise<string>;
    getAllProducts(): Promise<Array<Product>>;
    getApprovedReviews(productId: string): Promise<Array<ProductReview>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoinHistory(userId: string): Promise<Array<CoinTransaction>>;
    getCustomerCoins(userId: string): Promise<bigint>;
    getEmailLogs(): Promise<Array<EmailLog>>;
    getPendingReviews(): Promise<Array<ProductReview>>;
    getProduct(productId: bigint): Promise<Product>;
    getProductAverageRating(productId: string): Promise<{
        averageRating: number;
        reviewCount: bigint;
    }>;
    getProductsBySeller(seller: Principal): Promise<Array<Product>>;
    getRazorpayKeyId(): Promise<string>;
    getSmtpConfig(): Promise<SmtpConfig>;
    getUserProfile(userId: Principal): Promise<UserProfile | null>;
    getWhatsAppConfig(): Promise<WhatsAppConfig>;
    getWhatsAppLogs(): Promise<Array<WhatsAppLog>>;
    isAesKeyConfigured(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isRazorpayConfigured(): Promise<boolean>;
    logEmail(emailType: string, recipient: string, subject: string, orderId: string): Promise<bigint>;
    moderateReview(reviewId: string, approve: boolean): Promise<{
        newStatus: ReviewStatus;
        coinsAwarded: bigint;
    }>;
    redeemCoinsAtCheckout(userId: string, orderId: string, coinsToRedeem: bigint): Promise<{
        discountAmountPaise: bigint;
        coinsRedeemed: bigint;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendWhatsAppMessage(toPhone: string, messageType: string, orderId: string, customerName: string): Promise<string>;
    setAesKey(keyHex: string): Promise<void>;
    setRazorpayKeys(keyId: string, keySecret: string): Promise<void>;
    setSmtpConfig(config: SmtpConfig): Promise<void>;
    setWhatsAppConfig(config: WhatsAppConfig): Promise<void>;
    submitReview(productId: string, userName: string, rating: bigint, reviewText: string, photoUrls: Array<string>, isVerifiedPurchase: boolean): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(productId: bigint, product: Product): Promise<void>;
    verifyAndConsumeGatepassToken(token: string): Promise<{
        orderId: string;
        message: string;
        success: boolean;
    }>;
    verifyRazorpayPayment(razorpayPaymentId: string, expectedOrderId: string): Promise<boolean>;
}
