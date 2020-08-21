const tontine_Cercle1 = artifacts.require("tontine_Cercle1");

// addressi_Participant from deploying participant contract 

const addressi_Participant = "0x0";
module.exports = function (deployer) {
  deployer.deploy(tontine_Cercle1, addressi_Participant);
};
