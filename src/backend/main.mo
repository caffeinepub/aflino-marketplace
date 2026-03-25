import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import HttpOutcalls "http-outcalls/outcall";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";


actor {
  // ──────────────────── AUTH / USER MANAGEMENT ────────────────────
  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();

  type Product = {
    name : Text;
    price : Nat;
    description : Text;
    category : Text;
    seller : Principal;
  };

  var nextProductId = 1;

  // ──────────────────────── PRODUCT REVIEWS ────────────────────────
  public type ReviewStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type ProductReview = {
    reviewId : Text;
    productId : Text;
    userId : Text;
    userName : Text;
    rating : Nat;
    reviewText : Text;
    photoUrls : [Text];
    isVerifiedPurchase : Bool;
    status : ReviewStatus;
    createdAt : Int;
  };

  let productReviews = Map.empty<Text, ProductReview>();
  let productReviewNonce = Map.empty<Text, Nat>();

  func generateReviewId(productId : Text) : Text {
    let currentNonce = switch (productReviewNonce.get(productId)) {
      case (null) { 0 };
      case (?n) { n };
    };
    let id = productId # "-review-" # currentNonce.toText();
    productReviewNonce.add(productId, currentNonce + 1);
    id;
  };

  public shared ({ caller }) func submitReview(
    productId : Text,
    userName : Text,
    rating : Nat,
    reviewText : Text,
    photoUrls : [Text],
    isVerifiedPurchase : Bool,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    if (photoUrls.size() > 3) {
      Runtime.trap("Max 3 photos can be included in a review");
    };

    let reviewId = generateReviewId(productId);

    let review : ProductReview = {
      reviewId;
      productId;
      userId = caller.toText();
      userName;
      rating;
      reviewText;
      photoUrls;
      isVerifiedPurchase;
      status = #pending;
      createdAt = Time.now();
    };

    productReviews.add(reviewId, review);
    reviewId;
  };

  public query func getApprovedReviews(productId : Text) : async [ProductReview] {
    productReviews.values().toArray().filter(
      func(review) {
        review.productId == productId and review.status == #approved
      }
    );
  };

  public query ({ caller }) func getPendingReviews() : async [ProductReview] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    productReviews.values().toArray().filter(
      func(review) {
        review.status == #pending
      }
    );
  };

  public shared ({ caller }) func moderateReview(reviewId : Text, approve : Bool) : async {
    coinsAwarded : Nat;
    newStatus : ReviewStatus;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    if (approve) {
      switch (productReviews.get(reviewId)) {
        case (null) { Runtime.trap("Review not found") };
        case (?review) {
          let coinsToAward = review.photoUrls.size() * 5;
          let updatedReview = { review with status = #approved };
          productReviews.add(reviewId, updatedReview);

          if (coinsToAward > 0) {
            switch (await awardCoinsInternal(caller, review.userId, coinsToAward, "Review(" # reviewId # ") With Photos")) {
              case (#ok(())) {
                { coinsAwarded = coinsToAward; newStatus = #approved };
              };
              case (#err(e)) { Runtime.trap("Coin award failed: " # e) };
            };
          } else {
            { coinsAwarded = 0; newStatus = #approved };
          };
        };
      };
    } else {
      switch (productReviews.get(reviewId)) {
        case (null) { Runtime.trap("Review not found") };
        case (?review) {
          let updatedReview = { review with status = #rejected };
          productReviews.add(reviewId, updatedReview);
          { coinsAwarded = 0; newStatus = #rejected };
        };
      };
    };
  };

  public query func getProductAverageRating(productId : Text) : async {
    averageRating : Float;
    reviewCount : Nat;
  } {
    let approvedReviews = productReviews.values().toArray().filter(
      func(review) {
        review.productId == productId and review.status == #approved
      }
    );

    let count = approvedReviews.size();

    if (count == 0) {
      { averageRating = 0.0; reviewCount = 0 };
    } else {
      let totalRating = approvedReviews.foldLeft(
        0,
        func(acc, r) { acc + r.rating },
      );
      { averageRating = totalRating.toFloat() / count.toInt().toFloat(); reviewCount = count };
    };
  };

  // ──────────────────────── AFLINO COINS ──────────────────────────
  public type CoinTransaction = {
    txId : Text;
    userId : Text;
    amount : Int;
    reason : Text;
    createdAt : Int;
  };

  var nextTxId = 1;
  public type TXID = Nat;
  public type UserId = Text;
  public type Balance = Nat;

  let customerCoins = Map.empty<UserId, Balance>();
  let coinTransactions = Map.empty<TXID, CoinTransaction>();

  public query ({ caller }) func getCustomerCoins(userId : Text) : async Nat {
    // Users can only view their own balance, admins can view any balance
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own coin balance");
    };
    switch (customerCoins.get(userId)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public query ({ caller }) func getCoinHistory(userId : Text) : async [CoinTransaction] {
    // Users can only view their own history, admins can view any history
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own coin history");
    };
    let filteredTxs = coinTransactions.values().toArray().filter(
      func(tx) {
        tx.userId == userId
      }
    );
    filteredTxs.sort(
      func(a, b) {
        Int.compare(b.createdAt, a.createdAt);
      }
    );
  };

  func awardCoinsInternal(creator : Principal, userId : Text, amount : Nat, reason : Text) : async ({
    #ok : ();
    #err : Text;
  }) {
    // Only admins can award coins
    if (not AccessControl.isAdmin(accessControlState, creator)) {
      return #err("Unauthorized: Admin only");
    };

    // Adjust balance
    let newBalance = switch (customerCoins.get(userId)) {
      case (null) { amount };
      case (?balance) { balance + amount };
    };
    customerCoins.add(userId, newBalance);

    // Log transaction
    let txId = nextTxId;
    let coinTx : CoinTransaction = {
      txId = txId.toText();
      userId;
      amount;
      reason;
      createdAt = Time.now();
    };
    coinTransactions.add(txId, coinTx);
    nextTxId += 1;
    #ok(());
  };

  func adjustCoins(userId : Text, delta : Int) : Balance {
    let currentBalance = switch (customerCoins.get(userId)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (delta < 0 and (-delta) > currentBalance) {
      Runtime.trap("Insufficient coins");
    };
    let newBalance = if (delta >= 0) {
      currentBalance + delta.toNat();
    } else {
      Runtime.trap("Cannot convert negative Integer to Nat, because it is negative. ");
    };
    customerCoins.add(userId, newBalance);
    newBalance;
  };

  public shared ({ caller }) func awardCoins(userId : Text, amount : Nat, reason : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    ignore (await awardCoinsInternal(caller, userId, amount, reason));
  };

  public shared ({ caller }) func redeemCoinsAtCheckout(userId : Text, orderId : Text, coinsToRedeem : Nat) : async {
    coinsRedeemed : Nat;
    discountAmountPaise : Nat;
  } {
    // Users can only redeem their own coins
    if (caller.toText() != userId) {
      Runtime.trap("Unauthorized: Can only redeem your own coins");
    };

    let currentBalance = switch (customerCoins.get(userId)) {
      case (null) { 0 };
      case (?b) { b };
    };

    if (coinsToRedeem > currentBalance) {
      Runtime.trap("Insufficient coins");
    };

    let newBalance = currentBalance - coinsToRedeem;
    customerCoins.add(userId, newBalance);

    // Log redemption transaction (negative amount)
    let txId = nextTxId;
    let coinTx : CoinTransaction = {
      txId = txId.toText();
      userId;
      amount = -(coinsToRedeem);
      reason = "Redemption at checkout (order: " # orderId # ")";
      createdAt = Time.now();
    };
    coinTransactions.add(txId, coinTx);

    nextTxId += 1;
    {
      coinsRedeemed = coinsToRedeem;
      discountAmountPaise = coinsToRedeem;
    };
  };

  // ─────── STORAGE (for review photos + B2B documentation) ──────────
  include MixinStorage();

  // ── Smtp Config ──────────────────────────────────────────────
  public type SmtpConfig = {
    host : Text;
    port : Text;
    username : Text;
    password : Text;
    fromEmail : Text;
    fromName : Text;
    enabled : Bool;
  };

  private var smtpConfig : SmtpConfig = {
    host = "";
    port = "587";
    username = "";
    password = "";
    fromEmail = "noreply@aflino.com";
    fromName = "AFLINO Local";
    enabled = false;
  };

  // ── WhatsApp (Meta Cloud API) Config ───────────────────────────────────
  public type WhatsAppConfig = {
    accessToken : Text;
    phoneNumberId : Text;
    wabaId : Text;
    enabled : Bool;
  };

  private var whatsAppConfig : WhatsAppConfig = {
    accessToken = "";
    phoneNumberId = "";
    wabaId = "";
    enabled = false;
  };

  // ── Email Log ────────────────────────────────────────────────────────────
  public type EmailLog = {
    id : Nat;
    emailType : Text;
    recipient : Text;
    subject : Text;
    status : Text;
    orderId : Text;
    timestamp : Nat;
  };

  let emailLogs = Map.empty<Nat, EmailLog>();
  private var nextEmailLogId : Nat = 1;
  private var emailLogCounter : Nat = 0;

  // ── WhatsApp Log ──────────────────────────────────────────────────────────
  public type WhatsAppLog = {
    id : Nat;
    messageType : Text;
    recipient : Text;
    orderId : Text;
    status : Text;
    timestamp : Nat;
  };

  let whatsAppLogs = Map.empty<Nat, WhatsAppLog>();
  private var nextWhatsAppLogId : Nat = 1;

  // ── QR Security: AES-256 Key & Gatepass Tokens ──────────────────────────────
  var aesKeyHex : Text = "";

  public type GatepassEntry = {
    orderId : Text;
    timestamp : Nat;
    used : Bool;
  };

  var gatepassNonce : Nat = 0;
  let gatepassTokens = Map.empty<Text, GatepassEntry>();

  // Admin: set AES-256 key for QR encryption
  public shared ({ caller }) func setAesKey(keyHex : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    aesKeyHex := keyHex;
  };

  // Seller + Admin: get AES key to perform client-side label encryption
  public query ({ caller }) func getAesKey() : async Text {
    if (
      not AccessControl.isAdmin(accessControlState, caller) and
      not AccessControl.hasPermission(accessControlState, caller, #user)
    ) {
      Runtime.trap("Unauthorized");
    };
    aesKeyHex;
  };

  // Public: check if AES key is configured (no secret exposed)
  public query func isAesKeyConfigured() : async Bool {
    aesKeyHex != "";
  };

  // Seller: generate a server-stored gatepass token for an order
  public shared ({ caller }) func generateGatepassToken(orderId : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in as a seller");
    };
    gatepassNonce += 1;
    let part1 = gatepassNonce.toText();
    let part2 = ((gatepassNonce * 6364136223846793 + 1442695040888963) % 999999999999999).toText();
    let tokenRaw = part1 # "|" # part2 # "|" # orderId;
    let token = base64Encode(tokenRaw.encodeUtf8().toArray());
    let entry : GatepassEntry = {
      orderId;
      timestamp = gatepassNonce;
      used = false;
    };
    gatepassTokens.add(token, entry);
    token;
  };

  // Public (no auth): courier scans the QR — verify and consume the token
  public shared func verifyAndConsumeGatepassToken(token : Text) : async {
    success : Bool;
    orderId : Text;
    message : Text;
  } {
    switch (gatepassTokens.get(token)) {
      case null {
        { success = false; orderId = ""; message = "Invalid gatepass. Please ask the seller to regenerate." };
      };
      case (?entry) {
        if (entry.used) {
          { success = false; orderId = entry.orderId; message = "This gatepass has already been used." };
        } else {
          gatepassTokens.add(token, {
            orderId = entry.orderId;
            timestamp = entry.timestamp;
            used = true;
          });
          { success = true; orderId = entry.orderId; message = "Pickup confirmed successfully!" };
        };
      };
    };
  };

  // Base64 helpers
  let b64Alpha : [Char] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".chars().toArray();

  func base64Encode(bytes : [Nat8]) : Text {
    var result = "";
    let n = bytes.size();
    var i = 0;
    while (i < n) {
      let b0 = bytes[i].toNat();
      let b1 = if (i + 1 < n) bytes[i + 1].toNat() else 0;
      let b2 = if (i + 2 < n) bytes[i + 2].toNat() else 0;
      result #= Text.fromChar(b64Alpha[b0 / 4]);
      result #= Text.fromChar(b64Alpha[(b0 % 4) * 16 + b1 / 16]);
      result #= if (i + 1 < n) Text.fromChar(b64Alpha[(b1 % 16) * 4 + b2 / 64]) else "=";
      result #= if (i + 2 < n) Text.fromChar(b64Alpha[b2 % 64]) else "=";
      i += 3;
    };
    result;
  };

  func basicAuth(keyId : Text, keySecret : Text) : Text {
    let raw = keyId # ":" # keySecret;
    let bytes = raw.encodeUtf8().toArray();
    "Basic " # base64Encode(bytes);
  };

  func extractJsonStringField(json : Text, field : Text) : ?Text {
    let searchKey = "\"" # field # "\":\"";
    let parts = json.split(#text searchKey);
    ignore parts.next();
    switch (parts.next()) {
      case null { null };
      case (?afterKey) {
        let closing = afterKey.split(#text "\"");
        closing.next();
      };
    };
  };

  // ── Admin: SMTP Config ──────────────────────────────────────────
  public shared ({ caller }) func setSmtpConfig(config : SmtpConfig) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    smtpConfig := config;
  };

  public query ({ caller }) func getSmtpConfig() : async SmtpConfig {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    smtpConfig;
  };

  // ── Admin: WhatsApp Config ─────────────────────────────────────
  public shared ({ caller }) func setWhatsAppConfig(config : WhatsAppConfig) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    whatsAppConfig := config;
  };

  public query ({ caller }) func getWhatsAppConfig() : async WhatsAppConfig {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    whatsAppConfig;
  };

  // ── Log Email ──────────────────────────────────────────────────
  public shared ({ caller }) func logEmail(
    emailType : Text,
    recipient : Text,
    subject : Text,
    orderId : Text,
  ) : async Nat {
    emailLogCounter += 1;
    let id = nextEmailLogId;
    nextEmailLogId += 1;
    let log : EmailLog = {
      id;
      emailType;
      recipient;
      subject;
      status = if (smtpConfig.enabled) { "queued" } else { "logged" };
      orderId;
      timestamp = emailLogCounter;
    };
    emailLogs.add(id, log);
    id;
  };

  public query ({ caller }) func getEmailLogs() : async [EmailLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    emailLogs.values().toArray();
  };

  // ── WhatsApp: Send message via Meta Cloud API ─────────────
  public shared ({ caller }) func sendWhatsAppMessage(
    toPhone : Text,
    messageType : Text,
    orderId : Text,
    customerName : Text,
  ) : async Text {
    let logId = nextWhatsAppLogId;
    nextWhatsAppLogId += 1;

    if (not whatsAppConfig.enabled or whatsAppConfig.accessToken == "") {
      let log : WhatsAppLog = {
        id = logId;
        messageType;
        recipient = toPhone;
        orderId;
        status = "queued";
        timestamp = logId;
      };
      whatsAppLogs.add(logId, log);
      return "queued";
    };

    let bodyText = if (messageType == "order_placed") {
      "Hi " # customerName # "! Your AFLINO Local order #" # orderId # " has been placed successfully. Track your order in the AFLINO app.";
    } else {
      "Great news " # customerName # "! Your AFLINO Local order #" # orderId # " is Out for Delivery. Expect it today!";
    };

    let body =
      "{\"messaging_product\":\"whatsapp\"," #
      "\"to\":\"" # toPhone # "\"," #
      "\"type\":\"text\"," #
      "\"text\":{\"body\":\"" # bodyText # "\"}}";

    let url = "https://graph.facebook.com/v18.0/" # whatsAppConfig.phoneNumberId # "/messages";
    let headers : [HttpOutcalls.Header] = [
      { name = "Authorization"; value = "Bearer " # whatsAppConfig.accessToken },
      { name = "Content-Type"; value = "application/json" },
    ];

    let response = await HttpOutcalls.httpPostRequest(url, headers, body, transform);

    let status = switch (extractJsonStringField(response, "id")) {
      case (?_) { "sent" };
      case null { "failed" };
    };

    let log : WhatsAppLog = {
      id = logId;
      messageType;
      recipient = toPhone;
      orderId;
      status;
      timestamp = logId;
    };
    whatsAppLogs.add(logId, log);
    status;
  };

  public query ({ caller }) func getWhatsAppLogs() : async [WhatsAppLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    whatsAppLogs.values().toArray();
  };

  // ── Razorpay ─────────────────────────────────────────────
  var razorpayKeyId : Text = "";
  var razorpayKeySecret : Text = "";

  public query func isRazorpayConfigured() : async Bool {
    razorpayKeyId != "" and razorpayKeySecret != "";
  };

  public shared ({ caller }) func setRazorpayKeys(keyId : Text, keySecret : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    razorpayKeyId := keyId;
    razorpayKeySecret := keySecret;
  };

  public query func getRazorpayKeyId() : async Text {
    razorpayKeyId;
  };

  public shared ({ caller }) func createRazorpayOrder(
    amountPaise : Nat,
    receipt : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (razorpayKeyId == "" or razorpayKeySecret == "") {
      Runtime.trap("Razorpay keys not configured. Please set them in Admin Panel.");
    };
    let body =
      "{\"amount\":" # amountPaise.toText() #
      ",\"currency\":\"INR\"" #
      ",\"receipt\":\"" # receipt # "\"" #
      ",\"payment_capture\":1}";
    let auth = basicAuth(razorpayKeyId, razorpayKeySecret);
    let headers : [HttpOutcalls.Header] = [
      { name = "Authorization"; value = auth },
      { name = "Content-Type"; value = "application/json" },
    ];
    let response = await HttpOutcalls.httpPostRequest(
      "https://api.razorpay.com/v1/orders",
      headers,
      body,
      transform,
    );
    switch (extractJsonStringField(response, "id")) {
      case null {
        Runtime.trap("Failed to parse Razorpay order ID. Response: " # response);
      };
      case (?orderId) { orderId };
    };
  };

  public shared ({ caller }) func verifyRazorpayPayment(
    razorpayPaymentId : Text,
    expectedOrderId : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (razorpayKeyId == "" or razorpayKeySecret == "") {
      Runtime.trap("Razorpay keys not configured");
    };
    let auth = basicAuth(razorpayKeyId, razorpayKeySecret);
    let headers : [HttpOutcalls.Header] = [
      { name = "Authorization"; value = auth },
    ];
    let url = "https://api.razorpay.com/v1/payments/" # razorpayPaymentId;
    let response = await HttpOutcalls.httpGetRequest(url, headers, transform);
    let statusOk = switch (extractJsonStringField(response, "status")) {
      case (?s) { s == "captured" or s == "authorized" };
      case null { false };
    };
    let orderOk = switch (extractJsonStringField(response, "order_id")) {
      case (?oid) { oid == expectedOrderId };
      case null { false };
    };
    statusOk and orderOk;
  };

  public query func transform(input : HttpOutcalls.TransformationInput) : async HttpOutcalls.TransformationOutput {
    HttpOutcalls.transform(input);
  };

  // ── User Profile & Product functions ────────────────────────
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async ?UserProfile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(userId);
  };

  public shared ({ caller }) func createProduct(name : Text, price : Nat, description : Text, category : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create products");
    };
    let id = nextProductId;
    nextProductId += 1;
    let product : Product = {
      name;
      price;
      description;
      category;
      seller = caller;
    };
    products.add(id, product);
    id;
  };

  public query func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func updateProduct(productId : Nat, product : Product) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        if (existingProduct.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only owner can update product");
        };
        products.add(productId, product);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (product.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only owner can delete product");
        };
        products.remove(productId);
      };
    };
  };

  public query func getProductsBySeller(seller : Principal) : async [Product] {
    products.values().toArray().filter(func(product) { product.seller == seller });
  };
};
