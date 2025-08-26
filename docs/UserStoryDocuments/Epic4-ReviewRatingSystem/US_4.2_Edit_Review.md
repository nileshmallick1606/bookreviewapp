# User Story: Edit Review (US 4.2)

## Description
**As a** review author,  
**I want to** edit my review,  
**So that** I can update my opinion or fix mistakes.

## Priority
Medium

## Story Points
4

## Acceptance Criteria
- Edit button on user's own reviews
- Pre-populated form with existing review content
- Update without creating duplicate review
- Timestamp update for edited reviews
- Success and error notifications

## Technical Tasks

### Frontend Implementation
1. **Create Edit Review UI**
   - Add edit button to user's reviews
   - Create edit modal or page component
   - Design pre-populated form with existing content
   - Implement star rating with current value selected

2. **Implement Image Management**
   - Display existing review images
   - Allow adding new images
   - Implement image deletion
   - Create drag-and-drop reordering (optional)

3. **Add Form Validation**
   - Implement character limit checking
   - Validate rating selection
   - Check image size and format
   - Add validation error messages

4. **Create Edit Review Service**
   - Implement API call to update review
   - Handle multipart form data for images
   - Create loading and success states
   - Implement error handling

### Backend Implementation
1. **Create Review Update Endpoint**
   - Implement PUT /api/v1/reviews/:id endpoint
   - Validate user authorization (own reviews only)
   - Handle partial updates for individual fields
   - Update timestamps for edited reviews

2. **Update Image Handling**
   - Process new image uploads
   - Handle image deletion
   - Update image references
   - Clean up unused images

3. **Implement Book Rating Recalculation**
   - Trigger rating update on review edit
   - Update book average rating
   - Modify book review count if needed
   - Update associated indexes

4. **Create Review History (Optional)**
   - Store previous versions of reviews
   - Add edited indicator on reviews
   - Create timestamp for each edit
   - Implement edit history view

### Integration Implementation
1. **Connect Frontend and Backend**
   - Ensure edit endpoint is accessible
   - Test multipart form submission
   - Verify image updates
   - Validate authorization checks

2. **Update UI After Edit**
   - Implement optimistic UI updates
   - Refresh review list after edit
   - Update book rating display
   - Show success notification

## Dependencies
- US 4.1: Create Review

## Testing Strategy

### Unit Testing
- **Frontend:**
  - Test edit form pre-population
  - Verify validation logic
  - Test image management UI
  - Validate authorization checks

- **Backend:**
  - Test update endpoint authorization
  - Verify partial update handling
  - Test image processing
  - Validate rating recalculation

### Integration Testing
- Test edit API with various updates
- Verify image upload and removal
- Test authorization restrictions
- Verify rating updates after edits

### End-to-End Testing
- Complete edit flow for text content
- Test rating changes
- Verify image additions and removals
- Test character limit enforcement
- Verify timestamp updates

### Security Testing
- Verify authorization for edit actions
- Test against cross-user editing
- Validate image upload security
- Check for injection vulnerabilities

## Definition of Done
- Users can edit their own reviews only
- Edit form pre-populates with existing content
- Rating and review text can be updated
- Images can be added, removed, and maintained
- Book ratings update after review edits
- All tests are passing with adequate coverage
- Code has been reviewed and approved by team
- Documentation is updated with review editing details
