import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying CertificateNFT contract...");

  // Get the contract factory
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  
  // Deploy the contract
  const certificateNFT = await CertificateNFT.deploy();
  
  // Wait for deployment
  await certificateNFT.waitForDeployment();
  
  const address = await certificateNFT.getAddress();
  const network = await ethers.provider.getNetwork();
  
  console.log("✅ CertificateNFT deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("🌐 Network:", network.name, `(Chain ID: ${network.chainId})`);
  
  // Generate explorer URLs based on network
  if (network.chainId === 80001n) {
    // Mumbai Testnet
    console.log("\n🔍 View on Mumbai Polygonscan:");
    console.log(`   https://mumbai.polygonscan.com/address/${address}`);
    console.log("\n🖼️  View on OpenSea Testnet:");
    console.log(`   https://testnets.opensea.io/assets/mumbai/${address}/1`);
  } else if (network.chainId === 11155111n) {
    // Sepolia Testnet
    console.log("\n🔍 View on Sepolia Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${address}`);
    console.log("\n🖼️  View on OpenSea Testnet:");
    console.log(`   https://testnets.opensea.io/assets/sepolia/${address}/1`);
  } else if (network.chainId === 1337n || network.chainId === 31337n) {
    // Local Hardhat
    console.log("\n⚠️  Local network - Contract not publicly searchable");
  }
  
  console.log("\n📝 Add to your .env file:");
  console.log(`   CERTIFICATE_CONTRACT_ADDRESS=${address}`);
  console.log(`   BLOCKCHAIN_NETWORK=${network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


