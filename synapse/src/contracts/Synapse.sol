// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Synapse is ERC721URIStorage, Ownable(msg.sender) {
    uint256 public nextTokenId;

    struct Profile {
        string username;
        string email;
        bool exists;
    }

    struct Agent {
        string name;
        string[] memories;
        string[] languages;
        string description;
        bool isCustom;
    }

    mapping(address => Profile) public profiles;
    mapping(uint256 => Agent) public agents; // tokenId -> Agent
    mapping(uint256 => address) public agentToOwner;
    mapping(uint256 => uint256) public customBotPrice; // tokenId => price
    mapping(address => uint256[]) public userOwnedAgents;

    constructor() ERC721("AI Personality", "AIP") {}

    // 1. Create Profile
    function createProfile(string memory _username, string memory _email) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        profiles[msg.sender] = Profile(_username, _email, true);
    }

    // 2. Create Agent
    function createAgent(
        string memory _name,
        string[] memory _memories,
        string[] memory _languages,
        string memory _description
    ) external returns (uint256) {
        require(profiles[msg.sender].exists, "Profile not found");

        uint256 tokenId = nextTokenId++;
        agents[tokenId] = Agent(_name, _memories, _languages, _description, false);
        agentToOwner[tokenId] = msg.sender;
        userOwnedAgents[msg.sender].push(tokenId);

        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    // 3. Add Memories or Languages
    function addMemory(uint256 tokenId, string memory memoryData) external {
        require(ownerOf(tokenId) == msg.sender, "Not the agent owner");
        agents[tokenId].memories.push(memoryData);
    }

    function addLanguage(uint256 tokenId, string memory language) external {
        require(ownerOf(tokenId) == msg.sender, "Not the agent owner");
        agents[tokenId].languages.push(language);
    }

    // 4. Create Custom Bot
    function createCustomBot(string memory _prompt, uint256 price) external returns (uint256) {
        require(profiles[msg.sender].exists, "Profile not found");

        uint256 tokenId = nextTokenId++;
        string[] memory empty;
        agents[tokenId] = Agent(_prompt, empty, empty, "Custom Bot", true);
        customBotPrice[tokenId] = price;
        agentToOwner[tokenId] = msg.sender;
        userOwnedAgents[msg.sender].push(tokenId);

        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    // 5. Use a Custom Bot
    function useCustomBot(uint256 tokenId) external payable {
        require(agents[tokenId].isCustom, "Not a custom bot");
        require(msg.value >= customBotPrice[tokenId], "Insufficient payment");

        address botOwner = ownerOf(tokenId);
        payable(botOwner).transfer(msg.value);
    }

    // ------------------- GETTER FUNCTIONS -------------------

    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }

    function getAgent(uint256 tokenId) external view returns (Agent memory) {
        return agents[tokenId];
    }

    function getAgentOwner(uint256 tokenId) external view returns (address) {
        return agentToOwner[tokenId];
    }

    function getAllUserAgents(address user) external view returns (uint256[] memory) {
        return userOwnedAgents[user];
    }

    function getCustomBotPrice(uint256 tokenId) external view returns (uint256) {
        return customBotPrice[tokenId];
    }
}
