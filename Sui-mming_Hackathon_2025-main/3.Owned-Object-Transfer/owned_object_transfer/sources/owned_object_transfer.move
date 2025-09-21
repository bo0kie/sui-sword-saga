/// Module: owned_object_transfer
module owned_object_transfer::owned_object_transfer;

use std::string::String;

public struct OwnedObject has key, store {
  id: UID,
  name: String
}

public fun new_object(name: String, ctx: &mut TxContext): OwnedObject {
  OwnedObject {
    id: object::new(ctx),
    name
  }
}

entry fun mint_object(name: String, ctx: &mut TxContext) {
  let new_object = new_object(name, ctx);
  transfer::transfer(new_object, ctx.sender());
}

