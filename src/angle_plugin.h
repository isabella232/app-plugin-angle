#pragma once

#include "eth_internals.h"
#include "eth_plugin_interface.h"
#include <string.h>

// Number of selectors defined in this plugin. Should match the enum `selector_t`.
// EDIT THIS: Put in the number of selectors your plugin is going to support.
#define NUM_SELECTORS 2

// Name of the plugin.
// EDIT THIS: Replace with your plugin name.
#define PLUGIN_NAME "Angle"

// Enumeration of the different selectors possible.
// Should follow the exact same order as the array declared in main.c
// EDIT THIS: Change the naming (`selector_t`), and add your selector names.
typedef enum {
    MINT = 0,
    BURN,
} selector_t;

// Enumeration used to parse the smart contract data.
// EDIT THIS: Adapt the parameter names here.
typedef enum {
    AMOUNT = 0,
    USER,
    POOL_MANAGER,
    MIN_STABLE_AMOUNT,
    BURNER,
    DEST,
    MIN_COLLAT_AMOUNT,
    UNEXPECTED_PARAMETER,
} parameter;

extern const uint8_t *const ANGLE_SELECTORS[NUM_SELECTORS];

typedef struct mint_ctx_t {
    uint8_t amount[INT256_LENGTH];
    uint8_t user[ADDRESS_LENGTH];
    int16_t poolManagerIndex;
    uint8_t minStableAmount[INT256_LENGTH];
} mint_ctx_t;

typedef struct burn_ctx_t {
    uint8_t amount[INT256_LENGTH];
    uint8_t burner[ADDRESS_LENGTH];
    uint8_t dest[ADDRESS_LENGTH];
    int16_t poolManagerIndex;
    uint8_t minCollatAmount[INT256_LENGTH];
} burn_ctx_t;

// Shared global memory with Ethereum app. Must be at most 5 * 32 bytes.
// EDIT THIS: This struct is used by your plugin to save the parameters you parse. You
// will need to adapt this struct to your plugin.
typedef struct context_t {
    union {
        mint_ctx_t mint_ctx;
        burn_ctx_t burn_ctx;
    };

    // For parsing data.
    uint8_t next_param;  // Set to be the next param we expect to parse.
    uint16_t offset;     // Offset at which the array or struct starts.
    bool go_to_offset;   // If set, will force the parsing to iterate through parameters until
                         // `offset` is reached.

    // For both parsing and display.
    selector_t selectorIndex;
} context_t;

// Piece of code that will check that the above structure is not bigger than 5 * 32. Do not remove
// this check.
_Static_assert(sizeof(context_t) <= 5 * 32, "Structure of parameters too big.");

typedef struct pool_manager_t {
    uint8_t address[ADDRESS_LENGTH];
    char *agToken_ticker;
    uint8_t agToken_decimals;
    char *collateral_ticker;
    uint8_t collateral_decimals;
} pool_manager_t;

// clang-format off
static const pool_manager_t POOL_MANAGERS[] = {
    {{0xe9, 0xf1, 0x83, 0xfc, 0x65, 0x66, 0x56, 0xf1, 0xf1, 0x7a, 0xf1, 0xf2, 0xb0, 0xdf, 0x79, 0xb8, 0xff, 0x9a, 0xd8, 0xed}, "agEUR ", 18, "USDC ", 6 },
    {{0xc9, 0xda, 0xab, 0xc6, 0x77, 0xf3, 0xd1, 0x30, 0x10, 0x06, 0xe7, 0x23, 0xbd, 0x21, 0xc6, 0x0b, 0xe5, 0x7a, 0x59, 0x15}, "agEUR ", 18, "DAI ", 18 },
    {{0x53, 0xb9, 0x81, 0x38, 0x9c, 0xfc, 0x5d, 0xcd, 0xa2, 0xdc, 0x2e, 0x90, 0x31, 0x47, 0xb5, 0xdd, 0x0e, 0x98, 0x5f, 0x44}, "agEUR ", 18, "FEI ", 18 },
    {{0x6b, 0x4e, 0xe7, 0x35, 0x24, 0x06, 0x70, 0x70, 0x03, 0xbc, 0x6f, 0x6b, 0x96, 0x59, 0x5f, 0xd3, 0x59, 0x25, 0xaf, 0x48}, "agEUR ", 18, "FRAX ", 18 },
};
// clang-format on

#define NUMBER_OF_POOL_MANAGERS sizeof(POOL_MANAGERS)
#define POOL_MANAGER_NOT_FOUND  -1

void handle_provide_parameter(void *parameters);
void handle_query_contract_ui(void *parameters);
void handle_init_contract(void *parameters);
void handle_finalize(void *parameters);
void handle_provide_token(void *parameters);
void handle_query_contract_id(void *parameters);