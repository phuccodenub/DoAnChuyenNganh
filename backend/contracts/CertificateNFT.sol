// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @dev ERC-721 NFT contract for LMS Certificates
 * Supports OpenSea metadata standard for public verification
 */
contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    struct CertificateData {
        address recipient;
        string courseId;
        string courseName;
        uint256 issuedAt;
        bool revoked;
    }
    
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => uint256[]) public userCertificates;
    mapping(string => uint256[]) public courseCertificates; // courseId => tokenIds
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        string courseId,
        string courseName,
        string tokenURI
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed recipient,
        string reason
    );
    
    constructor() ERC721("LMS Certificate", "LMSCERT") Ownable(msg.sender) {}
    
    /**
     * @dev Issue a new certificate NFT
     * @param recipient Address of the certificate recipient
     * @param courseId Unique course identifier
     * @param courseName Name of the course
     * @param tokenURI IPFS hash or metadata URI (ipfs://QmHash...)
     */
    function issueCertificate(
        address recipient,
        string memory courseId,
        string memory courseName,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        certificates[tokenId] = CertificateData({
            recipient: recipient,
            courseId: courseId,
            courseName: courseName,
            issuedAt: block.timestamp,
            revoked: false
        });
        
        userCertificates[recipient].push(tokenId);
        courseCertificates[courseId].push(tokenId);
        
        emit CertificateIssued(tokenId, recipient, courseId, courseName, tokenURI);
        return tokenId;
    }
    
    /**
     * @dev Verify a certificate
     * @param tokenId The token ID to verify
     * @return isValid Whether the certificate is valid
     * @return cert The certificate data
     */
    function verifyCertificate(uint256 tokenId) 
        public 
        view 
        returns (bool isValid, CertificateData memory cert) 
    {
        cert = certificates[tokenId];
        isValid = cert.recipient != address(0) 
            && !cert.revoked 
            && _ownerOf(tokenId) == cert.recipient;
        return (isValid, cert);
    }
    
    /**
     * @dev Get all certificates for a user
     * @param user Address of the user
     * @return Array of token IDs
     */
    function getUserCertificates(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userCertificates[user];
    }
    
    /**
     * @dev Get all certificates for a course
     * @param courseId Course identifier
     * @return Array of token IDs
     */
    function getCourseCertificates(string memory courseId)
        public
        view
        returns (uint256[] memory)
    {
        return courseCertificates[courseId];
    }
    
    /**
     * @dev Revoke a certificate
     * @param tokenId The token ID to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) public onlyOwner {
        require(certificates[tokenId].recipient != address(0), "Certificate not found");
        certificates[tokenId].revoked = true;
        
        emit CertificateRevoked(tokenId, certificates[tokenId].recipient, reason);
    }
    
    /**
     * @dev Get certificate data by token ID
     * @param tokenId The token ID
     * @return Certificate data
     */
    function getCertificate(uint256 tokenId)
        public
        view
        returns (CertificateData memory)
    {
        return certificates[tokenId];
    }
    
    /**
     * @dev Get total number of certificates issued
     * @return Total count
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}


