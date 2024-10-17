@isTest
public class APFS_CustomLoginControllerTest {

    @isTest
    static void testLoginToPortalSuccess() {
        // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        // Create and insert an Account
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        // Create and insert a Contact
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            MobilePhone = '9053456784',
            AccountId = acc.Id
        );
        insert testContact;

        // Retrieve the profile for a portal user (e.g., 'Customer Community Login User')
        Profile profile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
        System.debug('Profile Id: ' + profile.Id);

        // Create and insert a User associated with the Contact
        User newUser = new User(
            FirstName = 'Jane',
            LastName = 'Smith',
            ContactId = testContact.Id,
            Email = 'janesmith@example.com',
            Username = 'janesmith156463@example.com',
            Alias = 'jsmith',
            ProfileId = profile.Id,
            MobilePhone = '7975946497',
            CommunityNickname = 'janesmith',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York',
            IsActive = true
        );

        // Insert the user and set the password
        insert newUser;
        System.debug('New User Id: ' + newUser.Id);

        // Set password inside the System.runAs block
        System.runAs(newUser) {
            System.setPassword(newUser.Id, 'Password@123');
            System.debug('Password set for User Id: ' + newUser.Id);
        }

        // Attempt login
        Test.startTest();
        String result;
        try {
            result = APFS_CustomLoginController.loginToPortal(newUser.Username, 'Password@123', '/home/home.jsp');
        } catch (APFS_CustomException ex) {
            System.debug('Exception: ' + ex.getMessage());
            return; // Exit if the login fails
        }
        Test.stopTest();

        // Assert the URL returned
        System.assertEquals('/home/home.jsp', result, 'The login was successful and returned the correct URL.');
    }

    @isTest
    static void testLoginToPortalFailure() {
        // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator()); // Assuming this is also appropriate for failure

        Test.startTest();
        try {
            String result = APFS_CustomLoginController.loginToPortal('invalidUser@testorg.com', 'wrongPassword', '/home/home.jsp');
            System.assert(false, 'An exception should have been thrown due to failed login.');
        } catch (APFS_CustomException ex) {
            // Validate the correct exception is thrown
            System.assertEquals('Failed to authenticate. Please try again.', ex.getMessage(), 'The login failed and threw the expected exception.');
        }
        Test.stopTest();
    }
}