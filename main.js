const fs = require("fs");
const ethers = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const DEV_TOKEN = "0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26";
const FILE_PATH = "./transfers.txt";
const CONTRACT_CREATION = 9389482;

const ABI = [
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);
const contract = new ethers.Contract(DEV_TOKEN, ABI, provider);

const main = async () => {
  const blockNum = await provider.getBlockNumber();
  console.log(blockNum);

  const start = Date.now();
  queryFilter(blockNum);
  const end = Date.now();
  console.log({start, end, time: end - start;});
};

const queryFilter = async (blockNum) => {
  let from = CONTRACT_CREATION;
  let to = from + 10000;
  while (from < blockNum) {
    const transfers = await contract.queryFilter(contract.filters.Transfer(), from, to);
    transfers.forEach(write);
    console.log("done with:", from, to);

    from = to + 1;
    to = from + 10000;
  }
  console.log("done at block num:", blockNum);
}

const write = (transfer) => {
  const [from, to, amount] = transfer.args;
  fs.appendFileSync(FILE_PATH, `[${from},${to},${amount}]\n`);
}

main();
