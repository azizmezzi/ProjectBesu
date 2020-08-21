var User = require("../models/Users");
var Notifications = require("../models/Notifications");
var tontineModel = require("../models/tontine");
var MobileDetect = require("mobile-detect");
var cron = require("node-cron");
var schedule = require("node-schedule");
var Web3 = require("web3");
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const Contract = require("../contract");
var tontine = new web3.eth.Contract(Contract.Abi2, Contract.address2);

const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");

function getTime() {
  return Date.now();
}
function getType(md) {
  if (md.mobile() == null) {
    return "Web";
  } else return "Mobile";
}
function getAmount(amount) {
  return amount;
}
const getSex = async (id) => {
  return new Promise(async (resolve) => {
    var data = "";

    await User.find({
      wallet: id,
    }).then((res) => {
      data = res[0].Sex;
    });

    resolve(data);
  });
};
const getProfession = async (id) => {
  return new Promise(async (resolve) => {
    var data = "";

    await User.find({
      wallet: id,
    }).then((res) => {
      data = res[0].Profession;
    });

    resolve(data);
  });
};
const getAge = async (id) => {
  return new Promise(async (resolve) => {
    var data = "";

    await User.find({
      wallet: id,
    }).then((res) => {
      data = res[0].Age;
    });

    resolve(data);
  });
};
const getAgence = async (id) => {
  return new Promise(async (resolve) => {
    var data = "";

    await User.find({
      wallet: id,
    }).then((res) => {
      data = res[0].Agence;
    });

    resolve(data);
  });
};

/* ****************POST Function ********************************** */

signTransaction = (addressTo1) => {
  const Web3 = require("web3");
  const ethTx = require("ethereumjs-tx");
  const readline = require("readline");

  async function askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }

  const args = process.argv.slice(2);

  // web3 initialization - must point to the HTTP JSON-RPC endpoint
  var provider = args[0] || "http://localhost:8545";
  console.log("******************************************");
  console.log("Using provider : " + provider);
  console.log("******************************************");
  var web3 = new Web3(new Web3.providers.HttpProvider(provider));
  web3.transactionConfirmationBlocks = 1;
  // Sender address and private key
  // Second acccount in dev.json genesis file
  // Exclude 0x at the beginning of the private key
  const addressFrom = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
  const privKey = Buffer.from(
    "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
    "hex"
  );

  // Receiver address and value to transfer
  // Third account in dev.json genesis file
  const addressTo = addressTo1;
  const valueInEther = 100;

  // Get the address transaction count in order to specify the correct nonce
  web3.eth
    .getTransactionCount(addressFrom, "pending")
    .then((txnCount) => {
      // Create the transaction object
      var txObject = {
        nonce: web3.utils.numberToHex(txnCount),
        gasPrice: web3.utils.numberToHex(1000),
        gasLimit: web3.utils.numberToHex(21000),
        to: addressTo,
        value: web3.utils.numberToHex(
          web3.utils.toWei(valueInEther.toString(), "ether")
        ),
      };

      // Sign the transaction with the private key
      var tx = new ethTx(txObject);
      tx.sign(privKey);

      //Convert to raw transaction string
      var serializedTx = tx.serialize();
      var rawTxHex = "0x" + serializedTx.toString("hex");

      // log raw transaction data to the console so you can send it manually
      console.log("Raw transaction data: " + rawTxHex);

      // but also ask you if you want to send this transaction directly using web3
      web3.eth
        .sendSignedTransaction(rawTxHex)
        .on("receipt", (receipt) => {
          console.log("Receipt: ", receipt);
        })
        .catch((error) => {
          console.log("Error: ", error.message);
        });
    })
    .catch((error) => {
      console.log("Error: ", error.message);
    });
};

/******************* Fonction pour Tontine ********************************** */

const getTontineFunc = async (
  ID_Tontine,
  inscrit,
  dateInvitation,
  ListParticipants
) => {
  return new Promise((resolve) => {
    tontine.methods.getTontine(ID_Tontine).call(function (err, results) {
      //  console.log("etat", results["6"]);
      //   console.log("idto", ID_Tontine);

      resolve({
        ID_Tontine,
        Nom_Tontine: results["0"],
        montant: results["2"],
        nbr_part: results["1"],
        etat: results["6"],
        nbr_cycle: results["3"],
        frequence: results["4"],
        inscrit,
        dateInvitation,
        ListParticipants,
      });
    });
  });
};

/***********************Requete ************************* */

