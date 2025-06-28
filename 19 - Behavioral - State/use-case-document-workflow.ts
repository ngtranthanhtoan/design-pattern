import { exit } from 'process';

// ===============================
// 1. Interfaces and Types
// ===============================

interface DocumentState {
  edit(authorId: string): void;
  submitForReview(authorId: string): void;
  review(reviewerId: string, feedback?: string): void;
  approve(approverId: string): void;
  reject(rejectorId: string, reason: string): void;
  publish(publisherId: string): void;
  archive(archiverId: string): void;
}

interface DocumentData {
  documentId: string;
  title: string;
  content: string;
  authorId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  tags: string[];
  reviewers: string[];
  approvers: string[];
  feedback: string[];
  publishedAt?: Date;
  archivedAt?: Date;
}

interface User {
  id: string;
  name: string;
  role: 'author' | 'reviewer' | 'approver' | 'publisher' | 'admin';
  permissions: string[];
}

// ===============================
// 2. State Classes
// ===============================

class Document {
  private state: DocumentState;
  private data: DocumentData;
  private reviewCount: number = 0;
  private approvalCount: number = 0;
  private requiredReviews: number = 2;
  private requiredApprovals: number = 1;

  constructor(documentData: Omit<DocumentData, 'createdAt' | 'updatedAt' | 'version' | 'reviewers' | 'approvers' | 'feedback'>) {
    this.data = {
      ...documentData,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewers: [],
      approvers: [],
      feedback: []
    };
    this.state = new DraftState(this);
  }

  setState(state: DocumentState) {
    this.state = state;
    this.data.updatedAt = new Date();
  }

  getData(): DocumentData {
    return { ...this.data };
  }

  updateData(updates: Partial<DocumentData>) {
    this.data = { ...this.data, ...updates, updatedAt: new Date() };
  }

  addReviewer(reviewerId: string) {
    if (!this.data.reviewers.includes(reviewerId)) {
      this.data.reviewers.push(reviewerId);
    }
  }

  addApprover(approverId: string) {
    if (!this.data.approvers.includes(approverId)) {
      this.data.approvers.push(approverId);
    }
  }

  addFeedback(feedback: string) {
    this.data.feedback.push(`${new Date().toISOString()}: ${feedback}`);
  }

  incrementReviewCount() {
    this.reviewCount++;
  }

  getReviewCount(): number {
    return this.reviewCount;
  }

  incrementApprovalCount() {
    this.approvalCount++;
  }

  getApprovalCount(): number {
    return this.approvalCount;
  }

  setPublishedAt(date: Date) {
    this.data.publishedAt = date;
  }

  setArchivedAt(date: Date) {
    this.data.archivedAt = date;
  }

  // State API
  edit(authorId: string) { this.state.edit(authorId); }
  submitForReview(authorId: string) { this.state.submitForReview(authorId); }
  review(reviewerId: string, feedback?: string) { this.state.review(reviewerId, feedback); }
  approve(approverId: string) { this.state.approve(approverId); }
  reject(rejectorId: string, reason: string) { this.state.reject(rejectorId, reason); }
  publish(publisherId: string) { this.state.publish(publisherId); }
  archive(archiverId: string) { this.state.archive(archiverId); }

  // For demonstration
  printStatus() {
    const data = this.getData();
    console.log(`\n[DOCUMENT ${data.documentId}] Status: ${this.state.constructor.name.replace('State', '')}`);
    console.log(`Title: ${data.title}, Version: ${data.version}, Author: ${data.authorId}`);
    console.log(`Category: ${data.category}, Tags: ${data.tags.join(', ')}`);
    console.log(`Reviews: ${this.reviewCount}/${this.requiredReviews}, Approvals: ${this.approvalCount}/${this.requiredApprovals}`);
    console.log(`Reviewers: ${data.reviewers.join(', ') || 'None'}, Approvers: ${data.approvers.join(', ') || 'None'}`);
    if (data.feedback.length > 0) {
      console.log(`Feedback: ${data.feedback.length} entries`);
    }
    if (data.publishedAt) {
      console.log(`Published: ${data.publishedAt.toISOString()}`);
    }
    if (data.archivedAt) {
      console.log(`Archived: ${data.archivedAt.toISOString()}`);
    }
  }
}

