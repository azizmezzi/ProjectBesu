pragma solidity 0.5.11;
import './participant.sol';
pragma experimental ABIEncoderV2;



contract tontine_Cercle1 {
    using SafeMath for uint256;
participant_contract a;


    struct Tontine {
        string ID_Tontine;
        string Nom_Tontine;
        uint256 Date;
        uint256 Montant;
        address Createur;
        uint256 Nbr_participants;
        uint256 Nbr_cycles;
        uint256 Iteration_enCours;
        uint256 Cycle_enCours;
        bool Etat;
        string Frequence;
        uint256 SommeParMois;
        mapping(address => participant_contract) ListeParticipant;
        address[] participantsAddress;
    }

     mapping(string => Tontine) public tontineCercle;

    string[] public tontineList;
    
        mapping(bytes32 => address) public tokens;

    ERC20 public ERC20Interface;

  constructor (participant_contract _a) public {
      
    a = _a;
  }
  
  
    /* ********************* Transaction Globale **************************/

  
      function convertttt() internal pure returns (bytes32 result) {
        string memory testFoo = "IMFT";

        assembly {
            result := mload(add(testFoo, 32))

        }

    }

    /**
 
    * @dev add address of token to list of supported tokens using * token symbol as identifier in mapping */

    function addNewToken(address address_) public returns (bool) {
        bytes32 symbol_ = convertttt();

        tokens[symbol_] = address_;

        return true;

    }
    
    
       function transaction(address add,address add1,uint256 m) internal {
     //   participant_contract a = new participant_contract();
               bytes32 symbol_ = convertttt();
        address contract_ = tokens[symbol_];
       
        a.transaction(add,add1,m,contract_);
    }
    
       
  
  /* ********************* Tontine Create + Get **************************/

  
    function addTontine(
        string memory ID_Tontine,
        string memory Nom_Tontine,
        uint256 Montant,
        uint256 Nbr_participants,
        uint256 Nbr_cycles,
        string memory Frequence,
        uint256 Ordre,
        address addressParticipant,
        address addressTon
    ) public { 
        
        bytes memory identi = bytes(tontineCercle[ID_Tontine].ID_Tontine);

        require(identi.length == 0);
        require(Nbr_participants >= 2);
        require(Nbr_cycles >= 1);
   

        tontineCercle[ID_Tontine].ID_Tontine = ID_Tontine;

        tontineCercle[ID_Tontine].Nom_Tontine = Nom_Tontine;

        tontineCercle[ID_Tontine].Createur = msg.sender;

        tontineCercle[ID_Tontine].Nbr_participants = Nbr_participants;

        tontineCercle[ID_Tontine].Nbr_cycles = Nbr_cycles;

        tontineCercle[ID_Tontine].Date = 0;

        tontineCercle[ID_Tontine].SommeParMois = 0;

        tontineCercle[ID_Tontine].Montant = Montant;

        tontineCercle[ID_Tontine].Etat = false;

        tontineCercle[ID_Tontine].Cycle_enCours = 0;

        tontineCercle[ID_Tontine].Iteration_enCours = 0;

        tontineCercle[ID_Tontine].Frequence = Frequence;

        tontineList.push(ID_Tontine);
        
       // tontineCercle[ID_Tontine].participantsAddress.push(addressParticipant);

       
        addParticipant(ID_Tontine, Ordre,false,addressTon);
        

    }

    
    function getTontine(string memory ID_Tontine)
        public
        view
        returns (
            string memory,
            uint256,
            uint256,
            uint256,
            string memory,
            address,
            uint256
        )
    {
        return (
            tontineCercle[ID_Tontine].Nom_Tontine,
            tontineCercle[ID_Tontine].Nbr_participants,
            tontineCercle[ID_Tontine].Montant,
            tontineCercle[ID_Tontine].Nbr_cycles,
            tontineCercle[ID_Tontine].Frequence,
            tontineCercle[ID_Tontine].Createur,
            tontineCercle[ID_Tontine].participantsAddress.length
            
        );

    }
    
          /* **************************** Ajouter Participant : Post + Get      ******************************/

    
    
           function addParticipant(string memory ID_Tontine, uint256 Ordre,bool decline, address addressTon) public {
                 //  tontineCercle[ID_Tontine].ListeParticipant[msg.sender] = new participant_contract();

tontineCercle[ID_Tontine].ListeParticipant[msg.sender] =a;

tontineCercle[ID_Tontine].ListeParticipant[msg.sender].addUser(ID_Tontine,msg.sender, Ordre);
       bytes32 symbol_ = convertttt();
        address contract_ = tokens[symbol_];
tontineCercle[ID_Tontine].participantsAddress.push(msg.sender);
       if(decline){
           tontineCercle[ID_Tontine].Date = now;
            tontineCercle[ID_Tontine].Etat = false;
       }else{
           
           tontineCercle[ID_Tontine].ListeParticipant[msg.sender].addTxGarantie(ID_Tontine, msg.sender, 
           tontineCercle[ID_Tontine].Cycle_enCours, tontineCercle[ID_Tontine].Iteration_enCours, tontineCercle[ID_Tontine].Montant, addressTon, true,contract_);
        if (
            tontineCercle[ID_Tontine].participantsAddress.length ==
            tontineCercle[ID_Tontine].Nbr_participants
        ) {
            tontineCercle[ID_Tontine].Date = now;
            tontineCercle[ID_Tontine].Etat = true;
            tontineCercle[ID_Tontine].Cycle_enCours = 1;
            tontineCercle[ID_Tontine].Iteration_enCours = 1;
        }
           
       }

    }
    
    // à supprimer: non utilsée
    
    function getPart(string memory ID_Tontine, address addresPart) public view returns(uint256, bool) {
       return(tontineCercle[ID_Tontine].ListeParticipant[addresPart].get(ID_Tontine,addresPart));
        
    }
    
    
      /* ****************************cotisation : Post + Get      ******************************/

    

      function cotisation(string memory ID_Tontine, address addressTon) public {
              tontineCercle[ID_Tontine].ListeParticipant[msg.sender] = a;

      //  tontineCercle[ID_Tontine].ListeParticipant[msg.sender] = new participant_contract();
      bytes32 symbol_ = convertttt();
        address contract_ = tokens[symbol_];
    //     tontineCercle[ID_Tontine].ListeParticipant[msg.sender].cotisation(ID_Tontine, addressTon, tontineCercle[ID_Tontine].Cycle_enCours,
    //tontineCercle[ID_Tontine].Iteration_enCours, tontineCercle[ID_Tontine].Montant, contract_);
    tontineCercle[ID_Tontine].ListeParticipant[msg.sender].addTxCotisation(ID_Tontine, msg.sender, tontineCercle[ID_Tontine].Cycle_enCours,
    tontineCercle[ID_Tontine].Iteration_enCours, tontineCercle[ID_Tontine].Montant);
     tontineCercle[ID_Tontine].ListeParticipant[msg.sender].transaction( msg.sender, addressTon, tontineCercle[ID_Tontine].Montant, contract_);
       
        tontineCercle[ID_Tontine].SommeParMois = tontineCercle[ID_Tontine].Montant.add(
            tontineCercle[ID_Tontine].SommeParMois
        );

    }
    
    // à supprimer: non utilisée (pour test)
    


    
     

 
}
