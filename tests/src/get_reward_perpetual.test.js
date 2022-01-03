import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";


// Reference transaction for this test:
// https://etherscan.io/tx/0xc5636c25c077652dd8e90943245f6fa81c568a595329d00302b41ba717f88755

test('[Nano S] Get reward of perpetual', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0xf889338517bfac7c008305f4f0945efe48f8383921d950683c46b87e28e21dea9fb580a41c4b774b000000000000000000000000000000000000000000000000000000000000004e26a09f408ab644aff565c856e348bbc23d71d56b130b578acbd00869e1557b4e005ca00c03121086b95ad8f7bdcf3e0abc30499ba34018136753499dfe757c2c38da52");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 5 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_get_reward_of_perpetual', [4, 0]);

  await tx;
}));

// NanoX test (same as nano s)
test.skip('[Nano X] Get reward of perpetual', zemu("nanox", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0xf889338517bfac7c008305f4f0945efe48f8383921d950683c46b87e28e21dea9fb580a41c4b774b000000000000000000000000000000000000000000000000000000000000004e26a09f408ab644aff565c856e348bbc23d71d56b130b578acbd00869e1557b4e005ca00c03121086b95ad8f7bdcf3e0abc30499ba34018136753499dfe757c2c38da52");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 3 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanox_get_reward_of_perpetual', [4, 0]);

  await tx;
}));
