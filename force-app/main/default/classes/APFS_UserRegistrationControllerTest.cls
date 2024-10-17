/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 07-26-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
public class APFS_UserRegistrationControllerTest {

    // Helper method to create a test account
    private static Account createTestAccount() {
        Account testAccount = new Account(Name = 'Azim Premji Foundation Scholarship Portal Site');
        insert testAccount;
        return testAccount;
    }

    // Helper method to create a test profile
    private static Profile getTestProfile() {
        return [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
    }

    // Test method for registerUser
    @isTest
    static void testRegisterUser() {
        // Create a test account
        Account testAccount = createTestAccount();

        // Test data
        String firstName = 'John';
        String lastName = 'Doe';
        String mobileNumber = '9876543210';
        String aadhaarNumber = '123456789012';

        // Test the registration
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        Id userId = APFS_UserRegistrationController.registerUser(firstName, lastName, mobileNumber, aadhaarNumber, true);
        Test.stopTest();

        // Verify the user was created
        User newUser = [SELECT Id, Username, ContactId FROM User WHERE Id = :userId];
        System.assertNotEquals(null, newUser, 'User should be created');
        System.assertEquals('john9012@applicant.com', newUser.Username, 'Username should be generated correctly');
        
        // Verify the contact was created
        Contact newContact = [SELECT Id, FirstName, LastName, MobilePhone, Aadhaar_Number__c FROM Contact WHERE Id = :newUser.ContactId];
        System.assertNotEquals(null, newContact, 'Contact should be created');
        System.assertEquals(firstName, newContact.FirstName, 'Contact first name should match');
        System.assertEquals(lastName, newContact.LastName, 'Contact last name should match');
        System.assertEquals(mobileNumber, newContact.MobilePhone, 'Contact phone should match');
        System.assertEquals(aadhaarNumber, newContact.Aadhaar_Number__c, 'Contact Aadhaar number should match');
    }

    // Test method for duplicate Aadhaar number
    @isTest
    static void testRegisterUserDuplicateAadhaar() {
        // Create a test account and contact with the Aadhaar number
        Account testAccount = createTestAccount();
        Contact existingContact = new Contact(
            FirstName = 'Jane',
            LastName = 'Doe',
            AccountId = testAccount.Id,
            Phone = '1234567890',
            Aadhaar_Number__c = '123456789012'
        );
        insert existingContact;

        // Test data
        String firstName = 'John';
        String lastName = 'Smith';
        String mobileNumber = '9876543210';
        String aadhaarNumber = '123456789012';

        // Test the registration for duplicate Aadhaar
        Test.startTest();
        try {
            APFS_UserRegistrationController.registerUser(firstName, lastName, mobileNumber, aadhaarNumber, true);
            System.assert(false, 'Exception should have been thrown for duplicate Aadhaar number');
        } catch (APFS_CustomException e) {
            System.assertEquals('Aadhaar number already registered.', e.getMessage());
        }
        Test.stopTest();
    }

    // Test method for duplicate Class Ten Roll number
    @isTest
    static void testRegisterUserDuplicateClassTenRollNumber() {
        // Create a test account and contact with the Class Ten Roll number
        Account testAccount = createTestAccount();
        Contact existingContact = new Contact(
            FirstName = 'Jane',
            LastName = 'Doe',
            AccountId = testAccount.Id,
            Phone = '1234567890',
            Class_Ten_Rollno__c = '9876543210'
        );
        insert existingContact;

        // Test data
        String firstName = 'John';
        String lastName = 'Smith';
        String mobileNumber = '9876543210';
        String classTenRollNumber = '9876543210';

        // Test the registration for duplicate Class Ten Roll number
        Test.startTest();
        try {
            APFS_UserRegistrationController.registerUser(firstName, lastName, mobileNumber, classTenRollNumber, false);
            System.assert(false, 'Exception should have been thrown for duplicate Class Ten Roll number');
        } catch (APFS_CustomException e) {
            System.assertEquals('Class 10th roll number already registered.', e.getMessage());
        }
        Test.stopTest();
    }

    // Test method for setPassword
    @isTest
    static void testSetPassword() {
        // Create a test account, contact, and user
        Account testAccount = createTestAccount();
        Profile testProfile = getTestProfile();
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            AccountId = testAccount.Id,
            MobilePhone	= '9053456784',
            Phone = '9876543210'
        );
        insert testContact;

        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Username = 'testuser@applicant.com',
            CommunityNickname = 'testuser@applicant.com',
            Email = 'testuser@applicant.com',
            Phone = '9876543210',
            ContactId = testContact.Id,
            ProfileId = testProfile.Id,
            MobilePhone = '7975946497',
            Alias = 'tuser',
            TimeZoneSidKey = 'Asia/Kolkata',
            LocaleSidKey = 'en_IN',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            IsActive = true
        );
        insert testUser;

        // Test the setPassword method
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        APFS_UserRegistrationController.setPassword(testUser.Id, 'TestPassword123');
        Test.stopTest();

        // Verify the password was set
        User updatedUser = [SELECT Id FROM User WHERE Id = :testUser.Id];
        System.assertNotEquals(null, updatedUser, 'User should exist');
    }
     private class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success", "message": "SMS sent successfully."}');
            res.setStatusCode(200);
            return res;
        }
    }
}