exports.createTontine = async (req, res) => {
  const decryptedPK = cryptr.decrypt(req.body.privateKey);

  var ordre = 1;
  var mondataires_address = [];
  var ParticipantsList = [];
  var participantsList = JSON.parse(req.body.participantsList);
  const currentOrder = JSON.parse(req.body.currentOrder);
  console.log("ttttttt");
  console.log(participantsList);
  console.log(currentOrder);
  for (let p = 0; p < participantsList.length; p++) {
    for (let t = 0; t < currentOrder.length; t++) {
      if (currentOrder[t] == p) {
        participantsList[p].ordre = t + 1;
      }
    }
    if (participantsList[p].createur) {
      ordre = participantsList[p].ordre;
    }
    ParticipantsList.push({
      addressParticipant: participantsList[p].address,
      ordreParticiant: participantsList[p].ordre,
      createur: participantsList[p].createur,
      mondataire: participantsList[p].mondataire,
    });
    if (participantsList[p].mondataire) {
      mondataires_address.push(participantsList[p].address);
    }
  }
  //   console.log(
  //     req.body.ID_Tontine,
  //     req.body.Nom_Tontine,
  //     parseInt(req.body.Montant, 10),
  //     participantsList.length,
  //     parseInt(req.body.Nbr_cycles, 10),
  //     req.body.Frequence,
  //     ordre
  //   );

  var acc = web3.eth.accounts.create();
  web3.eth.accounts.wallet.add(acc.privateKey);
  const account = acc.address;

  //userData.wallet = account;
  const encryptedPK = cryptr.encrypt(acc.privateKey);
  //userData.encrypt = encryptedPK;
  await signTransaction(account);
  //var ID_Tontine = Math.floor(Math.random() * (98989898 - 1214 + 1)) + 1214;
  var ID_Tontine = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  console.log(
    ID_Tontine,
    req.body.Nom_Tontine,
    parseInt(req.body.Montant, 10),
    participantsList.length,
    parseInt(req.body.Nbr_cycles, 10),
    req.body.Frequence,
    ordre,
    req.body.address,
    account
  );
  web3.eth.accounts.wallet.add(decryptedPK);
  tontine.methods
    .addTontine(
      ID_Tontine,
      req.body.Nom_Tontine,
      parseInt(req.body.Montant, 10),
      participantsList.length,
      parseInt(req.body.Nbr_cycles, 10),
      req.body.Frequence,
      ordre,
      req.body.address,
      account
    )
    .send({ from: req.body.address, gas: 30000000 }, async function (
      error,
      result
    ) {
      if (!error) {
        res.send({ ID_Tontine });
        var Sex = await getSex(req.body.address);
        var Profession = await getProfession(req.body.address);
        var Age = await getAge(req.body.address);
        var Agence = await getAgence(req.body.address);
        console.log(
          "******************************************************************************************************"
        );
        console.log(tontineData);
        var tontineData = {
          ID_Tontine,
          Time: getTime(),
          Type: getType(new MobileDetect(req.headers["user-agent"])),
          Amount: req.body.Montant,
          Sex: Sex,
          Age: Age,
          Profession: Profession,
          Agence: Agence,
          Etat: "En Cours",
        };
        var tontine = new tontineModel(tontineData);
        tontine.save((err, res) => {
          console.log({ res, err });
        });
        for (let i = 0; i < participantsList.length; i++) {
          if (!participantsList[i].createur) {
            var Notif = new Notifications({
              IdTontine: ID_Tontine,
              NomTontine: req.body.Nom_Tontine,
              TypeNotification: "invitation",
              borrower: participantsList[i].address,
              DateTontine: 0,
              Ordre: participantsList[i].ordre,
              Cumule: 0,
              Iteration: 0,
              Montant: parseInt(req.body.Montant, 10),
            });

            Notif.save(function (err, NotifE) {
              if (err) {
                console.log("error");
                console.log(err);
                //                    res.status(804).end();
                return console.error(err);
              }
              console.log("saved to db");
            });
          }

          User.findOne({ wallet: participantsList[i].address }, async function (
            err,
            user
          ) {
            if (err) {
              res.json("error");
            } else {
              const IdTontine = user.IdTontine;
              const date_Actuel = new Date();
              IdTontine.push({
                Id_Tontine: ID_Tontine,
                Nom_Tontine: req.body.Nom_Tontine,
                inscrit: participantsList[i].createur,
                mondataire: participantsList[i].mondataire,
                mondataire1: mondataires_address[0],
                mondataire2: mondataires_address[1],
                ListParticipants: ParticipantsList,
                nbPar: participantsList.length,
                montant: req.body.Montant,
                ordre: participantsList[i].ordre,
                DateInvitation: date_Actuel.getTime() / 1000,
                wallet: account,
                encrypt: encryptedPK,
              });
              //    console.log("rerere");
              //      console.log(ParticipantsList);
              //     console.log("rrreza");
              //     console.log(IdTontine);
              User.update(
                { wallet: participantsList[i].address },
                { IdTontine: IdTontine },
                async function (err, user) {
                  if (err) {
                    res.json("error");
                  } else {
                    //     console.log(user);
                  }
                }
              );
            }
          });
        }
        console.log(error);
      }
    })

    .catch((e) => {
      console.log(e);
      res.status(900).send("creation Tontine invalid");
    });
};

