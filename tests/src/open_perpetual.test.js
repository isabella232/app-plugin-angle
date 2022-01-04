import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// Angle Protocol: Stable Master Front (proxy)
const contractAddr = "0x4121a258674e507c990cdf390f74d4ef27592114";
const pluginName = "angle";
const abi_path = `../${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

// Reference transaction for this test:
// https://etherscan.io/tx/0x3bf0344cfec77fc3ec8767c38ae05dc3b7bd025625eec6d85ed6ca86ced74b13

test('[Nano S] Open perpetual with sender != owner', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f901110129843b9aca00850d8adb0f098306ea1e944121a258674e507c990cdf390f74d4ef2759211480b8a4a62b2a3d00000000000000000000000037ec326e2eaafa21c2b22722c94e06c9084dce7c0000000000000000000000000000000000000000000000a54817b6d1dc8d0baf000000000000000000000000000000000000000000001b528c35413db5ffc9560000000000000000000000000000000000000000000000000c4c13128740a31c000000000000000000000000000000000000000000000073d42ddfc89701c3bec001a090d38bddf7497d8ebe821a441b524b3d4b1549a0e324ad828c442c772a3a1da2a07d5dfa5efd9284df88f4d97a789cf176d4bc5fd5e2b5c0d7086ecd8bd871e631");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 17 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_open_perpetual_with_different_owner', [17, 0]);

  await tx;
}));

test('[Nano S] Open perpetual with sender == owner', zemu("nanos", async (sim, eth) => {
  let raw_tx = "0x02f901110129843b9aca00850d8adb0f098306ea1e944121a258674e507c990cdf390f74d4ef2759211480b8a4a62b2a3d00000000000000000000000037ec326e2eaafa21c2b22722c94e06c9084dce7c0000000000000000000000000000000000000000000000a54817b6d1dc8d0baf000000000000000000000000000000000000000000001b528c35413db5ffc9560000000000000000000000000000000000000000000000000c4c13128740a31c000000000000000000000000000000000000000000000073d42ddfc89701c3bec001a090d38bddf7497d8ebe821a441b524b3d4b1549a0e324ad828c442c772a3a1da2a07d5dfa5efd9284df88f4d97a789cf176d4bc5fd5e2b5c0d7086ecd8bd871e631";
  raw_tx = raw_tx.replace("37ec326e2eaafa21c2b22722c94e06c9084dce7c", SPECULOS_ADDRESS.substring(2));
  const serializedTx = txFromEtherscan(raw_tx);

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 14 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_open_perpetual_with_equal_sender_and_owner', [14, 0]);

  await tx;
}));

test('[Nano S] Open perpetual with huge leverage', zemu("nanos", async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);

    const owner = SPECULOS_ADDRESS;
    const margin = parseUnits("250", 'wei');
    const committedAmount = parseUnits("129026631104596981827926", 'wei');
    const maxOracleRate = parseUnits("886104196984644380", 'wei');
    const minNetMargin = parseUnits("200", 'wei');

    const {data} = await contract.populateTransaction.openPerpetual(owner, margin, committedAmount, maxOracleRate, minNetMargin);

    // Get the generic transaction template
    let unsignedTx = genericTx;
    // Modify `to` to make it interact with the contract
    unsignedTx.to = contractAddr;
    // Modify the attached data
    unsignedTx.data = data;

    // Create serializedTx and remove the "0x" prefix
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

    const tx = eth.signTransaction(
      "44'/60'/0'/0",
      serializedTx,
    );

    // Wait for the application to actually load and parse the transaction
    await waitForAppScreen(sim);
    // Navigate the display by pressing the right button 14 times, then pressing both buttons to accept the transaction.
    await sim.navigateAndCompareSnapshots('.', 'nanos_open_perpetual_with_huge_leverage', [11, 0]);

    await tx;
  }));


test('[Nano S] Open perpetual with leverage < 1 should fail', zemu("nanos", async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  const owner = SPECULOS_ADDRESS;
  const margin = parseUnits("1226631104596981827926", 'wei');
  const maxOracleRate = parseUnits("886104196984644380", 'wei');

  const x = 0x12345678;
  const committedAmount = parseUnits(x.toString(), 'wei');
  const minNetMargin = parseUnits((2*x).toString(), 'wei');

  const {data} = await contract.populateTransaction.openPerpetual(owner, margin, committedAmount, maxOracleRate, minNetMargin);

  // Get the generic transaction template
  let unsignedTx = genericTx;
  // Modify `to` to make it interact with the contract
  unsignedTx.to = contractAddr;
  // Modify the attached data
  unsignedTx.data = data;

  // Create serializedTx and remove the "0x" prefix
  const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  try {
      await tx;
  } catch (error) {
    // 'EthAppPleaseEnableContractData' == 0x6A80, a common error code which actually means here that the plugin had some error parsing the tx
    expect(error["name"]).toBe('EthAppPleaseEnableContractData')
  }

}));

test('[Nano S] Open perpetual with commitedAmount too low should exit', zemu("nanos", async (sim, eth) => {
    const contract = new ethers.Contract(contractAddr, abi);

    const owner = SPECULOS_ADDRESS;
    const margin = parseUnits("1226631104596981827926", 'wei');
    const committedAmount = parseUnits("100", 'wei');
    const maxOracleRate = parseUnits("886104196984644380", 'wei');
    const minNetMargin = parseUnits("1026631104596981827926", 'wei');

    const {data} = await contract.populateTransaction.openPerpetual(owner, margin, committedAmount, maxOracleRate, minNetMargin);

    // Get the generic transaction template
    let unsignedTx = genericTx;
    // Modify `to` to make it interact with the contract
    unsignedTx.to = contractAddr;
    // Modify the attached data
    unsignedTx.data = data;

    // Create serializedTx and remove the "0x" prefix
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

    const tx = eth.signTransaction(
      "44'/60'/0'/0",
      serializedTx,
    );

    try {
        await tx;
    } catch (error) {
      // 'EthAppPleaseEnableContractData' == 0x6A80, a common error code which actually means here that the plugin had some error parsing the tx
      expect(error["name"]).toBe('EthAppPleaseEnableContractData')
    }

  }));

// NanoX test (same as nano s)
test.skip('[Nano X] Open perpetual with sender != owner', zemu("nanox", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f901110129843b9aca00850d8adb0f098306ea1e944121a258674e507c990cdf390f74d4ef2759211480b8a4a62b2a3d00000000000000000000000037ec326e2eaafa21c2b22722c94e06c9084dce7c0000000000000000000000000000000000000000000000a54817b6d1dc8d0baf000000000000000000000000000000000000000000001b528c35413db5ffc9560000000000000000000000000000000000000000000000000c4c13128740a31c000000000000000000000000000000000000000000000073d42ddfc89701c3bec001a090d38bddf7497d8ebe821a441b524b3d4b1549a0e324ad828c442c772a3a1da2a07d5dfa5efd9284df88f4d97a789cf176d4bc5fd5e2b5c0d7086ecd8bd871e631");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 8 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanox_open_perpetual_with_different_owner', [8, 0]);

  await tx;
}));
