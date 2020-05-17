pragma solidity 0.6.1;


import "@openzeppelin/contracts/ownership/Ownable.sol";

contract KycContract is Ownable {
    mapping(address => bool) allowed;
    mapping(address => bool) passedTest;

    function setKycCompleted(address _addr) public {
      require(passedTest[_addr] == true);
      allowed[_addr] = true;
    }

    function passTheTest(uint _answer) public {
      require(_answer == 42, "Wrong answer, please think harder!");
      passedTest[msg.sender] = true;
      setKycCompleted(msg.sender);

    }

    function setKycRevoked(address _addr) public onlyOwner {
        allowed[_addr] = false;
    }

    function kycCompleted(address _addr) public view returns(bool) {
        return allowed[_addr];
    }
}
