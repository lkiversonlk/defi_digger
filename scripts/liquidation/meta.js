exports.Config = {
    "heco_fildaio": {
        "start": 836494,
        "root": {
            "address": "0xb74633f2022452f377403B638167b0A135DB096d",
        },
        "lib": "./compound.js",
        "web3": "wss://ws-mainnet.hecochain.com",
        "gap": 100,
        "batch": 10,
    },
    "okc_flux": {
        "start": 2444458,
        "root": {
            "address": "0x5341F61485241DCDC8d499aA0f9104B522BfcaB9"
        },
        "lib": "./flux.js",
        "web3": "wss://exchainws.okex.org:8443",
        "gap": 100,
        "batch": 10
    }
}