#include "angle_plugin.h"

// Copies the whole parameter (32 bytes long) from `src` to `dst`.
// Useful for numbers, data...
static void copy_parameter(uint8_t *dst, size_t dst_len, uint8_t *src) {
    // Take the minimum between dst_len and parameter_length to make sure we don't overwrite memory.
    size_t len = MIN(dst_len, PARAMETER_LENGTH);
    memcpy(dst, src, len);
}

// Copies a 20 byte address (located in a 32 bytes parameter) `from `src` to `dst`.
// Useful for token addresses, user addresses...
static void copy_address(uint8_t *dst, size_t dst_len, uint8_t *src) {
    // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes!
    size_t offset = PARAMETER_LENGTH - ADDRESS_LENGTH;
    size_t len = MIN(dst_len, ADDRESS_LENGTH);
    memcpy(dst, &src[offset], len);
}

/* Returns the index of the address provided in the POOL_MANAGERS table if found.
   Otherwise, returns -1*/
static int16_t get_pool_manager_index(uint8_t *src) {
    // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes!
    uint8_t *pool_manager_addr = src + PARAMETER_LENGTH - ADDRESS_LENGTH;
    for (size_t i = 0; i < NUMBER_OF_POOL_MANAGERS; i++) {
        pool_manager_t *pool_manager = (pool_manager_t *) PIC(&POOL_MANAGERS[i]);
        if (memcmp(pool_manager->address, pool_manager_addr, ADDRESS_LENGTH) == 0) {
            return i;
        }
    }
    return POOL_MANAGER_NOT_FOUND;
}
// EDIT THIS: Remove this function and write your own handlers!
static void handle_mint(ethPluginProvideParameter_t *msg, context_t *context) {
    mint_ctx_t *mint_ctx = &context->mint_ctx;
    if (context->go_to_offset) {
        if (msg->parameterOffset != context->offset + SELECTOR_SIZE) {
            return;
        }
        context->go_to_offset = false;
    }
    switch (context->next_param) {
        case AMOUNT:  // amount of collateral
            copy_parameter(mint_ctx->amount, sizeof(mint_ctx->amount), msg->parameter);
            context->next_param = USER;
            break;
        case USER:  // newly minted agToken receiver
            copy_address(mint_ctx->user, sizeof(mint_ctx->user), msg->parameter);
            context->next_param = POOL_MANAGER;
            break;
        case POOL_MANAGER:
            // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes!
            mint_ctx->poolManagerIndex = get_pool_manager_index(msg->parameter);
            context->next_param = MIN_STABLE_AMOUNT;
            break;
        case MIN_STABLE_AMOUNT:  // minimum of agToken to mint for the tx not to fail
            copy_parameter(mint_ctx->minStableAmount,
                           sizeof(mint_ctx->minStableAmount),
                           msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        default:
            PRINTF("Param not supported: %d\n", context->next_param);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}

static void handle_burn(ethPluginProvideParameter_t *msg, context_t *context) {
    burn_ctx_t *burn_ctx = &context->burn_ctx;
    if (context->go_to_offset) {
        if (msg->parameterOffset != context->offset + SELECTOR_SIZE) {
            return;
        }
        context->go_to_offset = false;
    }
    switch (context->next_param) {
        case AMOUNT:  // amount of agToken to burn
            copy_parameter(burn_ctx->amount, sizeof(burn_ctx->amount), msg->parameter);
            context->next_param = BURNER;
            break;
        case BURNER:  // address of the owner of the agTokens to burn
            copy_address(burn_ctx->burner, sizeof(burn_ctx->burner), msg->parameter);
            context->next_param = DEST;
            break;
        case DEST:  // address of the collateral receiver
            copy_address(burn_ctx->dest, sizeof(burn_ctx->dest), msg->parameter);
            context->next_param = POOL_MANAGER;
            break;
        case POOL_MANAGER:
            burn_ctx->poolManagerIndex = get_pool_manager_index(msg->parameter);
            context->next_param = MIN_COLLAT_AMOUNT;
            break;
        case MIN_COLLAT_AMOUNT:  // minimum of collateral to receive for the tx not to fail
            copy_parameter(burn_ctx->minCollatAmount,
                           sizeof(burn_ctx->minCollatAmount),
                           msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        default:
            PRINTF("Param not supported: %d\n", context->next_param);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}

void handle_provide_parameter(void *parameters) {
    ethPluginProvideParameter_t *msg = (ethPluginProvideParameter_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;
    // We use `%.*H`: it's a utility function to print bytes. You first give
    // the number of bytes you wish to print (in this case, `PARAMETER_LENGTH`) and then
    // the address (here `msg->parameter`).
    PRINTF("plugin provide parameter: offset %d\nBytes: %.*H\n",
           msg->parameterOffset,
           PARAMETER_LENGTH,
           msg->parameter);

    msg->result = ETH_PLUGIN_RESULT_OK;

    // EDIT THIS: adapt the cases and the names of the functions.
    switch (context->selectorIndex) {
        case MINT:
            handle_mint(msg, context);
            break;
        case BURN:
            handle_burn(msg, context);
            break;
        default:
            PRINTF("Selector Index not supported: %d\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}