import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import HttpOutcalls "http-outcalls/outcall";

actor {
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

  // ── Razorpay Config ────────────────────────────────────────────────────────
  private var razorpayKeyId : Text = "";
  private var razorpayKeySecret : Text = "";

  // ── SMTP Config ────────────────────────────────────────────────────────────
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

  // ── WhatsApp (Meta Cloud API) Config ───────────────────────────────────────
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

  // ── Email Log ──────────────────────────────────────────────────────────────
  public type EmailLog = {
    id : Nat;
    emailType : Text;   // "welcome", "order_confirmation", "otp", "seller_welcome"
    recipient : Text;
    subject : Text;
    status : Text;      // "queued", "sent", "failed"
    orderId : Text;
    timestamp : Nat;    // Unix-like counter
  };

  let emailLogs = Map.empty<Nat, EmailLog>();
  private var nextEmailLogId : Nat = 1;
  private var emailLogCounter : Nat = 0;

  // ── WhatsApp Log ───────────────────────────────────────────────────────────
  public type WhatsAppLog = {
    id : Nat;
    messageType : Text;  // "order_placed", "out_for_delivery"
    recipient : Text;
    orderId : Text;
    status : Text;       // "sent", "failed", "queued"
    timestamp : Nat;
  };

  let whatsAppLogs = Map.empty<Nat, WhatsAppLog>();
  private var nextWhatsAppLogId : Nat = 1;

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

  // ── Admin: SMTP Config ─────────────────────────────────────────────────────
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

  // ── Admin: WhatsApp Config ─────────────────────────────────────────────────
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

  // ── Log Email (called from frontend triggers) ─────────────────────────────
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
      status = if (smtpConfig.enabled) "queued" else "logged";
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

  // ── WhatsApp: Send message via Meta Cloud API ──────────────────────────────
  public shared ({ caller }) func sendWhatsAppMessage(
    toPhone : Text,
    messageType : Text,  // "order_placed" or "out_for_delivery"
    orderId : Text,
    customerName : Text,
  ) : async Text {
    let logId = nextWhatsAppLogId;
    nextWhatsAppLogId += 1;

    if (not whatsAppConfig.enabled or whatsAppConfig.accessToken == "") {
      // Log as queued for when config is ready
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
      "Hi " # customerName # "! Your AFLINO Local order #" # orderId # " has been placed successfully. Track your order in the AFLINO app."
    } else {
      "Great news " # customerName # "! Your AFLINO Local order #" # orderId # " is Out for Delivery. Expect it today!"
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

  // ── Admin: check if Razorpay is configured ────────────────────────────────
  public query func isRazorpayConfigured() : async Bool {
    razorpayKeyId != "" and razorpayKeySecret != "";
  };

  // ── Admin: set Razorpay keys ───────────────────────────────────────────────
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

  // ── Create Razorpay order via HTTP outcall ─────────────────────────────────
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

  // ── Verify Razorpay payment ────────────────────────────────────────────────
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

  // HTTP transform function
  public query func transform(input : HttpOutcalls.TransformationInput) : async HttpOutcalls.TransformationOutput {
    HttpOutcalls.transform(input);
  };

  // ── User Profile & Product functions ───────────────────────────────────────
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
