# Login Implementation Plan

## Overview
Simple authentication system for the digital assessment dashboard to control stakeholder access to sensitive assessment data.

## Access Control Requirements
- **Individual stakeholders**: Only see their own assessment results + overall sector statistics
- **Sector managers**: Access to all stakeholders within their sector/organization
- **ITC/GTB Admin**: Full access to all assessment data across all sectors

## Authentication Options

### Option 1: Email + Magic Link Authentication (Recommended)
**Pros:**
- Secure and professional
- No passwords to remember
- Easy to manage via spreadsheet
- Audit trail of access

**Implementation:**
- User enters email address
- System sends magic link to email
- User clicks link to access dashboard
- Access level determined by email in user management spreadsheet

### Option 2: Email Only (No Authentication)
**Pros:**
- Fastest to implement
- Easiest for users
- Good for pilot phase

**Cons:**
- Less secure
- Anyone with email could access that data

### Option 3: WhatsApp Business Integration
**For stakeholders without email:**
- Send login links via WhatsApp
- Most stakeholders already use WhatsApp
- Maintains security while being accessible

## User Management
**Spreadsheet columns:**
- Email | Name | Organization | Access Level | Status | Last Login

**Access Levels:**
- `individual` - Only own data + sector stats
- `sector` - All stakeholders in their sector
- `admin` - Full access to all data

## Implementation Timeline
- **Week 1**: Set up user management spreadsheet and email authentication
- **Week 2**: Implement access control logic in Firebase functions
- **Week 3**: Update frontend with login interface and access restrictions
- **Week 4**: Test with pilot stakeholders and refine

## Technical Notes
- Use existing Firebase Functions infrastructure
- Add user management to Google Sheets
- Implement access control in API endpoints
- Update React frontend with login flow
- Consider mobile-friendly design for less tech-savvy users

## Alternative Access Methods
For stakeholders without email:
- WhatsApp Business API for authentication
- SMS verification (if available)
- Shared organizational accounts managed by sector coordinators
- In-person setup during ITC field visits

## Security Considerations
- Email verification ensures legitimate access
- Access levels prevent cross-competitor data viewing
- Audit trail tracks who accessed what data
- Can upgrade to full authentication later if needed
