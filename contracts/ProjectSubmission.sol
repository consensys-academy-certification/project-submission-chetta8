pragma solidity >=0.5.0 <0.6.0; // Step 1

contract ProjectSubmission { // Step 1

    // defined a state variable of value type address to store contract address owner
    address public owner; // Step 1 (state variable)
    // defined a state variable of value type uint to store balance owner
    uint public ownerBalance; // Step 4 (state variable)
    // defined a function modifier to control if user is contract owner 
    // and authorized to operate 
    modifier onlyOwner() { // Step 1
      require(msg.sender == owner, "Caller is not owner");
        _;
    }
    // defined a struct to reference University object
    struct University { // Step 1
        bool available;
        uint balance;
    }
    // defined a state variable of function mapping to manage university list
    mapping(address => University) public universities; // Step 1 (state variable)
    // defined a variable to list the possible states of a project
    enum ProjectStatus { Waiting, Rejected, Approved, Disabled } // Step 2
    // defined a struct to reference Project object
    struct Project { // Step 2
        address author;
        address university;
        ProjectStatus status;
        uint balance;
    }
    // defined a state variable of function mapping to manage project list
    mapping(bytes32 => Project) public projects; // Step 2 (state variable)
    // defined a function modifier to control if project is on appropiate status to operate
    modifier checkProjectStatus(bytes32 _project, ProjectStatus _status) {
        require(
            projects[_project].status == _status, "Project is on inappropriate status"
        );
        _;
    }
    // defined constructor to set the owner contract
    constructor() public {
        owner = msg.sender;
    }
    // defined a function to enable a university
    function registerUniversity(address _university) public onlyOwner { // Step 1
        universities[_university].available = true;
    }
    // defined a function to disable a university
    function disableUniversity(address _university) public onlyOwner { // Step 1
        universities[_university].available = false;
    }
    // defined a function to submit a project
    function submitProject(bytes32 _project, address _university) public payable { // Step 2 and 4
        require(msg.value >= 1 ether,"Fee is not enough");
        require(universities[_university].available,
            "University is unavailable");
        projects[_project].author = msg.sender;
        projects[_project].university = _university;
        projects[_project].status = ProjectStatus.Waiting;
        ownerBalance += msg.value;
    }
    // defined a function to disable a project
    function disableProject(bytes32 _project) public onlyOwner { // Step 3
        projects[_project].status = ProjectStatus.Disabled;
    }
    // defined a function to review a project
    function reviewProject(bytes32 _project, uint8 _status) public 
    onlyOwner checkProjectStatus(_project, ProjectStatus.Waiting) { // Step 3
        require(_status == 1 || _status == 2, "Input Status is inappropriate");
        projects[_project].status = ProjectStatus(_status);
    }
    // defined a function to donate
    function donate(bytes32 _project) public payable
    checkProjectStatus(_project, ProjectStatus.Approved) { // Step 4
        projects[_project].balance += (msg.value * 7)/10;
        universities[projects[_project].university].balance += (msg.value * 2)/10;
        ownerBalance += msg.value/10;
    }
    // defined a function to withdraw by owner or university
    function withdraw() public { // Step 5
        uint amount;
        if (msg.sender == owner) {
            amount = ownerBalance;
            ownerBalance = 0;
        } else {
            amount = universities[msg.sender].balance;
            universities[msg.sender].balance = 0;
        }
        msg.sender.transfer(amount);
    }
    // defined a function to withdraw by project author
    function withdraw(bytes32 _project) public {  // Step 5 (Overloading Function)
        require(msg.sender == projects[_project].author, "Caller unauthorized");
        uint amount = projects[_project].balance;
        projects[_project].balance = 0;
        msg.sender.transfer(amount);
    }
}