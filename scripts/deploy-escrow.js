// Smart Contract Deployment Script for Sepolia Testnet
// Deploy the updated SpinStoresEscrow contract with ERC20 support

const hre = require("hardhat");

async function main() {
    console.log("Deploying SpinStoresEscrow contract to Sepolia...");

    const SpinStoresEscrow = await hre.ethers.getContractFactory("SpinStoresEscrow");
    const escrow = await SpinStoresEscrow.deploy();

    await escrow.deployed();

    console.log("SpinStoresEscrow deployed to:", escrow.address);
    console.log("Save this address to your .env file as NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS");

    // Wait for block confirmations
    console.log("Waiting for block confirmations...");
    await escrow.deployTransaction.wait(5);

    // Verify contract on Etherscan
    console.log("Verifying contract on Etherscan...");
    try {
        await hre.run("verify:verify", {
            address: escrow.address,
            constructorArguments: [],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.log("Verification failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
