#include "angle_plugin.h"

void handle_finalize(void *parameters) {
    ethPluginFinalize_t *msg = (ethPluginFinalize_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    msg->uiType = ETH_UI_TYPE_GENERIC;

    switch (context->selectorIndex) {
        case MINT:
            // amount, minStableAmount, (user if user != sender)
            msg->numScreens = 2;
            // If the beneficiary is NOT the sender, we will need an additional screen to display it.
            if (memcmp(msg->address, context->mint_ctx.user, ADDRESS_LENGTH) != 0) {
                msg->numScreens += 1;
            }
            break;
        case BURN:
            // amount, (burner if burner or dest != sender), minCollatAmount, (dest if burner or dest != sender)
            msg->numScreens = 2;
            // If the burner or the beneficiary is NOT the sender, we will need 2 additional screens to display them.
            if (memcmp(msg->address, context->burn_ctx.burner, ADDRESS_LENGTH) != 0 || memcmp(msg->address, context->burn_ctx.dest, ADDRESS_LENGTH) != 0) {
                msg->numScreens += 2;
            }
            break;
        default:
            PRINTF("Selector Index not supported: %d\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }

    msg->result = ETH_PLUGIN_RESULT_OK;
}
