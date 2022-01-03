import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

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
