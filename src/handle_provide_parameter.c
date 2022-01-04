#include "angle_plugin.h"
#include "helpers.h"

static void handle_agToken(ethPluginProvideParameter_t *msg, context_t *context) {
    agToken_ctx_t *agToken_ctx = &context->agToken_ctx;
    switch (context->next_param) {
        case AMOUNT:  // amount of collateral/agToken
            copy_parameter(agToken_ctx->amount, sizeof(agToken_ctx->amount), msg->parameter);
            context->next_param = context->selectorIndex == MINT ? BENEFICIARY : BURNER;
            break;
        case BURNER:  // address of agToken burner
            copy_address(agToken_ctx->burner, sizeof(agToken_ctx->burner), msg->parameter);
            context->next_param = BENEFICIARY;
            break;
        case BENEFICIARY:  // address of agtoken/collateral receiver
            copy_address(agToken_ctx->beneficiary,
                         sizeof(agToken_ctx->beneficiary),
                         msg->parameter);
            context->next_param = POOL_MANAGER;
            break;
        case POOL_MANAGER:
            // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes!
            agToken_ctx->poolManagerIndex =
                get_manager_contract_index(msg->parameter + PARAMETER_LENGTH - ADDRESS_LENGTH,
                                           POOL_MANAGERS,
                                           NUMBER_OF_POOL_MANAGERS);
            context->next_param = MIN_RECEIVED_AMOUNT;
            break;
        case MIN_RECEIVED_AMOUNT:  // minimum of agToken / collateral to receive for the tx not to
                                   // fail
            copy_parameter(agToken_ctx->min_amount_received,
                           sizeof(agToken_ctx->min_amount_received),
                           msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        default:
            PRINTF("Param not supported: %d\n", context->next_param);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}

static void handle_perpetual(ethPluginProvideParameter_t *msg, context_t *context) {
    perpetual_ctx_t *perpetual_ctx = &context->perpetual_ctx;
    switch (context->next_param) {
        case PERPETUAL_ID:  // ID of an existing perpetual
            copy_parameter(perpetual_ctx->perpetualID,
                           sizeof(perpetual_ctx->perpetualID),
                           msg->parameter);
            context->next_param = context->selectorIndex == ADD_TO_PERPETUAL
                                      ? AMOUNT
                                      : CLOSE_PERPETUAL ? BENEFICIARY : UNEXPECTED_PARAMETER;
            break;
        case BENEFICIARY:  // address of perpetual/collateral receiver
            copy_address(perpetual_ctx->beneficiary,
                         sizeof(perpetual_ctx->beneficiary),
                         msg->parameter);
            context->next_param = AMOUNT;
            break;
        case AMOUNT:  // amount of collateral/agToken
            copy_parameter(perpetual_ctx->amount, sizeof(perpetual_ctx->amount), msg->parameter);
            context->next_param =
                context->selectorIndex == OPEN_PERPETUAL ? COMMITTED_AMOUNT : UNEXPECTED_PARAMETER;
            break;
        case COMMITTED_AMOUNT:  // amount of collateral covered by the perpetual to open
            copy_parameter(perpetual_ctx->committedAmount,
                           sizeof(perpetual_ctx->committedAmount),
                           msg->parameter);
            context->next_param = MAX_ORACLE_RATE;
            break;
        case MAX_ORACLE_RATE:  // maximum price of a unit of collateral denominated in agToken that
                               // is aceptable to open the perpetual (eg: USDC perpetual on agEUR
                               // with max_oracle_rate = 0.9 means that if oracle price goes over 1
                               // USDC = 0.9 agEUR -> abort tx)
            copy_parameter(perpetual_ctx->maxOracleRate,
                           sizeof(perpetual_ctx->maxOracleRate),
                           msg->parameter);
            context->next_param = MIN_NET_MARGIN;
            break;
        case MIN_NET_MARGIN:  // minimum amount to open the perpetual with (original amount sent
                              // minus protocol fees)
        {
            if (compute_leverage(&perpetual_ctx->leverage,
                                 perpetual_ctx->committedAmount,
                                 msg->parameter) != 0) {
                msg->result = ETH_PLUGIN_RESULT_ERROR;
            }
            compute_fees(perpetual_ctx->max_opening_fees, perpetual_ctx->amount, msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
        } break;
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
        case BURN:
            handle_agToken(msg, context);
            break;
        case OPEN_PERPETUAL:
        case ADD_TO_PERPETUAL:
        case CLOSE_PERPETUAL:
        case GET_REWARD_PERPETUAL:
            handle_perpetual(msg, context);
            break;
        default:
            PRINTF("Selector Index not supported: %d\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}