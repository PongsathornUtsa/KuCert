// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract nftCert is ERC721URIStorage, AccessControl {
    uint256 public tokenCounter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");

    mapping(uint256 => bytes) public certificateSignatures;

    event CollectibleCreated(uint256 indexed tokenId, address indexed owner);
    event CertificateSignatureSet(uint256 indexed tokenId, bytes signature);
    event UniversityTransfer(uint256 indexed tokenId, address indexed from, address indexed to);
    event TokenURISet(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Cert", "CRT") {
        tokenCounter = 0;
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(UNIVERSITY_ROLE, msg.sender);
    }

    function createCollectible() public onlyRole(UNIVERSITY_ROLE) returns (uint256){
        uint256 newTokenId = tokenCounter++;
        _safeMint(msg.sender, newTokenId);

        emit CollectibleCreated(newTokenId, msg.sender);

        return newTokenId;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyRole(UNIVERSITY_ROLE) {
        require(_isApprovedOrOwner(_msgSender(), tokenId),"ERC721: called is not owner or approved");
        _setTokenURI(tokenId, _tokenURI);
        emit TokenURISet(tokenId, _tokenURI);
    }

    function grantRole(bytes32 role, address account) public override {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not a admin");
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public override {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _revokeRole(role, account);
    }

    // Override safeTransferFrom function to include UNIVERSITY_ROLE check
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override onlyRole(UNIVERSITY_ROLE) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }

    function setCertificateSignature(uint256 tokenId, bytes memory signature) public onlyRole(UNIVERSITY_ROLE) {
        require(_exists(tokenId), "ERC721: nonexistent token");
        certificateSignatures[tokenId] = signature;
        emit CertificateSignatureSet(tokenId, signature);
    }

    function verifyCertificateSignature(uint256 tokenId, bytes memory signature, address signer) public view returns (bool) {
        require(_exists(tokenId), "ERC721: nonexistent token");

        string memory tokenURI = tokenURI(tokenId);
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, tokenURI));
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);

        return SignatureChecker.isValidSignatureNow(signer, ethSignedMessageHash, signature);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}