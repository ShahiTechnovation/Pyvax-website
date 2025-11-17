# SPDX-License-Identifier: MIT
# Simple Voting Contract - Beginner Friendly
# This contract lets people vote for candidates in a secure way

from typing import Dict, List

@contract
class SimpleVoting:
    """
    A beginner-friendly voting contract.
    
    Features:
    - Admin can add candidates
    - Each address can vote once
    - Anyone can view results
    - Admin can close voting
    """
    
    # State Variables (stored on blockchain)
    admin: address                          # Who created the contract
    voting_open: bool                       # Is voting currently active?
    total_votes: uint256                    # Total number of votes cast
    
    # Mappings (like dictionaries on blockchain)
    vote_count: mapping(uint256, uint256)   # candidate_id => number of votes
    has_voted: mapping(address, bool)       # voter => has they voted?
    voted_for: mapping(address, uint256)    # voter => which candidate they voted for
    candidate_names: mapping(uint256, str)  # candidate_id => candidate name
    candidate_count: uint256                # Total number of candidates
    
    # Events (logs that frontends can listen to)
    @event
    def CandidateAdded(candidate_id: uint256, name: str):
        pass
    
    @event
    def VoteCast(voter: address, candidate_id: uint256, candidate_name: str):
        pass
    
    @event
    def VotingClosed():
        pass
    
    def __init__(self):
        """Initialize the voting contract."""
        self.admin = msg.sender              # Person who deploys becomes admin
        self.voting_open = True              # Voting starts open
        self.total_votes = 0                 # No votes yet
        self.candidate_count = 0             # No candidates yet
    
    @public
    def add_candidate(self, name: str):
        """
        Add a new candidate to vote for.
        Only the admin can add candidates.
        
        Args:
            name: The candidate's name
        """
        # Security check: only admin can add candidates
        require(msg.sender == self.admin, "Only admin can add candidates")
        
        # Security check: name can't be empty
        require(len(name) > 0, "Candidate name cannot be empty")
        
        # Add the candidate
        self.candidate_count += 1
        candidate_id = self.candidate_count
        self.candidate_names[candidate_id] = name
        self.vote_count[candidate_id] = 0
        
        # Log the event
        self.CandidateAdded(candidate_id, name)
    
    @public
    def vote(self, candidate_id: uint256):
        """
        Vote for a candidate.
        Each address can only vote once.
        
        Args:
            candidate_id: The ID of the candidate (1, 2, 3, etc.)
        """
        # Security checks
        require(self.voting_open, "Voting is closed")
        require(not self.has_voted[msg.sender], "You already voted")
        require(candidate_id > 0 and candidate_id <= self.candidate_count, "Invalid candidate ID")
        
        # Record the vote
        self.has_voted[msg.sender] = True
        self.voted_for[msg.sender] = candidate_id
        self.vote_count[candidate_id] += 1
        self.total_votes += 1
        
        # Log the event
        candidate_name = self.candidate_names[candidate_id]
        self.VoteCast(msg.sender, candidate_id, candidate_name)
    
    @public
    def close_voting(self):
        """
        Close the voting period.
        Only admin can do this.
        """
        require(msg.sender == self.admin, "Only admin can close voting")
        require(self.voting_open, "Voting already closed")
        
        self.voting_open = False
        self.VotingClosed()
    
    @view
    def get_candidate_name(self, candidate_id: uint256) -> str:
        """
        Get a candidate's name by their ID.
        
        Args:
            candidate_id: The candidate's ID
            
        Returns:
            The candidate's name
        """
        require(candidate_id > 0 and candidate_id <= self.candidate_count, "Invalid candidate ID")
        return self.candidate_names[candidate_id]
    
    @view
    def get_vote_count(self, candidate_id: uint256) -> uint256:
        """
        Get the number of votes for a candidate.
        
        Args:
            candidate_id: The candidate's ID
            
        Returns:
            Number of votes
        """
        require(candidate_id > 0 and candidate_id <= self.candidate_count, "Invalid candidate ID")
        return self.vote_count[candidate_id]
    
    @view
    def get_total_candidates(self) -> uint256:
        """Get the total number of candidates."""
        return self.candidate_count
    
    @view
    def get_total_votes(self) -> uint256:
        """Get the total number of votes cast."""
        return self.total_votes
    
    @view
    def is_voting_open(self) -> bool:
        """Check if voting is currently open."""
        return self.voting_open
    
    @view
    def did_address_vote(self, voter: address) -> bool:
        """
        Check if an address has voted.
        
        Args:
            voter: The address to check
            
        Returns:
            True if they voted, False otherwise
        """
        return self.has_voted[voter]
    
    @view
    def who_did_address_vote_for(self, voter: address) -> uint256:
        """
        Get which candidate an address voted for.
        
        Args:
            voter: The address to check
            
        Returns:
            The candidate ID (0 if they didn't vote)
        """
        if not self.has_voted[voter]:
            return 0
        return self.voted_for[voter]
    
    @view
    def get_winner(self) -> (uint256, str, uint256):
        """
        Get the winning candidate.
        
        Returns:
            (candidate_id, candidate_name, vote_count)
        """
        require(self.candidate_count > 0, "No candidates")
        
        winner_id = uint256(1)
        max_votes = self.vote_count[1]
        
        # Find candidate with most votes
        for i in range(2, self.candidate_count + 1):
            if self.vote_count[i] > max_votes:
                max_votes = self.vote_count[i]
                winner_id = i
        
        winner_name = self.candidate_names[winner_id]
        return (winner_id, winner_name, max_votes)
    
    @view
    def get_admin(self) -> address:
        """Get the admin address."""
        return self.admin
