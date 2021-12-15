#include "angle_plugin.h"

// Set UI for a screen showing an amount.
static void set_amount_ui(ethQueryContractUI_t *msg, char* title, uint8_t* amount, size_t amount_size, int16_t pool_manager_index, bool is_collateral) {
    strlcpy(msg->title, title, msg->titleLength);

    if(pool_manager_index >= NUMBER_OF_POOL_MANAGERS){
        msg->result = ETH_PLUGIN_RESULT_ERROR;
    }
    else if(pool_manager_index == POOL_MANAGER_NOT_FOUND){
        amountToString(amount, amount_size, WEI_TO_ETHER, "UNKNOWN ", msg->msg, msg->msgLength);
    }
    else{
        pool_manager_t *pool_manager = (pool_manager_t *) PIC(&POOL_MANAGERS[pool_manager_index]);
        uint8_t decimals = is_collateral?pool_manager->collateral_decimals:pool_manager->agToken_decimals;
        uint8_t ticker = is_collateral?pool_manager->collateral_ticker:pool_manager->agToken_ticker;
        amountToString(amount, amount_size, decimals, ticker, msg->msg, msg->msgLength);
    }
}

// Set UI for a screen showing an address.
static void set_address_ui(ethQueryContractUI_t *msg, char* title, uint8_t* address, size_t address_size) {
    strlcpy(msg->title, title, msg->titleLength);

    // Prefix the address with `0x`.
    msg->msg[0] = '0';
    msg->msg[1] = 'x';

    // We need a random chainID for legacy reasons with `getEthAddressStringFromBinary`.
    // Setting it to `0` will make it work with every chainID :)
    uint64_t chainid = 0;

    // Get the string representation of the address stored in `context->beneficiary`. Put it in
    // `msg->msg`.
    getEthAddressStringFromBinary(
        address,
        msg->msg + 2,  // +2 here because we've already prefixed with '0x'.
        msg->pluginSharedRW->sha3,
        chainid);
}

static void handle_mint_display(ethQueryContractUI_t *msg, context_t *context){
    mint_ctx_t *mint_ctx = &context->mint_ctx;
    switch (msg->screenIndex) {
        case 0:
            set_amount_ui(msg, "Send", mint_ctx->amount, sizeof(mint_ctx->amount), mint_ctx->poolManagerIndex, true);
            break;
        case 1:
            set_amount_ui(msg, "Receive Min.", mint_ctx->minStableAmount, sizeof(mint_ctx->minStableAmount), mint_ctx->poolManagerIndex, false);
            break;
        case 2:
            // optional
            set_address_ui(msg, "Receiver", mint_ctx->user, sizeof(mint_ctx->user));
            break;
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }
}

static void handle_burn_display(ethQueryContractUI_t *msg, context_t *context){
    burn_ctx_t *burn_ctx = &context->burn_ctx;
    switch (msg->screenIndex) {
        case 0:
            set_amount_ui(msg, "Send", burn_ctx->amount, sizeof(burn_ctx->amount), burn_ctx->poolManagerIndex, false);
            break;
        case 1:
            set_address_ui(msg, "From", burn_ctx->burner, sizeof(burn_ctx->burner));
            break;
        case 2:
            set_amount_ui(msg, "Receive Min.", burn_ctx->minCollatAmount, sizeof(burn_ctx->minCollatAmount), burn_ctx->poolManagerIndex, true);
            break;
        case 3:
            // optional
            set_address_ui(msg, "Receiver", burn_ctx->dest, sizeof(burn_ctx->dest));
            break;
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }
}

void handle_query_contract_ui(void *parameters) {
    ethQueryContractUI_t *msg = (ethQueryContractUI_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    // msg->title is the upper line displayed on the device.
    // msg->msg is the lower line displayed on the device.

    // Clean the display fields.
    memset(msg->title, 0, msg->titleLength);
    memset(msg->msg, 0, msg->msgLength);

    msg->result = ETH_PLUGIN_RESULT_OK;

    switch (context->selectorIndex) {
        case MINT:
            handle_mint_display(msg, context);
            break;
        case BURN:
            handle_burn_display(msg, context);
            break;
        // Keep this
        default:
            PRINTF("Selector index: %d not supported\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }
}