// -------------------------------
// Draft State
// -------------------------------
class DraftState implements DocumentState {
  constructor(private document: Document) {}

  edit(authorId: string): void {
    const data = this.document.getData();
    if (data.authorId !== authorId) {
      console.log('⚠️ Only the author can edit this document.');
      return;
    }
    
    console.log('✏️ Document is being edited.');
    this.document.addFeedback('Document edited by author');
  }

  submitForReview(authorId: string): void {
    const data = this.document.getData();
    if (data.authorId !== authorId) {
      console.log('⚠️ Only the author can submit for review.');
      return;
    }
    
    if (data.content.trim().length < 100) {
      console.log('❌ Document content is too short for review (minimum 100 characters).');
      return;
    }
    
    console.log('📝 Document submitted for review.');
    this.document.addFeedback('Document submitted for review');
    this.document.setState(new ReviewState(this.document));
  }

  review(reviewerId: string, feedback?: string): void {
    console.log('⚠️ Document is not in review state.');
  }

  approve(approverId: string): void {
    console.log('⚠️ Document is not ready for approval.');
  }

  reject(rejectorId: string, reason: string): void {
    console.log('⚠️ Document is not in review or approval state.');
  }

  publish(publisherId: string): void {
    console.log('⚠️ Document must be approved before publishing.');
  }

  archive(archiverId: string): void {
    console.log('⚠️ Document must be published before archiving.');
  }
}

// -------------------------------
// Review State
// -------------------------------
class ReviewState implements DocumentState {
  constructor(private document: Document) {}

  edit(authorId: string): void {
    console.log('⚠️ Cannot edit document while it is under review.');
  }

  submitForReview(authorId: string): void {
    console.log('⚠️ Document is already under review.');
  }

  review(reviewerId: string, feedback?: string): void {
    const data = this.document.getData();
    
    if (!data.reviewers.includes(reviewerId)) {
      console.log('⚠️ User is not authorized to review this document.');
      return;
    }
    
    this.document.incrementReviewCount();
    if (feedback) {
      this.document.addFeedback(`Review by ${reviewerId}: ${feedback}`);
    } else {
      this.document.addFeedback(`Review completed by ${reviewerId}`);
    }
    
    console.log(`✅ Review completed by ${reviewerId}. (${this.document.getReviewCount()}/${this.document['requiredReviews']})`);
    
    if (this.document.getReviewCount() >= this.document['requiredReviews']) {
      console.log('📋 All reviews completed. Moving to approval phase.');
      this.document.setState(new ApprovalState(this.document));
    }
  }

  approve(approverId: string): void {
    console.log('⚠️ Document must complete review phase before approval.');
  }

  reject(rejectorId: string, reason: string): void {
    const data = this.document.getData();
    
    if (!data.reviewers.includes(rejectorId)) {
      console.log('⚠️ User is not authorized to reject this document.');
      return;
    }
    
    console.log(`❌ Document rejected by ${rejectorId}: ${reason}`);
    this.document.addFeedback(`Rejected by ${rejectorId}: ${reason}`);
    this.document.setState(new DraftState(this.document));
  }

  publish(publisherId: string): void {
    console.log('⚠️ Document must be approved before publishing.');
  }

  archive(archiverId: string): void {
    console.log('⚠️ Document must be published before archiving.');
  }
}

// -------------------------------
// Approval State
// -------------------------------
class ApprovalState implements DocumentState {
  constructor(private document: Document) {}

  edit(authorId: string): void {
    console.log('⚠️ Cannot edit document while it is under approval.');
  }

  submitForReview(authorId: string): void {
    console.log('⚠️ Document is already approved and ready for publishing.');
  }

  review(reviewerId: string, feedback?: string): void {
    console.log('⚠️ Document has completed review phase.');
  }

