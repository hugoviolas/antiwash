const { Network, Alchemy, fromHex, toHex } = require("alchemy-sdk");
const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/97e8fc84901a47e988cd853cb82b6b07"
  )
);
const erc20abi = require("./../public/abi/erc20abi.json");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { json, response } = require("express");
const settings = {
  apiKey: process.env.API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

router.get("/", async (req, res, next) => {
  try {
    const latestBlock = await alchemy.core.getBlockNumber();
    // const transaction = await alchemy.core.getTransaction(
    //   "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"
    // );
    //const address = "0x9f4f78a6c4a5e6f8afa81631b9120ae3c831b494";

    // axios
    //   .get(
    //     `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.API_KEY}/getContractsForOwner?owner=${address}&pageSize=100`
    //   )
    //   .then((response) => {
    //     const contracts = response.data;
    //     res.status(200).json({ contracts });
    //   });

    // const owners = await alchemy.nft.getOwnersForNft(
    //   "0x96dc73c8b5969608c77375f085949744b5177660",
    //   "11338811"
    // );
    // res.status(200).send({ owners });
    //const toAddress = "0x60e4d786628fea6478f785a6d7e704777c86a7c6";

    // Returns all TX for a NFT stored by desc date
    const nftAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"; // Bored Ape NFT Collection
    const txHistory = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toBlock: latestBlock,
      contractAddresses: [nftAddress],
      excludeZeroValue: true,
      withMetadata: true,
      order: "desc",
      category: ["erc721"],
    });
    // Get one specific token
    // const nftToken = 9546;
    // const result = txHistory.transfers.filter((tx) => {
    //   if (tx.erc721TokenId) {
    //     return fromHex(tx.erc721TokenId) === nftToken;
    //   }
    // });
    //console.log("result: ", result.lenght);

    // Get the longest TX History token
    function getLongestTxHistory() {
      let tokenId;
      let longestHistory = 0;
      let data;
      txHistory.transfers.forEach((elem) => {
        if (elem.erc721TokenId) {
          tokenId = fromHex(elem.erc721TokenId);
          const result = txHistory.transfers.filter((tx) => {
            if (tx.erc721TokenId) {
              return fromHex(tx.erc721TokenId) === tokenId;
            }
          });
          if (result.length > longestHistory) {
            longestHistory = result.length;
            data = result;
          }
        }
      });

      console.log(data.length);

      const jsonExport = JSON.stringify(data);
      fs.writeFile(
        "data.json",
        jsonExport,
        {
          encoding: "utf8",
        },
        (err) => {
          if (err) console.log(err);
          else {
            console.log("File written successfully");
          }
        }
      );
    }

    getLongestTxHistory();

    //console.log(txHistory.transfers.length); // Number of TX
    res.status(200).json({ txHistory });
  } catch (error) {
    next(error);
  }
});

router.get("/nft", async (req, res, next) => {
  try {
    const tokenURIABI = [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "tokenURI",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];

    const tokenContract = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"; // BAYC contract address
    const tokenId = 1927; // A token we'd like to retrieve its metadata of
    const contract = new web3.eth.Contract(tokenURIABI, tokenContract);

    contract
      .getPastEvents("allEvents", { fromBlock: 16485034, toBlock: "latest" })
      .then((response) => {
        console.log(response.length);
        // Convert token ID to HEX
        const token = web3.utils.toHex(tokenId);
        const hexToken = web3.utils.padLeft(token, 64);
        console.log(hexToken);

        //Filter results by token ID
        const data = response.filter((tx) => tx.raw.topics.includes(hexToken));
        console.log(data.length);
        res.status(200).json(response);
      })
      .catch((e) => console.log(e));

    // Get TX Details from TX hash
    web3.eth
      .getTransaction(
        "0x6343ebaa92229f40d67701fc37f12777f2d9f58d63d9987c908d2b925d8b81dc"
      )
      .then((response) => {
        console.log(response);
      });

    // Get TX date
    const blockNumber = 16485177;
    web3.eth
      .getBlock(blockNumber)
      .then((response) => {
        const timestamp = response.timestamp;
        const txDate = new Date(timestamp * 1000);
        console.log(txDate);
      })
      .catch((e) => console.log(e));

    // Get wallet balance
    const tokenAddresses = ["0x123", "0x456"];
    const walletAddress = "0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a";
    web3.eth
      .getBalance(walletAddress)
      .then((response) => console.log("Balance is: ", response))
      .catch((e) => console.log(e));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
