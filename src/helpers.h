#include "angle_plugin.h"

// Copies the whole parameter (32 bytes long) from `src` to `dst`.
// Useful for numbers, data...
void copy_parameter(uint8_t *dst, size_t dst_len, uint8_t *src);

// Copies a 20 byte address (located in a 32 bytes parameter) `from `src` to `dst`.
// Useful for token addresses, user addresses...
void copy_address(uint8_t *dst, size_t dst_len, uint8_t *src);

/* Returns the index of the address provided (zero padded left from 21th to 32th bytes, evm
   "encoding") in the POOL_MANAGERS table if found. Otherwise, returns -1*/
int16_t get_manager_contract_index(uint8_t *address,
                                   const manager_contract_t *manager_list,
                                   int16_t manager_list_size);

// Approximation of division of 256 bits integer 'margin' and 'covered_amount', on the strong
// assertion that 256 <= margin <= covered_amount <= margin.2^16
// Currently Angle only supports leverages up to 100 in its frontend but who knows, maybe it'll get
// more degen in the future
int compute_leverage(uint16_t *leverage, uint8_t committedAmount[32], uint8_t minNetMargin[32]);

// Compute 'max_opening_fees' = 'margin' - 'minNetMargin'
void compute_fees(uint8_t fees[32], uint8_t margin[32], uint8_t minNetMargin[32]);

/*----------------------- UI HELPERS -----------------------*/

// Set UI for a screen showing an amount.
void set_amount_ui(ethQueryContractUI_t *msg,
                   char *title,
                   uint8_t *amount,
                   size_t amount_size,
                   const manager_contract_t *manager_contract_list,
                   size_t manager_contract_list_length,
                   int16_t manager_contract_index,
                   bool is_collateral);

// Set UI for a screen showing an address.
void set_address_ui(ethQueryContractUI_t *msg, char *title, uint8_t *address);

// Set UI for a screen showing a integer.
void set_integer_ui(ethQueryContractUI_t *msg, char *title, uint8_t *integer, size_t integer_size);