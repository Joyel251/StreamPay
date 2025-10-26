import { ethers } from "hardhat";

/**
 * Helper script to pre-sign nonces for EVVM async withdrawals
 */

async function main() {
  const VAULT_ADDRESS = "0xc63d7425d5f3960EdAB8A28AdF2468c89d3BBE3c";
  
  const [signer] = await ethers.getSigners();
  console.log("\n🔐 Pre-signing Nonces for EVVM\n");
  console.log("Employee:", signer.address);
  
  const vault = await ethers.getContractAt("StreamingVault", VAULT_ADDRESS);
  
  // Generate 4 nonces with dummy hashes
  const nonces = [1, 2, 3, 4];
  const hashes = nonces.map(n => 
    ethers.keccak256(ethers.toUtf8Bytes(`nonce-${n}-${signer.address}`))
  );
  
  console.log("\n📝 Pre-signing nonces:", nonces);
  console.log("Generated hashes:");
  hashes.forEach((hash, i) => console.log(`  Nonce ${nonces[i]}: ${hash}`));
  
  console.log("\n⏳ Submitting pre-signed nonces...");
  const tx = await vault.preSignNonces(nonces, hashes);
  await tx.wait();
  
  console.log("✅ Successfully pre-signed 4 nonces!");
  console.log("\n💡 You can now use withdrawWithNonce(1, amount) to withdraw");
  console.log("   without signing again for each withdrawal!");
  console.log("\n" + "═".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
