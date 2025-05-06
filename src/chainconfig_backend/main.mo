import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

// ChainConfig: Backend canister for multi-device network configuration on ICP
actor class ChainConfig(admin: Principal) = this {

  // ===== Data Types =====
  public type ConfigStatus = { #Submitted; #Approved; #RolledBack };

  public type Config = {
    id: Nat;
    deviceId: Nat;
    content: Text;
    timestamp: Time.Time;
    author: Principal;
    status: ConfigStatus;
  };

  public type Device = {
    id: Nat;
    name: Text;
    ip: Text;
    deviceType: Text;
    isOnline: Bool;
  };

  public type Log = {
    user: Principal;
    action: Text;
    timestamp: Time.Time;
  };

  // ===== Stable Storage =====
  stable var configs: [Config] = [];
  stable var nextConfigId: Nat = 0;

  stable var devices: [Device] = [];
  stable var nextDeviceId: Nat = 0;

  stable var auditTrail: [Log] = [];

  // ===== Helper: Record Log =====
  func recordLog(user: Principal, action: Text): () {
    let entry: Log = { user = user; action = action; timestamp = Time.now() };
    auditTrail := Array.append<Log>(auditTrail, [entry]);
  };

  // ===== Device Management =====
  // Register a new device (admin only)
  public shared(msg) func register_device(name: Text, ip: Text, deviceType: Text): async Nat {
    if (msg.caller != admin) return 0;
    let id = nextDeviceId;
    let newDevice: Device = {
      id = id;
      name = name;
      ip = ip;
      deviceType = deviceType;
      isOnline = true;
    };
    devices := Array.append<Device>(devices, [newDevice]);
    nextDeviceId += 1;
    recordLog(msg.caller, "register_device:" # Nat.toText(id));
    return id;
  };

  // Query all registered devices
  public query func get_devices(): async [Device] {
    devices
  };

  // ===== Configuration Methods =====

  /// Submit a new configuration for a specific device
  public shared(msg) func submit_config(deviceId: Nat, content: Text): async Nat {
    let caller = msg.caller;
    let id = nextConfigId;
    let newConfig: Config = {
      id = id;
      deviceId = deviceId;
      content = content;
      timestamp = Time.now();
      author = caller;
      status = #Submitted;
    };
    configs := Array.append<Config>(configs, [newConfig]);
    nextConfigId += 1;
    recordLog(caller, "submit_config:" # Nat.toText(id) # "@dev:" # Nat.toText(deviceId));
    return id;
  };

  /// Approve a submitted configuration (admin only)
  public shared(msg) func approve_config(id: Nat): async Bool {
    if (msg.caller != admin) {
      recordLog(msg.caller, "approve_rejected:" # Nat.toText(id));
      return false;
    };
    configs := Array.map<Config, Config>(configs, func(c) : Config {
      if (c.id == id and c.status == #Submitted) { { c with status = #Approved } } else { c }
    });
    recordLog(msg.caller, "approve_config:" # Nat.toText(id));
    return true;
  };

  /// Rollback a configuration to RolledBack status (admin only)
  public shared(msg) func rollback_config(id: Nat): async Bool {
    if (msg.caller != admin) {
      recordLog(msg.caller, "rollback_rejected:" # Nat.toText(id));
      return false;
    };
    configs := Array.map<Config, Config>(configs, func(c) : Config {
      if (c.id == id) { { c with status = #RolledBack } } else { c }
    });
    recordLog(msg.caller, "rollback_config:" # Nat.toText(id));
    return true;
  };

  // ===== Queries =====

  /// Query all configurations
  public query func get_configs(): async [Config] {
    configs
  };

  /// Query the audit trail logs
  public query func get_auditTrail(): async [Log] {
    auditTrail
  };

  /// Delete a configuration (admin only)
public shared(msg) func delete_config(id: Nat): async Bool {
  if (msg.caller != admin) {
    recordLog(msg.caller, "delete_config_rejected:" # Nat.toText(id));
    return false;
  };
  let initialLen = configs.size();
  configs := Array.filter<Config>(configs, func(c) = c.id != id);
  let success = configs.size() < initialLen;
  if (success) {
    recordLog(msg.caller, "delete_config:" # Nat.toText(id));
  };
  return success;
};

/// Delete a device (admin only)
public shared(msg) func delete_device(id: Nat): async Bool {
  if (msg.caller != admin) {
    recordLog(msg.caller, "delete_device_rejected:" # Nat.toText(id));
    return false;
  };
  let initialLen = devices.size();
  devices := Array.filter<Device>(devices, func(d) = d.id != id);
  let success = devices.size() < initialLen;
  if (success) {
    recordLog(msg.caller, "delete_device:" # Nat.toText(id));
  };
  return success;
};

/// Clear audit logs (admin only)
public shared(msg) func clear_auditTrail(): async Bool {
  if (msg.caller != admin) {
    recordLog(msg.caller, "clear_logs_rejected");
    return false;
  };
  auditTrail := [];
  recordLog(msg.caller, "clear_auditTrail");
  return true;
};


};

/*
To deploy with admin argument, ensure dfx.json has no args for backend,
and run:
  export ADMIN_PRINCIPAL=$(dfx identity get-principal)
  dfx deploy chainconfig_backend --argument "(principal \"${ADMIN_PRINCIPAL}\")"
*/
