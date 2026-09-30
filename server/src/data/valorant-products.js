const valorantImage = "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png";

const valorantProducts = [
  { name: "475 Valorant Points", price: 179, costPrice: 155 },
  { name: "1,000 Valorant Points", price: 349, costPrice: 315 },
  { name: "2,050 Valorant Points", price: 699, costPrice: 635 },
  { name: "3,650 Valorant Points", price: 1_199, costPrice: 1_090 },
  { name: "5,350 Valorant Points", price: 1_699, costPrice: 1_545 },
  { name: "11,000 Valorant Points", price: 3_399, costPrice: 3_090 },
].map((product) => ({
  ...product,
  gameName: "Valorant",
  description: "เติม Valorant Points เข้าไอดี Riot Games ของคุณ",
  imageUrl: valorantImage,
  stock: 99,
  status: "available",
}));

module.exports = valorantProducts;