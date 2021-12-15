#include "angle_plugin.h"

// We don't manipulate erc20 directly but use PoolManagers instead, so we skip this step
void handle_provide_token(void *parameters) {
    ethPluginProvideToken_t *msg = (ethPluginProvideToken_t *) parameters;
    msg->result = ETH_PLUGIN_RESULT_OK;
}