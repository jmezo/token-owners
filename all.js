const fs = require("fs");
const ethers = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const DEV_TOKEN = "0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26";
const FILE_PATH = "./.transfers/transfers_all.txt";
const CONTRACT_CREATION = 9389482;

const ABI = [
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

const erc20Interface = new ethers.utils.Interface(ABI);

eventId = "Transfer(address,address,uint256)";
transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);
const contract = new ethers.Contract(DEV_TOKEN, ABI, provider);

const main = async () => {
  const blockNum = await provider.getBlockNumber();
  console.log(blockNum);

  onFilter(blockNum);

  // const start = Date.now();
  // await queryFilter(blockNum);
  // const end = Date.now();
  // console.log({ start, end, time: end - start });
};

const onFilter = async (blockNum) => {
  // const filter = { fromBlock: blockNum - 10, toBlock: blockNum, topics };
  // const filter = {  transactionHash: "0xf6de1eefaf994f1bb2db69680ff552726a84a073ebcd68f287d831e5e33fe242" };
  const filter = {  address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52", blockHash: "0x98cd2c883fc5ef1cfa347a3d8ea088fc94f4ab0b7e3176a697551eacfa85807f", topics: [transferTopic] };
  // const filter = {  topics, fromBlock: blockNum-10, toBlock: blockNum };
  const res = await provider.getLogs(filter);
  for (const log of res) {
    const parsed = erc20Interface.parseLog(log);
    console.log(parsed);
  }
};

const queryFilter = async (blockNum) => {
  let from = CONTRACT_CREATION;
  let to = from + 10000;
  while (from < blockNum) {
    const filter = {  topics: [transferTopic], fromBlock: from, toBlock: to };
    const transfers = await provider.getLogs(filter);
    transfers.forEach(parseAndWrite);
    console.log("done with:", from, to);

    from = to + 1;
    to = from + 10000;
  }
  console.log("done at block num:", blockNum);
};

const write = (transfer) => {
  const [from, to, amount] = transfer.args;
  fs.appendFileSync(FILE_PATH, `[${from},${to},${amount}]\n`);
};

const parseAndWrite = (log) => {
  const transfer = erc20Interface.parseLog(log);
  const [from, to, amount] = transfer.args;
  fs.appendFileSync(FILE_PATH, `[${from},${to},${amount}]\n`);
}

main();
