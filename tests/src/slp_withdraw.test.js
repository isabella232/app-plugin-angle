import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";


// Reference transaction for this test:
// https://etherscan.io/tx/0x6a7696172a3defa5820d4cff4bbd73166f5456818c4f6b1415d7148285beb0c0

test('[Nano S] Withdraw SLP collateral with sender != burner and dest', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8f301820654847735940085273d0d6d43830237b8945addc89785d75c86ab939e9e15bfbbb7fc086a8780b88423e103a80000000000000000000000000000000000000000000043058422f49fd341b22c000000000000000000000000b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd000000000000000000000000b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd00000000000000000000000053b981389cfc5dcda2dc2e903147b5dd0e985f44c001a0f0158962be5e72c68ff4ab1b2001273914ae845edc60ebcd07f7d0939383fc01a064bb0fff4b9a94565f0867c34cfc265b61e7d45e7ae0d72aaca3ec531ea08c6d");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 14 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_withdraw_slp_collateral_with_different_sender_burner_and_dest', [14, 0]);

  await tx;
}));

test('[Nano S] Withdraw SLP collateral with sender == burner and dest', zemu("nanos", async (sim, eth) => {
  let raw_tx = "0x02f8f301820654847735940085273d0d6d43830237b8945addc89785d75c86ab939e9e15bfbbb7fc086a8780b88423e103a80000000000000000000000000000000000000000000043058422f49fd341b22c000000000000000000000000b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd000000000000000000000000b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd00000000000000000000000053b981389cfc5dcda2dc2e903147b5dd0e985f44c001a0f0158962be5e72c68ff4ab1b2001273914ae845edc60ebcd07f7d0939383fc01a064bb0fff4b9a94565f0867c34cfc265b61e7d45e7ae0d72aaca3ec531ea08c6d";
  raw_tx = raw_tx.replaceAll("b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd", SPECULOS_ADDRESS.substring(2));
  const serializedTx = txFromEtherscan(raw_tx);

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 14 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_withdraw_slp_collateral_with_equal_sender_burner_and_dest', [8, 0]);

  await tx;
}));

// NanoX test (same as nano s)
test.skip('[Nano X] Withdraw SLP collateral with sender != burner and dest', zemu("nanox", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8f301820654847735940085273d0d6d43830237b8945addc89785d75c86ab939e9e15bfbbb7fc086a8780b88423e103a80000000000000000000000000000000000000000000043058422f49fd341b22c000000000000000000000000b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd000000000000000000000000b81a0e6c38c3fec8a171cfe9631f60127a0c5bfd00000000000000000000000053b981389cfc5dcda2dc2e903147b5dd0e985f44c001a0f0158962be5e72c68ff4ab1b2001273914ae845edc60ebcd07f7d0939383fc01a064bb0fff4b9a94565f0867c34cfc265b61e7d45e7ae0d72aaca3ec531ea08c6d");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 17 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanox_withdraw_slp_collateral_with_different_sender_burner_and_dest', [6, 0]);

  await tx;
}));
