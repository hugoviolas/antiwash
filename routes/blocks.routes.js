const { Network, Alchemy, fromHex } = require("alchemy-sdk");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { json } = require("express");
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
      maxCount: 0x3e8,
      category: ["erc721"],
    });

    const nftToken = 9546;
    const result = txHistory.transfers.filter(
      (tx) => fromHex(tx.erc721TokenId) === nftToken
    );
    console.log(result);

    //console.log(txHistory.transfers.length); // Number of TX

    // const jsonExport = JSON.stringify(txHistory);
    // fs.writeFile(
    //   "data.csv",
    //   jsonExport,
    //   {
    //     encoding: "utf8",
    //   },
    //   (err) => {
    //     if (err) console.log(err);
    //     else {
    //       console.log("File written successfully");
    //     }
    //   }
    // );

    res.status(200).json({ txHistory });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
