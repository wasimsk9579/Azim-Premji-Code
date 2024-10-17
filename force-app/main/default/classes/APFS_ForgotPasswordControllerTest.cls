@isTest
public class APFS_ForgotPasswordControllerTest {
    
    @isTest
    static void testResetPassword() {
        Profile testProfile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            MobilePhone = '1234567890',
            AccountId = acc.Id
        );
        insert testContact;

        User testUser = new User(
            FirstName = 'Tesjt1',
            LastName = 'Usehr1',
            Username = 'testuser23@example.com',
            Email = 'testuser23@example.com',
            Alias = 'tuser',
            ProfileId = testProfile.Id,
            ContactId = testContact.Id,
            UserRoleId = null,
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            CommunityNickname = 'testuser',
            IsActive = true
        );
        insert testUser;
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        
        APFS_ForgotPasswordController.UserDetails result = APFS_ForgotPasswordController.resetPassword('testuser23@example.com');
        
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'UserDetails should not be null');
        System.assertEquals(testUser.Id, result.userId, 'User ID should match');
        System.assertEquals(testContact.MobilePhone, result.mobilePhone, 'Mobile phone should match');
    }

    @isTest
    static void testChangePassword() {
        
        Profile testProfile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
         Account acc = new Account(Name = 'Test Account');
        insert acc;
        
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Wick',
            MobilePhone = '1234567890',
            AccountId = acc.Id
        );
        insert testContact;
        
        User testUser = new User(
             FirstName = 'Tesjt2',
            LastName = 'Usehr2',
            Username = 'testuser2@example.com',
            Email = 'testuser2@example.com',
            Alias = 'tuser2',
            ContactId =testContact.Id,
            ProfileId = testProfile.Id,
            UserRoleId = null,
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            CommunityNickname = 'testuser2',
            IsActive = true
        );
        insert testUser;

        String newPassword = 'NewPass123!';
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        
        APFS_ForgotPasswordController.changePassword(testUser.Id, newPassword);
        
        Test.stopTest();
        
         }

    @isTest
    static void testResetPasswordWithInvalidUser() {
        Test.startTest();
        
        try {
            APFS_ForgotPasswordController.resetPassword('nonexistentuser@example.com');
            System.assert(false, 'Exception should have been thrown');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('User does not exist.'), 'Exception message should match');
        }
        
        Test.stopTest();
    }

    @isTest
static void testChangePasswordWithInvalidPassword() {
        Profile testProfile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            MobilePhone = '1234567890',
            AccountId = acc.Id
        );
        insert testContact;

        User testUser = new User(
            FirstName = 'Tesjt1',
            LastName = 'Usehr1',
            Username = 'testuser23@example.com',
            Email = 'testuser23@example.com',
            Alias = 'tuser',
            ProfileId = testProfile.Id,
            ContactId = testContact.Id,
            UserRoleId = null,
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            CommunityNickname = 'testuser',
            IsActive = true
        );
        insert testUser;
       Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
       Test.startTest();

        try {
            APFS_ForgotPasswordController.changePassword(testUser.Id, 'newPass');
            System.assert(false, 'Exception should have been thrown');
        } catch (APFS_CustomException e) {
            System.debug('Caught exception: ' + e.getMessage());
            System.assert(e.getMessage().contains('Your password must be at least 8 characters long.'), 'Your password must be at least 8 characters long.');
        }

        Test.stopTest();
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