#include "helpers.h"
#include "eth_internals.h"
#include "debug.h"

// Copies the whole parameter (32 bytes long) from `src` to `dst`.
// Useful for numbers, data...
void copy_parameter(uint8_t *dst, size_t dst_len, uint8_t *src) {
    // Take the minimum between dst_len and parameter_length to make sure we don't overwrite memory.
    size_t len = MIN(dst_len, PARAMETER_LENGTH);
    memcpy(dst, src, len);
}

// Copies a 20 byte address (located in a 32 bytes parameter) `from `src` to `dst`.
// Useful for token addresses, user addresses...
void copy_address(uint8_t *dst, size_t dst_len, uint8_t *src) {
    // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes!
    size_t offset = PARAMETER_LENGTH - ADDRESS_LENGTH;
    size_t len = MIN(dst_len, ADDRESS_LENGTH);
    memcpy(dst, &src[offset], len);
}

/* Returns the index of the address provided (zero padded left from 21th to 32th bytes, evm
   "encoding") in the POOL_MANAGERS table if found. Otherwise, returns -1*/
int16_t get_manager_contract_index(uint8_t *manager_contract_addr,
                                   const manager_contract_t *manager_list,
                                   int16_t manager_list_size) {
    // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes
    for (size_t i = 0; i < (size_t) manager_list_size; i++) {
        manager_contract_t *manager_contract = (manager_contract_t *) PIC(&manager_list[i]);
        if (memcmp(manager_contract->address, manager_contract_addr, ADDRESS_LENGTH) == 0) {
            return i;
        }
    }
    return MANAGER_CONTRACT_NOT_FOUND;
}

// Approximation of division of 256 bits integer 'margin' and 'covered_amount', on the strong
// assertion that 256 <= margin <= covered_amount <= margin.2^16
// Currently Angle only supports leverages up to 100 in its frontend but who knows, maybe it'll get
// more degen in the future
int compute_leverage(uint16_t *leverage, uint8_t committedAmount[32], uint8_t minNetMargin[32]) {
    uint8_t zero_offset = 0;
    while (committedAmount[zero_offset] == 0 && zero_offset < INT256_LENGTH) {
        zero_offset++;
    }

    // committedAmount should be >= 256
    if (zero_offset >= INT256_LENGTH - 1) {
        return -1;
    }

    uint16_t committedAmount_msb =
        (committedAmount[zero_offset] << 8) + committedAmount[zero_offset + 1];
    uint16_t minNetMargin_msb = (minNetMargin[zero_offset] << 8) + minNetMargin[zero_offset + 1];

    // if minNetMargin_msb == 0, then leverage is at least 2^16
    if (minNetMargin_msb == 0) {
        *leverage = MAX_LEVERAGE_DISPLAYABLE;
    } else {
        *leverage = committedAmount_msb / minNetMargin_msb;
    }

    return 0;
}

// Compute 'max_opening_fees' = 'margin' - 'minNetMargin'
void compute_fees(uint8_t fees[32], uint8_t margin[32], uint8_t minNetMargin[32]) {
    cx_math_sub(fees, margin, minNetMargin, INT256_LENGTH);
}

/*----------------------- UI HELPERS -----------------------*/

// Set UI for a screen showing an amount.
void set_amount_ui(ethQueryContractUI_t *msg,
                   char *title,
                   uint8_t *amount,
                   size_t amount_size,
                   const manager_contract_t *manager_contract_list,
                   size_t manager_contract_list_length,
                   int16_t manager_contract_index,
                   bool is_collateral) {
    strlcpy(msg->title, title, msg->titleLength);

    if (manager_contract_index >= (int16_t) manager_contract_list_length) {
        msg->result = ETH_PLUGIN_RESULT_ERROR;
    } else if (manager_contract_index == MANAGER_CONTRACT_NOT_FOUND) {
        amountToString(amount, amount_size, WEI_TO_ETHER, "UNKNOWN ", msg->msg, msg->msgLength);
    } else {
        manager_contract_t *manager_contract =
            (manager_contract_t *) PIC(&manager_contract_list[manager_contract_index]);
        uint8_t decimals = is_collateral ? manager_contract->collateral_decimals
                                         : manager_contract->agToken_decimals;
        char *ticker = (char *) PIC(is_collateral ? manager_contract->collateral_ticker
                                                  : manager_contract->agToken_ticker);
        amountToString(amount, amount_size, decimals, ticker, msg->msg, msg->msgLength);
    }
}

// Set UI for a screen showing an address.
void set_address_ui(ethQueryContractUI_t *msg, char *title, uint8_t *address) {
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

// Set UI for a screen showing a integer.
void set_integer_ui(ethQueryContractUI_t *msg, char *title, uint8_t *integer, size_t integer_size) {
    strlcpy(msg->title, title, msg->titleLength);

    if (uint256_to_decimal(integer, integer_size, msg->msg, msg->msgLength) == false) {
        THROW(EXCEPTION_OVERFLOW);
    }
}

// Set UI for a screen showing a basic message.
void set_message_ui(ethQueryContractUI_t *msg, char *title, char *message) {
    strlcpy(msg->title, title, msg->titleLength);
    strlcpy(msg->msg, message, msg->msgLength);
}