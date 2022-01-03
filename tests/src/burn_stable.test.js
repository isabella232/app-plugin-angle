import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// Angle Protocol: Stable Master Front (proxy)
const contractAddr = "0x5addc89785d75c86ab939e9e15bfbbb7fc086a87";
const pluginName = "angle";
const abi_path = `../${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);


// Reference transaction for this test:
// https://etherscan.io/tx/0x6940602f95e82d3c68903e001783f20bd145176831033b66da9373d39d3cd876

test('[Nano S] Burn agEUR for USDC with sender != burner and dest', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f90113018201708459682f00851e3a4dc5ee8303cb9c945addc89785d75c86ab939e9e15bfbbb7fc086a8780b8a46d1042160000000000000000000000000000000000000000000009247656c80b2129e79600000000000000000000000029864b53c8d7509de2ccf5fb76488cfd102ddfd000000000000000000000000029864b53c8d7509de2ccf5fb76488cfd102ddfd0000000000000000000000000e9f183fc656656f1f17af1f2b0df79b8ff9ad8ed0000000000000000000000000000000000000000000000000000000b2d884b41c080a0fee84d44824dc9628bde5e90b4954f41a5f93a02906503dd23739e3ffb7e5022a03455c4c56c169ad9859f4c2a79f06cf2850eb9442e10a185d77f2548009d65d2");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 14 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_burn_ageur_usdc_with_different_burner_and_dest', [14, 0]);

  await tx;
}));


test('[Nano S] Burn agEUR with USDC with sender == burner and dest', zemu("nanos", async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  // Constants used to create the transaction
  // EDIT THIS: Remove what you don't need
  const amount = parseUnits("43173908355374949984150", 'wei');
  const burner = SPECULOS_ADDRESS;
  const dest = SPECULOS_ADDRESS;
  const poolManager = "0xe9f183fc656656f1f17af1f2b0df79b8ff9ad8ed";
  const minCollatAmount = parseUnits("48008547137", 'wei');

  const {data} = await contract.populateTransaction.burn(amount, burner, dest, poolManager, minCollatAmount);

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
    serializedTx
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 7 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_burn_ageur_usdc_with_equal_sender_burner_and_dest', [7, 0]);

  await tx;
}));

// NanoX test (same as nano s)
test.skip('[Nano X] Burn agEUR with USDC with sender != user', zemu("nanox", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f90113018201708459682f00851e3a4dc5ee8303cb9c945addc89785d75c86ab939e9e15bfbbb7fc086a8780b8a46d1042160000000000000000000000000000000000000000000009247656c80b2129e79600000000000000000000000029864b53c8d7509de2ccf5fb76488cfd102ddfd000000000000000000000000029864b53c8d7509de2ccf5fb76488cfd102ddfd0000000000000000000000000e9f183fc656656f1f17af1f2b0df79b8ff9ad8ed0000000000000000000000000000000000000000000000000000000b2d884b41c080a0fee84d44824dc9628bde5e90b4954f41a5f93a02906503dd23739e3ffb7e5022a03455c4c56c169ad9859f4c2a79f06cf2850eb9442e10a185d77f2548009d65d2");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 7 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanox_burn_ageur_usdc_with_different_burner_and_dest', [7, 0]);

  await tx;
}));
