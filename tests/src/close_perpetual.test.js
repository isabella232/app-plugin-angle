import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// Reference transaction for this test:
// https://etherscan.io/tx/0xd796798e910c98206b30a97acce6ac01c0fa0fb069e69805abe9c516cc456aec

test('[Nano S] Close perpetual', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8d101078459682f00850fc292a81783059b10945efe48f8383921d950683c46b87e28e21dea9fb580b864e5234c7a00000000000000000000000000000000000000000000000000000000000000030000000000000000000000006aaf1da828370ebf05f4286ae17c63043e3be4000000000000000000000000000000000000000000000000000000000000000000c001a05ee9627f100414af264d377b34b9b794eacc14276a7a3d99f68970c4fd681063a0333dabe0adfd67daf81a239b607678e3ddd34fc58e756779899f687e4c203a3c");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 6 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_close_perpetual', [6, 0]);

  await tx;
}));

// NanoX test (same as nano s)
test.skip('[Nano X] Close perpetual', zemu("nanox", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8d101078459682f00850fc292a81783059b10945efe48f8383921d950683c46b87e28e21dea9fb580b864e5234c7a00000000000000000000000000000000000000000000000000000000000000030000000000000000000000006aaf1da828370ebf05f4286ae17c63043e3be4000000000000000000000000000000000000000000000000000000000000000000c001a05ee9627f100414af264d377b34b9b794eacc14276a7a3d99f68970c4fd681063a0333dabe0adfd67daf81a239b607678e3ddd34fc58e756779899f687e4c203a3c");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 4 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanox_close_perpetual', [4, 0]);

  await tx;
}));
