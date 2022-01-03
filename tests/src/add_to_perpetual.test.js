import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";


// Reference transaction for this test:
// https://etherscan.io/tx/0xf79714e53b93b2aabdc5e29e068da2baa7f5bc7ca938835c4bb9b5b20acb75aa

test('[Nano S] Add collateral to perpetual', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0xf8ab81b4851a4f532a008305784f945efe48f8383921d950683c46b87e28e21dea9fb580b84424d83b79000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000002540be40026a08944a4d630584bd26b25d7957b081b47814013b42b5980d201d86a81a070f7daa058c1f8842a6d6262e39aa82d13c0a259326dfd00058ea60377ce8b2ca7a235c2");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 5 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanos_add_collateral_to_perpetual', [5, 0]);

  await tx;
}));

//NanoX test (same as nano s)
test.skip('[Nano X] Add collateral to perpetual', zemu("nanox", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0xf8ab81b4851a4f532a008305784f945efe48f8383921d950683c46b87e28e21dea9fb580b84424d83b79000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000002540be40026a08944a4d630584bd26b25d7957b081b47814013b42b5980d201d86a81a070f7daa058c1f8842a6d6262e39aa82d13c0a259326dfd00058ea60377ce8b2ca7a235c2");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 3 times, then pressing both buttons to accept the transaction.
  await sim.navigateAndCompareSnapshots('.', 'nanox_add_collateral_to_perpetual', [5, 0]);

  await tx;
}));