  approve(approverId: string): void {
    const data = this.document.getData();
    
    if (!data.approvers.includes(approverId)) {
      console.log('⚠️ User is not authorized to approve this document.');
      return;
    }
    
    this.document.incrementApprovalCount();
    this.document.addFeedback(`Approved by ${approverId}`);
    
    console.log(`✅ Document approved by ${approverId}. (${this.document.getApprovalCount()}/${this.document['requiredApprovals']})`);
    
    if (this.document.getApprovalCount() >= this.document['requiredApprovals']) {
      console.log('✅ All approvals completed. Document ready for publishing.');
      this.document.setState(new ApprovedState(this.document));
    }
  }

  reject(rejectorId: string, reason: string): void {
    const data = this.document.getData();
    
    if (!data.approvers.includes(rejectorId)) {
      console.log('⚠️ User is not authorized to reject this document.');
      return;
    }
    
    console.log(`❌ Document rejected by ${rejectorId}: ${reason}`);
    this.document.addFeedback(`Rejected by ${rejectorId}: ${reason}`);
    this.document.setState(new DraftState(this.document));
  }

  publish(publisherId: string): void {
    console.log('⚠️ Document must be fully approved before publishing.');
  }

  archive(archiverId: string): void {
    console.log('⚠️ Document must be published before archiving.');
  }
}

// -------------------------------
// Approved State
// -------------------------------
class ApprovedState implements DocumentState {
  constructor(private document: Document) {}

  edit(authorId: string): void {
    console.log('⚠️ Cannot edit approved document. Create new version instead.');
  }

  submitForReview(authorId: string): void {
    console.log('⚠️ Document is already approved.');
  }

  review(reviewerId: string, feedback?: string): void {
    console.log('⚠️ Document has completed review phase.');
  }

  approve(approverId: string): void {
    console.log('⚠️ Document is already fully approved.');
  }

  reject(rejectorId: string, reason: string): void {
    console.log('⚠️ Cannot reject already approved document.');
  }

  publish(publisherId: string): void {
    console.log('📢 Publishing approved document.');
    this.document.setPublishedAt(new Date());
    this.document.addFeedback(`Published by ${publisherId}`);
    this.document.setState(new PublishedState(this.document));
  }

  archive(archiverId: string): void {
    console.log('⚠️ Document must be published before archiving.');
  }
}

// -------------------------------
// Published State
// -------------------------------
class PublishedState implements DocumentState {
  constructor(private document: Document) {}

  edit(authorId: string): void {
    console.log('⚠️ Cannot edit published document. Create new version instead.');
  }

  submitForReview(authorId: string): void {
    console.log('⚠️ Document is already published.');
  }

  review(reviewerId: string, feedback?: string): void {
    console.log('⚠️ Document is already published.');
  }

  approve(approverId: string): void {
    console.log('⚠️ Document is already published.');
  }

  reject(rejectorId: string, reason: string): void {
    console.log('⚠️ Cannot reject published document.');
  }

  publish(publisherId: string): void {
    console.log('⚠️ Document is already published.');
  }

  archive(archiverId: string): void {
    console.log('📦 Archiving published document.');
    this.document.setArchivedAt(new Date());
    this.document.addFeedback(`Archived by ${archiverId}`);
    this.document.setState(new ArchivedState(this.document));
  }
}

// -------------------------------
// Archived State
// -------------------------------
class ArchivedState implements DocumentState {
  constructor(private document: Document) {}

  edit(authorId: string): void {
    console.log('⚠️ Cannot edit archived document.');
  }

  submitForReview(authorId: string): void {
    console.log('⚠️ Cannot submit archived document for review.');
  }

  review(reviewerId: string, feedback?: string): void {
    console.log('⚠️ Cannot review archived document.');
  }

  approve(approverId: string): void {
    console.log('⚠️ Cannot approve archived document.');
  }

  reject(rejectorId: string, reason: string): void {
    console.log('⚠️ Cannot reject archived document.');
  }

  publish(publisherId: string): void {
    console.log('⚠️ Cannot publish archived document.');
  }