exports.addParticipant = (req, res) => {
  const decryptedPK = cryptr.decrypt(req.body.privateKey);
  web3.eth.accounts.wallet.add(decryptedPK);

  User.findOne({ wallet: req.body.address }, function (err, user) {
    if (err) {
      res.json("error");
    } else {
      const IdTontine = user.IdTontine;
      var mondataires_address = [];
      var ordre = 0;
      var addresstontine = "";
      for (let j = 0; j < IdTontine.length; j++) {
        if (req.body.ID_Tontine == IdTontine[j].Id_Tontine) {
          IdTontine[j].inscrit = true;
          ordre = IdTontine[j].ordre;
          addresstontine = IdTontine[j].wallet;
          encryptedPK = IdTontine[j].encrypt;
          mondataires_address.push(IdTontine[j].mondataire1);
          mondataires_address.push(IdTontine[j].mondataire2);
        }
      }
      console.log(mondataires_address);
      // console.log(req.body.ID_Tontine, ordre, req.body.decline);
      var decline = false;
      if (req.body.decline == 1) decline = true;
      console.log(req.body.ID_Tontine, ordre, decline, addresstontine);
      tontine.methods
        .addParticipant(req.body.ID_Tontine, ordre, decline, addresstontine)
        .send({ from: req.body.address, gas: 30000000 }, function (
          error,
          result
        ) {
          tontine.methods
            .setTransactionHash(result, 0, req.body.ID_Tontine)
            .send({ from: req.body.address, gas: 30000000 }, function (
              error,
              resultHash
            ) {
              if (!error) {
                Notifications.updateOne(
                  { IdTontine: req.body.ID_Tontine },
                  { elimine: true },
                  function (err, notification) {
                    if (err) {
                      res.json("error");
                    } else {
                      // res.send(notification);
                      console.log(notification);
                    }
                  }
                );
                User.update(
                  { wallet: req.body.address },
                  { IdTontine: IdTontine },
                  function (err, user) {
                    if (err) {
                      res.json("error");
                    } else {
                      //        console.log(user);
                    }
                  }
                );
              }

              //   console.log(resultHash);
            })
            .catch((e) => {
              console.log("errr2", e);
              //res.status(902).send("enable to set hash for participant")
            });
        })

        .catch((e) => {
          console.log(e);
          res.status(901).send("add participant invalid");
        });
    }
  });
};

exports.cotisation = (req, res) => {
  tontine.methods
    .getLastGarCotDist(
      req.body.ID_Tontine,
      req.body.address,
      false,
      true,
      false
    )
    .call(function (error, result) {
      if (parseInt(req.body.iterationActuel) != parseInt(result["2"])) {
        const decryptedPK = cryptr.decrypt(req.body.privateKey);

        web3.eth.accounts.wallet.add(decryptedPK);

        User.findOne({ wallet: req.body.address }, function (err, user) {
          if (err) {
            res.json("error");
          } else {
            const IdTontine = user.IdTontine;
            var addresstontine = "";
            for (let j = 0; j < IdTontine.length; j++) {
              if (req.body.ID_Tontine == IdTontine[j].Id_Tontine) {
                addresstontine = IdTontine[j].wallet;
              }
            }
            tontine.methods
              .cotisation(req.body.ID_Tontine, addresstontine)
              .send({ from: req.body.address, gas: 30000000 }, function (
                error,
                result
              ) {
                tontine.methods
                  .setTransactionHash(result, 1, req.body.ID_Tontine)
                  .send({ from: req.body.address, gas: 30000000 }, function (
                    errorHash,
                    resultHash
                  ) {
                    res.send({ resultHash, errorHash, error: "" });
                  })

                  .catch((e) => {
                    console.log("err", e);
                    //res.status(904).send("Can t set hash of cotisation")
                  });
              })
              .catch((e) => res.status(903).send("Can t send cotisation"));
          }
        });
      } else {
        res.send({ error: "deja cotisé" });
      }
    });
};

/*****************GET Function ********************************** */

exports.getAllAdherent = (req, res) => {
  User.find({}, function (err, user) {
    if (err) {
      res.json("error");
    } else {
      //  console.log(user);
      res.json({ user });
    }
  });
};

exports.getUserDyRib = (req, res) => {
  console.log(req.query.rib);
  User.findOne({ rib: req.query.rib }, function (err, user) {
    if (err) {
      res.json("error");
    } else {
      console.log(user);
      if (user == null) {
        res.json({ address: "", rib: "", email: "" });
      } else {
        res.json({
          firstname: user.firstname,
          lastname: user.lastname,
          address: user.wallet,
          email: user.email,
          rib: user.rib,
        });
      }
    }
  });
};