  archive(archiverId: string): void {
    console.log('⚠️ Document is already archived.');
  }
}

// ===============================
// 3. Usage Examples & Tests
// ===============================

function demoDocumentWorkflow() {
  // Create sample document
  const documentData = {
    documentId: 'DOC-2024-001',
    title: 'API Documentation v1.0',
    content: 'This document provides comprehensive documentation for our REST API endpoints, including authentication, request/response formats, error handling, and usage examples. The API supports CRUD operations for users, products, and orders with proper validation and security measures.',
    authorId: 'AUTHOR-001',
    category: 'Technical Documentation',
    tags: ['API', 'Documentation', 'REST', 'Technical']
  };

  const document = new Document(documentData);
  
  console.log('--- Initial Document State ---');
  document.printStatus();
  
  // Test document lifecycle
  console.log('\n--- Document Lifecycle ---');
  
  // Add reviewers and approvers
  document.addReviewer('REVIEWER-001');
  document.addReviewer('REVIEWER-002');
  document.addApprover('APPROVER-001');
  
  // Edit document
  document.edit('AUTHOR-001');
  
  // Submit for review
  document.submitForReview('AUTHOR-001');
  document.printStatus();
  
  // First review
  document.review('REVIEWER-001', 'Good documentation, but needs more error code examples.');
  document.printStatus();
  
  // Second review
  document.review('REVIEWER-002', 'Excellent work! Ready for approval.');
  document.printStatus();
  
  // Approval
  document.approve('APPROVER-001');
  document.printStatus();
  
  // Publish
  document.publish('PUBLISHER-001');
  document.printStatus();
  
  // Archive
  document.archive('ADMIN-001');
  document.printStatus();
  
  console.log('\n--- Testing Rejection Scenarios ---');
  
  // Create another document for rejection testing
  const document2 = new Document({
    ...documentData,
    documentId: 'DOC-2024-002',
    title: 'User Guide v1.0'
  });
  
  document2.addReviewer('REVIEWER-003');
  document2.addApprover('APPROVER-002');
  document2.submitForReview('AUTHOR-001');
  
  // Reject during review
  document2.review('REVIEWER-003', 'Content needs significant improvement.');
  document2.reject('REVIEWER-003', 'Document needs major revisions before approval.');
  document2.printStatus();
  
  console.log('\n--- Testing Edge Cases ---');
  
  // Create document for edge case testing
  const document3 = new Document({
    ...documentData,
    documentId: 'DOC-2024-003',
    title: 'Short Document',
    content: 'Too short.' // Less than 100 characters
  });
  
  // Try to submit short document
  document3.submitForReview('AUTHOR-001'); // Should fail
  
  // Try invalid operations
  document3.review('UNAUTHORIZED-USER'); // Should fail
  document3.approve('UNAUTHORIZED-USER'); // Should fail
  document3.publish('UNAUTHORIZED-USER'); // Should fail
  
  // Try to edit as wrong author
  document3.edit('WRONG-AUTHOR'); // Should fail
  
  // Test state transitions
  console.log('\n--- Testing State Transitions ---');
  
  const document4 = new Document({
    ...documentData,
    documentId: 'DOC-2024-004',
    title: 'Test Document'
  });
  
  document4.addReviewer('REVIEWER-004');
  document4.addApprover('APPROVER-003');
  
  // Try invalid state operations
  document4.review('REVIEWER-004'); // Should fail - not in review
  document4.approve('APPROVER-003'); // Should fail - not in approval
  document4.publish('PUBLISHER-001'); // Should fail - not approved
  
  // Valid flow
  document4.submitForReview('AUTHOR-001');
  document4.review('REVIEWER-004');
  document4.approve('APPROVER-003');
  document4.publish('PUBLISHER-001');
  document4.printStatus();
}

demoDocumentWorkflow();
exit(0);

export { Document, DocumentState, DraftState, ReviewState, ApprovalState, ApprovedState, PublishedState, ArchivedState, DocumentData, User }; 